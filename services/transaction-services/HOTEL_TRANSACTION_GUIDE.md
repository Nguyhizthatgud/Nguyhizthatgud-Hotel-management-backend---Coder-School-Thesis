# Hotel Transaction System - Business Logic Guide

## Overview
The transaction service manages all financial transactions for hotel operations including room charges, amenities, and payments.

---

## Key Concepts

### 1. **Folio (Guest Bill)**
A folio is the running tab of all charges for a guest's stay. It includes:
- Room charges
- Service charges (car rental, laundry, etc.)
- Payments made
- Outstanding balance

### 2. **Transaction Types**

| Type | Description | When Created |
|------|-------------|--------------|
| `room` | Room nightly charges | At check-in or during stay |
| `car-rental` | Car rental service | When guest rents car |
| `laundry` | Laundry service | When guest uses laundry |
| `restaurant` | Restaurant/room service | When guest orders food |
| `spa` | Spa/massage services | When guest books spa |
| `minibar` | Minibar consumption | Daily or at checkout |
| `parking` | Parking fees | Daily or at checkout |
| `other` | Miscellaneous charges | As needed |

### 3. **Transaction Status**
- `pending` - Charge posted but not yet paid
- `completed` - Payment received
- `failed` - Payment failed or cancelled

### 4. **Payment Methods**
- `credit-card`
- `debit-card`
- `cash`
- `bank-transfer`

---

## Business Flow

### Typical Guest Journey

```
1. BOOKING CREATED
   └─> Optional: Create deposit transaction

2. CHECK-IN (Day 1)
   └─> Create room charge transaction for entire stay
       OR create daily room charges

3. DURING STAY
   └─> Guest uses car rental → Create car-rental transaction
   └─> Guest uses laundry → Create laundry transaction
   └─> Guest orders room service → Create restaurant transaction

4. CHECK-OUT
   └─> Generate folio (bill summary)
   └─> Guest reviews all charges
   └─> Process payment → Mark all transactions as "completed"

5. POST-CHECKOUT
   └─> Possible adjustments or refunds
```

---

## API Endpoints

### Create Transaction
```http
POST /api/transactions
Content-Type: application/json
x-user-id: {userId}
x-user-email: {userEmail}

{
  "reservationId": "BK0001",
  "type": "car-rental",
  "category": "Sedan - 3 days",
  "amount": 150.00,
  "description": "Toyota Camry rental"
}
```

### Get All Transactions
```http
GET /api/transactions
GET /api/transactions?reservationId=BK0001
GET /api/transactions?status=pending
GET /api/transactions?type=room
```

### Get Guest Folio (Bill)
```http
GET /api/transactions/folio/BK0001

Response:
{
  "reservationId": "BK0001",
  "guestName": "John Doe",
  "transactions": [...],
  "summary": {
    "totalCharges": 750.00,
    "totalPaid": 0,
    "balance": 750.00,
    "byType": {
      "room": 500.00,
      "car-rental": 150.00,
      "laundry": 100.00
    }
  }
}
```

### Process Payment
```http
POST /api/transactions/folio/BK0001/pay
Content-Type: application/json

{
  "paymentMethod": "credit-card"
}
```

### Update Transaction Status
```http
PATCH /api/transactions/{transactionId}/status
Content-Type: application/json

{
  "status": "completed",
  "paymentMethod": "cash"
}
```

---

## Implementation Examples

### Example 1: Create Room Charge at Check-In

```javascript
// When guest checks in, create room charge transaction
const nightlyRate = 100;
const numberOfNights = 3;
const totalRoomCharge = nightlyRate * numberOfNights;

await axios.post('/api/transactions', {
  reservationId: 'BK0001',
  type: 'room',
  category: 'Deluxe Room - 3 nights',
  amount: totalRoomCharge, // 300
  description: 'Room charge for 3 nights at $100/night'
});
```

### Example 2: Guest Uses Laundry Service

```javascript
// During stay, guest drops off laundry
await axios.post('/api/transactions', {
  reservationId: 'BK0001',
  type: 'laundry',
  category: 'Express laundry - 5 items',
  amount: 25.00,
  description: '2 shirts, 2 pants, 1 dress'
});
```

### Example 3: Check-Out & Payment

```javascript
// Step 1: Get folio to show guest
const folio = await axios.get('/api/transactions/folio/BK0001');
console.log(`Total: $${folio.summary.totalCharges}`);

// Step 2: Guest pays entire bill with credit card
await axios.post('/api/transactions/folio/BK0001/pay', {
  paymentMethod: 'credit-card'
});
// All pending transactions now marked as "completed"
```

