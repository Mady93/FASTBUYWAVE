package com.mady.springboot_be.utils;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

/**
 * Utility class for manual pagination of in-memory lists.
 * 
 * Converts a List of items into a Spring Data Page object,
 * useful when pagination cannot be performed at the database level.
 * 
 * The method adjusts Spring's zero-based page numbers (0, 1, 2...)
 * to work with one-based page numbers from frontend requests.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public final class PaginationUtils {

    /**
     * Private constructor to prevent instantiation.
     * This is a utility class with only static methods.
     */
    private PaginationUtils() {
    }

    /**
     * Paginates an in-memory list of items.
     * 
     * Converts a List of items into a Page object with the specified pagination
     * parameters.
     * The method adjusts the page number to be zero-based for Spring compatibility.
     * 
     * @param <T>      the type of items in the list
     * @param items    the list of items to paginate
     * @param pageable the pagination parameters (page number, page size)
     * @return a Page containing the paginated items and total count
     */
    public static <T> Page<T> paginateList(List<T> items, Pageable pageable) {
        // Adjust page number from one-based (frontend) to zero-based (Spring)
        int adjustedPageNumber = pageable.getPageNumber() - 1;
        if (adjustedPageNumber < 0) {
            adjustedPageNumber = 0; // Assicurati che non vada mai sotto 0
        }

        // Create a new Pageable with the correct zero-based page number
        Pageable adjustedPageable = PageRequest.of(adjustedPageNumber, pageable.getPageSize());

        // Calculate total number of items
        long totalItems = items.size();

        // Calculate start and end indices for pagination
        int start = (int) adjustedPageable.getOffset();
        int end = Math.min((start + adjustedPageable.getPageSize()), items.size());

        // Get the sublist of items for the current page
        List<T> paginatedItems = items.subList(start, end);

        // Return the page with paginated items and total count
        return new PageImpl<>(paginatedItems, adjustedPageable, totalItems);
    }
}