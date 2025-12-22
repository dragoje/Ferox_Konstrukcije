'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getHalaBySlug, getAllHalaSlugs } from '@/data/tipoviHala'

export default function HalaDetailPage({ params }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [slug, setSlug] = useState(null)

  useEffect(() => {
    // Handle both sync and async params (Next.js 14)
    async function getSlug() {
      if (params?.slug) {
        setSlug(params.slug)
      } else if (params && typeof params.then === 'function') {
        const resolvedParams = await params
        setSlug(resolvedParams.slug)
      }
    }
    getSlug()
  }, [params])

  // Get hala data
  const hala = slug ? getHalaBySlug(slug) : null

  // Loading state
  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Učitavanje...</p>
        </div>
      </div>
    )
  }

  // Not found state
  if (!hala) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Hala nije pronađena</h1>
          <Link href="/proizvodi" className="text-red-700 hover:text-red-800 hover:underline transition-colors">
            Vrati se na proizvode
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li><Link href="/" className="hover:text-red-700 transition-colors">Početna</Link></li>
            <li>/</li>
            <li><Link href="/proizvodi" className="hover:text-red-700 transition-colors">Proizvodi</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{hala.title}</li>
          </ol>
        </nav>

        {/* Main Content - 50/50 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Leva strana - Slike */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold mb-4 lg:hidden">{hala.title}</h1>

            {/* Glavna slika */}
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
              {hala.images && hala.images[selectedImageIndex] ? (
                <div className="w-full h-full flex items-center justify-center">
                  {/* Placeholder dok ne dodas prave slike */}
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-2">{hala.icon}</div>
                    <p className="text-sm">Slika {selectedImageIndex + 1}</p>
                    <p className="text-xs mt-2">{hala.images[selectedImageIndex]}</p>
                  </div>
                  {/* Kada imaš slike, koristi:
                  <Image
                    src={hala.images[selectedImageIndex]}
                    alt={`${hala.title} - Slika ${selectedImageIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                  */}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-2">{hala.icon}</div>
                    <p>Nema dostupnih slika</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail galerija */}
            {hala.images && hala.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {hala.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-video bg-gray-200 rounded-lg overflow-hidden relative border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-red-700 ring-2 ring-red-200'
                        : 'border-transparent hover:border-gray-400'
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      {index + 1}
                    </div>
                    {/* Kada imaš slike:
                    <Image
                      src={image}
                      alt={`${hala.title} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    */}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desna strana - Opis */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 hidden lg:block">{hala.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{hala.shortDescription}</p>
            </div>

            {/* Glavni opis */}
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold mb-3">Opis</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {hala.description}
              </p>
            </div>

            {/* Karakteristike */}
            <div>
              <h2 className="text-2xl font-semibold mb-3">Karakteristike</h2>
              <ul className="space-y-2">
                {hala.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-red-700 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/kontakt"
                className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center"
              >
                Traži Ponudu
              </Link>
              <Link
                href="/kalkulator"
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
              >
                Kalkulator Cena
              </Link>
            </div>
          </div>
        </div>

        {/* Navigacija do drugih tipova */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Ostali Tipovi Hala</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {getAllHalaSlugs()
              .filter(slug => slug !== hala.slug)
              .map(slug => {
                const otherHala = getHalaBySlug(slug)
                return (
                  <Link
                    key={slug}
                    href={`/proizvodi/${slug}`}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all text-center"
                  >
                    <div className="text-3xl mb-2">{otherHala.icon}</div>
                    <p className="font-semibold text-sm">{otherHala.title}</p>
                  </Link>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}

