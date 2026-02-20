ALTER TABLE payments
ADD COLUMN IF NOT EXISTS receipt_url VARCHAR(500) NULL AFTER transaction_id;