### Example 4: Partial Payment

```javascript
// Guest pays for specific transaction only
await axios.patch('/api/transactions/TXN0001/status', {
  status: 'completed',
  paymentMethod: 'cash'
});
```

---

## Business Rules to Implement

### ✅ What You Should Do:

1. **Always link to booking**: Every transaction MUST have a `reservationId`
2. **Verify booking exists**: Check booking service before creating transaction
3. **Auto-fill guest info**: Get guestName, guestEmail from booking if not provided
4. **Start as pending**: New transactions should be `status: "pending"`
5. **Track creation time**: Store date and time of transaction
6. **Allow descriptions**: Let staff add notes about the charge

### ❌ Common Mistakes to Avoid:

1. Don't allow transactions without a booking
2. Don't allow negative amounts
3. Don't delete transactions (mark as "failed" instead for audit trail)
4. Don't allow changing amount after creation (create adjustment transaction instead)

---

## Advanced Features (Future Enhancements)

### 1. **Tax Calculation**
```javascript
const subtotal = 100;
const taxRate = 0.10; // 10% tax
const taxAmount = subtotal * taxRate;
const total = subtotal + taxAmount;

await Transaction.create({
  ...
  amount: subtotal,
  taxAmount: taxAmount,
  totalAmount: total
});
```

### 2. **Deposits & Prepayments**
```javascript
// At booking time, charge deposit
await Transaction.create({
  reservationId: 'BK0001',
  type: 'deposit',
  category: 'Security deposit',
  amount: 100,
  status: 'completed', // Already paid
  paymentMethod: 'credit-card'
});
```

### 3. **Split Billing**
```javascript
// Corporate pays room, guest pays amenities
transactions.forEach(txn => {
  if (txn.type === 'room') {
    txn.payer = 'corporate';
  } else {
    txn.payer = 'guest';
  }
});
```

### 4. **Currency Conversion**
```javascript
const transaction = {
  amount: 100,
  currency: 'USD',
  exchangeRate: 1.2,
  amountInLocalCurrency: 120 // EUR
};
```

---

## Testing Scenarios

### Scenario 1: Full Stay Transaction Flow
```
1. Create booking BK0001
2. Create room transaction for 3 nights @ $100 = $300
3. Guest rents car: create car-rental transaction = $150
4. Guest uses laundry: create laundry transaction = $50
5. Get folio: Total = $500
6. Process payment with credit card
7. Verify all transactions marked as "completed"
```

### Scenario 2: Checkout with Issues
```
1. Get folio showing $500 total
2. Guest disputes laundry charge of $50
3. Update laundry transaction status to "failed"
4. Get updated folio: Total = $450
5. Process payment for remaining balance
```

---

## Database Design Tips

### Current Schema
```javascript
{
  transactionId: "TXN0001",
  reservationId: "BK0001",
  type: "room | car-rental | laundry | ...",
  category: "Description",
  amount: 100.00,
  status: "pending | completed | failed",
  paymentMethod: "credit-card | cash | ...",
  date: Date,
  time: String,
  guestName: String,
  guestEmail: String,
  description: String
}
```

### Recommended Additions (Future)
```javascript
{
  // ... existing fields ...
  taxAmount: Number,
  discountAmount: Number,
  netAmount: Number,
  currency: String,
  payer: String, // "guest" | "corporate" | "travel-agent"
  postedBy: String, // Staff who created transaction
  voidedBy: String, // Staff who voided transaction
  voidReason: String
}
```

---

## Integration Points

### With Booking Service
- Verify booking exists before creating transaction
- Get guest info (name, email, phone)
- Calculate room charges based on check-in/checkout dates

### With Room Service
- Get room type and nightly rate
- Verify room amenities included/excluded

### With Frontend
- Display folio at checkout
- Show running balance during stay
- Allow staff to post charges
- Print receipt after payment

---

## Summary

**The transaction service is like a restaurant receipt:**
- Each line item = 1 transaction
- All items for same table (booking) = folio
- At the end, calculate total and take payment
- Keep record for accounting and disputes

**Start simple:**
1. Create transactions when services used
2. Link to booking
3. Show folio (bill) at checkout
4. Mark as paid when payment received

**Expand later:**
- Add taxes
- Add discounts
- Add deposits
- Add split billing
- Add refunds
