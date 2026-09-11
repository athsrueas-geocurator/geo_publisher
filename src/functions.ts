import {
  createGeoClient,
  createGeoWalletClient,
  GeoTestnetConfig,
  type Op,
} from "@geoprotocol/geo-sdk";
import dotenv from "dotenv";
import * as fs from "fs";
import path from "node:path";
import { privateKeyToAccount } from "viem/accounts";
import { GeoApiRequestError, geoGraphqlRequest } from "./geo-api-client";

dotenv.config();

// ─── Configuration ───────────────────────────────────────────────────────────

const geo = createGeoClient({ network: GeoTestnetConfig });

// ─── GraphQL Helper ──────────────────────────────────────────────────────────

export async function gql<TData = any>(query: string, variables?: Record<string, any>): Promise<TData> {
  try {
    return await geoGraphqlRequest<TData>(query, { variables });
  } catch (error) {
    if (error instanceof GeoApiRequestError && error.errors?.length) {
      console.error("GraphQL errors:", JSON.stringify(error.errors, null, 2));
    }
    throw error;
  }
}

export type UUIDFilter = {
  in?: string[];
  notIn?: string[];
  is?: string;
  isNot?: string;
};

export type SpaceSummary = {
  id: string;
  name?: string | null;
  type?: string | null;
};

export async function fetchEntitySpaces(entityId: string): Promise<SpaceSummary[]> {
  const data = await gql<{ entity?: { id: string; spacesIn?: SpaceSummary[] } }>(
    `query EntitySpaces($entityId: UUID!) {
      entity(id: $entityId) {
        id
        spacesIn {
          id
          name
          type
        }
      }
    }`,
    { entityId },
  );
  return data.entity?.spacesIn ?? [];
}

