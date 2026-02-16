# Hotel Booking App - API Gateway & Microservices Setup

## Overview

The API Gateway is the single entry point for all hotel booking microservices. It provides:

- **Centralized Routing**: Routes requests to appropriate microservices
- **Authentication & Authorization**: JWT validation and role-based access control
- **Rate Limiting**: Prevents abuse with request throttling
- **Logging & Monitoring**: Structured logs with request tracing
- **Error Handling**: Unified error response format

## Architecture

```
Client (Frontend/Mobile)
       ↓
API Gateway (Port 3001)
  ├── /api/auth → Auth Service (4002)
  ├── /api/rooms → Room Service (4004)
  ├── /api/bookings → Booking Service (4005)
  ├── /api/guests → Guest Service (4006)
  ├── /api/staff → Staff Service (4007)
  └── /api/transactions → Transaction Service (4008)

Backend Services
  ├── MongoDB (Shared Database)
  └── Redis (Caching & Rate Limiting)
```

## Quick Start

### 1. Install Dependencies (API Gateway only)

```bash
cd api-gateway
npm install
```

### 2. Configure Environment

Copy and update `.env.gateway`:

```bash
cp api-gateway/.env.gateway api-gateway/.env.local
```

Edit with your service URLs and JWT secret.

### 3. Run Gateway Locally

```bash
cd api-gateway
npm run dev
```

Gateway starts at `http://localhost:3001`

### 4. Run All Services with Docker Compose

From the backend root directory:

```bash
docker-compose up --build
```

This starts:

- API Gateway (3001)
- Auth Service (4002)
- Room Service (4004)
- Booking Service (4005)
- Guest Service (4006)
- Staff Service (4007)
- Transaction Service (4008)
- MongoDB (27017)
- Redis (6379)

## API Usage Examples

### Register User (Public)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login (Public)

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

Response includes JWT token:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { ... }
  }
}
```

### Get Rooms (Public)

```bash
curl http://localhost:3001/api/rooms
```

### Create Booking (Protected)

```bash
curl -X POST http://localhost:3001/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "6543...",
    "checkInDate": "2025-12-25",
    "checkOutDate": "2025-12-27",
    "numberOfGuests": 2
  }'
```

### Get Staff (Admin/Manager Only)

```bash
curl http://localhost:3001/api/staff \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-12-19T10:00:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No token provided"
  },
  "timestamp": "2025-12-19T10:00:00Z"
}
```

## Authentication

Pass JWT in the `Authorization` header:

```bash
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

Default: **100 requests per 15 minutes** per IP address.

When exceeded, you'll get a 429 Too Many Requests response.

## Health Check

```bash
curl http://localhost:3001/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-12-19T10:00:00Z",
  "uptime": 3600
}
```

## Monitoring & Logs

Logs are written to `api-gateway/logs/` directory:

- Daily log files: `YYYY-MM-DD.log`
- JSON format for easy parsing
- Configure log level in `.env.gateway`: `LOG_LEVEL=info|debug|warn|error`

## File Structure

```
api-gateway/
├── src/
│   └── server.js              # Main Express app
├── routes/
│   ├── auth.js                # Auth routes
│   ├── room.js                # Room routes
│   ├── booking.js             # Booking routes
│   ├── guest.js               # Guest routes
│   ├── staff.js               # Staff routes
│   └── transaction.js         # Transaction routes
├── config/
│   └── services.js            # Service configuration
├── middleware/
│   └── [shared]               # Uses shared middleware
├── package.json
├── Dockerfile
├── .env.gateway
└── README.md
```

## Microservices Architecture

Each service should follow this structure:

```
service-name/
├── src/
│   └── server.js              # Express app
├── routes/
│   └── [serviceName]Routes.js
├── controllers/
│   └── [serviceName]Controller.js
├── models/
│   └── [modelName].js         # Mongoose schemas
├── middleware/
├── config/
│   └── database.js
├── package.json
├── Dockerfile
└── .env.[service-name]
```

## Common Issues & Troubleshooting

### Services can't connect to MongoDB

Ensure MongoDB is running and connection string is correct:

```bash
MONGODB_URI=mongodb://admin:password123@mongodb:27017/hotel?authSource=admin
```

### Auth tokens returning 401

1. Check JWT_SECRET matches across services
2. Verify token hasn't expired (default: 15 minutes)
3. Ensure Authorization header format: `Bearer <token>`

### Rate limiting too strict

Adjust in `.env.gateway`:

```bash
RATE_LIMIT_WINDOW_MS=15      # Window in minutes
RATE_LIMIT_MAX_REQUESTS=100  # Max requests per window
```

### Service-to-service communication fails

Check service URLs in `.env` files and docker-compose.yml match.

## Next Steps

1. **Implement each microservice** with controllers and models
2. **Add database migrations** for each service
3. **Set up CI/CD** with GitHub Actions or GitLab CI
4. **Add API documentation** with Swagger/OpenAPI
5. **Implement service discovery** for dynamic service registration
6. **Add message queue** (RabbitMQ/Kafka) for async communication
7. **Set up monitoring** with Prometheus/Grafana

## Production Deployment

### Secrets Management

Use environment variables or secret managers:

- AWS Secrets Manager
- HashiCorp Vault
- Docker Secrets (for Swarm)

### Scaling

Deploy services as:

- **Kubernetes** (recommended for large scale)
- **Docker Swarm**
- **Cloud platforms** (AWS ECS, Google Cloud Run, Azure Container Instances)

### Performance

- Enable caching in Redis
- Use connection pooling for MongoDB
- Implement database indexes
- Add CDN for static assets

## Support & Documentation

- [Express.js Docs](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [JWT Authentication](https://tools.ietf.org/html/rfc8725)
- [Microservices Patterns](https://microservices.io/)
