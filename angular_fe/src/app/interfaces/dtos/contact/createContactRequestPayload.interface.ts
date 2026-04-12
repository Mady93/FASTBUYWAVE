import { ContactMethod } from "./contactMethod.enum";

/**
 * @category Interfaces
 * 
 * @fileoverview Payload DTO for creating a new contact request.
 * Contains information about the sender, receiver, product, message content, 
 * preferred contact method, and optional sender contact details.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface CreateContactRequestPayload
 * @property {{ userId: number }} sender - The user sending the request (only userId needed).
 * @property {{ userId: number }} receiver - The user receiving the request (only userId needed).
 * @property {{ productId: number }} product - The product related to the request (only productId needed).
 * @property {string} subject - Subject of the contact request message.
 * @property {string} message - Main content of the contact request message.
 * @property {string} [additionalNotes] - Optional additional notes.
 * @property {ContactMethod} preferredContactMethod - Preferred method to contact the receiver.
 * @property {string} [senderPhone] - Optional phone number of the sender.
 * @property {string} senderContactEmail - Email address of the sender.
 */
export interface CreateContactRequestPayload {
  sender: { userId: number };
  receiver: { userId: number };
  product: { productId: number };
  subject: string;
  message: string;
  additionalNotes?: string;
  preferredContactMethod: ContactMethod;
  senderPhone?: string;
  senderContactEmail: string;
}