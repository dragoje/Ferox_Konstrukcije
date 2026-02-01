// Podaci o tipovima hala koje uvek radimo
// Možeš lako dodati/izmeniti tipove ovde

export const tipoviHala = [
  {
    id: 1,
    slug: 'tip-hale-1',
    title: 'Konstrukcija 16x8x4',
    shortDescription: '',
    description: `Montazna konstrukcija za halu dimenzija 16x8m.

Uz konstrukciju se dobija crtež sa dimenzijama i rasporedom stubova. Moguća izrada i odgovarajućih ankrer ploča sa šrafovoma za betoniranje.

Tezina konstrukcije je oko 2100kg.

Profili za stubove su 100x100x3.8mm, za bindere 80x60x2.8 i za ispunu 40x40x2.8mm. Profili za roznjace su 80x40x2.8.

Ploce za ankerisanje su 200x200x10mm, za vezivanje bindera su 180x150x10mm.

Cela konstrukcija ja ofarbana u 2 ruke osnovnom anti-korozivnom farbom.

U cenu su uračunati stubovi sa zavarenim anker plocama, binderi i rožnjače. Binderi se šrafe za stubove a rožnjače se vare na L profile zavarene na bindere.

Cena anker ploca za betoniranje sa ankerima 30cm duzine i vijcima m18 8.8 je 17€ po komadu.`,
    features: [' stubovi 100x100x3.8mm', ' binderi 80x60x2.8', ' rožnjače 80x40x2.8', ' ispuna 40x40x2.8mm', ' vezivanje stubova 200x200x10mm', ' vezivanje bindera 180x150x10mm', ' ofarbana u 2 ruke osnovnom antikorozivnom farbom'],
    cardImage: '/hale/tip1/slika1.PNG', // Glavna slika za karticu na listi proizvoda
    images: [
      '/hale/tip1/slika1.PNG',
      '/hale/tip1/slika2.PNG',
      '/hale/tip1/slika3.PNG',
      '/hale/tip1/slika4.PNG',
    ],
    icon: '🏗️'
  },
  {
    id: 2,
    slug: 'tip-hale-2',
    title: 'Konstrukcija 15x10x4.5',
    shortDescription: '',
    description:`Montazna konstrukcija za halu dimenzija 15x10m.

Uz konstrukciju se dobija crtež sa dimenzijama i rasporedom stubova. Moguća izrada i odgovarajućih ankrer ploča sa šrafovoma za betoniranje.

Tezina konstrukcije je oko 2800kg.

Profili za stubove su 120x120x3.8mm, za bindere 80x80x3.8 i za ispunu 40x40x2.8mm. Profili za roznjace su 80x40x2.8.

Ploce za ankerisanje su 200x200x10mm, za vezivanje bindera su 180x150x10mm.

Cela konstrukcija ja ofarbana u 2 ruke osnovnom anti-korozivnom farbom.

U cenu su uračunati stubovi sa zavarenim anker plocama, binderi i rožnjače. Binderi se šrafe za stubove a rožnjače se vare na L profile zavarene na bindere.

Cena anker ploca za betoniranje sa ankerima 30cm duzine i vijcima m18 8.8 je 17€ po komadu.`,
    features: [' stubovi 120x120x3.8mm', ' binderi 80x80x3.8', ' rožnjače 80x40x2.8', ' ispuna 40x40x2.8mm', ' vezivanje stubova 200x200x10mm', ' vezivanje bindera 180x150x10mm', ' ofarbana u 2 ruke osnovnom antikorozivnom farbom'],
    cardImage: '/hale/tip2/slika1.PNG', // Glavna slika za karticu na listi proizvoda
    images: [
      '/hale/tip2/slika1.PNG',
      '/hale/tip2/slika2.PNG',
    ],
    icon: '🏭'
  },
  {
    id: 3,
    slug: 'tip-hale-3',
    title: 'Tip Hale 3',
    shortDescription: 'Kratak opis tipa hale 3',
    description: 'Detaljan opis tipa hale 3. Ovo je mesto gde možeš dodati sve informacije o ovom tipu hale - karakteristike, prednosti, primene, itd.',
    features: ['Karakteristika 1', 'Karakteristika 2', 'Karakteristika 3'],
    cardImage: '/hale/tip3/kartica.jpg', // Glavna slika za karticu na listi proizvoda
    images: [
      '/hale/tip3/slika1.jpg',
      '/hale/tip3/slika2.jpg',
      '/hale/tip3/slika3.jpg',
    ],
    icon: '🌾'
  },
  {
    id: 4,
    slug: 'tip-hale-4',
    title: 'Tip Hale 4',
    shortDescription: 'Kratak opis tipa hale 4',
    description: 'Detaljan opis tipa hale 4. Ovo je mesto gde možeš dodati sve informacije o ovom tipu hale - karakteristike, prednosti, primene, itd.',
    features: ['Karakteristika 1', 'Karakteristika 2', 'Karakteristika 3'],
    cardImage: '/hale/tip4/kartica.jpg', // Glavna slika za karticu na listi proizvoda
    images: [
      '/hale/tip4/slika1.jpg',
      '/hale/tip4/slika2.jpg',
      '/hale/tip4/slika3.jpg',
    ],
    icon: '⚽'
  },
  {
    id: 5,
    slug: 'tip-hale-5',
    title: 'Tip Hale 5',
    shortDescription: 'Kratak opis tipa hale 5',
    description: 'Detaljan opis tipa hale 5. Ovo je mesto gde možeš dodati sve informacije o ovom tipu hale - karakteristike, prednosti, primene, itd.',
    features: ['Karakteristika 1', 'Karakteristika 2', 'Karakteristika 3'],
    cardImage: '/hale/tip5/kartica.jpg', // Glavna slika za karticu na listi proizvoda
    images: [
      '/hale/tip5/slika1.jpg',
      '/hale/tip5/slika2.jpg',
      '/hale/tip5/slika3.jpg',
    ],
    icon: '🏪'
  },
]

// Helper funkcija za pronalaženje hale po slug-u
export function getHalaBySlug(slug) {
  return tipoviHala.find(hala => hala.slug === slug)
}

// Helper funkcija za sve slug-ove (za static paths)
export function getAllHalaSlugs() {
  return tipoviHala.map(hala => hala.slug)
}

