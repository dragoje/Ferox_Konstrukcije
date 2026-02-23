-- Pokreni u Supabase SQL Editor ako tabela projekti već postoji
-- Dodaje kolone mobil i todos

ALTER TABLE projekti ADD COLUMN IF NOT EXISTS mobil TEXT;
ALTER TABLE projekti ADD COLUMN IF NOT EXISTS todos JSONB DEFAULT '[]';
ALTER TABLE projekti ADD COLUMN IF NOT EXISTS datum_pocetka DATE;
