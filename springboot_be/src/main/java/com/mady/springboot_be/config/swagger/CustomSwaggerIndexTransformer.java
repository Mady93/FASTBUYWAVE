package com.mady.springboot_be.config.swagger;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springdoc.core.properties.SwaggerUiOAuthProperties;
import org.springdoc.core.providers.ObjectMapperProvider;
import org.springdoc.webmvc.ui.SwaggerIndexPageTransformer;
import org.springdoc.webmvc.ui.SwaggerWelcomeCommon;
import org.springframework.core.io.Resource;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.resource.ResourceTransformerChain;
import org.springframework.web.servlet.resource.TransformedResource;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Custom transformer for Swagger UI index page that injects custom CSS styling.
 * 
 * This transformer modifies the Swagger UI appearance to match the Fast Buy
 * Wave
 * brand identity with a midnight-blue/violet color palette and Almendra font.
 * 
 * Custom styling includes:
 * - Custom topbar with "Fast Buy Wave" branding and "DEVELOPMENT" badge
 * - Gradient buttons (authorize, execute, try-out)
 * - Midnight-blue (#0d1663) and violet (#a8a6ec) color scheme
 * - Almendra font from Google Fonts
 * - Responsive design for mobile devices (breakpoints at 768px)
 * - Custom scrollbar styling
 * - Removed Swagger logo and copy-to-clipboard buttons
 * - Custom footer with build information
 * 
 * The transformer only intercepts swagger-ui.css and appends custom CSS,
 * leaving all other resources unchanged.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class CustomSwaggerIndexTransformer extends SwaggerIndexPageTransformer {

    /**
     * Constructs the custom Swagger index transformer with required dependencies.
     * 
     * @param swaggerUiConfig          Swagger UI configuration properties
     * @param swaggerUiOAuthProperties Swagger OAuth configuration properties
     * @param swaggerWelcomeCommon     Swagger welcome page utilities
     * @param objectMapperProvider     Object mapper provider for JSON processing
     */
    public CustomSwaggerIndexTransformer(
            SwaggerUiConfigProperties swaggerUiConfig,
            SwaggerUiOAuthProperties swaggerUiOAuthProperties,
            SwaggerWelcomeCommon swaggerWelcomeCommon,
            ObjectMapperProvider objectMapperProvider) {

        super(swaggerUiConfig, swaggerUiOAuthProperties, swaggerWelcomeCommon, objectMapperProvider);
    }

    /**
     * Transforms the Swagger UI resource by injecting custom CSS.
     * 
     * Only modifies swagger-ui.css by appending custom styles.
     * All other resources are passed through unchanged.
     * 
     * @param request     the HTTP request
     * @param resource    the original resource being transformed
     * @param transformer the transformer chain
     * @return transformed resource with custom CSS appended, or original resource
     * @throws IOException if resource reading fails
     */
    @Override
    @NonNull
    public Resource transform(HttpServletRequest request,
            Resource resource,
            ResourceTransformerChain transformer)
            throws IOException {

        // Only modify swagger-ui.css
        if (resource.toString().contains("swagger-ui.css")) {
            String css = readResource(resource);
            String customCss = getCustomCss();

            String modifiedCss = css + "\n\n" + customCss;
            return new TransformedResource(resource, modifiedCss.getBytes());
        }

        return super.transform(request, resource, transformer);
    }

    private String readResource(Resource resource) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream()))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }

    /**
     * Reads the content of a resource as a String.
     * 
     * @param resource the resource to read
     * @return resource content as String
     * @throws IOException if reading fails
     */
    private String getCustomCss() {
        return """
                /* Import Almendra font */
                @import url('https://fonts.googleapis.com/css2?family=Almendra:ital,wght@0,400;0,700;1,400;1,700&display=swap');

                /* ===== FAST BUY WAVE - CUSTOM SWAGGER THEME ===== */
                /* Version: 1.0 - Compatible with Swagger UI 5.17.x */

                /* === TOPBAR === */
                .swagger-ui .topbar {
                    padding: 15px 0 !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
                    border-bottom: 3px solid #a8a6ec !important;
                    background-color: #051552;
                }

                .swagger-ui .topbar-wrapper .link {
                    font-size: 1.8rem !important;
                    font-weight: 700 !important;
                    color: white !important;
                    text-transform: uppercase !important;
                    letter-spacing: 2px !important;
                }

                .swagger-ui .topbar-wrapper .link:after {
                    content: "";
                    margin-left: 10px;
                    font-size: 1.5rem;
                }

                .swagger-ui .info .title {
                    color: #1a2744 !important;
                    font-size: 2rem !important;
                    font-weight: 700 !important;
                    border-bottom: 3px solid #a8a6ec !important;
                    padding-bottom: 20px !important;
                    margin-bottom: 20px !important;
                    font-family: 'Almendra', serif !important;
                }

                .swagger-ui .info .title small {
                    background: linear-gradient(135deg, #0d1663 0%, #837bdc 100%) !important;
                    color: white !important;
                    padding: 8px 16px !important;
                    font-size: 1rem !important;
                    margin-left: 15px !important;
                    font-weight: 600 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 1px !important;
                }

                .swagger-ui .info .base-url {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
                    padding: 12px 20px !important;
                    border-radius: 12px !important;
                    font-family: 'Courier New', monospace !important;
                    font-size: 1.1rem !important;
                    border: 1px solid #dee2e6 !important;
                }

                .swagger-ui .info .markdown code {
                    background: #f0f0f0 !important;
                    color: #333333 !important;
                    padding: 2px 6px !important;
                    border-radius: 4px !important;
                    font-size: 0.9rem !important;
                    border: 1px solid #dddddd !important;
                }

                .swagger-ui .info .markdown p {
                    color: #333333 !important;
                    line-height: 1.6 !important;
                }

                .swagger-ui .info .markdown a {
                    color: #0d1663 !important;
                    text-decoration: underline !important;
                }

                .swagger-ui .info .markdown h1,
                .swagger-ui .info .markdown h2,
                .swagger-ui .info .markdown h3,
                .swagger-ui .info .markdown h4 {
                    color: #1a2744 !important;
                }

                /* === AUTHORIZE BUTTON === */
                .swagger-ui .btn.authorize {
                    border: none !important;
                    color: white !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    box-shadow: 0 4px 15px rgba(26, 39, 68, 0.3) !important;
                    text-transform: uppercase !important;
                    letter-spacing: 1px !important;
                    font-size: 0.9rem !important;
                    background: linear-gradient(135deg, #0d1663 0%, #837bdc 100%) !important;
                    font-family: 'Almendra', serif !important;
                }

                .swagger-ui .btn.authorize:hover {
                    transform: translateY(-3px) !important;
                    box-shadow: 0 8px 25px rgba(26, 39, 68, 0.4) !important;
                    background: linear-gradient(135deg, #080f49 0%, #7069ba 100%) !important;
                }

                .swagger-ui .btn.authorize svg {
                    fill: white !important;
                    width: 20px !important;
                    height: 20px !important;
                    margin-right: 8px !important;
                }

                /* === TABLES === */
                .swagger-ui table {
                    border-collapse: separate !important;
                    border-spacing: 0 10px !important;
                }

                .swagger-ui table thead tr {
                    background: linear-gradient(135deg, #1a2744 0%, #2c3e50 100%) !important;
                    border-radius: 12px 12px 0 0 !important;
                }

                .swagger-ui table thead th {
                    border: none !important;
                    color: white !important;
                    font-weight: 600 !important;
                    padding: 15px !important;
                    font-size: 0.9rem !important;
                    text-transform: uppercase !important;
                    letter-spacing: 1px !important;
                }

                .swagger-ui table tbody tr {
                    background: white !important;
                    border-radius: 12px !important;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.05) !important;
                    transition: all 0.2s ease !important;
                }

                .swagger-ui table tbody tr:hover {
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
                }

                .swagger-ui table tbody td {
                    border: none !important;
                    padding: 15px !important;
                }

                /* === MODELS SECTION === */
                .swagger-ui section.models {
                    border: none !important;
                    border-radius: 16px !important;
                    background: white !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
                    margin-top: 40px !important;
                    overflow: hidden !important;
                }

                .swagger-ui section.models h4 {
                    padding: 20px 25px !important;
                    margin: 0 !important;
                    border-bottom: 2px solid #f1f1f1 !important;
                    color: #1a2744 !important;
                    font-weight: 700 !important;
                    font-size: 1.4rem !important;
                    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important;
                }

                .swagger-ui section.models .model-container {
                    background: white !important;
                    padding: 20px !important;
                }

                /* === BUTTONS === */
                .swagger-ui .btn {
                    padding: 10px 25px !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    text-transform: uppercase !important;
                    letter-spacing: 1px !important;
                    font-size: 0.9rem !important;
                    border: none !important;
                    margin-left: 10px;
                }

                .swagger-ui .btn.cancel {
                    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%) !important;
                    color: white !important;
                    margin-left: 10px !important;
                }

                .swagger-ui .btn.cancel:hover {
                    background: linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%) !important;
                }

                .swagger-ui .btn.download {
                    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%) !important;
                    color: white !important;
                }

                /* === CODE BLOCKS === */
                .swagger-ui .markdown code,
                .swagger-ui .renderedMarkdown code {
                    background: #f8f9fa !important;
                    color: #333333 !important;
                    border-radius: 6px !important;
                    padding: 4px 8px !important;
                    font-family: 'Fira Code', 'Cascadia Code', 'Courier New', monospace !important;
                    font-size: 0.9rem !important;
                    border: 1px solid #e9ecef !important;
                }

                .swagger-ui .highlight-code {
                    border-radius: 12px !important;
                    overflow: hidden !important;
                }

                .swagger-ui .highlight-code .lang-json {
                    background: #1e1e1e !important;
                    color: #d4d4d4 !important;
                    padding: 20px !important;
                }

                /* === SCROLLBAR STYLING === */
                .swagger-ui ::-webkit-scrollbar {
                    width: 10px !important;
                    height: 10px !important;
                }

                .swagger-ui ::-webkit-scrollbar-track {
                    background: #f1f1f1 !important;
                    border-radius: 10px !important;
                }

                .swagger-ui ::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #1a2744 0%, #2c3e50 100%) !important;
                    border-radius: 10px !important;
                }

                .swagger-ui ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #2c3e50 0%, #1a2744 100%) !important;
                }

                /* Rimuovi la firma Swagger dalla navbar */
                .swagger-ui .topbar .download-url-wrapper:after,
                .swagger-ui .topbar .link:after {
                    display: none !important;
                }

                /* Nascondi il logo SVG originale di Swagger */
                .swagger-ui .topbar .link svg {
                    display: none !important;
                }

                /* Branding + DEV MODE */
                .swagger-ui .topbar .link {
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                    font-family: 'Almendra', serif !important;
                    font-weight: 600 !important;
                    font-size: 1rem !important;
                    color: #ffffff !important;
                }

                .swagger-ui .topbar .link::before {
                    content: "Fast Buy Wave" !important;
                    display: inline-block !important;
                }

                .swagger-ui .topbar .link::after {
                    content: "•DEVELOPMENT" !important;
                    display: inline-block !important;
                    font-size: 0.6rem !important;
                    text-transform: uppercase !important;
                    color: #a8a6ec !important;
                }

                /* === RESPONSIVE DESIGN === */
                @media (max-width: 768px) {
                    .swagger-ui .info .title {
                        font-size: 2rem !important;
                    }
                }

                /* === ANIMATIONS === */
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* === FOOTER === */
                .swagger-ui .footer {
                    text-align: center;
                    padding: 30px;
                    color: #95a5a6;
                    font-size: 0.9rem;
                    border-top: 1px solid #e9ecef;
                    margin-top: 40px;
                }

                .swagger-ui .footer:after {
                    content: "Fast Buy Wave API - Built with ❤️ using Spring Boot 3.4.4";
                    display: block;
                    margin-top: 10px;
                    color: #7f8c8d;
                }

                .swagger-ui .topbar .download-url-wrapper input[type="text"] {
                    border: 2px solid #a8a6ec !important;
                    font-family: 'Almendra', serif !important;
                }

                .swagger-ui .topbar .download-url-wrapper .download-url-button {
                    background: linear-gradient(135deg, #0d1663 0%, #837bdc 100%) !important;
                    font-family: 'Almendra', serif !important;
                }

                .swagger-ui table thead tr {
                    background: linear-gradient(135deg, #0d1663 0%, #837bdc 100%) !important;
                }

                h2 {
                    color: #a8a6ec !important;
                    font-family: 'Almendra', serif !important;
                }

                h3 {
                    color: #a8a6ec !important;
                    font-family: 'Almendra', serif !important;
                }

                .swagger-ui .servers > label select {
                    background: linear-gradient(135deg, #0d1663 0%, #837bdc 100%) !important;
                    font-family: 'Almendra', serif !important;
                    color: white !important;
                    border: none!important;
                    border-radius: 5px!important;
                    padding: 0.6rem;
                }

                .swagger-ui .servers-title {
                    color: #a8a6ec !important;
                }

                .servers {
                    margin-top: 0.5rem !important;
                }

                .swagger-ui .scheme-container .schemes {
                    align-items: flex-end;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: space-between;
                    text-align: center !important;
                }

                .swagger-ui .dialog-ux .modal-ux-header {
                    border-bottom: 1px solid #a9a3ec!important;
                }

                .swagger-ui .dialog-ux .modal-ux-header h3 {
                    flex: 1;
                    font-size: 20px;
                    font-weight: 600;
                    margin: 0;
                    padding: 0 20px;
                    color: #2c1aa3 !important;
                }

                .swagger-ui .auth-btn-wrapper .btn-done {
                    margin-right: 0rem!important;
                }

                .swagger-ui .response-col_status {
                    color: #51d820!important;
                    padding: 10px!important;
                }

                .swagger-ui table thead tr td {
                    color: white!important;
                }

                .swagger-ui .opblock-body pre.microlight {
                    background: linear-gradient(135deg, #0d1663 0%, #837bdc 100%) !important;
                }

                .swagger-ui .opblock.opblock-delete {
                    background: rgba(244, 213, 213, 0.1)!important;
                }

                .swagger-ui .scheme-container {
                    box-shadow: 0 1px 2px 0 #a8a6ec;
                }

                /* ===== BOTTONE EXECUTE ===== */
                .swagger-ui .btn.execute {
                    background: linear-gradient(135deg, #0d1663, #837bdc) !important;
                    color: white !important;
                    font-size: 0.85rem !important;
                    font-weight: 700 !important;
                    padding: 6px 20px !important;
                    width: auto !important;
                    min-width: 100px !important;
                    max-width: 150px !important;
                    display: inline-block !important;
                    margin: 8px auto !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    box-shadow: 0 3px 10px rgba(13, 22, 99, 0.3) !important;
                    transition: all 0.3s ease !important;
                    float: none !important;
                    clear: both !important;
                    line-height: 1.2 !important;
                    border-radius: 5px !important;
                }

                .swagger-ui .btn.execute:hover {
                    background: linear-gradient(135deg, #051552, #7069ba) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 18px rgba(13, 22, 99, 0.4) !important;
                }

                /* ===== BOTTONE OPBLOCK CONTROL ===== */
                .swagger-ui .opblock-control__btn {
                    background: linear-gradient(135deg, #0d1663, #837bdc) !important;
                    color: white !important;
                    font-size: 0.75rem !important;
                    font-weight: 700 !important;
                    padding: 4px 12px !important;
                    width: auto !important;
                    min-width: 70px !important;
                    max-width: 100px !important;
                    display: inline-block !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    box-shadow: 0 2px 6px rgba(13, 22, 99, 0.2) !important;
                    transition: all 0.3s ease !important;
                    margin: 0 0 0 10px !important;
                    line-height: 1.2 !important;
                    float: right !important;
                    border-radius: 5px !important;
                }

                .swagger-ui .opblock-control__btn:hover {
                    background: linear-gradient(135deg, #051552, #7069ba) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 4px 12px rgba(13, 22, 99, 0.3) !important;
                }

                /* ===== BOTTONE CLEAR - BIANCO CON BORDI BLU ===== */
                .swagger-ui .btn-clear {
                    background: white !important;
                    color: #0d1663 !important;
                    font-size: 0.85rem !important;
                    font-weight: 600 !important;
                    padding: 6px 20px !important;
                    height: 36px !important;
                    line-height: 24px !important;
                    width: auto !important;
                    min-width: 100px !important;
                    max-width: 150px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    transition: all 0.3s ease !important;
                    margin: 0 2px !important;
                    border-radius: 5px !important;
                    box-shadow: 0 4px 12px rgba(13, 22, 99, 0.2) !important;
                }

                .swagger-ui .btn-clear:hover {
                    background: #f0f0f0 !important;
                    color: #051552 !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 15px rgba(13, 22, 99, 0.3) !important;
                }

                /* ===== CENTRATURA BOTTONE EXECUTE ===== */
                .swagger-ui .execute-wrapper {
                    text-align: center !important;
                    width: 100% !important;
                }

                /* ===== ALLINEAMENTO BOTTONI OPBLOCK ===== */
                .swagger-ui .opblock-summary {
                    display: flex !important;
                    align-items: center !important;
                    flex-wrap: wrap !important;
                }

                .swagger-ui .opblock-summary .view-line-link {
                    margin-left: auto !important;
                }

                /* ===== BOTTONE TRY-OUT NORMALE - BIANCO CON BORDI BLU ===== */
                .swagger-ui .btn.try-out__btn {
                    background: white !important;
                    color: #0d1663 !important;
                    font-size: 0.85rem !important;
                    font-weight: 700 !important;
                    padding: 6px 20px !important;
                    height: 36px !important;
                    line-height: 24px !important;
                    width: auto !important;
                    min-width: 100px !important;
                    max-width: 150px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    box-shadow: 0 4px 12px rgba(13, 22, 99, 0.2) !important;
                    transition: all 0.3s ease !important;
                    margin: 0 2px !important;
                    outline: none !important;
                    border-radius: 5px !important;
                }

                .swagger-ui .btn.try-out__btn:hover {
                    background: #f0f0f0 !important;
                    color: #051552 !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 15px rgba(13, 22, 99, 0.3) !important;
                }

                /* ===== BOTTONE TRY-OUT CANCEL ===== */
                .swagger-ui .btn.try-out__btn.cancel {
                    background: linear-gradient(135deg, #7f8c8d, #95a5a6) !important;
                    border: none !important;
                    color: white !important;
                    font-size: 0.85rem !important;
                    font-weight: 700 !important;
                    padding: 6px 20px !important;
                    height: 36px !important;
                    line-height: 24px !important;
                    width: auto !important;
                    min-width: 100px !important;
                    max-width: 150px !important;
                    display: inline-flex !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    box-shadow: 0 4px 12px rgba(127, 140, 141, 0.3) !important;
                    transition: all 0.3s ease !important;
                    margin: 0 2px !important;
                    outline: none !important;
                    border-radius: 5px !important;
                }

                .swagger-ui .btn.try-out__btn.cancel:hover {
                    background: linear-gradient(135deg, #6c7a7d, #8a9a9c) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 15px rgba(127, 140, 141, 0.4) !important;
                }

                /* ===== CONTENITORE BOTTONI ===== */
                .swagger-ui .try-out {
                    text-align: center !important;
                    padding: 10px 0 !important;
                    display: flex !important;
                }

                .swagger-ui .try-out .btn-group {
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    gap: 2px !important;
                    flex-wrap: wrap !important;
                    margin: 0 auto !important;
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 768px) {
                    .swagger-ui .btn.execute,
                    .swagger-ui .opblock-control__btn,
                    .swagger-ui .btn.try-out__btn,
                    .swagger-ui .btn.try-out__btn.cancel,
                    .swagger-ui .btn-clear {
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 5px 0 !important;
                    }

                    .swagger-ui .opblock-control__btn {
                        float: none !important;
                    }

                    .swagger-ui .opblock-summary {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 10px !important;
                    }

                    .swagger-ui .try-out .btn-group {
                        flex-direction: column !important;
                        gap: 10px !important;
                    }
                }

                /* ===== DISTRUGGI QUELLO SVG DI MERDA INUTILE ===== */
                    .swagger-ui .opblock .opblock-summary .view-line-link.copy-to-clipboard,
                    .swagger-ui .opblock-summary .view-line-link,
                    .swagger-ui .copy-to-clipboard {
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                        width: 0 !important;
                        height: 0 !important;
                        pointer-events: none !important;
                        position: absolute !important;
                        z-index: -9999 !important;
                    }


                """;
    }

}