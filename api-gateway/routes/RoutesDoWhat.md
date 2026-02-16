3. Routes (api-gateway/routes/)
   Purpose: Define endpoints and forward to microservices
   Files: auth.js, booking.js, room.js, etc.

What it does:

```
// Gateway route: api-gateway/routes/booking.js
router.get("/", authMiddleware, async (req, res) => {  // ← OLD middleware!
    const response = await bookingService.get("/bookings", {
        headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
});

```

Accept requests from frontend
⚠️ Currently use authMiddleware (OLD Firebase validation)
Forward to microservices using ServiceClient
Pass Authorization header to services

🔴 OVERLAP - REDUNDANT CODE:
Gateway routes import auth.js (old pattern)
Services have their own routes: bookingRoutes.js
Routes serve different purposes but names overlap
