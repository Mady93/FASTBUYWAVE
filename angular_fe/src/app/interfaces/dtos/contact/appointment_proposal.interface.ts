/**
 * @category Interfaces
 * 
 * @fileoverview Enum representing the status of an appointment proposal.
 * Defines the possible states a proposal can be in during its lifecycle.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @enum {string}
 */
export enum ProposalStatus {
  /** @description The proposal has been created and is awaiting review. */
  PENDING = 'PENDING',

  /** @description The proposal has been accepted by the appointment organizer. */
  ACCEPTED = 'ACCEPTED',

  /** @description The proposal has been rejected by the appointment organizer. */
  REJECTED = 'REJECTED'
}