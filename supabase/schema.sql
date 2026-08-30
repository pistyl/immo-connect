-- =========================================================
-- IMMO-CONNECT SENEGAL - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Target Database: https://tfvsyisseedmbqzzkjuk.supabase.co
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. PROFILES / USERS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id VARCHAR PRIMARY KEY,
  phone VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('LANDLORD', 'TENANT')),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED')),
  id_card_url TEXT,
  proof_of_ownership_url TEXT,
  email VARCHAR,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2. PROPERTIES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.properties (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id VARCHAR REFERENCES public.profiles(id) ON DELETE SET NULL,
  owner_name VARCHAR NOT NULL,
  owner_phone VARCHAR NOT NULL,
  owner_verified BOOLEAN DEFAULT FALSE,
  title VARCHAR NOT NULL,
  description TEXT,
  region VARCHAR(50) NOT NULL,
  neighborhood VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('STUDIO', 'APPARTEMENT', 'MAISON', 'CHAMBRE')),
  rooms INT NOT NULL DEFAULT 1,
  price NUMERIC(12, 2) NOT NULL, -- Price in FCFA
  charges_included BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  photos TEXT[] DEFAULT '{}',
  approx_location VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3. LEASES TABLE (BAUX DE LOCATION)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leases (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id VARCHAR REFERENCES public.properties(id) ON DELETE CASCADE,
  property_title VARCHAR NOT NULL,
  property_region VARCHAR(50) NOT NULL,
  property_neighborhood VARCHAR(100) NOT NULL,
  landlord_id VARCHAR REFERENCES public.profiles(id) ON DELETE CASCADE,
  landlord_name VARCHAR NOT NULL,
  landlord_phone VARCHAR NOT NULL,
  tenant_id VARCHAR REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_name VARCHAR NOT NULL,
  tenant_phone VARCHAR NOT NULL,
  monthly_rent NUMERIC(12, 2) NOT NULL, -- FCFA
  security_deposit NUMERIC(12, 2) NOT NULL, -- FCFA
  start_date DATE NOT NULL,
  duration_months INT NOT NULL DEFAULT 12,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_SIGNATURE', 'ACTIVE', 'TERMINATED')),
  landlord_signature JSONB DEFAULT '{"signed": false}'::jsonb,
  tenant_signature JSONB DEFAULT '{"signed": false}'::jsonb,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 4. INVENTORY REPORTS TABLE (ETATS DES LIEUX)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_reports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  lease_id VARCHAR REFERENCES public.leases(id) ON DELETE CASCADE,
  property_title VARCHAR NOT NULL,
  property_region VARCHAR(50) NOT NULL,
  property_neighborhood VARCHAR(100) NOT NULL,
  tenant_name VARCHAR NOT NULL,
  landlord_name VARCHAR NOT NULL,
  date_entry DATE NOT NULL,
  date_exit DATE,
  type VARCHAR(20) DEFAULT 'ENTREE' CHECK (type IN ('ENTREE', 'SORTIE')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_entry_signed BOOLEAN DEFAULT FALSE,
  is_exit_signed BOOLEAN DEFAULT FALSE,
  entry_signature_date TIMESTAMPTZ,
  exit_signature_date TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 5. PAYMENTS TABLE (WAVE / ORANGE MONEY / LOYER)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  lease_id VARCHAR REFERENCES public.leases(id) ON DELETE CASCADE,
  property_title VARCHAR NOT NULL,
  tenant_id VARCHAR REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_name VARCHAR NOT NULL,
  landlord_id VARCHAR REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL, -- FCFA
  period_month VARCHAR(50) NOT NULL, -- e.g. "Août 2026"
  due_date DATE NOT NULL,
  paid_date TIMESTAMPTZ,
  method VARCHAR(30) CHECK (method IN ('WAVE', 'ORANGE_MONEY', 'CASH', 'BANK_TRANSFER', 'CHEQUE')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
  transaction_id VARCHAR(100),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 6. CONVERSATIONS & CHAT MESSAGES
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id VARCHAR REFERENCES public.properties(id) ON DELETE CASCADE,
  property_title VARCHAR NOT NULL,
  property_photo TEXT,
  landlord_id VARCHAR REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_id VARCHAR REFERENCES public.profiles(id) ON DELETE CASCADE,
  landlord_name VARCHAR NOT NULL,
  tenant_name VARCHAR NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY (RLS) POLICIES FOR ALL TABLES
-- ---------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public update profiles" ON public.profiles;

DROP POLICY IF EXISTS "Public read properties" ON public.properties;
DROP POLICY IF EXISTS "Public insert properties" ON public.properties;
DROP POLICY IF EXISTS "Public update properties" ON public.properties;

DROP POLICY IF EXISTS "Public read leases" ON public.leases;
DROP POLICY IF EXISTS "Public insert leases" ON public.leases;
DROP POLICY IF EXISTS "Public update leases" ON public.leases;

DROP POLICY IF EXISTS "Public read inventory_reports" ON public.inventory_reports;
DROP POLICY IF EXISTS "Public insert inventory_reports" ON public.inventory_reports;
DROP POLICY IF EXISTS "Public update inventory_reports" ON public.inventory_reports;

DROP POLICY IF EXISTS "Public read payments" ON public.payments;
DROP POLICY IF EXISTS "Public insert payments" ON public.payments;
DROP POLICY IF EXISTS "Public update payments" ON public.payments;

DROP POLICY IF EXISTS "Public read conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public update conversations" ON public.conversations;

-- Create permissive RLS policies for initial application launch
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public read properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Public insert properties" ON public.properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update properties" ON public.properties FOR UPDATE USING (true);

CREATE POLICY "Public read leases" ON public.leases FOR SELECT USING (true);
CREATE POLICY "Public insert leases" ON public.leases FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update leases" ON public.leases FOR UPDATE USING (true);

CREATE POLICY "Public read inventory_reports" ON public.inventory_reports FOR SELECT USING (true);
CREATE POLICY "Public insert inventory_reports" ON public.inventory_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update inventory_reports" ON public.inventory_reports FOR UPDATE USING (true);

CREATE POLICY "Public read payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Public insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update payments" ON public.payments FOR UPDATE USING (true);

CREATE POLICY "Public read conversations" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Public insert conversations" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update conversations" ON public.conversations FOR UPDATE USING (true);

-- ---------------------------------------------------------
-- INITIAL DEMO SEED DATA (SENEGAL CONTEXT)
-- ---------------------------------------------------------
INSERT INTO public.profiles (id, phone, name, role, verification_status, email)
VALUES 
  ('user_landlord_1', '+221 77 123 45 67', 'Moussa Diop', 'LANDLORD', 'VERIFIED', 'moussa.diop@example.sn'),
  ('user_tenant_1', '+221 78 987 65 43', 'Awa Ndiaye', 'TENANT', 'VERIFIED', 'awa.ndiaye@example.sn')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id, owner_id, owner_name, owner_phone, owner_verified, title, description, region, neighborhood, city, type, rooms, price, charges_included, is_available, photos, approx_location)
VALUES
  ('prop_1', 'user_landlord_1', 'Moussa Diop', '+221 77 123 45 67', true, 'Magnifique F3 Climatisé avec Vue Mer', 'Spacieux appartement meublé, 2 chambres climatisées, grand salon, cuisine équipée, balcon aperçu mer. Sécurité H24, groupe électrogène et réserve d''eau.', 'Dakar', 'Mermoz', 'Dakar', 'APPARTEMENT', 3, 350000, true, true, ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'], 'À 200m du Rond-point Mermoz'),
  ('prop_2', 'user_landlord_1', 'Moussa Diop', '+221 77 123 45 67', true, 'Studio Moderne Haut Standing', 'Charmant studio idéal pour cadre ou étudiant. Finitions haut de gamme, douche italienne, wifi fibre inclus.', 'Dakar', 'Almadies', 'Dakar', 'STUDIO', 1, 200000, true, true, ARRAY['https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80'], 'Près des ambassades, Almadies'),
  ('prop_3', 'user_landlord_1', 'Moussa Diop', '+221 77 123 45 67', true, 'Villa Duplex 4 Chambres + Jardin', 'Superbe villa individuelle dans quartier calme. Garage 2 voitures, grande terrasse, quartier très sécurisé.', 'Thiès', 'Saly Portudal', 'Mbour', 'MAISON', 5, 500000, false, false, ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'], 'Saly Station, proche résidence du Golf')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.leases (id, property_id, property_title, property_region, property_neighborhood, landlord_id, landlord_name, landlord_phone, tenant_id, tenant_name, tenant_phone, monthly_rent, security_deposit, start_date, duration_months, status, landlord_signature, tenant_signature)
VALUES
  ('lease_1', 'prop_3', 'Villa Duplex 4 Chambres + Jardin', 'Thiès', 'Saly Portudal', 'user_landlord_1', 'Moussa Diop', '+221 77 123 45 67', 'user_tenant_1', 'Awa Ndiaye', '+221 78 987 65 43', 500000, 1000000, '2026-01-01', 12, 'ACTIVE', '{"signed": true, "signerName": "Moussa Diop", "timestamp": "2025-12-28T10:30:00Z"}'::jsonb, '{"signed": true, "signerName": "Awa Ndiaye", "timestamp": "2025-12-28T14:15:00Z"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payments (id, lease_id, property_title, tenant_id, tenant_name, landlord_id, amount, period_month, due_date, paid_date, method, status, transaction_id)
VALUES
  ('pay_1', 'lease_1', 'Villa Duplex 4 Chambres + Jardin', 'user_tenant_1', 'Awa Ndiaye', 'user_landlord_1', 500000, 'Août 2026', '2026-08-05', '2026-08-03T11:20:00Z', 'WAVE', 'PAID', 'WV-20260803-99812'),
  ('pay_2', 'lease_1', 'Villa Duplex 4 Chambres + Jardin', 'user_tenant_1', 'Awa Ndiaye', 'user_landlord_1', 500000, 'Septembre 2026', '2026-09-05', NULL, NULL, 'PENDING', NULL)
ON CONFLICT (id) DO NOTHING;
