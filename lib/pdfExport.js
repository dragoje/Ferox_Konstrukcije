import jsPDF from 'jspdf'
import { memberLocalOutline, memberLocalRectangle } from './binderGeometry2d'
import { formatProfileLabel } from './profiles'
import { safeFilename } from './dxfExport'

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

function memberPoints(member, mode) {
  if (mode === 'rect') {
    const { length, width } = memberLocalRectangle(member)
    return [
      { x: 0, y: 0 },
      { x: length, y: 0 },
      { x: length, y: width },
      { x: 0, y: width },
    ]
  }
  return memberLocalOutline(member)
}

function drawMemberOnPage(doc, member, mode, meta) {
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14

  const role = ROLE_LABEL[member.role] || member.role
  const label = formatProfileLabel(member.tip, member.debljina)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('FEROX — komad za sečenje', margin, margin + 4)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`${role} · ${label}`, margin, margin + 11)
  doc.text(
    `Dužina ≈ ${member.length.toFixed(1)} mm · ${meta.indexLabel || ''}`,
    margin,
    margin + 17,
  )

  const pts = memberPoints(member, mode)
  const minX = Math.min(...pts.map((p) => p.x))
  const maxX = Math.max(...pts.map((p) => p.x))
  const minY = Math.min(...pts.map((p) => p.y))
  const maxY = Math.max(...pts.map((p) => p.y))
  const worldW = Math.max(maxX - minX, 1)
  const worldH = Math.max(maxY - minY, 1)

  const boxTop = margin + 24
  const boxBottom = pageH - margin - 10
  const boxLeft = margin
  const boxRight = pageW - margin
  const boxW = boxRight - boxLeft
  const boxH = boxBottom - boxTop

  // mm u PDF (jsPDF default unit je mm)
  const scale = Math.min(boxW / worldW, boxH / worldH) * 0.88
  const drawW = worldW * scale
  const drawH = worldH * scale
  const ox = boxLeft + (boxW - drawW) / 2
  const oy = boxTop + (boxH - drawH) / 2

  doc.setDrawColor(180)
  doc.setLineWidth(0.2)
  doc.rect(boxLeft, boxTop, boxW, boxH)

  const toPage = (p) => ({
    x: ox + (p.x - minX) * scale,
    // PDF Y raste nadole — obrni
    y: oy + drawH - (p.y - minY) * scale,
  })

  doc.setDrawColor(30)
  doc.setFillColor(220, 228, 232)
  doc.setLineWidth(0.4)

  const pagePts = pts.map(toPage)
  for (let i = 0; i < pagePts.length; i++) {
    const a = pagePts[i]
    const b = pagePts[(i + 1) % pagePts.length]
    doc.line(a.x, a.y, b.x, b.y)
  }

  // Kotiranje obuhvata
  doc.setFontSize(8)
  doc.setTextColor(80)
  doc.text(
    `${worldW.toFixed(0)} × ${worldH.toFixed(0)} mm (obuhvat)`,
    margin,
    pageH - margin,
  )
  doc.setTextColor(0)
}

/**
 * Jedan član → jedan PDF fajl
 */
export function downloadMemberPdf(member, { mode = 'outline', filename } = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const label = formatProfileLabel(member.tip, member.debljina)
  const name =
    filename ||
    safeFilename(
      `${ROLE_LABEL[member.role] || member.role}_${label}_${Math.round(member.length)}mm`,
    )

  drawMemberOnPage(doc, member, mode, {})
  doc.save(`${name}.pdf`)
}

/**
 * Grupa profila → jedan PDF, svaki komad na svojoj strani
 */
export function downloadProfileGroupPdf(group, { mode = 'outline' } = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  group.members.forEach((m, i) => {
    if (i > 0) doc.addPage()
    drawMemberOnPage(doc, m, mode, {
      indexLabel: `komad ${i + 1}/${group.members.length}`,
    })
  })
  const name = safeFilename(`${group.label}_${group.members.length}kom`)
  doc.save(`${name}.pdf`)
}
