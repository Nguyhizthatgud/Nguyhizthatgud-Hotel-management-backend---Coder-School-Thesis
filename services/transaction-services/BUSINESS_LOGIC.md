# Transaction Service - Quick Start

## What You Built

A complete transaction system for hotel operations that tracks:

- Room charges
- Service charges (car rental, laundry, etc.)
- Payments
- Guest bills (folios)

## How to Use It

### 1. When Guest Checks In

Create a room charge transaction:

```bash
POST /api/transactions
{
  "reservationId": "BK0001",
  "type": "room",
  "category": "Deluxe Room - 3 nights",
  "amount": 300.00
}
```

### 2. When Guest Uses Services

Add service charges:

```bash
# Guest rents car
POST /api/transactions
{
  "reservationId": "BK0001",
  "type": "car-rental",
  "category": "Sedan - Daily",
  "amount": 50.00
}

# Guest uses laundry
POST /api/transactions
{
  "reservationId": "BK0001",
  "type": "laundry",
  "category": "Express - 5 items",
  "amount": 25.00
}
```

### 3. At Checkout

Get the bill (folio):

```bash
GET /api/transactions/folio/BK0001

# Returns:
{
  "summary": {
    "totalCharges": 375.00,
    "totalPaid": 0,
    "balance": 375.00,
    "byType": {
      "room": 300.00,
      "car-rental": 50.00,
      "laundry": 25.00
    }
  }
}
```

Process payment:

```bash
POST /api/transactions/folio/BK0001/pay
{
  "paymentMethod": "credit-card"
}
```

## Transaction Types You Can Use

| Type         | Example Use Case         |
| ------------ | ------------------------ |
| `room`       | Nightly room charges     |
| `car-rental` | Car rental service       |
| `laundry`    | Laundry/dry cleaning     |
| `restaurant` | Room service, restaurant |
| `spa`        | Spa, massage, wellness   |
| `minibar`    | Minibar consumption      |
| `parking`    | Parking fees             |
| `other`      | Any other charges        |

## Key Files Created

1. **Controller**: `services/transaction-services/src/controllers/transactionController.js`
   - All business logic
   - Transaction CRUD
   - Folio generation
   - Payment processing

2. **Routes**: `services/transaction-services/src/routes/transactionRoutes.js`
   - API endpoints

3. **Models**:
   - `Transaction.js` - Transaction schema
   - `Counter.js` - ID generation

4. **Utils**: `utils/idGenerator.js`
   - Auto-generates TXN0001, TXN0002, etc.

5. **Docs**: `HOTEL_TRANSACTION_GUIDE.md`
   - Complete business logic guide

## Next Steps

1. **Test the API**: Use Postman or similar to create transactions
2. **Integrate with frontend**: Show folio at checkout
3. **Add features**:
   - Tax calculation
   - Discounts
   - Partial payments
   - Receipt printing

## Questions?

Read the full guide: `HOTEL_TRANSACTION_GUIDE.md`
