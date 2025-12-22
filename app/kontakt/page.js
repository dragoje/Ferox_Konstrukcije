'use client'

import { useState } from 'react'
import QuoteForm from '@/components/Forms/QuoteForm'

export default function Kontakt() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Kontakt</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kontaktirajte nas za besplatnu konsultaciju i ponudu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Kontakt Informacije</h2>

            <div className="space-y-6 mb-8">
              <div className="flex items-start">
                <div className="text-2xl mr-4">📧</div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a href="mailto:nikolaslavkovic95@gmail.com" className="text-red-700 hover:text-red-800 hover:underline transition-colors">
                    nikolaslavkovic95@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="text-2xl mr-4">📞</div>
                <div>
                  <h3 className="font-semibold mb-1">Telefon</h3>
                  <a href="tel:+381644739990" className="text-red-700 hover:text-red-800 hover:underline transition-colors">
                    +381 64 473 9990
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="text-2xl mr-4">📍</div>
                <div>
                  <h3 className="font-semibold mb-1">Adresa</h3>
                  <p className="text-gray-600">
                    Nikole Tesle 175/2<br />
                    Čačak, 32000<br />
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="text-2xl mr-4">🕒</div>
                <div>
                  <h3 className="font-semibold mb-1">Radno Vreme</h3>
                  <p className="text-gray-600">
                    Ponedeljak - Petak: 08:00 - 17:00<br />
                    Subota: 09:00 - 13:00<br />
                    Nedelja: Zatvoreno
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-lg overflow-hidden shadow-lg h-64">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Ferox+Konstrukcije,+Nikole+Tesle+175/2,+Čačak+32000,+Serbia&output=embed"
                title="Ferox Konstrukcije - Nikole Tesle 175/2, Čačak"
              />
            </div>
          </div>

          {/* Quote Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Traži Ponudu</h2>
            <QuoteForm />
          </div>
        </div>
      </div>
    </div>
  )
}

