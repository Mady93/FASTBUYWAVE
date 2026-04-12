package com.mady.springboot_be.utils.mappers;

import java.util.List;

import org.mapstruct.Mapper;

import com.mady.springboot_be.dtos.AddressDTO;
import com.mady.springboot_be.entities.Address;

/**
 * MapStruct mapper for Address entity to AddressDTO conversion.
 * 
 * Provides bidirectional mapping between Address entity and AddressDTO.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Mapper(componentModel = "spring")
public interface AddressMapper {

    /**
     * Converts an Address entity to an AddressDTO.
     * 
     * @param address the Address entity to convert
     * @return the corresponding AddressDTO
     */
    AddressDTO toDTO(Address address);

    /**
     * Converts an AddressDTO to an Address entity.
     * 
     * @param addressDTO the AddressDTO to convert
     * @return the corresponding Address entity
     */
    Address toEntity(AddressDTO addressDTO);

    /**
     * Converts a list of Address entities to a list of AddressDTOs.
     * 
     * @param addresses the list of Address entities
     * @return the list of corresponding AddressDTOs
     */
    List<AddressDTO> toDTOList(List<Address> addresses);

    /**
     * Converts a list of AddressDTOs to a list of Address entities.
     * 
     * @param addressDTOs the list of AddressDTOs
     * @return the list of corresponding Address entities
     */
    List<Address> toEntityList(List<AddressDTO> addressDTOs);
}