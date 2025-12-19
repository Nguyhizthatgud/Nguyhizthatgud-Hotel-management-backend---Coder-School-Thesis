// api-gateway/config/services.js
/**
 * Service endpoints configuration
 * Maps service names to their URLs
 */

const services = {
    auth: {
        url: process.env.AUTH_SERVICE_URL || "http://localhost:3002",
        name: "auth-service",
        routes: [
            { method: "POST", path: "/register", public: true },
            { method: "POST", path: "/login", public: true },
            { method: "POST", path: "/logout", public: false },
            { method: "POST", path: "/refresh", public: true },
            { method: "GET", path: "/me", public: false }
        ]
    },
    room: {
        url: process.env.ROOM_SERVICE_URL || "http://localhost:3003",
        name: "room-service",
        routes: [
            { method: "GET", path: "/rooms", public: true },
            { method: "POST", path: "/rooms", public: false, roles: ["admin", "manager"] },
            { method: "GET", path: "/rooms/:id", public: true },
            { method: "PUT", path: "/rooms/:id", public: false, roles: ["admin", "manager"] },
            { method: "DELETE", path: "/rooms/:id", public: false, roles: ["admin"] }
        ]
    },
    booking: {
        url: process.env.BOOKING_SERVICE_URL || "http://localhost:3004",
        name: "booking-service",
        routes: [
            { method: "GET", path: "/bookings", public: false },
            { method: "POST", path: "/bookings", public: false },
            { method: "GET", path: "/bookings/:id", public: false },
            { method: "PUT", path: "/bookings/:id", public: false },
            { method: "POST", path: "/bookings/:id/cancel", public: false }
        ]
    },
    guest: {
        url: process.env.GUEST_SERVICE_URL || "http://localhost:3005",
        name: "guest-service",
        routes: [
            { method: "GET", path: "/guests", public: false, roles: ["admin", "manager", "receptionist"] },
            { method: "POST", path: "/guests", public: false },
            { method: "GET", path: "/guests/:id", public: false },
            { method: "PUT", path: "/guests/:id", public: false }
        ]
    },
    staff: {
        url: process.env.STAFF_SERVICE_URL || "http://localhost:3006",
        name: "staff-service",
        routes: [
            { method: "GET", path: "/staff", public: false, roles: ["admin", "manager"] },
            { method: "POST", path: "/staff", public: false, roles: ["admin", "manager"] },
            { method: "GET", path: "/staff/:id", public: false, roles: ["admin", "manager"] },
            { method: "PUT", path: "/staff/:id", public: false, roles: ["admin", "manager"] }
        ]
    },
    transaction: {
        url: process.env.TRANSACTION_SERVICE_URL || "http://localhost:3007",
        name: "transaction-service",
        routes: [
            { method: "GET", path: "/transactions", public: false, roles: ["admin", "manager"] },
            { method: "POST", path: "/transactions", public: false },
            { method: "GET", path: "/transactions/:id", public: false }
        ]
    }
};

module.exports = services;
