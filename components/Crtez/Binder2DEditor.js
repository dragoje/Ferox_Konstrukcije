'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  generateBinderMembers,
  heightFromPitch,
  memberLocalOutline,
  memberLocalRectangle,
  memberOutlinePoints,
  pitchFromHeight,
  rebuildMovableMember,
  stationRange,
} from '@/lib/binderGeometry2d'
import {
  formatProfileLabel,
  getInPlaneWidth,
  parseProfileTip,
  profileKey,
  profileSelectOptions,
} from '@/lib/profiles'
import {
  downloadDxf,
  polygonToDxf,
  rectangleToDxf,
  safeFilename,
} from '@/lib/dxfExport'
import {
  downloadMemberPdf,
  downloadProfileGroupPdf,
} from '@/lib/pdfExport'

const PROFILE_OPTIONS = profileSelectOptions()

const ROLE_LABEL = {
  'donji-pojas': 'Donji pojas',
  'gornji-pojas': 'Gornji pojas',
  'gornji-pojas-L': 'Gornji pojas L',
  'gornji-pojas-D': 'Gornji pojas D',
  'stub-visoki': 'Visoki stub',
  vertikala: 'Vertikala',
  dijagonala: 'Dijagonala',
  rucno: 'Član',
}

const COLORS = {
  main: '#3d5a66',
  fill: '#6a858f',
  selected: '#c45c26',
  grid: '#e4e0d8',
  draft: '#2563eb',
  handle: '#e8a317',
}

function snap(value, step) {
  return Math.round(value / step) * step
}

function worldToSvg(x, y, view) {
  return {
    x: (x - view.originX) * view.scale + view.pad + view.panX,
    y: -(y - view.originY) * view.scale + view.pad + view.panY,
  }
}

function svgToWorld(sx, sy, view) {
  return {
    x: (sx - view.pad - view.panX) / view.scale + view.originX,
    y: -((sy - view.pad - view.panY) / view.scale) + view.originY,
  }
}

function pointsToSvgPath(points, view) {
  return (
    points
      .map((p, i) => {
        const s = worldToSvg(p.x, p.y, view)
        return `${i === 0 ? 'M' : 'L'}${s.x.toFixed(2)},${s.y.toFixed(2)}`
      })
      .join(' ') + ' Z'
  )
}

function boundsOfMembers(members) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  members.forEach((m) => {
    memberOutlinePoints(m).forEach((p) => {
      minX = Math.min(minX, p.x)
      maxX = Math.max(maxX, p.x)
      minY = Math.min(minY, p.y)
      maxY = Math.max(maxY, p.y)
    })
  })
  if (!Number.isFinite(minX)) {
    return { minX: -4000, maxX: 4000, minY: -200, maxY: 2000 }
  }
    const mx = (maxX - minX) * 0.03 || 100
    const my = (maxY - minY) * 0.06 || 100
  return {
    minX: minX - mx,
    maxX: maxX + mx,
    minY: minY - my,
    maxY: maxY + my,
  }
}

