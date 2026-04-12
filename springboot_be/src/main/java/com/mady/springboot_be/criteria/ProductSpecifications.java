package com.mady.springboot_be.criteria;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.domain.Specification;

import com.mady.springboot_be.entities.Address;
import com.mady.springboot_be.entities.Advertisement;
import com.mady.springboot_be.entities.Product;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

/**
 * JPA Specifications for dynamic product filtering using Criteria API.
 * 
 * This class provides a Specification builder that dynamically constructs
 * database queries based on optional search criteria. It supports:
 * - Mandatory type filtering
 * - Optional country and city filtering (via Address join)
 * - Price range filtering (minPrice/maxPrice)
 * - Full-text search on title with tokenization (case-insensitive, punctuation
 * removed)
 * - Product condition filtering
 * - Agency status filtering
 * - Date range filtering (minDate/maxDate)
 * - Automatic filtering of active products only
 * 
 * The Specification uses LEFT JOINs to fetch related entities (Advertisement,
 * Address)
 * and prevents N+1 query problems with fetch joins.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ProductSpecifications {

        /**
         * Builds a dynamic Specification based on the provided search criteria.
         * 
         * The Specification includes:
         * - Mandatory type equality check
         * - Optional filters that are applied only when the corresponding
         * field in the criteria DTO is non-null
         * - Full-text search on title that splits the search term into words
         * and matches any of them (OR logic)
         * - Automatic filter for active products (active = true)
         * 
         * Query joins:
         * - LEFT JOIN with Advertisement (fetched eagerly)
         * - LEFT JOIN with createdBy user (fetched eagerly)
         * - LEFT JOIN with Address for location filtering
         * 
         * @param criteria the search criteria containing mandatory and optional filters
         * @return a Specification that can be used with JPA Repository
         */
        public static Specification<Product> withFilters(ProductSearchCriteriaDTO criteria) {
                return (root, query, cb) -> {
                        root.fetch("advertisement", JoinType.LEFT).fetch("createdBy", JoinType.LEFT);
                        Join<Product, Advertisement> adJoin = root.join("advertisement", JoinType.LEFT);
                        Join<Product, Address> addressJoin = root.join("address", JoinType.LEFT);

                        List<Predicate> predicates = new ArrayList<>();

                        // Mandatory: product type
                        predicates.add(cb.equal(adJoin.get("type"), criteria.getType()));

                        // Optional filters
                        Optional.ofNullable(criteria.getCountry())
                                        .ifPresent(country -> predicates
                                                        .add(cb.equal(addressJoin.get("country"), country)));

                        Optional.ofNullable(criteria.getCity())
                                        .ifPresent(city -> predicates.add(cb.equal(addressJoin.get("city"), city)));

                        Optional.ofNullable(criteria.getMinPrice())
                                        .ifPresent(min -> predicates
                                                        .add(cb.greaterThanOrEqualTo(root.get("price"), min)));

                        Optional.ofNullable(criteria.getMaxPrice())
                                        .ifPresent(max -> predicates.add(cb.lessThanOrEqualTo(root.get("price"), max)));

                        // Full-text search on title with word tokenization, case-insensitive,
                        // without punctuation
                        Optional.ofNullable(criteria.getTitle()).ifPresent(title -> {
                                String[] words = title.trim()
                                                .toLowerCase()
                                                .replaceAll("[^a-z0-9 ]", "") // removes punctuation
                                                .split("\\s+");
                                List<Predicate> wordPredicates = new ArrayList<>();
                                for (String word : words) {
                                        if (!word.isEmpty()) {
                                                wordPredicates.add(cb.like(cb.lower(adJoin.get("title")),
                                                                "%" + word + "%"));
                                        }
                                }
                                if (!wordPredicates.isEmpty()) {
                                        Predicate[] wordPredArray = new Predicate[wordPredicates.size()];
                                        predicates.add(cb.or(wordPredicates.toArray(wordPredArray)));
                                }
                        });

                        Optional.ofNullable(criteria.getCondition())
                                        .ifPresent(cond -> predicates.add(cb.equal(root.get("condition"), cond)));

                        Optional.ofNullable(criteria.getAgency())
                                        .ifPresent(agency -> predicates.add(cb.equal(adJoin.get("agency"), agency)));

                        Optional.ofNullable(criteria.getMinDate())
                                        .ifPresent(minDate -> predicates.add(cb.greaterThanOrEqualTo(
                                                        adJoin.get("createdAt"), minDate.atStartOfDay())));

                        Optional.ofNullable(criteria.getMaxDate())
                                        .ifPresent(maxDate -> predicates.add(cb.lessThanOrEqualTo(
                                                        adJoin.get("createdAt"), maxDate.atTime(23, 59, 59))));

                        // Only active products
                        predicates.add(cb.isTrue(root.get("active")));

                        Predicate[] predicatesArray = new Predicate[predicates.size()];
                        return cb.and(predicates.toArray(predicatesArray));
                };
        }
}
