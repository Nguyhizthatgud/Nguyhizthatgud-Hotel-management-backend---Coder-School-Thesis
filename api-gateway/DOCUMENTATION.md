# API Gateway Documentation

## 1. Introduction

The API Gateway is the central entry point for all incoming client requests in the hotel booking application. It is a crucial component of the microservices architecture, designed to simplify client-side development and provide a secure, unified interface to the various backend services.

Its primary role is to receive requests, process them, and route them to the appropriate downstream microservice.

## 2. Core Responsibilities

The API Gateway handles several critical cross-cutting concerns, ensuring that the individual microservices can focus on their specific business logic.

### 2.1. Request Routing

The gateway acts as a reverse proxy, mapping public-facing API endpoints to the internal microservices. The routing logic is defined in the `api-gateway/routes/` directory. Each route file corresponds to a specific domain (e.g., `auth.js`, `room.js`) and forwards the request to the correct service URL as configured in `.env.gateway`.

### 2.2. Authentication & Authorization

Security is a primary responsibility of the API Gateway. It secures the backend services by:

- **Verifying User Identity:** All incoming requests to protected endpoints are first intercepted by the `authMiddleware`. This middleware inspects the `Authorization` header for a Firebase ID Token.
- **Firebase Token Validation:** It uses the Firebase Admin SDK to verify the token's signature and expiration, ensuring it was issued by your Firebase project and is still valid. If the token is valid, the decoded user information is attached to the request object (`req.user`).
- **Role-Based Access Control (RBAC):** For endpoints that require specific user roles (e.g., "admin", "manager"), the `requireRole` middleware checks the custom claims on the authenticated user's token (`req.user.role`). Access is denied if the user does not have the required role.

### 2.3. Cross-Cutting Concerns

The gateway offloads common functionalities from the microservices:

- **Rate Limiting:** Protects the backend from abuse and overload by limiting the number of requests a client can make in a given time window.
- **CORS:** Manages Cross-Origin Resource Sharing to allow or deny requests from different domains.
- **Logging:** Logs all incoming requests and their outcomes for monitoring and debugging purposes.
- **Error Handling:** Provides a centralized error handling mechanism, catching errors from the routing layer or downstream services and returning them in a standardized JSON format.

## 3. Relationship with Other Modules

The API Gateway is not an isolated component; it is deeply integrated with other parts of the system.

### 3.1. `shared` Module

This directory contains code that is used by the API Gateway and potentially other services to reduce duplication.

- `shared/utils/logger.js`: A standardized logger for consistent log formatting.
- `shared/utils/serviceClient.js`: An `axios`-based HTTP client used by the gateway's routes to communicate with downstream microservices. It standardizes request/response logging and error handling for inter-service communication.
- `shared/middleware/auth.js`: Contains the core `authMiddleware` and `requireRole` functions that use Firebase Admin to secure endpoints.
- `shared/middleware/errorHandler.js`: A global error handler for formatting and logging all exceptions.

### 3.2. Microservices (`services/`)

The API Gateway is the "gatekeeper" for all the microservices. It communicates with them via HTTP requests using the `serviceClient`. The URLs for each microservice are configured in the `.env.gateway` file and loaded from `api-gateway/config/services.js`.

**Example Flow:**

1.  A client sends a `POST` request to `/api/rooms` with a Firebase ID token in the `Authorization` header.
2.  The API Gateway receives the request.
3.  The `authMiddleware` verifies the Firebase token.
4.  The `requireRole(['admin', 'manager'])` middleware checks if the user has the necessary role.
5.  If both checks pass, the request is forwarded to the `room.js` route handler.
6.  The route handler uses the `serviceClient` to send a `POST` request to the `room-service` at its configured URL (e.g., `http://localhost:3003`).
7.  The `room-service` processes the request and returns a response.
8.  The API Gateway receives the response from the `room-service` and relays it back to the original client.

## 4. Configuration

The API Gateway's behavior is configured through environment variables located in the `.env.gateway` file in the project root. This includes server settings, rate limit parameters, and, most importantly, the URLs of all the downstream microservices.

Frontend (port 3000)
↓ Bearer <firebase-token>

API GATEWAY (port 4001)
├─ validateAndInjectUser middleware (server.js)
│ ├─ Validates Firebase token ONCE
│ └─ Adds headers: x-user-id, x-user-email
├─ Route handler (routes/booking.js)
│ └─ Forwards to service
↓

Booking Service (port 4003)
├─ extractUserFromGateway middleware
│ └─ Reads x-user-id from headers
├─ Route handler (routes/bookingRoutes.js)
├─ Controller (controllers/bookingController.js)
│ └─ Uses req.user.uid for DB queries
└─ Returns response
