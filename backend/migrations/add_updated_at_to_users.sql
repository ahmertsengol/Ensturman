-- Migration: Add updated_at column to users table
-- Description: Adds updated_at timestamp column to track when user profile is last updated

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        
        -- Update existing records to have updated_at same as created_at initially
        UPDATE users SET updated_at = created_at WHERE updated_at IS NULL;
        
        -- Add trigger to automatically update updated_at when record is modified
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
            
        RAISE NOTICE 'Added updated_at column to users table with auto-update trigger';
    ELSE
        RAISE NOTICE 'updated_at column already exists in users table';
    END IF;
END $$; 