-- =============================================
-- Avatar Storage Setup
-- =============================================
-- This script sets up the storage bucket and policies for user avatars
-- Run this in your Supabase SQL Editor

-- First, create the storage bucket (if it doesn't exist)
-- Note: You may need to create the bucket manually in the Supabase dashboard first
-- Go to Storage > New Bucket > Name: "avatars" > Public: Yes

-- =============================================
-- Storage Policies for Avatars Bucket
-- =============================================

-- Allow public read access to avatars (anyone can view)
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
-- File path format: {user_id}/avatar.jpg
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- Verification Queries
-- =============================================

-- Check if policies were created successfully
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%avatar%'
ORDER BY policyname;
