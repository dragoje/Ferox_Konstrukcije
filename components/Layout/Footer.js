import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">FEROX KONSTRUKCIJE</h3>
            <p className="text-gray-400">
              Profesionalne hale i metalne konstrukcije po meri.
              Kvalitet, pouzdanost i najbolje cene.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Brzi Linkovi</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Početna
                </Link>
              </li>
              <li>
                <Link href="/proizvodi" className="hover:text-white transition-colors">
                  Proizvodi
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/kalkulator" className="hover:text-white transition-colors">
                  Kalkulator
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Kontakt</h3>
            <ul className="space-y-2 text-gray-400">
              <li>📧 Email: info@ferox.rs</li>
              <li>📞 Telefon: +381 XX XXX XXXX</li>
              <li>📍 Adresa: [Vaša adresa]</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} FEROX KONSTRUKCIJE. Sva prava zadržana.</p>
        </div>
      </div>
    </footer>
  )
}

