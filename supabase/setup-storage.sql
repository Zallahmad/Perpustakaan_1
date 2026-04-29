-- ============================================
-- SUPABASE STORAGE SETUP
-- ============================================

-- Insert storage buckets for library assets
-- Note: This requires the storage extension to be enabled in Supabase

-- Create bucket for book covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'book-covers',
    'book-covers',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for member photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'member-photos',
    'member-photos',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for ebook covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ebook-covers',
    'ebook-covers',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE RLS POLICIES
-- ============================================

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view book covers (public)
CREATE POLICY "Book covers are publicly viewable"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'book-covers');

-- Policy: Admin and petugas can upload book covers
CREATE POLICY "Admin and petugas can upload book covers"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'book-covers'
        AND EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'petugas')
        )
    );

-- Policy: Admin and petugas can delete book covers
CREATE POLICY "Admin and petugas can delete book covers"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'book-covers'
        AND EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'petugas')
        )
    );

-- Policy: Anyone can view member photos (public)
CREATE POLICY "Member photos are publicly viewable"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'member-photos');

-- Policy: Admin and petugas can upload member photos
CREATE POLICY "Admin and petugas can upload member photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'member-photos'
        AND EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'petugas')
        )
    );

-- Policy: Admin and petugas can delete member photos
CREATE POLICY "Admin and petugas can delete member photos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'member-photos'
        AND EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'petugas')
        )
    );

-- Policy: Anyone can view ebook covers (public)
CREATE POLICY "Ebook covers are publicly viewable"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'ebook-covers');

-- Policy: Admin and petugas can upload ebook covers
CREATE POLICY "Admin and petugas can upload ebook covers"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'ebook-covers'
        AND EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'petugas')
        )
    );

-- Policy: Admin and petugas can delete ebook covers
CREATE POLICY "Admin and petugas can delete ebook covers"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'ebook-covers'
        AND EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'petugas')
        )
    );
