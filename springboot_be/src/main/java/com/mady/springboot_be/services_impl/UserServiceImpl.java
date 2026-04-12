package com.mady.springboot_be.services_impl;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.dtos.UserDTO;
import com.mady.springboot_be.entities.Advertisement;
import com.mady.springboot_be.entities.Image;
import com.mady.springboot_be.entities.Product;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.exceptions.AdminDeletionException;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.UserRepository;
import com.mady.springboot_be.services.UserService;
import com.mady.springboot_be.utils.PaginationUtils;
import com.mady.springboot_be.utils.mappers.UserMapper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;

/**
 * Implementation of UserService for user management.
 * 
 * Handles:
 * - User CRUD operations
 * - Soft delete with recursive propagation to user data (advertisements,
 * products, images)
 * - ADMIN user protection (cannot delete the last ADMIN)
 * - Reactivation of soft-deleted users and their associated data
 * - Pagination support for active/deleted users
 * 
 * Soft delete operations cascade to:
 * - Advertisements created by the user
 * - Products associated with those advertisements
 * - Images associated with those products
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final EntityManager entityManager;
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    /**
     * Constructs a new UserServiceImpl with required dependencies.
     * 
     * @param userRepository  repository for User entity
     * @param passwordEncoder encoder for password hashing (BCrypt)
     * @param userMapper      mapper for User entity to DTO conversion
     * @param entityManager   JPA entity manager for native queries
     */
    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, UserMapper userMapper,
            EntityManager entityManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.entityManager = entityManager;

    }

    @Override
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findUserByEmail(email);
        UserDTO dto = userMapper.toUserDTO(user);
        logger.info("Utente recuperato per email: {} - ID: {}", email, user != null ? user.getUserId() : "null");
        return dto;
    }

    @Override
    public int countUsers() throws ResourceNotFoundException {
        Long count = userRepository.countByNotDeleted();
        if (count == 0) {
            throw new ResourceNotFoundException("No users found in the database.");
        }
        logger.info("Found {} active users", count);
        return count.intValue();
    }

    @Override
    public Page<UserDTO> getUsers(Pageable pageable) throws ResourceNotFoundException {
        List<User> allUsers = userRepository.findByNotDeleted();
        if (allUsers.isEmpty()) {
            throw new ResourceNotFoundException("No users found");
        }
        Page<User> paged = PaginationUtils.paginateList(allUsers, pageable);
        logger.info("Retrieved {} users on page {}", paged.getContent().size(), pageable.getPageNumber());
        return paged.map(userMapper::toUserDTO);
    }

    @Override
    public List<UserDTO> getAllActiveUsers() throws ResourceNotFoundException {
        List<User> activeUsers = userRepository.findByNotDeleted();
        if (activeUsers.isEmpty()) {
            throw new ResourceNotFoundException("No active users found");
        }
        logger.info("Retrieved {} active users", activeUsers.size());
        return activeUsers.stream()
                .map(userMapper::toUserDTO)
                .toList();
    }

    @Override
    public int countDeletedUsers() throws ResourceNotFoundException {
        Long count = userRepository.countByDeleted();
        if (count == 0) {
            throw new ResourceNotFoundException("No deleted users found in the database.");
        }
        logger.info("Found {} deleted users", count);
        return count.intValue();
    }

    @Override
    public Page<UserDTO> getDeletedUsers(Pageable pageable) throws ResourceNotFoundException {
        List<User> deletedUsers = userRepository.findByDeleted();
        if (deletedUsers.isEmpty()) {
            throw new ResourceNotFoundException("No deleted users found");
        }
        Page<User> paged = PaginationUtils.paginateList(deletedUsers, pageable);
        logger.info("Retrieved {} deleted users on page {}", paged.getContent().size(), pageable.getPageNumber());
        return paged.map(userMapper::toUserDTO);
    }

    @Override
    public UserDTO createUser(UserDTO userDTO) {

        User user = userMapper.toUser(userDTO);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRegistrationDate(LocalDateTime.now());
        user.setActive(true);
        user.setRoles("USER");
        user.setScopes("default");

        User savedUser = userRepository.save(user);
        logger.info("User created successfully - ID: {}, Email: {}", savedUser.getUserId(), savedUser.getEmail());
        return userMapper.toUserDTO(savedUser);
    }

    @Override
    public UserDTO createOAuthUser(UserDTO userDTO) {
        // For OAuth users (without password)
        User user = userMapper.toUser(userDTO);
        user.setRegistrationDate(LocalDateTime.now());
        user.setActive(true);
        User savedUser = userRepository.save(user);
        logger.info("OAuth user created successfully - ID: {}, Email: {}", savedUser.getUserId(),
                savedUser.getEmail());
        return userMapper.toUserDTO(savedUser);
    }

    @Override
    public UserDTO getUserById(Long id) throws ResourceNotFoundException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", id);
                    return new ResourceNotFoundException("User with ID " + id + " not found.");
                });
        logger.info("User retrieved - ID: {}, Email: {}", id, user.getEmail());
        return userMapper.toUserDTO(user);
    }

    @Transactional
    @Override
    public UserDTO updateUser(Long id, UserDTO userDTO) throws ResourceNotFoundException {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("User not found for update - ID: {}", id);
                    return new ResourceNotFoundException("User with ID " + id + " not found.");
                });

        // Check if attempting to deactivate the last ADMIN
        if ("ADMIN".equalsIgnoreCase(existingUser.getRoles()) &&
                existingUser.getActive() &&
                !userDTO.getActive()) {

            // Count the number of active ADMINS
            long activeAdminCount = userRepository.countByRoles("ADMIN");
            logger.debug("Active ADMIN count: {}", activeAdminCount);

            // If this is the last active ADMIN, do not allow deactivation
            if (activeAdminCount <= 1) {
                logger.warn("Attempting to deactivate the last ADMIN - ID: {}", id);
                throw new IllegalArgumentException("Cannot deactivate the last active ADMIN user.");
            }
        }

        if (userDTO.getEmail() != null && !userDTO.getEmail().equals(existingUser.getEmail())) {
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                throw new IllegalArgumentException("Email already exists.");
            }
            existingUser.setEmail(userDTO.getEmail());
        }
        if (userDTO.getPassword() != null && !userDTO.getPassword().equals(existingUser.getPassword())) {
            existingUser.setPassword(userDTO.getPassword());
        }
        if (userDTO.getRoles() != null && !userDTO.getRoles().equals(existingUser.getRoles())) {
            existingUser.setRoles(userDTO.getRoles());
        }
        if (userDTO.getScopes() != null && !userDTO.getScopes().equals(existingUser.getScopes())) {
            existingUser.setScopes(userDTO.getScopes());
        }
        if (userDTO.getUserIdGoogle() != null && !userDTO.getUserIdGoogle().equals(existingUser.getUserIdGoogle())) {
            existingUser.setUserIdGoogle(userDTO.getUserIdGoogle());
        }
        if (userDTO.getRegistrationDate() != null &&
                !userDTO.getRegistrationDate().equals(existingUser.getRegistrationDate())) {
            existingUser.setRegistrationDate(userDTO.getRegistrationDate());
        }
        if (userDTO.getLastLogin() != null && !userDTO.getLastLogin().equals(existingUser.getLastLogin())) {
            existingUser.setLastLogin(userDTO.getLastLogin());
        }
        if (userDTO.getActive() != existingUser.getActive()) {
            existingUser.setActive(userDTO.getActive());

            if (userDTO.getActive() == false) {
                this.deactivateUserEntities(id);
            } else if (userDTO.getActive() == true) {

                this.activateEverythingByUser(id);
            }
        }

        User updatedUser = userRepository.save(existingUser);
        logger.info("User updated successfully - ID: {}", id);
        return userMapper.toUserDTO(updatedUser);
    }

    @Transactional
    @Override
    public ResponseEntity<Object> deleteUser(@PathVariable("userId") Long userId)
            throws ResourceNotFoundException, IllegalArgumentException, AccessDeniedException {
        // Find the user
        User user = entityManager.find(User.class, userId);
        if (user == null) {
            logger.error("User not found for deletion - ID: {}", userId);
            throw new ResourceNotFoundException("User with ID: " + userId + " not found.");
        }
        // Check if the user is an ADMIN
        if ("ADMIN".equalsIgnoreCase(user.getRoles())) {
            // Count the number of users with the ADMIN role
            Query query = entityManager.createQuery("SELECT COUNT(u) FROM User u WHERE u.roles = :role");
            query.setParameter("role", "ADMIN");
            long adminCount = (long) query.getSingleResult();
            // If the user is the last admin, do not allow deletion
            if (adminCount <= 1) {
                logger.warn("Attempt to delete the last ADMIN - ID: {}", userId);
                throw new AccessDeniedException("You cannot deactivate the last ADMIN user.");
            }
            // If there are other admins, proceed with deletion
            logger.warn("Attempt to delete an ADMIN - ID: {}", userId);
            throw new AccessDeniedException("You cannot deactivate an ADMIN user.");
        }
        // If the user is not an ADMIN, proceed with deactivating the user and related
        // data
        this.deleteUserAndRelatedData(userId);
        logger.info("User and related data successfully deleted - ID: {}", userId);
        String message = "User and associated data have been deleted successfully";
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(HttpStatus.OK.value(), message));
    }

    /**
     * Soft deletes a user and all related data.
     * 
     * @param userId the user ID
     */
    @Transactional
    public void deleteUserAndRelatedData(Long userId) throws AccessDeniedException {
        // Find the user
        User user = entityManager.find(User.class, userId);
        if (user == null) {
            logger.error("User not found for data deletion - ID: {}", userId);
            throw new ResourceNotFoundException("User with ID: " + userId + " not found.");
        }

        // Deactivate listings associated with the user - using TypedQuery
        TypedQuery<Advertisement> adQuery = entityManager.createQuery(
                "SELECT a FROM Advertisement a WHERE a.createdBy = :userId", Advertisement.class);
        adQuery.setParameter("userId", userId);
        List<Advertisement> ads = adQuery.getResultList();
        logger.info("Found {} listings to deactivate for user ID: {}", ads.size(), userId);

        if (!ads.isEmpty()) {
            for (Advertisement ad : ads) {
                ad.setActive(false);
                entityManager.merge(ad);
                logger.debug("Listing deactivated - ID: {}", ad.getAdvertisementId());

                // For each listing, find the associated products
                TypedQuery<Product> productQuery = entityManager.createQuery(
                        "SELECT p FROM Product p p.advertisement.advertisementId = :adId", Product.class);
                productQuery.setParameter("adId", ad.getAdvertisementId());
                List<Product> products = productQuery.getResultList();
                logger.debug("Found {} products for listing ID: {}", products.size(), ad.getAdvertisementId());

                if (!products.isEmpty()) {
                    for (Product product : products) {
                        product.setActive(false);
                        entityManager.merge(product);
                        logger.debug("Product deactivated - ID: {}", product.getProductId());

                        // Find and deactivate images associated with the products
                        TypedQuery<Image> imageQuery = entityManager.createQuery(
                                "SELECT i FROM Image i i.product.productId = :productId", Image.class);
                        imageQuery.setParameter("productId", product.getProductId());
                        List<Image> images = imageQuery.getResultList();
                        logger.debug("Found {} images for product ID: {}", images.size(), product.getProductId());

                        if (!images.isEmpty()) {
                            for (Image image : images) {
                                image.setActive(false);
                                entityManager.merge(image);
                                logger.debug("Image deactivated - ID: {}", image.getImageId());
                            }
                        }
                    }
                }
            }
        }

        // Deactivate the user
        user.setActive(false);
        entityManager.merge(user);
        logger.info("User deactivated - ID: {}", userId);
    }

    /**
     * Deactivates all entities associated with a user using native queries.
     * 
     * @param userId the user ID
     */
    @Transactional
    public void deactivateUserEntities(Long userId) {
        logger.debug("Mass deactivation of entities for user ID: {}", userId);

        entityManager.createNativeQuery("""
                    UPDATE advertisement a
                    SET a.active = 0
                    WHERE a.created_by = :userId
                """).setParameter("userId", userId).executeUpdate();

        entityManager.createNativeQuery("""
                    UPDATE products p
                    JOIN advertisement a ON a.advertisement_id = p.advertisement_id
                    SET p.active = 0
                    WHERE a.created_by = :userId
                """).setParameter("userId", userId).executeUpdate();

        entityManager.createNativeQuery("""
                    UPDATE image i
                    JOIN products p ON i.product_id = p.product_id
                    JOIN advertisement a ON a.advertisement_id = p.advertisement_id
                    SET i.active = 0
                    WHERE a.created_by = :userId
                """).setParameter("userId", userId).executeUpdate();

        logger.info("Mass deactivation completed - Listings: {}, Products: {}, Images: {} for user ID: {}");
    }

    /**
     * Activates all entities associated with a user using native queries.
     * 
     * @param userId the user ID
     */
    public void activateEverythingByUser(Long userId) {
        logger.debug("Mass activation of entities for user ID: {}", userId);
        entityManager.createNativeQuery("""
                    UPDATE advertisement a
                    SET a.active = 1
                    WHERE a.created_by = :userId
                """).setParameter("userId", userId).executeUpdate();

        entityManager.createNativeQuery("""
                    UPDATE products p
                    JOIN advertisement a ON a.advertisement_id = p.advertisement_id
                    SET p.active = 1
                    WHERE a.created_by = :userId
                """).setParameter("userId", userId).executeUpdate();

        entityManager.createNativeQuery("""
                    UPDATE image i
                    JOIN products p ON i.product_id = p.product_id
                    JOIN advertisement a ON a.advertisement_id = p.advertisement_id
                    SET i.active = 1
                    WHERE a.created_by = :userId
                """).setParameter("userId", userId).executeUpdate();

        logger.info("Mass activation completed - Listings: {}, Products: {}, Images: {} for user ID: {}");
    }

    @Override
    @Transactional
    public ResponseEntity<ApiResponse> deleteUsers() throws IllegalArgumentException, AdminDeletionException {
        this.deleteAll();
        logger.info("All users and related data successfully deleted");
        String message = "Users and their associated data have been deleted successfully";
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(HttpStatus.OK.value(), message));
    }

    /**
     * Performs bulk soft delete of all non-ADMIN users.
     */
    @Transactional
    private void deleteAll() throws AdminDeletionException {
        logger.debug("Starting mass deletion of all users");

        List<User> allUsers = userRepository.findAll();
        int skippedAdmins = 0;
        int alreadyDeactivated = 0;
        int deactivated = 0;

        for (User user : allUsers) {
            if (!user.getActive()) {
                alreadyDeactivated++;
                continue;
            }

            if ("ADMIN".equals(user.getRoles())) {
                skippedAdmins++;
                continue;
            }

            // Deactivates the user's data using a native query
            Long userId = user.getUserId();

            // Images
            entityManager.createNativeQuery("""
                        UPDATE image i
                        JOIN products p ON i.product_id = p.product_id
                        JOIN advertisement a ON p.advertisement_id = a.advertisement_id
                        SET i.active = 0
                        WHERE a.created_by = :userId
                    """).setParameter("userId", userId).executeUpdate();

            // Products
            entityManager.createNativeQuery("""
                        UPDATE products p
                        JOIN advertisement a ON p.advertisement_id = a.advertisement_id
                        SET p.active = 0
                        WHERE a.created_by = :userId
                    """).setParameter("userId", userId).executeUpdate();

            // Listings
            entityManager.createNativeQuery("""
                        UPDATE advertisement a
                        SET a.active = 0
                        WHERE a.created_by = :userId
                    """).setParameter("userId", userId).executeUpdate();

            // User
            entityManager.createNativeQuery("""
                        UPDATE users u
                        SET u.active = 0
                        WHERE u.user_id = :userId
                    """).setParameter("userId", userId).executeUpdate();

            deactivated++;
        }

        logger.info("Mass deletion completed - Deactivated: {}, ADMINs skipped: {}, Already deactivated: {}",
                deactivated, skippedAdmins, alreadyDeactivated);
    }

    @Override
    @Transactional
    public ResponseEntity<ApiResponse> reactivateAllUsers() {
        logger.debug("Reactivation of all users");

        // Find deactivated users (non-ADMIN)
        List<User> inactiveUsers = userRepository.findByDeleted().stream()
                .filter(user -> !"ADMIN".equals(user.getRoles()))
                .toList();

        if (inactiveUsers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(HttpStatus.NOT_FOUND.value(), "No inactive non-ADMIN users found"));
        }

        // Collect the IDs of users to reactivate
        List<Long> userIds = inactiveUsers.stream()
                .map(User::getUserId)
                .toList();

        // Reactivate images for these users
        entityManager.createNativeQuery("""
                    UPDATE image i
                    JOIN products p ON i.product_id = p.product_id
                    JOIN advertisement a ON p.advertisement_id = a.advertisement_id
                    SET i.active = 1
                    WHERE a.created_by IN (:userIds)
                """).setParameter("userIds", userIds).executeUpdate();

        // Reactivate products
        entityManager.createNativeQuery("""
                    UPDATE products p
                    JOIN advertisement a ON p.advertisement_id = a.advertisement_id
                    SET p.active = 1
                    WHERE a.created_by IN (:userIds)
                """).setParameter("userIds", userIds).executeUpdate();

        // Reactivate listings
        entityManager.createNativeQuery("""
                    UPDATE advertisement a
                    SET a.active = 1
                    WHERE a.created_by IN (:userIds)
                """).setParameter("userIds", userIds).executeUpdate();

        // Reactivate users
        entityManager.createNativeQuery("""
                    UPDATE users u
                    SET u.active = 1
                    WHERE u.user_id IN (:userIds)
                """).setParameter("userIds", userIds).executeUpdate();

        logger.info("Riattivati {} utenti non-ADMIN", userIds.size());

        return ResponseEntity.ok()
                .body(new ApiResponse(HttpStatus.OK.value(),
                        "Successfully reactivated " + userIds.size() + " users"));
    }
}
