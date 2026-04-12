/**
 * @category Interfaces
 * 
 * @description Represents an upcoming appointment with details about the requester, organizer, and related product.
 * 
 * @interface UpcomingAppointmentDTO
 * @property {number} id - Unique identifier of the appointment.
 * @property {string} dateTime - Date and time of the appointment (LocalDateTime as string).
 * 
 * // Requester information
 * @property {string} requesterEmail - Email of the person who requested the appointment.
 * @property {string} requesterPhone - Phone number of the requester.
 * @property {string} requesterName - Name of the requester.
 * 
 * // Organizer information
 * @property {string} organizerEmail - Email of the organizer.
 * @property {string} organizerPhone - Phone number of the organizer.
 * @property {string} organizerName - Name of the organizer.
 * 
 * @property {string} productName - Name of the product related to the appointment.
 * @property {string} status - Current status of the appointment.
 * @property {string} type - Type/category of the appointment.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface UpcomingAppointmentDTO {
  id: number;
  dateTime: string; // LocalDateTime come stringa
  
  // Richiedente
  requesterEmail: string;
  requesterPhone: string;
  requesterName: string;
  
  // Organizzatore
  organizerEmail: string;
  organizerPhone: string;
  organizerName: string;
  
  productName: string;
  status: string;
  type: string;
}