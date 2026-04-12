package com.mady.springboot_be.services_impl;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.mady.springboot_be.dtos.AddressDTO;
import com.mady.springboot_be.entities.Address;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.AddressRepository;
import com.mady.springboot_be.services.AddressService;
import com.mady.springboot_be.utils.PaginationUtils;
import com.mady.springboot_be.utils.mappers.AddressMapper;

/**
 * Implementation of AddressService for address management.
 * 
 * Handles CRUD operations on addresses with soft delete support.
 * Uses AddressRepository for database operations and AddressMapper
 * for entity-DTO conversion.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;

    private static final Logger logger = LoggerFactory.getLogger(AddressServiceImpl.class);

    /**
     * Constructs a new AddressServiceImpl with required dependencies.
     * 
     * @param addressRepository repository for Address entity operations
     * @param addressMapper     mapper for Address entity to DTO conversion
     */
    @Autowired
    public AddressServiceImpl(AddressRepository addressRepository, AddressMapper addressMapper) {
        this.addressRepository = addressRepository;
        this.addressMapper = addressMapper;
    }

    @Override
    public AddressDTO save(AddressDTO addressDTO) {
        logger.info("Saving new address");
        Address address = addressMapper.toEntity(addressDTO);
        address.setActive(true);
        address = addressRepository.save(address);
        logger.debug("Address saved with ID: {}", address.getAddressId());
        return addressMapper.toDTO(address);
    }

    @Override
    public AddressDTO update(AddressDTO addressDTO) {
        logger.info("Updating address ID: {}", addressDTO.getAddressId());

        if (addressDTO.getAddressId() == null) {
            logger.error("AddressId is null for update");
            throw new IllegalArgumentException("AddressId is required for update");
        }

        Optional<Address> existingAddress = addressRepository.findByIdByNotDeleted(addressDTO.getAddressId());
        if (!existingAddress.isPresent()) {
            logger.error("Address not found with id: {}", addressDTO.getAddressId());
            throw new ResourceNotFoundException("Address not found with id: " + addressDTO.getAddressId());
        }

        Address address = addressMapper.toEntity(addressDTO);
        address = addressRepository.save(address);
        logger.debug("Address updated: {}", address.getAddressId());
        return addressMapper.toDTO(address);
    }

    @Override
    public void delete(Long id) {

        logger.info("Deleting address ID: {}", id);

        Optional<Address> addressOptional = addressRepository.findByIdByNotDeleted(id);
        if (addressOptional.isPresent()) {
            Address address = addressOptional.get();
            address.setActive(false);
            addressRepository.save(address);
            logger.debug("Address soft deleted: {}", id);
        } else {
            logger.error("Address not found with id: {}", id);
            throw new ResourceNotFoundException("Address not found with id: " + id);
        }
    }

    @Override
    public AddressDTO findById(Long id) {
        logger.debug("Finding address by ID: {}", id);
        Optional<Address> addressOptional = addressRepository.findByIdByNotDeleted(id);
        return addressOptional
                .map(addressMapper::toDTO)
                .orElseThrow(() -> {
                    logger.error("Address not found with id: {}", id);
                    return new ResourceNotFoundException("Address not found with id: " + id);
                });
    }

    @Override
    public List<AddressDTO> findAll() {
        List<Address> addresses = addressRepository.findAll();
        return addressMapper.toDTOList(addresses);
    }

    @Override
    public List<AddressDTO> findAllActive() {
        List<Address> addresses = addressRepository.findByNotDeletedList();
        return addressMapper.toDTOList(addresses);
    }

    @Override
    public List<AddressDTO> findAllInactive() {
        Page<Address> addressesPage = addressRepository.findByDeleted(Pageable.unpaged());
        return addressMapper.toDTOList(addressesPage.getContent());
    }

    @Override
    public Page<AddressDTO> findAllActivePaginated(Pageable pageable) {
        List<Address> allAddresses = addressRepository.findByNotDeletedList();
        List<AddressDTO> allDTOs = addressMapper.toDTOList(allAddresses);
        return PaginationUtils.paginateList(allDTOs, pageable);
    }

    @Override
    public Page<AddressDTO> findAllInactivePaginated(Pageable pageable) {
        List<Address> allAddresses = addressRepository.findByDeletedList();
        List<AddressDTO> allDTOs = addressMapper.toDTOList(allAddresses);
        return PaginationUtils.paginateList(allDTOs, pageable);
    }

    @Override
    public long countActive() {
        return addressRepository.countByNotDeleted();
    }

    @Override
    public long countInactive() {
        return addressRepository.countByDeleted();
    }
}
