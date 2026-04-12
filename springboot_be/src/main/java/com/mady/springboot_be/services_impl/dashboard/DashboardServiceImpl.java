package com.mady.springboot_be.services_impl.dashboard;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mady.springboot_be.dtos.dashboard.CategoryStatsDTO;
import com.mady.springboot_be.dtos.dashboard.DashboardStatsDTO;
import com.mady.springboot_be.dtos.dashboard.OrderStatsDTO;
import com.mady.springboot_be.dtos.dashboard.RevenueStatsDTO;
import com.mady.springboot_be.dtos.dashboard.RevenueTimelineDTO;
import com.mady.springboot_be.dtos.dashboard.TopProductDTO;
import com.mady.springboot_be.dtos.dashboard.UpcomingAppointmentDTO;
import com.mady.springboot_be.entities.Profile;
import com.mady.springboot_be.entities.contact.Appointment;
import com.mady.springboot_be.enums.OrderStatus;
import com.mady.springboot_be.repositories.CategoryRepository;
import com.mady.springboot_be.repositories.ImageRepository;
import com.mady.springboot_be.repositories.ProductRepository;
import com.mady.springboot_be.repositories.ProfileRepository;
import com.mady.springboot_be.repositories.cart_order_payment.OrderRepository;
import com.mady.springboot_be.repositories.cart_order_payment.PaymentRepository;
import com.mady.springboot_be.repositories.contact.AppointmentRepository;
import com.mady.springboot_be.services.dashboard.DashboardService;

