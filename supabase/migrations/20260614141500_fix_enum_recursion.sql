-- Fix the infinite recursion that was accidentally reintroduced
-- Also update get_my_role to return the new user_role ENUM type

-- Drop dependent policies first
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "faqs_all_admin" ON public.faqs;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS public.get_my_role();

-- Create the function with the new return type
CREATE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Recreate the dropped policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    public.get_my_role() IN ('admin'::user_role, 'master_admin'::user_role)
  );

CREATE POLICY "faqs_all_admin" ON public.faqs
    FOR ALL USING (public.get_my_role() IN ('admin'::user_role, 'master_admin'::user_role));
