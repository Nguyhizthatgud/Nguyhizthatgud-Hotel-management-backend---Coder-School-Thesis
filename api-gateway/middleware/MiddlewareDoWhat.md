2. Middleware (api-gateway/middleware/)
   Purpose: Request processing before routing
   File: authGateway.js

What it does:

✅ Validates Firebase tokens (ONE TIME for entire system)
✅ Extracts uid and email from token
✅ Injects headers: x-user-id, x-user-email, x-user-token
✅ Skips public routes (/login, /register, /health)

🔴 OVERLAP - REDUNDANT CODE:

auth.js does the SAME Firebase validation
Currently gateway routes STILL use old authMiddleware from shared
This means you're validating Firebase TWICE (gateway + routes)!
