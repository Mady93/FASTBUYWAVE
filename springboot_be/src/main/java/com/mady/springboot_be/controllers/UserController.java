package com.mady.springboot_be.controllers;

import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.dtos.UserDTO;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.services.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for user management operations.
 * 
 * Supports CRUD operations on users, pagination, soft delete,
 * reactivation, and role-based access control (USER/ADMIN).
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/user")
@Tag(name = "User", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Get user by email")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/email")
    public ResponseEntity<UserDTO> getUserByEmail(@RequestParam String email) {
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Get total active users count")
    @GetMapping("/count")
    public ResponseEntity<Integer> countUsers() throws ResourceNotFoundException {
        int count = userService.countUsers();
        return ResponseEntity.ok(count);
    }

    @Operation(summary = "Get paginated active users")
    @GetMapping("/all")
    public ResponseEntity<Page<UserDTO>> getUsers(Pageable pageable) throws ResourceNotFoundException {
        Page<UserDTO> users = userService.getUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Get deleted users count")
    @GetMapping("/count-deleted")
    public ResponseEntity<Integer> countDeletedUsers() throws ResourceNotFoundException {
        int count = userService.countDeletedUsers();
        return ResponseEntity.ok(count);
    }

    @Operation(summary = "Get paginated deleted users")
    @GetMapping("/deleted")
    public ResponseEntity<Page<UserDTO>> getDeletedUsers(Pageable pageable) throws ResourceNotFoundException {
        Page<UserDTO> users = userService.getDeletedUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Get user by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/get/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) throws ResourceNotFoundException {
        UserDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Update user by ID")
    @PutMapping("/update/{userId}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long userId, @RequestBody UserDTO user)
            throws ResourceNotFoundException {
        UserDTO updatedUser = userService.updateUser(userId, user);
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Delete user by ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<Object> deleteUser(@PathVariable Long userId)
            throws ResourceNotFoundException, IllegalArgumentException, AccessDeniedException {
        return userService.deleteUser(userId);
    }

    @Operation(summary = "Delete all non-ADMIN users")
    @DeleteMapping("delete/all")
    public ResponseEntity<ApiResponse> deleteUsers()
            throws IllegalArgumentException, RuntimeException {
        return userService.deleteUsers();
    }

    @Operation(summary = "Reactivate all inactive users")
    @PutMapping("/reactivate/all")
    public ResponseEntity<ApiResponse> reactivateAllUsers() throws IllegalArgumentException, RuntimeException {
        return userService.reactivateAllUsers();
    }

    @Operation(summary = "Get all active users as list")
    @GetMapping("/list/active")
    public ResponseEntity<List<UserDTO>> getAllActiveUsers() throws ResourceNotFoundException {
        List<UserDTO> users = userService.getAllActiveUsers();
        return ResponseEntity.ok(users);
    }

}
