package com.mady.springboot_be.config.batch;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.batch.item.ItemReader;

import com.mady.springboot_be.config.batch.BatchConfig.RowMapperUtils;

/**
 * A dynamic, read-only ItemReader that reads all records from a specified database table.
 * 
 * This reader is designed for Spring Batch jobs that need to process data from any table
 * determined at runtime. It loads the entire table content into memory once and then
 * iterates through the records one by one.
 * 
 * Key features:
 * - Dynamic table selection - table name can be set at runtime
 * - Read-only operations - no database modifications
 * - Full table loading - all records are loaded into memory on first read
 * - Follows Spring Batch convention - returns null when no more data
 * 
 * Important notes:
 * - The entire table is loaded into memory, which may be problematic for very large tables
 * - No pagination or chunking at the database level - consider for small to medium tables only
 * - Each record is returned as a Map&lt;String, Object&gt; where keys are column names
 * 
 * Usage example:
 * 
 * DynamicTableItemReader reader = new DynamicTableItemReader(dataSource);
 * reader.setTableName("users");
 * 
 * Map&lt;String, Object&gt; record;
 * while ((record = reader.read()) != null) {
 *     System.out.println("Processing: " + record);
 * }
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class DynamicTableItemReader implements ItemReader<Map<String, Object>> {

    private final DataSource dataSource;
    private String tableName;
    private int index = 0;
    private List<Map<String, Object>> data;

    /**
     * Constructs a new DynamicTableItemReader with the specified DataSource.
     * 
     * @param dataSource the DataSource used to connect to the database
     * @throws NullPointerException if dataSource is null
     */
    public DynamicTableItemReader(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Sets the name of the database table to read from.
     * 
     * <p>
     * This method must be called before the first call to {@link #read()}.
     * </p>
     * 
     * @param tableName the name of the table to read (must not be null or empty)
     */
    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    /**
     * Reads the next record from the configured database table.
     * 
     * <p>
     * On the first call, this method loads all records from the specified table
     * into an in-memory list. Subsequent calls return records one by one.
     * </p>
     * 
     * <p>
     * When all records have been read, this method returns {@code null} to signal
     * the end of input, following Spring Batch convention.
     * </p>
     * 
     * @return the next record as a Map (column name → column value), or
     *         {@code null} if no more records
     * @throws Exception                if a database access error occurs
     * @throws IllegalArgumentException if tableName has not been set or is empty
     * 
     *                                  <p>
     *                                  <strong>Example returned Map:</strong>
     *                                  </p>
     * 
     *                                  <pre>
     * {
     *     "id": 1,
     *     "username": "john_doe",
     *     "email": "john@example.com"
     * }
     *                                  </pre>
     */
    @Override
    public Map<String, Object> read() throws Exception {
        if (tableName == null || tableName.trim().isEmpty()) {
            throw new IllegalArgumentException("Table name must be specified");
        }

        if (data == null) {
            try (Connection connection = dataSource.getConnection();
                    Statement stmt = connection.createStatement();
                    ResultSet rs = stmt.executeQuery("SELECT * FROM " + tableName)) {

                data = RowMapperUtils.mapResultSetToList(rs);
            }
        }

        if (index < data.size()) {
            return data.get(index++);
        } else {
            return null; // Returns null to signal end of data (Spring Batch convention)
        }
    }
}
