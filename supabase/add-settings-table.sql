-- ============================================
-- SETTINGS TABLE
-- ============================================

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_name VARCHAR(200) DEFAULT 'Perpustakaan Sekolah',
    school_name VARCHAR(200) DEFAULT 'Sekolah',
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Only admin can view settings
CREATE POLICY "Settings are viewable by admin"
    ON settings FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only admin can update settings
CREATE POLICY "Settings are editable by admin"
    ON settings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Insert default settings
INSERT INTO settings (library_name, school_name) VALUES
    ('Perpustakaan Sekolah', 'Sekolah');

-- Trigger for updating timestamp
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
