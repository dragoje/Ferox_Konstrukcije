'use client'

import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'

/**
 * Ptičiji (plan) prikaz pozicija stubova po središnjim osama.
 * Dimenzije hale su spoljne (spojne ivice); ose su umanjene za profil stuba.
 */
export default function StuboviPlanView({
  length,
  width,
  brojBindera,
  stubTip = '100x100',
}) {
  const captureRef = useRef(null)
  const [isCopying, setIsCopying] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)

  const stubSizeMm = parseStubSizeMm(stubTip)
  const stubSizeCm = stubSizeMm / 10

  const outerLengthCm = Math.round(length * 100)
  const outerWidthCm = Math.round(width * 100)
  const centerLengthCm = Math.max(0, outerLengthCm - stubSizeCm)
  const centerWidthCm = Math.max(0, outerWidthCm - stubSizeCm)

  const axes = Math.max(2, brojBindera || 2)
  const spanCm = axes > 1 ? centerLengthCm / (axes - 1) : centerLengthCm

  // SVG samo za mrežu stubova + kotiranje — legenda je HTML ispod
  const padL = 90
  const padR = 36
  const padT = 56
  const padB = 110
  const plotW = 620
  const plotH = 240
  const svgW = padL + plotW + padR
  const svgH = padT + plotH + padB

  const toX = (i) => padL + (axes === 1 ? plotW / 2 : (i / (axes - 1)) * plotW)
  const rowYs = [padT, padT + plotH]
  const axisXs = Array.from({ length: axes }, (_, i) => toX(i))

  const formatCm = (v) => {
    const rounded = Math.round(v * 10) / 10
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  }

  // Dijagonala u prvom polju (ose 1–2): dužina = √(razmak² + širina²)
  const diagonalLengthCm = Math.sqrt(spanCm ** 2 + centerWidthCm ** 2)
  const hasDiagonal = axes >= 2
  const diagFrom = hasDiagonal ? { x: axisXs[0], y: rowYs[0] } : null
  const diagTo = hasDiagonal ? { x: axisXs[1], y: rowYs[1] } : null
  const diagMid = hasDiagonal
    ? { x: (diagFrom.x + diagTo.x) / 2, y: (diagFrom.y + diagTo.y) / 2 }
    : null

  const title = `POZICIJE STUBOVA – KONSTRUKCIJA ${formatMeters(length)}x${formatMeters(width)}m (CENTRALNE OSE)`

  const captureFullImage = async () => {
    if (!captureRef.current) return null

    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    })

    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      ignoreElements: (el) => el.hasAttribute('data-capture-ignore'),
    })

    return canvas.toDataURL('image/png')
  }

  const handleCopyToClipboard = async () => {
    try {
      setIsCopying(true)
      const dataUrl = await captureFullImage()
      if (!dataUrl) return

      const blob = await (await fetch(dataUrl)).blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])

      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2500)
    } catch (err) {
      console.error('Greška pri kopiranju plana stubova:', err)
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-start" data-capture-ignore>
        <button
          type="button"
          onClick={handleCopyToClipboard}
          disabled={isCopying}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm text-slate-800 bg-white hover:bg-slate-50 disabled:opacity-60 border border-slate-200 shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="whitespace-nowrap">
            {copyFeedback ? 'Kopirano!' : isCopying ? 'Kopiranje...' : 'Kopiraj sliku'}
          </span>
        </button>
      </div>

      <div
        ref={captureRef}
        className="w-full bg-white rounded-lg border border-gray-200 p-4 sm:p-5 space-y-5"
      >
        <div className="space-y-1 text-center">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-wide">
            {title}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-gray-700">
            SREDIŠNJE OSE PO ŠIRINI = {formatCm(centerWidthCm)} cm
          </p>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-auto min-w-[680px]"
            role="img"
            aria-label={title}
          >
            <rect width={svgW} height={svgH} fill="#ffffff" />

            {/* Horizontalne središnje ose */}
            {rowYs.map((y, ri) => (
              <line
                key={`axis-row-${ri}`}
                x1={axisXs[0]}
                y1={y}
                x2={axisXs[axisXs.length - 1]}
                y2={y}
                stroke="#4b5563"
                strokeWidth="1.2"
                strokeDasharray="8 3 2 3"
              />
            ))}

            {/* Vertikalne središnje ose */}
            {axisXs.map((x, i) => (
              <line
                key={`axis-col-${i}`}
                x1={x}
                y1={rowYs[0]}
                x2={x}
                y2={rowYs[1]}
                stroke="#4b5563"
                strokeWidth="1.2"
                strokeDasharray="8 3 2 3"
              />
            ))}

            {/* Dijagonala u prvom polju (ose 1–2) */}
            {hasDiagonal && (
              <g>
                <line
                  x1={diagFrom.x}
                  y1={diagFrom.y}
                  x2={diagTo.x}
                  y2={diagTo.y}
                  stroke="#b91c1c"
                  strokeWidth="2"
                />
                <rect
                  x={diagMid.x - 52}
                  y={diagMid.y - 28}
                  width={104}
                  height={36}
                  rx={4}
                  fill="#ffffff"
                  stroke="#b91c1c"
                  strokeWidth="1"
                />
                <text
                  x={diagMid.x}
                  y={diagMid.y - 10}
                  textAnchor="middle"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontSize="11"
                  fontWeight="700"
                  fill="#b91c1c"
                >
                  DIJAGONALA
                </text>
                <text
                  x={diagMid.x}
                  y={diagMid.y + 6}
                  textAnchor="middle"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontSize="11"
                  fill="#991b1b"
                >
                  {formatCm(diagonalLengthCm)} cm
                </text>
              </g>
            )}

            {/* Stubovi */}
            {axisXs.map((x, i) =>
              rowYs.map((y, ri) => (
                <g key={`stub-${i}-${ri}`}>
                  <rect
                    x={x - 9}
                    y={y - 9}
                    width={18}
                    height={18}
                    fill="#ffffff"
                    stroke="#111827"
                    strokeWidth="1.7"
                  />
                  <line x1={x - 7} y1={y} x2={x + 7} y2={y} stroke="#111827" strokeWidth="1.2" />
                  <line x1={x} y1={y - 7} x2={x} y2={y + 7} stroke="#111827" strokeWidth="1.2" />
                </g>
              ))
            )}

            {/* Brojevi osa */}
            {axisXs.map((x, i) => (
              <g key={`num-${i}`}>
                <circle cx={x} cy={padT - 26} r={13} fill="#ffffff" stroke="#111827" strokeWidth="1.5" />
                <text
                  x={x}
                  y={padT - 21}
                  textAnchor="middle"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontSize="13"
                  fontWeight="700"
                  fill="#111827"
                >
                  {i + 1}
                </text>
              </g>
            ))}

            {/* Kotiranje razmaka po dužini */}
            {axes > 1 &&
              Array.from({ length: axes - 1 }, (_, i) => {
                const x1 = axisXs[i]
                const x2 = axisXs[i + 1]
                const y = rowYs[1] + 36
                return (
                  <g key={`span-${i}`}>
                    <line x1={x1} y1={y} x2={x2} y2={y} stroke="#111827" strokeWidth="1.2" />
                    <line x1={x1} y1={y - 7} x2={x1} y2={y + 7} stroke="#111827" strokeWidth="1.2" />
                    <line x1={x2} y1={y - 7} x2={x2} y2={y + 7} stroke="#111827" strokeWidth="1.2" />
                    <rect
                      x={(x1 + x2) / 2 - 38}
                      y={y + 8}
                      width={76}
                      height={18}
                      fill="#ffffff"
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={y + 21}
                      textAnchor="middle"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                      fontSize="13"
                      fill="#111827"
                    >
                      {formatCm(spanCm)} cm
                    </text>
                  </g>
                )
              })}

            {/* Ukupna dužina */}
            <g>
              <line
                x1={axisXs[0]}
                y1={rowYs[1] + 72}
                x2={axisXs[axisXs.length - 1]}
                y2={rowYs[1] + 72}
                stroke="#111827"
                strokeWidth="1.5"
              />
              <line x1={axisXs[0]} y1={rowYs[1] + 65} x2={axisXs[0]} y2={rowYs[1] + 79} stroke="#111827" strokeWidth="1.5" />
              <line
                x1={axisXs[axisXs.length - 1]}
                y1={rowYs[1] + 65}
                x2={axisXs[axisXs.length - 1]}
                y2={rowYs[1] + 79}
                stroke="#111827"
                strokeWidth="1.5"
              />
              <rect
                x={(axisXs[0] + axisXs[axisXs.length - 1]) / 2 - 175}
                y={rowYs[1] + 82}
                width={350}
                height={20}
                fill="#ffffff"
              />
              <text
                x={(axisXs[0] + axisXs[axisXs.length - 1]) / 2}
                y={rowYs[1] + 97}
                textAnchor="middle"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontSize="13"
                fontWeight="600"
                fill="#111827"
              >
                SREDIŠNJE OSE PO DUŽINI UKUPNO = {formatCm(centerLengthCm)} cm
              </text>
            </g>

            {/* Kotiranje širine (levo) — linija i tekst odvojeni */}
            <g>
              <line
                x1={padL - 42}
                y1={rowYs[0]}
                x2={padL - 42}
                y2={rowYs[1]}
                stroke="#111827"
                strokeWidth="1.5"
              />
              <line x1={padL - 50} y1={rowYs[0]} x2={padL - 34} y2={rowYs[0]} stroke="#111827" strokeWidth="1.5" />
              <line x1={padL - 50} y1={rowYs[1]} x2={padL - 34} y2={rowYs[1]} stroke="#111827" strokeWidth="1.5" />
              <rect
                x={12}
                y={(rowYs[0] + rowYs[1]) / 2 - 40}
                width={22}
                height={80}
                fill="#ffffff"
              />
              <text
                x={24}
                y={(rowYs[0] + rowYs[1]) / 2}
                textAnchor="middle"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontSize="13"
                fontWeight="600"
                fill="#111827"
                transform={`rotate(-90 24 ${(rowYs[0] + rowYs[1]) / 2})`}
              >
                {formatCm(centerWidthCm)} cm
              </text>
            </g>
          </svg>
        </div>

        {/* Legenda / presek / napomene — HTML ispod, bez overlap-a */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-gray-200 pt-4 text-sm text-gray-800">
          <div>
            <p className="font-bold mb-3">LEGENDA:</p>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center justify-center w-4 h-4 border-2 border-gray-900 bg-white relative shrink-0">
                <span className="absolute w-2.5 h-px bg-gray-900" />
                <span className="absolute h-2.5 w-px bg-gray-900" />
              </span>
              <span>STUB (POZICIJA)</span>
            </div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span
                className="w-9 border-t-2 border-gray-600 shrink-0"
                style={{ borderTopStyle: 'dashed' }}
              />
              <span>SREDIŠNJA OSA</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-0.5 bg-red-700 shrink-0 rotate-[-25deg]" />
              <span>DIJAGONALA (1. polje)</span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-center">
            <p className="font-bold mb-3">POPREČNI PRESEK STUBA:</p>
            <div className="w-[72px] h-[72px] border-2 border-gray-900 bg-white flex items-center justify-center text-xs font-semibold">
              {stubSizeMm}×{stubSizeMm}
            </div>
            <p className="mt-2 text-gray-600">STUB {stubSizeMm}x{stubSizeMm} mm</p>
          </div>

          <div>
            <p className="font-bold mb-3">NAPOMENE:</p>
            <ul className="space-y-1.5 text-gray-700 text-[13px] leading-snug">
              <li>• Sve mere su u centimetrima (cm).</li>
              <li>• Dimenzije su date po središnjim osama stubova.</li>
              <li>• Ukupna širina konstrukcije (spojne ivice) = {outerWidthCm} cm</li>
              <li>• Ukupna dužina konstrukcije (spojne ivice) = {outerLengthCm} cm</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function parseStubSizeMm(stubTip) {
  if (!stubTip || typeof stubTip !== 'string') return 100
  const match = stubTip.match(/(\d+)/)
  return match ? Number(match[1]) : 100
}

function formatMeters(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return Number.isInteger(n) ? String(n) : String(n)
}
