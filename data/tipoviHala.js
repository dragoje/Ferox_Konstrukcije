// Podaci o tipovima hala koje uvek radimo
// Možeš lako dodati/izmeniti tipove ovde

export const tipoviHala = [
  {
    id: 1,
    slug: 'tip-hale-1',
    title: 'Konstrukcija 16x8x4m',
    sku: 'FK-16x8x4',
    price: '3200 €',
    priceNote: 'Napomena: prevoz i montaža nisu uključeni u cenu. Montažu ne radimo, ali po potrebi možemo organizovati prevoz.',
    specs: [
      { icon: '📐', value: '16 × 8 × 4 m' },
      { icon: '⚖️', value: '~2100 kg' },
    ],
    shortDescription: '',
    description: `Montazna konstrukcija za halu dimenzija 16x8m.

Uz konstrukciju se dobija crtež sa dimenzijama i rasporedom stubova. Moguća izrada i odgovarajućih ankrer ploča sa šrafovoma za betoniranje.

Tezina konstrukcije je oko 2100kg.

Profili za stubove su 100x100x3.8mm, za bindere 80x60x2.8 i za ispunu 40x40x2.8mm. Profili za roznjace su 80x40x2.8.

Ploce za ankerisanje su 200x200x10mm, za vezivanje bindera su 180x150x10mm.

Cela konstrukcija ja ofarbana u 2 ruke osnovnom anti-korozivnom farbom.

U cenu su uračunati stubovi sa zavarenim anker plocama, binderi i rožnjače. Binderi se šrafe za stubove a rožnjače se vare na L profile zavarene na bindere.`,
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
    title: 'Konstrukcija 15x10x4.5m',
    sku: 'FK-15x10x4.5',
    price: '4400 €',
    priceNote: 'Napomena: prevoz i montaža nisu uključeni u cenu. Montažu ne radimo, ali po potrebi možemo organizovati prevoz.',
    specs: [
      { icon: '📐', value: '15 × 10 × 4.5 m' },
      { icon: '⚖️', value: '~2800 kg' },
    ],
    shortDescription: '',
    description:`Montazna konstrukcija za halu dimenzija 15x10m.

Uz konstrukciju se dobija crtež sa dimenzijama i rasporedom stubova. Moguća izrada i odgovarajućih ankrer ploča sa šrafovoma za betoniranje.

Tezina konstrukcije je oko 2800kg.

Profili za stubove su 120x120x3.8mm, za bindere 80x60x3.8 i za ispunu 40x40x2.8mm. Profili za roznjace su 80x40x2.8.

Ploce za ankerisanje su 200x200x10mm, za vezivanje bindera su 180x150x10mm.

Cela konstrukcija ja ofarbana u 2 ruke osnovnom anti-korozivnom farbom.

U cenu su uračunati stubovi sa zavarenim anker plocama, binderi i rožnjače. Binderi se šrafe za stubove a rožnjače se vare na L profile zavarene na bindere.`,
    features: [' stubovi 120x120x3.8mm', ' binderi 80x60x3.8', ' rožnjače 80x40x2.8', ' ispuna 40x40x2.8mm', ' vezivanje stubova 200x200x10mm', ' vezivanje bindera 180x150x10mm', ' ofarbana u 2 ruke osnovnom antikorozivnom farbom'],
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
    title: 'Konstrukcija 12x6x3m',
    sku: 'FK-12x6x3',
    price: '1700 €',
    priceNote: 'Napomena: prevoz i montaža nisu uključeni u cenu. Montažu ne radimo, ali po potrebi možemo organizovati prevoz.',
    specs: [
      { icon: '📐', value: '12 × 6 × 3 m' },
      { icon: '⚖️', value: '~1100 kg' },
    ],
    description: `Montazna konstrukcija za halu dimenzija 15x10m.

Uz konstrukciju se dobija crtež sa dimenzijama i rasporedom stubova. Moguća izrada i odgovarajućih ankrer ploča sa šrafovoma za betoniranje.

Tezina konstrukcije je oko 1100kg.

Profili za stubove su 100x100x2.8mm, za bindere 80x60x2.8 i za ispunu 40x40x2.8mm. Profili za roznjace su 80x40x2.8.

Ploce za ankerisanje su 200x200x10mm, za vezivanje bindera su 180x150x10mm.

Cela konstrukcija ja ofarbana u 2 ruke osnovnom anti-korozivnom farbom.

U cenu su uračunati stubovi sa zavarenim anker plocama, binderi i rožnjače. Binderi se šrafe za stubove a rožnjače se vare na L profile zavarene na bindere.`,
    features: [' stubovi 100x100x2.8mm', ' binderi 80x60x2.8', ' rožnjače 60x40x2.8', ' ispuna 40x40x2.8mm', ' vezivanje stubova 200x200x10mm', ' vezivanje bindera 180x150x10mm', ' ofarbana u 2 ruke osnovnom antikorozivnom farbom'],
    cardImage: '/hale/tip3/slika1.PNG', // Glavna slika za karticu na listi proizvoda
    images: [
      '/hale/tip3/slika1.PNG',
      '/hale/tip3/slika2.PNG',
    ],
    icon: '🌾'
  },
  {
    id: 4,
    slug: 'tip-hale-4',
    title: 'Konstrukcija 24x12x4.5m',
    sku: 'FK-24x12x4.5',
    price: '7800 €',
    priceNote: 'Napomena: prevoz i montaža nisu uključeni u cenu. Montažu ne radimo, ali po potrebi možemo organizovati prevoz.',
    specs: [
      { icon: '📐', value: '24 × 12 × 4.5 m' },
      { icon: '⚖️', value: '~4850 kg' },
    ],
    description: `Montazna konstrukcija za halu dimenzija 15x10m.

Uz konstrukciju se dobija crtež sa dimenzijama i rasporedom stubova. Moguća izrada i odgovarajućih ankrer ploča sa šrafovoma za betoniranje.

Tezina konstrukcije je oko 4850kg.

Profili za stubove su 120x120x4.8mm, za bindere 80x80x3.8 i za ispunu 40x40x2.8mm. Profili za roznjace su 80x40x2.8.

Ploce za ankerisanje su 200x200x10mm, za vezivanje bindera su 180x150x10mm.

Cela konstrukcija ja ofarbana u 2 ruke osnovnom anti-korozivnom farbom.

U cenu su uračunati stubovi sa zavarenim anker plocama, binderi i rožnjače. Binderi se šrafe za stubove a rožnjače se vare na L profile zavarene na bindere.`,
    features: [' stubovi 120x120x4.8mm', ' binderi 80x80x3.8', ' rožnjače 80x40x2.8', ' ispuna 40x40x2.8mm', ' vezivanje stubova 200x200x10mm', ' vezivanje bindera 180x150x10mm', ' ofarbana u 2 ruke osnovnom antikorozivnom farbom'],
    cardImage: '/hale/tip4/slika1.PNG', // Glavna slika za karticu na listi proizvoda
    images: [
      '/hale/tip4/slika1.PNG',
      '/hale/tip4/slika2.PNG',
      
    ],
    icon: '⚽'
  },
  // {
  //   id: 5,
  //   slug: 'tip-hale-5',
  //   title: 'Tip Hale 5',
  //   shortDescription: 'Kratak opis tipa hale 5',
  //   description: 'Detaljan opis tipa hale 5. Ovo je mesto gde možeš dodati sve informacije o ovom tipu hale - karakteristike, prednosti, primene, itd.',
  //   features: ['Karakteristika 1', 'Karakteristika 2', 'Karakteristika 3'],
  //   cardImage: '/hale/tip5/slika1.PNG', // Glavna slika za karticu na listi proizvoda
  //   images: [
  //     '/hale/tip5/slika1.PNG',
  //     '/hale/tip5/slika2.PNG',
  //     '/hale/tip5/slika3.PNG',
  //   ],
  //   icon: '🏪'
  // },
]

// Helper funkcija za pronalaženje hale po slug-u
export function getHalaBySlug(slug) {
  return tipoviHala.find(hala => hala.slug === slug)
}

// Helper funkcija za sve slug-ove (za static paths)
export function getAllHalaSlugs() {
  return tipoviHala.map(hala => hala.slug)
}

