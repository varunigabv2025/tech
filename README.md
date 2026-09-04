# TrustFlow

### MSME Receivables & Financing Readiness Platform

TrustFlow is a financing-readiness platform designed to help MSMEs convert verified receivables into financing opportunities.

It connects the complete receivables journey:

**Order → Delivery → Invoice → Verification → TrustScore → TReDS → Financier**

The platform brings together invoice verification, buyer and delivery signals, cash-flow stability, payment ageing, explainable credit readiness, TReDS packaging, and financier underwriting into one workflow.

---

## Overview

MSMEs often have legitimate invoices and receivables but face difficulty accessing timely working capital.

TrustFlow addresses this by creating a structured financing-readiness workflow around each invoice.

Instead of treating an invoice as just a document, TrustFlow evaluates multiple signals:

- GST consistency
- Buyer verification
- Delivery confirmation
- Invoice ageing
- Cash-flow stability

These signals are combined into an **explainable 100-point TrustScore**.

Invoices that meet the financing-readiness threshold can then be packaged for a TReDS workflow and reviewed by a financier.

---

## Core Workflow

```text
                    TRUSTFLOW

        ┌─────────────────────────────┐
        │         MSME Unit            │
        └──────────────┬──────────────┘
                       │
                       ▼
                Create Order
                       │
                       ▼
              Confirm Delivery
                       │
                       ▼
                Generate Invoice
                       │
                       ▼
             Verify Invoice Data
                 ┌─────┴─────┐
                 │           │
                GST         AA
             Verification  Consent
                 │           │
                 └─────┬─────┘
                       │
                       ▼
                TrustScore Engine
                       │
          ┌────────────┼────────────┐
          │            │            │
       Finance      Review       At Risk
        Ready
          │
          ▼
                 TReDS Packaging
                       │
                       ▼
                Financier Desk
                       │
             ┌─────────┴─────────┐
             │                   │
          Accept               Decline
             │
             ▼
       90% Advance
        Disbursement
             │
             ▼
       Buyer Term Settlement
             │
             ▼
           Settled
Key Features
1. MSME Authentication

TrustFlow supports role-based authentication for:

MSME users
Financier users

Authentication uses:

JWT-based sessions
HttpOnly cookies
Password hashing with bcrypt
Role-based access control
Protected frontend routes
Unit ownership isolation
Login rate limiting
Password policy enforcement

Authentication tokens are not exposed through JavaScript-accessible local storage.

2. Order → Delivery → Invoice Workflow

MSMEs can manage their receivables lifecycle starting from an order.

Workflow
Order Created
      ↓
Delivery Confirmed
      ↓
Invoice Generated
      ↓
Invoice Verified
      ↓
TrustScore Calculated

This provides traceability between the underlying business transaction and the resulting receivable.

3. GST Verification

TrustFlow includes a GST verification layer as part of invoice verification.

The verification signal contributes to the TrustScore.

Current implementation

The GST connector is implemented as a mock/demo connector representing the type of verification that could be performed against an authorized GST integration in a production deployment.

The platform does not claim to perform live government verification in the current demo environment.

4. Account Aggregator Cash-Flow Verification

TrustFlow incorporates Account Aggregator (AA) consent-based financial data into the financing-readiness workflow.

The conceptual flow is:

MSME Consent
     ↓
Account Aggregator
     ↓
Financial Account Data
     ↓
Cash-Flow Analysis
     ↓
TrustScore

The system uses cash-flow stability as one of the TrustScore factors.

The Financier Desk also includes an interactive consent flow demonstrating how purpose-bound financial data access could work without asking the MSME to share net-banking credentials.

Current implementation

The AA data in this MVP is mock/simulated data.

A production deployment would integrate with an authorized Account Aggregator ecosystem/provider.

5. Explainable TrustScore

TrustFlow uses a deterministic, rule-based scoring engine rather than a black-box machine-learning model.

The TrustScore ranges from:

0 → 100

Scoring Factors
Factor	Maximum Points
GST Consistency	20
Buyer Verification	20
Delivery Confirmation	15
Days Outstanding	20
Cash-Flow Stability	25
Total	100

Every score can be broken down into its individual contributing factors.

This makes the score easier for both MSMEs and financiers to understand.

TrustScore Formula
GST Consistency
GST Points = (GST Filing Consistency / 100) × 20
Buyer Verification
Verified Buyer = 20 points
Unverified Buyer = 0 points
Delivery Confirmation
Confirmed Delivery = 15 points
Unconfirmed Delivery = 0 points
Days Outstanding
Days Outstanding	Points
0–15	20
16–30	18
31–45	14
46–60	8
61–90	4
91+	0
Cash-Flow Stability
Cash-Flow Points = (Stability Score / 100) × 25

The final TrustScore is calculated from the five factors and constrained to a range of 0–100.

Example TrustScore

For a high-quality verified invoice:

GST Consistency       19.16 / 20
Buyer Verification    20.00 / 20
Delivery Confirmation 15.00 / 15
Days Outstanding      20.00 / 20
Cash-Flow Stability   23.90 / 25
                      ------------
Total                 98.06 / 100

Result:

TrustScore: 98.06
Status: FINANCE_READY

The application displays the factor breakdown directly in the UI.

6. Financing Readiness

TrustFlow categorizes invoices according to their financing readiness.

Finance Ready

High-confidence invoices that satisfy the financing-readiness threshold can proceed to TReDS packaging.

Review

Invoices requiring additional review remain visible to the financier but cannot automatically proceed as finance-ready opportunities.

At Risk

Invoices with weaker verification signals or significant ageing are flagged for attention.

7. MSMED 45-Day Payment Monitoring

TrustFlow monitors invoice ageing against the 45-day MSMED payment timeline.

The Unit App displays ageing states such as:

State	Days
Healthy	0–30
Approaching Threshold	31–44
Threshold Reached	45
Overdue	>45

The dashboard provides a dedicated:

45-Day MSMED Payment Monitoring Summary

This helps MSMEs identify receivables approaching or exceeding the payment threshold.

8. ODR Complaint Draft

For overdue invoices, TrustFlow can generate a pre-populated demo ODR complaint draft.

The draft can include:

MSME/unit details
GSTIN
Buyer details
Invoice number
Invoice amount
Invoice date
Due date
Days outstanding
Relevant payment-term statement

The application clearly identifies the document as a:

DEMO DRAFT — NOT SUBMITTED

The current implementation does not automatically submit a complaint to a government portal.

9. TReDS Packaging

Finance-ready invoices can be packaged into a TReDS-style financing instrument.

Flow
Finance Ready Invoice
        ↓
TReDS Package
        ↓
Financier Review
        ↓
Accept & Disburse
        ↓
90% Advance
        ↓
Buyer Term Settlement
        ↓
Settled

The application demonstrates the receivable financing lifecycle using the project's TReDS integration layer.

RXIL is represented as the TReDS exchange integration in the demo workflow.

10. Financier Desk

The Financier Desk provides a dedicated interface for reviewing financing opportunities.

It includes:

Invoice opportunity dashboard
Finance-ready filtering
Pending review filtering
At-risk filtering
TrustScore visualization
TrustScore factor breakdown
Invoice and TReDS instrument details
Financing actions
Advance disbursement simulation
Term settlement simulation
Account Aggregator consent flow

The Financier Desk uses the same TrustFlow visual language as the MSME Unit App.

11. Financing Example

For an invoice worth:

₹4,82,500

The demo financing workflow can simulate:

Invoice Value        ₹4,82,500
       ↓
90% Advance          ₹4,34,250
       ↓
10% Holdback         ₹48,250
       ↓
Buyer Term Settlement
       ↓
Full Settlement      ₹4,82,500

These values demonstrate the financing workflow in the MVP environment.

Application Architecture
┌──────────────────────────────────────────────────────────────┐
│                        TrustFlow                              │
├──────────────────────────┬───────────────────────────────────┤
│                          │                                   │
│      MSME Unit App       │        Financier Desk             │
│        Port 3000         │          Port 3001                │
│                          │                                   │
│  Dashboard               │  Invoice Inbox                   │
│  Orders                  │  Underwriting                    │
│  Invoices                │  TrustScore                      │
│  Verification            │  TReDS                           │
│  MSMED Monitoring        │  Disbursement                    │
│  ODR Draft               │  Settlement                      │
│                          │  AA Consent                      │
└──────────────┬───────────┴───────────────────┬───────────────┘
               │                               │
               └───────────────┬───────────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │   Express Backend  │
                    │      Port 5000     │
                    ├────────────────────┤
                    │ Auth               │
                    │ Orders             │
                    │ Invoices           │
                    │ Verification       │
                    │ TrustScore          │
                    │ TReDS              │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │      SQLite        │
                    │                    │
                    │ users              │
                    │ units              │
                    │ orders             │
                    │ invoices           │
                    │ scores             │
                    └────────────────────┘
Technology Stack
Backend
Node.js
Express
SQLite
better-sqlite3
JWT
bcryptjs
cookie-parser
Helmet
express-rate-limit
MSME Unit App
Next.js
React
Tailwind CSS
Financier Desk
Next.js
React
Tailwind CSS
Project Structure
trustflow/
│
├── backend/
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   │
│   ├── unit-app/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   └── lib/
│   │
│   ├── financier-app/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   │
│   ├── test-auth.js
│   ├── AUTH.md
│   ├── API.md
│   ├── package.json
│   └── .env.example
│
└── README.md
Authentication & Security

TrustFlow uses an HttpOnly cookie-based authentication architecture.

Authentication Flow
Login
  ↓
Backend validates credentials
  ↓
JWT generated
  ↓
HttpOnly cookie
  ↓
Browser automatically sends cookie
  ↓
Backend validates session

The authentication cookie is:

HttpOnly
SameSite protected
Secure in production
Path restricted to /
Time limited

Additional security measures include:

Password hashing
Password length policy
Login rate limiting
Helmet security headers
Explicit CORS configuration
Role-based authorization
Unit ownership validation
Protected frontend routes
Demo Accounts

The development environment includes demo accounts.

MSME
Email: msme@trustflow.demo
Password: TrustFlow@123
Role: MSME
Unit: Kumar Knitwear Works
Financier
Email: financier@trustflow.demo
Password: TrustFlow@123
Role: FINANCIER

These credentials are for the local demo environment only and must not be used as production credentials.

Running the Project
Prerequisites

Install:

Node.js
npm
1. Start the Backend

Open a terminal:

cd backend
npm install
npm start

Backend:

http://localhost:5000

Health check:

http://localhost:5000/api/health
2. Start the MSME Unit App

Open another terminal:

cd backend/unit-app
npm install
npm run dev

Open:

http://localhost:3000
3. Start the Financier Desk

Open another terminal:

cd backend/financier-app
npm install
npm run dev

Open:

http://localhost:3001
Important Development Note

Do not run next dev and next build simultaneously against the same Next.js application directory.

If a stale .next build error occurs during development:

Stop the Next.js development server.
Delete the affected .next directory.
Restart the development server.

No dependency reinstallation is normally required for this issue.

Testing

TrustFlow includes an automated authentication and authorization security test suite.

Run:

cd backend
node test-auth.js

Current result:

TEST SUMMARY: 26 PASSED, 0 FAILED

The test suite covers:

MSME login
Financier login
HttpOnly cookie creation
JWT session validation
Missing authentication
Invalid authentication
Logout cookie clearing
Password policy
Registration
Wrong-password rejection
Invoice access
Role restrictions
Cross-unit ownership restrictions
Login rate limiting
Demo Data

The application includes representative invoice scenarios.

Invoice	Amount	Days Outstanding	TrustScore	Status
INV001	₹4,82,500	0	98.06	FINANCE_READY
INV002	₹3,50,000	35	86.24	REVIEW
INV003	₹2,10,000	70	39.61	AT_RISK
INV004	₹1,50,000	0	98.06	FINANCE_READY

These scenarios demonstrate different financing-readiness outcomes.

Suggested Demo Flow

For a complete product demonstration:

Step 1 — MSME Login

Login using:

msme@trustflow.demo
Step 2 — Create/Review Order

Show the MSME's order workflow.

Step 3 — Delivery Confirmation

Confirm delivery against an order.

Step 4 — Invoice

Generate and open the corresponding invoice.

Step 5 — Verification

Run:

GST verification
Account Aggregator cash-flow verification
Step 6 — TrustScore

Show the explainable TrustScore and factor breakdown.

Example:

98.06 / 100
FINANCE_READY
Step 7 — MSMED Monitoring

Show invoice ageing and the 45-day payment monitoring system.

Step 8 — TReDS

Package the finance-ready invoice.

Step 9 — Financier Desk

Open the Financier Desk and review the financing opportunity.

Step 10 — Financing

Demonstrate:

Accept & Disburse 90%
        ↓
Advance Disbursed
        ↓
Buyer Term Settlement
        ↓
Settled

This demonstrates the complete TrustFlow lifecycle.

Why TrustFlow?

Traditional invoice processing often separates:

Business transactions
Invoice verification
Financial data
Credit assessment
Financing
Payment monitoring

TrustFlow brings these signals together around the receivable.

The goal is to make an invoice:

Verified
   ↓
Scored
   ↓
Financing Ready
   ↓
Packaged
   ↓
Funded
   ↓
Settled

This creates a more structured financing-readiness journey for MSMEs and a clearer underwriting workflow for financiers.

Current MVP Scope

The current implementation demonstrates the complete product workflow using a controlled demo environment.

Implemented
MSME authentication
Financier authentication
Role-based authorization
Unit ownership isolation
HttpOnly authentication cookies
Order management
Delivery confirmation
Invoice generation
GST verification flow
Account Aggregator consent flow
Cash-flow stability analysis
Explainable TrustScore
MSMED 45-day ageing
ODR complaint draft
TReDS packaging
Financier underwriting
90% advance simulation
Term settlement simulation
Financier Desk
Authentication/security testing
Demo / Mock Components

The following components currently use simulated data or demo connectors:

GST verification
Account Aggregator financial data
Buyer verification
TReDS exchange behavior
Financing/disbursement simulation
ODR draft generation

These interfaces are structured so that authorized production integrations can be introduced later.

Production Roadmap

Potential next steps for a production deployment include:

Live GST verification integration
Authorized Account Aggregator integration
Production buyer/KYC verification
Real TReDS exchange integration
Production-grade financing partners
CSRF token protection
Persistent audit logging
Stronger secrets management
PostgreSQL or another production database
Observability and monitoring
Automated CI/CD
Production deployment
Comprehensive unit/integration/end-to-end test coverage
Security Considerations

This project is an MVP/demo implementation and should not be treated as production-ready financial infrastructure without additional security review.

For production deployment, additional controls would be required around:

Secret management
CSRF protection
Database security
Encryption at rest
Audit logging
Monitoring
Session management
Infrastructure security
Third-party integration security
Regulatory compliance
Financial-data privacy
Project Status

Status: MVP / Demonstration Ready

The current implementation demonstrates an end-to-end MSME receivables financing-readiness workflow across the MSME Unit App, backend services, TReDS workflow, and Financier Desk.

License

This project is currently intended for educational, demonstration, and hackathon/project evaluation purposes.
