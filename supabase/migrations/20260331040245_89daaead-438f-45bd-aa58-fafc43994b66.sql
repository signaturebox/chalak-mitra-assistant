
-- Add detailed troubleshooting fields to faults
ALTER TABLE public.faults
  ADD COLUMN IF NOT EXISTS fault_message TEXT,
  ADD COLUMN IF NOT EXISTS impact TEXT,
  ADD COLUMN IF NOT EXISTS indicators JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'PRIORITY1',
  ADD COLUMN IF NOT EXISTS isolation_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS isolation_message TEXT,
  ADD COLUMN IF NOT EXISTS isolation_steps TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS lamp_status TEXT,
  ADD COLUMN IF NOT EXISTS title_hi TEXT,
  ADD COLUMN IF NOT EXISTS description_hi TEXT;
