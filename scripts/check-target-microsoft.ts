import { gql } from "../src/functions";
import { TYPES } from "../src/constants";

const TARGET_SPACE = "41e851610e13a19441c4d980f2f2ce6b";

async function main() {
  const result = await gql<{ entities: Array<{ id: string; name?: string; typeIds?: string[] }> }>(
    `query EntitiesByName($spaceId: UUID!, $typeId: UUID!, $first: Int!, $name: String!) {
      entities(
        spaceId: $spaceId
        typeId: $typeId
        first: $first
        filter: { name: { is: $name } }
      ) {
        id
        name
        typeIds
      }
    }`,
    {
      spaceId: TARGET_SPACE,
      typeId: TYPES.project,
      first: 20,
      name: "Microsoft",
    },
  );
  console.log(result.entities);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
