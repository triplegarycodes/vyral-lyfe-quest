-- Fix security vulnerability: Drop unused public.profiles table with exposed email data
-- This table has no RLS policies and contains sensitive user data that could be exposed

DROP TABLE IF EXISTS public.profiles;