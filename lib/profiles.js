/** Katalog čeličnih cevi za 2D binder editor */

export const COMMON_PROFILES = [
  { tip: '40x40', debljina: '2.8mm' },
  { tip: '40x40', debljina: '3.8mm' },
  { tip: '50x50', debljina: '2.8mm' },
  { tip: '50x50', debljina: '3.8mm' },
  { tip: '60x40', debljina: '2.8mm' },
  { tip: '80x40', debljina: '2.8mm' },
  { tip: '80x60', debljina: '2.8mm' },
  { tip: '80x60', debljina: '3.8mm' },
  { tip: '80x80', debljina: '2.8mm' },
  { tip: '80x80', debljina: '3.8mm' },
  { tip: '100x60', debljina: '2.8mm' },
  { tip: '100x80', debljina: '3.8mm' },
  { tip: '100x100', debljina: '2.8mm' },
  { tip: '100x100', debljina: '3.8mm' },
  { tip: '120x80', debljina: '3.8mm' },
  { tip: '120x120', debljina: '3.8mm' },
]

export function parseProfileTip(tip) {
  if (!tip || typeof tip !== 'string') return { a: 40, b: 40 }
  const parts = tip.toLowerCase().split('x').map((p) => parseFloat(p))
  const a = Number.isFinite(parts[0]) ? parts[0] : 40
  const b = Number.isFinite(parts[1]) ? parts[1] : a
  return { a, b }
}

export function profileKey(tip, debljina) {
  return `${tip}|${debljina || ''}`
}

export function formatProfileLabel(tip, debljina) {
  return debljina ? `${tip}×${debljina}` : tip
}

/** Širina profila u ravni crteža (mm) */
export function getInPlaneWidth(tip, displayDim = 'a') {
  const { a, b } = parseProfileTip(tip)
  return displayDim === 'b' ? b : a
}

export function profileSelectOptions() {
  return COMMON_PROFILES.map((p) => ({
    value: profileKey(p.tip, p.debljina),
    label: formatProfileLabel(p.tip, p.debljina),
    tip: p.tip,
    debljina: p.debljina,
  }))
}
