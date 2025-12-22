# FEROX KONSTRUKCIJE - Website

Next.js sajt za prezentaciju proizvoda i kalkulator cena hala.

## Brzi Start

### Instalacija

```bash
npm install
```

### Development

```bash
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000) u browseru.

### Production Build

```bash
npm run build
npm start
```

## Struktura

- `/` - Početna stranica
- `/proizvodi` - Lista proizvoda (tipovi hala)
- `/proizvodi/[slug]` - Detaljna stranica proizvoda
- `/kontakt` - Kontakt stranica sa formom "Traži ponudu"
- `/kalkulator` - Kalkulator cena hala

## Tehnologije

- **Next.js 14** - React framework
- **React 18** - UI biblioteka
- **Tailwind CSS** - Styling
- **Three.js** - 3D vizualizacija
- **jsPDF** - PDF generisanje

## Detaljne Instrukcije

Za detaljne instrukcije instalacije, pogledaj [INSTALACIJA.md](./INSTALACIJA.md)

## Email Konfiguracija

Za slanje email-a sa kontakt forme, potrebno je podesiti Resend API ključ:

1. Kreiraj nalog na [Resend.com](https://resend.com) (besplatno do 3000 emaila/mesec)
2. Idi u API Keys sekciju i kreiraj novi API ključ
3. Kreiraj `.env.local` fajl u `website` folderu:
   ```
   RESEND_API_KEY=re_tvoj_api_kljuc_ovde
   ```
4. Restartuj development server

**Napomena:** Email će se slati na `nikolaslavkovic95@gmail.com` kada korisnik pošalje formu "Traži ponudu".

## Pakovanje

Za instrukcije kako da upakuješ projekat, pogledaj [PAKOVANJE.md](./PAKOVANJE.md)
