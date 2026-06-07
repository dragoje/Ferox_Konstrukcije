// --- Podaci stubova - organizovano po dužini ---
export const STUBOVI_PO_DUZINI = {
  '2.5': [
    { tip: '100x100', debljina: '2.8mm', tezina: 27, ploca: 10 },
    { tip: '100x100', debljina: '3.8mm', tezina: 36, ploca: 10 }
  ],
  '3': [
    { tip: '100x100', debljina: '2.8mm', tezina: 27, ploca: 10 },
    { tip: '100x100', debljina: '3.8mm', tezina: 36, ploca: 10 },
    { tip: '120x120', debljina: '3.8mm', tezina: 45, ploca: 15 }
  ],
  '4': [
    { tip: '100x100', debljina: '2.8mm', tezina: 36, ploca: 10 },
    { tip: '100x100', debljina: '3.8mm', tezina: 48, ploca: 10 },
    { tip: '120x120', debljina: '3.8mm', tezina: 58, ploca: 15 },
    { tip: '120x120', debljina: '4.8mm', tezina: 70, ploca: 15 },
    { tip: '120x120', debljina: '5.6mm', tezina: 82, ploca: 15 }
  ],
  '4.5': [
    { tip: '100x100', debljina: '3.8mm', tezina: 55, ploca: 10 },
    { tip: '120x120', debljina: '3.8mm', tezina: 65, ploca: 15 },
    { tip: '120x120', debljina: '4.8mm', tezina: 78, ploca: 15 },
    { tip: '150x150', debljina: '4.8mm', tezina: 100, ploca: 24 },
    { tip: '120x120', debljina: '5.6mm', tezina: 92, ploca: 15 }
  ],
  '5': [
    { tip: '100x100', debljina: '3.8mm', tezina: 60, dodatnaTezina: 12, ploca: 10 },
    { tip: '120x120', debljina: '3.8mm', tezina: 72, dodatnaTezina: 14, ploca: 15 },
    { tip: '120x120', debljina: '4.8mm', tezina: 85, dodatnaTezina: 17, ploca: 15 },
    { tip: '150x150', debljina: '4.8mm', tezina: 110, dodatnaTezina: 22, ploca: 24 },
    { tip: '120x120', debljina: '5.6mm', tezina: 105, dodatnaTezina: 22, ploca: 15 }
  ],
  '6': [
    { tip: '120x120', debljina: '5.6mm', tezina: 120, ploca: 15 },
    { tip: '150x150', debljina: '4.8mm', tezina: 135, ploca: 24 },
    { tip: '150x150', debljina: '5.8mm', tezina: 160, ploca: 24 }
  ]
}

