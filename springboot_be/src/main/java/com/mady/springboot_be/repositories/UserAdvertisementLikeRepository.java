package com.mady.springboot_be.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.UserAdvertisementLike;
import com.mady.springboot_be.entities.UserAdvertisementLike.UserAdvertisementLikeId;

/**
 * Repository interface for UserAdvertisementLike entity operations.
 * 
 * Manages user likes on advertisements. Supports counting likes,
 * checking if a user liked an advertisement, and retrieving likes
 * by user or advertisement.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface UserAdvertisementLikeRepository extends JpaRepository<UserAdvertisementLike, UserAdvertisementLikeId> {

    /**
     * Finds a like by user ID and advertisement ID.
     * 
     * @param userId          the ID of the user
     * @param advertisementId the ID of the advertisement
     * @return Optional containing the like if found
     */
    Optional<UserAdvertisementLike> findByUserIdAndAdvertisementId(Long userId, Long advertisementId);

    /**
     * Counts how many users liked a specific advertisement.
     * 
     * @param advertisementId the ID of the advertisement
     * @return number of likes
     */
    Integer countByAdvertisementIdAndLikedTrue(Long advertisementId);

    /**
     * Checks if a specific user liked a specific advertisement.
     * 
     * @param userId          the ID of the user
     * @param advertisementId the ID of the advertisement
     * @return true if liked, false otherwise
     */
    boolean existsByUserIdAndAdvertisementIdAndLikedTrue(Long userId, Long advertisementId);

    /**
     * Finds all advertisements liked by a specific user.
     * 
     * @param userId the ID of the user
     * @return list of likes where user liked the advertisement
     */
    List<UserAdvertisementLike> findByIdUserIdAndLikedTrue(Long userId);

    /**
     * Finds all users who liked a specific advertisement.
     * 
     * @param advertisementId the ID of the advertisement
     * @return list of likes for the advertisement
     */
    List<UserAdvertisementLike> findByAdvertisementIdAndLikedTrue(Long advertisementId);
}
