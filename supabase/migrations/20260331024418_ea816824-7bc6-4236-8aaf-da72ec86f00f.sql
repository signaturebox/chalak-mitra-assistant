
-- ==============================================
-- NWR Chalak Mitra - Complete Database Schema
-- ==============================================

-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'zone_admin', 'division_admin', 'lobby_admin', 'crew_user');

-- 2. Zones
CREATE TABLE public.zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Divisions
CREATE TABLE public.divisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Lobbies
CREATE TABLE public.lobbies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  cms_id TEXT,
  designation TEXT,
  phone TEXT,
  lobby_id UUID REFERENCES public.lobbies(id),
  division_id UUID REFERENCES public.divisions(id),
  zone_id UUID REFERENCES public.zones(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. User Roles (separate table per security best practice)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- 7. Loco types
CREATE TABLE public.loco_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('electric', 'diesel')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. System categories
CREATE TABLE public.system_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Manuals
CREATE TABLE public.manuals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  loco_type_id UUID REFERENCES public.loco_types(id),
  system_category_id UUID REFERENCES public.system_categories(id),
  file_url TEXT,
  file_type TEXT,
  page_count INT,
  uploaded_by UUID REFERENCES auth.users(id),
  zone_id UUID REFERENCES public.zones(id),
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Faults
CREATE TABLE public.faults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fault_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  loco_type_id UUID REFERENCES public.loco_types(id),
  system_category_id UUID REFERENCES public.system_categories(id),
  symptoms TEXT[],
  causes TEXT[],
  solution_steps JSONB,
  safety_precautions TEXT[],
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('urgent', 'safety', 'notice', 'info')),
  target_role app_role,
  target_zone_id UUID REFERENCES public.zones(id),
  target_division_id UUID REFERENCES public.divisions(id),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Bookmarks
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manual_id UUID REFERENCES public.manuals(id) ON DELETE CASCADE,
  fault_id UUID REFERENCES public.faults(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bookmark_target CHECK (
    (manual_id IS NOT NULL AND fault_id IS NULL) OR
    (manual_id IS NULL AND fault_id IS NOT NULL)
  )
);

-- 13. Download history
CREATE TABLE public.download_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manual_id UUID NOT NULL REFERENCES public.manuals(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================
-- Enable RLS on all tables
-- ==============================================
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loco_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_history ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- Security Definer function for role checks
-- ==============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ==============================================
-- RLS Policies
-- ==============================================

-- Zones: readable by all authenticated, writable by super_admin
CREATE POLICY "Zones readable by authenticated" ON public.zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Zones writable by super_admin" ON public.zones FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Divisions: readable by all authenticated, writable by super_admin/zone_admin
CREATE POLICY "Divisions readable by authenticated" ON public.divisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Divisions writable by admins" ON public.divisions FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'zone_admin')
);

-- Lobbies: readable by all authenticated
CREATE POLICY "Lobbies readable by authenticated" ON public.lobbies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lobbies writable by admins" ON public.lobbies FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'zone_admin') OR public.has_role(auth.uid(), 'division_admin')
);

-- Profiles: users read own, admins read all
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'zone_admin') OR public.has_role(auth.uid(), 'division_admin')
);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User Roles: viewable by self and admins
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin manages roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Loco types, System categories: readable by all
CREATE POLICY "Loco types readable" ON public.loco_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Loco types writable by admins" ON public.loco_types FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "System categories readable" ON public.system_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "System categories writable by admins" ON public.system_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Manuals: readable by all authenticated
CREATE POLICY "Manuals readable" ON public.manuals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manuals writable by admins" ON public.manuals FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'zone_admin') OR public.has_role(auth.uid(), 'division_admin') OR public.has_role(auth.uid(), 'lobby_admin')
);

-- Faults: readable by all
CREATE POLICY "Faults readable" ON public.faults FOR SELECT TO authenticated USING (true);
CREATE POLICY "Faults writable by admins" ON public.faults FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'zone_admin')
);

-- Notifications: readable by all authenticated
CREATE POLICY "Notifications readable" ON public.notifications FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Notifications writable by admins" ON public.notifications FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'zone_admin') OR public.has_role(auth.uid(), 'division_admin') OR public.has_role(auth.uid(), 'lobby_admin')
);

-- Bookmarks: user's own
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Download history: user's own
CREATE POLICY "Users view own downloads" ON public.download_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own downloads" ON public.download_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- Trigger for auto-creating profile on signup
-- ==============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.phone, '')
  );
  -- Default role: crew_user
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'crew_user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- Updated_at trigger function
-- ==============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_manuals_updated_at BEFORE UPDATE ON public.manuals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_faults_updated_at BEFORE UPDATE ON public.faults FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
