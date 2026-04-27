-- Drop existing broad policies
DROP POLICY IF EXISTS "Public Access Library Assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Library Assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Library Assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Library Assets" ON storage.objects;

-- Create more secure policies for library-assets bucket

-- Allow public read access for specific folders (images only)
CREATE POLICY "Public Read Images Library Assets"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'library-assets' 
  AND (
    name LIKE 'book-covers/%' 
    OR name LIKE 'member-photos/%' 
    OR name LIKE 'ebook-covers/%'
  )
);

-- Allow authenticated users to upload to specific folders
CREATE POLICY "Authenticated Upload Library Assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'library-assets' 
  AND (
    name LIKE 'book-covers/%' 
    OR name LIKE 'member-photos/%' 
    OR name LIKE 'ebook-covers/%'
  )
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated Update Own Library Assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'library-assets' 
  AND (
    name LIKE 'book-covers/%' 
    OR name LIKE 'member-photos/%' 
    OR name LIKE 'ebook-covers/%'
  )
);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated Delete Own Library Assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'library-assets' 
  AND (
    name LIKE 'book-covers/%' 
    OR name LIKE 'member-photos/%' 
    OR name LIKE 'ebook-covers/%'
  )
);
