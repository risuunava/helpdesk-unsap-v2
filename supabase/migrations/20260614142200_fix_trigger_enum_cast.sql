-- Fix the handle_new_user trigger to cast the role text into user_role ENUM type

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, nim)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    (COALESCE(NEW.raw_user_meta_data->>'role', 'mahasiswa'))::public.user_role,
    NEW.raw_user_meta_data->>'nim'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
