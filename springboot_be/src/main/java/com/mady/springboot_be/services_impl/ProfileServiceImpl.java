package com.mady.springboot_be.services_impl;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.dtos.AddressDTO;
import com.mady.springboot_be.dtos.ProfileDTO;
import com.mady.springboot_be.entities.Address;
import com.mady.springboot_be.entities.Profile;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.ProfileRepository;
import com.mady.springboot_be.repositories.UserRepository;
import com.mady.springboot_be.services.ProfileService;
import com.mady.springboot_be.utils.PaginationUtils;
import com.mady.springboot_be.utils.mappers.AddressMapper;
import com.mady.springboot_be.utils.mappers.ProfileMapper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

/**
 * Implementation of ProfileService for user profile management.
 * 
 * Handles CRUD operations on profiles including:
 * - Profile creation with address and profile picture
 * - Profile updates with address and profile picture
 * - Soft delete with recursive propagation
 * - Profile picture retrieval as binary or Base64 data URL
 * - Pagination support for active/inactive profiles
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class ProfileServiceImpl implements ProfileService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ProfileMapper profileMapper;
    private final AddressMapper addressMapper;
    private final AddressServiceImpl addressService;

    private static final Logger logger = LoggerFactory.getLogger(ProfileServiceImpl.class);

    /**
     * Constructs a new ProfileServiceImpl with required dependencies.
     * 
     * @param profileRepository repository for Profile entity
     * @param userRepository    repository for User entity
     * @param profileMapper     mapper for Profile entity to DTO conversion
     * @param addressMapper     mapper for Address entity to DTO conversion
     * @param addressService    service for Address operations
     */
    @Autowired
    public ProfileServiceImpl(ProfileRepository profileRepository, UserRepository userRepository,
            ProfileMapper profileMapper, AddressMapper addressMapper, AddressServiceImpl addressService) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.profileMapper = profileMapper;
        this.addressMapper = addressMapper;
        this.addressService = addressService;
    }

    @Override
    public ResponseEntity<Integer> countProfiles() {
        Long count = profileRepository.countByNotDeleted();
        if (count == 0) {
            throw new ResourceNotFoundException(
                    "Unable to perform the count. No profiles resource was found");
        }
        return new ResponseEntity<>(count.intValue(), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Integer> countProfilesDeleted() {
        Long count = profileRepository.countByDeleted();
        if (count == 0) {
            throw new ResourceNotFoundException(
                    "Unable to perform the count. No profiles resource was found");
        }
        return new ResponseEntity<>(count.intValue(), HttpStatus.OK);
    }

    @Override
    @Transactional
    public ResponseEntity<Object> postProfile(ProfileDTO profileDTO, AddressDTO addressDTO, Long userId,
            MultipartFile profilePicture) {

        logger.info("Creating profile for user ID: {}", userId);

        if (profileDTO == null)
            throw new IllegalArgumentException("ProfileDTO cannot be null");
        if (addressDTO == null)
            throw new IllegalArgumentException("AddressDTO cannot be null");

        AddressDTO savedAddressDTO = this.addressService.save(addressDTO);
        Address savedAddress = addressMapper.toEntity(savedAddressDTO);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No profile with ID: " + userId + " was found"));

        Profile profileEntity = profileMapper.toEntity(profileDTO);
        Profile profile = new Profile();

        profile.setFirstName(profileEntity.getFirstName());
        profile.setLastName(profileEntity.getLastName());
        profile.setDateOfBirth(profileEntity.getDateOfBirth());
        profile.setGender(profileEntity.getGender());
        profile.setPhoneNumber(profileEntity.getPhoneNumber());

        try {
            profile.setProfilePicture(profilePicture.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Error reading profile picture", e);
        }
        profile.setUserType(profileEntity.getUserType());
        profile.setSecurityQuestion(profileEntity.getSecurityQuestion());
        profile.setSecurityAnswer(profileEntity.getSecurityAnswer());
        profile.setNewsletterSubscription(profileEntity.getNewsletterSubscription());
        profile.setPreferredLanguage(profileEntity.getPreferredLanguage());
        profile.setCurrency(profileEntity.getCurrency());
        profile.setActive(profileEntity.getActive());
        profile.setNotificationPreferences(profileEntity.getNotificationPreferences());
        profile.setPrivacySettings(profileEntity.getPrivacySettings());

        profile.setAddress(savedAddress);
        profile.setUser(user);
        Profile saved = profileRepository.save(profile);

        logger.info("Profile created with ID: {}", saved.getProfileId());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @Override
    @Transactional
    public ResponseEntity<Object> putProfile(Long userId, ProfileDTO profileDTO, AddressDTO addressDTO,
            MultipartFile profilePicture) {

        logger.info("Updating profile for user ID: {}", userId);

        if (profileDTO == null)
            throw new IllegalArgumentException("ProfileDTO cannot be null");
        if (addressDTO == null)
            throw new IllegalArgumentException("AddressDTO cannot be null");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No user with ID: " + userId + " was found"));

        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No active profile found for userId: " + userId));

        Address address = profile.getAddress();
        if (address == null) {
            throw new ResourceNotFoundException("No address found for profile of userId: " + userId);
        } else {
            address.setStreet(addressDTO.getStreet());
            address.setStreetNumber(addressDTO.getStreetNumber());
            address.setProvince(addressDTO.getProvince());
            address.setRegion(addressDTO.getRegion());
            address.setZipCode(addressDTO.getZipCode());
            address.setCity(addressDTO.getCity());
            address.setCountry(addressDTO.getCountry());
            address.setLatitude(addressDTO.getLatitude());
            address.setLongitude(addressDTO.getLongitude());
        }

        profile.setFirstName(profileDTO.getFirstName());
        profile.setLastName(profileDTO.getLastName());
        profile.setDateOfBirth(profileDTO.getDateOfBirth());
        profile.setGender(profileDTO.getGender());
        profile.setPhoneNumber(profileDTO.getPhoneNumber());

        try {
            profile.setProfilePicture(profilePicture.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Error reading profile picture", e);
        }
        profile.setUserType(profileDTO.getUserType());
        profile.setSecurityQuestion(profileDTO.getSecurityQuestion());
        profile.setSecurityAnswer(profileDTO.getSecurityAnswer());
        profile.setNewsletterSubscription(profileDTO.getNewsletterSubscription());
        profile.setPreferredLanguage(profileDTO.getPreferredLanguage());
        profile.setCurrency(profileDTO.getCurrency());
        profile.setActive(profileDTO.getActive());
        profile.setNotificationPreferences(profileDTO.getNotificationPreferences());
        profile.setPrivacySettings(profileDTO.getPrivacySettings());

        profile.setUser(user);

        Profile saved = profileRepository.save(profile);

        Hibernate.initialize(profile.getWishlist());
        Hibernate.initialize(profile.getNotificationPreferences());
        Hibernate.initialize(profile.getPrivacySettings());

        logger.info("Profile updated for user ID: {}", userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @Override
    public ResponseEntity<ProfileDTO> getProfileById(Long profileId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        ProfileDTO dto = profileMapper.toDto(profile);
        return ResponseEntity.ok(dto);
    }

    @Override
    public ResponseEntity<Object> deleteProfile(Long profileId) {

        logger.info("Soft deleting profile ID: {}", profileId);

        Optional<Profile> optional = profileRepository.findByIdByNotDeleted(profileId);
        if (optional.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Unable to perform the deletion. The property resource with ID: " + profileId
                            + " was not found in the database");
        }

        this.deleteProfileEm(profileId);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse(HttpStatus.OK.value(), "Success deleted"));
    }

    @Override
    public ResponseEntity<ApiResponse> deleteAllProfiles() {

        logger.info("Soft deleting all profiles");

        List<Profile> list = profileRepository.findByNotDeletedList();
        if (list.isEmpty()) {
            throw new ResourceNotFoundException("No profiles found to delete");
        }

        this.deleteAllProfilesEm();

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse(HttpStatus.OK.value(), "Success deleted"));
    }

    @Override
    public Page<ProfileDTO> getProfilessNotDeleted(Pageable pageable) throws ResourceNotFoundException {
        List<Profile> allProfiles = profileRepository.findByNotDeletedList();
        if (allProfiles.isEmpty()) {
            throw new ResourceNotFoundException("No profile resource was found");
        }

        List<ProfileDTO> dtoList = profileMapper.toDtoList(allProfiles);
        return PaginationUtils.paginateList(dtoList, pageable);
    }

    @Override
    public Page<ProfileDTO> getProfilesDeleted(Pageable pageable) throws ResourceNotFoundException {
        List<Profile> allProfiles = profileRepository.findByDeletedList();
        if (allProfiles.isEmpty()) {
            throw new ResourceNotFoundException("No profile resource was found");
        }

        List<ProfileDTO> dtoList = profileMapper.toDtoList(allProfiles);
        return PaginationUtils.paginateList(dtoList, pageable);
    }

    @Override
    @Transactional(Transactional.TxType.REQUIRED)
    public ResponseEntity<ProfileDTO> getByUserId(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No profile for user with ID: " + userId));
        ProfileDTO dto = profileMapper.toDto(profile);
        return ResponseEntity.ok(dto);
    }

    @Transactional
    private void deleteProfileEm(Long profileId) {
        entityManager.createQuery("UPDATE Profile p SET p.active = false WHERE p.profileId = :profileId")
                .setParameter("profileId", profileId)
                .executeUpdate();
    }

    /**
     * Soft deletes all profiles using direct entity manager update.
     */
    @Transactional
    private void deleteAllProfilesEm() {

        entityManager.createQuery("UPDATE Profile p SET p.active = false")
                .executeUpdate();
    }

    @Override
    public ResponseEntity<byte[]> getProfilePictureByUserId(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No profile found for user with ID: " + userId));

        byte[] image = profile.getProfilePicture();
        if (image == null || image.length == 0) {
            throw new ResourceNotFoundException("Profile picture not found for user with ID: " + userId);
        }

        return ResponseEntity
                .ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(image);
    }

    @Override
    public ResponseEntity<String> getProfilePictureBase64ByUserId(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No profile found for user with ID: " + userId));

        byte[] imageData = profile.getProfilePicture();
        if (imageData == null || imageData.length == 0) {
            throw new ResourceNotFoundException("Profile picture not found for user with ID: " + userId);
        }

        String base64Image = Base64.getEncoder().encodeToString(imageData);

        String mimeType = "image/jpeg";

        // Auto-detect MIME type from byte signature
        if (imageData.length >= 4) {
            // PNG
            if (imageData[0] == (byte) 0x89 && imageData[1] == (byte) 0x50 &&
                    imageData[2] == (byte) 0x4E && imageData[3] == (byte) 0x47) {
                mimeType = "image/png";
            }
            // JPEG
            else if (imageData[0] == (byte) 0xFF && imageData[1] == (byte) 0xD8 &&
                    imageData[2] == (byte) 0xFF) {
                mimeType = "image/jpeg";
            }
            // GIF
            else if (imageData[0] == (byte) 0x47 && imageData[1] == (byte) 0x49 &&
                    imageData[2] == (byte) 0x46) {
                mimeType = "image/gif";
            }
        }

        String dataUrl = "data:" + mimeType + ";base64," + base64Image;
        return ResponseEntity.ok(dataUrl);
    }
}
