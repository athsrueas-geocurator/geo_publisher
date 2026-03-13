import { tool } from "@opencode-ai/plugin"
import type { ZodTypeAny } from "zod"

const DEFAULT_ENDPOINT = "https://testnet-api.geobrowser.io/graphql"
const DEFAULT_SCHEMA_SPACE = "a19c345ab9866679b001d7d2138d88a1"

const uuidSchema = tool.schema
  .string()
  .regex(/^[0-9a-f]{32}$/i, "UUIDs must be 32 hex characters without dashes")

const helperNames = [
  "spaceInfo",
  "listEntities",
  "searchSpaces",
  "findTopic",
  "entityRelations",
  "typeSchema"
] as const

type HelperName = (typeof helperNames)[number]

type HelperDefinition = {
  description: string
  query: string
  operationName: string
  argsSchema: ZodTypeAny
  buildVariables?: (args: any) => Record<string, unknown> | undefined
  postProcess?: (args: any, data: Record<string, unknown> | null) => unknown
}

type MappingCandidate = {
  id: string
  name: string
  kind: "value" | "relation"
}

function normalizeText(input: string) {
  return input
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function tokenize(input: string) {
  return normalizeText(input).split(" ").filter(Boolean)
}

function overlapScore(sourceTokens: string[], targetTokens: string[]) {
  if (!sourceTokens.length || !targetTokens.length) return 0
  const source = new Set(sourceTokens)
  const target = new Set(targetTokens)
  let overlap = 0
  for (const token of source) {
    if (target.has(token)) overlap++
  }
  return overlap / Math.max(source.size, target.size)
}

function fuzzyScore(source: string, target: string) {
  const s = normalizeText(source)
  const t = normalizeText(target)
  if (!s || !t) return 0
  if (s === t) return 1
  if (s.includes(t) || t.includes(s)) return 0.92
  return overlapScore(tokenize(s), tokenize(t))
}

function suggestMappings(sourceFields: string[], candidates: MappingCandidate[]) {
  return sourceFields.map((sourceField) => {
    const ranked = candidates
      .map((candidate) => ({
        sourceField,
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateKind: candidate.kind,
        score: Number(fuzzyScore(sourceField, candidate.name).toFixed(3)),
      }))
      .sort((a, b) => b.score - a.score)

    const best = ranked[0]
    return {
      sourceField,
      bestMatch: best ?? null,
      alternatives: ranked.slice(1, 4),
      confidence: best ? (best.score >= 0.9 ? "high" : best.score >= 0.6 ? "medium" : "low") : "low",
      recommendation: best && best.score >= 0.6 ? "accept-or-review" : "manual-mapping-required",
    }
  })
}

const helperDefinitions: Record<HelperName, HelperDefinition> = {
  spaceInfo: {
    description: "Fetch metadata for a single space",
    operationName: "SpaceInfo",
    query: `
      query SpaceInfo($spaceId: UUID!) {
        space(id: $spaceId) {
          id
          type
          address
          topicId
          page {
            id
            name
            description
          }
        }
      }
    `.trim(),
    argsSchema: tool.schema
      .object({
        spaceId: uuidSchema.describe("Space UUID (32 hex characters)")
      })
      .strict(),
    buildVariables: (args) => ({ spaceId: args.spaceId })
  },
  listEntities: {
    description: "List entities inside a space with optional type or pagination",
    operationName: "ListEntities",
    query: `
      query ListEntities($spaceId: UUID!, $typeId: UUID, $first: Int = 20) {
        entities(spaceId: $spaceId, typeId: $typeId, first: $first, orderBy: [UPDATED_AT_DESC]) {
          id
          name
          description
          typeIds
          createdAt
          updatedAt
        }
      }
    `.trim(),
    argsSchema: tool.schema
      .object({
        spaceId: uuidSchema.describe("Space UUID (32 hex characters)"),
        typeId: uuidSchema.optional().describe("Optional entity type UUID (32 hex characters)"),
        first: tool.schema
          .number()
          .int()
          .min(1)
          .max(200)
          .optional()
          .describe("Maximum number of entities to return (1-200)")
      })
      .strict(),
    buildVariables: (args) => ({ spaceId: args.spaceId, typeId: args.typeId, first: args.first })
  },
  searchSpaces: {
    description: "Find spaces by type/topic and optional name/address keyword",
    operationName: "SpaceSearch",
    query: `
      query SpaceSearch($filter: SpaceFilter, $first: Int = 200) {
        spaces(filter: $filter, first: $first, orderBy: [PRIMARY_KEY_ASC]) {
          id
          type
          address
          topicId
          page {
            id
            name
            description
          }
        }
      }
    `.trim(),
    argsSchema: tool.schema
      .object({
        term: tool.schema
          .string()
          .trim()
          .optional()
          .describe("Case-insensitive term to match against page name, description, or address"),
        type: tool.schema
          .enum(["DAO", "PERSONAL"] as const)
          .optional()
          .describe("Filter by space type"),
        topicId: uuidSchema
          .optional()
          .describe("Filter by topic UUID assigned to the space"),
        first: tool.schema
          .number()
          .int()
          .min(1)
          .max(500)
          .optional()
          .describe("Maximum number of spaces to retrieve")
      })
      .strict(),
    buildVariables: (args) => {
      const filter: Record<string, unknown> = {}
      if (args.type) {
        filter.type = { is: args.type }
      }
      if (args.topicId) {
        filter.topicId = { is: args.topicId }
      }
      const payload: Record<string, unknown> = {
        filter: Object.keys(filter).length ? filter : undefined,
        first: args.first ?? 200
      }
      return payload
    },
    postProcess: (args, data) => {
      const listed = (data?.spaces ?? []) as Array<Record<string, unknown>>
      if (!args.term) {
        return { totalFetched: listed.length, term: null, matches: listed }
      }
      const needle = args.term.toLowerCase()
      const matches = listed.filter((space) => {
        const page = space.page as Record<string, unknown> | undefined
        const values = [
          page?.name,
          page?.description,
          space.address
        ].filter((value): value is string => typeof value === "string")
        return values.some((value) => value.toLowerCase().includes(needle))
      })
      return { totalFetched: listed.length, term: args.term, matches }
    }
  },
  findTopic: {
    description: "Locate entities whose name matches a keyword, optionally scoping to a space",
    operationName: "FindTopic",
    query: `
      query FindTopic($filter: EntityFilter, $first: Int = 20) {
        entities(filter: $filter, first: $first, orderBy: [PRIMARY_KEY_ASC]) {
          id
          name
          description
          spaceIds
          typeIds
        }
      }
    `.trim(),
    argsSchema: tool.schema
      .object({
        name: tool.schema
          .string()
          .min(2)
          .describe("Text to match inside the entity name"),
        spaceId: uuidSchema.optional().describe("Scope search to a specific space"),
        typeId: uuidSchema.optional().describe("Filter by entity type"),
        first: tool.schema
          .number()
          .int()
          .min(1)
          .max(200)
          .optional()
          .describe("Maximum number of matches to return")
      })
      .strict(),
    buildVariables: (args) => {
      const filter: Record<string, unknown> = {
        name: { includesInsensitive: args.name }
      }
      if (args.spaceId) {
        filter.spaceIds = { is: [args.spaceId] }
      }
      if (args.typeId) {
        filter.typeIds = { is: [args.typeId] }
      }
      return { filter, first: args.first ?? 20 }
    },
    postProcess: (args, data) => {
      const hits = (data?.entities ?? []) as Array<Record<string, unknown>>
      return { request: { name: args.name, spaceId: args.spaceId ?? null }, hits }
    }
  },
  entityRelations: {
    description: "Show relations and backlinks for a specific entity",
    operationName: "EntityRelations",
    query: `
      query EntityRelations($entityId: UUID!, $first: Int = 20) {
        entity(id: $entityId) {
          id
          name
          spaceIds
          typeIds
          relationsWhereEntity(first: $first, orderBy: [PRIMARY_KEY_ASC]) {
            nodes {
              id
              fromEntity { id name }
              toEntity { id name }
              position
              fromSpace { id page { name } }
              toSpace { id page { name } }
              type { id }
            }
          }
          backlinksList(first: $first, orderBy: [PRIMARY_KEY_ASC]) {
            nodes {
              id
              fromEntity { id name }
              toEntity { id name }
              fromSpace { id page { name } }
              toSpace { id page { name } }
              type { id }
            }
          }
        }
      }
    `.trim(),
    argsSchema: tool.schema
      .object({
        entityId: uuidSchema.describe("Entity UUID to inspect"),
        first: tool.schema
          .number()
          .int()
          .min(1)
          .max(200)
          .optional()
          .describe("How many related nodes to fetch per connection")
      })
      .strict(),
    buildVariables: (args) => ({ entityId: args.entityId, first: args.first ?? 20 }),
    postProcess: (args, data) => ({ entity: data?.entity ?? null, request: { first: args.first ?? 20 } })
  },
  typeSchema: {
    description: "Fetch type schema (values/relations) in a schema space and optionally propose source-field mappings",
    operationName: "TypeSchema",
    query: `
      query TypeSchema($typeId: UUID!, $schemaSpaceId: UUID!, $first: Int = 200) {
        typeEntity: entity(id: $typeId) {
          id
          name
          description
          typeIds
        }
        values(
          filter: {
            entityId: { is: $typeId }
            spaceId: { is: $schemaSpaceId }
          }
          first: $first
        ) {
          propertyId
          propertyEntity { id name }
          text
          integer
          float
          boolean
          date
          datetime
        }
        relations(
          filter: {
            fromEntityId: { is: $typeId }
            spaceId: { is: $schemaSpaceId }
          }
          first: $first
        ) {
          id
          typeId
          toEntityId
          typeEntity { id name }
          toEntity { id name description typeIds }
        }
      }
    `.trim(),
    argsSchema: tool.schema
      .object({
        typeId: uuidSchema.describe("Type entity UUID to inspect"),
        schemaSpaceId: uuidSchema
          .optional()
          .describe("Space UUID hosting the type schema (defaults to root schema space)"),
        first: tool.schema
          .number()
          .int()
          .min(1)
          .max(500)
          .optional()
          .describe("How many values/relations to inspect"),
        sourceFields: tool.schema
          .array(tool.schema.string().min(1))
          .optional()
          .describe("Optional source field names (CSV/JSON columns) for fuzzy mapping proposals"),
      })
      .strict(),
    buildVariables: (args) => ({
      typeId: args.typeId,
      schemaSpaceId: args.schemaSpaceId ?? DEFAULT_SCHEMA_SPACE,
      first: args.first ?? 200,
    }),
    postProcess: (args, data) => {
      const typeEntity = (data?.typeEntity ?? null) as Record<string, unknown> | null
      const valueRows = (data?.values ?? []) as Array<Record<string, unknown>>
      const relationRows = (data?.relations ?? []) as Array<Record<string, unknown>>

      const valueProperties = valueRows
        .map((row) => {
          const propertyEntity = row.propertyEntity as Record<string, unknown> | undefined
          return {
            propertyId: row.propertyId,
            propertyName: propertyEntity?.name ?? row.propertyId,
            sampleValue:
              row.text ?? row.integer ?? row.float ?? row.boolean ?? row.date ?? row.datetime ?? null,
          }
        })
        .filter((entry) => typeof entry.propertyName === "string")

      const relationProperties = relationRows.map((row) => {
        const typeEntityRef = row.typeEntity as Record<string, unknown> | undefined
        const toEntity = row.toEntity as Record<string, unknown> | undefined
        return {
          relationId: row.toEntityId,
          relationName: toEntity?.name ?? row.toEntityId,
          viaRelationTypeId: row.typeId,
          viaRelationTypeName: typeEntityRef?.name ?? row.typeId,
          targetTypeIds: toEntity?.typeIds ?? [],
        }
      })

      const mappingCandidates: MappingCandidate[] = [
        ...valueProperties
          .filter((entry) => typeof entry.propertyId === "string" && typeof entry.propertyName === "string")
          .map((entry) => ({ id: String(entry.propertyId), name: String(entry.propertyName), kind: "value" as const })),
        ...relationProperties
          .filter((entry) => typeof entry.relationId === "string" && typeof entry.relationName === "string")
          .map((entry) => ({ id: String(entry.relationId), name: String(entry.relationName), kind: "relation" as const })),
      ]

      const mappingProposals = Array.isArray(args.sourceFields)
        ? suggestMappings(args.sourceFields, mappingCandidates)
        : []

      return {
        typeEntity,
        schemaSpaceId: args.schemaSpaceId ?? DEFAULT_SCHEMA_SPACE,
        valueProperties,
        relationProperties,
        mapping: {
          sourceFields: args.sourceFields ?? [],
          proposals: mappingProposals,
          requiresUserDecision: mappingProposals.length > 0,
          nextStep:
            mappingProposals.length > 0
              ? "Review each proposed mapping and explicitly accept/reject before changing publish logic."
              : "Provide sourceFields to generate fuzzy mapping proposals.",
        },
      }
    },
  }
}

const GraphQLResultSchema = tool.schema.object({
  data: tool.schema.record(tool.schema.string(), tool.schema.any()).nullable(),
  errors: tool.schema.array(tool.schema.any()).optional()
})

function stripUndefined(obj: Record<string, unknown> | undefined) {
  if (!obj) return undefined
  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value
    }
  }
  return Object.keys(cleaned).length ? cleaned : undefined
}