export async function fetchSpaceIdsWithType(typeId: string, first = 200): Promise<SpaceSummary[]> {
  const data = await gql<{ spaces: SpaceSummary[] }>(
    `query SpacesWithType($typeId: UUID!, $first: Int!, $offset: Int!) {
      spaces(
        first: $first
        offset: $offset
        filter: {
           valuesConnection: {
            some: { entity: { typeIds: { in: [$typeId] } } }
           }
        }
      ) {
        id
        type
      }
    }`,
    { typeId, first, offset: 0 },
  );
  return data.spaces;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toHexId(id: string): `0x${string}` {
  return `0x${id.replace(/^0x/i, "")}` as `0x${string}`;
}

function bareId(id: string): string {
  return id.replace(/^0x/i, "").toLowerCase();
}

type ProposalVersionRow = {
  proposalVersion: number;
  votingMode?: string | null;
  startTime?: string | number | null;
  endTime?: string | number | null;
  executeBy?: string | number | null;
  yesCount?: string | number | null;
};

type ProposalRow = {
  id: string;
  executedAt?: string | null;
  currentVersion?: number | null;
  proposalVersions?: ProposalVersionRow[];
};

async function fetchProposal(proposalId: string): Promise<ProposalRow | undefined> {
  const data = await gql<{ proposals?: ProposalRow[] }>(
    `query ProposalById($id: UUID!) {
      proposals(condition: { id: $id }) {
        id
        executedAt
        currentVersion
        proposalVersions {
          proposalVersion
          votingMode
          startTime
          endTime
          executeBy
          yesCount
        }
      }
    }`,
    { id: bareId(proposalId) },
  );
  return data.proposals?.[0];
}

function matchingVersion(proposal: ProposalRow | undefined, versionId: number) {
  return proposal?.proposalVersions?.find((row) => row.proposalVersion === versionId);
}

function isSlowExecutable(proposal: ProposalRow | undefined, versionId: number): boolean {
  const version = matchingVersion(proposal, versionId);
  if (!proposal || !version || proposal.executedAt) return false;
  const now = Math.floor(Date.now() / 1000);
  return (
    proposal.currentVersion === versionId &&
    Number(version.yesCount) >= 1 &&
    Number(version.endTime) <= now &&
    Number(version.executeBy) > now
  );
}

// ─── Publishing Helper ───────────────────────────────────────────────────────
// Only TARGET_SPACE_ID is required — the space type & address are queried
// automatically from the API.  For DAO spaces the caller's member space is
// resolved by matching SW_ADDRESS against the DAO's members or editors list.

export async function publishOps(ops: Op[], editName: string, input_space?: string) {
  let spaceId = process.env.TARGET_SPACE_ID;
  if (input_space) {
    spaceId = input_space
  }
  if (!spaceId) throw new Error("TARGET_SPACE_ID not set in .env");

  const rawKey = process.env.PK_SW;
  if (!rawKey) throw new Error("PK_SW not set in .env");
  const privateKey = (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as `0x${string}`;
  const signer = privateKeyToAccount(privateKey);
  const client = await createGeoWalletClient({
    signer,
    network: GeoTestnetConfig,
  });
  const author = client.account?.address;
  if (!author) {
    throw new Error("Smart Wallet address not found from private key.");
  }

  const personalSpaceData = await gql(
    `query PersonalSpacesByAddress($author: String!) {
      spaces(filter: { address: { is: $author } }) {
        id
        type
      }
    }`,
    { author },
  );

  console.log(`\nQuerying space ${spaceId} from the API...`);

  const spaceData = await gql(
    `query SpaceGovernanceInfo($spaceId: UUID!) {
      space(id: $spaceId) {
        type
        address
        membersList { memberSpaceId }
        editorsList { memberSpaceId }
        spaceVotingSetting {
          duration
          quorum
          partialPercentageSupportThreshold
          universalPercentageSupportThreshold
          flatSupportThreshold
          disableFastPathAccessForNewMembers
          executionGracePeriod
        }
      }
    }`,
    { spaceId },
  );

  if (!spaceData.space) throw new Error(`Space ${spaceId} not found`);

  const { type: spaceType, address: daoAddress } = spaceData.space;
  console.log(`  Space type: ${spaceType}  address: ${daoAddress}`);
  console.log(`Publishing ${ops.length} operations...`);

  let to: `0x${string}`;
  let calldata: `0x${string}`;

  if (spaceType === "PERSONAL") {
    const result = await geo.personalSpaces.publishEdit({
      name: editName,
      spaceId,
      ops,
      author: spaceId,
    });
    console.log("CID:", result.cid);
    console.log("Edit ID:", result.editId);
    to = result.to;
    calldata = result.calldata;
  } else {
    // Resolve the caller's wallet address to their personal space ID
    
    const callerSpace = personalSpaceData.spaces?.find(
      (s: any) => s.type === "PERSONAL",
    );
    if (!callerSpace) {
      throw new Error(
        `No personal space found for wallet ${author}. ` +
          `Make sure this wallet has a personal space on the Geo testnet.`,
      );
    }
    const callerSpaceId: string = callerSpace.id;
    console.log(`  Caller personal space: ${callerSpaceId}`);

    // Verify the caller's personal space is a member or editor of the DAO
    const members: Array<{ memberSpaceId: string }> =
      spaceData.space.membersList;
    const editors: Array<{ memberSpaceId: string }> =
      spaceData.space.editorsList;
    const allCandidates = [...members, ...editors];
    const isMemberOrEditor = allCandidates.some(
      (m) => bareId(m.memberSpaceId) === bareId(callerSpaceId),
    );

    if (!isMemberOrEditor) {
      throw new Error(
        `Your personal space (${callerSpaceId}) is not a member or editor of DAO space ${spaceId}. ` +
          `Members: ${members.map((m) => m.memberSpaceId).join(", ")}  ` +
          `Editors: ${editors.map((e) => e.memberSpaceId).join(", ")}`,
      );
    }

    const isEditor = editors.some((e) => bareId(e.memberSpaceId) === bareId(callerSpaceId));
    const votingMode = isEditor ? "FAST" : "SLOW";
    const voting = spaceData.space.spaceVotingSetting;
    console.log(`  Caller role: ${isEditor ? "editor" : "member"} (voting mode: ${votingMode})`);
    if (voting) {
      console.log(
        `  Voting settings: duration=${voting.duration}s quorum=${voting.quorum} flat=${voting.flatSupportThreshold} universal=${voting.universalPercentageSupportThreshold}%`,
      );
    }

    const result = await geo.daoSpaces.proposeEdit({
      name: editName,
      ops,
      author: callerSpaceId,
      callerSpaceId: toHexId(callerSpaceId),
      daoSpaceId: toHexId(spaceId),
      votingMode,
    });
    console.log("CID:", result.cid);
    console.log("Edit ID:", result.editId);
    console.log("Proposal ID:", result.proposalId);
    console.log("Version ID:", result.versionId);

    const proposeHash = await client.sendTransaction({ to: result.to, data: result.calldata });
    console.log("Propose tx:", proposeHash);

    const vote = geo.daoSpaces.voteProposal({
      authorSpaceId: toHexId(callerSpaceId),
      spaceId: toHexId(spaceId),
      proposalId: result.proposalId,
      versionId: result.versionId,
      vote: "YES",
    });
    const voteHash = await client.sendTransaction({ to: vote.to, data: vote.calldata });
    console.log("Vote YES tx:", voteHash);

    if (votingMode !== "SLOW") {
      console.log("FAST path: vote submitted. Edit applies if the space thresholds are met.");
      return voteHash;
    }

    const deadline = Date.now() + 120_000;
    let proposal = await fetchProposal(result.proposalId);
    while (Date.now() < deadline && !isSlowExecutable(proposal, result.versionId)) {
      if (proposal?.executedAt) {
        console.log("Proposal already executed.");
        return voteHash;
      }
      await sleep(5_000);
      proposal = await fetchProposal(result.proposalId);
    }

    if (!isSlowExecutable(proposal, result.versionId)) {
      const version = matchingVersion(proposal, result.versionId);
      console.log(
        "SLOW vote recorded. Execute later after endTime and before executeBy:",
        JSON.stringify({
          proposalId: result.proposalId,
          versionId: result.versionId,
          endTime: version?.endTime ?? null,
          executeBy: version?.executeBy ?? null,
        }),
      );
      return voteHash;
    }

    const execution = geo.daoSpaces.executeProposal({
      authorSpaceId: toHexId(callerSpaceId),
      spaceId: toHexId(spaceId),
      proposalId: result.proposalId,
    });
    const executeHash = await client.sendTransaction({
      to: execution.to,
      data: execution.calldata,
    });
    console.log("Execute tx:", executeHash);
    return executeHash;
  }

  const txHash = await client.sendTransaction({ to, data: calldata });
  console.log("Transaction hash:", txHash);
  return txHash;
}

// ─── printOps ────────────────────────────────────────────────────────────────
// Serializes ops to a JSON file, converting UUID byte arrays to hex strings.

function isUuidByteArray(obj: any): boolean {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj))
    return false;
  const keys = Object.keys(obj);
  if (keys.length !== 16) return false;
  for (let i = 0; i < 16; i++) {
    if (!(String(i) in obj) || typeof obj[String(i)] !== "number") return false;
  }
  return true;
}

function uuidBytesToString(obj: any): string {
  let hex = "";
  for (let i = 0; i < 16; i++) {
    hex += obj[String(i)].toString(16).padStart(2, "0");
  }
  return hex;
}

function convertUuidBytes(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") {
    if (
      typeof obj === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        obj,
      )
    ) {
      return obj.replace(/-/g, "");
    }
    return obj;
  }
  if (isUuidByteArray(obj)) {
    return uuidBytesToString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(convertUuidBytes);
  }
  const result: any = {};
  for (const key of Object.keys(obj)) {
    result[key] = convertUuidBytes(obj[key]);
  }
  return result;
}

export function printOps(ops: any, outputDir: string, fn: string) {
  console.log("NUMBER OF OPS: ", ops.length);

  if (ops.length > 0) {
    const convertedOps = convertUuidBytes(ops);
    const outputText = JSON.stringify(
      convertedOps,
      (_key, value) => (typeof value === "bigint" ? value.toString() : value),
      2,
    );
    fs.mkdirSync(outputDir, { recursive: true });
    const filePath = path.join(outputDir, fn);
    fs.writeFileSync(filePath, outputText);
    console.log(`OPS PRINTED to ${fn}`);
  } else {
    console.log("NO OPS TO PRINT");
  }
}
