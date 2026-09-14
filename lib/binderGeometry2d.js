import { getInPlaneWidth } from './profiles'

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function heightFromPitch(widthMm, padKrova, pitchDeg) {
  const run = padKrova === 1 ? widthMm : widthMm / 2
  return run * Math.tan((pitchDeg * Math.PI) / 180)
}

export function pitchFromHeight(widthMm, padKrova, heightMm) {
  const run = padKrova === 1 ? widthMm : widthMm / 2
  if (run < 1e-6) return 0
  return (Math.atan(heightMm / run) * 180) / Math.PI
}

function dist(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y }
}

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y }
}

function mul(a, s) {
  return { x: a.x * s, y: a.y * s }
}

function unit(v) {
  const L = Math.hypot(v.x, v.y) || 1
  return { x: v.x / L, y: v.y / L }
}

function pointOnSegX(a, b, x) {
  if (Math.abs(b.x - a.x) < 1e-9) return null
  const t = (x - a.x) / (b.x - a.x)
  return { x, y: a.y + t * (b.y - a.y), t }
}

export function outerTopY(x, frame) {
  const { left, widthMm, heightMm, padKrova } = frame
  if (padKrova === 1) {
    return heightMm * ((x - left) / widthMm)
  }
  const half = widthMm / 2
  return heightMm * (1 - Math.abs(x) / half)
}

/** Donja ivica gornjeg pojasa (sedi na y=mainW na strehi, paralelno padu) */
export function innerTopY(x, frame) {
  const { left, right, heightMm, padKrova, mainW: t } = frame

  if (padKrova === 1) {
    const along = unit({ x: right - left, y: heightMm })
    const U0 = { x: left, y: t }
    const U1 = add(U0, mul(along, (right - left) / along.x))
    const p = pointOnSegX(U0, U1, x)
    return p ? p.y : t
  }

  if (x <= 0) {
    const along = unit({ x: 0 - left, y: heightMm })
    const U0 = { x: left, y: t }
    const U1 = add(U0, mul(along, (0 - left) / along.x))
    const p = pointOnSegX(U0, U1, x)
    return p ? p.y : t
  }

  const along = unit({ x: 0 - right, y: heightMm })
  const U0 = { x: right, y: t }
  const U1 = add(U0, mul(along, (0 - right) / along.x))
  const p = pointOnSegX(U0, U1, x)
  return p ? p.y : t
}

export function buildFrameContext({
  widthM,
  padKrova,
  heightMm,
  mainTip,
  mainDebljina,
  fillTip,
  fillDebljina,
  displayDimMain = 'a',
  displayDimFill = 'a',
}) {
  const widthMm = widthM * 1000
  const left = -widthMm / 2
  const right = widthMm / 2
  const mainW = getInPlaneWidth(mainTip, displayDimMain)
  const fillW = getInPlaneWidth(fillTip, displayDimFill)
  const pitchDeg = pitchFromHeight(widthMm, padKrova, heightMm)

  return {
    widthM,
    widthMm,
    left,
    right,
    padKrova,
    heightMm,
    pitchDeg,
    mainW,
    fillW,
    mainTip,
    mainDebljina,
    fillTip,
    fillDebljina,
    displayDimMain,
    displayDimFill,
    cavityBottom: mainW,
    cavityRight: padKrova === 1 ? right - mainW : right,
    cavityLeft: left,
  }
}

function makeBase(member) {
  const length =
    member.length ??
    dist({ x: member.x1, y: member.y1 }, { x: member.x2, y: member.y2 })
  return {
    id: member.id || uid(member.role || 'm'),
    displayDim: 'a',
    ...member,
    length,
  }
}

/**
 * Gornji pojas do kraja, 90° rezovi (normalno na osu),
 * sedi na donjem (underside y=t na strehi) — bez usecanja u donji pojas.
 */