/**
 * Implementation of DashboardService for analytics and statistics.
 * 
 * Provides business intelligence data for admin and user dashboards including:
 * - Revenue statistics with period comparison (current vs previous period)
 * - Order statistics with period comparison
 * - Top selling products with trend analysis (up/down/stable)
 * - Category sales distribution with percentage of total revenue
 * - Upcoming confirmed appointments for user dashboard
 * 
 * All queries are read-only (@Transactional(readOnly = true)).
 * Supports time periods: 7d, 30d (default), 90d, 1y.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AppointmentRepository appointmentRepository;
    private final CategoryRepository categoryRepository;
    private final ImageRepository imageRepository;
    private final ProfileRepository profileRepository;
    private static final Logger logger = LoggerFactory.getLogger(DashboardServiceImpl.class);

    /**
     * Constructs a new DashboardServiceImpl with required dependencies.
     * 
     * @param paymentRepository     repository for payment data and revenue queries
     * @param orderRepository       repository for order statistics
     * @param productRepository     repository for product data
     * @param appointmentRepository repository for appointment statistics
     * @param categoryRepository    repository for category sales data
     * @param imageRepository       repository for product images
     * @param profileRepository     repository for user profile data (names for
     *                              appointments)
     */
    @Autowired
    public DashboardServiceImpl(PaymentRepository paymentRepository, OrderRepository orderRepository,
            ProductRepository productRepository, AppointmentRepository appointmentRepository,
            CategoryRepository categoryRepository, ImageRepository imageRepository,
            ProfileRepository profileRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.appointmentRepository = appointmentRepository;
        this.categoryRepository = categoryRepository;
        this.imageRepository = imageRepository;
        this.profileRepository = profileRepository;
    }

    // ========== DASHBOARD STATS ==========

    @Override
    public DashboardStatsDTO getDashboardStats(String period) {
        logger.info("📊 Dashboard Stats - Period: {}", period);

        LocalDateTime[] range = getDateRangeFromPeriod(period);
        LocalDateTime start = range[0];
        LocalDateTime end = range[1];
        logger.info("   Range date: {} - {}", start, end);

        long daysDifference = Duration.between(start, end).toDays();

        // Revenue
        BigDecimal revenueTotal = paymentRepository.getTotalRevenueByDateRange(start, end);
        logger.info("   Revenue totale: {}", revenueTotal);

        LocalDateTime prevEnd = start.minusSeconds(1);
        LocalDateTime prevStart = prevEnd.minusDays(daysDifference);
        BigDecimal revenuePrevious = paymentRepository.getTotalRevenueByDateRange(prevStart, prevEnd);
        logger.info("Revenue previous period: {}", revenuePrevious);

        RevenueStatsDTO revenueStats = new RevenueStatsDTO(revenueTotal, revenuePrevious);

        // Orders
        Long ordersTotal = orderRepository.countByStatusAndDateRange(OrderStatus.CONFIRMED, start, end);
        Long ordersPrevious = orderRepository.countByStatusAndDateRange(OrderStatus.CONFIRMED, prevStart, prevEnd);
        logger.info("   Orders total: {}, Previous: {}", ordersTotal, ordersPrevious);

        OrderStatsDTO orderStats = new OrderStatsDTO(ordersTotal, ordersPrevious);

        // Active Products
        Long activeProducts = productRepository.countByNotDeleted();
        logger.info("   Active products: {}", activeProducts);

        // Appointments
        Long appointmentsTotal = appointmentRepository.countAppointmentsByPeriod(start, end);
        logger.info("   Total appointments: {}", appointmentsTotal);

        return new DashboardStatsDTO(revenueStats, orderStats, activeProducts.intValue(), appointmentsTotal.intValue());
    }

    /**
     * Calculates start and end dates based on period string.
     * 
     * @param period period string (7d, 30d, 90d, 1y)
     * @return array with [startDate, endDate]
     */
    private LocalDateTime[] getDateRangeFromPeriod(String period) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = switch (period) {
            case "7d" -> end.minusDays(7);
            case "30d" -> end.minusDays(30);
            case "90d" -> end.minusDays(90);
            case "1y" -> end.minusYears(1);
            default -> end.minusDays(30);
        };
        return new LocalDateTime[] { start, end };
    }

    // ========== REVENUE TIMELINE ==========

    @Override
    public RevenueTimelineDTO getRevenueTimeline(String period) {
        logger.info("💰 Revenue Timeline - Period: {}", period);

        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = calculateStartDate(period, endDate);
        logger.info("   Range date: {} - {}", startDate, endDate);

        List<Object[]> currentData = paymentRepository.getDailyRevenueStats(startDate, endDate);
        logger.info("   Sales days: {}", currentData.size());

        Map<LocalDate, RevenueTimelineDTO.DailyRevenueDTO> revenueMap = currentData.stream()
                .collect(Collectors.toMap(
                        row -> ((java.sql.Date) row[0]).toLocalDate(),
                        row -> new RevenueTimelineDTO.DailyRevenueDTO(
                                ((java.sql.Date) row[0]).toLocalDate(),
                                (BigDecimal) row[1],
                                (Long) row[2])));

        List<RevenueTimelineDTO.DailyRevenueDTO> dailyRevenues = new ArrayList<>();
        LocalDate current = startDate.toLocalDate();
        LocalDate end = endDate.toLocalDate();

        while (!current.isAfter(end)) {
            if (revenueMap.containsKey(current)) {
                dailyRevenues.add(revenueMap.get(current));
            } else {
                dailyRevenues.add(new RevenueTimelineDTO.DailyRevenueDTO(
                        current, BigDecimal.ZERO, 0L));
            }
            current = current.plusDays(1);
        }
        logger.info("   Total days in period: {}", dailyRevenues.size());

        BigDecimal currentTotal = dailyRevenues.stream()
                .map(RevenueTimelineDTO.DailyRevenueDTO::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long daysDifference = java.time.Duration.between(startDate, endDate).toDays();
        LocalDateTime previousEnd = startDate.minusSeconds(1);
        LocalDateTime previousStart = previousEnd.minusDays(daysDifference);
        BigDecimal previousTotal = paymentRepository.getTotalRevenueByDateRange(previousStart, previousEnd);
        logger.info("   Current total: {}, Previous total: {}", currentTotal, previousTotal);

        RevenueTimelineDTO.TotalsDTO totals = new RevenueTimelineDTO.TotalsDTO(currentTotal, previousTotal);
        return new RevenueTimelineDTO(dailyRevenues, totals);
    }

    // ========== TOP PRODUCTS ==========

    @Override
    public List<TopProductDTO> getTopProducts(int limit, String period) {
        logger.info("🏆 Top Products - Period: {}, Limit: {}", period, limit);

        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = calculateStartDate(period, endDate);

        List<Object[]> results = productRepository.getTopSellingProducts(startDate, endDate);
        logger.info("   Products found: {}", results.size());

        List<TopProductDTO> topProducts = results.stream()
                .limit(limit)
                .map(row -> {
                    Long productId = (Long) row[0];
                    String name = (String) row[1];
                    String categoryName = (String) row[2];
                    Long unitsSold = (Long) row[3];
                    BigDecimal revenue = (BigDecimal) row[4];

                    TopProductDTO dto = new TopProductDTO(productId, name, categoryName, unitsSold, revenue);
                    logger.debug("Product: {} - Units sold: {}, Revenue: {}", name, unitsSold, revenue);

                    // Add first product image as Base64
                    List<byte[]> images = imageRepository.findImagesByProductId(productId);
                    if (!images.isEmpty()) {
                        byte[] imageBytes = images.get(0);
                        String base64 = Base64.getEncoder().encodeToString(imageBytes);
                        String mimeType = determineImageType(imageBytes);
                        dto.setImageUrl("data:" + mimeType + ";base64," + base64);
                    }

                    // Calculate trend by comparing first and second half of period
                    long totalDays = java.time.Duration.between(startDate, endDate).toDays();
                    long halfPeriod = totalDays / 2;

                    if (halfPeriod > 0) {
                        LocalDateTime recentStart = endDate.minusDays(halfPeriod);
                        LocalDateTime previousEnd = recentStart.minusSeconds(1);
                        LocalDateTime previousStart = previousEnd.minusDays(halfPeriod);

                        Long recentSales = productRepository.getProductSalesCount(productId, recentStart, endDate);
                        Long previousSales = productRepository.getProductSalesCount(productId, previousStart,
                                previousEnd);

                        if (recentSales > previousSales) {
                            dto.setTrend("up");
                            dto.setTrendPercentage(calculatePercentageChange(recentSales, previousSales));
                        } else if (recentSales < previousSales) {
                            dto.setTrend("down");
                            dto.setTrendPercentage(calculatePercentageChange(recentSales, previousSales));
                        } else {
                            dto.setTrend("stable");
                            dto.setTrendPercentage(0.0);
                        }
                        logger.debug("Trend: {}, Variation: {}%", dto.getTrend(), dto.getTrendPercentage());
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        logger.info("   Top {} products returned", topProducts.size());
        return topProducts;
    }

    // ========== CATEGORIES STATS ==========

    @Override
    public List<CategoryStatsDTO> getCategoriesStats(String period) {
        logger.info("📁 Categories Stats - Period: {}", period);

        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = calculateStartDate(period, endDate);

        List<Object[]> results = categoryRepository.getCategorySalesStats(startDate, endDate);
        logger.info("   Categories with sales: {}", results.size());

        BigDecimal totalRevenue = results.stream()
                .map(row -> (BigDecimal) row[4])
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        logger.info("   Total revenue for all categories: {}", totalRevenue);

        List<CategoryStatsDTO> categories = results.stream().map(row -> {
            Long categoryId = (Long) row[0];
            String name = (String) row[1];
            Long productCount = (Long) row[2];
            Long orderCount = (Long) row[3];
            BigDecimal revenue = (BigDecimal) row[4];

            CategoryStatsDTO dto = new CategoryStatsDTO(categoryId, name, revenue, productCount, orderCount);

            if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                double percentage = revenue.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"))
                        .doubleValue();
                dto.setPercentageOfTotal(percentage);
                logger.debug("   Category: {} - Revenue: {} ({:.1f}%)", name, revenue, percentage);
            }
            return dto;
        }).collect(Collectors.toList());

        logger.info("   Statistics for {} categories returned", categories.size());
        return categories;
    }

    // ========== UPCOMING APPOINTMENTS ==========

    @Override
    public List<UpcomingAppointmentDTO> getUpcomingAppointments(int limit, String period, Long userId) {
        logger.info("📅 Upcoming Appointments - Period: {}, Limit: {}, UserId: {}", period, limit, userId);

        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = calculateStartDate(period, end);
        logger.info("   Range date: {} - {}", start, end);

        List<Object[]> results = appointmentRepository.getUpcomingAppointmentsByPeriodAndUser(start, end, userId);
        logger.info("   Appointments found for user {}: {}", userId, results.size());

        List<UpcomingAppointmentDTO> appointments = results.stream()
                .filter(row -> {
                    String status = (String) row[6];
                    return "CONFIRMED".equals(status);
                })
                .limit(limit)
                .map(row -> {
                    Long id = (Long) row[0];
                    LocalDateTime dateTime = (LocalDateTime) row[1];

                    // Requester details
                    String requesterEmail = (String) row[2];
                    String requesterPhone = (String) row[3];

                    // Organizer details
                    String organizerEmail = (String) row[4];
                    String organizerPhone = (String) row[5];

                    String status = (String) row[6];
                    String type = (String) row[7];
                    String productName = (String) row[8];

                    Appointment appointment = appointmentRepository.findById(id).orElse(null);

                    String requesterName = "";
                    String organizerName = "";

                    if (appointment != null) {
                        // Get requester name from profile
                        if (appointment.getRequester() != null) {
                            Optional<Profile> requesterProfileOpt = profileRepository
                                    .findByUserId(appointment.getRequester().getUserId());
                            if (requesterProfileOpt.isPresent()) {
                                Profile requesterProfile = requesterProfileOpt.get();
                                requesterName = requesterProfile.getFirstName() + " " + requesterProfile.getLastName();
                            }
                        }

                        // Get requester name from profile
                        if (appointment.getOrganizer() != null) {
                            Optional<Profile> organizerProfileOpt = profileRepository
                                    .findByUserId(appointment.getOrganizer().getUserId());
                            if (organizerProfileOpt.isPresent()) {
                                Profile organizerProfile = organizerProfileOpt.get();
                                organizerName = organizerProfile.getFirstName() + " " + organizerProfile.getLastName();
                            }
                        }
                    }

                    return new UpcomingAppointmentDTO(
                            id, dateTime,
                            requesterEmail, requesterPhone, requesterName,
                            organizerEmail, organizerName, organizerPhone,
                            productName, status, type);
                })
                .collect(Collectors.toList());

        logger.info("Returned {} CONFIRMED appointments for user {}", appointments.size(), userId);
        return appointments;
    }

    // ========== HELPER METHODS ==========

    /**
     * Calculates start date based on period string and end date.
     * 
     * @param period  period string (7d, 30d, 90d, 1y)
     * @param endDate end date for calculation
     * @return calculated start date
     */
    private LocalDateTime calculateStartDate(String period, LocalDateTime endDate) {
        return switch (period) {
            case "7d" -> endDate.minusDays(7);
            case "30d" -> endDate.minusDays(30);
            case "90d" -> endDate.minusDays(90);
            case "1y" -> endDate.minusYears(1);
            default -> endDate.minusDays(30);
        };
    }

    /**
     * Calculates percentage change between current and previous values.
     * 
     * @param current  current value
     * @param previous previous value for comparison
     * @return percentage change (positive for increase, negative for decrease)
     */
    private Double calculatePercentageChange(Long current, Long previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((current - previous) * 100.0) / previous;
    }

    /**
     * Determines MIME type of an image from its byte signature.
     * 
     * @param imageBytes the image bytes
     * @return MIME type (image/jpeg, image/png, or default image/jpeg)
     */
    private String determineImageType(byte[] imageBytes) {
        if (imageBytes.length >= 4) {
            if (imageBytes[0] == (byte) 0xFF && imageBytes[1] == (byte) 0xD8) {
                return "image/jpeg";
            }
            if (imageBytes[0] == (byte) 0x89 && imageBytes[1] == (byte) 0x50 &&
                    imageBytes[2] == (byte) 0x4E && imageBytes[3] == (byte) 0x47) {
                return "image/png";
            }
        }
        return "image/jpeg";
    }
}