// --- Podaci bindera - organizovano po širini ---
export const BINDERI_PO_SIRINI = {
  '5': {
    masa: 100,
    profili: [
      { tip: '80x60', debljina: '2.8mm', duzina: 12 },
      { tip: '40x40', debljina: '2.8mm', duzina: 6 }
    ],
    roznjace: {
      '1': 6,
      '2': 8
    }
  },
  '6': {
    masa: 115,
    profili: [
      { tip: '80x60', debljina: '2.8mm', duzina: 12 },
      { tip: '40x40', debljina: '2.8mm', duzina: 6 }
    ],
    roznjace: {
      '1': 7,
      '2': 8
    }
  },
  '7': {
    standardni: {
      masa: 135,
      profili: [
        { tip: '80x60', debljina: '2.8mm', duzina: 15 },
        { tip: '40x40', debljina: '2.8mm', duzina: 10 },
      ],
      roznjace: {
        '1': 8,
        '2': 8
      }
    },
    jaci: {
      masa: 160,
      profili: [
        { tip: '80x60', debljina: '3.8mm', duzina: 15 },
        { tip: '40x40', debljina: '2.8mm', duzina: 10 }
      ],
      roznjace: {
        '1': 8,
        '2': 8
      }
    }
  },
  '8': {
    standardni: {
      masa: 160,
      profili: [
        { tip: '80x60', debljina: '2.8mm', duzina: 18 },
        { tip: '40x40', debljina: '2.8mm', duzina: 14 }
      ],
      roznjace: {
        '1': 9,
        '2': 10
      }
    },
    jaci: {
      masa: 210,
      profili: [
        { tip: '80x60', debljina: '3.8mm', duzina: 18 },
        { tip: '40x40', debljina: '2.8mm', duzina: 14 }
      ],
      roznjace: {
        '1': 9,
        '2': 10
      }
    }
  },
  '9': {
    standardni: {
      masa: 230,
      profili: [
        { tip: '80x60', debljina: '3.8mm', duzina: 22 },
        { tip: '40x40', debljina: '2.8mm', duzina: 14 }
      ],
      roznjace: {
        '1': 10,
        '2': 10
      }
    },
    jaci: {
      masa: 265,
      profili: [
        { tip: '80x80', debljina: '3.8mm', duzina: 22 },
        { tip: '40x40', debljina: '2.8mm', duzina: 14 }
      ],
      roznjace: {
        '1': 10,
        '2': 10
      }
    }
  },
  '10': {
    standardni: {
      masa: 240,
      profili: [
        { tip: '80x60', debljina: '3.8mm', duzina: 24 },
        { tip: '40x40', debljina: '2.8mm', duzina: 16 }
      ],
      roznjace: {
        '1': 11,
        '2': 12
      }
    },
    jaci: {
      masa: 280,
      profili: [
        { tip: '80x80', debljina: '3.8mm', duzina: 24 },
        { tip: '40x40', debljina: '2.8mm', duzina: 16 }
      ],
      roznjace: {
        '1': 11,
        '2': 12
      }
    }
  },
  '12': {
    standardni: {
      masa: 285,
      profili: [
        { tip: '80x80', debljina: '3.8mm', duzina: 26 },
        { tip: '40x40', debljina: '3.8mm', duzina: 16 }
      ],
      roznjace: {
        '1': 13,
        '2': 14
      }
    },
    jaci: {
      masa: 320,
      profili: [
        { tip: '100x80', debljina: '3.8mm', duzina: 26 },
        { tip: '40x40', debljina: '3.8mm', duzina: 16 }
      ],
      roznjace: {
        '1': 13,
        '2': 14
      }
    }
  },
  '14': {
    standardni: {
      masa: 450,
      profili: [
        { tip: '120x80', debljina: '3.8mm', duzina: 30 },
        { tip: '50x50', debljina: '3.8mm', duzina: 20 }
      ],
      roznjace: {
        '1': 16,
        '2': 16
      }
    },
  },
  '16': {
    standardni: {
      masa: 560,
      profili: [
        { tip: '120x80', debljina: '3.8mm', duzina: 36 },
        { tip: '50x50', debljina: '3.8mm', duzina: 28 }
      ],
      roznjace: {
        '1': 18,
        '2': 18
      }
    }
  }
}

// --- Podaci rožnjača ---
export const ROZNJACE = {
  '60x40': {
    '2.8': {
      masa: 4, // kg
      cenaPoMetru: 6 // €/m
    }
  },
  '80x40': {
    '2.8': {
      masa: 5.0, // kg
      cenaPoMetru: 8.35 // €/m
    }
  },
  '80x60': {
    '2.8': {
      masa: 6.0, // kg
      cenaPoMetru: 10 // €/m
    }
  },
  '100x60': {
    '2.8': {
      masa: 6.8, // kg
      cenaPoMetru: 12 // €/m
    }
  }
}

// --- Cene anker ploča po dimenzijama stubova ---
export const ANKER_PLOCA_CENA = {
  '100x100': 17, // €
  '120x120': 20, // €
  '150x150': 30  // €
}

export const ANKER_SRAFO_CENA = [
  { tip: '100x100', debljina: '16mm', duzina: '300mm', cena: 10 },
  { tip: '120x120', debljina: '16mm', duzina: '300mm', cena: 14 },
  { tip: '150x150', debljina: '20mm', duzina: '300mm', cena: 20 },
]

export const formatAnkerSrafOpis = (ankerSrafData) => {
  if (!ankerSrafData) return 'M16 x 300mm'
  return `M${ankerSrafData.debljina.replace('mm', '')} x ${ankerSrafData.duzina}`
}

