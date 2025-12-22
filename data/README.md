# Uputstvo za ažuriranje podataka o tipovima hala

## Kako da ažuriraš podatke

Otvorí fajl `tipoviHala.js` i ažuriraj podatke za svaki tip hale:

### Polja koja možeš da menjaš:

1. **id** - Jedinstveni ID (broj)
2. **slug** - URL-friendly naziv (npr. 'industrijske-hale')
3. **title** - Naslov tipa hale (npr. 'Industrijske Hale') - prikazuje se na kartici
4. **shortDescription** - Kratak opis (prikazuje se na detaljnoj stranici)
5. **description** - Detaljan opis (prikazuje se na detaljnoj stranici)
6. **features** - Niz karakteristika (array stringova) - prikazuje se na detaljnoj stranici
7. **cardImage** - Putanja do glavne slike za karticu (npr. '/hale/tip1/kartica.jpg')
8. **images** - Niz putanja do slika za galeriju na detaljnoj stranici (array stringova)
9. **icon** - Emoji ikona (opciono, koristi se kao fallback ako nema cardImage)

### Primer:

```javascript
{
  id: 1,
  slug: 'industrijske-hale',
  title: 'Industrijske Hale',
  shortDescription: 'Prostrane hale za proizvodnju i skladištenje',
  description: 'Detaljan opis industrijskih hala...',
  features: ['Veliki rasponi', 'Visoki stropovi', 'Jake konstrukcije'],
  cardImage: '/hale/industrijske/kartica.jpg', // Glavna slika za karticu
  images: [
    '/hale/industrijske/slika1.jpg',
    '/hale/industrijske/slika2.jpg',
  ],
  icon: '🏭'
}
```

### Dodavanje slika:

1. **Slika za karticu (cardImage):**
   - Dodaj glavnu sliku u `public/hale/[tip-hale]/kartica.jpg`
   - Ova slika se prikazuje na listi proizvoda
   - Preporučena dimenzija: 800x600px ili slično

2. **Slike za galeriju (images):**
   - Dodaj slike u `public/hale/[tip-hale]/` folder
   - Ažuriraj `images` array sa putanjama do slika
   - Ove slike se prikazuju na detaljnoj stranici

3. **Putanje:**
   - Sve putanje počinju sa `/` (npr. `/hale/industrijske/kartica.jpg`)
   - Slike se čuvaju u `public/` folderu

### Napomena:

- Slug mora biti jedinstven za svaki tip hale
- Slug se koristi u URL-u (npr. `/proizvodi/industrijske-hale`)
- Možeš dodati ili ukloniti tipove hala po potrebi
- **cardImage** je obavezna za prikaz na kartici - ako nema slike, prikazuje se placeholder sa ikonom

