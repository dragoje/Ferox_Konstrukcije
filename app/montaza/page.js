'use client'

export default function Montaza() {
  const koraci = [
    {
      broj: 1,
      naslov: 'Priprema betonske podloge i ankera',
      opis: `Montaža može da se izvodi na više načina, u zavisnosti od faze gradnje i dogovora sa investitorom:

Ugradnja anker ploča u svež beton
Anker ploče se postavljaju i utapaju u beton prema unapred definisanim i tačnim merama konstrukcije.

Bušenje već gotovog betona
Na postojećoj betonskoj ploči se obeležavaju pozicije stubova, nakon čega se buše rupe za anker šrafove.

U oba slučaja, za precizno poravnanje koristi se konac ili laserska linija, kako bi svi stubovi bili u istoj osi i ravni.`,
      ikona: '🏗️'
    },
    {
      broj: 2,
      naslov: 'Montaža stubova',
      opis: `Stubovi se postavljaju na pripremljene anker ploče ili anker šrafove i privremeno pričvršćuju.

Stubovi se nivelisu pod libelu (vertikalno poravnanje)

Po potrebi se privremeno fiksiraju klinovima ili podmetačima

Nakon provere, stubovi se blago dotegnu, ali se ostavlja mogućnost finog podešavanja u sledećim fazama`,
      ikona: '📏'
    },
    {
      broj: 3,
      naslov: 'Montaža bindera',
      opis: `Nakon postavljanja stubova, pristupa se montaži krovnih bindera.

Binderi se spuštaju odozgo (kranom ili viljuškarom)

Vezuju se za stubove pomoću vijčanih spojeva

Proverava se pravac i visina bindera

Po potrebi se dodatno ispravljaju stubovi i binderi pomoću klinova`,
      ikona: '🔧'
    },
    {
      broj: 4,
      naslov: 'Postavljanje rožnjača',
      opis: `Kada su stubovi i binderi pravilno postavljeni:

Rožnjače se postavljaju na kant

Oslanjaju se na L-profile ili nosače na binderima

Rožnjače se zavaruju ili fiksiraju prema projektu`,
      ikona: '🏠'
    },
    {
      broj: 5,
      naslov: 'Ugradnja ukrućenja',
      opis: `Radi dodatne stabilnosti konstrukcije:

Postavljaju se bočna i krovna ukrućenja po potrebi

Ukrućenja sprečavaju bočna pomeranja i uvijanja konstrukcije

Sve veze se proveravaju pre konačnog zatezanja`,
      ikona: '⚙️'
    },
    {
      broj: 6,
      naslov: 'Završno poravnanje i zatezanje',
      opis: `Kada je kompletna konstrukcija postavljena:

Proverava se vertikalnost, horizontalnost i dijagonale

Konstrukcija se dovodi u završnu libelu

Svi vijci i anker šrafovi se konačno zatežu

Konstrukcija je spremna za dalju ugradnju krova i obloga`,
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
                    <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">{korak.opis}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info Section
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
        </div> */}

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