function buildTopChordSquare(eaveX, ridgeX, H, t, role, main) {
  const along = unit({ x: ridgeX - eaveX, y: H })
  if (Math.abs(along.x) < 1e-9) return null

  const U0 = { x: eaveX, y: t }
  const U1 = add(U0, mul(along, (ridgeX - eaveX) / along.x))

  // Normal ⟂ osi; telo cevi ide „nagore“ od underside (dalje od šupljine)
  let nBody = { x: -along.y, y: along.x }
  const mid = { x: (U0.x + U1.x) / 2, y: (U0.y + U1.y) / 2 }
  const cavity = { x: (eaveX + ridgeX) / 2, y: t + 30 }
  if (nBody.x * (cavity.x - mid.x) + nBody.y * (cavity.y - mid.y) > 0) {
    nBody = { x: -nBody.x, y: -nBody.y }
  }

  const O0 = add(U0, mul(nBody, t))
  const O1 = add(U1, mul(nBody, t))

  return makeBase({
    ...main,
    role,
    x1: (U0.x + O0.x) / 2,
    y1: (U0.y + O0.y) / 2,
    x2: (U1.x + O1.x) / 2,
    y2: (U1.y + O1.y) / 2,
    outline: [U0, U1, O1, O0],
    length: dist(U0, U1),
  })
}

/** Ram — samo slaganje cevi, bez usecanja međusobno */
export function buildFrameMembers(frame) {
  const {
    left,
    right,
    heightMm: H,
    mainW: t,
    padKrova,
    mainTip,
    mainDebljina,
  } = frame
  const main = { tip: mainTip, debljina: mainDebljina, isFrame: true }
  const members = []

  members.push(
    makeBase({
      ...main,
      role: 'donji-pojas',
      x1: left,
      y1: t / 2,
      x2: right,
      y2: t / 2,
      outline: [
        { x: left, y: 0 },
        { x: right, y: 0 },
        { x: right, y: t },
        { x: left, y: t },
      ],
      length: right - left,
    }),
  )

  if (padKrova === 1) {
    const top = buildTopChordSquare(left, right, H, t, 'gornji-pojas', main)
    const stubTop = innerTopY(right - t / 2, frame)
    const vx0 = right - t
    members.push(
      makeBase({
        ...main,
        role: 'stub-visoki',
        x1: right - t / 2,
        y1: t,
        x2: right - t / 2,
        y2: stubTop,
        outline: [
          { x: vx0, y: t },
          { x: right, y: t },
          { x: right, y: stubTop },
          { x: vx0, y: stubTop },
        ],
        length: Math.max(stubTop - t, 1),
      }),
    )
    if (top) members.push(top)
  } else {
    const L = buildTopChordSquare(left, 0, H, t, 'gornji-pojas-L', main)
    const R = buildTopChordSquare(right, 0, H, t, 'gornji-pojas-D', main)
    if (L) members.push(L)
    if (R) members.push(R)
  }

  return members
}

export function defaultVerticalStations(frame, count) {
  const { left, right, padKrova, mainW, cavityRight } = frame
  const xMin = left + mainW * 0.5
  const xMax = (padKrova === 1 ? cavityRight : right) - mainW * 0.5
  if (count <= 0) return []
  if (count === 1) return [(xMin + xMax) / 2]

  const xs = []
  for (let i = 1; i <= count; i++) {
    xs.push(xMin + (i / (count + 1)) * (xMax - xMin))
  }
  return xs
}

/** Vertikala — fiksna, krajevi isečeni na ram */
export function buildVerticalMember(frame, stationX, tip, debljina, id) {
  const w = getInPlaneWidth(tip, 'a')
  const half = w / 2
  const { cavityBottom: y0, cavityLeft, cavityRight, padKrova, right } = frame

  const xMin = cavityLeft + half + 0.5
  const xMax = (padKrova === 1 ? cavityRight : right - 0.5) - half
  const x = Math.min(Math.max(stationX, xMin), xMax)

  const xL = x - half
  const xR = x + half
  let yL = Math.max(innerTopY(xL, frame), y0 + 1)
  let yR = Math.max(innerTopY(xR, frame), y0 + 1)

  const outline = [
    { x: xL, y: y0 },
    { x: xR, y: y0 },
    { x: xR, y: yR },
    { x: xL, y: yL },
  ]

  return makeBase({
    id: id || uid('vertikala'),
    tip,
    debljina,
    role: 'vertikala',
    kind: 'vertical',
    movable: false,
    stationX: x,
    x1: x,
    y1: y0,
    x2: x,
    y2: (yL + yR) / 2,
    outline,
    length: Math.max((yL + yR) / 2 - y0, 1),
  })
}

