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
  const s = String(iso)
  const d = new Date(s.includes('T') ? s : s + 'T12:00:00')
  return isNaN(d.getTime()) ? null : d
}

function danURasponu(dan, start, end) {
  if (!start || !end) return false
  const d = new Date(dan.getFullYear(), dan.getMonth(), dan.getDate())
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  return d >= s && d <= e
}

function projektiZaDan(dan, projekti) {
  return projekti.filter((p) => {
    const start = parseDate(p.datumKreiranja)
    const end = p.rok ? parseDate(p.rok) : start
    if (!start) return false
    const endDate = end || start
    return danURasponu(dan, start, endDate)
  })
}

function projektiUMesecu(projekti, year, month) {
  const prvi = new Date(year, month, 1)
  const poslednji = new Date(year, month + 1, 0)
  const brojDana = poslednji.getDate()

  return projekti
    .filter((p) => {
      const start = parseDate(p.datumKreiranja)
      const end = p.rok ? parseDate(p.rok) : start
      if (!start) return false
      const e = end || start
      return start <= poslednji && e >= prvi
    })
    .map((p, idx) => {
      const start = parseDate(p.datumKreiranja)
      const end = p.rok ? parseDate(p.rok) : start
      const e = end || start
      const startDan = start < prvi ? 1 : start.getDate()
      const endDan = e > poslednji ? brojDana : e.getDate()
      const left = ((startDan - 1) / brojDana) * 100
      const width = Math.max(2, ((endDan - startDan + 1) / brojDana) * 100)
      return {
        ...p,
        colorIdx: idx % PROJEKAT_BOJE.length,
        left,
        width,
        startDan,
        endDan,
      }
    })
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
    () => projektiUMesecu(projekti, current.year, current.month),
    [projekti, current.year, current.month]
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
        <div className="grid grid-cols-7 gap-0 text-center">
          {DANI_NEDELJE.map((d, i) => (
            <div key={i} className="text-[9px] font-medium text-gray-500 py-0.5">
              {d}
            </div>
          ))}
          {dani.map((dan, i) => {
            if (!dan) {
              return <div key={`e-${i}`} className="min-h-[44px]" />
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
                className={`min-h-[44px] flex flex-col items-center justify-start pt-0.5 px-0 pb-0 rounded-none border border-gray-200/50 transition-colors ${
                  isSelected ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : isToday ? 'bg-gray-100 border-gray-300' : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <span className={`text-[10px] font-medium leading-tight px-0.5 ${isToday ? 'text-gray-900' : 'text-gray-700'}`}>
                  {dan.getDate()}
                </span>
                <div className="w-full mt-0.5 flex-1 min-h-0 flex flex-col justify-end gap-0.5">
                  {projektiNaDan.map((p) => {
                    const found = projektiUMesecuSvi.find((x) => x.id === p.id)
                    const colorIdx = found ? found.colorIdx : 0
                    const jeZavrsen = normalizeStatus(p.status) === 'zavrseno'
                    if (jeZavrsen) {
                      return (
                        <span
                          key={p.id}
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 self-center ${PROJEKAT_BOJE[colorIdx] || 'bg-gray-400'}`}
                          title={p.naziv}
                        />
                      )
                    }
                    return (
                      <div
                        key={p.id}
                        className={`w-full min-w-full h-1.5 rounded-none flex-shrink-0 ${PROJEKAT_BOJE[colorIdx] || 'bg-gray-400'}`}
                        title={p.naziv}
                      />
                    )
                  })}
                </div>
              </button>
            )
          })}
          {projektiTimeline.length > 0 && (
            <div className="col-span-7 flex flex-wrap gap-x-3 gap-y-1 pt-1">
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
    </div>
  )
}
