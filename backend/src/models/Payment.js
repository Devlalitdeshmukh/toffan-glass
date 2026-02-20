const { pool } = require('../config/db');

class Payment {
    static schemaEnsurePromise = null;

    static async ensureSchema() {
        if (!this.schemaEnsurePromise) {
            this.schemaEnsurePromise = (async () => {
                const [columns] = await pool.execute('SHOW COLUMNS FROM payments');
                const existing = new Set(columns.map((col) => col.Field));
                const alterQueries = [];

                if (!existing.has('customer_id')) {
                    alterQueries.push('ALTER TABLE payments ADD COLUMN customer_id INT NULL AFTER site_id');
                }
                if (!existing.has('product_name')) {
                    alterQueries.push("ALTER TABLE payments ADD COLUMN product_name VARCHAR(255) NULL AFTER customer_id");
                }
                if (!existing.has('paid_amount')) {
                    alterQueries.push('ALTER TABLE payments ADD COLUMN paid_amount DECIMAL(12,2) DEFAULT 0 AFTER amount');
                }
                if (!existing.has('balance_amount')) {
                    alterQueries.push('ALTER TABLE payments ADD COLUMN balance_amount DECIMAL(12,2) DEFAULT 0 AFTER paid_amount');
                }
                if (!existing.has('bill_number')) {
                    alterQueries.push('ALTER TABLE payments ADD COLUMN bill_number VARCHAR(50) NULL AFTER notes');
                }
                if (!existing.has('receipt_url')) {
                    alterQueries.push('ALTER TABLE payments ADD COLUMN receipt_url VARCHAR(500) NULL AFTER transaction_id');
                }

                for (const query of alterQueries) {
                    await pool.execute(query);
                }

                const statusColumn = columns.find((col) => col.Field === 'status');
                if (statusColumn && typeof statusColumn.Type === 'string' && !statusColumn.Type.includes('PARTIALLY_PAID')) {
                    await pool.execute(
                        "ALTER TABLE payments MODIFY COLUMN status ENUM('PAID','UNPAID','PARTIALLY_PAID','OUTSTANDING') DEFAULT 'UNPAID'"
                    );
                }

                await pool.execute('UPDATE payments SET paid_amount = 0 WHERE paid_amount IS NULL');
                await pool.execute('UPDATE payments SET balance_amount = amount WHERE balance_amount IS NULL');
            })();
        }

        return this.schemaEnsurePromise;
    }

    static calculateFinancials(amount, paidAmount) {
        const total = parseFloat(amount || 0);
        const paid = parseFloat(paidAmount || 0);
        const safePaid = paid > total ? total : paid;
        const balance = Math.max(0, total - safePaid);

        let status = 'UNPAID';
        if (safePaid >= total && total > 0) {
            status = 'PAID';
        } else if (safePaid > 0) {
            status = 'PARTIALLY_PAID';
        }

        return {
            total,
            paid: safePaid,
            balance,
            status
        };
    }

    static async getAll() {
        await this.ensureSchema();
        const [rows] = await pool.execute(`
            SELECT 
                p.id,
                p.site_id as siteId,
                p.customer_id as customerId,
                p.product_name as productName,
                p.amount,
                p.paid_amount as paidAmount,
                p.balance_amount as balanceAmount,
                p.payment_date as paymentDate,
                p.status,
                p.payment_method as paymentMethod,
                p.transaction_id as transactionId,
                p.receipt_url as receiptUrl,
                p.notes,
                p.bill_number as billNumber,
                p.created_at as createdAt,
                p.updated_at as updatedAt,
                s.name as siteName,
                u.name as customerName,
                u.mobile as customerMobile,
                u.email as customerEmail
            FROM payments p
            LEFT JOIN sites s ON p.site_id = s.id
            LEFT JOIN users u ON p.customer_id = u.id
            ORDER BY p.created_at DESC
        `);
        return rows;
    }

