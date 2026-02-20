const Payment = require('../models/Payment');
const Site = require('../models/Site');
const { pool } = require('../config/db');

const VALID_STATUSES = ['PAID', 'UNPAID', 'PARTIALLY_PAID'];

const sanitizeNumber = (value, fallback = 0) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const calculatePaymentFields = (amount, paidAmount) => {
  const total = sanitizeNumber(amount, 0);
  const paidRaw = sanitizeNumber(paidAmount, 0);
  const paid = Math.max(0, Math.min(paidRaw, total));
  const balance = Math.max(0, total - paid);

  let status = 'UNPAID';
  if (paid >= total && total > 0) {
    status = 'PAID';
  } else if (paid > 0) {
    status = 'PARTIALLY_PAID';
  }

  return { total, paid, balance, status };
};

const formatCurrency = (value) => `Rs. ${sanitizeNumber(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
const safeText = (value, fallback = '-') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};

const escapePdfText = (text = '') =>
  String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const parsePaymentMeta = (notes) => {
  try {
    const parsed = typeof notes === 'string' ? JSON.parse(notes) : null;
    if (!parsed || !parsed.__paymentMeta) return null;
    return parsed;
  } catch {
    return null;
  }
};

const getReadableNotes = (notes) => {
  if (!notes) return '';
  const meta = parsePaymentMeta(notes);
  if (meta) {
    return safeText(meta.notes, '');
  }
  try {
    const parsed = typeof notes === 'string' ? JSON.parse(notes) : null;
    if (parsed && typeof parsed === 'object') {
      return safeText(parsed.notes || parsed.note || '', '');
    }
  } catch {
    // plain text fallback
  }
  return safeText(notes, '');
};

const getInvoicePayload = async (payment) => {
  const site = await Site.getById(payment.siteId);
  const siteProducts = Array.isArray(site?.siteProducts) ? site.siteProducts : [];
  const parsedMeta = parsePaymentMeta(payment.notes);

  const lineItems = Array.isArray(parsedMeta?.lineItems) && parsedMeta.lineItems.length > 0
    ? parsedMeta.lineItems
    : (siteProducts.length > 0 ? siteProducts : [{
      type: 'PRODUCT',
      itemName: payment.productName || 'Item',
      description: '',
      quantity: 1,
      unit: 'Nos',
      price: sanitizeNumber(payment.amount),
      discountType: 'AMOUNT',
      discountValue: 0,
      vatPercent: 0,
      deliveryCharge: 0
    }]);

  const normalizedItems = lineItems.map((item, index) => {
    const quantity = sanitizeNumber(item.quantity, 0);
    const rate = sanitizeNumber(item.price, 0);
    const subtotal = quantity * rate;
    const discountValue = sanitizeNumber(item.discountValue, 0);
    const discountAmount = String(item.discountType || 'PERCENT').toUpperCase() === 'AMOUNT'
      ? Math.min(discountValue, subtotal)
      : Math.min((subtotal * discountValue) / 100, subtotal);
    const taxableAmount = subtotal - discountAmount;
    const vatPercent = sanitizeNumber(item.vatPercent, 0);
    const vatAmount = (taxableAmount * vatPercent) / 100;
    const delivery = sanitizeNumber(item.deliveryCharge, 0);
    const total = sanitizeNumber(item.total, taxableAmount + vatAmount + delivery);
    return {
      srNo: index + 1,
      type: String(item.type || 'PRODUCT').toUpperCase() === 'SERVICE' ? 'Service' : 'Product',
      itemName: safeText(item.itemName, 'Item'),
      description: safeText(item.description, ''),
      qty: quantity,
      unit: safeText(item.unit, 'Nos'),
      rate,
      subtotal,
      discount: discountAmount,
      taxableAmount,
      vatPercent,
      vatAmount,
      delivery,
      total
    };
  });

  const calculatedSummary = normalizedItems.reduce((acc, item) => {
    acc.subtotal += item.subtotal;
    acc.discount += item.discount;
    acc.vat += item.vatAmount;
    acc.delivery += item.delivery;
    acc.grandTotal += item.total;
    return acc;
  }, { subtotal: 0, discount: 0, vat: 0, delivery: 0, grandTotal: 0 });

  const summaryFromMeta = parsedMeta?.totals || {};
  const summary = {
    subtotal: sanitizeNumber(summaryFromMeta.subtotal, calculatedSummary.subtotal),
    discount: sanitizeNumber(summaryFromMeta.discount, calculatedSummary.discount),
    vat: sanitizeNumber(summaryFromMeta.vat, calculatedSummary.vat),
    delivery: sanitizeNumber(summaryFromMeta.delivery, calculatedSummary.delivery),
    grandTotal: sanitizeNumber(summaryFromMeta.grandTotal, sanitizeNumber(payment.amount, calculatedSummary.grandTotal)),
    paidAmount: sanitizeNumber(payment.paidAmount, 0)
  };
  summary.balanceDue = Math.max(0, summary.grandTotal - summary.paidAmount);

  const sitePayments = await Payment.getBySiteId(payment.siteId);
  const paymentHistory = (sitePayments || [])
    .filter((entry) => String(entry.customerId || '') === String(payment.customerId || ''))
    .sort((a, b) => new Date(a.paymentDate || 0).getTime() - new Date(b.paymentDate || 0).getTime())
    .map((entry) => ({
      paymentDate: formatDate(entry.paymentDate),
      paymentMode: safeText(entry.paymentMethod, '-'),
      referenceNo: safeText(entry.transactionId || entry.billNumber, '-'),
      amountPaid: sanitizeNumber(entry.paidAmount, 0),
      notes: getReadableNotes(entry.notes)
    }));

  const totalPaid = paymentHistory.reduce((sum, row) => sum + sanitizeNumber(row.amountPaid, 0), 0);
  const balanceRemaining = Math.max(0, summary.grandTotal - totalPaid);

  return {
    company: {
      logoText: 'TOFFAN',
      name: 'Toffan Glass & Hardware Solutions',
      address: 'Vijay Nagar, Indore, Madhya Pradesh, India',
      gstNumber: '23ABCDE1234F1Z5',
      contact: '+91 98930 00000',
      email: 'support@toffanglass.com'
    },
    invoice: {
      invoiceNo: payment.billNumber || `BILL-${payment.id}`,
      invoiceDate: formatDate(new Date()),
      dueDate: formatDate(payment.paymentDate),
      status: payment.status || 'UNPAID'
    },
    billTo: {
      clientName: safeText(payment.customerName),
      siteName: safeText(payment.siteName),
      address: safeText(payment.siteAddress),
      gstNumber: safeText(site?.gstNumber || 'N/A'),
      contactPerson: safeText(site?.contactPerson || payment.customerName),
      mobile: safeText(payment.customerMobile)
    },
    lineItems: normalizedItems,
    summary,
    paymentHistory,
    paymentTotals: {
      totalPaid,
      balanceRemaining
    }
  };
};

const drawTextLine = (ops, x, y, text, font = 'F1', size = 10) => {
  ops.push('BT');
  ops.push(`/${font} ${size} Tf`);
  ops.push(`1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj`);
  ops.push('ET');
};

const drawLine = (ops, x1, y1, x2, y2) => {
  ops.push(`${x1} ${y1} m ${x2} ${y2} l S`);
};

const drawRect = (ops, x, y, width, height) => {
  ops.push(`${x} ${y} ${width} ${height} re S`);
};

const buildInvoicePdf = (invoiceData) => {
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 28;
  const tableFont = 8;
  const ops = [];
  let y = pageHeight - margin;

  const sectionGap = 10;

  drawTextLine(ops, margin, y, invoiceData.company.name, 'F2', 14);
  drawTextLine(ops, margin, y - 16, invoiceData.company.address, 'F1', 10);
  drawTextLine(ops, margin, y - 30, `GST: ${invoiceData.company.gstNumber}`, 'F1', 10);
  drawTextLine(ops, margin, y - 44, `Contact: ${invoiceData.company.contact} | ${invoiceData.company.email}`, 'F1', 10);

  const rightX = pageWidth - margin - 180;
  drawRect(ops, rightX, y - 58, 180, 58);
  drawTextLine(ops, rightX + 8, y - 12, 'INVOICE', 'F2', 12);
  drawTextLine(ops, rightX + 8, y - 26, `No: ${invoiceData.invoice.invoiceNo}`, 'F1', 10);
  drawTextLine(ops, rightX + 8, y - 38, `Date: ${invoiceData.invoice.invoiceDate}`, 'F1', 10);
  drawTextLine(ops, rightX + 8, y - 50, `Due: ${invoiceData.invoice.dueDate}`, 'F1', 10);
  drawTextLine(ops, rightX + 102, y - 50, `Status: ${invoiceData.invoice.status}`, 'F2', 10);

  y -= 74;

  drawRect(ops, margin, y - 88, pageWidth - (margin * 2), 88);
  drawTextLine(ops, margin + 10, y - 16, 'BILL TO', 'F2', 12);
  drawTextLine(ops, margin + 10, y - 32, `Client: ${invoiceData.billTo.clientName}`, 'F1', 10);
  drawTextLine(ops, margin + 10, y - 46, `Site: ${invoiceData.billTo.siteName}`, 'F1', 10);
  drawTextLine(ops, margin + 10, y - 60, `Contact: ${invoiceData.billTo.contactPerson} | Mobile: ${invoiceData.billTo.mobile}`, 'F1', 10);
  drawTextLine(ops, margin + 10, y - 74, `Address: ${invoiceData.billTo.address} | GST: ${invoiceData.billTo.gstNumber}`, 'F1', 10);

  y -= 88 + sectionGap;

  const columns = [
    { key: 'srNo', label: 'Sr', width: 18 },
    { key: 'type', label: 'Type', width: 30 },
    { key: 'itemName', label: 'Item Name', width: 130 },
    { key: 'qty', label: 'Qty', width: 22 },
    { key: 'unit', label: 'Unit', width: 22 },
    { key: 'rate', label: 'Rate', width: 42 },
    { key: 'subtotal', label: 'Subtotal', width: 48 },
    { key: 'discount', label: 'Discount', width: 40 },
    { key: 'taxableAmount', label: 'Taxable', width: 48 },
    { key: 'vatPercent', label: 'VAT %', width: 30 },
    { key: 'vatAmount', label: 'VAT Amt', width: 45 },
    { key: 'delivery', label: 'Delivery', width: 32 },
    { key: 'total', label: 'Total', width: 32 }
  ];
  const headerHeight = 20;
  const rowHeight = 18;
  const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
  const tableX = margin;
  let tableY = y;

  drawRect(ops, tableX, tableY - headerHeight, tableWidth, headerHeight);
  let x = tableX;
  columns.forEach((col) => {
    drawLine(ops, x, tableY - headerHeight, x, tableY);
    drawTextLine(ops, x + 3, tableY - 14, col.label, 'F2', tableFont);
    x += col.width;
  });
  drawLine(ops, tableX + tableWidth, tableY - headerHeight, tableX + tableWidth, tableY);

  tableY -= headerHeight;
  invoiceData.lineItems.slice(0, 12).forEach((row) => {
    drawRect(ops, tableX, tableY - rowHeight, tableWidth, rowHeight);
    let rowX = tableX;
    columns.forEach((col) => {
      drawLine(ops, rowX, tableY - rowHeight, rowX, tableY);
      let value = row[col.key];
      if (['rate', 'subtotal', 'discount', 'taxableAmount', 'vatAmount', 'delivery', 'total'].includes(col.key)) {
        value = sanitizeNumber(value).toFixed(2);
      }
      if (col.key === 'vatPercent') value = `${sanitizeNumber(value).toFixed(2)}`;
      const text = String(value ?? '').slice(0, col.key === 'itemName' ? 36 : 18);
      drawTextLine(ops, rowX + 3, tableY - 13, text, 'F1', tableFont);
      rowX += col.width;
    });
    drawLine(ops, tableX + tableWidth, tableY - rowHeight, tableX + tableWidth, tableY);
    tableY -= rowHeight;
  });

  y = tableY - sectionGap;

  const summaryX = pageWidth - margin - 170;
  const summaryHeight = 132;
  drawRect(ops, summaryX, y - summaryHeight, 170, summaryHeight);
  drawTextLine(ops, summaryX + 8, y - 14, 'SUMMARY', 'F2', 10);
  drawTextLine(ops, summaryX + 8, y - 30, `Subtotal: ${formatCurrency(invoiceData.summary.subtotal)}`, 'F1', 9.5);
  drawTextLine(ops, summaryX + 8, y - 46, `Discount: ${formatCurrency(invoiceData.summary.discount)}`, 'F1', 9.5);
  drawTextLine(ops, summaryX + 8, y - 62, `VAT: ${formatCurrency(invoiceData.summary.vat)}`, 'F1', 9.5);
  drawTextLine(ops, summaryX + 8, y - 78, `Delivery: ${formatCurrency(invoiceData.summary.delivery)}`, 'F1', 9.5);
  drawTextLine(ops, summaryX + 8, y - 96, `Grand Total: ${formatCurrency(invoiceData.summary.grandTotal)}`, 'F2', 11);
  drawTextLine(ops, summaryX + 8, y - 114, `Paid: ${formatCurrency(invoiceData.summary.paidAmount)} | Due: ${formatCurrency(invoiceData.summary.balanceDue)}`, 'F2', 9);

  const payTableX = margin;
  const payTableY = y;
  const payCols = [
    { key: 'paymentDate', label: 'Payment Date', width: 86 },
    { key: 'paymentMode', label: 'Mode', width: 70 },
    { key: 'referenceNo', label: 'Reference No', width: 132 },
    { key: 'amountPaid', label: 'Amount Paid', width: 72 }
  ];
  const payWidth = payCols.reduce((sum, c) => sum + c.width, 0);
  drawRect(ops, payTableX, payTableY - 20, payWidth, 20);
  let payX = payTableX;
  payCols.forEach((col) => {
    drawLine(ops, payX, payTableY - 20, payX, payTableY);
    drawTextLine(ops, payX + 3, payTableY - 14, col.label, 'F2', 8);
    payX += col.width;
  });
  drawLine(ops, payTableX + payWidth, payTableY - 20, payTableX + payWidth, payTableY);

  let payY = payTableY - 20;
  (invoiceData.paymentHistory || []).slice(0, 5).forEach((row) => {
    const payRowHeight = 18;
    drawRect(ops, payTableX, payY - payRowHeight, payWidth, payRowHeight);
    let cx = payTableX;
    payCols.forEach((col) => {
      drawLine(ops, cx, payY - payRowHeight, cx, payY);
      const val = col.key === 'amountPaid' ? formatCurrency(row[col.key]) : safeText(row[col.key], '-');
      drawTextLine(ops, cx + 3, payY - 13, String(val).slice(0, 24), 'F1', 8);
      cx += col.width;
    });
    drawLine(ops, payTableX + payWidth, payY - payRowHeight, payTableX + payWidth, payY);
    payY -= payRowHeight;
  });

  drawTextLine(ops, payTableX, payY - 16, `Total Paid: ${formatCurrency(invoiceData.paymentTotals.totalPaid)}`, 'F2', 10);
  drawTextLine(ops, payTableX + 200, payY - 16, `Balance Remaining: ${formatCurrency(invoiceData.paymentTotals.balanceRemaining)}`, 'F2', 10);

  drawLine(ops, pageWidth - margin - 140, margin + 24, pageWidth - margin - 20, margin + 24);
  drawTextLine(ops, pageWidth - margin - 130, margin + 10, 'Authorized Signature', 'F1', 8);

  const stream = ops.join('\n');

  const objects = [];
  const addObject = (id, body) => {
    objects.push({ id, body: `${id} 0 obj\n${body}\nendobj\n` });
  };

  addObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
  addObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObject(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>');
  addObject(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  addObject(5, `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`);
  addObject(6, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((obj) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj.body;
  });

  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.getAll();

    const stats = {
      total: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + sanitizeNumber(p.amount), 0),
      paidAmount: payments.reduce((sum, p) => sum + sanitizeNumber(p.paidAmount), 0),
      balanceAmount: payments.reduce((sum, p) => sum + sanitizeNumber(p.balanceAmount), 0)
    };

    res.json({
      message: 'Payments retrieved successfully',
      payments,
      stats
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payments',
      message: error.message
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.getById(id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      message: 'Payment retrieved successfully',
      payment
    });
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment',
      message: error.message
    });
  }
};

const getPaymentsBySiteId = async (req, res) => {
  try {
    const { siteId } = req.params;

    const site = await Site.getById(siteId);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    const payments = await Payment.getBySiteId(siteId);

    const totals = {
      totalAmount: payments.reduce((sum, p) => sum + sanitizeNumber(p.amount), 0),
      paidAmount: payments.reduce((sum, p) => sum + sanitizeNumber(p.paidAmount), 0),
      balanceAmount: payments.reduce((sum, p) => sum + sanitizeNumber(p.balanceAmount), 0)
    };

    res.json({
      message: 'Payments for site retrieved successfully',
      payments,
      totals
    });
  } catch (error) {
    console.error('Get payments by site ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payments',
      message: error.message
    });
  }
};

const getPaymentCustomers = async (req, res) => {
  try {
    const customers = await Payment.getCustomers();
    res.json({
      message: 'Customers retrieved successfully',
      customers
    });
  } catch (error) {
    console.error('Get payment customers error:', error);
    res.status(500).json({
      error: 'Failed to retrieve customers',
      message: error.message
    });
  }
};

const getCustomerSites = async (req, res) => {
  try {
    const { customerId } = req.params;
    const sites = await Payment.getCustomerSites(customerId);

    res.json({
      message: 'Customer sites retrieved successfully',
      sites
    });
  } catch (error) {
    console.error('Get customer sites error:', error);
    res.status(500).json({
      error: 'Failed to retrieve customer sites',
      message: error.message
    });
  }
};

const getCustomerProducts = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { siteId } = req.query;
    const products = await Payment.getCustomerProducts(customerId, siteId || null);

    res.json({
      message: 'Customer products retrieved successfully',
      products
    });
  } catch (error) {
    console.error('Get customer products error:', error);
    res.status(500).json({
      error: 'Failed to retrieve customer products',
      message: error.message
    });
  }
};

const getCustomerPayments = async (req, res) => {
  try {
    const { customerId } = req.params;
    const payments = await Payment.getCustomerPayments(customerId);

    res.json({
      message: 'Customer payments retrieved successfully',
      payments
    });
  } catch (error) {
    console.error('Get customer payments error:', error);
    res.status(500).json({
      error: 'Failed to retrieve customer payments',
      message: error.message
    });
  }
};

const createPayment = async (req, res) => {
  try {
    const payload = req.body || {};
    const {
      siteId,
      customerId,
      productName,
      amount,
      paidAmount,
      paymentDate,
      paymentMethod,
      transactionId,
      notes,
      billNumber,
      existingReceiptUrl
    } = payload;

    if (!siteId || !customerId || !productName || amount === undefined) {
      return res.status(400).json({
        error: 'customerId, siteId, productName, and amount are required'
      });
    }

    const site = await Site.getById(siteId);
    if (!site) {
      return res.status(400).json({ error: 'Invalid site ID' });
    }

    const [customerRows] = await pool.execute(
      `SELECT u.id
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND r.name = 'CUSTOMER'`,
      [customerId]
    );

    if (!customerRows.length) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    if (sanitizeNumber(amount) <= 0) {
      return res.status(400).json({ error: 'Total amount must be greater than 0' });
    }

    if (sanitizeNumber(paidAmount, 0) < 0) {
      return res.status(400).json({ error: 'Paid amount cannot be negative' });
    }
    if (sanitizeNumber(paidAmount, 0) > sanitizeNumber(amount, 0)) {
      return res.status(400).json({ error: 'Paid amount cannot exceed total amount' });
    }

    const normalizedPaymentMethod = String(paymentMethod || '').trim().toUpperCase();
    if (!normalizedPaymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }
    if (!['CASH', 'ONLINE', 'UPI'].includes(normalizedPaymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method. Use CASH, ONLINE, or UPI' });
    }
    if (['ONLINE', 'UPI'].includes(normalizedPaymentMethod) && !String(transactionId || '').trim()) {
      return res.status(400).json({ error: 'Transaction Id is required for Online/UPI payment' });
    }

    if (paymentDate) {
      const date = new Date(paymentDate);
      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid payment date format' });
      }
    }

    const fields = calculatePaymentFields(amount, paidAmount);
    const finalBillNumber = billNumber || await Payment.getNextBillNumber();
    const receiptUrl = req.file
      ? `/uploads/payment-receipts/${req.file.filename}`
      : (String(existingReceiptUrl || '').trim() || null);

    const paymentId = await Payment.create({
      siteId,
      customerId,
      productName,
      amount: fields.total,
      paidAmount: fields.paid,
      paymentDate,
      paymentMethod: normalizedPaymentMethod,
      transactionId,
      receiptUrl,
      notes,
      billNumber: finalBillNumber
    });

    const newPayment = await Payment.getById(paymentId);

    res.status(201).json({
      message: 'Payment created successfully',
      payment: newPayment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      error: 'Failed to create payment',
      message: error.message
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const existingPayment = await Payment.getById(id);

    if (!existingPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payload = req.body || {};
    const {
      siteId,
      customerId,
      productName,
      amount,
      paidAmount,
      paymentDate,
      paymentMethod,
      transactionId,
      notes,
      existingReceiptUrl
    } = payload;

    const finalSiteId = siteId ?? existingPayment.siteId;
    const finalCustomerId = customerId ?? existingPayment.customerId;
    const finalProductName = productName ?? existingPayment.productName;
    const finalAmount = amount ?? existingPayment.amount;
    const finalPaidAmount = paidAmount ?? existingPayment.paidAmount;
    const finalPaymentDate = paymentDate ?? existingPayment.paymentDate;
    const finalPaymentMethod = paymentMethod ?? existingPayment.paymentMethod;
    const finalTransactionId = transactionId ?? existingPayment.transactionId;
    const finalNotes = notes ?? existingPayment.notes;

    if (!finalSiteId || !finalCustomerId || !finalProductName || finalAmount === undefined) {
      return res.status(400).json({
        error: 'customerId, siteId, productName, and amount are required'
      });
    }

    const site = await Site.getById(finalSiteId);
    if (!site) {
      return res.status(400).json({ error: 'Invalid site ID' });
    }

    if (sanitizeNumber(finalAmount) <= 0) {
      return res.status(400).json({ error: 'Total amount must be greater than 0' });
    }
    if (sanitizeNumber(finalPaidAmount, 0) < 0) {
      return res.status(400).json({ error: 'Paid amount cannot be negative' });
    }
    if (sanitizeNumber(finalPaidAmount, 0) > sanitizeNumber(finalAmount, 0)) {
      return res.status(400).json({ error: 'Paid amount cannot exceed total amount' });
    }

    const normalizedPaymentMethod = String(finalPaymentMethod || '').trim().toUpperCase();
    if (!normalizedPaymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }
    if (!['CASH', 'ONLINE', 'UPI'].includes(normalizedPaymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method. Use CASH, ONLINE, or UPI' });
    }
    if (['ONLINE', 'UPI'].includes(normalizedPaymentMethod) && !String(finalTransactionId || '').trim()) {
      return res.status(400).json({ error: 'Transaction Id is required for Online/UPI payment' });
    }

    if (finalPaymentDate) {
      const date = new Date(finalPaymentDate);
      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid payment date format' });
      }
    }

    const finalReceiptUrl = req.file
      ? `/uploads/payment-receipts/${req.file.filename}`
      : (existingReceiptUrl !== undefined ? (String(existingReceiptUrl || '').trim() || null) : (existingPayment.receiptUrl || null));

    const updated = await Payment.update(id, {
      siteId: finalSiteId,
      customerId: finalCustomerId,
      productName: finalProductName,
      amount: finalAmount,
      paidAmount: finalPaidAmount,
      paymentDate: finalPaymentDate,
      paymentMethod: normalizedPaymentMethod,
      transactionId: finalTransactionId,
      receiptUrl: finalReceiptUrl,
      notes: finalNotes
    });

    if (!updated) {
      return res.status(400).json({ error: 'Failed to update payment' });
    }

    const updatedPayment = await Payment.getById(id);

    res.json({
      message: 'Payment updated successfully',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      error: 'Failed to update payment',
      message: error.message
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be one of: PAID, UNPAID, PARTIALLY_PAID'
      });
    }

    const updated = await Payment.updateStatus(id, status);

    if (!updated) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const updatedPayment = await Payment.getById(id);

    res.json({
      message: 'Payment status updated successfully',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      error: 'Failed to update payment status',
      message: error.message
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Payment.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      error: 'Failed to delete payment',
      message: error.message
    });
  }
};

const getPaymentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const payments = await Payment.getByStatus(status);

    res.json({
      message: `Payments with status ${status} retrieved successfully`,
      payments
    });
  } catch (error) {
    console.error('Get payments by status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payments',
      message: error.message
    });
  }
};

const getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.getStats();
    const payments = await Payment.getAll();

    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + sanitizeNumber(p.amount), 0),
      totalPaid: payments.reduce((sum, p) => sum + sanitizeNumber(p.paidAmount), 0),
      totalBalance: payments.reduce((sum, p) => sum + sanitizeNumber(p.balanceAmount), 0),
      byStatus: stats
    };

    res.json({
      message: 'Payment statistics retrieved successfully',
      stats: summary
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment statistics',
      message: error.message
    });
  }
};

const generateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.getById(id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const invoice = await getInvoicePayload(payment);

    res.json({
      message: 'Bill data retrieved successfully',
      bill: {
        ...payment,
        invoice,
        invoiceDate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Generate bill error:', error);
    res.status(500).json({
      error: 'Failed to generate bill',
      message: error.message
    });
  }
};

const downloadBillPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.getById(id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const invoice = await getInvoicePayload(payment);
    const pdfBuffer = buildInvoicePdf(invoice);
    const filename = `${(payment.billNumber || `bill-${id}`).replace(/[^a-zA-Z0-9-_]/g, '')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Download bill pdf error:', error);
    res.status(500).json({
      error: 'Failed to download bill pdf',
      message: error.message
    });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  getPaymentsBySiteId,
  getPaymentCustomers,
  getCustomerSites,
  getCustomerProducts,
  getCustomerPayments,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
  getPaymentsByStatus,
  getPaymentStats,
  generateBill,
  downloadBillPdf
};
