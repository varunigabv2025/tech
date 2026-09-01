# TrustFlow Backend API Documentation

This documentation provides details for all implemented REST API endpoints in the TrustFlow backend system. It is designed for Person 2 (Unit Dashboard) and Person 3 (TReDS/Financier Integration).

> [!NOTE]
> **Hackathon Architecture Notes:**
> - **Mock Connectors**: GST and Account Aggregator (AA) connectors are deterministic mock services built using realistic profile fixtures for hackathon demonstration purposes.
> - **TrustScore Engine**: TrustScore is calculated using a rule-based, 100-point deterministic formula (not Machine Learning).

---

## Invoice Status Lifecycle

The `status` field of an invoice progresses through the following values based on verification and scoring steps:

- `PENDING_VERIFICATION`: Initial status when an invoice is created for a delivered order.
- `VERIFIED`: Invoice passed GST, delivery, and Account Aggregator checks during verification.
- `VERIFICATION_FAILED`: Invoice failed verification checks (e.g., undelivered order or inactive GST).
- `FINANCE_READY`: TrustScore calculated ≥ 90.00. High confidence for instant financing / TReDS onboarding.
- `REVIEW`: TrustScore calculated between 70.00 and 89.99. Manual underwriting recommended.
- `AT_RISK`: TrustScore calculated < 70.00. High risk factor present.

---

## Frontend Integration Flow

```
1. Create Unit (POST /api/units)
       │
       ▼
2. Create Order (POST /api/orders)
       │
       ▼
3. Mark Delivery (POST /api/orders/:id/deliver)
       │
       ▼
4. Create Invoice (POST /api/invoices)
       │
       ▼
5. Verify Invoice (POST /api/invoices/:id/verify)
       │
       ▼
6. Get TrustScore (GET /api/invoices/:id/score)
       │
       ▼
7. Display Invoice Status & TrustScore Breakdown on Dashboard
```

---

## Endpoints Summary

### 1. Health Check
- `GET /api/health`

### 2. Unit Management
- `POST /api/units`

### 3. Order Management
- `POST /api/orders`
- `POST /api/orders/:id/deliver`
- `GET /api/orders`

### 4. Invoice & Verification Management
- `POST /api/invoices`
- `GET /api/invoices`
- `GET /api/invoices/:id`
- `POST /api/invoices/:id/verify`
- `GET /api/invoices/:id/score`

---

## Endpoint Details

### Health Check

