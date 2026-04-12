package com.mady.springboot_be.repositories.contact;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.contact.ContactRequest;
import com.mady.springboot_be.enums.contact.ContactMethod;
import com.mady.springboot_be.enums.contact.RequestStatus;

/**
 * Repository interface for ContactRequest entity operations.
 * 
 * Provides custom queries for finding contact requests by:
 * - Receiver (advertisement owner)
 * - Sender (user who made the request)
 * - Product
 * - Status and contact method
 * 
 * Also supports counting requests, checking for duplicates,
 * and retrieving request statistics.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface ContactRequestRepository extends JpaRepository<ContactRequest, Long> {

        // === RECEIVER QUERIES (advertisement owner) ===

        /**
         * Finds all active contact requests for a receiver (advertisement owner).
         * 
         * @param receiverId the receiver user ID
         * @return list of active requests, newest first
         */
        @Query(name = "ContactRequest.findByReceiverIdAndActiveTrue")
        List<ContactRequest> findByReceiverIdAndActiveTrue(@Param("receiverId") Long receiverId);

        /**
         * Finds active contact requests for a receiver with specific status.
         * 
         * @param receiverId the receiver user ID
         * @param status     the request status (PENDING, ACCEPTED, REJECTED)
         * @return list of matching requests, newest first
         */
        @Query(name = "ContactRequest.findByReceiverIdAndStatusAndActiveTrue")
        List<ContactRequest> findByReceiverIdAndStatusAndActiveTrue(
                        @Param("receiverId") Long receiverId,
                        @Param("status") RequestStatus status);

        /**
         * Counts active contact requests for a receiver by status.
         * 
         * @param receiverId the receiver user ID
         * @param status     the request status to count
         * @return count of matching requests
         */
        @Query(name = "ContactRequest.countByReceiverIdAndStatusAndActiveTrue")
        long countByReceiverIdAndStatusAndActiveTrue(
                        @Param("receiverId") Long receiverId,
                        @Param("status") RequestStatus status);

        // === SENDER QUERIES (who made the request) ===

        /**
         * Finds all active contact requests sent by a sender.
         * 
         * @param senderId the sender user ID
         * @return list of active requests, newest first
         */
        @Query(name = "ContactRequest.findBySenderIdAndActiveTrue")
        List<ContactRequest> findBySenderIdAndActiveTrue(@Param("senderId") Long senderId);

        /**
         * Finds active contact requests sent by a sender with specific status.
         * 
         * @param senderId the sender user ID
         * @param status   the request status (PENDING, ACCEPTED, REJECTED)
         * @return list of matching requests, newest first
         */
        @Query(name = "ContactRequest.findBySenderIdAndStatusAndActiveTrue")
        List<ContactRequest> findBySenderIdAndStatusAndActiveTrue(
                        @Param("senderId") Long senderId,
                        @Param("status") RequestStatus status);

        // === PRODUCT QUERIES ===

        /**
         * Finds all active contact requests for a specific product.
         * 
         * @param productId the product ID
         * @return list of requests for the product, newest first
         */
        @Query(name = "ContactRequest.findByProductIdAndActiveTrue")
        List<ContactRequest> findByProductIdAndActiveTrue(@Param("productId") Long productId);

        // === OTHER QUERIES ===

        /**
         * Finds all contact requests that have been converted to appointments.
         * 
         * @return list of converted requests
         */
        @Query(name = "ContactRequest.findConvertedRequests")
        List<ContactRequest> findConvertedRequests();

        /**
         * Checks if a sender already has a pending request for a specific product.
         * Used to prevent duplicate requests.
         * 
         * @param senderId  the sender user ID
         * @param productId the product ID
         * @param statuses  list of statuses to check (typically [PENDING])
         * @return true if a request exists, false otherwise
         */
        @Query(name = "ContactRequest.existsBySenderIdAndProductIdAndStatusInAndActiveTrue")
        boolean existsBySenderIdAndProductIdAndStatusInAndActiveTrue(
                        @Param("senderId") Long senderId,
                        @Param("productId") Long productId,
                        @Param("statuses") List<RequestStatus> statuses);

        /**
         * Returns request statistics grouped by status for a receiver.
         * 
         * @param receiverId the receiver user ID
         * @return list of Object arrays where each element is [status, count]
         */
        @Query(name = "ContactRequest.getRequestStatsByReceiverId")
        List<Object[]> getRequestStatsByReceiverId(@Param("receiverId") Long receiverId);

        // === ADDITIONAL ===

        /**
         * Counts all active contact requests for a receiver.
         * 
         * @param receiverId the receiver user ID
         * @return count of active requests
         */
        @Query("SELECT COUNT(cr) FROM ContactRequest cr WHERE cr.receiver.userId = :receiverId AND cr.active = true")
        long countByReceiverIdAndActiveTrue(@Param("receiverId") Long receiverId);

        /**
         * Finds active contact requests by preferred contact method.
         * 
         * @param method the contact method (EMAIL, PHONE, WHATSAPP, MEETING)
         * @return list of matching requests, newest first
         */
        @Query("SELECT cr FROM ContactRequest cr WHERE cr.preferredContactMethod = :method AND cr.active = true ORDER BY cr.createdAt DESC")
        List<ContactRequest> findByPreferredContactMethodAndActiveTrue(@Param("method") ContactMethod method);

}
