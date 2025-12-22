import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Profesionalne Hale i Metalne Konstrukcije
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Izrađujemo hale po meri sa najkvalitetnijim materijalima i stručnom montažom
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/kalkulator"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Kalkulator Cena
            </Link>
            <Link
              href="/kontakt"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Kontaktirajte Nas
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Zašto Izabrati Nas?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-xl font-semibold mb-2">Kvalitetna Izrada</h3>
              <p className="text-gray-600">
                Koristimo samo najkvalitetnije materijale i najsavremenije tehnologije
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Brza Realizacija</h3>
              <p className="text-gray-600">
                Poštujemo rokove i brzo realizujemo projekte bez kompromisa u kvalitetu
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Najbolje Cene</h3>
              <p className="text-gray-600">
                Konkurentne cene uz mogućnost kalkulacije direktno sa sajta
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Spremni za Vaš Projekat?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Kontaktirajte nas danas i dobijte besplatnu ponudu
          </p>
          <Link
            href="/kontakt"
            className="bg-red-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors inline-block"
          >
            Traži Ponudu
          </Link>
        </div>
      </section>
    </div>
  )
}

