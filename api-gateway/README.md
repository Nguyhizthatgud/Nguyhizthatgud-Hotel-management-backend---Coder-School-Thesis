# API Gateway

Single entry point for all hotel booking microservices. Handles routing, authentication, rate limiting, and logging.

## Features

✅ Request routing to backend microservices  
✅ JWT authentication and RBAC (Role-Based Access Control)  
✅ Rate limiting per client  
✅ Centralized logging  
✅ Error handling  
✅ Request tracing (via X-Request-ID header)  
✅ Health check endpoint

## Quick Start

### Install Dependencies

```bash
npm install
```

### Environment Variables

Copy `.env.gateway` and update service URLs if needed:

```bash
PORT=3001
JWT_SECRET=your-secret-key
AUTH_SERVICE_URL=http://localhost:3002
ROOM_SERVICE_URL=http://localhost:3003
BOOKING_SERVICE_URL=http://localhost:3004
GUEST_SERVICE_URL=http://localhost:3005
STAFF_SERVICE_URL=http://localhost:3006
TRANSACTION_SERVICE_URL=http://localhost:3007
```

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

All requests go through the gateway at `http://localhost:3001`.

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (protected)
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user (protected)

### Rooms

- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room (admin/manager)
- `GET /api/rooms/:id` - Get room details
- `PUT /api/rooms/:id` - Update room (admin/manager)
- `DELETE /api/rooms/:id` - Delete room (admin)

### Bookings

- `GET /api/bookings` - List bookings (protected)
- `POST /api/bookings` - Create booking (protected)
- `GET /api/bookings/:id` - Get booking (protected)
- `PUT /api/bookings/:id` - Update booking (protected)
- `POST /api/bookings/:id/cancel` - Cancel booking (protected)

### Guests

- `GET /api/guests` - List guests (admin/manager/receptionist)
- `POST /api/guests` - Register guest (protected)
- `GET /api/guests/:id` - Get guest (protected)
- `PUT /api/guests/:id` - Update guest (protected)

### Staff

- `GET /api/staff` - List staff (admin/manager)
- `POST /api/staff` - Add staff (admin/manager)
- `GET /api/staff/:id` - Get staff (admin/manager)
- `PUT /api/staff/:id` - Update staff (admin/manager)

### Transactions

- `GET /api/transactions` - List transactions (admin/manager)
- `POST /api/transactions` - Create transaction (protected)
- `GET /api/transactions/:id` - Get transaction (protected)

## Authentication

Pass JWT token in `Authorization` header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3001/api/auth/me
```

## Health Check

```bash
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-12-19T10:00:00Z",
  "uptime": 3600
}
```

## Rate Limiting

Default: 100 requests per 15 minutes per IP.

Configure in `.env.gateway`:

```
RATE_LIMIT_WINDOW_MS=15
RATE_LIMIT_MAX_REQUESTS=100
```

## Logging

Logs are written to `logs/` directory with daily files.

## Docker

Build and run:

```bash
docker build -t hotel-api-gateway .
docker run -p 3001:3001 --env-file .env.gateway hotel-api-gateway
```

## Structure

```
api-gateway/
├── src/
│   └── server.js          # Main express app
├── routes/
│   ├── auth.js            # Auth endpoints
│   ├── room.js            # Room endpoints
│   ├── booking.js         # Booking endpoints
│   ├── guest.js           # Guest endpoints
│   ├── staff.js           # Staff endpoints
│   └── transaction.js     # Transaction endpoints
├── config/
│   └── services.js        # Service configuration
├── middleware/
│   └── [shared]           # Uses shared middleware
└── package.json
```

## Shared Utilities

Located in `../shared/`:

- `middleware/auth.js` - JWT and RBAC middleware
- `middleware/errorHandler.js` - Global error handler
- `utils/logger.js` - Logging utility
- `utils/serviceClient.js` - HTTP client for inter-service calls
