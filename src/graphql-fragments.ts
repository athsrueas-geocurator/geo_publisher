export const SPACE_CORE_FIELDS = `
  id
  type
  address
  topicId
  page {
    id
    name
    description
  }
`.trim();

export const ENTITY_CORE_FIELDS = `
  id
  name
  description
  typeIds
`.trim();

export const VALUE_CORE_FIELDS = `
  propertyId
  text
  integer
  float
  boolean
  date
  datetime
  propertyEntity { name }
`.trim();

export const RELATION_CORE_FIELDS = `
  id
  typeId
  fromEntityId
  toEntityId
  position
  typeEntity { name }
  fromEntity { id name }
  toEntity { id name }
`.trim();