function clampStation(frame, x, half) {
  const { left, right, padKrova, cavityRight, mainW } = frame
  const xMin = left + mainW + half
  const xMax = (padKrova === 1 ? cavityRight : right - mainW) - half
  return Math.min(Math.max(x, xMin), xMax)
}

function undersideSegment(frame, xHint) {
  const { left, right, heightMm, padKrova, mainW: t } = frame
  if (padKrova === 1) {
    const along = unit({ x: right - left, y: heightMm })
    const U0 = { x: left, y: t }
    return [U0, add(U0, mul(along, (right - left) / along.x))]
  }
  if (xHint <= 0) {
    const along = unit({ x: 0 - left, y: heightMm })
    const U0 = { x: left, y: t }
    return [U0, add(U0, mul(along, (0 - left) / along.x))]
  }
  const along = unit({ x: 0 - right, y: heightMm })
  const U0 = { x: right, y: t }
  return [U0, add(U0, mul(along, (0 - right) / along.x))]
}

/** Presek: P + s*dir  sa pravom A→B */
function intersectRayLine(P, dir, A, B) {
  const d2 = sub(B, A)
  const den = dir.x * d2.y - dir.y * d2.x
  if (Math.abs(den) < 1e-12) return null
  const s = ((A.x - P.x) * d2.y - (A.y - P.y) * d2.x) / den
  return add(P, mul(dir, s))
}

/**
 * Dijagonala — konstantna širina (paralelne duge ivice).
 * Donji kraj: kosi rez FLUSH na gornju ivicu donjeg pojasa (oba ugla na y = y0).
 * Gornji kraj: kosi rez na underside gornjeg pojasa.
 */
export function buildDiagonalMember(frame, bottomX, topX, tip, debljina, id) {
  const w = getInPlaneWidth(tip, 'a')
  const half = w / 2
  const { cavityBottom: y0 } = frame

  let bx = clampStation(frame, bottomX, half)
  let tx =
    topX != null
      ? clampStation(frame, topX, half)
      : clampStation(
          frame,
          bx + (frame.padKrova === 1 ? frame.widthMm * 0.1 : 200),
          half,
        )

  if (Math.abs(tx - bx) < half) {
    tx = clampStation(frame, bx + half * 4, half)
  }

  const topY = Math.max(innerTopY(tx, frame), y0 + 1)
  const c0 = { x: bx, y: y0 }
  const c1 = { x: tx, y: topY }
  const along = unit(sub(c1, c0))
  // Normala ⟂ osi — širina cevi
  const n = { x: -along.y, y: along.x }

  /**
   * Tačka na ivici offsetovanoj za ±half, na zadatom y (horizontalni rez).
   * P(s) = c0 + n*offset + s*along, traži se P.y = yCut
   */
  const pointOnEdgeAtY = (offset, yCut) => {
    // c0.y + n.y*offset + s*along.y = yCut
    const denom = along.y
    if (Math.abs(denom) < 1e-9) {
      return add(add(c0, mul(n, offset)), { x: 0, y: yCut - c0.y })
    }
    const s = (yCut - c0.y - n.y * offset) / denom
    return add(add(c0, mul(n, offset)), mul(along, s))
  }

  /**
   * Tačka na istoj ivici, na preseku sa underside linijom gornjeg pojasa.
   */
  const pointOnEdgeAtUnderside = (offset) => {
    const origin = add(c0, mul(n, offset))
    const [U0, U1] = undersideSegment(frame, (bx + tx) / 2)
    return (
      intersectRayLine(origin, along, U0, U1) ||
      add(origin, mul(along, dist(c0, c1)))
    )
  }

  // Donji kosi rez: oba ugla NA donjem pojasu (ista Y) → ivica paralelna donjoj cevi
  const bL = pointOnEdgeAtY(half, y0)
  const bR = pointOnEdgeAtY(-half, y0)
  // Gornji kosi rez: po gornjem pojasu
  const tL = pointOnEdgeAtUnderside(half)
  const tR = pointOnEdgeAtUnderside(-half)

  const cLen = (dist(bL, tL) + dist(bR, tR)) / 2

  return makeBase({
    id: id || uid('dijagonala'),
    tip,
    debljina,
    role: 'dijagonala',
    kind: 'diagonal',
    movable: true,
    stationX: bx,
    bottomX: bx,
    topX: tx,
    x1: c0.x,
    y1: c0.y,
    x2: c1.x,
    y2: c1.y,
    outline: [bL, bR, tR, tL],
    length: Math.max(cLen, 1),
  })
}

