# Hotel Management Application Backend Structure (Next.js)

## Overview

This document outlines a standard, scalable backend architecture for a hotel management application using Next.js 14+ with App Router, API Routes, and modern best practices.

## What's included:

Complete folder structure for Next.js App Router backend
8 database models (User, Room, Booking, Guest, Payment, Staff, Service, Housekeeping)
Full API endpoint list (50+ routes)
Authentication & authorization patterns (JWT, RBAC)
Environment variables configuration
Technology stack recommendations
Working code example (booking creation)
Best practices & additional resources

Key features covered:
✅ Room management & availability
✅ Booking system with payment integration
✅ Guest management
✅ Staff scheduling
✅ Housekeeping tasks
✅ Service bookings (spa, restaurant, etc.)
✅ Reporting & analytics
✅ Notifications
✅ File uploads

## 📁 Project Structure

```
hotel-management/
├── src/
│   ├── app/
│   │   ├── api/                          # API Routes (Backend)
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.js         # POST /api/auth/login
│   │   │   │   ├── register/
│   │   │   │   │   └── route.js         # POST /api/auth/register
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.js         # POST /api/auth/logout
│   │   │   │   ├── refresh/
│   │   │   │   │   └── route.js         # POST /api/auth/refresh
│   │   │   │   └── me/
│   │   │   │       └── route.js         # GET /api/auth/me
│   │   │   │
│   │   │   ├── rooms/
│   │   │   │   ├── route.js             # GET /api/rooms (list), POST /api/rooms (create)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.js         # GET/PUT/DELETE /api/rooms/:id
│   │   │   │   ├── available/
│   │   │   │   │   └── route.js         # GET /api/rooms/available?from=&to=
│   │   │   │   └── types/
│   │   │   │       └── route.js         # GET /api/rooms/types
│   │   │   │
│   │   │   ├── bookings/
│   │   │   │   ├── route.js             # GET /api/bookings (list), POST /api/bookings (create)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.js         # GET/PUT/DELETE /api/bookings/:id
│   │   │   │   ├── [id]/cancel/
│   │   │   │   │   └── route.js         # POST /api/bookings/:id/cancel
│   │   │   │   ├── [id]/confirm/
│   │   │   │   │   └── route.js         # POST /api/bookings/:id/confirm
│   │   │   │   └── user/[userId]/
│   │   │   │       └── route.js         # GET /api/bookings/user/:userId
│   │   │   │
│   │   │   ├── guests/
│   │   │   │   ├── route.js             # GET /api/guests (list), POST /api/guests (create)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.js         # GET/PUT/DELETE /api/guests/:id
│   │   │   │   └── search/
│   │   │   │       └── route.js         # GET /api/guests/search?q=
│   │   │   │
│   │   │   ├── payments/
│   │   │   │   ├── route.js             # GET /api/payments (list), POST /api/payments (create)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.js         # GET /api/payments/:id
│   │   │   │   ├── webhook/
│   │   │   │   │   └── route.js         # POST /api/payments/webhook (Stripe/PayPal)
│   │   │   │   └── refund/
│   │   │   │       └── route.js         # POST /api/payments/refund
│   │   │   │
│   │   │   ├── staff/
│   │   │   │   ├── route.js             # GET /api/staff (list), POST /api/staff (create)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.js         # GET/PUT/DELETE /api/staff/:id
│   │   │   │   └── schedule/
│   │   │   │       └── route.js         # GET/POST /api/staff/schedule
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── route.js             # GET /api/services (list), POST /api/services (create)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.js         # GET/PUT/DELETE /api/services/:id
│   │   │   │   └── bookings/
│   │   │   │       └── route.js         # POST /api/services/bookings (spa, restaurant, etc.)
│   │   │   │
│   │   │   ├── housekeeping/
│   │   │   │   ├── route.js             # GET /api/housekeeping (list tasks)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.js         # GET/PUT /api/housekeeping/:id
│   │   │   │   └── assign/
│   │   │   │       └── route.js         # POST /api/housekeeping/assign
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── revenue/
│   │   │   │   │   └── route.js         # GET /api/reports/revenue?from=&to=
│   │   │   │   ├── occupancy/
│   │   │   │   │   └── route.js         # GET /api/reports/occupancy?from=&to=
│   │   │   │   └── bookings/
│   │   │   │       └── route.js         # GET /api/reports/bookings?from=&to=
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── route.js             # GET /api/notifications (list)
│   │   │   │   ├── [id]/read/
│   │   │   │   │   └── route.js         # PUT /api/notifications/:id/read
│   │   │   │   └── send/
│   │   │   │       └── route.js         # POST /api/notifications/send
│   │   │   │
│   │   │   └── upload/
│   │   │       └── route.js             # POST /api/upload (images, documents)
│   │   │
│   │   ├── (dashboard)/                  # Frontend Dashboard Routes
│   │   ├── (website)/                    # Frontend Public Website
│   │   └── layout.js
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── mongoose.js              # MongoDB connection (Mongoose)
│   │   │   ├── prisma.js                # Prisma client (if using Prisma)
│   │   │   └── migrations/              # Database migrations
│   │   │
│   │   ├── models/                       # Database Models
│   │   │   ├── User.js
│   │   │   ├── Room.js
│   │   │   ├── Booking.js
│   │   │   ├── Guest.js
│   │   │   ├── Payment.js
│   │   │   ├── Staff.js
│   │   │   ├── Service.js
│   │   │   ├── Housekeeping.js
│   │   │   └── Notification.js
│   │   │
│   │   ├── services/                     # Business Logic
│   │   │   ├── authService.js
│   │   │   ├── roomService.js
│   │   │   ├── bookingService.js
│   │   │   ├── paymentService.js
│   │   │   ├── emailService.js          # Send emails (nodemailer, resend)
│   │   │   ├── smsService.js            # Send SMS (Twilio)
│   │   │   └── notificationService.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js                  # JWT verification, session check
│   │   │   ├── errorHandler.js          # Global error handler
│   │   │   ├── rateLimiter.js           # Rate limiting (upstash/redis)
│   │   │   ├── validation.js            # Request validation (zod)
│   │   │   └── logger.js                # Request logging
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js                   # JWT sign/verify helpers
│   │   │   ├── bcrypt.js                # Password hashing
│   │   │   ├── validators.js            # Input validators
│   │   │   ├── dateHelpers.js           # Date formatting, availability checks
│   │   │   ├── constants.js             # App constants (roles, statuses)
│   │   │   └── apiResponse.js           # Standardized API responses
│   │   │
│   │   └── config/
│   │       ├── index.js                 # Environment config
│   │       └── cloudinary.js            # Cloudinary config (image uploads)
│   │
│   ├── types/                            # TypeScript types (if using TS)
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── next-auth.d.ts
│   │
│   └── middleware.js                     # Next.js middleware (global auth, redirects)
│
├── prisma/                               # Prisma schema (if using Prisma)
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   └── uploads/                          # Static file uploads
│
├── .env.local                            # Environment variables
├── .env.example                          # Example env file
├── next.config.js
├── package.json
└── README.md
```