export default function Binder2DEditor() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const adminParam = searchParams.get('admin')
    if (adminParam === 'dzoni') {
      setIsAdmin(true)
      localStorage.setItem('kalkulator_admin', 'true')
    } else {
      setIsAdmin(localStorage.getItem('kalkulator_admin') === 'true')
    }
    setIsLoaded(true)
  }, [searchParams])

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, isLoaded, router])

  const svgWrapRef = useRef(null)
  const [size, setSize] = useState({ w: 900, h: 560 })

  const [widthM, setWidthM] = useState(8)
  const [padKrova, setPadKrova] = useState(2)
  const [pitchDeg, setPitchDeg] = useState(10)
  const [heightMm, setHeightMm] = useState(() =>
    Math.round(heightFromPitch(8000, 2, 10)),
  )
  const [verticalCount, setVerticalCount] = useState(5)
  const [mainProfile, setMainProfile] = useState(profileKey('80x60', '2.8mm'))
  const [fillProfile, setFillProfile] = useState(profileKey('40x40', '2.8mm'))

  const [members, setMembers] = useState([])
  const [frame, setFrame] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [tool, setTool] = useState('select')
  const [draftStart, setDraftStart] = useState(null)
  const [cursorWorld, setCursorWorld] = useState(null)
  const [snapMm, setSnapMm] = useState(10)
  const [showCenterline, setShowCenterline] = useState(false)
  const [drawProfile, setDrawProfile] = useState(profileKey('40x40', '2.8mm'))
  const [exportMode, setExportMode] = useState('outline') // outline | rect — važi za DXF i PDF


  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [fitTick, setFitTick] = useState(0)
  const panDrag = useRef(null)
  const handleDrag = useRef(null)

  useEffect(() => {
    const el = svgWrapRef.current
    if (!el) return undefined
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect
      if (r) setSize({ w: r.width, h: r.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const parseKey = (key) => {
    const [tip, debljina] = key.split('|')
    return { tip, debljina }
  }

  const syncHeightFromPitch = (nextPitch, nextWidth = widthM, nextPad = padKrova) => {
    const h = heightFromPitch(nextWidth * 1000, nextPad, nextPitch)
    setPitchDeg(nextPitch)
    setHeightMm(Math.round(h))
  }

  const syncPitchFromHeight = (nextHeight, nextWidth = widthM, nextPad = padKrova) => {
    const p = pitchFromHeight(nextWidth * 1000, nextPad, nextHeight)
    setHeightMm(nextHeight)
    setPitchDeg(Math.round(p * 10) / 10)
  }

  const regenerate = useCallback(() => {
    const main = parseKey(mainProfile)
    const fill = parseKey(fillProfile)
    const { members: next, frame: fr } = generateBinderMembers({
      widthM,
      padKrova,
      heightMm,
      pitchDeg,
      verticalCount,
      mainTip: main.tip,
      mainDebljina: main.debljina,
      fillTip: fill.tip,
      fillDebljina: fill.debljina,
    })
    setMembers(next)
    setFrame(fr)
    setSelectedId(null)
    setDraftStart(null)
    setPan({ x: 0, y: 0 })
    setZoom(1)
    setFitTick((t) => t + 1)
  }, [widthM, padKrova, heightMm, pitchDeg, verticalCount, mainProfile, fillProfile])

  useEffect(() => {
    regenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const baseBounds = useMemo(() => boundsOfMembers(members), [members, fitTick])

  const fitScale = useMemo(() => {
    const pad = 48
    const worldW = Math.max(baseBounds.maxX - baseBounds.minX, 1)
    const worldH = Math.max(baseBounds.maxY - baseBounds.minY, 1)
    const availW = Math.max(size.w - pad * 2, 100)
    const availH = Math.max(size.h - pad * 2, 100)
    return Math.min(availW / worldW, availH / worldH)
  }, [baseBounds, size])

  const view = useMemo(() => {
    const pad = 48
    return {
      pad,
      scale: fitScale * zoom,
      originX: baseBounds.minX,
      originY: baseBounds.maxY,
      panX: pan.x,
      panY: pan.y,
      minX: baseBounds.minX,
      maxX: baseBounds.maxX,
      minY: baseBounds.minY,
      maxY: baseBounds.maxY,
    }
  }, [baseBounds, fitScale, zoom, pan])

  const selected = members.find((m) => m.id === selectedId) || null

  const profileGroups = useMemo(() => {
    const map = new Map()
    members.forEach((m) => {
      const key = profileKey(m.tip, m.debljina)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(m)
    })
    return [...map.entries()].map(([key, list]) => ({
      key,
      label: formatProfileLabel(...key.split('|')),
      count: list.length,
      members: list,
    }))
  }, [members])

  const getEventWorld = (e, doSnap = true) => {
    const svg = e.currentTarget.ownerSVGElement || e.currentTarget
    const rect = svg.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const w = svgToWorld(sx, sy, view)
    return {
      x: doSnap ? snap(w.x, snapMm) : w.x,
      y: doSnap ? snap(w.y, snapMm) : w.y,
      sx,
      sy,
    }
  }

  const zoomAt = useCallback(
    (sx, sy, factor) => {
      const currentScale = fitScale * zoom
      const before = svgToWorld(sx, sy, {
        pad: view.pad,
        scale: currentScale,
        originX: view.originX,
        originY: view.originY,
        panX: pan.x,
        panY: pan.y,
      })
      const nextZoom = Math.min(12, Math.max(0.15, zoom * factor))
      const nextScale = fitScale * nextZoom
      const nextPanX = sx - view.pad - (before.x - view.originX) * nextScale
      const nextPanY = sy - view.pad + (before.y - view.originY) * nextScale
      setZoom(nextZoom)
      setPan({ x: nextPanX, y: nextPanY })
    },
    [view, fitScale, zoom, pan],
  )

  useEffect(() => {
    const el = svgWrapRef.current
    if (!el) return undefined
    const onWheel = (e) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const factor = e.deltaY > 0 ? 0.9 : 1.1
      zoomAt(sx, sy, factor)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  const moveDiagonalEnd = (id, end, worldX) => {
    if (!frame) return
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id || m.kind !== 'diagonal') return m
        const half = getInPlaneWidth(m.tip, m.displayDim || 'a') / 2
        const { xMin, xMax } = stationRange(frame, half)
        const x = Math.min(Math.max(snap(worldX, snapMm), xMin), xMax)
        const next = {
          ...m,
          bottomX: end === 'bottom' ? x : m.bottomX ?? m.stationX,
          topX: end === 'top' ? x : m.topX,
          stationX: end === 'bottom' ? x : m.bottomX ?? m.stationX,
        }
        return rebuildMovableMember(next, frame)
      }),
    )
  }

  const onSvgPointerDown = (e) => {
    if (tool === 'pan' || e.button === 1 || (e.button === 0 && e.altKey)) {
      panDrag.current = { x: e.clientX, y: e.clientY, pan }
      e.currentTarget.setPointerCapture?.(e.pointerId)
      return
    }

    if (handleDrag.current) return

    if (tool === 'draw') {
      const p = getEventWorld(e)
      if (!draftStart) {
        setDraftStart({ x: p.x, y: p.y })
      } else {
        const { tip, debljina } = parseKey(drawProfile)
        const length = Math.hypot(p.x - draftStart.x, p.y - draftStart.y)
        if (length >= 1) {
          const m = {
            id: `rucno-${Math.random().toString(36).slice(2, 9)}`,
            x1: draftStart.x,
            y1: draftStart.y,
            x2: p.x,
            y2: p.y,
            tip,
            debljina,
            role: 'rucno',
            displayDim: 'a',
            length,
          }
          setMembers((prev) => [...prev, m])
          setSelectedId(m.id)
        }
        setDraftStart(null)
      }
      return
    }

    if (tool === 'select' && e.target === e.currentTarget) {
      setSelectedId(null)
    }
  }

  const onSvgPointerMove = (e) => {
    if (handleDrag.current) {
      const p = getEventWorld(e, false)
      moveDiagonalEnd(handleDrag.current.id, handleDrag.current.end, p.x)
      setCursorWorld({ x: snap(p.x, snapMm), y: snap(p.y, snapMm) })
      return
    }

    if (panDrag.current) {
      const dx = e.clientX - panDrag.current.x
      const dy = e.clientY - panDrag.current.y
      setPan({
        x: panDrag.current.pan.x + dx,
        y: panDrag.current.pan.y + dy,
      })
      return
    }
    const p = getEventWorld(e)
    setCursorWorld({ x: p.x, y: p.y })
  }

  const onSvgPointerUp = (e) => {
    if (handleDrag.current) {
      handleDrag.current = null
      e.currentTarget.releasePointerCapture?.(e.pointerId)
    }
    if (panDrag.current) {
      panDrag.current = null
      e.currentTarget.releasePointerCapture?.(e.pointerId)
    }
  }

  const updateSelected = (patch) => {
    if (!selectedId || !frame) return
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== selectedId) return m
        const next = { ...m, ...patch }
        if (next.movable) return rebuildMovableMember(next, frame)
        next.length = Math.hypot(next.x2 - next.x1, next.y2 - next.y1)
        return next
      }),
    )
  }

  const deleteSelected = () => {
    if (!selectedId) return
    setMembers((prev) => prev.filter((m) => m.id !== selectedId))
    setSelectedId(null)
  }

  const exportMemberDxf = (member) => {
    const label = formatProfileLabel(member.tip, member.debljina)
    const name = safeFilename(
      `${ROLE_LABEL[member.role] || member.role}_${label}_${Math.round(member.length)}mm`,
    )
    if (exportMode === 'outline') {
      downloadDxf(name, polygonToDxf(memberLocalOutline(member)))
    } else {
      const { length, width } = memberLocalRectangle(member)
      downloadDxf(name, rectangleToDxf({ length, width }))
    }
  }

  const exportMemberPdf = (member) => {
    downloadMemberPdf(member, { mode: exportMode })
  }

  const exportProfileGroupDxf = (group) => {
    group.members.forEach((m, i) => {
      const name = safeFilename(
        `${group.label}_${i + 1}_${Math.round(m.length)}mm`,
      )
      const text =
        exportMode === 'outline'
          ? polygonToDxf(memberLocalOutline(m))
          : rectangleToDxf(memberLocalRectangle(m))
      setTimeout(() => downloadDxf(name, text), i * 120)
    })
  }

  const exportProfileGroupPdf = (group) => {
    downloadProfileGroupPdf(group, { mode: exportMode })
  }

  const applyProfileToSelected = (key) => {
    const { tip, debljina } = parseKey(key)
    updateSelected({ tip, debljina })
  }

  const dims = selected ? parseProfileTip(selected.tip) : null
  const isFrameRole = (role) =>
    role?.includes('pojas') || role === 'stub-visoki'

  const fitView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setFitTick((t) => t + 1)
  }

  if (!isLoaded || !isAdmin) {
    return null
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-8rem)]">
      <aside className="w-full lg:w-80 shrink-0 space-y-4">
        <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-stone-800 uppercase tracking-wide">
            Generiši binder
          </h2>
          <label className="block text-sm text-stone-600">
            Širina (m)
            <input
              type="number"
              min={3}
              max={20}
              step={0.5}
              value={widthM}
              onChange={(e) => {
                const w = parseFloat(e.target.value) || 8
                setWidthM(w)
                syncHeightFromPitch(pitchDeg, w, padKrova)
              }}
              className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block text-sm text-stone-600">
            Tip
            <select
              value={padKrova}
              onChange={(e) => {
                const p = parseInt(e.target.value, 10)
                setPadKrova(p)
                syncHeightFromPitch(pitchDeg, widthM, p)
              }}
              className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
            >
              <option value={1}>Jedna voda</option>
              <option value={2}>Dve vode</option>
            </select>
          </label>
          <label className="block text-sm text-stone-600">
            Pad (°)
            <input
              type="number"
              min={1}
              max={45}
              step={0.5}
              value={pitchDeg}
              onChange={(e) =>
                syncHeightFromPitch(parseFloat(e.target.value) || 10)
              }
              className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block text-sm text-stone-600">
            Visina bindera (mm)
            <input
              type="number"
              min={100}
              max={5000}
              step={10}
              value={heightMm}
              onChange={(e) =>
                syncPitchFromHeight(parseFloat(e.target.value) || 100)
              }
              className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block text-sm text-stone-600">
            Broj unutrašnjih vertikala
            <input
              type="number"
              min={0}
              max={24}
              value={verticalCount}
              onChange={(e) =>
                setVerticalCount(parseInt(e.target.value, 10) || 0)
              }
              className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block text-sm text-stone-600">
            Glavni ram
            <select
              value={mainProfile}
              onChange={(e) => setMainProfile(e.target.value)}
              className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
            >
              {PROFILE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-stone-600">
            Unutrašnji profili
            <select
              value={fillProfile}
              onChange={(e) => setFillProfile(e.target.value)}
              className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
            >
              {PROFILE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={regenerate}
            className="w-full bg-stone-900 text-white text-sm font-medium py-2 rounded-md hover:bg-stone-800"
          >
            Generiši / resetuj
          </button>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-stone-800 uppercase tracking-wide">
            Alati
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              ['select', 'Izaberi'],
              ['draw', 'Crtaj'],
              ['pan', 'Pomeri'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTool(id)
                  setDraftStart(null)
                }}
                className={`px-3 py-1.5 text-sm rounded-md border ${
                  tool === id
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() => zoomAt(size.w / 2, size.h / 2, 1.2)}
              className="px-2.5 py-1.5 text-sm border border-stone-300 rounded-md hover:bg-stone-50"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => zoomAt(size.w / 2, size.h / 2, 1 / 1.2)}
              className="px-2.5 py-1.5 text-sm border border-stone-300 rounded-md hover:bg-stone-50"
            >
              −
            </button>
            <button
              type="button"
              onClick={fitView}
              className="px-2.5 py-1.5 text-sm border border-stone-300 rounded-md hover:bg-stone-50"
            >
              Uklopi
            </button>
            <span className="text-xs text-stone-500 font-mono">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          {tool === 'draw' && (
            <label className="block text-sm text-stone-600">
              Profil za crtanje
              <select
                value={drawProfile}
                onChange={(e) => setDrawProfile(e.target.value)}
                className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              >
                {PROFILE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block text-sm text-stone-600">
            Snap (mm)
            <select
              value={snapMm}
              onChange={(e) => setSnapMm(parseInt(e.target.value, 10))}
              className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
            >
              {[1, 2, 5, 10, 25, 50, 100].map((v) => (
                <option key={v} value={v}>
                  {v} mm
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={showCenterline}
              onChange={(e) => setShowCenterline(e.target.checked)}
            />
            Prikaži centralnu liniju
          </label>
          <label className="block text-sm text-stone-600">
            DXF / PDF oblik
            <select
              value={exportMode}
              onChange={(e) => setExportMode(e.target.value)}
              className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="outline">Sa isečenim krajevima (2D outline)</option>
              <option value="rect">Pravougaonik dužina × širina</option>
            </select>
          </label>
        </div>

        {selected && (
          <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-3">
            <h2 className="text-sm font-semibold text-stone-800 uppercase tracking-wide">
              Izabrani element
            </h2>
            <p className="text-sm text-stone-700">
              {ROLE_LABEL[selected.role] || selected.role}
            </p>
            <p className="text-xs text-stone-500 font-mono">
              L ≈ {selected.length.toFixed(1)} mm · širina ={' '}
              {getInPlaneWidth(selected.tip, selected.displayDim || 'a')} mm
            </p>
            {selected.kind === 'diagonal' && (
              <>
                <label className="block text-sm text-stone-600">
                  Donja veza X (mm)
                  <input
                    type="number"
                    step={snapMm}
                    value={Math.round(selected.bottomX ?? selected.stationX)}
                    onChange={(e) =>
                      moveDiagonalEnd(
                        selected.id,
                        'bottom',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="block text-sm text-stone-600">
                  Gornja veza X (mm)
                  <input
                    type="number"
                    step={snapMm}
                    value={Math.round(selected.topX ?? 0)}
                    onChange={(e) =>
                      moveDiagonalEnd(
                        selected.id,
                        'top',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
                  />
                  <span className="text-xs text-stone-400">
                    Prevuci žute ručice na donjem i gornjem kraju
                  </span>
                </label>
              </>
            )}
            {selected.kind === 'vertical' && (
              <p className="text-xs text-stone-500">
                Vertikale su fiksne — pomeraju se samo dijagonale.
              </p>
            )}
            <label className="block text-sm text-stone-600">
              Profil
              <select
                value={profileKey(selected.tip, selected.debljina)}
                onChange={(e) => applyProfileToSelected(e.target.value)}
                className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              >
                {PROFILE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            {dims && dims.a !== dims.b && !selected.movable && (
              <label className="block text-sm text-stone-600">
                Dimenzija u ravni
                <select
                  value={selected.displayDim || 'a'}
                  onChange={(e) => updateSelected({ displayDim: e.target.value })}
                  className="mt-1 w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
                >
                  <option value="a">{dims.a} mm</option>
                  <option value="b">{dims.b} mm</option>
                </select>
              </label>
            )}
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => exportMemberDxf(selected)}
                className="flex-1 min-w-[7rem] bg-amber-700 text-white text-sm font-medium py-2 rounded-md hover:bg-amber-800"
              >
                Export DXF
              </button>
              <button
                type="button"
                onClick={() => exportMemberPdf(selected)}
                className="flex-1 min-w-[7rem] bg-stone-800 text-white text-sm font-medium py-2 rounded-md hover:bg-stone-900"
              >
                Export PDF
              </button>
              {!isFrameRole(selected.role) && (
                <button
                  type="button"
                  onClick={deleteSelected}
                  className="px-3 py-2 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  Obriši
                </button>
              )}
            </div>
          </div>
        )}

        <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-2">
          <h2 className="text-sm font-semibold text-stone-800 uppercase tracking-wide">
            Profili u sklopu
          </h2>
          {profileGroups.map((g) => (
            <div
              key={g.key}
              className="flex items-center justify-between gap-2 py-1.5 border-b border-stone-100 last:border-0"
            >
              <div>
                <div className="text-sm text-stone-800">{g.label}</div>
                <div className="text-xs text-stone-500">{g.count} kom</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => exportProfileGroupDxf(g)}
                  className="text-xs px-2 py-1 rounded border border-stone-300 hover:bg-stone-50"
                >
                  DXF
                </button>
                <button
                  type="button"
                  onClick={() => exportProfileGroupPdf(g)}
                  className="text-xs px-2 py-1 rounded border border-stone-300 hover:bg-stone-50"
                >
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <h1 className="text-lg font-semibold text-stone-900">2D binder editor</h1>
          <p className="text-xs text-stone-500">
            Scroll = zum · Alt+prevuci = pan · žute ručice na dijagonali = donja i
            gornja veza
          </p>
        </div>
        <div
          ref={svgWrapRef}
          className="flex-1 min-h-[420px] rounded-lg border border-stone-300 bg-[#f3f1ec] overflow-hidden relative"
        >
          <svg
            width="100%"
            height="100%"
            className={
              tool === 'draw'
                ? 'cursor-crosshair'
                : tool === 'pan'
                  ? 'cursor-grab active:cursor-grabbing'
                  : 'cursor-default'
            }
            onPointerDown={onSvgPointerDown}
            onPointerMove={onSvgPointerMove}
            onPointerUp={onSvgPointerUp}
            onPointerLeave={() => {
              if (!handleDrag.current) setCursorWorld(null)
            }}
          >
            {(() => {
              // Grid ≈ veličina bindera, malo veći da se ne izgubi
              const padG = Math.max(
                (baseBounds.maxX - baseBounds.minX) * 0.02,
                50,
              )
              const gMinX = baseBounds.minX - padG
              const gMaxX = baseBounds.maxX + padG
              const gMinY = Math.min(baseBounds.minY, -20) - padG * 0.5
              const gMaxY = baseBounds.maxY + padG
              const step = snapMm
              const lines = []
              const x0 = Math.floor(gMinX / step) * step
              const y0 = Math.floor(gMinY / step) * step
              const majorEvery = step <= 5 ? 50 : step <= 10 ? 100 : step * 5
              for (let x = x0; x <= gMaxX + 0.01; x += step) {
                const a = worldToSvg(x, gMinY, view)
                const b = worldToSvg(x, gMaxY, view)
                const major = Math.abs(x % majorEvery) < 0.01 || Math.abs(x % majorEvery - majorEvery) < 0.01
                lines.push(
                  <line
                    key={`vx-${x}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={major ? '#d0cbc2' : COLORS.grid}
                    strokeWidth={major ? 1.25 : 0.7}
                  />,
                )
              }
              for (let y = y0; y <= gMaxY + 0.01; y += step) {
                const a = worldToSvg(gMinX, y, view)
                const b = worldToSvg(gMaxX, y, view)
                const major = Math.abs(y % majorEvery) < 0.01 || Math.abs(y % majorEvery - majorEvery) < 0.01
                lines.push(
                  <line
                    key={`hy-${y}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={major ? '#d0cbc2' : COLORS.grid}
                    strokeWidth={major ? 1.25 : 0.7}
                  />,
                )
              }
              return lines
            })()}

            {members.map((m) => {
              const outline = memberOutlinePoints(m)
              const d = pointsToSvgPath(outline, view)
              const isSel = m.id === selectedId
              const isMain = isFrameRole(m.role)
              const fill = isSel ? COLORS.selected : isMain ? COLORS.main : COLORS.fill
              const c1 = worldToSvg(m.x1, m.y1, view)
              const c2 = worldToSvg(m.x2, m.y2, view)
              const showHandles = m.kind === 'diagonal' && tool === 'select'
              const bottomHandle = showHandles
                ? worldToSvg(
                    m.bottomX ?? m.stationX,
                    frame?.cavityBottom || m.y1,
                    view,
                  )
                : null
              const topHandle = showHandles
                ? worldToSvg(m.topX, m.y2, view)
                : null

              return (
                <g key={m.id}>
                  <path
                    d={d}
                    fill={fill}
                    fillOpacity={isSel ? 0.92 : isMain ? 0.88 : 0.75}
                    stroke={isSel ? '#8a3a12' : '#2a3a40'}
                    strokeWidth={isSel ? 1.6 : 0.9}
                    pointerEvents={tool === 'select' ? 'auto' : 'none'}
                    style={{ cursor: tool === 'select' ? 'pointer' : undefined }}
                    onClick={(e) => {
                      if (tool !== 'select') return
                      e.stopPropagation()
                      setSelectedId(m.id)
                    }}
                  />
                  {showCenterline && (
                    <line
                      x1={c1.x}
                      y1={c1.y}
                      x2={c2.x}
                      y2={c2.y}
                      stroke="#fff"
                      strokeOpacity={0.55}
                      strokeWidth={1}
                      strokeDasharray="4 3"
                      pointerEvents="none"
                    />
                  )}
                  {bottomHandle && (
                    <circle
                      cx={bottomHandle.x}
                      cy={bottomHandle.y}
                      r={isSel ? 7 : 5}
                      fill={COLORS.handle}
                      stroke="#5c4208"
                      strokeWidth={1.2}
                      style={{ cursor: 'ew-resize' }}
                      onPointerDown={(e) => {
                        e.stopPropagation()
                        setSelectedId(m.id)
                        handleDrag.current = { id: m.id, end: 'bottom' }
                        e.currentTarget.setPointerCapture?.(e.pointerId)
                      }}
                    />
                  )}
                  {topHandle && (
                    <circle
                      cx={topHandle.x}
                      cy={topHandle.y}
                      r={isSel ? 7 : 5}
                      fill={COLORS.handle}
                      stroke="#5c4208"
                      strokeWidth={1.2}
                      style={{ cursor: 'ew-resize' }}
                      onPointerDown={(e) => {
                        e.stopPropagation()
                        setSelectedId(m.id)
                        handleDrag.current = { id: m.id, end: 'top' }
                        e.currentTarget.setPointerCapture?.(e.pointerId)
                      }}
                    />
                  )}
                </g>
              )
            })}

            {tool === 'draw' && draftStart && cursorWorld && (
              <line
                x1={worldToSvg(draftStart.x, draftStart.y, view).x}
                y1={worldToSvg(draftStart.x, draftStart.y, view).y}
                x2={worldToSvg(cursorWorld.x, cursorWorld.y, view).x}
                y2={worldToSvg(cursorWorld.x, cursorWorld.y, view).y}
                stroke={COLORS.draft}
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            )}
          </svg>

          {cursorWorld && (
            <div className="absolute bottom-2 right-2 text-[11px] font-mono bg-white/90 border border-stone-200 rounded px-2 py-1 text-stone-600">
              X {cursorWorld.x.toFixed(0)} · Y {cursorWorld.y.toFixed(0)} mm
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-stone-500">
          Ram: cevi jedna na drugoj do kraja (90° rez). Usecanje samo na unutrašnjim
          vertikala i dijagonalama. Pomeraju se samo dijagonale (oba kraja).
        </p>
      </div>
    </div>
  )
}
