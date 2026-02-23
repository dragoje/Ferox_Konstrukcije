-- Pokreni ovaj SQL u Supabase Dashboard -> SQL Editor
-- Kreira tabelu projekti za Ferox Konstrukcije

CREATE TABLE IF NOT EXISTS projekti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naziv TEXT NOT NULL DEFAULT 'Projekat bez naziva',
  dimenzije TEXT DEFAULT '',
  napomena TEXT,
  mobil TEXT,
  rok DATE,
  status TEXT NOT NULL DEFAULT 'novo',
  datum_kreiranja TIMESTAMPTZ NOT NULL DEFAULT now(),
  datum_azuriranja TIMESTAMPTZ NOT NULL DEFAULT now(),
  detalji JSONB,
  slika_3d TEXT,
  todos JSONB DEFAULT '[]'
);

-- Indeksi za brže pretraživanje
CREATE INDEX IF NOT EXISTS idx_projekti_status ON projekti(status);
CREATE INDEX IF NOT EXISTS idx_projekti_datum ON projekti(datum_kreiranja DESC);

-- Ako tabela već postoji, dodaj kolone:
-- ALTER TABLE projekti ADD COLUMN IF NOT EXISTS mobil TEXT;
-- ALTER TABLE projekti ADD COLUMN IF NOT EXISTS todos JSONB DEFAULT '[]';
