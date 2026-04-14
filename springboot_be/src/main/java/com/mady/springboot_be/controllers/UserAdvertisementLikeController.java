package com.mady.springboot_be.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mady.springboot_be.dettails.ApiResponseData;
import com.mady.springboot_be.dtos.LikeStatusDto;
import com.mady.springboot_be.dtos.LikeUserDTO;
import com.mady.springboot_be.dtos.sample_dtos.LikeRequestDTO;
import com.mady.springboot_be.services_impl.UserAdvertisementLikeServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for user advertisement like management.
 * 
 * Supports toggling likes on advertisements (create/update),
 * retrieving all liked advertisements by user, and getting
 * all users who liked a specific advertisement.
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/likes")
@Tag(name = "User Advertisement Likes", description = "Endpoints for managing user likes on advertisements")
public class UserAdvertisementLikeController {

    private final UserAdvertisementLikeServiceImpl likeService;

    @Autowired
    public UserAdvertisementLikeController(UserAdvertisementLikeServiceImpl likeService) {
        this.likeService = likeService;
    }

    @Operation(summary = "Create or update a like for an advertisement")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Advertisement likes updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User or Advertisement not found")
    })
    @PutMapping("/create/update/{userId:\\d+}/{advertisementId:\\d+}")
    public ResponseEntity<ApiResponseData<Integer>> updateLikes(
            @PathVariable Long userId,
            @PathVariable Long advertisementId,
            @RequestBody LikeRequestDTO likeRequest) {
        return likeService.updateLikes(advertisementId, likeRequest, userId);
    }

    @Operation(summary = "Get all liked advertisements by user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User likes fetched"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/likes/user")
    public ResponseEntity<ApiResponseData<List<LikeStatusDto>>> getAllLikesByUser(
            @RequestParam Long userId) {
        return likeService.getAllLikesByUser(userId);
    }

    @Operation(summary = "Get all users who liked a specific advertisement")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Likes fetched"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Advertisement not found")
    })
    @GetMapping("/advertisement/{advertisementId}")
    public ResponseEntity<ApiResponseData<List<LikeUserDTO>>> getLikesByAdvertisement(
            @PathVariable Long advertisementId) {
        return likeService.getLikesByAdvertisement(advertisementId);
    }

}
