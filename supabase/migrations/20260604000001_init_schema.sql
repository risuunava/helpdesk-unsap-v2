-- Tabel profiles (extend auth.users)
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nim           TEXT UNIQUE,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'mahasiswa'
                CHECK (role IN ('mahasiswa', 'admin', 'master_admin')),
  department    TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel tickets
CREATE TABLE public.tickets (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number        TEXT UNIQUE NOT NULL,
  title                TEXT NOT NULL,
  description          TEXT NOT NULL,
  category             TEXT NOT NULL
                       CHECK (category IN ('akademik','keuangan','fasilitas','keamanan','lainnya')),
  status               TEXT NOT NULL DEFAULT 'open'
                       CHECK (status IN ('open','in_progress','resolved','closed')),
  priority             TEXT NOT NULL DEFAULT 'normal'
                       CHECK (priority IN ('low','normal','urgent')),
  is_anonymous         BOOLEAN DEFAULT FALSE,
  anonymous_code       TEXT,
  reporter_id          UUID REFERENCES public.profiles(id),
  assigned_to          UUID REFERENCES public.profiles(id),
  department           TEXT,
  attachment_url       TEXT,
  ml_confidence        FLOAT,
  ml_model_version     TEXT,
  priority_overridden  BOOLEAN DEFAULT FALSE,
  sla_deadline         TIMESTAMPTZ,
  resolved_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel messages
CREATE TABLE public.messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.profiles(id),
  content     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel faqs
CREATE TABLE public.faqs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  category    TEXT,
  view_count  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel ml_training_data
CREATE TABLE public.ml_training_data (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id        UUID REFERENCES public.tickets(id),
  text_input       TEXT NOT NULL,
  ml_prediction    TEXT NOT NULL,
  corrected_label  TEXT NOT NULL,
  corrected_by     UUID REFERENCES public.profiles(id),
  model_version    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel ticket_rate_limits
CREATE TABLE public.ticket_rate_limits (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.profiles(id),
  date      DATE NOT NULL DEFAULT CURRENT_DATE,
  count     INTEGER DEFAULT 1,
  UNIQUE(user_id, date)
);

-- Tabel notifications
CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  ticket_id   UUID REFERENCES public.tickets(id),
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
