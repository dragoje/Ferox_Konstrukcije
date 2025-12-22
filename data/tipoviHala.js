// Podaci o tipovima hala koje uvek radimo
// Možeš lako dodati/izmeniti tipove ovde

export const tipoviHala = [
  {
    id: 1,
    slug: 'tip-hale-1',
    title: 'Tip Hale 1',
    shortDescription: 'Kratak opis tipa hale 1',
    description: 'Detaljan opis tipa hale 1. Ovo je mesto gde možeš dodati sve informacije o ovom tipu hale - karakteristike, prednosti, primene, itd.',
    features: ['Karakteristika 1', 'Karakteristika 2', 'Karakteristika 3'],
    cardImage: '/hale/tip1/kartica.jpg', // Glavna slika za karticu na listi proizvoda
    images: [
      '/hale/tip1/slika1.jpg',
      '/hale/tip1/slika2.jpg',
      '/hale/tip1/slika3.jpg',
    ],
    icon: '🏗️'
  },
  {
    id: 2,
    slug: 'tip-hale-2',
    title: 'Tip Hale 2',
    shortDescription: 'Kratak opis tipa hale 2',
    description: 'Detaljan opis tipa hale 2. Ovo je mesto gde možeš dodati sve informacije o ovom tipu hale - karakteristike, prednosti, primene, itd.',
    features: ['Karakteristika 1', 'Karakteristika 2', 'Karakteristika 3'],
    cardImage: '/hale/tip2/kartica.jpg', // Glavna slika za karticu na listi proizvoda
    images: [
      '/hale/tip2/slika1.jpg',
      '/hale/tip2/slika2.jpg',
      '/hale/tip2/slika3.jpg',
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

