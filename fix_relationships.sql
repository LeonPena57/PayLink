-- Ensure Foreign Keys exist for Services and Products to Profiles

-- Services -> Profiles (seller_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'services_seller_id_fkey'
    ) THEN
        ALTER TABLE services 
        ADD CONSTRAINT services_seller_id_fkey 
        FOREIGN KEY (seller_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Products -> Profiles (seller_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_seller_id_fkey'
    ) THEN
        ALTER TABLE products 
        ADD CONSTRAINT products_seller_id_fkey 
        FOREIGN KEY (seller_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Portfolio Items -> Profiles (user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'portfolio_items_user_id_fkey'
    ) THEN
        ALTER TABLE portfolio_items 
        ADD CONSTRAINT portfolio_items_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;
