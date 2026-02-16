API Gateway Module Breakdown 🏗️

1. Config (api-gateway/config/)
   Purpose: Service registry - maps service names to URLs
   File: services.js

```
const services = {
    booking: { url: "http://localhost:4003", ... },
    room: { url: "http://localhost:4004", ... },
    // etc
}

```

What it does:

Stores URLs for all microservices (4002-4007)
Used by routes to forward requests
Overlap: ❌ None - gateway-specific
