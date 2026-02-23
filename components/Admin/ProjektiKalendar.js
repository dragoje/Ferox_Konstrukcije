'use client'

import { useState, useMemo } from 'react'

const PROJEKAT_BOJE = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-sky-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
]

const DANI_NEDELJE = ['P', 'U', 'S', 'Č', 'P', 'S', 'N']

function parseDate(iso) {
  if (!iso) return null
  const s = String(iso).trim()
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    const y = parseInt(match[1], 10)
    const m = parseInt(match[2], 10) - 1
    const d = parseInt(match[3], 10)
    const date = new Date(y, m, d)
    return isNaN(date.getTime()) ? null : date
  }
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function danURasponu(dan, start, end) {
  if (!start || !end) return false
  const d = new Date(dan.getFullYear(), dan.getMonth(), dan.getDate())
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  return d >= s && d <= e
}

function getStartDate(p) {
  return parseDate(p.datumPocetka) || parseDate(p.datumKreiranja)
}

function projektiZaDan(dan, projekti) {
  return projekti.filter((p) => {
    const start = getStartDate(p)
    const end = p.rok ? parseDate(p.rok) : start
    if (!start) return false
    const endDate = end || start
    return danURasponu(dan, start, endDate)
  })
}

function projektiUMesecu(projekti, year, month, pocetakNedelje) {
  const prvi = new Date(year, month, 1)
  const poslednji = new Date(year, month + 1, 0)
  const brojDana = poslednji.getDate()

  return projekti
    .filter((p) => {
      const start = getStartDate(p)
      const end = p.rok ? parseDate(p.rok) : start
      if (!start) return false
      const e = end || start
      return start <= poslednji && e >= prvi
    })
    .map((p, idx) => {
      const start = getStartDate(p)
      const end = p.rok ? parseDate(p.rok) : start
      const e = end || start
      if (!start || !e) return null
      const startNorm = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      const endNorm = new Date(e.getFullYear(), e.getMonth(), e.getDate())
      const startDan = startNorm < prvi ? 1 : start.getDate()
      const endDan = endNorm > poslednji ? brojDana : e.getDate()
      let minCol = 7
      let maxCol = 0
      for (let d = startDan; d <= endDan; d++) {
        const col = (pocetakNedelje + d - 1) % 7
        minCol = Math.min(minCol, col)
        maxCol = Math.max(maxCol, col)
      }
      const left = (minCol / 7) * 100
      const width = Math.max(2, ((maxCol - minCol + 1) / 7) * 100)
      return {
        ...p,
        colorIdx: idx % PROJEKAT_BOJE.length,
        left,
        width,
        startDan,
        endDan,
      }
    })
    .filter(Boolean)
}

export default function ProjektiKalendar({ projekti = [], izabraniDatum = null, onDayClick }) {
  const [current, setCurrent] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const prviDan = new Date(current.year, current.month, 1)
  const poslednjiDan = new Date(current.year, current.month + 1, 0)
  const pocetakNedelje = prviDan.getDay() === 0 ? 6 : prviDan.getDay() - 1
  const brojDana = poslednjiDan.getDate()

  const prethodni = () => {
    setCurrent((c) =>
      c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }
    )
  }

  const sledeci = () => {
    setCurrent((c) =>
      c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }
    )
  }

  const mesecIme = new Date(current.year, current.month).toLocaleDateString('sr-RS', {
    month: 'long',
    year: 'numeric',
  })

  const dani = []
  for (let i = 0; i < pocetakNedelje; i++) dani.push(null)
  for (let i = 1; i <= brojDana; i++) dani.push(new Date(current.year, current.month, i))

  const projektiUMesecuSvi = useMemo(
    () => projektiUMesecu(projekti, current.year, current.month, pocetakNedelje),
    [projekti, current.year, current.month, pocetakNedelje]
  )

  const normalizeStatus = (s) =>
    ({ dodato: 'novo', nabavka: 'aktivan', proizvodnja: 'aktivan', isporuka: 'aktivan' }[s] || s || 'novo')

  const projektiTimeline = useMemo(
    () => projektiUMesecuSvi.filter((p) => normalizeStatus(p.status) !== 'zavrseno'),
    [projektiUMesecuSvi]
  )

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <button
          type="button"
          onClick={prethodni}
          className="p-2 -m-2 rounded-lg hover:bg-gray-100 text-gray-600 active:bg-gray-200"
          aria-label="Prethodni mesec"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-800 capitalize">{mesecIme}</span>
        <button
          type="button"
          onClick={sledeci}
          className="p-2 -m-2 rounded-lg hover:bg-gray-100 text-gray-600 active:bg-gray-200"
          aria-label="Sledeći mesec"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="p-2">
        <div className="relative">
          <div className="grid grid-cols-7 gap-px text-center">
            {DANI_NEDELJE.map((d, i) => (
              <div key={i} className="text-[9px] font-medium text-gray-500 py-0.5">
                {d}
              </div>
            ))}
            {dani.map((dan, i) => {
              if (!dan) {
                return <div key={`e-${i}`} className="min-h-[44px] bg-gray-50/30" />
              }
              const projektiNaDan = projektiZaDan(dan, projekti)
              const isToday =
                dan.getDate() === new Date().getDate() &&
                dan.getMonth() === new Date().getMonth() &&
                dan.getFullYear() === new Date().getFullYear()
              const isSelected =
                izabraniDatum &&
                dan.getDate() === izabraniDatum.getDate() &&
                dan.getMonth() === izabraniDatum.getMonth() &&
                dan.getFullYear() === izabraniDatum.getFullYear()

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onDayClick?.(dan, projektiNaDan)}
                  className={`min-h-[44px] flex flex-col items-center justify-start pt-0.5 px-0.5 pb-6 rounded-sm transition-colors ${
                    isSelected ? 'bg-blue-50 ring-1 ring-blue-300' : isToday ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-[10px] font-medium leading-tight ${isToday ? 'text-gray-900' : 'text-gray-700'}`}>
                    {dan.getDate()}
                  </span>
                  <div className="flex flex-wrap justify-center gap-0.5 mt-0.5 flex-1 min-h-0">
                    {projektiNaDan.filter((p) => normalizeStatus(p.status) === 'zavrseno').map((p) => {
                      const found = projektiUMesecuSvi.find((x) => x.id === p.id)
                      const colorIdx = found ? found.colorIdx : 0
                      return (
                        <span
                          key={p.id}
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PROJEKAT_BOJE[colorIdx] || 'bg-gray-400'}`}
                          title={p.naziv}
                        />
                      )
                    })}
                  </div>
                </button>
              )
            })}
          </div>
          {/* Kontinuirane linije – jedan bar po projektu */}
          {projektiTimeline.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-0.5 pointer-events-none">
              {projektiTimeline.map((p) => (
                <div key={p.id} className="relative h-1.5 w-full">
                  <div
                    className={`absolute h-full rounded-sm ${PROJEKAT_BOJE[p.colorIdx]}`}
                    style={{ left: `${p.left}%`, width: `${p.width}%` }}
                    title={p.naziv}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        {projektiTimeline.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2 mt-1 border-t border-gray-100">
            {projektiTimeline.map((p) => (
              <span key={`lg-${p.id}`} className="flex items-center gap-1.5 text-[9px] text-gray-600">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PROJEKAT_BOJE[p.colorIdx]}`} />
                <span className="truncate max-w-[100px]" title={p.naziv}>{p.naziv}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
