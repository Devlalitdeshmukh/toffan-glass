# TODO: Create Payment Management Module

## Payment Management Module Requirements

### Backend Changes
- [ ] Update `backend/src/models/Payment.js` - Add customer relationships and enhanced fields
- [ ] Update `backend/src/controllers/paymentController.js` - Add new endpoints for customer sites/products
- [ ] Update `backend/src/routes/paymentRoutes.js` - Add new routes if needed

### Frontend Changes
- [ ] Update `services/paymentService.ts` - Add new methods for customers, sites by customer, products by customer
- [ ] Create `components/PaymentManager.tsx` - Comprehensive payment management component
- [ ] Update `pages/Dashboard.tsx` - Add Payments section to sidebar and integrate PaymentManager

### Features to Implement

#### 1. Payment Dashboard
- [ ] Stats cards (Total Payments, Paid, Outstanding, Unpaid)
- [ ] Searchable and sortable payment table with pagination
- [ ] Add/Edit Payment modal with customer, site, product dropdowns
- [ ] Auto-calculate balance and payment status

#### 2. Payment Form Fields
- [ ] Customer Name (Dropdown - from users table with role='CUSTOMER')
- [ ] Customer Mobile (Auto-filled after selecting customer)
- [ ] Site Name (Dropdown - based on selected customer)
- [ ] Product (Dropdown - products/services for that customer)
- [ ] Total Amount
- [ ] Paid Amount
- [ ] Amount Paid Date
- [ ] Balance Amount (Auto-calculated)
- [ ] Payment Status (Auto-calculated: PAID, PARTIALLY_PAID, UNPAID)
- [ ] Payment Method
- [ ] Transaction ID
- [ ] Notes

#### 3. Bill Generation
- [ ] Generate Customer Bill modal/preview
- [ ] Download as PDF functionality
- [ ] Professional PDF layout with company logo, customer details, site details, product details

#### 4. Dropdown Logic
- [ ] Customer dropdown fetches from users table (role='CUSTOMER')
- [ ] Site dropdown filters by selected customer
- [ ] Product dropdown shows products/services for selected customer

#### 5. Auto-Calculation Logic
- [ ] Balance = Total Amount - Paid Amount
- [ ] Status = 'PAID' if Paid = Total
- [ ] Status = 'PARTIALLY_PAID' if 0 < Paid < Total
- [ ] Status = 'UNPAID' if Paid = 0

## Files to Create/Edit

### Backend
1. `/home/durvash/Desktop/toffan-glass/backend/src/models/Payment.js` - Enhanced with customer relationships
2. `/home/durvash/Desktop/toffan-glass/backend/src/controllers/paymentController.js` - New endpoints

### Frontend
1. `/home/durvash/Desktop/toffan-glass/services/paymentService.ts` - New methods
2. `/home/durvash/Desktop/toffan-glass/components/PaymentManager.tsx` - New component
3. `/home/durvash/Desktop/toffan-glass/pages/Dashboard.tsx` - Integration

## Dependencies Needed
- `jspdf` - For PDF generation
- `jspdf-autotable` - For tables in PDF

