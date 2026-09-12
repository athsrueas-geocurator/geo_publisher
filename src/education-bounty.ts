import { Ops, SystemIds, type Op } from '@geoprotocol/geo-sdk';

export const EDUCATION_PUBLICATION = {
  spaceId: 'dac259bad48a11adf97fe36857d85206',
  bountySpaceId: 'ec349623f33236aee13c12dcd629ee81',
  bountyId: 'debce2de46094f299ee8e89fe244a9dc',
  // Current Geo web constants + live root entity, verified 2026-09-11.
  // SDK 0.20.1's SystemIds.PROPOSAL_TYPE is a different ontology ID.
  proposalTypeId: '490a7c90ad4b4029b2b4d85d22fe203a',
} as const;

/** Pure builder. Publish in the signer's personal space only after the main
 * proposal has been accepted on chain. Persist both relation IDs in the batch
 * journal before building; reuse them if only the bounty-link step is retried.
 * The bounty's owning space is distinct from the proposed dataset's space.
 */
export function educationBountyLinkOps(input: {
  proposalId: string;
  proposalName: string;
  typeRelationId: string;
  submissionRelationId: string;
  typeRelationEntityId: string;
  submissionRelationEntityId: string;
}): Op[] {
  if (!input.proposalName.trim()) throw new Error('Proposal name is required');
  const ids = [input.proposalId, input.typeRelationId, input.submissionRelationId, input.typeRelationEntityId, input.submissionRelationEntityId].map(id => id.replace(/^0x/, '').replaceAll('-', '').toLowerCase());
  if (ids.some(id => !/^[a-f0-9]{32}$/.test(id)) || new Set(ids).size !== ids.length) throw new Error('Distinct valid proposal and journaled relation IDs are required');
  const [proposalId, typeRelationId, submissionRelationId, typeRelationEntityId, submissionRelationEntityId] = ids as [string,string,string,string,string];
  return [
    ...Ops.entities.update({ id:proposalId, name:input.proposalName }).ops,
    ...Ops.relations.create({ id:typeRelationId, entityId:typeRelationEntityId, fromEntity:proposalId, type:SystemIds.TYPES_PROPERTY, toEntity:EDUCATION_PUBLICATION.proposalTypeId }).ops,
    ...Ops.relations.create({ id:submissionRelationId, entityId:submissionRelationEntityId, fromEntity:proposalId, type:SystemIds.SUBMISSION_PROPERTY, toEntity:EDUCATION_PUBLICATION.bountyId, toSpace:EDUCATION_PUBLICATION.bountySpaceId }).ops,
  ];
}
