'use client'

export default function Montaza() {
  const koraci = [
    {
      broj: 1,
      naslov: 'Priprema Terena',
      opis: 'Priprema i izravnavanje terena na kome će se konstrukcija montirati. Provera nivoa i obezbeđivanje čvrstog temelja.',
      ikona: '🏗️'
    },
    {
      broj: 2,
      naslov: 'Postavljanje Temelja',
      opis: 'Postavljanje betonskih temelja ili sidara prema projektnoj dokumentaciji. Obezbeđivanje tačnih dimenzija i pozicija.',
      ikona: '🔨'
    },
    {
      broj: 3,
      naslov: 'Montaža Nosača',
      opis: 'Postavljanje glavnih nosača konstrukcije. Precizno pozicioniranje i pričvršćivanje na temelje.',
      ikona: '⚙️'
    },
    {
      broj: 4,
      naslov: 'Montaža Poprečnih Nosača',
      opis: 'Postavljanje poprečnih nosača koji povezuju glavne nosače i obezbeđuju stabilnost konstrukcije.',
      ikona: '🔧'
    },
    {
      broj: 5,
      naslov: 'Postavljanje Krova',
      opis: 'Montaža krovnih panela ili limova. Obezbeđivanje vodonepropusnosti i pravilnog nagiba krova.',
      ikona: '🏠'
    },
    {
      broj: 6,
      naslov: 'Postavljanje Zidova',
      opis: 'Montaža bočnih zidova i fasade. Postavljanje panela ili limova prema specifikaciji.',
      ikona: '🧱'
    },
    {
      broj: 7,
      naslov: 'Finalna Provera',
      opis: 'Kontrola kvaliteta, provera svih spojeva, nivoa i sigurnosti. Finalna provera prema projektnoj dokumentaciji.',
      ikona: '✅'
    }
  ]

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Postupak Montaže</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kako se obavlja montaža hala?
          </p>
        </div>

        {/* Steps Section */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {koraci.map((korak, index) => (
              <div
                key={korak.broj}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-6">
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-red-700 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      {korak.broj}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{korak.ikona}</span>
                      <h2 className="text-2xl font-bold text-gray-900">{korak.naslov}</h2>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed">{korak.opis}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Važne Napomene</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <h3 className="font-semibold mb-1">Vreme Montaže</h3>
                  <p className="text-gray-300">Vreme montaže zavisi od veličine i složenosti konstrukcije, obično 1-5 radnih dana.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🛠️</span>
                <div>
                  <h3 className="font-semibold mb-1">Oprema</h3>
                  <p className="text-gray-300">Koristimo najsavremeniju opremu i alate za brzu i sigurnu montažu.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="font-semibold mb-1">Dokumentacija</h3>
                  <p className="text-gray-300">Sve radove obavljamo prema projektnoj dokumentaciji i standardima.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Imate Pitanja o Montaži?</h2>
            <p className="text-gray-600 mb-6">
              Kontaktirajte nas za više informacija o procesu montaže ili za besplatnu konsultaciju
            </p>
            <a
              href="/kontakt"
              className="inline-block bg-red-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
            >
              Kontaktirajte Nas
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

