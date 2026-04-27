-- Simpler approach: Just add 'guru' to the existing enum
-- This works in PostgreSQL without dropping the table

-- Add 'guru' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'guru';

-- Add 'guru' and 'karyawan' to member_type enum (if not exists)
ALTER TYPE member_type ADD VALUE IF NOT EXISTS 'guru';
ALTER TYPE member_type ADD VALUE IF NOT EXISTS 'karyawan';

-- Verify the changes
SELECT 'user_role values:' as info;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype;

SELECT 'member_type values:' as info;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'member_type'::regtype;
