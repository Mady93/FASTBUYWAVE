/**
 * @category Enumerations
 * 
 * @fileoverview Enum representing the status of a contact request.
 * Tracks whether a request is pending, accepted, or rejected by the receiver.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @enum {string}
 */
export enum RequestStatus {
  /** @description The contact request has been sent but not yet responded to */
  PENDING = 'PENDING',

  /** @description The receiver has accepted the contact request */
  ACCEPTED = 'ACCEPTED',

  /** @description The receiver has rejected the contact request */
  REJECTED = 'REJECTED'
}