package com.mady.springboot_be.config.swagger;

import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springdoc.core.properties.SwaggerUiOAuthProperties;
import org.springdoc.core.providers.ObjectMapperProvider;
import org.springdoc.webmvc.ui.SwaggerIndexTransformer;
import org.springdoc.webmvc.ui.SwaggerWelcomeCommon;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

/**
 * Swagger/OpenAPI configuration for API documentation.
 * 
 * This configuration is only active in the "dev" profile and provides:
 * - Interactive API documentation with Swagger UI
 * - JWT Bearer authentication support for testing protected endpoints
 * - Custom styling via CustomSwaggerIndexTransformer
 * - Comprehensive tech stack documentation in the API info section
 * 
 * The configuration includes:
 * - OpenAPI specification with title, version, and detailed description
 * - Security scheme for Bearer token authentication (JWT)
 * - Custom index transformer for branded Swagger UI (midnight-blue/violet theme)
 * 
 * Authentication flow documentation in Swagger UI:
 * 1. Login via /api/auth/login or /oauth2/login
 * 2. Extract token from response (cookie or body)
 * 3. Click "Authorize" button in Swagger UI
 * 4. Paste the raw token (without "Bearer " prefix)
 * 5. All protected endpoints will use this token
 * 
 * Token details:
 * - Expiration: 15 minutes
 * - Signature: ECDSA on NIST P-256 curve (ES256)
 * - Refresh endpoint: POST /api/auth/refresh
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Profile("dev")
@Configuration
public class SwaggerConfig {

     /**
     * Configures the OpenAPI specification for the application.
     * 
     * Provides:
     * - API title: "FAST BUY WAVE • API Docs"
     * - Version: v1.0.0
     * - Detailed description with tech stack table and authentication instructions
     * - Bearer authentication security scheme for JWT
     * 
     * The description includes documentation for:
     * - Backend technology stack (Spring Boot 3.4.4, MySQL 8, etc.)
     * - Authentication flow (Standard Login vs Google OAuth2)
     * - Token management (extraction, storage, refresh)
     * - Swagger UI usage instructions
     * 
     * @return configured OpenAPI instance
     */
    @Bean