export default tool({
  description: "Query the Geo Browser GraphQL API with helpful presets",
  args: {
    helper: tool.schema
      .enum(helperNames)
      .optional()
      .describe("Choose a preset helper operation"),
    helperArgs: tool.schema
      .record(tool.schema.string(), tool.schema.any())
      .optional()
      .describe("Arguments validated against the helper you choose"),
    query: tool.schema
      .string()
      .optional()
      .describe("Raw GraphQL document to send when not using a helper"),
    operationName: tool.schema
      .string()
      .optional()
      .describe("Optional operation name to send with the request"),
    variables: tool.schema
      .record(tool.schema.string(), tool.schema.any())
      .optional()
      .describe("Variables to send with the raw GraphQL document"),
    endpoint: tool.schema
      .string()
      .url()
      .default(DEFAULT_ENDPOINT)
      .describe("GraphQL endpoint to query")
  },
  async execute(args, _context) {
    if (!args.helper && !args.query) {
      throw new Error("Either `helper` or `query` is required")
    }

    let requestQuery: string | undefined
    let requestVariables: Record<string, unknown> | undefined
    let requestOperationName: string | undefined
    let activeHelper: {
      definition: HelperDefinition
      parsedArgs: Record<string, unknown>
    } | null = null

    if (args.helper) {
      const helperDefinition = helperDefinitions[args.helper as HelperName]
      const parsedArgs = helperDefinition.argsSchema.parse(args.helperArgs ?? {}) as Record<string, unknown>
      requestQuery = helperDefinition.query
      requestOperationName = helperDefinition.operationName
      const helperVars = helperDefinition.buildVariables
        ? helperDefinition.buildVariables(parsedArgs)
        : parsedArgs
      requestVariables = stripUndefined(helperVars)
      activeHelper = { definition: helperDefinition, parsedArgs }
    } else {
      requestQuery = args.query?.trim()
      requestVariables = args.variables
      requestOperationName = args.operationName
    }

    if (!requestQuery) {
      throw new Error("Failed to determine the GraphQL document to send")
    }

    const payload = {
      query: requestQuery,
      variables: requestVariables,
      operationName: requestOperationName
    }

    const response = await fetch(args.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const json = await response.json()
    const parsed = GraphQLResultSchema.parse(json)

    if (!response.ok || parsed.errors?.length) {
      const errorMessage = parsed.errors
        ?.map((error) => (error as Record<string, unknown>)?.message ?? JSON.stringify(error))
        .join("; ")
      throw new Error(
        `GraphQL request failed (${response.status} ${response.statusText}): ${errorMessage ?? "unexpected error"}`
      )
    }

    const rawData = parsed.data

    let processedData: unknown = rawData
    let helperMeta: Record<string, unknown> | null = null
    if (activeHelper && activeHelper.definition.postProcess) {
      processedData = activeHelper.definition.postProcess(activeHelper.parsedArgs, rawData)
      helperMeta = { helper: args.helper, definition: activeHelper.definition.description }
    }

    const resultPayload = {
      helper: args.helper ?? null,
      operationName: requestOperationName ?? null,
      endpoint: args.endpoint,
      variables: requestVariables ?? null,
      data: processedData,
      rawData,
      helperMeta
    }

    return JSON.stringify(resultPayload, null, 2)
  }
})