    static async getById(id) {
        await this.ensureSchema();
        const [rows] = await pool.execute(`
            SELECT 
                p.id,
                p.site_id as siteId,
                p.customer_id as customerId,
                p.product_name as productName,
                p.amount,
                p.paid_amount as paidAmount,
                p.balance_amount as balanceAmount,
                p.payment_date as paymentDate,
                p.status,
                p.payment_method as paymentMethod,
                p.transaction_id as transactionId,
                p.receipt_url as receiptUrl,
                p.notes,
                p.bill_number as billNumber,
                p.created_at as createdAt,
                p.updated_at as updatedAt,
                s.name as siteName,
                s.address as siteAddress,
                u.name as customerName,
                u.mobile as customerMobile,
                u.email as customerEmail
            FROM payments p
            LEFT JOIN sites s ON p.site_id = s.id
            LEFT JOIN users u ON p.customer_id = u.id
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    }

    static async getBySiteId(siteId) {
        await this.ensureSchema();
        const [rows] = await pool.execute(`
            SELECT 
                id,
                customer_id as customerId,
                product_name as productName,
                amount,
                paid_amount as paidAmount,
                balance_amount as balanceAmount,
                payment_date as paymentDate,
                status,
                payment_method as paymentMethod,
                transaction_id as transactionId,
                receipt_url as receiptUrl,
                notes,
                bill_number as billNumber,
                created_at as createdAt
            FROM payments
            WHERE site_id = ?
            ORDER BY payment_date DESC
        `, [siteId]);
        return rows;
    }

    static async getByCustomerId(customerId) {
        await this.ensureSchema();
        const [rows] = await pool.execute(`
            SELECT 
                p.id,
                p.site_id as siteId,
                p.customer_id as customerId,
                p.product_name as productName,
                p.amount,
                p.paid_amount as paidAmount,
                p.balance_amount as balanceAmount,
                p.payment_date as paymentDate,
                p.status,
                p.payment_method as paymentMethod,
                p.transaction_id as transactionId,
                p.receipt_url as receiptUrl,
                p.notes,
                p.bill_number as billNumber,
                p.created_at as createdAt,
                s.name as siteName
            FROM payments p
            LEFT JOIN sites s ON p.site_id = s.id
            WHERE p.customer_id = ?
            ORDER BY p.created_at DESC
        `, [customerId]);
        return rows;
    }

    static async create(paymentData) {
        await this.ensureSchema();
        const { 
            siteId, 
            customerId,
            productName,
            amount, 
            paidAmount = 0,
            paymentDate, 
            paymentMethod, 
            transactionId, 
            receiptUrl,
            notes,
            billNumber
        } = paymentData;

        const financials = this.calculateFinancials(amount, paidAmount);
        
        // Generate bill number if not provided
        const finalBillNumber = billNumber || `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const [result] = await pool.execute(
            `INSERT INTO payments 
            (site_id, customer_id, product_name, amount, paid_amount, balance_amount, payment_date, status, payment_method, transaction_id, receipt_url, notes, bill_number) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [siteId, customerId, productName, financials.total, financials.paid, financials.balance, paymentDate, financials.status, paymentMethod, transactionId, receiptUrl || null, notes, finalBillNumber]
        );
        
        return result.insertId;
    }

    static async update(id, paymentData) {
        await this.ensureSchema();
        const { 
            siteId, 
            customerId,
            productName,
            amount, 
            paidAmount,
            paymentDate, 
            paymentMethod, 
            transactionId, 
            receiptUrl,
            notes 
        } = paymentData;

        const financials = this.calculateFinancials(amount, paidAmount);

        const [result] = await pool.execute(`
            UPDATE payments 
            SET site_id = ?, customer_id = ?, product_name = ?, amount = ?, paid_amount = ?, balance_amount = ?, payment_date = ?, status = ?, payment_method = ?, transaction_id = ?, receipt_url = ?, notes = ?
            WHERE id = ?
        `, [siteId, customerId, productName, financials.total, financials.paid, financials.balance, paymentDate, financials.status, paymentMethod, transactionId, receiptUrl || null, notes, id]);
        
        return result.affectedRows > 0;
    }

    static async updatePaidAmount(id, paidAmount) {
        await this.ensureSchema();
        // Get current payment
        const payment = await this.getById(id);
        if (!payment) return false;
        
        const amount = parseFloat(payment.amount);
        const paid = parseFloat(paidAmount);
        const balance = amount - paid;
        
        // Determine status
        let status = 'UNPAID';
        if (paid >= amount) {
            status = 'PAID';
        } else if (paid > 0) {
            status = 'PARTIALLY_PAID';
        }
        
        const [result] = await pool.execute(
            'UPDATE payments SET paid_amount = ?, balance_amount = ?, status = ? WHERE id = ?',
            [paidAmount, balance, status, id]
        );
        
        return result.affectedRows > 0;
    }

    static async updateStatus(id, status) {
        await this.ensureSchema();
        const [result] = await pool.execute(
            'UPDATE payments SET status = ? WHERE id = ?',
            [status, id]
        );
        
        return result.affectedRows > 0;
    }

    static async delete(id) {
        await this.ensureSchema();
        const [result] = await pool.execute(
            'DELETE FROM payments WHERE id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    }

    static async getByStatus(status) {
        await this.ensureSchema();
        const [rows] = await pool.execute(`
            SELECT 
                p.id,
                p.site_id as siteId,
                p.customer_id as customerId,
                p.product_name as productName,
                p.amount,
                p.paid_amount as paidAmount,
                p.balance_amount as balanceAmount,
                p.payment_date as paymentDate,
                p.status,
                p.payment_method as paymentMethod,
                p.bill_number as billNumber,
                s.name as siteName,
                u.name as customerName,
                u.mobile as customerMobile
            FROM payments p
            LEFT JOIN sites s ON p.site_id = s.id
            LEFT JOIN users u ON p.customer_id = u.id
            WHERE p.status = ?
            ORDER BY p.created_at DESC
        `, [status]);
        return rows;
    }

    static async getStats() {
        await this.ensureSchema();
        const [rows] = await pool.execute(`
            SELECT 
                status,
                COUNT(*) as count,
                COALESCE(SUM(amount), 0) as totalAmount,
                COALESCE(SUM(paid_amount), 0) as totalPaid,
                COALESCE(SUM(balance_amount), 0) as totalBalance
            FROM payments
            GROUP BY status
        `);
        return rows;
    }

    static async getCustomerPayments(customerId) {
        await this.ensureSchema();
        const [rows] = await pool.execute(`
            SELECT 
                p.id,
                p.site_id as siteId,
                p.amount,
                p.paid_amount as paidAmount,
                p.balance_amount as balanceAmount,
                p.status,
                p.payment_date as paymentDate,
                p.bill_number as billNumber,
                p.product_name as productName,
                p.created_at as createdAt,
                s.name as siteName
            FROM payments p
            LEFT JOIN sites s ON p.site_id = s.id
            WHERE p.customer_id = ?
            ORDER BY p.created_at DESC
        `, [customerId]);
        return rows;
    }

    static async getNextBillNumber() {
        await this.ensureSchema();
        const [rows] = await pool.execute(`
            SELECT bill_number FROM payments 
            WHERE bill_number LIKE 'BILL-%' 
            ORDER BY id DESC LIMIT 1
        `);
        
        if (rows.length === 0) {
            return `BILL-${new Date().getFullYear()}-0001`;
        }
        
        const lastBill = rows[0].bill_number;
        const parts = lastBill.split('-');
        const year = parts[1];
        const number = parseInt(parts[2]) + 1;
        
        return `BILL-${year}-${String(number).padStart(4, '0')}`;
    }

    static async getCustomers() {
        await this.ensureSchema();
        const [rows] = await pool.execute(`
            SELECT 
                u.id,
                u.name,
                u.mobile
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'CUSTOMER'
            ORDER BY u.name ASC
        `);
        return rows;
    }

    static async getCustomerSites(customerId) {
        await this.ensureSchema();
        const [rows] = await pool.execute(`
            SELECT 
                s.id,
                s.name,
                s.address,
                s.city_id as cityId
            FROM sites s
            WHERE s.user_id = ?
            ORDER BY s.name ASC
        `, [customerId]);
        return rows;
    }

    static async getCustomerProducts(customerId, siteId = null) {
        await this.ensureSchema();
        const params = [customerId];
        let sql = `
            SELECT 
                sp.site_id as siteId,
                sp.item_type as type,
                sp.item_name as itemName,
                sp.description,
                sp.quantity,
                sp.unit,
                sp.price,
                sp.discount_type as discountType,
                sp.discount_value as discountValue,
                sp.vat_percent as vatPercent,
                sp.delivery_charge as deliveryCharge,
                sp.total,
                sp.sort_order as sortOrder
            FROM site_products sp
            INNER JOIN sites s ON s.id = sp.site_id
            WHERE s.user_id = ?
        `;
        if (siteId) {
            sql += ' AND sp.site_id = ?';
            params.push(siteId);
        }
        sql += ' ORDER BY sp.site_id ASC, sp.sort_order ASC, sp.id ASC';

        const [rows] = await pool.execute(sql, params);

        return rows;
    }
}

module.exports = Payment;
