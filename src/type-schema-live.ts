import { createHash } from "node:crypto";
import { gql } from "./functions";
import { TYPES } from "./constants";

export const DEFAULT_SCHEMA_SPACE_ID = "a19c345ab9866679b001d7d2138d88a1";

export type TypeSchemaValueProperty = {
  id: string;
  name: string;
};

export type TypeSchemaRelationProperty = {
  id: string;
  name: string;
  viaRelationTypeId: string;
  viaRelationTypeName: string;
};

export type TypeSchemaSnapshot = {
  typeId: string;
  typeName: string;
  schemaSpaceId: string;
  valueProperties: TypeSchemaValueProperty[];
  relationProperties: TypeSchemaRelationProperty[];
};

type FindTypeResult = {
  entities: Array<{ id: string; name?: string }>;
};

type TypeSchemaQueryResult = {
  typeEntity: { id: string; name?: string } | null;
  values: Array<{
    propertyId: string;
    propertyEntity?: { id: string; name?: string } | null;
  }>;
  relations: Array<{
    typeId: string;
    typeEntity?: { id: string; name?: string } | null;
    toEntityId: string;
    toEntity?: { id: string; name?: string } | null;
  }>;
};

function byName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export async function findTypeIdByName(typeName: string, schemaSpaceId = DEFAULT_SCHEMA_SPACE_ID): Promise<string> {
  const result = await gql<FindTypeResult>(
    `query FindTypeIdByName($name: String!, $spaceId: UUID!, $typeId: UUID!, $first: Int!) {
      entities(
        spaceId: $spaceId
        typeId: $typeId
        filter: { name: { includesInsensitive: $name } }
        first: $first
      ) {
        id
        name
      }
    }`,
    {
      name: typeName,
      spaceId: schemaSpaceId,
      typeId: TYPES.type,
      first: 500,
    },
  );

  const hit = result.entities.find((entity) => entity.name === typeName);
  if (!hit) {
    const partialMatches = result.entities
      .map((entity) => entity.name ?? "<unnamed>")
      .join(", ");
    throw new Error(
      `Exact match for type '${typeName}' not found. Partial matches: [${partialMatches}]`,
    );
  }
  return hit.id;
}

export async function fetchTypeSchema(typeId: string, schemaSpaceId = DEFAULT_SCHEMA_SPACE_ID): Promise<TypeSchemaSnapshot> {
  const result = await gql<TypeSchemaQueryResult>(
    `query FetchTypeSchema($typeId: UUID!, $schemaSpaceId: UUID!, $first: Int!) {
      typeEntity: entity(id: $typeId) {
        id
        name
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
      }
      relations(
        filter: {
          fromEntityId: { is: $typeId }
          spaceId: { is: $schemaSpaceId }
        }
        first: $first
      ) {
        typeId
        typeEntity { id name }
        toEntityId
        toEntity { id name }
      }
    }`,
    {
      typeId,
      schemaSpaceId,
      first: 500,
    },
  );

  if (!result.typeEntity) {
    throw new Error(`Type entity ${typeId} was not found`);
  }

  const valueProperties = byName(
    result.values.map((row) => ({
      id: row.propertyId,
      name: row.propertyEntity?.name ?? row.propertyId,
    })),
  );

  const relationProperties = byName(
    result.relations.map((row) => ({
      id: row.toEntityId,
      name: row.toEntity?.name ?? row.toEntityId,
      viaRelationTypeId: row.typeId,
      viaRelationTypeName: row.typeEntity?.name ?? row.typeId,
    })),
  );

  return {
    typeId,
    typeName: result.typeEntity.name ?? typeId,
    schemaSpaceId,
    valueProperties,
    relationProperties,
  };
}

export function fingerprintTypeSchema(snapshot: TypeSchemaSnapshot): string {
  const canonical = {
    typeId: snapshot.typeId,
    typeName: snapshot.typeName,
    schemaSpaceId: snapshot.schemaSpaceId,
    valueProperties: byName(snapshot.valueProperties),
    relationProperties: byName(snapshot.relationProperties),
  };
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}
