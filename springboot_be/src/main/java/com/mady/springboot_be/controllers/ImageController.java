package com.mady.springboot_be.controllers;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.entities.Image;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.services.ImageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for image management operations.
 * 
 * Supports CRUD operations on product images with pagination,
 * soft delete, and bulk updates. Images are associated with products
 * and support automatic recursive soft delete propagation.
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/image")
@Tag(name = "Images", description = "Endpoints for managing product images")
public class ImageController {

    private final ImageService imageService;

    @Autowired
    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @Operation(summary = "Count active images")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Count successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No images found")
    })
    @GetMapping(path = "/count")
    public ResponseEntity<Integer> countImages() {
        try {
            Long count = imageService.countImagesNotDeleted();
            return new ResponseEntity<>(count.intValue(), HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }
    }

    @Operation(summary = "Get paginated list of active images")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Images retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No images found")
    })
    @GetMapping(path = "/get")
    public ResponseEntity<Page<Image>> getImages(@RequestParam Pageable pageable) {
        Page<Image> images = imageService.getImagesNotDeleted(pageable);
        return ResponseEntity.ok(images);
    }

    @Operation(summary = "Count deleted images")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Count successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No deleted images found")
    })
    @GetMapping(path = "/countDeleted")
    public ResponseEntity<Integer> countImagesDeleted() {
        try {
            Long count = imageService.countImagesDeleted();
            return new ResponseEntity<>(count.intValue(), HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }
    }

    @Operation(summary = "Get paginated list of deleted images")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Deleted images retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No deleted images found")
    })
    @GetMapping(path = "/getDeleted")
    public ResponseEntity<Page<Image>> getImagesDeleted(@RequestParam Pageable pageable) {
        Page<Image> images = imageService.getImagesDeleted(pageable);
        return ResponseEntity.ok(images);
    }

    @Operation(summary = "Get all active images as list")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Images retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No images found")
    })
    @GetMapping(path = "/getListImage")
    public ResponseEntity<List<Image>> getImagesList() {
        try {
            List<Image> images = imageService.getImageList();
            return new ResponseEntity<>(images, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }
    }

    @Operation(summary = "Get active images by product ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Images retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No images found for this product")
    })
    @GetMapping(path = "/getListImage/active/{productId}")
    public ResponseEntity<List<Image>> getImagesListActiveByProductId(@PathVariable Long productId) {
        try {
            List<Image> images = this.imageService.getActiveImageListByProductId(productId);
            return new ResponseEntity<>(images, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }
    }

    @Operation(summary = "Get inactive images by product ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Images retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No inactive images found for this product")
    })
    @GetMapping(path = "/getListImage/not/active/{productId}")
    public ResponseEntity<List<Image>> getImagesListNotActiveByProductId(@PathVariable Long productId) {
        try {
            List<Image> images = this.imageService.getNotActiveImageListByProductId(productId);
            return new ResponseEntity<>(images, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }
    }

    @Operation(summary = "Upload images for a product")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Images uploaded successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error processing images")
    })
    @PostMapping(path = "/add", consumes = "multipart/form-data")
    public ResponseEntity<Object> uploadImage(@PathVariable Long immId, @RequestParam("files") MultipartFile[] files) {
        try {
            List<Long> ids = imageService.uploadImages(immId, files);
            return ResponseEntity.status(HttpStatus.OK).body(ids);
        } catch (ResourceNotFoundException | IOException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @Operation(summary = "Get image by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Image found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Image not found")
    })
    @GetMapping(path = "/{id}/one")
    public ResponseEntity<Image> getImageById(@PathVariable Long id) {
        try {
            Image image = imageService.getImageById(id);
            return ResponseEntity.ok().body(image);
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }
    }

    @Operation(summary = "Update multiple images")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Images updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Number of files and ids mismatch"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "One or more images not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error processing images")
    })
    @PutMapping(path = "/update", consumes = "multipart/form-data")
    public ResponseEntity<Object> putImage(@RequestParam("files") MultipartFile[] files,
            @RequestParam("ids") String ids) {
        try {
            String message = imageService.updateImages(files, ids);
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(HttpStatus.OK.value(), message));
        } catch (ResourceNotFoundException | IOException | IllegalArgumentException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @Operation(summary = "Soft delete an image by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Image deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Image not found")
    })
    @DeleteMapping(path = "/{immagineId}/delete")
    public ResponseEntity<Object> deleteImage(@PathVariable Long immagineId) {
        try {
            imageService.deleteImage(immagineId);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(new ApiResponse(HttpStatus.OK.value(), "Image deleted successfully"));
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }
    }

    @Operation(summary = "Soft delete all images")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "All images deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No images found to delete")
    })
    @DeleteMapping(path = "/deleteAll")
    public ResponseEntity<ApiResponse> deleteAllImages() {
        try {
            imageService.deleteAllImages();
            return ResponseEntity.status(HttpStatus.OK)
                    .body(new ApiResponse(HttpStatus.OK.value(), "All images deleted successfully"));
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }
    }
}