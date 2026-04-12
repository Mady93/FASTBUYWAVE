package com.mady.springboot_be.controllers.batch;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for managing Spring Batch jobs.
 * 
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/batch")
@Tag(name = "Batch", description = "Endpoints for managing batch jobs")
public class BatchController {

    private final JobLauncher jobLauncher;
    private final Job genericJob;

    public BatchController(JobLauncher jobLauncher, @Qualifier("genericJob") Job genericJob) {
        this.jobLauncher = jobLauncher;
        this.genericJob = genericJob;
    }

        @Operation(summary = "Run batch job", description = "Starts a batch job for the specified table name")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Job started successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error starting job")
    })
    @PostMapping("/run/{tableName}")
    public ResponseEntity<String> runBatch(@PathVariable String tableName) {
        try {
            JobParameters jobParameters = new JobParametersBuilder()
                    .addString("tableName", tableName)
                    .addLong("time", System.currentTimeMillis())
                    .toJobParameters();

            JobExecution execution = jobLauncher.run(genericJob, jobParameters);

            return ResponseEntity.ok("Job started with ID: " + execution.getJobId());
            
        } catch (JobExecutionAlreadyRunningException | 
                 JobRestartException | 
                 JobInstanceAlreadyCompleteException | 
                 JobParametersInvalidException e) {
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Batch job error: " + e.getMessage());
        }
    }
}