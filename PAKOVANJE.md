# Kako da upakuješ projekat za distribuciju

## Šta treba da uključiš u paket

Kada pakuješ projekat za nekog drugog, uključi sledeće fajlove i foldere:

### ✅ UKLJUČI:
- `app/` - Svi fajlovi iz app foldera
- `components/` - Sve komponente
- `data/` - Podaci o tipovima hala
- `public/` - Statički fajlovi (slike, logo, itd.)
- `package.json` - Dependencies
- `package-lock.json` - Verzije paketa (opciono, ali preporučeno)
- `next.config.js` - Next.js konfiguracija
- `tailwind.config.js` - Tailwind konfiguracija
- `postcss.config.js` - PostCSS konfiguracija
- `jsconfig.json` - Path aliases
- `.eslintrc.json` - ESLint konfiguracija
- `.gitignore` - Git ignore fajl
- `README.md` - Opšti README
- `INSTALACIJA.md` - Instrukcije za instalaciju

### ❌ NE UKLJUČUJ:
- `node_modules/` - Ovo će se instalirati sa `npm install`
- `.next/` - Build folder, generiše se automatski
- `.env*` - Environment varijable (ako imaš)
- `*.log` - Log fajlovi

## Načini pakovanja

### Opcija 1: ZIP fajl (najjednostavnije)

1. Otvori File Explorer
2. Idi do foldera `website`
3. Selektuj sve fajlove i foldere (osim `node_modules` i `.next`)
4. Klikni desnim tasterom → "Send to" → "Compressed (zipped) folder"
5. Ime fajla: `ferox-website.zip`

### Opcija 2: PowerShell skripta

Kreiraj fajl `pakuj.ps1` u `website` folderu:

```powershell
# Kreiraj zip fajl bez node_modules i .next
$exclude = @('node_modules', '.next', '*.log', '.env*')
Compress-Archive -Path * -DestinationPath ../ferox-website.zip -Force
```

Pokreni sa:
```
powershell -ExecutionPolicy Bypass -File pakuj.ps1
```

### Opcija 3: Git (ako koristiš Git)

```bash
git archive -o ferox-website.zip HEAD
```

## Provera paketa

Pre nego što pošalješ paket, proveri da li sadrži:
- ✅ `package.json`
- ✅ `app/` folder
- ✅ `components/` folder
- ✅ `data/` folder
- ✅ `public/` folder
- ✅ Konfiguracijski fajlovi
- ✅ `INSTALACIJA.md`

## Veličina paketa

- Bez `node_modules`: ~500KB - 2MB
- Sa `node_modules`: ~200MB+ (NE uključuj!)

## Instrukcije za primaoca

Kada pošalješ paket, uključi i `INSTALACIJA.md` fajl koji sadrži detaljne instrukcije.

Primaoc treba da:
1. Raspakuje zip fajl
2. Otvori terminal u folderu
3. Pokrene `npm install`
4. Pokrene `npm run dev`



