'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const DEFAULT_BENEFITS = [
  { icon: 'shield', title: 'Garancija kvaliteta', description: 'Provereni materijali i precizna izrada' },
  { icon: 'steel', title: 'Čelični profili', description: 'Visokootporne dimenzije po standardu' },
  { icon: 'custom', title: 'Prilagođavanje', description: 'Moguća izrada po vašim dimenzijama' },
  { icon: 'paint', title: 'Antikorozivna zaštita', description: 'Zaštita u dva sloja uključena u cenu' },
  { icon: 'quality', title: 'Premium zavarivanje', description: 'Stubovi sa anker pločama i rožnjače' },
  { icon: 'build', title: 'Brza montaža', description: 'Montažni komplet sa uputstvom za sklapanje' },
]

const DEFAULT_IMPORTANT_INFO = [
  {
    icon: 'truck',
    text: 'Isporuka u roku od 2–4 nedelje',
  },
  {
    icon: 'shield',
    text: 'Kvalitetna antikorozivna zaštita u 2 sloja',
  },
  {
    icon: 'package',
    text: 'U cenu uračunati: stubovi, binderi, rožnjače i montažni materijal',
  },
  {
    icon: 'blueprint',
    text: 'Crtež sa dimenzijama i rasporedom stubova uključen',
  },
]

function InfoIcon({ type }) {
  const cls = 'w-5 h-5 text-red-700 shrink-0'
  switch (type) {
    case 'truck':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0zM3 9h11v8H3V9zm11 0h3l3 4v4h-6V9zM3 9l2-5h6v5H3z" />
        </svg>
      )
    case 'shield':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    case 'package':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    case 'blueprint':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      )
    default:
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
  }
}

function BenefitIcon({ type }) {
  const cls = 'w-6 h-6 text-white'
  switch (type) {
    case 'shield':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    case 'steel':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )
    case 'custom':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )
    case 'paint':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    case 'quality':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    case 'build':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03a2.652 2.652 0 013.582-.582l1.06 1.06a2.652 2.652 0 01-.582 3.582l-3.03 2.496M11.42 15.17L4.5 8.25" />
        </svg>
      )
    default:
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      )
  }
}

