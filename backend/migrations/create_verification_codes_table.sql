-- Migration: Create verification_codes table for 2FA
-- Description: Stores email verification codes for password change 2FA

CREATE TABLE IF NOT EXISTS verification_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    verification_type VARCHAR(50) NOT NULL DEFAULT 'password_change',
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(verification_code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(verification_type);

-- Composite index for active code lookup
CREATE INDEX IF NOT EXISTS idx_verification_codes_active_lookup 
ON verification_codes(user_id, verification_type, is_used, expires_at);

-- Add constraints
ALTER TABLE verification_codes ADD CONSTRAINT chk_verification_code_length 
CHECK (LENGTH(verification_code) = 6);

ALTER TABLE verification_codes ADD CONSTRAINT chk_verification_type 
CHECK (verification_type IN ('password_change', 'email_change', 'account_recovery', 'login_2fa'));

-- Add trigger to automatically delete expired codes (optional cleanup)
CREATE OR REPLACE FUNCTION delete_expired_verification_codes()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM verification_codes 
    WHERE expires_at < NOW() - INTERVAL '1 hour'; -- Keep expired codes for 1 hour for audit
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs after each insert to cleanup old codes
CREATE TRIGGER cleanup_expired_codes
    AFTER INSERT ON verification_codes
    EXECUTE FUNCTION delete_expired_verification_codes();

-- Grant necessary permissions (adjust based on your user setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON verification_codes TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE verification_codes_id_seq TO your_app_user;

COMMENT ON TABLE verification_codes IS 'Stores email verification codes for 2FA authentication';
COMMENT ON COLUMN verification_codes.verification_type IS 'Type of verification: password_change, email_change, account_recovery, login_2fa';
COMMENT ON COLUMN verification_codes.expires_at IS 'When the verification code expires (typically 10 minutes from creation)';
COMMENT ON COLUMN verification_codes.is_used IS 'Whether the code has been used successfully';
COMMENT ON COLUMN verification_codes.ip_address IS 'IP address from which the verification was requested';
COMMENT ON COLUMN verification_codes.user_agent IS 'User agent string for security auditing'; 