export function rebuildMovableMember(member, frame) {
  if (member.kind === 'diagonal') {
    return buildDiagonalMember(
      frame,
      member.bottomX ?? member.stationX,
      member.topX,
      member.tip,
      member.debljina,
      member.id,
    )
  }
  // Vertikale se ne pomeraju — samo rebuild posle promene profila
  if (member.kind === 'vertical') {
    return buildVerticalMember(
      frame,
      member.stationX,
      member.tip,
      member.debljina,
      member.id,
    )
  }
  return member
}

export function generateBinderMembers({
  widthM = 8,
  padKrova = 2,
  heightMm = null,
  pitchDeg = 10,
  verticalCount = 5,
  mainTip = '80x60',
  mainDebljina = '2.8mm',
  fillTip = '40x40',
  fillDebljina = '2.8mm',
}) {
  const widthMm = widthM * 1000
  const H =
    heightMm != null && heightMm > 0
      ? heightMm
      : heightFromPitch(widthMm, padKrova, pitchDeg)

  const frame = buildFrameContext({
    widthM,
    padKrova,
    heightMm: H,
    mainTip,
    mainDebljina,
    fillTip,
    fillDebljina,
  })

  const members = [...buildFrameMembers(frame)]
  const stations = defaultVerticalStations(frame, verticalCount)

  stations.forEach((x) => {
    members.push(buildVerticalMember(frame, x, fillTip, fillDebljina))
  })

  for (let i = 0; i < stations.length - 1; i++) {
    const bottomX = (stations[i] + stations[i + 1]) / 2
    // Gornji kraj ka višoj strani
    let topX
    if (padKrova === 1) {
      topX = bottomX + (stations[i + 1] - stations[i]) * 0.45
    } else if (bottomX < 0) {
      topX = stations[i + 1]
    } else {
      topX = stations[i]
    }
    members.push(buildDiagonalMember(frame, bottomX, topX, fillTip, fillDebljina))
  }

  return { members, frame }
}

export function memberOutlinePoints(member) {
  if (member.outline?.length >= 3) return member.outline

  const w = getInPlaneWidth(member.tip, member.displayDim)
  const dx = member.x2 - member.x1
  const dy = member.y2 - member.y1
  const len = Math.hypot(dx, dy) || 1
  const nx = (-dy / len) * (w / 2)
  const ny = (dx / len) * (w / 2)

  return [
    { x: member.x1 + nx, y: member.y1 + ny },
    { x: member.x2 + nx, y: member.y2 + ny },
    { x: member.x2 - nx, y: member.y2 - ny },
    { x: member.x1 - nx, y: member.y1 - ny },
  ]
}

export function memberLocalOutline(member) {
  const pts = memberOutlinePoints(member)
  const minX = Math.min(...pts.map((p) => p.x))
  const minY = Math.min(...pts.map((p) => p.y))
  return pts.map((p) => ({ x: p.x - minX, y: p.y - minY }))
}

export function memberLocalRectangle(member) {
  const length =
    member.length || Math.hypot(member.x2 - member.x1, member.y2 - member.y1)
  const width = getInPlaneWidth(member.tip, member.displayDim)
  return { length, width }
}

export function stationRange(frame, halfWidth) {
  const { left, right, padKrova, cavityRight, mainW } = frame
  const xMin = left + mainW + halfWidth
  const xMax = (padKrova === 1 ? cavityRight : right - mainW) - halfWidth
  return { xMin, xMax }
}
