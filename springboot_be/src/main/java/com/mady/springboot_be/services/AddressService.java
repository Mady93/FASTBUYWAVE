package com.mady.springboot_be.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.mady.springboot_be.dtos.AddressDTO;

/**
 * Service interface for address management operations.
 * 
 * Defines methods for CRUD operations on addresses, including
 * soft delete, pagination, and counting active/inactive addresses.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface AddressService {

    /**
     * Saves a new address.
     * 
     * @param addressDTO the address data
     * @return the saved AddressDTO
     */
    AddressDTO save(AddressDTO addressDTO);

    /**
     * Updates an existing address.
     * 
     * @param addressDTO the address data with ID
     * @return the updated AddressDTO
     */
    AddressDTO update(AddressDTO addressDTO);

    /**
     * Soft deletes an address by its ID.
     * 
     * @param id the address ID
     */
    void delete(Long id);

    /**
     * Finds an active address by its ID.
     * 
     * @param id the address ID
     * @return the AddressDTO
     */
    AddressDTO findById(Long id);

    /**
     * Retrieves all addresses (both active and inactive).
     * 
     * @return list of all AddressDTOs
     */
    List<AddressDTO> findAll();

    /**
     * Retrieves all active addresses.
     * 
     * @return list of active AddressDTOs
     */
    List<AddressDTO> findAllActive();

    /**
     * Retrieves all inactive addresses.
     * 
     * @return list of inactive AddressDTOs
     */
    List<AddressDTO> findAllInactive();

    /**
     * Retrieves paginated list of active addresses.
     * 
     * @param pageable pagination parameters
     * @return page of active AddressDTOs
     */
    Page<AddressDTO> findAllActivePaginated(Pageable pageable);

    /**
     * Retrieves paginated list of inactive addresses.
     * 
     * @param pageable pagination parameters
     * @return page of inactive AddressDTOs
     */
    Page<AddressDTO> findAllInactivePaginated(Pageable pageable);

    /**
     * Counts active addresses.
     * 
     * @return count of active addresses
     */
    long countActive();

    /**
     * Counts inactive addresses.
     * 
     * @return count of inactive addresses
     */
    long countInactive();
}
