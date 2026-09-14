/**
 * Minimalni DXF (R12) — 2D polilinija / pravougaonik u mm.
 */

function fmt(n) {
  return Number(n).toFixed(4)
}

function dxfHeader() {
  return `0
SECTION
2
HEADER
9
$INSUNITS
70
4
9
$MEASUREMENT
70
1
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
1
0
LAYER
2
0
70
0
62
7
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
`
}

function dxfFooter() {
  return `0
ENDSEC
0
EOF
`
}

/** LWPOLYLINE zatvoreni pravougaonik 0,0 → length × width */
export function rectangleToDxf({ length, width, layer = '0' }) {
  const pts = [
    [0, 0],
    [length, 0],
    [length, width],
    [0, width],
  ]

  let body = `0
LWPOLYLINE
8
${layer}
90
4
70
1
`
  pts.forEach(([x, y]) => {
    body += `10
${fmt(x)}
20
${fmt(y)}
`
  })

  return dxfHeader() + body + dxfFooter()
}

/** Poligon u svetskim mm koordinatama (oblik člana u sklopu) */
export function polygonToDxf(points, layer = '0') {
  if (!points?.length) return rectangleToDxf({ length: 0, width: 0, layer })

  let body = `0
LWPOLYLINE
8
${layer}
90
${points.length}
70
1
`
  points.forEach((p) => {
    body += `10
${fmt(p.x)}
20
${fmt(p.y)}
`
  })

  return dxfHeader() + body + dxfFooter()
}

export function downloadDxf(filename, dxfText) {
  const blob = new Blob([dxfText], { type: 'image/vnd.dxf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.dxf') ? filename : `${filename}.dxf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function safeFilename(name) {
  return String(name || 'element')
    .replace(/[^\w.\-]+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 80)
}