---

## 🗄️ Database Models (Schema)

### User Model

```javascript
{
  id: ObjectId,
  email: String (unique, required),
  username: String (unique, required),
  passwordHash: String (required),
  role: Enum ['admin', 'manager', 'receptionist', 'staff', 'guest'],
  firstName: String,
  lastName: String,
  phone: String,
  avatarUrl: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Room Model

```javascript
{
  id: ObjectId,
  roomNumber: String (unique, required),
  type: Enum ['single', 'double', 'suite', 'deluxe', 'presidential'],
  floor: Number,
  status: Enum ['available', 'occupied', 'maintenance', 'cleaning'],
  price: Number (required),
  capacity: Number,
  amenities: Array [String] ['wifi', 'tv', 'minibar', 'balcony'],
  images: Array [String] (URLs),
  description: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model

```javascript
{
  id: ObjectId,
  bookingNumber: String (unique, auto-generated),
  guestId: ObjectId (ref: Guest),
  roomId: ObjectId (ref: Room),
  checkInDate: Date (required),
  checkOutDate: Date (required),
  numberOfGuests: Number,
  totalAmount: Number,
  paidAmount: Number,
  status: Enum ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
  paymentStatus: Enum ['unpaid', 'partial', 'paid', 'refunded'],
  specialRequests: String,
  createdBy: ObjectId (ref: User),
  cancelledAt: Date,
  cancelReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Guest Model

```javascript
{
  id: ObjectId,
  userId: ObjectId (ref: User, optional),
  firstName: String (required),
  lastName: String (required),
  email: String (required),
  phone: String (required),
  address: String,
  city: String,
  country: String,
  idType: Enum ['passport', 'drivers-license', 'national-id'],
  idNumber: String,
  dateOfBirth: Date,
  preferences: Object {
    roomType: String,
    floor: String,
    smoking: Boolean
  },
  totalBookings: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Model

```javascript
{
  id: ObjectId,
  bookingId: ObjectId (ref: Booking, required),
  amount: Number (required),
  currency: String (default: 'USD'),
  method: Enum ['cash', 'card', 'bank-transfer', 'paypal', 'stripe'],
  status: Enum ['pending', 'completed', 'failed', 'refunded'],
  transactionId: String,
  paymentGatewayResponse: Object,
  processedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Staff Model

```javascript
{
  id: ObjectId,
  userId: ObjectId (ref: User, required),
  department: Enum ['reception', 'housekeeping', 'maintenance', 'restaurant', 'management'],
  position: String,
  hireDate: Date,
  salary: Number,
  schedule: Array [{
    day: String,
    shift: Enum ['morning', 'afternoon', 'night'],
    startTime: String,
    endTime: String
  }],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Service Model

```javascript
{
  id: ObjectId,
  name: String (required) ['Room Service', 'Spa', 'Laundry', 'Restaurant'],
  category: Enum ['food', 'spa', 'laundry', 'transport', 'other'],
  price: Number,
  description: String,
  availability: Object {
    startTime: String,
    endTime: String,
    daysOfWeek: Array [Number] (0-6)
  },
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Housekeeping Model

```javascript
{
  id: ObjectId,
  roomId: ObjectId (ref: Room, required),
  assignedTo: ObjectId (ref: Staff),
  taskType: Enum ['cleaning', 'maintenance', 'inspection'],
  priority: Enum ['low', 'medium', 'high', 'urgent'],
  status: Enum ['pending', 'in-progress', 'completed'],
  notes: String,
  startedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication & Authorization

### JWT Strategy

```javascript
// lib/middleware/auth.js
export async function authMiddleware(request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { user: decoded };
  } catch (error) {
    return { error: "Invalid token", status: 401 };
  }
}
```

### Role-Based Access Control (RBAC)

```javascript
// lib/middleware/rbac.js
export function requireRole(allowedRoles) {
  return (user) => {
    if (!allowedRoles.includes(user.role)) {
      throw new Error("Forbidden");
    }
  };
}

// Usage in API route:
// POST /api/rooms/route.js (admin/manager only)
const user = await authMiddleware(request);
requireRole(["admin", "manager"])(user);
```

---

## 📡 API Response Format

### Success Response

```javascript
{
  success: true,
  data: { ... },
  message: "Operation successful",
  timestamp: "2025-11-26T10:30:00Z"
}
```

### Error Response

```javascript
{
  success: false,
  error: {
    code: "BOOKING_NOT_FOUND",
    message: "Booking with ID 123 not found",
    details: { ... }
  },
  timestamp: "2025-11-26T10:30:00Z"
}
```

---

## 🔧 Environment Variables (.env.local)

```bash
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hotel
# or for Prisma/PostgreSQL:
DATABASE_URL=postgresql://user:pass@localhost:5432/hotel

# Auth
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Client URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# File Upload
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email Service
RESEND_API_KEY=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# SMS Service
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Redis (for caching, rate limiting)
REDIS_URL=redis://localhost:6379
```

---

## 🚀 API Endpoints Summary

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Rooms

- `GET /api/rooms` - List all rooms (with filters)
- `POST /api/rooms` - Create new room (admin)
- `GET /api/rooms/:id` - Get room details
- `PUT /api/rooms/:id` - Update room (admin)
- `DELETE /api/rooms/:id` - Delete room (admin)
- `GET /api/rooms/available` - Check room availability

### Bookings

- `GET /api/bookings` - List bookings (filtered by user role)
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/confirm` - Confirm booking
- `GET /api/bookings/user/:userId` - Get user bookings

### Guests

- `GET /api/guests` - List all guests
- `POST /api/guests` - Register new guest
- `GET /api/guests/:id` - Get guest details
- `PUT /api/guests/:id` - Update guest info
- `GET /api/guests/search` - Search guests

### Payments

- `GET /api/payments` - List payments
- `POST /api/payments` - Process payment
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments/webhook` - Payment gateway webhook
- `POST /api/payments/refund` - Process refund

### Staff

- `GET /api/staff` - List staff members
- `POST /api/staff` - Add new staff
- `GET /api/staff/:id` - Get staff details
- `PUT /api/staff/:id` - Update staff
- `GET/POST /api/staff/schedule` - Manage schedules

### Services

- `GET /api/services` - List available services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `POST /api/services/bookings` - Book a service

### Housekeeping

- `GET /api/housekeeping` - List cleaning tasks
- `POST /api/housekeeping` - Create task
- `PUT /api/housekeeping/:id` - Update task status
- `POST /api/housekeeping/assign` - Assign task to staff

### Reports

- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/occupancy` - Occupancy report
- `GET /api/reports/bookings` - Booking statistics

---

## 🛠️ Technology Stack

### Core

- **Next.js 14+** (App Router)
- **React 18+**
- **TypeScript** (recommended)

### Database

- **MongoDB + Mongoose** (recommended for flexibility)
- Or **PostgreSQL + Prisma** (for relational data)

### Authentication

- **JWT** (jsonwebtoken)
- **bcryptjs** (password hashing)
- Or **NextAuth.js** (for OAuth, social login)

### Validation

- **Zod** (schema validation)

### File Upload

- **Cloudinary** (images)
- **AWS S3** (alternative)

### Payment

- **Stripe**
- **PayPal**

### Email/SMS

- **Resend** or **Nodemailer** (email)
- **Twilio** (SMS)

### Caching & Rate Limiting

- **Upstash Redis**
- **Vercel KV**

---

## 📝 Implementation Example

### Sample API Route: POST /api/bookings/route.js

```javascript
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import Booking from "@/lib/models/Booking";
import Room from "@/lib/models/Room";
import { authMiddleware } from "@/lib/middleware/auth";
import { validateBooking } from "@/lib/utils/validators";

export async function POST(request) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = validateBooking(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Check room availability
    const room = await Room.findById(body.roomId);
    if (!room || room.status !== "available") {
      return NextResponse.json({ success: false, error: "Room not available" }, { status: 400 });
    }

    // Create booking
    const booking = await Booking.create({
      ...body,
      createdBy: user.id,
      bookingNumber: generateBookingNumber(),
      status: "pending"
    });

    // Update room status
    await Room.findByIdAndUpdate(body.roomId, { status: "occupied" });

    // Send confirmation email
    await sendBookingConfirmation(booking);

    return NextResponse.json(
      { success: true, data: booking, message: "Booking created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
```

---

## 🎯 Best Practices

1. **Separation of Concerns**: Keep business logic in services, not in API routes
2. **Validation**: Always validate input using Zod or similar
3. **Error Handling**: Use try-catch and return consistent error responses
4. **Authentication**: Protect all sensitive endpoints
5. **Rate Limiting**: Prevent abuse with rate limiting middleware
6. **Logging**: Log important events and errors
7. **Database Indexing**: Index frequently queried fields (bookingNumber, email, roomNumber)
8. **Caching**: Cache frequently accessed data (room availability, pricing)
9. **Testing**: Write unit and integration tests for critical paths
10. **Documentation**: Use OpenAPI/Swagger for API documentation

---

## 📚 Additional Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Stripe Integration Guide](https://stripe.com/docs/payments/quickstart)

---

**Created:** November 26, 2025  
**Version:** 1.0
