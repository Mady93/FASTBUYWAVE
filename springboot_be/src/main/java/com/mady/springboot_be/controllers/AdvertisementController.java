package com.mady.springboot_be.controllers;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.dtos.AddressDTO;
import com.mady.springboot_be.dtos.AdvertisementDTO;
import com.mady.springboot_be.dtos.CategoryDTO;
import com.mady.springboot_be.dtos.ProductDTO;
import com.mady.springboot_be.entities.Advertisement;
import com.mady.springboot_be.services_impl.AdvertisementServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * REST controller for advertisement management operations.
 * 
 * Supports creating complete advertisements with product, address,
 * category, and images, as well as advertisement renewal.
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/advertisements")
@Tag(name = "Advertisements", description = "Endpoints for managing advertisements")
public class AdvertisementController {

    private final AdvertisementServiceImpl advertisementService;

    public AdvertisementController(AdvertisementServiceImpl advertisementService) {
        this.advertisementService = advertisementService;
    }

    @Operation(summary = "Create a new advertisement", description = "Creates a complete advertisement with product, address, category and images")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Advertisement created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User, Category or Profile not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error processing images")
    })
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> createAdvertisement(
            @RequestPart("advertisement") @Valid AdvertisementDTO advertisementDTO,
            @RequestPart("product") @Valid ProductDTO productDTO,
            @RequestPart("address") @Valid AddressDTO addressDTO,
            @RequestPart("category") @Valid CategoryDTO categoryDTO,
            @RequestPart("images") MultipartFile[] imageFiles,
            @RequestParam("userId") long userId) throws IOException {

        return advertisementService.createAdvertisement(
                advertisementDTO,
                productDTO,
                addressDTO,
                categoryDTO,
                imageFiles,
                userId);
    }

    @Operation(summary = "Renew an advertisement", description = "Updates the renewal date of an existing advertisement")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Advertisement renewed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid advertisement data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Advertisement not found")
    })
    @PutMapping("/renew")
    public ResponseEntity<Advertisement> renewAdvertisement(@RequestBody Advertisement advertisement) {
        Advertisement renewedAd = advertisementService.setRenewedAt(advertisement);
        return ResponseEntity.ok(renewedAd);
    }

}