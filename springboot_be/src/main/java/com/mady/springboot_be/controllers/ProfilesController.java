package com.mady.springboot_be.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.dtos.AddressDTO;
import com.mady.springboot_be.dtos.ProfileDTO;
import com.mady.springboot_be.services_impl.ProfileServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for user profile management operations.
 * 
 * Supports CRUD operations on user profiles with address association,
 * profile picture upload (multipart/form-data), and one-to-one
 * mapping between User and Profile entities.
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/profiles")
@Tag(name = "Profiles", description = "Endpoints for managing user profiles")
public class ProfilesController {

    private final ProfileServiceImpl profileService;

    @Autowired
    public ProfilesController(ProfileServiceImpl profileService) {
        this.profileService = profileService;
    }

    @Operation(summary = "Create a new profile with address and optional profile picture")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Profile created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> createProfile(
            @RequestPart("profile") ProfileDTO profile,
            @RequestPart("address") AddressDTO address,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture,
            @RequestParam Long userId) {

        return profileService.postProfile(profile, address, userId, profilePicture);
    }

    @Operation(summary = "Update an existing profile")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User or Profile not found")
    })
    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> updateProfile(
            @RequestParam Long userId,
            @RequestPart("profile") ProfileDTO profile,
            @RequestPart("address") AddressDTO address,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture) {

        return profileService.putProfile(userId, profile, address, profilePicture);
    }

    @Operation(summary = "Get profile by profile ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Profile not found")
    })
    @GetMapping("/{profileId}")
    public ResponseEntity<ProfileDTO> getProfileById(@PathVariable Long profileId) {
        return profileService.getProfileById(profileId);
    }

    @Operation(summary = "Soft delete a profile by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Profile not found")
    })
    @DeleteMapping("/{profileId}")
    public ResponseEntity<Object> deleteProfile(@PathVariable Long profileId) {
        return profileService.deleteProfile(profileId);
    }

    @Operation(summary = "Soft delete all profiles")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "All profiles deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No profiles found to delete")
    })
    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse> deleteAllProfiles() {
        return profileService.deleteAllProfiles();
    }

    @Operation(summary = "Count active profiles")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Count successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No profiles found")
    })
    @GetMapping("/count")
    public ResponseEntity<Integer> countProfiles() {
        return profileService.countProfiles();
    }

    @Operation(summary = "Count deleted profiles")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Count successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No deleted profiles found")
    })
    @GetMapping("/count-deleted")
    public ResponseEntity<Integer> countDeletedProfiles() {
        return profileService.countProfilesDeleted();
    }

    @Operation(summary = "Get paginated list of active profiles")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profiles retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No profiles found")
    })
    @GetMapping
    public ResponseEntity<Page<ProfileDTO>> getProfilesNotDeleted(Pageable pageable) {
        return ResponseEntity.ok(profileService.getProfilessNotDeleted(pageable));
    }

    @Operation(summary = "Get paginated list of deleted profiles")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Deleted profiles retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No deleted profiles found")
    })
    @GetMapping("/deleted")
    public ResponseEntity<Page<ProfileDTO>> getProfilesDeleted(Pageable pageable) {
        return ResponseEntity.ok(profileService.getProfilesDeleted(pageable));
    }

    @Operation(summary = "Get profile by user ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Profile not found for this user")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<ProfileDTO> getProfileByUserId(@PathVariable Long userId) {
        return profileService.getByUserId(userId);
    }

    @Operation(summary = "Get profile picture as binary image")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile picture retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Profile or picture not found")
    })
    @GetMapping("/user/{userId}/picture")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable Long userId) {
        return profileService.getProfilePictureByUserId(userId); // Usa il metodo esistente correttamente
    }

    @Operation(summary = "Get profile picture as Base64 encoded string")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile picture retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Profile or picture not found")
    })
    @GetMapping("/user/{userId}/picture-base64")
    public ResponseEntity<String> getProfilePictureBase64(@PathVariable Long userId) {
        return profileService.getProfilePictureBase64ByUserId(userId);
    }
}
