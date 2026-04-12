package com.mady.springboot_be.config.batch;

import org.springframework.batch.core.*;
import org.springframework.batch.core.configuration.annotation.*;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.item.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.batch.core.step.builder.StepBuilder;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Configuration class for Spring Batch processing.
 * 
 * This configuration provides a generic, read-only batch processing infrastructure
 * that can dynamically process any database table specified at runtime via job parameters.
 * The batch operates in read-only mode, logging processed records without modifying
 * the database.
 * 
 * Key features:
 * - Dynamic table selection via job parameters
 * - Chunk-oriented processing (10 records per chunk)
 * - Read-only operations - no database modifications
 * - Configurable processing and logging pipeline
 * 
 * Usage example:
 * 
 * JobParameters params = new JobParametersBuilder()
 *     .addString("tableName", "users")
 *     .toJobParameters();
 * jobLauncher.run(genericJob, params);
 * 
 * @author Popa Madalina Mariana
 * @version 1.0
 * @since Spring Boot 3.4.4 / Java 21
 */
@Configuration
@EnableBatchProcessing
public class BatchConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;

         /**
     * Constructs a BatchConfig with required dependencies.
     * 
     * @param jobRepository the repository for persisting batch job metadata
     * @param transactionManager the transaction manager for step execution
     */
    public BatchConfig(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        this.jobRepository = jobRepository;
        this.transactionManager = transactionManager;
    }

        /**
     * Creates a generic read-only batch job.
     * 
     * <p>The job consists of a single step ({@code genericStep}) that performs
     * the actual processing. The job name is set to {@code "genericReadOnlyJob"}.</p>
     * 
     * @param genericStep the step to be executed as part of this job
     * @return a configured Job instance
     */
    @Bean
    public Job genericJob(Step genericStep) {
        return new JobBuilder("genericReadOnlyJob", jobRepository)
                .start(genericStep)
                .build();
    }

    /**
     * Creates a generic processing step with chunk-oriented execution.
     * 
     * <p>The step processes data in chunks of 10 records. For each chunk:</p>
     * <ol>
     *   <li>A reader fetches records from the configured database table</li>
     *   <li>A processor transforms/validates each record</li>
     *   <li>A writer logs the processed records (no database writes)</li>
     * </ol>
     * 
     * @param reader the item reader that fetches data from the database
     * @param processor the item processor that transforms each record
     * @param writer the item writer that handles processed records (read-only logging)
     * @return a configured Step instance
     */
    @Bean
    public Step genericStep(ItemReader<Map<String, Object>> reader,
                          ItemProcessor<Map<String, Object>, Map<String, Object>> processor,
                          ItemWriter<Map<String, Object>> writer) {
        return new StepBuilder("genericReadOnlyStep", jobRepository)
                .<Map<String, Object>, Map<String, Object>>chunk(10, transactionManager)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }

    /**
     * Creates a dynamic item reader for the specified database table.
     * 
     * <p>This bean is step-scoped, meaning a new instance is created for each
     * step execution. The target table name is provided as a job parameter
     * named {@code tableName}.</p>
     * 
     * <p><strong>Required job parameter:</strong></p>
     * <ul>
     *   <li>{@code tableName} - the name of the database table to read from</li>
     * </ul>
     * 
     * @param dataSource the data source for database connections
     * @param tableName the name of the table to read (injected from job parameters)
     * @return an ItemReader that dynamically reads from the specified table
     * @throws IllegalStateException if tableName is null or empty
     */
    @Bean
    @StepScope
    public ItemReader<Map<String, Object>> reader(
            DataSource dataSource,
            @Value("#{jobParameters['tableName']}") String tableName) {
        
        DynamicTableItemReader reader = new DynamicTableItemReader(dataSource);
        reader.setTableName(tableName);
        return reader;
    }

    /**
     * Creates a processor for transforming batch records.
     * 
     * <p>The current implementation simply logs each record without modifications.
     * Override or extend this method to add custom business logic.</p>
     * 
     * <p><strong>Example custom implementation:</strong></p>
     * <pre>
     * &#64;Bean
     * public ItemProcessor&lt;Map&lt;String, Object&gt;, Map&lt;String, Object&gt;&gt; processor() {
     *     return item -> {
     *         // Add validation logic
     *         // Transform data as needed
     *         return item;
     *     };
     * }
     * </pre>
     * 
     * @return an ItemProcessor that processes each record (default: logging only)
     */
    @Bean
    public ItemProcessor<Map<String, Object>, Map<String, Object>> processor() {
        return item -> {
             // Read-only processing logic
            System.out.println("Processing record: " + item);
            // Add transformation logic here without DB modifications
            return item;
        };
    }

    /**
     * Creates a read-only writer for batch records.
     * 
     * <p>This writer does NOT modify the database. Instead, it logs the
     * processed records and provides execution statistics. This ensures
     * the batch operates in safe read-only mode.</p>
     * 
     * @return an ItemWriter that logs records (no database writes)
     */
    @Bean
    public ItemWriter<Map<String, Object>> writer() {
        return items -> {
            // Read-only processing logic
            for (Map<String, Object> item : items) {
                System.out.println("Would write record: " + item);
                // Add transformation logic here without DB modifications
            }
            System.out.println("Processed " + items.size() + " records (read-only mode)");
        };
    }

    /**
     * Utility class for mapping JDBC ResultSet data to List of Maps.
     * 
     * <p>This helper class provides common database operations for converting
     * ResultSet objects into a more flexible Map-based structure, making it
     * easier to work with dynamic table schemas.</p>
     */
    public static class RowMapperUtils {

        /**
         * Converts a JDBC ResultSet to a List of Maps.
         * 
         * <p>Each row in the ResultSet becomes a Map where:</p>
         * <ul>
         *   <li><strong>Key:</strong> Column name (String)</li>
         *   <li><strong>Value:</strong> Column value (Object)</li>
         * </ul>
         * 
         * @param rs the ResultSet to map (must be positioned before the first row)
         * @return a List of Maps, each Map representing one row of data
         * @throws SQLException if a database access error occurs
         * 
         * <p><strong>Example:</strong></p>
         * <pre>
         * List&lt;Map&lt;String, Object&gt;&gt; rows = RowMapperUtils.mapResultSetToList(resultSet);
         * for (Map&lt;String, Object&gt; row : rows) {
         *     System.out.println(row.get("username"));
         * }
         * </pre>
         */
        public static List<Map<String, Object>> mapResultSetToList(ResultSet rs) throws SQLException {
            var resultList = new ArrayList<Map<String, Object>>();
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();

            while (rs.next()) {
                var row = new HashMap<String, Object>();
                for (int i = 1; i <= columnCount; i++) {
                    row.put(metaData.getColumnName(i), rs.getObject(i));
                }
                resultList.add(row);
            }
            return resultList;
        }
    }
}
