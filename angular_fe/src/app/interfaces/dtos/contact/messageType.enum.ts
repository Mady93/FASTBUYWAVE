/**
 * @category Enumerations
 * 
 * @fileoverview Enum representing the types of messages in the system.
 * Includes user-generated messages, system notifications, file attachments,
 * location shares, and appointment date changes.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @enum {string}
 */
export enum MessageType {
  /** @description Standard text message sent by a user */
  TEXT = 'TEXT',

  /** @description System-generated notification or alert */
  SYSTEM = 'SYSTEM',

  /** @description Message containing a file attachment */
  FILE = 'FILE',

  /** @description Message sharing a geolocation or map point */
  LOCATION = 'LOCATION',

  /** @description Message indicating a proposed or changed appointment date */
  DATE_CHANGE = 'DATE_CHANGE'
}