-- ============================================
-- SCHOOL LIBRARY MANAGEMENT SYSTEM SCHEMA
-- Perpustakaan Sekolah
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'petugas', 'member');
CREATE TYPE borrowing_status AS ENUM ('dipinjam', 'kembali', 'terlambat');
CREATE TYPE member_type AS ENUM ('siswa', 'guru', 'karyawan');

-- ============================================
-- CATEGORIES TABLE
-- ============================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MEMBERS TABLE
-- ============================================

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    member_type member_type DEFAULT 'siswa',
    nis_nip VARCHAR(20),
    class VARCHAR(20),
    address TEXT,
    photo_url TEXT,
    qr_code TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BOOKS TABLE
-- ============================================

CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    isbn VARCHAR(20) UNIQUE,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    publisher VARCHAR(100),
    publication_year INTEGER,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    stock INTEGER DEFAULT 0 NOT NULL,
    available_stock INTEGER DEFAULT 0 NOT NULL,
    cover_url TEXT,
    description TEXT,
    shelf_location VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- E-BOOKS TABLE
-- ============================================

CREATE TABLE ebooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    cover_url TEXT,
    file_url TEXT NOT NULL,
    source VARCHAR(100),
    read_link TEXT,
    description TEXT,
    file_size VARCHAR(20),
    file_format VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BORROWINGS TABLE
-- ============================================

CREATE TABLE borrowings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrowing_number VARCHAR(20) UNIQUE NOT NULL,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    status borrowing_status DEFAULT 'dipinjam',
    borrowed_by UUID REFERENCES auth.users(id),
    returned_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FINES TABLE
-- ============================================

CREATE TABLE fines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrowing_id UUID NOT NULL REFERENCES borrowings(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL DEFAULT 0,
    paid_amount INTEGER DEFAULT 0,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    paid_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER ROLES TABLE
-- ============================================

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_members_member_number ON members(member_number);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_borrowings_member ON borrowings(member_id);
CREATE INDEX idx_borrowings_book ON borrowings(book_id);
CREATE INDEX idx_borrowings_status ON borrowings(status);
CREATE INDEX idx_borrowings_dates ON borrowings(borrow_date, due_date);
CREATE INDEX idx_ebooks_category ON ebooks(category_id);
CREATE INDEX idx_fines_borrowing ON fines(borrowing_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate member number
CREATE OR REPLACE FUNCTION generate_member_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    new_number TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(member_number FROM 'MBR-[0-9]{4}-([0-9]+)$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM members
    WHERE member_number LIKE 'MBR-' || year_part || '-%';
    
    new_number := 'MBR-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    NEW.member_number := new_number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating member number
CREATE TRIGGER trigger_generate_member_number
    BEFORE INSERT ON members
    FOR EACH ROW
    WHEN (NEW.member_number IS NULL)
    EXECUTE FUNCTION generate_member_number();

-- Function to generate borrowing number
CREATE OR REPLACE FUNCTION generate_borrowing_number()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    sequence_num INTEGER;
    new_number TEXT;
BEGIN
    date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(borrowing_number FROM 'BRW-[0-9]{8}-([0-9]+)$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM borrowings
    WHERE borrowing_number LIKE 'BRW-' || date_part || '-%';
    
    new_number := 'BRW-' || date_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    NEW.borrowing_number := new_number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating borrowing number
CREATE TRIGGER trigger_generate_borrowing_number
    BEFORE INSERT ON borrowings
    FOR EACH ROW
    WHEN (NEW.borrowing_number IS NULL)
    EXECUTE FUNCTION generate_borrowing_number();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ebooks_updated_at BEFORE UPDATE ON ebooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_borrowings_updated_at BEFORE UPDATE ON borrowings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fines_updated_at BEFORE UPDATE ON fines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are viewable by all authenticated users"
    ON categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Categories are editable by admin and petugas"
    ON categories FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'petugas')
        )
    );

-- Members policies
CREATE POLICY "Members are viewable by all authenticated users"
    ON members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Members are editable by admin and petugas"
    ON members FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'petugas')
        )
    );

