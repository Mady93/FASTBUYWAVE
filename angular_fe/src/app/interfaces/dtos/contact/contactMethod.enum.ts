/**
 * @category Enumerations
 * 
 * @fileoverview Enum representing possible contact methods for communication between users.
 * Specifies the channels through which a user can be contacted, including digital and in-person options.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @enum {string}
 */
export enum ContactMethod {
  /** @description Contact via email */
  EMAIL = 'EMAIL',

  /** @description Contact via phone call */
  PHONE = 'PHONE',

  /** @description Contact via WhatsApp messaging */
  WHATSAPP = 'WHATSAPP',

  /** @description Contact via in-person meeting */
  MEETING = 'MEETING'
}