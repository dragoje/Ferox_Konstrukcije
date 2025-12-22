# Instalacija i Pokretanje Sajta

## Zašto ovo čitam?

Ovo su instrukcije za instalaciju i pokretanje sajta **FEROX KONSTRUKCIJE** na lokalnom računaru.

## Preduslovi

Pre nego što počneš, potrebno je da imaš instalirano:

1. **Node.js** (verzija 18 ili novija)
   - Preuzmi sa: https://nodejs.org/
   - Proveri instalaciju: Otvori Command Prompt ili PowerShell i ukucaj:
     ```
     node --version
     ```
     Trebalo bi da vidiš verziju (npr. v18.x.x ili v20.x.x)

2. **npm** (dolazi sa Node.js)
   - Proveri instalaciju:
     ```
     npm --version
     ```

## Koraci za instalaciju

### 1. Raspakuj projekat

Raspakuj zip fajl u folder po tvom izboru (npr. `C:\Projects\ferox-website`)

### 2. Otvori terminal u folderu projekta

**Windows:**
- Otvori File Explorer
- Navigiraj do foldera gde si raspakovao projekat
- Klikni desnim tasterom u prazan prostor
- Izaberi "Open in Terminal" ili "Open PowerShell window here"

**Alternativa:**
- Otvori Command Prompt ili PowerShell
- Navigiraj do foldera:
  ```
  cd "C:\putanja\do\projekta\website"
  ```

### 3. Instaliraj dependencies

U terminalu ukucaj:
```
npm install
```

Ovo će instalirati sve potrebne pakete. Može potrajati nekoliko minuta.

### 4. Pokreni development server

Kada se instalacija završi, ukucaj:
```
npm run dev
```

Trebalo bi da vidiš poruku:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in Xs
```

### 5. Otvori sajt u browseru

Otvori browser i idi na:
```
http://localhost:3000
```

## Korisne komande

- `npm run dev` - Pokreće development server (za razvoj)
- `npm run build` - Pravi production build
- `npm start` - Pokreće production server (nakon build-a)
- `npm run lint` - Proverava greške u kodu

## Troubleshooting

### Problem: "node: command not found"
**Rešenje:** Node.js nije instaliran ili nije u PATH-u. Instaliraj Node.js sa https://nodejs.org/

### Problem: "npm install" ne radi
**Rešenje:**
- Proveri da li si u pravom folderu (trebalo bi da vidiš `package.json`)
- Pokušaj sa `npm install --legacy-peer-deps`

### Problem: Port 3000 je zauzet
**Rešenje:**
- Zatvori drugu aplikaciju koja koristi port 3000
- Ili promeni port u `package.json` script-u:
  ```
  "dev": "next dev -p 3001"
  ```

### Problem: Greške sa Three.js ili 3D vizualizacijom
**Rešenje:**
- Proveri da li su svi paketi instalirani: `npm install`
- Ako i dalje ne radi, pokušaj: `npm install --legacy-peer-deps`

## Struktura projekta

```
website/
├── app/              # Next.js stranice
├── components/       # React komponente
├── data/            # Podaci (tipovi hala)
├── public/          # Statički fajlovi (slike, itd.)
├── package.json     # Dependencies i skripte
└── README.md        # Opšti README
```

## Kontakt za pomoć

Ako imaš problema, proveri:
1. Da li je Node.js instaliran
2. Da li si u pravom folderu
3. Da li su svi fajlovi prisutni
4. Da li imaš internet konekciju (za npm install)