public OpenAPI openAPI() {
    return new OpenAPI()
            .info(new Info()
                    .title("FAST BUY WAVE • API Docs")
                    .version("v1.0.0")
                    .description("""

<h2 align="center">Tech Stack</h2>

| **Layer**             | **Technology & Version**                         | **Purpose / Description**                                                                                       |
| --------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Backend**           | Spring Boot 3.4.4                                | Main framework for building Java applications with Spring; manages server, controllers, and services.           |
| **Auth**              | JWT, EC P-256, Google OAuth2                     | JWT for authentication and authorization; EC P-256 for secure ECDSA signatures; Google OAuth2 for social login. |
| **Realtime**          | WebSocket, STOMP                                 | Real-time bidirectional communication between client and server (e.g., live notifications, chat).               |
| **Database**          | MySQL 8, Liquibase 4.26                          | MySQL as relational database; Liquibase for versioned and automated DB schema management.                       |
| **Payments**          | Stripe 22.23.0, PayPal Checkout 2.0.0            | Digital payment integration with cards, Apple Pay, Google Pay, and PayPal.                                      |
| **Security**          | Spring Security 6, Spring Security OAuth2        | Handles authentication, authorization, API security, and JWT validation.                                        |
| **Serialization**     | Jackson Core & Databind, jackson-datatype-jsr310 | Converts Java objects to/from JSON; handles ISO date/time serialization.                                        |
| **Batch Processing**  | Spring Batch 5                                   | Scheduled batch processing (e.g., data import/export, periodic reports).                                        |
| **Web**               | Spring Web, Spring WebSocket                     | Creation of REST APIs and HTTP/WebSocket endpoints.                                                             |
| **OpenAPI / Swagger** | Springdoc OpenAPI 2.8.6                          | Automatic generation of API documentation and interactive UI.                                                   |
| **AOP & Retry**       | Spring Boot Starter AOP, Spring Retry            | Transaction management and automatic retry for failed calls.                                                    |
| **Logging**           | Log4J2 (via Spring Boot Starter)                 | Structured and configurable logging.                                                                            |
| **Mapping**           | MapStruct 1.5.5.Final                            | Automatic mapping between DTOs and Java entities.                                                               |
| **Crypto / JWT**      | Nimbus JOSE + JWT 9.37.3, BouncyCastle 1.70      | Handles JWT signing, encryption, and validation securely.                                                       |
| **Mail**              | Spring Boot Starter Mail                         | Sending automated emails from the backend.                                                                      |
| **Dev Tools**         | Spring Boot DevTools                             | Hot reload and rapid development tools.                                                                         |
| **Database Driver**   | MySQL Connector/J                                | JDBC driver for connecting to MySQL.                                                                            |

<br>
<br>
<br>

<div align="center" style="max-width: 700px; margin: auto; padding: 16px; border: 2px solid #4a90e2; border-radius: 12px; background-color: #eaf4ff;">
  <h2 style="margin-bottom: 8px;">Authentication & Access</h2>
  <p style="font-size: 16px; line-height: 1.5; margin: 8px 0;">
     <strong>Bearer token required</strong> to access all protected endpoints.
    Without it, you cannot use the API, even in development.
  </p>
  <p style="font-size: 14px; color: #333; margin: 4px 0;">
    Follow the flows below to obtain your token before calling the APIs.
  </p>
</div>

<br>

| Step                | Standard Login                              | Google OAuth2                                              |
|---------------------|---------------------------------------------|------------------------------------------------------------|
| Endpoint            | POST /api/auth/login                        | GET /oauth2/login                                          |
| Input               | { "email": "...", "password": "..." }       | Redirect to Google                                         |
| Flow                | Send credentials                            | Complete Google login                                      |
| Token Source        | Cookie (withCredentials)                  | Cookie tokens (Base64 JSON)                                |
| Token Extraction    | From cookie → stored in sessionStorage      | Decode Base64 → extract → stored in sessionStorage         |
| Storage             | sessionStorage                              | sessionStorage                                             |
| API Usage           | Authorization: Bearer <accessToken>         | Authorization: Bearer <accessToken>                        |
| Swagger Usage       | Use raw token (no Bearer)                 | Use raw token (no Bearer)                                  |
| Expiration          | 15 minutes                                  | 15 minutes                                                 |
| Refresh             | POST /api/auth/refresh (JSON body)          | POST /api/auth/refresh (JSON body)                         |
| API Calls           | Token read from sessionStorage              | Token read from sessionStorage                             |
| Logout              | Send Bearer token + clear session           | Send Bearer token + clear session                          |
| Notes               | Cookie → sessionStorage flow                | Cookie → Base64 decode → sessionStorage flow               |
"""))
            .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
            .components(new Components()
                    .addSecuritySchemes("Bearer Authentication",
                            new SecurityScheme()
                                    .name("Bearer Authentication")
                                    .type(SecurityScheme.Type.HTTP)
                                    .scheme("bearer")
                                    .bearerFormat("JWT")
.description("""
**Access Token Info**

| Field         | Instruction                                                 |
|---------------|-------------------------------------------------------------|
| accessToken| Paste the token obtained from login. Do not include Bearer. |
| Example| `eyJhbGciOiJFUzI1NiJ9...abc123`                             |
"""))
                    );
}

     /**
     * Creates a custom Swagger index transformer for branded UI styling.
     * 
     * This transformer injects custom CSS into Swagger UI to match the
     * Fast Buy Wave brand identity (midnight-blue/violet color palette,
     * Almendra font, custom buttons, responsive layout).
     * 
     * The transformer is only active when the "dev" profile is enabled.
     * 
     * @param swaggerUiConfig Swagger UI configuration properties
     * @param swaggerUiOAuthProperties Swagger OAuth configuration properties
     * @param swaggerWelcomeCommon Swagger welcome page utilities
     * @param objectMapperProvider Object mapper provider for JSON processing
     * @return custom SwaggerIndexTransformer instance
     */
    @Bean
    public SwaggerIndexTransformer swaggerIndexTransformer(
            SwaggerUiConfigProperties swaggerUiConfig,
            SwaggerUiOAuthProperties swaggerUiOAuthProperties,
            SwaggerWelcomeCommon swaggerWelcomeCommon,
            ObjectMapperProvider objectMapperProvider) {

        return new CustomSwaggerIndexTransformer(
                swaggerUiConfig,
                swaggerUiOAuthProperties,
                swaggerWelcomeCommon,
                objectMapperProvider);
    }
}