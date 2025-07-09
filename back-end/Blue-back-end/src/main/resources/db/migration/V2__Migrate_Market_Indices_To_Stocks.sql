-- Migration script to transfer data from market_indices to stocks table

-- First, add the new columns to the stocks table if they don't exist
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS is_market_index BOOLEAN DEFAULT FALSE;
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS code VARCHAR(255);
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS change_amount DOUBLE PRECISION;
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS change_percent DOUBLE PRECISION;

-- Insert market indices into stocks table
INSERT INTO stocks (symbol, name, price, volume, last_updated, is_market_index, code, change_amount, change_percent)
SELECT 
    code as symbol,
    code as name,
    value as price,
    volume,
    last_updated,
    TRUE as is_market_index,
    code,
    change as change_amount,
    change_percent
FROM market_indices
ON CONFLICT (symbol) DO UPDATE
SET 
    price = EXCLUDED.price,
    volume = EXCLUDED.volume,
    last_updated = EXCLUDED.last_updated,
    is_market_index = TRUE,
    code = EXCLUDED.code,
    change_amount = EXCLUDED.change_amount,
    change_percent = EXCLUDED.change_percent;

-- After successful migration, you can drop the market_indices table
-- DROP TABLE market_indices;
-- Note: Uncomment the above line after verifying the migration was successful