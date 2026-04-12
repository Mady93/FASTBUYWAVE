package com.mady.springboot_be.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.Address;
import com.mady.springboot_be.entities.Product;

/**
 * Repository interface for Address entity operations.
 * 
 * Provides CRUD operations and custom queries for address management including:
 * - Counting active/deleted addresses
 * - Paginated retrieval of active/deleted addresses
 * - Finding addresses by ID (active only)
 * - Bulk retrieval of active/deleted addresses
 * - Soft deactivation of addresses by ID
 * 
 * The repository uses named queries defined in the Address entity.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    /**
     * Counts active (not deleted) addresses.
     * 
     * @return count of active addresses
     */
    Long countByNotDeleted();

    /**
     * Retrieves paginated list of active addresses.
     * 
     * @param pageable pagination parameters
     * @return page of active addresses
     */
    Page<Address> findByNotDeleted(Pageable pageable);

    /**
     * Counts deleted (inactive) addresses.
     * 
     * @return count of deleted addresses
     */
    Long countByDeleted();

    /**
     * Retrieves paginated list of deleted addresses.
     * 
     * @param pageable pagination parameters
     * @return page of deleted addresses
     */
    Page<Address> findByDeleted(Pageable pageable);

    /**
     * Finds an active address by its ID.
     * 
     * @param id the address ID
     * @return Optional containing the address if found and active
     */
    Optional<Address> findByIdByNotDeleted(Long id);

    /**
     * Retrieves all active addresses as a list.
     * 
     * @return list of active addresses
     */
    List<Address> findByNotDeletedList();

    /**
     * Retrieves all deleted addresses as a list.
     * 
     * @return list of deleted addresses
     */
    List<Address> findByDeletedList();

    /**
     * Soft deactivates an address by its ID.
     * 
     * @param addressId the ID of the address to deactivate
     * @return Optional containing the deactivated product (or empty if not found)
     */
    Optional<Product> deactivateById(Long addressId);
}