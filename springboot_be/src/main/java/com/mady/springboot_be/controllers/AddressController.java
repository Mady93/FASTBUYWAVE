package com.mady.springboot_be.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mady.springboot_be.dtos.AddressDTO;
import com.mady.springboot_be.services_impl.AddressServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * REST controller for address management operations.
 * 
 * Supports CRUD operations, pagination, and filtering of active/inactive addresses.
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/address")
@Tag(name = "Addresses", description = "Endpoints for managing addresses")
public class AddressController {

    private final AddressServiceImpl addressService;

    @Autowired
    public AddressController(AddressServiceImpl addressService) {
        this.addressService = addressService;
    }

    @Operation(summary = "Create a new address")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Address created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping("/create")
    public ResponseEntity<AddressDTO> createAddress(@RequestBody @Valid AddressDTO addressDTO) {
        AddressDTO saved = addressService.save(addressDTO);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @Operation(summary = "Update an existing address")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Address updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data or missing ID"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Address not found")
    })
    @PutMapping("/update")
    public ResponseEntity<AddressDTO> updateAddress(@RequestBody @Valid AddressDTO addressDTO) {
        AddressDTO updated = addressService.update(addressDTO);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @Operation(summary = "Soft delete an address by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Address deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Address not found")
    })
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        addressService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get address by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Address found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Address not found")
    })
    @GetMapping("/get/{id}")
    public ResponseEntity<AddressDTO> getAddressById(@PathVariable Long id) {
        AddressDTO address = addressService.findById(id);
        return ResponseEntity.ok(address);
    }

    @Operation(summary = "Get all addresses (active and inactive)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Addresses retrieved successfully")
    })
    @GetMapping("/get/all")
    public ResponseEntity<List<AddressDTO>> getAllAddresses() {
        return ResponseEntity.ok(addressService.findAll());
    }

    @Operation(summary = "Get all active addresses")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Active addresses retrieved successfully")
    })
    @GetMapping("/get/all/active")
    public ResponseEntity<List<AddressDTO>> getActiveAddresses() {
        return ResponseEntity.ok(addressService.findAllActive());
    }

    @Operation(summary = "Get all inactive addresses")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Inactive addresses retrieved successfully")
    })
    @GetMapping("/get/all/inactive")
    public ResponseEntity<List<AddressDTO>> getInactiveAddresses() {
        return ResponseEntity.ok(addressService.findAllInactive());
    }

    @Operation(summary = "Get paginated list of active addresses")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Active addresses retrieved successfully")
    })
    @GetMapping("/get/all/active/paginated")
    public ResponseEntity<Page<AddressDTO>> getActivePaginated(Pageable pageable) {
        return ResponseEntity.ok(addressService.findAllActivePaginated(pageable));
    }

    @Operation(summary = "Get paginated list of inactive addresses")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Inactive addresses retrieved successfully")
    })
    @GetMapping("/get/all/inactive/paginated")
    public ResponseEntity<Page<AddressDTO>> getInactivePaginated(Pageable pageable) {
        return ResponseEntity.ok(addressService.findAllInactivePaginated(pageable));
    }

    @Operation(summary = "Count active addresses")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Count successful")
    })
    @GetMapping("/count/active")
    public ResponseEntity<Long> countActive() {
        return ResponseEntity.ok(addressService.countActive());
    }

    @Operation(summary = "Count inactive addresses")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Count successful")
    })
    @GetMapping("/count/inactive")
    public ResponseEntity<Long> countInactive() {
        return ResponseEntity.ok(addressService.countInactive());
    }
}
