```mermaid
graph TD

%% -- Controllers --
AddressController["AddressController"]:::controller
AdvertisementController["AdvertisementController"]:::controller
AppointmentController["AppointmentController"]:::controller
AppointmentProposalController["AppointmentProposalController"]:::controller
AuthController["AuthController"]:::controller
BatchController["BatchController"]:::controller
CartController["CartController"]:::controller
CategoryController["CategoryController"]:::controller
CommentController["CommentController"]:::controller
ContactRequestController["ContactRequestController"]:::controller
DashboardController["DashboardController"]:::controller
GoogleAuthController["GoogleAuthController"]:::controller
ImageController["ImageController"]:::controller
OrderController["OrderController"]:::controller
PaymentController["PaymentController"]:::controller
ProductController["ProductController"]:::controller
ProfilesController["ProfilesController"]:::controller
UserAdvertisementLikeController["UserAdvertisementLikeController"]:::controller
UserController["UserController"]:::controller

%% -- Services (interfaces) --
AddressService["AddressService"]:::service
AdvertisementService["AdvertisementService"]:::service
AppointmentProposalService["AppointmentProposalService"]:::service
AppointmentService["AppointmentService"]:::service
CartService["CartService"]:::service
CategoryService["CategoryService"]:::service
CommentService["CommentService"]:::service
ContactRequestService["ContactRequestService"]:::service
DashboardService["DashboardService"]:::service
EmailService["EmailService"]:::service
ImageService["ImageService"]:::service
JwtService["JwtService"]:::service
OrderService["OrderService"]:::service
PaymentService["PaymentService"]:::service
ProductService["ProductService"]:::service
ProductStockService["ProductStockService"]:::service
ProfileService["ProfileService"]:::service
RefreshTokenService["RefreshTokenService"]:::service
UserAdvertisementLikeService["UserAdvertisementLikeService"]:::service
UserService["UserService"]:::service
WebSocketCommentService["WebSocketCommentService"]:::service

%% -- Service Implementations --
AddressServiceImpl["AddressServiceImpl"]:::service_impl
AdvertisementServiceImpl["AdvertisementServiceImpl"]:::service_impl
AllMappingService["AllMappingService"]:::service_impl
AppointmentProposalServiceImpl["AppointmentProposalServiceImpl"]:::service_impl
AppointmentServiceImpl["AppointmentServiceImpl"]:::service_impl
CartServiceImpl["CartServiceImpl"]:::service_impl
CategoryServiceImpl["CategoryServiceImpl"]:::service_impl
CommentServiceImpl["CommentServiceImpl"]:::service_impl
ContactRequestServiceImpl["ContactRequestServiceImpl"]:::service_impl
DashboardServiceImpl["DashboardServiceImpl"]:::service_impl
EmailServiceImpl["EmailServiceImpl"]:::service_impl
ImageServiceImpl["ImageServiceImpl"]:::service_impl
JwtServiceImpl["JwtServiceImpl"]:::service_impl
OrderServiceImpl["OrderServiceImpl"]:::service_impl
PaymentServiceImpl["PaymentServiceImpl"]:::service_impl
ProductServiceImpl["ProductServiceImpl"]:::service_impl
ProfileServiceImpl["ProfileServiceImpl"]:::service_impl
RefreshTokenServiceImpl["RefreshTokenServiceImpl"]:::service_impl
UserAdvertisementLikeServiceImpl["UserAdvertisementLikeServiceImpl"]:::service_impl
UserServiceImpl["UserServiceImpl"]:::service_impl
WebSocketCommentServiceImpl["WebSocketCommentServiceImpl"]:::service_impl

%% -- Repositories --
AddressRepository["AddressRepository"]:::repository
AdvertisementRepository["AdvertisementRepository"]:::repository
AppointmentProposalRepository["AppointmentProposalRepository"]:::repository
AppointmentRepository["AppointmentRepository"]:::repository
CartItemRepository["CartItemRepository"]:::repository
CartRepository["CartRepository"]:::repository
CategoryRepository["CategoryRepository"]:::repository
CommentRepository["CommentRepository"]:::repository
ContactRequestRepository["ContactRequestRepository"]:::repository
ImageRepository["ImageRepository"]:::repository
OrderItemRepository["OrderItemRepository"]:::repository
OrderRepository["OrderRepository"]:::repository
PaymentRepository["PaymentRepository"]:::repository
ProductRepository["ProductRepository"]:::repository
ProfileRepository["ProfileRepository"]:::repository
RefreshTokenRepository["RefreshTokenRepository"]:::repository
UserAdvertisementLikeRepository["UserAdvertisementLikeRepository"]:::repository
UserRepository["UserRepository"]:::repository

%% -- Entities --
Address["Address"]:::entity
Advertisement["Advertisement"]:::entity
Appointment["Appointment"]:::entity
AppointmentProposal["AppointmentProposal"]:::entity
Cart["Cart"]:::entity
CartItem["CartItem"]:::entity
Category["Category"]:::entity
Comment["Comment"]:::entity
ContactRequest["ContactRequest"]:::entity
Image["Image"]:::entity
Order["Order"]:::entity
OrderItem["OrderItem"]:::entity
Payment["Payment"]:::entity
Product["Product"]:::entity
Profile["Profile"]:::entity
RefreshToken["RefreshToken"]:::entity
User["User"]:::entity
UserAdvertisementLike["UserAdvertisementLike"]:::entity

%% -- Enums --
AppointmentStatus["AppointmentStatus"]:::enum
ContactMethod["ContactMethod"]:::enum
LocationType["LocationType"]:::enum
OrderStatus["OrderStatus"]:::enum
PaymentMethod["PaymentMethod"]:::enum
PaymentStatus["PaymentStatus"]:::enum
ProposalStatus["ProposalStatus"]:::enum
RequestStatus["RequestStatus"]:::enum

%% -- DTOs --
AddToCartRequestDTO["AddToCartRequestDTO"]:::dto
AddressDTO["AddressDTO"]:::dto
AdvertisementCompleteDto["AdvertisementCompleteDto"]:::dto
AdvertisementDTO["AdvertisementDTO"]:::dto
ApiResponse["ApiResponse"]:::dto
ApiResponseData["ApiResponseData"]:::dto
AppointmentDTO["AppointmentDTO"]:::dto
AppointmentProposalDTO["AppointmentProposalDTO"]:::dto
CartDTO["CartDTO"]:::dto
CartItemDTO["CartItemDTO"]:::dto
CartResponseDTO["CartResponseDTO"]:::dto
CategoryDTO["CategoryDTO"]:::dto
CategorySampleDTO["CategorySampleDTO"]:::dto
CategorySimpleDto["CategorySimpleDto"]:::dto
CategoryStatsDTO["CategoryStatsDTO"]:::dto
CategoryWithPathDto["CategoryWithPathDto"]:::dto
CommentStatisticsDTO["CommentStatisticsDTO"]:::dto
CommentTreeDTO["CommentTreeDTO"]:::dto
ContactRequestDTO["ContactRequestDTO"]:::dto
CreateOrderRequestDTO["CreateOrderRequestDTO"]:::dto
DashboardStatsDTO["DashboardStatsDTO"]:::dto
ImageCompleteDto["ImageCompleteDto"]:::dto
ImageDTO["ImageDTO"]:::dto
InitiatePaymentRequestDTO["InitiatePaymentRequestDTO"]:::dto
LikeRequestDTO["LikeRequestDTO"]:::dto
LikeStatusDto["LikeStatusDto"]:::dto
LikeUserDTO["LikeUserDTO"]:::dto
LoginRequest["LoginRequest"]:::dto
OrderDTO["OrderDTO"]:::dto
OrderItemDTO["OrderItemDTO"]:::dto
OrderResponseDTO["OrderResponseDTO"]:::dto
OrderStatsDTO["OrderStatsDTO"]:::dto
PaymentDTO["PaymentDTO"]:::dto
PaymentResponseDTO["PaymentResponseDTO"]:::dto
ProductCompleteDto["ProductCompleteDto"]:::dto
ProductDTO["ProductDTO"]:::dto
ProductSearchCriteriaDTO["ProductSearchCriteriaDTO"]:::dto
ProductSpecifications["ProductSpecifications"]:::dto
ProductSummaryDTO["ProductSummaryDTO"]:::dto
ProfileDTO["ProfileDTO"]:::dto
ProfileSampleDto["ProfileSampleDto"]:::dto
RefreshRequest["RefreshRequest"]:::dto
RefreshTokenDTO["RefreshTokenDTO"]:::dto
RejectRequestDTO["RejectRequestDTO"]:::dto
RevenueStatsDTO["RevenueStatsDTO"]:::dto
RevenueTimelineDTO["RevenueTimelineDTO"]:::dto
TokenResponse["TokenResponse"]:::dto
TopProductDTO["TopProductDTO"]:::dto
UpcomingAppointmentDTO["UpcomingAppointmentDTO"]:::dto
UpdateCartItemRequestDTO["UpdateCartItemRequestDTO"]:::dto
UserDTO["UserDTO"]:::dto
UserProfileDTO["UserProfileDTO"]:::dto
UserSummaryDTO["UserSummaryDTO"]:::dto
WebSocketCommentMessage["WebSocketCommentMessage"]:::dto

%% -- Mappers --
AddressMapper["AddressMapper"]:::mapper
AdvertisementMapper["AdvertisementMapper"]:::mapper
AppointmentMapper["AppointmentMapper"]:::mapper
AppointmentProposalMapper["AppointmentProposalMapper"]:::mapper
CartMapper["CartMapper"]:::mapper
CategoryMapperImplCustom["CategoryMapperImplCustom"]:::mapper
ContactRequestMapper["ContactRequestMapper"]:::mapper
CustomAdvertisementMapperIgnore["CustomAdvertisementMapperIgnore"]:::mapper
CustomImagesMapperIgnore["CustomImagesMapperIgnore"]:::mapper
CustomProductMapperIgnore["CustomProductMapperIgnore"]:::mapper
ImageMapper["ImageMapper"]:::mapper
OrderMapper["OrderMapper"]:::mapper
PaymentMapper["PaymentMapper"]:::mapper
ProductMapper["ProductMapper"]:::mapper
ProductOrderMapper["ProductOrderMapper"]:::mapper
ProfileMapper["ProfileMapper"]:::mapper
RefreshTokenMapper["RefreshTokenMapper"]:::mapper
UserMapper["UserMapper"]:::mapper
UserOrderMapper["UserOrderMapper"]:::mapper
UserProfileMapper["UserProfileMapper"]:::mapper

%% -- Config --
BatchConfig["BatchConfig"]:::config
CustomSwaggerIndexTransformer["CustomSwaggerIndexTransformer"]:::config
DynamicTableItemReader["DynamicTableItemReader"]:::config
EncoderConfig["EncoderConfig"]:::config
JacksonConfig["JacksonConfig"]:::config
JwtAuthenticationFilter["JwtAuthenticationFilter"]:::config
JwtProperties["JwtProperties"]:::config
RetryConfig["RetryConfig"]:::config
SecurityConfig["SecurityConfig"]:::config
SwaggerConfig["SwaggerConfig"]:::config
WebConfig["WebConfig"]:::config
WebSocketConfig["WebSocketConfig"]:::config

%% -- Utils --
PEMKeyUtils["PEMKeyUtils"]:::util
PaginationUtils["PaginationUtils"]:::util
Secret["Secret"]:::util
UserDTOMixin["UserDTOMixin"]:::util

%% -- Exceptions --
AdminDeletionException["AdminDeletionException"]:::exception
ErrorResponse["ErrorResponse"]:::exception
GlobalExceptionHandlerRestController["GlobalExceptionHandlerRestController"]:::exception
ImageUploadException["ImageUploadException"]:::exception
OptimisticLockRetryException["OptimisticLockRetryException"]:::exception
ResourceNotFoundException["ResourceNotFoundException"]:::exception

%% -- Interceptors --
HttpRequestLoggerInterceptor["HttpRequestLoggerInterceptor"]:::interceptor

%% -- Other --
SpringbootBeApplication["SpringbootBeApplication"]:::other

%% -- Dependencies --
AddressController --> AddressDTO
AddressController --> AddressServiceImpl
AddressMapper --> Address
AddressMapper --> AddressDTO
AddressRepository --> Address
AddressRepository --> Product
AddressService --> AddressDTO
AddressServiceImpl --> Address
AddressServiceImpl --> AddressDTO
AddressServiceImpl --> AddressMapper
AddressServiceImpl --> AddressRepository
AddressServiceImpl --> AddressService
Advertisement --> Category
Advertisement --> Product
Advertisement --> Profile
Advertisement --> User
Advertisement --> UserAdvertisementLike
AdvertisementCompleteDto --> ProfileSampleDto
AdvertisementCompleteDto --> UserDTO
AdvertisementController --> AdvertisementServiceImpl
AdvertisementDTO --> CategoryDTO
AdvertisementDTO --> ProductDTO
AdvertisementDTO --> ProfileDTO
AdvertisementDTO --> UserDTO
AdvertisementMapper --> Advertisement
AdvertisementMapper --> AdvertisementDTO
AdvertisementRepository --> Advertisement
AdvertisementServiceImpl --> AddressMapper
AdvertisementServiceImpl --> AddressServiceImpl
AdvertisementServiceImpl --> Advertisement
AdvertisementServiceImpl --> AdvertisementRepository
AdvertisementServiceImpl --> AdvertisementService
AdvertisementServiceImpl --> CategoryRepository
AdvertisementServiceImpl --> ImageRepository
AdvertisementServiceImpl --> ProfileRepository
AdvertisementServiceImpl --> UserRepository
AllMappingService --> AddressDTO
AllMappingService --> AdvertisementCompleteDto
AllMappingService --> ImageCompleteDto
AllMappingService --> ProductCompleteDto
AllMappingService --> ProfileSampleDto
AllMappingService --> UserAdvertisementLikeRepository
AllMappingService --> UserDTO
Appointment --> AppointmentStatus
Appointment --> LocationType
Appointment --> Product
Appointment --> User
AppointmentController --> AppointmentDTO
AppointmentController --> AppointmentServiceImpl
AppointmentDTO --> AppointmentStatus
AppointmentDTO --> LocationType
AppointmentDTO --> ProductCompleteDto
AppointmentDTO --> UserProfileDTO
AppointmentMapper --> AllMappingService
AppointmentMapper --> Appointment
AppointmentMapper --> AppointmentDTO
AppointmentMapper --> UserProfileMapper
AppointmentProposal --> Appointment
AppointmentProposal --> ProposalStatus
AppointmentProposal --> User
AppointmentProposalController --> AppointmentProposalDTO
AppointmentProposalController --> AppointmentProposalService
AppointmentProposalDTO --> AppointmentDTO
AppointmentProposalDTO --> ProposalStatus
AppointmentProposalDTO --> UserProfileDTO
AppointmentProposalMapper --> AppointmentMapper
AppointmentProposalMapper --> AppointmentProposalDTO
AppointmentProposalMapper --> UserProfileMapper
AppointmentProposalRepository --> AppointmentProposal
AppointmentProposalService --> AppointmentProposalDTO
AppointmentProposalServiceImpl --> AppointmentProposal
AppointmentProposalServiceImpl --> AppointmentProposalDTO
AppointmentProposalServiceImpl --> AppointmentProposalMapper
AppointmentProposalServiceImpl --> AppointmentProposalRepository
AppointmentProposalServiceImpl --> AppointmentProposalService
AppointmentProposalServiceImpl --> AppointmentRepository
AppointmentProposalServiceImpl --> UserRepository
AppointmentRepository --> Appointment
AppointmentService --> AppointmentDTO
AppointmentServiceImpl --> Appointment
AppointmentServiceImpl --> AppointmentDTO
AppointmentServiceImpl --> AppointmentMapper
AppointmentServiceImpl --> AppointmentRepository
AppointmentServiceImpl --> AppointmentService
AppointmentServiceImpl --> EmailService
AppointmentServiceImpl --> ProfileRepository
AppointmentServiceImpl --> UserRepository
AuthController --> JwtServiceImpl
AuthController --> RefreshToken
AuthController --> RefreshTokenRepository
AuthController --> RefreshTokenServiceImpl
AuthController --> UserServiceImpl
Cart --> CartItem
Cart --> User
CartController --> CartServiceImpl
CartDTO --> CartItemDTO
CartItem --> Cart
CartItem --> Product
CartItemDTO --> ProductSummaryDTO
CartItemRepository --> CartItem
CartMapper --> Cart
CartMapper --> CartDTO
CartMapper --> CartItem
CartMapper --> CartItemDTO
CartRepository --> Cart
CartResponseDTO --> CartDTO
CartService --> CartDTO
CartServiceImpl --> Cart
CartServiceImpl --> CartDTO
CartServiceImpl --> CartItem
CartServiceImpl --> CartItemRepository
CartServiceImpl --> CartMapper
CartServiceImpl --> CartRepository
CartServiceImpl --> CartService
CartServiceImpl --> Image
CartServiceImpl --> ProductRepository
CartServiceImpl --> UserRepository
CategoryController --> CategoryDTO
CategoryController --> CategoryServiceImpl
CategoryMapperImplCustom --> Category
CategoryMapperImplCustom --> CategoryDTO
CategoryRepository --> Category
CategorySampleDTO --> CategoryDTO
CategoryService --> CategoryDTO
CategoryServiceImpl --> Category
CategoryServiceImpl --> CategoryDTO
CategoryServiceImpl --> CategoryMapperImplCustom
CategoryServiceImpl --> CategoryRepository
CategoryServiceImpl --> CategoryService
CategoryWithPathDto --> CategorySimpleDto
Comment --> Advertisement
Comment --> User
CommentController --> CommentServiceImpl
CommentController --> CommentTreeDTO
CommentRepository --> Comment
CommentService --> CommentTreeDTO
CommentServiceImpl --> AdvertisementRepository
CommentServiceImpl --> Comment
CommentServiceImpl --> CommentRepository
CommentServiceImpl --> CommentService
CommentServiceImpl --> CommentTreeDTO
CommentServiceImpl --> Profile
CommentServiceImpl --> ProfileRepository
CommentServiceImpl --> UserProfileDTO
CommentServiceImpl --> UserRepository
CommentServiceImpl --> WebSocketCommentService
CommentServiceImpl --> WebSocketCommentServiceImpl
CommentTreeDTO --> Comment
CommentTreeDTO --> UserProfileDTO
ContactRequest --> ContactMethod
ContactRequest --> Product
ContactRequest --> RequestStatus
ContactRequest --> User
ContactRequestController --> ContactRequestDTO
ContactRequestController --> ContactRequestServiceImpl
ContactRequestDTO --> ContactMethod
ContactRequestDTO --> ProductCompleteDto
ContactRequestDTO --> RequestStatus
ContactRequestDTO --> UserProfileDTO
ContactRequestMapper --> AllMappingService
ContactRequestMapper --> ContactRequestDTO
ContactRequestMapper --> UserProfileMapper
ContactRequestRepository --> ContactRequest
ContactRequestRepository --> RequestStatus
ContactRequestService --> ContactRequestDTO
ContactRequestServiceImpl --> AppointmentRepository
ContactRequestServiceImpl --> ContactRequestDTO
ContactRequestServiceImpl --> ContactRequestMapper
ContactRequestServiceImpl --> ContactRequestRepository
ContactRequestServiceImpl --> ContactRequestService
ContactRequestServiceImpl --> EmailService
ContactRequestServiceImpl --> ProductRepository
ContactRequestServiceImpl --> Profile
ContactRequestServiceImpl --> ProfileRepository
ContactRequestServiceImpl --> UserRepository
DashboardController --> CategoryStatsDTO
DashboardController --> DashboardServiceImpl
DashboardController --> TopProductDTO
DashboardController --> UpcomingAppointmentDTO
DashboardService --> CategoryStatsDTO
DashboardService --> DashboardStatsDTO
DashboardService --> RevenueTimelineDTO
DashboardService --> TopProductDTO
DashboardService --> UpcomingAppointmentDTO
DashboardServiceImpl --> AppointmentRepository
DashboardServiceImpl --> CategoryRepository
DashboardServiceImpl --> CategoryStatsDTO
DashboardServiceImpl --> DashboardService
DashboardServiceImpl --> DashboardStatsDTO
DashboardServiceImpl --> ImageRepository
DashboardServiceImpl --> OrderRepository
DashboardServiceImpl --> PaymentRepository
DashboardServiceImpl --> ProductRepository
DashboardServiceImpl --> Profile
DashboardServiceImpl --> ProfileRepository
DashboardServiceImpl --> RevenueTimelineDTO
DashboardServiceImpl --> TopProductDTO
DashboardServiceImpl --> UpcomingAppointmentDTO
DashboardStatsDTO --> OrderStatsDTO
DashboardStatsDTO --> RevenueStatsDTO
EmailServiceImpl --> EmailService
GoogleAuthController --> JwtServiceImpl
GoogleAuthController --> RefreshToken
GoogleAuthController --> RefreshTokenRepository
GoogleAuthController --> RefreshTokenServiceImpl
GoogleAuthController --> UserServiceImpl
Image --> Product
ImageController --> Image
ImageController --> ImageService
ImageDTO --> ProductDTO
ImageRepository --> Image
ImageService --> Image
ImageServiceImpl --> Image
ImageServiceImpl --> ImageRepository
ImageServiceImpl --> ImageService
ImageServiceImpl --> ProductRepository
InitiatePaymentRequestDTO --> PaymentMethod
JwtAuthenticationFilter --> JwtService
JwtServiceImpl --> JwtProperties
JwtServiceImpl --> JwtService
JwtServiceImpl --> RefreshTokenService
JwtServiceImpl --> TokenResponse
JwtServiceImpl --> UserServiceImpl
Order --> OrderItem
Order --> OrderStatus
Order --> Payment
Order --> User
OrderController --> OrderDTO
OrderController --> OrderServiceImpl
OrderDTO --> OrderItemDTO
OrderDTO --> OrderStatus
OrderDTO --> PaymentDTO
OrderDTO --> UserSummaryDTO
OrderItem --> Order
OrderItem --> Product
OrderItemDTO --> ProductSummaryDTO
OrderItemRepository --> OrderItem
OrderMapper --> Order
OrderMapper --> OrderDTO
OrderMapper --> OrderItem
OrderMapper --> OrderItemDTO
OrderRepository --> Order
OrderResponseDTO --> OrderDTO
OrderService --> OrderDTO
OrderServiceImpl --> CartServiceImpl
OrderServiceImpl --> Order
OrderServiceImpl --> OrderDTO
OrderServiceImpl --> OrderItem
OrderServiceImpl --> OrderItemRepository
OrderServiceImpl --> OrderMapper
OrderServiceImpl --> OrderRepository
OrderServiceImpl --> OrderService
OrderServiceImpl --> ProductRepository
OrderServiceImpl --> ProductStockService
OrderServiceImpl --> UserRepository
Payment --> Order
Payment --> PaymentMethod
Payment --> PaymentStatus
PaymentController --> PaymentServiceImpl
PaymentDTO --> PaymentMethod
PaymentDTO --> PaymentStatus
PaymentMapper --> Payment
PaymentMapper --> PaymentDTO
PaymentRepository --> Payment
PaymentResponseDTO --> PaymentDTO
PaymentService --> PaymentResponseDTO
PaymentServiceImpl --> OrderRepository
PaymentServiceImpl --> OrderServiceImpl
PaymentServiceImpl --> PaymentMapper
PaymentServiceImpl --> PaymentRepository
PaymentServiceImpl --> PaymentResponseDTO
PaymentServiceImpl --> PaymentService
Product --> Address
Product --> Advertisement
Product --> Image
ProductCompleteDto --> AddressDTO
ProductCompleteDto --> AdvertisementCompleteDto
ProductCompleteDto --> ImageCompleteDto
ProductController --> ProductCompleteDto
ProductController --> ProductDTO
ProductController --> ProductServiceImpl
ProductDTO --> AddressDTO
ProductDTO --> AdvertisementDTO
ProductDTO --> ImageDTO
ProductOrderMapper --> Product
ProductOrderMapper --> ProductSummaryDTO
ProductRepository --> Product
ProductService --> Product
ProductService --> ProductCompleteDto
ProductService --> ProductDTO
ProductServiceImpl --> AddressRepository
ProductServiceImpl --> AllMappingService
ProductServiceImpl --> Product
ProductServiceImpl --> ProductCompleteDto
ProductServiceImpl --> ProductDTO
ProductServiceImpl --> ProductMapper
ProductServiceImpl --> ProductRepository
ProductServiceImpl --> ProductService
ProductStockService --> OrderDTO
ProductStockService --> OrderMapper
ProductStockService --> OrderRepository
ProductStockService --> ProductRepository
Profile --> Address
Profile --> User
ProfileDTO --> AddressDTO
ProfileDTO --> UserDTO
ProfileMapper --> Profile
ProfileMapper --> ProfileDTO
ProfileRepository --> Profile
ProfileSampleDto --> AddressDTO
ProfileService --> ProfileDTO
ProfileServiceImpl --> AddressMapper
ProfileServiceImpl --> AddressServiceImpl
ProfileServiceImpl --> Profile
ProfileServiceImpl --> ProfileDTO
ProfileServiceImpl --> ProfileMapper
ProfileServiceImpl --> ProfileRepository
ProfileServiceImpl --> ProfileService
ProfileServiceImpl --> UserRepository
ProfilesController --> ProfileDTO
ProfilesController --> ProfileServiceImpl
RefreshTokenMapper --> RefreshToken
RefreshTokenMapper --> RefreshTokenDTO
RefreshTokenRepository --> RefreshToken
RefreshTokenService --> RefreshTokenDTO
RefreshTokenServiceImpl --> RefreshToken
RefreshTokenServiceImpl --> RefreshTokenDTO
RefreshTokenServiceImpl --> RefreshTokenMapper
RefreshTokenServiceImpl --> RefreshTokenRepository
RefreshTokenServiceImpl --> RefreshTokenService
SecurityConfig --> JwtAuthenticationFilter
SecurityConfig --> JwtService
UserAdvertisementLike --> Advertisement
UserAdvertisementLike --> User
UserAdvertisementLikeController --> UserAdvertisementLikeServiceImpl
UserAdvertisementLikeRepository --> UserAdvertisementLike
UserAdvertisementLikeServiceImpl --> AdvertisementRepository
UserAdvertisementLikeServiceImpl --> LikeStatusDto
UserAdvertisementLikeServiceImpl --> LikeUserDTO
UserAdvertisementLikeServiceImpl --> UserAdvertisementLike
UserAdvertisementLikeServiceImpl --> UserAdvertisementLikeRepository
UserAdvertisementLikeServiceImpl --> UserAdvertisementLikeService
UserAdvertisementLikeServiceImpl --> UserRepository
UserController --> UserDTO
UserController --> UserService
UserOrderMapper --> User
UserOrderMapper --> UserSummaryDTO
UserProfileDTO --> Profile
UserProfileDTO --> User
UserProfileMapper --> Profile
UserProfileMapper --> ProfileRepository
UserProfileMapper --> User
UserProfileMapper --> UserProfileDTO
UserRepository --> User
UserService --> UserDTO
UserServiceImpl --> Advertisement
UserServiceImpl --> Image
UserServiceImpl --> Product
UserServiceImpl --> User
UserServiceImpl --> UserDTO
UserServiceImpl --> UserMapper
UserServiceImpl --> UserRepository
UserServiceImpl --> UserService
WebSocketCommentMessage --> CommentTreeDTO
WebSocketCommentServiceImpl --> CommentRepository
WebSocketCommentServiceImpl --> WebSocketCommentService

%% -- JPA Relationships --
Advertisement -->|"ManyToOne"| Category
Advertisement -->|"OneToOne"| Profile
Advertisement -->|"ManyToOne"| User
Appointment -->|"ManyToOne"| Product
Appointment -->|"ManyToOne"| User
AppointmentProposal -->|"ManyToOne"| Appointment
AppointmentProposal -->|"ManyToOne"| User
Cart -->|"ManyToOne"| User
CartItem -->|"ManyToOne"| Cart
CartItem -->|"ManyToOne"| Product
Category -->|"ManyToOne"| Category
Comment -->|"ManyToOne"| Advertisement
Comment -->|"ManyToOne"| Comment
Comment -->|"ManyToOne"| User
ContactRequest -->|"ManyToOne"| Product
ContactRequest -->|"ManyToOne"| User
OrderItem -->|"ManyToOne"| Order
OrderItem -->|"ManyToOne"| Product
Payment -->|"OneToOne"| Order
Product -->|"ManyToOne"| Address
Product -->|"OneToOne"| Advertisement
Profile -->|"OneToOne"| User
UserAdvertisementLike -->|"ManyToOne"| Advertisement
UserAdvertisementLike -->|"ManyToOne"| User

classDef controller   fill:#1f77b4,stroke:#0d47a1,stroke-width:2px,color:#fff
classDef service      fill:#2ca02c,stroke:#1b5e20,stroke-width:2px,color:#fff
classDef service_impl fill:#98df8a,stroke:#2ca02c,stroke-width:1px,color:#1b5e20
classDef repository   fill:#ff7f0e,stroke:#e65100,stroke-width:2px,color:#fff
classDef entity       fill:#9467bd,stroke:#6a1b9a,stroke-width:2px,color:#fff
classDef enum         fill:#e377c2,stroke:#880e4f,stroke-width:1px,color:#fff
classDef dto          fill:#7f7f7f,stroke:#424242,stroke-width:1px,color:#fff
classDef mapper       fill:#bcbd22,stroke:#827717,stroke-width:1px,color:#fff
classDef config       fill:#17becf,stroke:#006064,stroke-width:1px,color:#fff
classDef util         fill:#aec7e8,stroke:#1565c0,stroke-width:1px,color:#000
classDef exception    fill:#d62728,stroke:#b71c1c,stroke-width:1px,color:#fff
classDef interceptor  fill:#f7b6d2,stroke:#880e4f,stroke-width:1px,color:#000
classDef other        fill:#c7c7c7,stroke:#616161,stroke-width:1px,color:#000
```