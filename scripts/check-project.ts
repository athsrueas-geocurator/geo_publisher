import { gql } from "../src/functions";
import { TYPES } from "../src/constants";

async function main() {
  const data = await gql<{ entities: Array<{ id: string; name?: string; typeIds?: string[] }> }>(
    `query FindProject($spaceId: UUID!, $typeId: UUID!, $first: Int!) {
      entities(spaceId: $spaceId, typeId: $typeId, first: $first, filter: { name: { includesInsensitive: "microsoft" } }) {
        id
        name
        typeIds
      }
    }`,
    {
      spaceId: "a19c345ab9866679b001d7d2138d88a1",
      typeId: TYPES.project,
      first: 50,
    },
  );
  console.log(JSON.stringify(data.entities, null, 2));
}

main().catch((error) => {
  console.error("fail", error);
  process.exit(1);
});
