## API Gateway Checklist
```
Auth Service (4001)           ✅
├── register                  ✅
├── login                      ✅ (need to implement)
├── verify token              ✅
└── role management           ⚠️ (partially done)

Hotel Service (4002)          ❌ EMPTY
├── create hotel
├── get all hotels
├── update hotel
└── delete hotel

Guest Service (4003)          ❌ MISSING
├── create guest
├── get guest
├── update guest
└── delete guest

Room Service (4004)           ❌ EMPTY
├── create room
├── get available rooms
├── update room status
└── delete room

Booking Service (4005)        ❌ MISSING
├── create booking
├── get booking
├── update booking
└── cancel booking

Transaction Service (4006)    ❌ MISSING
├── create transaction
├── get folio
├── calculate balance
└── process payment

API Gateway (5000)            ❌ MISSING
└── Route all requests

```