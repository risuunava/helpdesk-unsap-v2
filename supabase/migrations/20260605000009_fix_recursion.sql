-- Fix infinite recursion in profiles policy

-- 1. Create a SECURITY DEFINER function to safely read the user's role without triggering RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Drop the recursive policy
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- 3. Create the new safe policy
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    public.get_my_role() IN ('admin', 'master_admin')
  );
