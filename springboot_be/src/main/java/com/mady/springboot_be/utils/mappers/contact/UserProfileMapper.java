package com.mady.springboot_be.utils.mappers.contact;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mady.springboot_be.dtos.UserProfileDTO;
import com.mady.springboot_be.entities.Profile;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.repositories.ProfileRepository;

/**
 * Mapper for converting User entity to UserProfileDTO.
 * 
 * Combines User entity data with associated Profile data into a single DTO.
 * The Profile is fetched from the repository using the User ID.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Component
public class UserProfileMapper {

    private final ProfileRepository profileRepository;

    /**
     * Constructs a new UserProfileMapper with required dependency.
     * 
     * @param profileRepository repository for fetching Profile by User ID
     */
    public UserProfileMapper(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    /**
     * Converts a User entity to a UserProfileDTO.
     * 
     * Fetches the associated Profile from the repository and creates a DTO
     * that combines User and Profile information.
     * 
     * @param user the User entity to convert
     * @return the corresponding UserProfileDTO, or null if user is null
     */
    public UserProfileDTO toDTO(User user) {
        if (user == null)
            return null;

        Optional<Profile> profile = profileRepository.findByUserId(user.getUserId());
        return new UserProfileDTO(user, profile);
    }

    /**
     * Converts a list of User entities to a list of UserProfileDTOs.
     * 
     * @param users the list of User entities to convert
     * @return the list of corresponding UserProfileDTOs
     */
    public List<UserProfileDTO> toDTOList(List<User> users) {
        return users.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
