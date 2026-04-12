package com.mady.springboot_be.services_impl;

import java.util.Base64;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mady.springboot_be.dtos.AddressDTO;
import com.mady.springboot_be.dtos.UserDTO;
import com.mady.springboot_be.dtos.sample_dtos.AdvertisementCompleteDto;
import com.mady.springboot_be.dtos.sample_dtos.ImageCompleteDto;
import com.mady.springboot_be.dtos.sample_dtos.ProductCompleteDto;
import com.mady.springboot_be.dtos.sample_dtos.ProfileSampleDto;
import com.mady.springboot_be.entities.Address;
import com.mady.springboot_be.entities.Advertisement;
import com.mady.springboot_be.entities.Image;
import com.mady.springboot_be.entities.Product;
import com.mady.springboot_be.entities.Profile;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.repositories.UserAdvertisementLikeRepository;

/**
 * Service for mapping complex entity graphs to complete DTOs.
 * 
 * Provides comprehensive mapping for:
 * - Product → ProductCompleteDto (with address, advertisement, images)
 * - Advertisement → AdvertisementCompleteDto (with like count, creator,
 * profile)
 * - Address → AddressDTO
 * - Image → ImageCompleteDto (with Base64 encoding)
 * - User → UserDTO (simple version)
 * - Profile → ProfileSampleDto (with address)
 * 
 * Used primarily by AppointmentMapper and other services that need
 * complete product and advertisement data.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class AllMappingService {

    private final UserAdvertisementLikeRepository likeRepository;

    /**
     * Constructs a new AllMappingService with required dependencies.
     * 
     * @param likeRepository repository for counting advertisement likes
     */
    @Autowired
    public AllMappingService(UserAdvertisementLikeRepository likeRepository) {
        this.likeRepository = likeRepository;
    }

    /**
     * Maps a Product entity to a complete ProductCompleteDto.
     * 
     * Includes:
     * - Basic product info (ID, price, active, condition, stock)
     * - Associated address (if present)
     * - Associated advertisement (if present)
     * - All product images (converted to Base64 data URLs)
     * 
     * @param product the Product entity to map
     * @return complete ProductCompleteDto
     */
    public ProductCompleteDto mapToCompleteDto(Product product) {
        ProductCompleteDto dto = new ProductCompleteDto();
        dto.setProductId(product.getProductId());
        dto.setPrice(product.getPrice());
        dto.setActive(product.getActive());
        dto.setCondition(product.getCondition());
        dto.setStockQuantity(product.getStockQuantity());

        // Simple Address mapping
        if (product.getAddress() != null) {
            dto.setAddress(mapAddressDto(product.getAddress()));
        }

        // Associated Advertisement (1:1 relationship, no reference back to product)
        if (product.getAdvertisement() != null) {
            dto.setAdvertisement(mapAdvertisementDto(product.getAdvertisement()));
        }

        // Images with Base64 encoding
        if (product.getImages() != null) {
            dto.setImages(product.getImages().stream()
                    .map(this::mapImageDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    /**
     * Maps an Address entity to an AddressDTO.
     * 
     * @param address the Address entity to map
     * @return the corresponding AddressDTO
     */
    private AddressDTO mapAddressDto(Address address) {
        AddressDTO dto = new AddressDTO();
        dto.setAddressId(address.getAddressId());
        dto.setStreet(address.getStreet());
        dto.setStreetNumber(address.getStreetNumber());
        dto.setProvince(address.getProvince());
        dto.setRegion(address.getRegion());
        dto.setZipCode(address.getZipCode());
        dto.setCity(address.getCity());
        dto.setCountry(address.getCountry());
        dto.setLatitude(address.getLatitude());
        dto.setLongitude(address.getLongitude());
        dto.setActive(address.getActive());
        return dto;
    }

    /**
     * Maps an Advertisement entity to an AdvertisementCompleteDto.
     * 
     * Includes:
     * - Basic advertisement info (title, description, status, type)
     * - Agency information if applicable
     * - Creator user (simple DTO)
     * - Associated profile (sample DTO)
     * - Like count from repository
     * 
     * @param advertisement the Advertisement entity to map
     * @return the corresponding AdvertisementCompleteDto
     */
    private AdvertisementCompleteDto mapAdvertisementDto(Advertisement advertisement) {
        AdvertisementCompleteDto dto = new AdvertisementCompleteDto();

        // Count active likes for this advertisement using the repository
        int likeCount = likeRepository.countByAdvertisementIdAndLikedTrue(advertisement.getAdvertisementId());

        dto.setAdvertisementId(advertisement.getAdvertisementId());
        dto.setTitle(advertisement.getTitle());
        dto.setDescription(advertisement.getDescription());
        dto.setStatus(advertisement.getStatus());
        dto.setCreatedAt(advertisement.getCreatedAt());
        dto.setType(advertisement.getType());
        dto.setRenewedAt(advertisement.getRenewedAt());
        dto.setAgency(advertisement.getAgency());
        dto.setAgencyName(advertisement.getAgencyName());
        dto.setAgencyFeePercent(advertisement.getAgencyFeePercent());
        dto.setAgencyUrl(advertisement.getAgencyUrl());
        dto.setActive(advertisement.getActive());
        dto.setCreatedBy(mapUserSimpleDto(advertisement.getCreatedBy()));
        dto.setProfile(mapProfileSimpleDto(advertisement.getProfile()));
        dto.setLikesNumber(likeCount);
        return dto;
    }

    /**
     * Maps a User entity to a simple UserDTO.
     * 
     * Includes only essential fields: ID, Google ID, access token,
     * email, roles, scopes, registration date, last login, active status.
     * Password is intentionally excluded for security.
     * 
     * @param user the User entity to map
     * @return the corresponding UserDTO (simple version)
     */
    private UserDTO mapUserSimpleDto(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUserIdGoogle(user.getUserIdGoogle());
        dto.setGoogleAccessToken(user.getGoogleAccessToken());
        dto.setEmail(user.getEmail());
        dto.setRoles(user.getRoles());
        dto.setScopes(user.getScopes());
        dto.setRegistrationDate(user.getRegistrationDate());
        dto.setLastLogin(user.getLastLogin());
        dto.setActive(user.getActive());
        return dto;
    }

    /**
     * Maps a Profile entity to a ProfileSampleDto.
     * 
     * Includes profile information such as name, date of birth,
     * gender, phone number, associated address, profile picture,
     * user type, rating, sales/purchases statistics, and preferences.
     * 
     * @param profile the Profile entity to map
     * @return the corresponding ProfileSampleDto
     */
    private ProfileSampleDto mapProfileSimpleDto(Profile profile) {
        ProfileSampleDto dto = new ProfileSampleDto();

        dto.setProfileId(profile.getProfileId());
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setDateOfBirth(profile.getDateOfBirth());

        dto.setGender(profile.getGender());
        dto.setPhoneNumber(profile.getPhoneNumber());

        if (profile.getAddress() != null) {
            dto.setAddress(mapAddressDto(profile.getAddress()));
        }

        dto.setProfilePicture(profile.getProfilePicture());
        dto.setUserType(profile.getUserType());
        dto.setRating(profile.getRating());
        dto.setTotalSales(profile.getTotalSales());
        dto.setTotalPurchases(profile.getTotalPurchases());
        dto.setSecurityQuestion(profile.getSecurityQuestion());
        dto.setSecurityAnswer(profile.getSecurityAnswer());
        dto.setNewsletterSubscription(profile.getNewsletterSubscription());
        dto.setPreferredLanguage(profile.getPreferredLanguage());
        dto.setCurrency(profile.getCurrency());
        dto.setActive(profile.isActive());
        return dto;
    }

    /**
     * Maps an Image entity to an ImageCompleteDto.
     * 
     * Converts the image byte array to a Base64-encoded string
     * for direct use in HTML img tags (data:image/...;base64,...).
     * 
     * @param image the Image entity to map
     * @return the corresponding ImageCompleteDto with Base64 image data
     */
    private ImageCompleteDto mapImageDto(Image image) {
        ImageCompleteDto dto = new ImageCompleteDto();
        dto.setImageId(image.getImageId());
        dto.setPicByte(Base64.getEncoder().encodeToString(image.getPicByte()));
        dto.setActive(image.getActive());
        return dto;
    }

}
