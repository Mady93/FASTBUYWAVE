package com.mady.springboot_be.services_impl;

import java.io.IOException;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.dtos.AddressDTO;
import com.mady.springboot_be.dtos.AdvertisementDTO;
import com.mady.springboot_be.dtos.CategoryDTO;
import com.mady.springboot_be.dtos.ProductDTO;
import com.mady.springboot_be.entities.Address;
import com.mady.springboot_be.entities.Advertisement;
import com.mady.springboot_be.entities.Category;
import com.mady.springboot_be.entities.Image;
import com.mady.springboot_be.entities.Product;
import com.mady.springboot_be.entities.Profile;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.AdvertisementRepository;
import com.mady.springboot_be.repositories.CategoryRepository;
import com.mady.springboot_be.repositories.ImageRepository;
import com.mady.springboot_be.repositories.ProfileRepository;
import com.mady.springboot_be.repositories.UserRepository;
import com.mady.springboot_be.services.AdvertisementService;
import com.mady.springboot_be.utils.mappers.AddressMapper;

import jakarta.transaction.Transactional;

/**
 * Implementation of AdvertisementService for advertisement management.
 * 
 * Handles creation of complete advertisements with all associated entities:
 * - Address
 * - Product
 * - Advertisement
 * - Images
 * 
 * All operations are transactional and will roll back on any failure.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class AdvertisementServiceImpl implements AdvertisementService {

    private final AdvertisementRepository advertisementRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AddressServiceImpl addressService;
    private final AddressMapper addressMapper;
    private final ImageRepository imageRepository;
    private final ProfileRepository profileRepository;

    private static final Logger logger = LoggerFactory.getLogger(AdvertisementServiceImpl.class);

    /**
     * Constructs a new AdvertisementServiceImpl with required dependencies.
     * 
     * @param advertisementRepository repository for Advertisement entity
     * @param userRepository          repository for User entity
     * @param categoryRepository      repository for Category entity
     * @param addressService          service for Address operations
     * @param addressMapper           mapper for Address entity to DTO conversion
     * @param imageRepository         repository for Image entity
     * @param profileRepository       repository for Profile entity
     */
    @Autowired
    public AdvertisementServiceImpl(AdvertisementRepository advertisementRepository, UserRepository userRepository,
            CategoryRepository categoryRepository, AddressServiceImpl addressService,
            AddressMapper addressMapper, ImageRepository imageRepository, ProfileRepository profileRepository) {
        this.advertisementRepository = advertisementRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.addressService = addressService;
        this.addressMapper = addressMapper;
        this.imageRepository = imageRepository;
        this.profileRepository = profileRepository;
    }

    @Override
    @Transactional
    public ResponseEntity<ApiResponse> createAdvertisement(
            AdvertisementDTO advertisementDTO,
            ProductDTO productDTO,
            AddressDTO addressDTO,
            CategoryDTO categoryDTO,
            MultipartFile[] imageFiles,
            long userId) throws IOException {

        logger.info("Creating advertisement for user ID: {}", userId);

        // === 1. Save address ===
        Address savedAddress = addressMapper.toEntity(addressService.save(addressDTO));

        // === 2. Get user ===
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // === 3. Get category ===
        Category category = categoryRepository.findById(categoryDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // === 4. Create product ===
        Product product = new Product();
        product.setPrice(productDTO.getPrice());
        product.setCondition(productDTO.getCondition());
        product.setStockQuantity(productDTO.getStockQuantity());
        product.setActive(true);
        product.setAddress(savedAddress);

        // === 5. Create advertisement ===
        Advertisement advertisement = new Advertisement();
        advertisement.setTitle(advertisementDTO.getTitle());
        advertisement.setDescription(advertisementDTO.getDescription());
        advertisement.setStatus(advertisementDTO.getStatus());
        advertisement.setCreatedAt(LocalDateTime.now());
        advertisement.setType(advertisementDTO.getType());
        advertisement.setRenewedAt(advertisementDTO.getRenewedAt());
        advertisement.setAgency(advertisementDTO.isAgency());
        advertisement.setAgencyName(advertisementDTO.getAgencyName());
        advertisement.setAgencyFeePercent(advertisementDTO.getAgencyFeePercent());
        advertisement.setAgencyUrl(advertisementDTO.getAgencyUrl());
        advertisement.setActive(true);

        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile for user with ID " + userId + " not found"));
        advertisement.setProfile(profile);

        // Set relationships
        advertisement.setCreatedBy(user);
        advertisement.setCategory(category);
        advertisement.setProduct(product);
        product.setAdvertisement(advertisement);

        // === 6. Save advertisement (will cascade to product) ===
        Advertisement savedAdvertisement = advertisementRepository.save(advertisement);

        // === 7. Handle images ===
        if (imageFiles != null && imageFiles.length > 0) {
            for (MultipartFile file : imageFiles) {
                if (file != null && !file.isEmpty()) {
                    Image image = new Image();
                    image.setPicByte(file.getBytes());
                    image.setActive(true);
                    image.setProduct(savedAdvertisement.getProduct()); // Use the saved product
                    imageRepository.save(image);
                }
            }
        }

        String message = "Advertisement and their associated data have been created successfully";
        logger.info("Advertisement created successfully with ID: {}", savedAdvertisement.getAdvertisementId());
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(HttpStatus.OK.value(), message));
    }

    @Override
    public Advertisement setRenewedAt(Advertisement advertisement) {
        logger.info("Renewing advertisement ID: {}",
                advertisement != null ? advertisement.getAdvertisementId() : "null");

        if (advertisement == null || advertisement.getAdvertisementId() == null) {
            logger.error("Advertisement is null or has null ID");
            throw new IllegalArgumentException("Advertisement cannot be null and must have an ID");
        }

        Long advertisementId = advertisement.getAdvertisementId();
        advertisementRepository.findByIdByNotDeleted(advertisementId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Advertisement not found with id: " + advertisementId));

        advertisement.setRenewedAt(LocalDateTime.now());
        logger.debug("Advertisement renewed at: {}", advertisement.getRenewedAt());
        return advertisementRepository.save(advertisement);
    }

}