-- Books policies
CREATE POLICY "Books are viewable by all authenticated users"
    ON books FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Books are editable by admin and petugas"
    ON books FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'petugas')
        )
    );

-- E-books policies
CREATE POLICY "E-books are viewable by all authenticated users"
    ON ebooks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "E-books are editable by admin and petugas"
    ON ebooks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'petugas')
        )
    );

-- Borrowings policies
CREATE POLICY "Borrowings are viewable by all authenticated users"
    ON borrowings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Borrowings are editable by admin and petugas"
    ON borrowings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'petugas')
        )
    );

-- Fines policies
CREATE POLICY "Fines are viewable by all authenticated users"
    ON fines FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Fines are editable by admin and petugas"
    ON fines FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'petugas')
        )
    );

-- User roles policies
CREATE POLICY "User roles are viewable by admin"
    ON user_roles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "User roles are editable by admin"
    ON user_roles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default categories
INSERT INTO categories (name, description) VALUES
    ('Fiksi', 'Buku-buku fiksi dan novel'),
    ('Non-Fiksi', 'Buku non-fiksi umum'),
    ('Pelajaran', 'Buku pelajaran sekolah'),
    ('Referensi', 'Buku referensi dan ensiklopedia'),
    ('Komik', 'Komik dan grafis novel'),
    ('Biografi', 'Buku biografi dan autobiografi'),
    ('Sains', 'Buku sains dan teknologi'),
    ('Sejarah', 'Buku sejarah dan budaya'),
    ('Bahasa', 'Buku bahasa dan sastra'),
    ('Agama', 'Buku agama dan spiritualitas'),
    ('Komputer', 'Buku komputer dan pemrograman'),
    ('Kesehatan', 'Buku kesehatan dan kedokteran');

-- ============================================
-- VIEWS
-- ============================================

-- View for active borrowings with member and book details
CREATE VIEW vw_active_borrowings AS
SELECT 
    b.id,
    b.borrowing_number,
    b.borrow_date,
    b.due_date,
    b.return_date,
    b.status,
    m.id as member_id,
    m.member_number,
    m.full_name as member_name,
    m.class,
    bk.id as book_id,
    bk.title as book_title,
    bk.author as book_author,
    CASE 
        WHEN b.due_date < CURRENT_DATE AND b.status = 'dipinjam' THEN 
            (CURRENT_DATE - b.due_date) * 1000
        ELSE 0
    END as estimated_fine
FROM borrowings b
JOIN members m ON b.member_id = m.id
JOIN books bk ON b.book_id = bk.id
WHERE b.status = 'dipinjam';

-- View for borrowing statistics by month
CREATE VIEW vw_borrowing_stats AS
SELECT 
    DATE_TRUNC('month', borrow_date) as month,
    COUNT(*) as total_borrowings,
    COUNT(*) FILTER (WHERE status = 'kembali') as total_returns,
    COUNT(*) FILTER (WHERE status = 'terlambat') as total_late,
    COALESCE(SUM(f.amount), 0) as total_fines
FROM borrowings b
LEFT JOIN fines f ON b.id = f.borrowing_id
GROUP BY DATE_TRUNC('month', borrow_date)
ORDER BY month DESC;

-- View for most borrowed books
CREATE VIEW vw_most_borrowed_books AS
SELECT 
    bk.id,
    bk.title,
    bk.author,
    bk.cover_url,
    c.name as category,
    COUNT(b.id) as borrow_count
FROM books bk
LEFT JOIN borrowings b ON bk.id = b.book_id
LEFT JOIN categories c ON bk.category_id = c.id
GROUP BY bk.id, bk.title, bk.author, bk.cover_url, c.name
ORDER BY borrow_count DESC;
