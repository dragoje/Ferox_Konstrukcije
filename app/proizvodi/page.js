import Link from 'next/link'
import Image from 'next/image'
import { tipoviHala } from '@/data/tipoviHala'

export default function Proizvodi() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Proizvodi</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Naši standardni tipovi hala koje uvek radimo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {tipoviHala.map((hala) => (
            <Link
              key={hala.id}
              href={`/proizvodi/${hala.slug}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 overflow-hidden block"
            >
              {/* Slika */}
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {hala.cardImage ? (
                  <Image
                    src={hala.cardImage}
                    alt={hala.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  // Fallback ako nema slike - prikaži placeholder
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-5xl mb-2">{hala.icon}</div>
                      <p className="text-sm">Dodaj sliku</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Naslov */}
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-center">{hala.title}</h2>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gray-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Interesuje vas nešto?</h2>
          <p className="text-gray-600 mb-6">
            Kontaktirajte nas ili koristite naš kalkulator za brzu procenu cene
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/kontakt"
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Kontaktirajte Nas
            </Link>
            <Link
              href="/kalkulator"
              className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors border border-gray-300"
            >
              Kalkulator Cena
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
