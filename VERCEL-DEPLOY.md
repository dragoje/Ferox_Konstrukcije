# Deploy na Vercel - Vodič

Ovaj vodič će ti pomoći da deploy-uješ FEROX KONSTRUKCIJE sajt na Vercel.

## Preduslovi

1. **GitHub, GitLab ili Bitbucket nalog** - Vercel se najbolje integriše sa Git repozitorijumima
2. **Vercel nalog** - Kreiraj besplatan nalog na [vercel.com](https://vercel.com)

## Metoda 1: Deploy preko Vercel Dashboard-a (Preporučeno)

### Korak 1: Pripremi projekat za Git

Ako projekat još nije u Git repozitorijumu:

```bash
cd website
git init
git add .
git commit -m "Initial commit"
```

### Korak 2: Push na GitHub/GitLab/Bitbucket

1. Kreiraj novi repozitorijum na GitHub-u (ili GitLab/Bitbucket)
2. Poveži lokalni repozitorijum sa remote:

```bash
git remote add origin https://github.com/tvoj-username/ferox-website.git
git branch -M main
git push -u origin main
```

### Korak 3: Deploy na Vercel

1. Idi na [vercel.com](https://vercel.com) i uloguj se
2. Klikni na **"Add New..."** → **"Project"**
3. Izaberi svoj Git provider (GitHub, GitLab, ili Bitbucket)
4. Autorizuj Vercel da pristupa tvojim repozitorijumima
5. Izaberi repozitorijum sa sajtom
6. Vercel će automatski detektovati Next.js projekat
7. **Važno:** U "Root Directory" izaberi `website` (jer je projekat u podfolderu)
8. Klikni **"Deploy"**

### Korak 4: Konfiguracija (Opciono)

Vercel će automatski:
- Detektovati Next.js framework
- Koristiti `npm install` za instalaciju
- Koristiti `npm run build` za build
- Deploy-ovati sajt

Ako treba da promeniš nešto:
- **Framework Preset:** Next.js (automatski)
- **Root Directory:** `website`
- **Build Command:** `npm run build` (automatski)
- **Output Directory:** `.next` (automatski)
- **Install Command:** `npm install` (automatski)

## Metoda 2: Deploy preko Vercel CLI

### Korak 1: Instaliraj Vercel CLI

```bash
npm install -g vercel
```

### Korak 2: Login u Vercel

```bash
vercel login
```

### Korak 3: Deploy

```bash
cd website
vercel
```

Pratite uputstva u terminalu:
- Set up and deploy? **Y**
- Which scope? Izaberi svoj nalog
- Link to existing project? **N** (prvi put)
- Project name? `ferox-website` (ili kako želiš)
- In which directory is your code located? `./`
- Override settings? **N** (koristi default)

### Korak 4: Production Deploy

Za production deploy:

```bash
vercel --prod
```

## Environment Variables (Opciono)

Ako u budućnosti dodaš environment varijable (npr. za email servis):

1. Idi u Vercel Dashboard → Tvoj projekat → Settings → Environment Variables
2. Dodaj varijable:
   - `RESEND_API_KEY` (ako koristiš Resend za email)
   - ili druge varijable koje su potrebne

## Automatski Deploy

Nakon što povežeš Git repozitorijum sa Vercel-om:
- Svaki push na `main` branch će automatski deploy-ovati na production
- Svaki push na druge brancheve će kreirati preview deployment

## Provera Deploy-a

1. Nakon deploy-a, dobićeš URL tipa: `ferox-website.vercel.app`
2. Možeš dodati custom domen u Settings → Domains
3. Proveri da li sve radi kako treba

## Troubleshooting

### Problem: Build ne uspeva

**Rešenje:**
- Proveri da li si u `website` folderu postavio Root Directory
- Proveri da li su sve dependencies u `package.json`
- Proveri build lokalno: `npm run build`

### Problem: 404 greške na rute

**Rešenje:**
- Proveri da li je `next.config.js` ispravan
- Proveri da li su sve rute u `app/` folderu

### Problem: 3D vizualizacija ne radi

**Rešenje:**
- Three.js bi trebalo da radi, ali proveri da li su svi paketi instalirani
- Proveri browser konzolu za greške

### Problem: API rute ne rade

**Rešenje:**
- API rute u `app/api/` bi trebalo da rade automatski
- Proveri da li su rute ispravno definisane
- Proveri Vercel Functions logove u Dashboard-u

## Custom Domain

Za dodavanje custom domena:

1. Idi u Settings → Domains
2. Dodaj svoj domen (npr. `ferox.rs`)
3. Sledi uputstva za DNS konfiguraciju
4. Vercel će automatski generisati SSL sertifikat

## Korisni Linkovi

- [Vercel Dokumentacija](https://vercel.com/docs)
- [Next.js na Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Dashboard](https://vercel.com/dashboard)

## Napomene

- Vercel besplatni plan omogućava:
  - Neograničen broj projekata
  - 100GB bandwidth mesečno
  - Automatski SSL sertifikati
  - Preview deployments za svaki branch/PR

- Za production, preporučujem da:
  - Povežeš custom domen
  - Postaviš environment variables ako su potrebne
  - Konfigurišeš monitoring i analytics

