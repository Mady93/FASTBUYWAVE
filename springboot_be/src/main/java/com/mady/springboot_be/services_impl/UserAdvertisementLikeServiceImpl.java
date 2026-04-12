package com.mady.springboot_be.services_impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.mady.springboot_be.dettails.ApiResponseData;
import com.mady.springboot_be.dtos.LikeStatusDto;
import com.mady.springboot_be.dtos.LikeUserDTO;
import com.mady.springboot_be.dtos.sample_dtos.LikeRequestDTO;
import com.mady.springboot_be.entities.Advertisement;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.entities.UserAdvertisementLike;
import com.mady.springboot_be.entities.UserAdvertisementLike.UserAdvertisementLikeId;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.AdvertisementRepository;
import com.mady.springboot_be.repositories.UserAdvertisementLikeRepository;
import com.mady.springboot_be.repositories.UserRepository;
import com.mady.springboot_be.services.UserAdvertisementLikeService;

/**
 * Implementation of UserAdvertisementLikeService for managing likes on
 * advertisements.
 * 
 * Handles:
 * - Toggling likes on advertisements (create/update)
 * - Retrieving all liked advertisements by user
 * - Retrieving all users who liked a specific advertisement
 * 
 * The like operation is idempotent: multiple like requests do not create
 * duplicates.
 * Uses composite key (userId, advertisementId) for efficient lookup.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class UserAdvertisementLikeServiceImpl implements UserAdvertisementLikeService {

        private final UserAdvertisementLikeRepository likeRepository;
        private final AdvertisementRepository advertisementRepository;
        private final UserRepository userRepository;

        private static final Logger logger = LoggerFactory.getLogger(UserAdvertisementLikeServiceImpl.class);

        /**
         * Constructs a new UserAdvertisementLikeServiceImpl with required dependencies.
         * 
         * @param likeRepository          repository for UserAdvertisementLike entity
         * @param advertisementRepository repository for Advertisement entity
         * @param userRepository          repository for User entity
         */
        @Autowired
        public UserAdvertisementLikeServiceImpl(UserAdvertisementLikeRepository likeRepository,
                        AdvertisementRepository advertisementRepository,
                        UserRepository userRepository) {
                this.likeRepository = likeRepository;
                this.advertisementRepository = advertisementRepository;
                this.userRepository = userRepository;
        }

        @Override
        public ResponseEntity<ApiResponseData> updateLikes(Long advertisementId, LikeRequestDTO likeRequest,
                        Long userId) {

                logger.info("Updating like for advertisement {} by user {}", advertisementId, userId);
                // Verify both entities exist
                Advertisement ad = advertisementRepository.findById(advertisementId)
                                .orElseThrow(
                                                () -> new ResourceNotFoundException("Advertisement with ID "
                                                                + advertisementId + " not found"));
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User with ID " + userId + " not found"));

                UserAdvertisementLikeId likeId = new UserAdvertisementLikeId(userId, advertisementId);
                UserAdvertisementLike like = likeRepository.findById(likeId)
                                .orElse(new UserAdvertisementLike(likeId, user, ad, likeRequest.getLiked(),
                                                LocalDateTime.now()));

                // Set all fields
                like.setId(likeId);
                like.setUser(user);
                like.setAdvertisement(ad);
                like.setLiked(likeRequest.getLiked());
                like.setCreatedAt(LocalDateTime.now());

                // Save the entity
                this.likeRepository.save(like);

                // Calculate the current like count
                int likesCount = likeRepository.countByAdvertisementIdAndLikedTrue(advertisementId);
                String message = "Advertisement likes updated successfully";

                logger.info("Like updated for advertisement {}. New like count: {}", advertisementId, likesCount);

                return ResponseEntity.status(HttpStatus.OK)
                                .body(new ApiResponseData<>(String.valueOf(HttpStatus.OK.value()), message,
                                                likesCount));
        }

        @Override
        public ResponseEntity<ApiResponseData> getAllLikesByUser(Long userId) {

                logger.info("Fetching liked advertisements for user: {}", userId);

                userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                List<UserAdvertisementLike> likes = likeRepository.findByIdUserIdAndLikedTrue(userId);
                List<LikeStatusDto> likedStatuses = likes.stream()
                                .filter(UserAdvertisementLike::getLiked)
                                .map(like -> new LikeStatusDto(like.getAdvertisement().getAdvertisementId(), true))
                                .collect(Collectors.toList());

                return ResponseEntity.ok(
                                new ApiResponseData<>(String.valueOf(HttpStatus.OK.value()), "User likes fetched",
                                                likedStatuses));
        }

        @Override
        public ResponseEntity<ApiResponseData> getLikesByAdvertisement(Long advertisementId) {

                logger.info("Fetching users who liked advertisement: {}", advertisementId);

                advertisementRepository.findById(advertisementId)
                                .orElseThrow(
                                                () -> new ResourceNotFoundException("Advertisement with ID "
                                                                + advertisementId + " not found"));

                List<UserAdvertisementLike> likes = likeRepository.findByAdvertisementIdAndLikedTrue(advertisementId);

                List<LikeUserDTO> result = likes.stream()
                                .map(like -> new LikeUserDTO(
                                                like.getUser().getUserId(),
                                                like.getUser().getEmail(),
                                                like.getCreatedAt()))
                                .collect(Collectors.toList());

                return ResponseEntity.ok(
                                new ApiResponseData<>(String.valueOf(HttpStatus.OK.value()), "Likes fetched", result));
        }
}