package com.mady.springboot_be.services_impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mady.springboot_be.entities.Image;
import com.mady.springboot_be.entities.Product;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.ImageRepository;
import com.mady.springboot_be.repositories.ProductRepository;
import com.mady.springboot_be.services.ImageService;
import com.mady.springboot_be.utils.PaginationUtils;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

/**
 * Implementation of ImageService for image management.
 * 
 * Handles:
 * - Counting active/deleted images
 * - Retrieving images with pagination
 * - Uploading images for products (with bidirectional relationship management)
 * - Updating existing images
 * - Soft deleting images (single or all)
 * - Retrieving images by product ID
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class ImageServiceImpl implements ImageService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ImageRepository imageRepository;
    private final ProductRepository productRepository;

    private static final Logger logger = LoggerFactory.getLogger(ImageServiceImpl.class);

    /**
     * Constructs a new ImageServiceImpl with required dependencies.
     * 
     * @param imageRepository   repository for Image entity operations
     * @param productRepository repository for Product entity operations
     */
    @Autowired
    public ImageServiceImpl(ImageRepository imageRepository, ProductRepository productRepository) {
        this.imageRepository = imageRepository;
        this.productRepository = productRepository;
    }

    @Override
    public Long countImagesNotDeleted() throws ResourceNotFoundException {
        Long count = imageRepository.countByNotDeleted();
        if (count == 0) {
            throw new ResourceNotFoundException("No images found in the database");
        }
        return count;
    }

    @Override
    public Page<Image> getImagesNotDeleted(Pageable pageable) throws ResourceNotFoundException {
        List<Image> allImages = imageRepository.findByNotDeletedList();
        if (allImages.isEmpty()) {
            throw new ResourceNotFoundException("No images found in the database");
        }
        return PaginationUtils.paginateList(allImages, pageable);
    }

    @Override
    public Long countImagesDeleted() throws ResourceNotFoundException {
        Long count = imageRepository.countByDeleted();
        if (count == 0) {
            throw new ResourceNotFoundException("No deleted images found in the database");
        }
        return count;
    }

    @Override
    public Page<Image> getImagesDeleted(Pageable pageable) throws ResourceNotFoundException {
        List<Image> allImages = imageRepository.findByDeletedList();
        if (allImages.isEmpty()) {
            throw new ResourceNotFoundException("No images found in the database");
        }
        return PaginationUtils.paginateList(allImages, pageable);
    }

    @Override
    public List<Image> getImageList() throws ResourceNotFoundException {
        List<Image> images = imageRepository.findByNotDeletedList();
        if (!images.isEmpty()) {
            return images;
        } else {
            throw new ResourceNotFoundException("No images found in the database");
        }
    }

    @Override
    public List<Image> getActiveImageListByProductId(Long productId) throws ResourceNotFoundException {
        List<Image> images = imageRepository.findByProductIdActiveTrue(productId);
        if (!images.isEmpty()) {
            return images;
        } else {
            throw new ResourceNotFoundException("No images found in the database");
        }
    }

    @Override
    public List<Image> getNotActiveImageListByProductId(Long productId) throws ResourceNotFoundException {
        List<Image> images = imageRepository.findByProductIdActiveFalse(productId);
        if (!images.isEmpty()) {
            return images;
        } else {
            throw new ResourceNotFoundException("No images found in the database");
        }
    }

    @Transactional
    @Override
    public List<Long> uploadImages(Long productId, MultipartFile[] files)
            throws ResourceNotFoundException, IOException {
        logger.info("Uploading {} images for product ID: {}", files.length, productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<Long> savedImageIds = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                // Create image without triggering circular reference
                Image img = new Image();
                img.setPicByte(file.getBytes());
                img.setActive(true);
                img.setProduct(product); // Use internal setter to avoid loops

                // Save image first
                Image savedImage = imageRepository.save(img);
                savedImageIds.add(savedImage.getImageId());

                // Then add to product's collection
                if (!product.getImages().contains(savedImage)) {
                    product.getImages().add(savedImage);
                }
            }
        }

        // Save product with updated images collection
        productRepository.save(product);

        logger.info("Uploaded {} images for product ID: {}", savedImageIds.size(), productId);

        return savedImageIds;
    }

    @Override
    public Image getImageById(Long id) throws ResourceNotFoundException {
        Optional<Image> optional = imageRepository.findById(id);
        return optional.orElseThrow(() -> new ResourceNotFoundException("Image not found"));
    }

    @Override
    public String updateImages(MultipartFile[] files, String ids) throws ResourceNotFoundException, IOException {

        logger.info("Updating {} images", files.length);

        String[] ids_ = ids.split(",");
        if (ids_.length != files.length) {
            throw new IllegalArgumentException("Number of files and ids mismatch");
        }

        List<Image> imgs = new ArrayList<>();
        for (String id : ids_) {
            Long idx = Long.valueOf(id);
            Optional<Image> optional = imageRepository.findByIdByNotDeleted(idx);
            optional.ifPresentOrElse(imgs::add, () -> {
                throw new ResourceNotFoundException("Image with ID " + id + " not found");
            });
        }

        int cnt = 0;
        for (Image img : imgs) {
            img.setPicByte(files[cnt++].getBytes());
            imageRepository.save(img);
        }
        return "Images updated successfully";
    }

    @Override
    public void deleteImage(Long imgId) throws ResourceNotFoundException {

        logger.info("Deleting image ID: {}", imgId);

        Optional<Image> optional = imageRepository.findByIdByNotDeleted(imgId);
        if (optional.isPresent()) {
            this.deleteImageEm(imgId);
        } else {
            throw new ResourceNotFoundException("Image not found");
        }
        logger.debug("Image soft deleted: {}", imgId);
    }

    @Override
    public void deleteAllImages() throws ResourceNotFoundException {

        logger.info("Deleting all images");

        List<Image> list = imageRepository.findByNotDeletedList();
        if (!list.isEmpty()) {
            this.deleteAllImagesEm();
        } else {
            throw new ResourceNotFoundException("No images found to delete");
        }

        logger.debug("All images soft deleted");
    }

    /**
     * Soft deletes a single image using direct entity manager update.
     * 
     * Sets the active flag of the image to false via JPQL query.
     * This method is called by deleteImage() after validation.
     * 
     * @param imgId the ID of the image to delete
     */
    @Transactional
    public void deleteImageEm(Long imgId) {

        entityManager.createQuery("UPDATE Image i SET i.active = false WHERE i.id = :imgId")
                .setParameter("immagineId", imgId)
                .executeUpdate();
    }

    /**
     * Soft deletes all images using direct entity manager update.
     */
    @Transactional
    public void deleteAllImagesEm() {
        entityManager.createQuery("UPDATE Immagine i SET i.active = false")
                .executeUpdate();
    }
}