export default function ProductDetailHero({ hala }) {
  const images = hala.images || []
  const plans = hala.plans?.length ? hala.plans : images
  const importantInfo = hala.importantInfo || DEFAULT_IMPORTANT_INFO
  const benefits = hala.benefits || DEFAULT_BENEFITS

  const priceSectionRef = useRef(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [planIndex, setPlanIndex] = useState(0)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [showStickyBar, setShowStickyBar] = useState(false)

  useEffect(() => {
    const el = priceSectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-64px 0px 0px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const formatPrice = (price) =>
    typeof price === 'number' ? `${price.toLocaleString('sr-RS')} €` : price

  const visibleCount = Math.min(3, plans.length)
  const visiblePlans = Array.from({ length: visibleCount }, (_, i) => plans[(planIndex + i) % plans.length])

  const prevPlan = () => setPlanIndex((i) => (i === 0 ? plans.length - 1 : i - 1))
  const nextPlan = () => setPlanIndex((i) => (i === plans.length - 1 ? 0 : i + 1))

  return (
    <>
      {/* Korak 3: Galerija + info panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-8 lg:gap-10 mb-10">
        {/* Galerija sa vertikalnim thumbnail-ima */}
        <div>
          <div className="flex gap-3">
            <div className="flex-1 aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200">
              {images[selectedImageIndex] ? (
                <Image
                  src={images[selectedImageIndex]}
                  alt={`${hala.title} - slika ${selectedImageIndex + 1}`}
                  fill
                  className="object-cover cursor-zoom-in"
                  quality={100}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                  onClick={() => setLightboxImage(images[selectedImageIndex])}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-2">{hala.icon}</div>
                    <p>Nema dostupnih slika</p>
                  </div>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex flex-col gap-2 w-[72px] shrink-0">
                {images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-red-700 ring-1 ring-red-200'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${hala.title} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      quality={80}
                      sizes="72px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desni panel: naslov, cena, dugmad */}
        <div className="lg:pt-2">
          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            {hala.title}
          </h1>
          {hala.sku && (
            <p className="text-sm text-gray-500 mb-4">Šifra: {hala.sku}</p>
          )}

          {hala.specs && (
            <div className="flex flex-wrap gap-4 mb-5 pb-5 border-b border-gray-200">
              {hala.specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-lg">{spec.icon}</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {hala.price && (
            <div ref={priceSectionRef} className="mb-6">
              {hala.originalPrice && (
                <p className="text-sm text-gray-400 line-through mb-0.5">
                  {formatPrice(hala.originalPrice)}
                </p>
              )}
              <p className="text-3xl xl:text-4xl font-bold text-red-700">
                {formatPrice(hala.price)}
              </p>
              <p className="text-xs text-gray-500 mt-1">PDV uračunat u cenu</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              href="/kontakt"
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-md font-semibold text-gray-800 hover:border-gray-400 hover:bg-gray-50 transition-colors text-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Kontakt
            </Link>
            <Link
              href="/kontakt"
              className="px-6 py-3 bg-gray-900 text-white rounded-md font-semibold hover:bg-gray-800 transition-colors text-center"
            >
              Traži ponudu
            </Link>
          </div>
        </div>
      </div>

      {/* Korak 4 + 5: Carousel crteža + Važne informacije */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-8 lg:gap-10 mb-12 pb-12 border-b border-gray-200">
        {/* Carousel */}
        {plans.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              {hala.plans?.length ? 'Tehnički crteži' : 'Pregled proizvoda'}
            </p>
            <div className="relative">
              <div className={`grid gap-3 ${visibleCount === 1 ? 'grid-cols-1' : visibleCount === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {visiblePlans.map((plan, idx) => (
                  <button
                    key={`${planIndex}-${idx}`}
                    type="button"
                    onClick={() => setLightboxImage(plan)}
                    className="group relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-red-300 transition-colors"
                  >
                    <Image
                      src={plan}
                      alt={`Crtež ${planIndex + idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>

              {plans.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevPlan}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-9 h-9 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Prethodni crtež"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={nextPlan}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-9 h-9 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Sledeći crtež"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Važne informacije */}
        <div className="lg:pt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Važne informacije</h2>
          <ul className="space-y-4">
            {importantInfo.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <InfoIcon type={item.icon} />
                <span className="text-sm text-gray-700 leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ul>
          {hala.priceNote && (
            <p className="mt-5 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
              {hala.priceNote}
            </p>
          )}
        </div>
      </div>

      {/* Korak 6: Prednosti proizvoda */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center lg:text-left">
          Istaknute prednosti
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 border border-gray-200 rounded-xl p-5 lg:p-8 bg-gray-50/50">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-700 shrink-0">
                <BenefitIcon type={benefit.icon} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky traka sa cenom pri scrollu */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-transform duration-300 ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
        aria-hidden={!showStickyBar}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="min-w-0 flex-1 hidden md:block">
              <p className="font-semibold text-gray-900 truncate text-sm">{hala.title}</p>
              {hala.sku && (
                <p className="text-xs text-gray-500">Šifra: {hala.sku}</p>
              )}
            </div>

            {hala.specs && (
              <div className="hidden lg:flex items-center gap-5 shrink-0">
                {hala.specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-sm text-gray-700">
                    <span>{spec.icon}</span>
                    <span className="font-medium whitespace-nowrap">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 ml-auto w-full sm:w-auto">
              {hala.price && (
                <div className="text-right">
                  {hala.originalPrice && (
                    <p className="text-xs text-gray-400 line-through hidden sm:block">
                      {formatPrice(hala.originalPrice)}
                    </p>
                  )}
                  <p className="text-xl sm:text-2xl font-bold text-red-700 whitespace-nowrap">
                    {formatPrice(hala.price)}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/kontakt"
                  className="hidden sm:flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Kontakt
                </Link>
                <Link
                  href="/kontakt"
                  className="px-4 sm:px-6 py-2 bg-gray-900 text-white rounded-md text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  Traži ponudu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setLightboxImage(null)}
            aria-label="Zatvori"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative w-full max-w-4xl aspect-[4/3]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxImage}
              alt="Uvećani prikaz"
              fill
              className="object-contain"
              quality={100}
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </>
  )
}
