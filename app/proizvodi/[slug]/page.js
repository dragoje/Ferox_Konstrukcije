'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getHalaBySlug } from '@/data/tipoviHala'
import ProductDetailHero from '@/components/Proizvodi/ProductDetailHero'

export default function HalaDetailPage({ params }) {
  const [slug, setSlug] = useState(null)

  useEffect(() => {
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

  const hala = slug ? getHalaBySlug(slug) : null

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
    <div className="min-h-screen bg-white pb-24">
      <div className="container mx-auto px-4 py-8 lg:py-10">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-500">
            <li><Link href="/" className="hover:text-red-700 transition-colors">Početna</Link></li>
            <li>/</li>
            <li><Link href="/proizvodi" className="hover:text-red-700 transition-colors">Proizvodi</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{hala.title}</li>
          </ol>
        </nav>

        <ProductDetailHero hala={hala} />

        {/* Opis i karakteristike */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Opis proizvoda</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {hala.description}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Karakteristike</h2>
            <ul className="space-y-3">
              {hala.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-red-700 text-white text-xs shrink-0 mt-0.5">✓</span>
                  <span className="text-gray-700">{feature.trim()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
