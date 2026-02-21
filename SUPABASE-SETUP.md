# Supabase integracija – Projekti

Projekti se sada čuvaju u Supabase bazi i sinhronizuju se na svim uređajima.

## Korak 1: Kreiraj Supabase projekat

1. Idi na [supabase.com](https://supabase.com) i prijavi se
2. Klikni **New Project**
3. Unesi naziv (npr. `ferox-konstrukcije`), lozinku za bazu, izaberi region
4. Sačekaj da se projekat kreira

## Korak 2: Kreiraj tabelu

1. U Supabase Dashboard otvori **SQL Editor**
2. Klikni **New query**
3. Kopiraj sadržaj iz `supabase-schema.sql` i pokreni ga (Run)

## Korak 3: Podesi environment varijable

1. U Supabase Dashboard otvori **Settings** → **API**
2. Kopiraj:
   - **Project URL** (npr. `https://xxxxx.supabase.co`)
   - **service_role** key (u sekciji Project API keys – **ne** anon key)

3. Kreiraj `.env.local` u root folderu projekta:

```
NEXT_PUBLIC_SUPABASE_URL=https://tvoj-projekat.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Restartuj development server (`npm run dev`)

## Korak 4: Instalacija paketa

```bash
npm install @supabase/supabase-js
```

## Napomena

- **service_role** ključ ima pun pristup bazi – nikada ga ne commit-uj u Git
- `.env.local` je u `.gitignore` i neće biti uključen u repozitorijum
- Na Vercel-u dodaj iste varijable u **Settings** → **Environment Variables**
