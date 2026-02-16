# Architecture Restructuring: Option 1 - Gateway Auth Pattern

## Overview

**API Gateway validates Firebase tokens once** → Passes user info to microservices via headers → Services trust the gateway (no redundant Firebase validation)

## Changes Made

### 1. **API Gateway** (`api-gateway/middleware/authGateway.js`)

- ✅ Validates Firebase tokens
- ✅ Extracts user: `uid`, `email`
- ✅ Injects headers:
  - `x-user-id`: User's Firebase UID
  - `x-user-email`: User's email
  - `x-user-token`: Full token (for service-to-service calls)
- ✅ Skips public routes (login, register, health)
- ✅ Returns 401 if auth fails

### 2. **Gateway Server** (`api-gateway/src/server.js`)

- ✅ Imports `validateAndInjectUser` middleware
- ✅ Applied globally before all routes
- ✅ Removed old `authMiddleware` imports

### 3. **Microservices** (`services/*/src/server.js`)

- ✅ Removed Firebase initialization (no longer needed)
- ✅ Import `extractUserFromGateway` instead
- ✅ Apply it before route handlers
- ✅ Trust the gateway validation

### 4. **User Extraction Utility** (`shared/middleware/extractUser.js`)

- ✅ Reads headers from API Gateway
- ✅ Attaches `req.user` object for route handlers
- ✅ Light, fast, no network calls

## Flow Diagram

```
CLIENT
   ↓ (with Bearer token)
API GATEWAY (authGateway.js)
   ├─ Validates token with Firebase
   ├─ Extracts user info
   ├─ Adds x-user-id, x-user-email headers
   ↓
MICROSERVICE (extractUserFromGateway)
   ├─ Reads headers
   ├─ Sets req.user
   ↓
ROUTE HANDLER (uses req.user)
```

## Ports and Dev Setup

- Gateway: `http://localhost:4001`
- Microservices:
  - Auth Service: `http://localhost:4002`
  - Booking Service: `http://localhost:4003`
  - Room Service: `http://localhost:4004`
  - Guest Service: `http://localhost:4005`
  - Staff Service: `http://localhost:4006`
  - Transaction Service: `http://localhost:4007`

### Configure Gateway

Set ports in `backend/.env.gateway`:

```
PORT=4001
AUTH_SERVICE_URL=http://localhost:4002
BOOKING_SERVICE_URL=http://localhost:4003
ROOM_SERVICE_URL=http://localhost:4004
GUEST_SERVICE_URL=http://localhost:4005
STAFF_SERVICE_URL=http://localhost:4006
TRANSACTION_SERVICE_URL=http://localhost:4007
```

### Frontend

Use the gateway base URL. Either set `NEXT_PUBLIC_API_URL` in your Next.js env or rely on the default:

```
NEXT_PUBLIC_API_URL=http://localhost:4001/api
```

The frontend calls the Gateway; the Gateway forwards to microservices using the above ports.

## How to Use in Route Handlers

### In Controllers/Routes:

```javascript
// Before: Had to validate Firebase yourself
// Now: Just read from req.user

export const createBooking = async (req, res) => {
  const userId = req.user.uid; // From gateway headers
  const userEmail = req.user.email; // From gateway headers

  // Create booking for this user
  const booking = await Booking.create({
    ownerID: userId,
    guestEmail: userEmail
    // ... other fields
  });

  res.json(booking);
};
```

## Apply to Other Services

To apply this pattern to other microservices (room, guest, staff, transaction):

1. **Remove Firebase init** from `src/server.js`
2. **Add extractUserFromGateway middleware**:

```javascript
import { extractUserFromGateway } from "../../../shared/middleware/extractUser.js";

app.use(cors());
app.use(express.json());
app.use(extractUserFromGateway); // ← Add this
app.use("/api/rooms", roomRoutes);
```

3. **Use `req.user.uid` and `req.user.email`** in controllers

## Benefits

✅ **Single validation point**: Only gateway validates Firebase  
✅ **Cleaner microservices**: No Firebase SDK needed  
✅ **Faster**: No repeated token verification  
✅ **Easier debugging**: Centralized auth logic  
✅ **Scalable**: Add services without auth setup  
✅ **Secure**: Gateway validates before routing

## Security Notes

- Gateway is the **trust boundary** - keep it secure
- Headers (`x-user-id`, `x-user-email`) should be stripped from public access
- Microservices should only be called through the gateway
- For service-to-service calls, use `x-user-token` if needed