#### `GET /api/health`
- **Purpose**: Verify backend server health and status.
- **Request Body**: None
- **Example Request**: `GET /api/health`
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "TrustFlow backend is running"
  }
  ```
- **What Frontend Should Use This For**: Liveness check before loading dashboard.

---

### Unit Endpoints

#### `POST /api/units`
- **Purpose**: Register a new manufacturing / MSME unit.
- **Request Body**:
  ```json
  {
    "name": "Kumar Knitwear Works",
    "gstNumber": "33ABCDE1234F1Z5",
    "contact": "9876543210"
  }
  ```
- **Fields**:
  - `name` (string, required): Business or unit name.
  - `gstNumber` (string, required): GST identification number.
  - `contact` (string, optional): Primary contact number.
- **Success Response** (`201 Created`):
  ```json
  {
    "success": true,
    "unit": {
      "id": "U001",
      "name": "Kumar Knitwear Works",
      "gstNumber": "33ABCDE1234F1Z5",
      "contact": "9876543210"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing/empty `name` or `gstNumber`.
    ```json
    { "success": false, "message": "Name is required and must not be empty" }
    ```
- **What Frontend Should Use This For**: Unit onboarding form submission.

---

### Order Endpoints

#### `POST /api/orders`
- **Purpose**: Create a purchase/supply order associated with a unit.
- **Request Body**:
  ```json
  {
    "unitId": "U001",
    "buyerName": "ABC Exports",
    "description": "5000 knitted T-shirts",
    "amount": 482500,
    "orderDate": "2026-09-01"
  }
  ```
- **Fields**:
  - `unitId` (string, required): Valid existing unit ID.
  - `buyerName` (string, required): Buyer/Enterprise name.
  - `description` (string, required): Goods or service details.
  - `amount` (number, required): Order value (> 0).
  - `orderDate` (string, required): Date of order placement (`YYYY-MM-DD`).
- **Success Response** (`201 Created`):
  ```json
  {
    "success": true,
    "order": {
      "id": "ORD001",
      "unitId": "U001",
      "buyerName": "ABC Exports",
      "description": "5000 knitted T-shirts",
      "amount": 482500,
      "orderDate": "2026-09-01",
      "deliveryStatus": "PENDING",
      "deliveryDate": null,
      "createdAt": "2026-09-01 16:06:35"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid or missing `unitId`, `buyerName`, `description`, `amount` (≤ 0), or `orderDate`.
- **What Frontend Should Use This For**: Order entry form in Unit Dashboard.

#### `POST /api/orders/:id/deliver`
- **Purpose**: Mark an order as delivered.
- **Request Body**: None
- **Example Request**: `POST /api/orders/ORD001/deliver`
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "order": {
      "id": "ORD001",
      "unitId": "U001",
      "buyerName": "ABC Exports",
      "description": "5000 knitted T-shirts",
      "amount": 482500,
      "orderDate": "2026-09-01",
      "deliveryStatus": "DELIVERED",
      "deliveryDate": "2026-09-01",
      "createdAt": "2026-09-01 16:06:35"
    }
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Order does not exist.
  - `400 Bad Request`: Order has already been delivered.
- **What Frontend Should Use This For**: "Confirm Delivery" button action in order table.

#### `GET /api/orders`
- **Purpose**: Retrieve all orders.
- **Request Body**: None
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "orders": [
      {
        "id": "ORD001",
        "unitId": "U001",
        "buyerName": "ABC Exports",
        "description": "5000 knitted T-shirts",
        "amount": 482500,
        "orderDate": "2026-09-01",
        "deliveryStatus": "DELIVERED",
        "deliveryDate": "2026-09-01",
        "createdAt": "2026-09-01 16:06:35"
      }
    ]
  }
  ```
- **What Frontend Should Use This For**: Populating the orders list table in Unit Dashboard.

---

### Invoice & Verification Endpoints

#### `POST /api/invoices`
- **Purpose**: Generate an invoice for a delivered order.
- **Request Body**:
  ```json
  {
    "orderId": "ORD001"
  }
  ```
- **Success Response** (`201 Created`):
  ```json
  {
    "success": true,
    "invoice": {
      "id": "INV001",
      "orderId": "ORD001",
      "unitId": "U001",
      "buyerName": "ABC Exports",
      "amount": 482500,
      "invoiceDate": "2026-09-01",
      "dueDate": "2026-10-16",
      "delivered": true,
      "verified": false,
      "status": "PENDING_VERIFICATION",
      "trustScore": null
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `orderId` missing, order undelivered, or invoice already exists for `orderId`.
  - `404 Not Found`: `orderId` does not exist.
- **What Frontend Should Use This For**: "Generate Invoice" action for delivered orders.

#### `GET /api/invoices`
- **Purpose**: Retrieve all invoices.
- **Request Body**: None
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "invoices": [
      {
        "id": "INV001",
        "orderId": "ORD001",
        "unitId": "U001",
        "buyerName": "ABC Exports",
        "amount": 482500,
        "invoiceDate": "2026-09-01",
        "dueDate": "2026-10-16",
        "delivered": true,
        "verified": false,
        "status": "PENDING_VERIFICATION",
        "trustScore": null
      }
    ]
  }
  ```
- **What Frontend Should Use This For**: Displaying invoice table in Unit & Financier views.

#### `GET /api/invoices/:id`
- **Purpose**: Retrieve details for a specific invoice.
- **Request Body**: None
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "invoice": {
      "id": "INV001",
      "orderId": "ORD001",
      "unitId": "U001",
      "buyerName": "ABC Exports",
      "amount": 482500,
      "invoiceDate": "2026-09-01",
      "dueDate": "2026-10-16",
      "delivered": true,
      "verified": false,
      "status": "PENDING_VERIFICATION",
      "trustScore": null
    }
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Invoice ID does not exist.
- **What Frontend Should Use This For**: Invoice detail modal / page.

#### `POST /api/invoices/:id/verify`
- **Purpose**: Verify invoice against mock GST filings and Account Aggregator bank flows.
- **Request Body**: None
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Invoice verified successfully",
    "invoice": {
      "id": "INV001",
      "orderId": "ORD001",
      "unitId": "U001",
      "buyerName": "ABC Exports",
      "amount": 482500,
      "invoiceDate": "2026-09-01",
      "dueDate": "2026-10-16",
      "delivered": true,
      "verified": true,
      "status": "VERIFIED",
      "trustScore": null
    },
    "verification": {
      "gst": {
        "gstNumber": "33ABCDE1234F1Z5",
        "gstActive": true,
        "filingConsistency": 95.8,
        "filingsOnTime": 23,
        "totalFilings": 24,
        "lateFilings": 1
      },
      "accountAggregator": {
        "unitId": "U001",
        "monthsAnalyzed": 6,
        "averageMonthlyInflow": 845000,
        "monthlyInflows": [820000, 850000, 790000, 910000, 840000, 860000],
        "cashFlowStability": 95.6
      }
    }
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Invoice or associated unit not found.
  - `400 Bad Request`: Verification failed (e.g. GST inactive or order undelivered). Status updated to `VERIFICATION_FAILED`.
- **What Frontend Should Use This For**: "Verify Invoice" button action; renders GST filing consistency and AA cash flow charts.

#### `GET /api/invoices/:id/score`
- **Purpose**: Compute and retrieve deterministic 100-point TrustScore for a verified invoice.
- **Request Body**: None
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "invoiceId": "INV001",
    "trustScore": 92.06,
    "status": "FINANCE_READY",
    "breakdown": {
      "gstConsistency": {
        "score": 19.16,
        "max": 20,
        "value": 95.8,
        "explanation": "GST filing consistency is 95.8%, contributing 19.16 out of 20 points."
      },
      "buyerVerification": {
        "score": 20,
        "max": 20,
        "value": true,
        "explanation": "Buyer verification was successful, contributing 20 out of 20 points."
      },
      "deliveryConfirmed": {
        "score": 15,
        "max": 15,
        "value": true,
        "explanation": "Delivery has been confirmed, contributing 15 out of 15 points."
      },
      "daysOutstanding": {
        "score": 14,
        "max": 20,
        "value": 37,
        "explanation": "The invoice has been outstanding for 37 days, contributing 14 out of 20 points."
      },
      "cashFlowStability": {
        "score": 23.9,
        "max": 25,
        "value": 95.6,
        "explanation": "Cash-flow stability is 95.6%, contributing 23.9 out of 25 points."
      }
    },
    "totalPossible": 100
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Invoice or associated unit not found.
  - `400 Bad Request`: Invoice has not been verified yet (`verified === false`).
- **What Frontend Should Use This For**: "Calculate TrustScore" action; populates Financier/TReDS underwriting widget, score badges, and factor progress bars.
