'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import jsPDF from 'jspdf'
import Shed3DVisualization from './Shed3DVisualization'

// Helper function to format numbers with comma as thousand separator
const formatPrice = (value) => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// --- Podaci stubova - organizovano po dužini ---
const STUBOVI_PO_DUZINI = {
  '2.5': [
    { tip: '100x100', debljina: '2.8mm', tezina: 27, ploca: 10 },
    { tip: '100x100', debljina: '3.8mm', tezina: 36, ploca: 10 }
  ],
  '3': [
    { tip: '100x100', debljina: '2.8mm', tezina: 27, ploca: 10 },
    { tip: '100x100', debljina: '3.8mm', tezina: 36, ploca: 10 }
  ],
  '4': [
    { tip: '100x100', debljina: '2.8mm', tezina: 36, ploca: 10 },
    { tip: '100x100', debljina: '3.8mm', tezina: 48, ploca: 10 },
    { tip: '120x120', debljina: '3.8mm', tezina: 58, ploca: 15 },
    { tip: '120x120', debljina: '4.8mm', tezina: 70, ploca: 15 }
  ],
  '4.5': [
    { tip: '100x100', debljina: '3.8mm', tezina: 55, ploca: 10 },
    { tip: '120x120', debljina: '3.8mm', tezina: 65, ploca: 15 },
    { tip: '120x120', debljina: '4.8mm', tezina: 78, ploca: 15 },
    { tip: '150x150', debljina: '4.8mm', tezina: 100, ploca: 24 }
  ],
  '5': [
    { tip: '100x100', debljina: '3.8mm', tezina: 60, dodatnaTezina: 12, ploca: 10 },
    { tip: '120x120', debljina: '3.8mm', tezina: 72, dodatnaTezina: 14, ploca: 15 },
    { tip: '120x120', debljina: '4.8mm', tezina: 85, dodatnaTezina: 17, ploca: 15 },
    { tip: '150x150', debljina: '4.8mm', tezina: 110, dodatnaTezina: 22, ploca: 24 }
  ],
  '6': [
    { tip: '120x120', debljina: '4.8mm', tezina: 105, ploca: 15 },
    { tip: '150x150', debljina: '4.8mm', tezina: 135, ploca: 24 },
    { tip: '150x150', debljina: '5.8mm', tezina: 160, ploca: 24 }
  ]
}

// --- Podaci bindera - organizovano po širini ---
const BINDERI_PO_SIRINI = {
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
    masa: 135,
    profili: [
      { tip: '80x60', debljina: '2.8mm', duzina: 15 },
      { tip: '40x40', debljina: '2.8mm', duzina: 10 }
    ],
    roznjace: {
      '1': 8,
      '2': 8
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
  }
}

// --- Podaci rožnjača ---
const ROZNJACE = {
  '60x40': {
    '2.8': {
      masa: 4, // kg
      cenaPoMetru: 6 // €/m
    }
  },
  '80x40': {
    '2.8': {
      masa: 4.9, // kg
      cenaPoMetru: 8 // €/m
    }
  },
  '100x50': {
    '2.8': {
      masa: 6.2, // kg
      cenaPoMetru: 10 // €/m
    }
  }
}

// --- Cene anker ploča po dimenzijama stubova ---
const ANKER_PLOCA_CENA = {
  '100x100': 17, // €
  '120x120': 20, // €
  '150x150': 30  // €
}

export default function Kalkulator() {
  // --- Admin Mode Check ---
  const searchParams = useSearchParams()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Proveri URL parametar
    const adminParam = searchParams.get('admin')
    if (adminParam === 'dzoni') {
      setIsAdmin(true)
      // Sačuvaj u localStorage
      localStorage.setItem('kalkulator_admin', 'true')
    } else {
      // Proveri localStorage
      const savedAdmin = localStorage.getItem('kalkulator_admin')
      setIsAdmin(savedAdmin === 'true')
    }
  }, [searchParams])

  // --- Šupa parametri ---
  const [width, setWidth] = useState(5)
  const [length, setLength] = useState(6)
  const [height, setHeight] = useState(2.5)
  const [padKrova, setPadKrova] = useState(1)
  const [pricePerKg, setPricePerKg] = useState(1.5)
  const [cenaMaterijalaPoKg, setCenaMaterijalaPoKg] = useState(0.85)
  const [projectName, setProjectName] = useState('')
  const [povrsinaHale, setPovrsinaHale] = useState(0)
  const [povrsinaKrova, setPovrsinaKrova] = useState(0)
  const [cenaLimaPoKg, setCenaLimaPoKg] = useState(0)
  const [cenaPanelPoM2, setCenaPanelPoM2] = useState(0)
  const [copiedNotification, setCopiedNotification] = useState(false)

  // --- Stubovi ---
  const [selectedStubIndex, setSelectedStubIndex] = useState(0)
  const [includeAnkerPloca, setIncludeAnkerPloca] = useState(false)

  // Funkcija koja određuje dužinu stuba na osnovu visine hale
  const getStubLengthFromShedHeight = (shedHeight) => {
    if (shedHeight <= 2.5) return '2.5'
    if (shedHeight <= 3) return '3'
    if (shedHeight <= 4) return '4'
    if (shedHeight <= 4.5) return '4.5'
    if (shedHeight <= 5) return '5'
    return '6'
  }

  // Određi dužinu stuba na osnovu visine hale
  const stubDuzina = getStubLengthFromShedHeight(height)

  // Dostupne opcije za izabranu dužinu stuba
  const dostupniStubovi = STUBOVI_PO_DUZINI[stubDuzina] || []
  const selectedStub = dostupniStubovi[selectedStubIndex] || dostupniStubovi[0]

  // Kada se promeni visina hale, resetuj izbor stuba na prvi dostupan
  useEffect(() => {
    if (dostupniStubovi.length > 0 && selectedStubIndex >= dostupniStubovi.length) {
      setSelectedStubIndex(0)
    }
  }, [height, dostupniStubovi.length, selectedStubIndex])

  // --- Binderi ---
  const [binderType, setBinderType] = useState('standardni') // Za 8m+: "standardni" ili "jaci"

  // Funkcija koja određuje širinu kategoriju
  const getWidthCategory = (shedWidth) => {
    if (shedWidth < 6) return '5'
    if (shedWidth < 7) return '6'
    if (shedWidth < 8) return '7'
    if (shedWidth < 9) return '8'
    if (shedWidth < 10) return '9'
    if (shedWidth < 12) return '10'
    return '12'
  }

  const widthCategory = getWidthCategory(width)

  // Funkcija koja proverava da li kategorija ima opcije standardni/jaci
  const hasBinderTypeOptions = (category) => {
    const categoryData = BINDERI_PO_SIRINI[category]
    return categoryData && categoryData.standardni
  }

  // Automatski određujemo binderData na osnovu širine i izabranog tipa
  const getBinderData = (category, type) => {
    const categoryData = BINDERI_PO_SIRINI[category]
    if (!categoryData) return null

    // Ako ima standardni/jaci opcije, koristimo izabrani tip
    if (categoryData.standardni) {
      return categoryData[type] || categoryData.standardni
    }
    // Inače je direktno objekat
    return categoryData
  }

  const binderData = getBinderData(widthCategory, binderType)
  const dostupniBinderi = binderData?.profili || []

  // Resetuj tip na standardni kada se promeni širina na kategoriju bez opcija
  useEffect(() => {
    if (!hasBinderTypeOptions(widthCategory)) {
      setBinderType('standardni')
    }
  }, [widthCategory])

  // --- Roznjace ---
  const [tipRoznjace, setTipRoznjace] = useState('60x40')

  // --- Broj bindera (editable) ---
  const [brojBindera, setBrojBindera] = useState(null) // null means use calculated value

  // Izračunaj predloženi broj bindera
  const suggestedBrojBindera = Math.ceil(length / 4) + 1

  // Koristi korisnikov unos ili predloženu vrednost
  const finalBrojBindera = brojBindera !== null ? brojBindera : suggestedBrojBindera

  // Kada se promeni dužina, ažuriraj predlog (samo ako korisnik nije ručno uneo vrednost)
  useEffect(() => {
    // Ako korisnik nije ručno uneo vrednost, koristi predloženu
    if (brojBindera === null) {
      // State će se automatski ažurirati kroz finalBrojBindera
    }
  }, [length, brojBindera])

  // --- Kalkulacije ---
  const calculations = useMemo(() => {
    const brojStubova = finalBrojBindera * 2

    if (!selectedStub) {
      return {
        brojBindera: 0,
        brojStubova: 0,
        tezinaStuba: 0,
        ukupnaTezinaStubova: 0,
        cenaPloca: 0,
        ankerPlocaCena: 0,
        ukupnaCenaAnkerPloca: 0,
        ukupnaCenaStubova: 0,
        ukupanBrojRoznjaca: 0,
        tezinaBindera: 0,
        ukupnaTezinaBindera: 0,
        ukupnaCenaBindera: 0,
        cenaRoznjace: 0,
        tezinaRoznjace: 0,
        ukupnaCenaRoznjaca: 0,
        ukupnaTezinaRoznjaca: 0,
        ukupnaTezina: 0,
        ukupnaCena: 0,
        povrsinaHale: 0,
        cenaPoMetru: 0,
        cenaKrova: 0,
        cenaPanel: 0,
        ukupnaCenaDodatnihTroskova: 0
      }
    }

    const tezinaStuba = selectedStub.tezina + (selectedStub.dodatnaTezina || 0)
    const cenaPloca = selectedStub.ploca
    // Cena stubova: osnovna težina * pricePerKg + dodatna težina * cenaMaterijalaPoKg + ploča
    const dodatnaTezina = selectedStub.dodatnaTezina || 0
    const cenaOsnovneTezine = selectedStub.tezina * pricePerKg
    const cenaDodatneTezine = dodatnaTezina * cenaMaterijalaPoKg

    // Anker ploča cena (po dimenzijama stubova)
    const ankerPlocaCena = ANKER_PLOCA_CENA[selectedStub.tip] || 0
    const ukupnaCenaAnkerPloca = includeAnkerPloca ? ankerPlocaCena * brojStubova : 0

    const ukupnaCenaStubova = brojStubova * (cenaOsnovneTezine + cenaDodatneTezine + cenaPloca) + ukupnaCenaAnkerPloca
    const ukupnaTezinaStubova = tezinaStuba * brojStubova

    // Izračunaj binderData unutar useMemo
    const currentWidthCategory = getWidthCategory(width)
    const categoryData = BINDERI_PO_SIRINI[currentWidthCategory]
    const currentBinderData = categoryData?.standardni
      ? (categoryData[binderType] || categoryData.standardni)
      : categoryData

    // Težina bindera po komadu
    const tezinaBinderaPoKomadu = currentBinderData?.masa || 0
    const ukupnaCenaBindera = tezinaBinderaPoKomadu * pricePerKg * finalBrojBindera
    const ukupnaTezinaBindera = tezinaBinderaPoKomadu * finalBrojBindera

    // Broj rožnjača po binderu (određen na osnovu širine i pada krova)
    const brojRoznjacaPoBinderu = currentBinderData?.roznjace?.[padKrova.toString()] || 0
    // Ukupan broj rožnjača = broj po binderu * dužina hale
    const ukupanBrojRoznjaca = brojRoznjacaPoBinderu * length

    // Podaci rožnjače na osnovu izabranog tipa
    const roznjacaData = ROZNJACE[tipRoznjace]?.['2.8'] || { masa: 0, cenaPoMetru: 0 }
    const cenaRoznjace = roznjacaData.cenaPoMetru
    const tezinaRoznjace = roznjacaData.masa
    const ukupnaCenaRoznjaca = cenaRoznjace * ukupanBrojRoznjaca
    const ukupnaTezinaRoznjaca = tezinaRoznjace * ukupanBrojRoznjaca

    const ukupnaTezina = ukupnaTezinaStubova + ukupnaTezinaBindera + ukupnaTezinaRoznjaca
    const ukupnaCena = ukupnaCenaStubova + ukupnaCenaBindera + ukupnaCenaRoznjaca
    const ukupnaCenaBezAnkerPloca = ukupnaCenaStubova + ukupnaCenaBindera + ukupnaCenaRoznjaca - ukupnaCenaAnkerPloca

    const povrsinaHale = length * width
    const cenaPoMetru = ukupnaCena / povrsinaHale
    const cenaKrova = povrsinaKrova * cenaLimaPoKg
    const cenaPanel = povrsinaKrova * cenaPanelPoM2
    const ukupnaCenaDodatnihTroskova = cenaKrova + cenaPanel

    return {
      brojBindera: finalBrojBindera,
      brojStubova,
      tezinaStuba,
      ukupnaTezinaStubova,
      cenaPloca,
      ankerPlocaCena,
      ukupnaCenaAnkerPloca,
      ukupnaCenaStubova,
      ukupanBrojRoznjaca,
      tezinaBindera: tezinaBinderaPoKomadu,
      ukupnaTezinaBindera,
      ukupnaCenaBindera,
      cenaRoznjace,
      tezinaRoznjace,
      ukupnaCenaRoznjaca,
      ukupnaTezinaRoznjaca,
      ukupnaCena, // sa anker pločom
      ukupnaCenaBezAnkerPloca, // bez anker ploče
      povrsinaHale,
      ukupnaTezina,
      cenaPoMetru,
      cenaKrova,
      cenaPanel,
      ukupnaCenaDodatnihTroskova
    }
  }, [length, selectedStub, width, binderType, padKrova, pricePerKg, cenaMaterijalaPoKg, tipRoznjace, finalBrojBindera, includeAnkerPloca, cenaLimaPoKg, cenaPanelPoM2, povrsinaKrova])

  // Funkcija za eksport u PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    let yPos = 20

    // Naslov
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Kalkulator hale - Izveštaj', 105, yPos, { align: 'center' })
    yPos += 10

    // Naziv projekta (ako postoji)
    if (projectName.trim()) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(projectName.trim(), 105, yPos, { align: 'center' })
      yPos += 10
    }

    // Datum
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Datum: ${new Date().toLocaleDateString('sr-RS')}`, 105, yPos, { align: 'center' })
    yPos += 15

    // Parametri hale
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Parametri hale', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Širina: ${width}m`, 20, yPos)
    doc.text(`Dužina: ${length}m`, 20, yPos + 5)
    doc.text(`Visina: ${height}m`, 20, yPos + 10)
    doc.text(`Pad krova: ${padKrova === 1 ? 'Jedna voda' : 'Dve vode'}`, 20, yPos + 15)
    doc.text(`Cena po kg: ${pricePerKg} €/kg`, 20, yPos + 20)
    doc.text(`Cena materijala po kg: ${cenaMaterijalaPoKg} €/kg`, 20, yPos + 25)
    yPos += 35

    // Stubovi
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Stubovi', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    if (selectedStub) {
      doc.text(`Tip: ${selectedStub.tip} x ${selectedStub.debljina}`, 20, yPos)
      doc.text(`Dužina stuba: ${stubDuzina}m`, 20, yPos + 5)
      const totalWeight = selectedStub.tezina + (selectedStub.dodatnaTezina || 0)
      doc.text(`Težina po stubu: ${totalWeight}kg`, 20, yPos + 10)
      doc.text(`Ukupna težina stubova: ${calculations.ukupnaTezinaStubova.toFixed(2)}kg`, 20, yPos + 15)
      doc.text(`Broj stubova: ${calculations.brojStubova}`, 20, yPos + 20)
      doc.text(`Cena ploce: ${calculations.cenaPloca}€`, 20, yPos + 25)
      let currentYPos = yPos + 30
      if (includeAnkerPloca && calculations.ankerPlocaCena > 0) {
        doc.text(`Anker ploča (${selectedStub.tip}): ${calculations.ankerPlocaCena}€ po komadu`, 20, currentYPos)
        doc.text(`Ukupna cena anker ploča: ${calculations.ukupnaCenaAnkerPloca.toFixed(2)}€`, 20, currentYPos + 5)
        currentYPos += 10
      }
      doc.text(`Ukupna cena stubova: ${calculations.ukupnaCenaStubova.toFixed(2)}€`, 20, currentYPos)
    }
    yPos += 35

    // Binderi
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Binderi', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    if (binderData) {
      const currentWidthCategory = getWidthCategory(width)
      const hasOptions = BINDERI_PO_SIRINI[currentWidthCategory]?.standardni
      if (hasOptions) {
        doc.text(`Tip: ${binderType === 'standardni' ? 'Standardni' : 'Jači'} binder`, 20, yPos)
        yPos += 5
      }
      doc.text(`Masa bindera: ${binderData.masa}kg`, 20, yPos)
      doc.text(`Broj bindera: ${calculations.brojBindera}`, 20, yPos + 5)
      doc.text(`Broj roznjaca po binderu: ${binderData.roznjace?.[padKrova.toString()] || 0} kom`, 20, yPos + 10)
      doc.text(`Ukupna težina bindera: ${calculations.ukupnaTezinaBindera.toFixed(2)}kg`, 20, yPos + 15)
      doc.text(`Ukupna cena bindera: ${calculations.ukupnaCenaBindera.toFixed(2)}€`, 20, yPos + 20)
      yPos += 25
      // Lista profila
      doc.text('Profili:', 20, yPos)
      yPos += 5
      dostupniBinderi.forEach((binder, index) => {
        doc.text(`  • ${binder.tip} x ${binder.debljina} - ${binder.duzina}m`, 20, yPos)
        yPos += 5
      })
    }
    yPos += 10

    // Rožnjače
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Roznjace', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Tip: ${tipRoznjace} x 2.8mm`, 20, yPos)
    doc.text(`Masa po komadu: ${calculations.tezinaRoznjace}kg`, 20, yPos + 5)
    doc.text(`Ukupan broj: ${calculations.ukupanBrojRoznjaca} kom`, 20, yPos + 10)
    doc.text(`Ukupna težina: ${calculations.ukupnaTezinaRoznjaca.toFixed(2)}kg`, 20, yPos + 15)
    doc.text(`Cena po metru: ${calculations.cenaRoznjace}€`, 20, yPos + 20)
    doc.text(`Ukupna cena roznjaca: ${calculations.ukupnaCenaRoznjaca.toFixed(2)}€`, 20, yPos + 25)
    yPos += 30

    // Ukupna cena
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`UKUPNA CENA: ${calculations.ukupnaCena.toFixed(2)}€`, 105, yPos, { align: 'center' })

    // Sačuvaj PDF
    const dateStr = new Date().toISOString().split('T')[0]
    const namePart = projectName.trim() ? `_${projectName.trim().replace(/[^a-zA-Z0-9]/g, '_')}` : ''
    const fileName = `Kalkulator_hale${namePart}_${dateStr}.pdf`
    doc.save(fileName)
  }

  // Funkcija za formatiranje ponude u tekst za email
  const formatPonudaForEmail = () => {
    let ponudaText = ''

    ponudaText += `Cena konstrukcije ${length}m x ${width}m x ${height}m na ${padKrova === 1 ? 'jednu vodu' : 'dve vode'} je: ${formatPrice(calculations.ukupnaCenaBezAnkerPloca)}€`
    if (includeAnkerPloca && calculations.ukupnaCenaAnkerPloca > 0) {
      ponudaText += ` plus ${formatPrice(calculations.ukupnaCenaAnkerPloca)}€ su anker ploče`
    }
    ponudaText += '.\n\n'

    ponudaText += 'Profili za konstrukciju:\n'
    if (selectedStub) {
      ponudaText += `Stubovi: ${selectedStub.tip} x ${selectedStub.debljina}\n`
    }
    if (binderData && dostupniBinderi.length > 0) {
      ponudaText += `Binderi: ${dostupniBinderi[0].tip} x ${dostupniBinderi[0].debljina}\n`
    }
    if (tipRoznjace && ROZNJACE[tipRoznjace]) {
      ponudaText += `Rožnjače: ${tipRoznjace} x 2.8mm\n`
    }

    ponudaText += `\nUkupno ima ${calculations.brojStubova} stubova i ${calculations.brojBindera} bindera.\n\n`

    ponudaText += 'Stubovi i binderi se spajaju šrafovima, dok se rožnjače vare za L-profile koji su postavljeni na bindere.\n\n'

    ponudaText += 'Kompletna konstrukcija je zaštićena i ofarbana u dve ruke osnovnom antikorozivnom farbom.\n\n'

    ponudaText += 'Prevoz i montaža nisu uključeni u cenu.\nMontažu ne radimo, ali po potrebi možemo organizovati prevoz.'

    return ponudaText
  }

  // Funkcija za kopiranje ponude u clipboard
  const copyPonudaToClipboard = async () => {
    const ponudaText = formatPonudaForEmail()
    try {
      await navigator.clipboard.writeText(ponudaText)
      setCopiedNotification(true)
      setTimeout(() => {
        setCopiedNotification(false)
      }, 2000)
    } catch (err) {
      console.error('Greška pri kopiranju:', err)
      // Fallback za starije pretraživače
      const textArea = document.createElement('textarea')
      textArea.value = ponudaText
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopiedNotification(true)
        setTimeout(() => {
          setCopiedNotification(false)
        }, 2000)
      } catch (err) {
        console.error('Greška pri kopiranju (fallback):', err)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen font-sans text-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Kalkulator</h1>

      {/* Šupa parametri */}
      <section className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Parametri hale</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <label className="flex flex-col">
            Dužina (m)
            <select
              className="mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              value={length}
              onChange={e => {
                const newLength = parseFloat(e.target.value) || 1
                setLength(newLength)
              }}
            >
              {Array.from({ length: 50 }, (_, i) => i + 1).map(val => (
                <option key={val} value={val}>{val}m</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            Širina (m)
            <select
              className="mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              value={width}
              onChange={e => {
                const newWidth = parseFloat(e.target.value) || 5
                setWidth(newWidth)
              }}
            >
              {Array.from({ length: 8 }, (_, i) => 5 + i).map(val => (
                <option key={val} value={val}>{val}m</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col">
            Visina (m)
            <select
              className="mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              value={height}
              onChange={e => {
                const newHeight = parseFloat(e.target.value) || 2.5
                setHeight(newHeight)
                setSelectedStubIndex(0) // Resetuj izbor stuba kada se promeni visina
              }}
            >
              {Array.from({ length: 8 }, (_, i) => 2.5 + i * 0.5).map(val => (
                <option key={val} value={val}>{val}m</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            Pad krova
            <select className="mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900" value={padKrova} onChange={e => setPadKrova(parseInt(e.target.value))}>
              <option value={1}>Jedna voda</option>
              <option value={2}>Dve vode</option>
            </select>
          </label>
          {isAdmin && (
            <label className="flex flex-col">
              Cena po kg (€/kg)
              <input type="number" className="mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900" value={pricePerKg} onChange={e => setPricePerKg(parseFloat(e.target.value) || 0)} />
            </label>
          )}
          <label className="flex flex-col">
            Površina hale (m²):
            <div className="flex items-center h-full min-h-[0px]">
              <h1 className="text-2xl font-bold">{calculations.povrsinaHale}m²</h1>
            </div>
          </label>
        </div>
      </section>

      {/* Stubovi, Binderi i Roznjace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Stubovi */}
        <section className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Stubovi</h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Visina hale: <strong>{height}m</strong> → Dužina stuba: <strong>{stubDuzina}m</strong>
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <label>
              Tip stuba i debljina
              <select
                className="mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 w-full"
                value={selectedStubIndex}
                onChange={e => setSelectedStubIndex(parseInt(e.target.value))}
              >
                {dostupniStubovi.map((stub, index) => {
                  const dodatnaInfo = stub.dodatnaTezina ? ` +${stub.dodatnaTezina}kg` : ''
                  return (
                    <option key={index} value={index}>
                      {stub.tip} x {stub.debljina} - {stub.tezina}kg{dodatnaInfo}
                    </option>
                  )
                })}
              </select>
            </label>
          </div>
          {selectedStub && (
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-gray-100 rounded-md">
                <p className="text-sm">
                  <strong>Izabrano:</strong> {selectedStub.tip} x {selectedStub.debljina} (dužina: {stubDuzina}m) - {selectedStub.tezina}kg
                  {selectedStub.dodatnaTezina && ` + ${selectedStub.dodatnaTezina}kg = ${selectedStub.tezina + selectedStub.dodatnaTezina}kg`}
                  {' | '}Cena ploče: {selectedStub.ploca}€
                </p>
              </div>
              {ANKER_PLOCA_CENA[selectedStub.tip] && (
                <div className="p-3 bg-gray-100 rounded-md">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAnkerPloca}
                      onChange={e => setIncludeAnkerPloca(e.target.checked)}
                      className="w-4 h-4 text-red-700 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm">
                      Uključi anker ploču ({selectedStub.tip}): <strong>{ANKER_PLOCA_CENA[selectedStub.tip]}€</strong> po komadu
                      {includeAnkerPloca && (
                        <span className="ml-2 text-red-700">
                          (Ukupno: {ANKER_PLOCA_CENA[selectedStub.tip] * calculations.brojStubova}€)
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Binderi */}
        <section className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Binderi</h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Širina hale: <strong>{width}m</strong> → Kategorija: <strong>{widthCategory}m</strong>
            </p>
          </div>
          <div className="mb-4">
            <label className="flex flex-col">
              Broj bindera
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                <input
                  type="number"
                  min="1"
                  className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 w-full sm:w-auto"
                  value={finalBrojBindera}
                  onChange={e => {
                    const value = parseInt(e.target.value) || 1
                    setBrojBindera(value)
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setBrojBindera(null) // Reset to calculated value
                  }}
                  className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors whitespace-nowrap w-full sm:w-auto"
                  title="Koristi predloženu vrednost"
                >
                  <span className="hidden sm:inline">Predlog: </span>
                  <span className="sm:hidden">Predlog </span>
                  {suggestedBrojBindera}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Predloženo: {suggestedBrojBindera} (izračunato na osnovu sirine: {width}m)
              </p>
            </label>
          </div>
          {hasBinderTypeOptions(widthCategory) && (
            <div className="mb-4">
              <label className="flex flex-col">
                Tip bindera
                <select
                  className="mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  value={binderType}
                  onChange={e => setBinderType(e.target.value)}
                >
                  <option value="standardni">Standardni binder ({BINDERI_PO_SIRINI[widthCategory]?.standardni?.masa || 0}kg)</option>
                  <option value="jaci">Jači binder ({BINDERI_PO_SIRINI[widthCategory]?.jaci?.masa || 0}kg)</option>
                </select>
              </label>
            </div>
          )}
          {binderData && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 rounded-md">
                <p className="font-semibold mb-2 text-gray-900">
                  {hasBinderTypeOptions(widthCategory) && (
                    <span className="mr-2">Tip: <strong>{binderType === 'standardni' ? 'Standardni' : 'Jači'} binder</strong> | </span>
                  )}
                  Masa bindera: {binderData.masa}kg
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  Broj rožnjača po binderu: <strong>{binderData.roznjace?.[padKrova.toString()] || 0}</strong> kom ({padKrova === 1 ? '1 voda' : '2 vode'})
                </p>
                <div className="mt-3">
                  <p className="font-semibold text-sm mb-2 text-gray-900">Profili bindera:</p>
                  <ul className="space-y-1">
                    {dostupniBinderi.map((binder, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        • {binder.tip} x {binder.debljina} - {binder.duzina}m
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Roznjace */}
        <section className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Rožnjače</h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Broj rožnjača po binderu: <strong>{binderData?.roznjace?.[padKrova.toString()] || 0}</strong> kom ({padKrova === 1 ? '1 voda' : '2 vode'})
              {' × '}Dužina hale: <strong>{length}m</strong> = <strong>{(binderData?.roznjace?.[padKrova.toString()] || 0) * length}</strong> kom ukupno
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <label>
              Tip rožnjače
              <select
                className="mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 w-full"
                value={tipRoznjace}
                onChange={e => setTipRoznjace(e.target.value)}
              >
                {Object.keys(ROZNJACE).map(tip => (
                  <option key={tip} value={tip}>
                    {tip} x 2.8mm
                  </option>
                ))}
              </select>
            </label>
          </div>
          {tipRoznjace && ROZNJACE[tipRoznjace] && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-sm">
                <strong>Izabrano:</strong> {tipRoznjace} x 2.8mm
                {' | '}Masa: {ROZNJACE[tipRoznjace]['2.8'].masa}kg po komadu
                {' | '}Cena: {ROZNJACE[tipRoznjace]['2.8'].cenaPoMetru}€ po metru
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Rezultati */}
      <section className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Rezultati</h2>
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-gray-50 rounded-md shadow-sm">
              <h3 className="font-semibold mb-2">Stubovi</h3>
              <ul className="space-y-1">
                <li>Broj stubova: {calculations.brojStubova}</li>
                <li>Razmak između stubova: {calculations.brojBindera > 1 ? formatPrice(length / (calculations.brojBindera - 1)) : formatPrice(0)} m</li>
                <li>Težina po stubu: {calculations.tezinaStuba} kg</li>
                <li>Ukupna težina: {calculations.ukupnaTezinaStubova.toFixed(2)} kg</li>
                <li>Ukupna cena: {formatPrice(calculations.ukupnaCenaStubova)} €</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-md shadow-sm">
              <h3 className="font-semibold mb-2">Binderi</h3>
              <ul className="space-y-1">
                <li>Broj bindera: {calculations.brojBindera}</li>
                <li>Težina: {calculations.tezinaBindera} kg</li>
                <li>Ukupna težina: {calculations.ukupnaTezinaBindera.toFixed(2)} kg</li>
                <li>Cena: {formatPrice(calculations.ukupnaCenaBindera)} €</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-md shadow-sm">
              <h3 className="font-semibold mb-2">Rožnjače</h3>
              <ul className="space-y-1">
                <li>Ukupno metara: {calculations.ukupanBrojRoznjaca} m</li>
                <li>Težina po metru: {calculations.tezinaRoznjace} kg</li>
                <li>Ukupna težina: {calculations.ukupnaTezinaRoznjaca.toFixed(2)} kg</li>
                <li>Cena po metru: {calculations.cenaRoznjace} €</li>
                <li>Cena: {formatPrice(calculations.ukupnaCenaRoznjaca)} €</li>
              </ul>
            </div>
          </div>
        )}
        <div className="p-4 bg-gray-100 rounded-md shadow-sm font-bold text-lg text-gray-800">
            {isAdmin && (
              <>
                Cena po metru kvadratnom: {formatPrice(calculations.cenaPoMetru)} €/m2
                <br />
                Ukupna težina: {formatPrice(calculations.ukupnaTezina)} kg
                <br />
              </>
            )}
            {includeAnkerPloca && calculations.ukupnaCenaAnkerPloca > 0 ? (
              <>
                Cena konstrukcije: {formatPrice(calculations.ukupnaCenaBezAnkerPloca)} € + Anker ploča: {formatPrice(calculations.ukupnaCenaAnkerPloca)} € = Ukupna cena: {formatPrice(calculations.ukupnaCena)} €
              </>
            ) : (
              <>
                Cena konstrukcije: {formatPrice(calculations.ukupnaCena)} €
              </>
            )}
          </div>
        <div className="mt-6 flex justify-center">
          {isAdmin && <button
            onClick={exportToPDF}
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Izvezi u PDF
          </button>}
        </div>
      </section>

      {/* 3D Vizualizacija */}
      <section className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">3D Vizualizacija hale</h2>
        <p className="text-sm text-gray-600 mb-4">
          Interaktivna 3D vizualizacija vaše hale sa svim elementima: stubovima, binderima i rožnjačama.
        </p>
        <div className="relative">
          <Shed3DVisualization
            length={length}
            width={width}
            height={height}
            padKrova={padKrova}
            brojBindera={calculations.brojBindera}
            brojStubova={calculations.brojStubova}
            brojRoznjaca={calculations.ukupanBrojRoznjaca}
            binderProfili={dostupniBinderi}
          />
        </div>
      </section>

      {/* Ponuda */}
      <section className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Ponuda</h2>
          {isAdmin && <button
            key="copy-ponuda"
            onClick={copyPonudaToClipboard}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copiedNotification ? 'Kopirano!' : 'Kopiraj ponudu'}
          </button>}
        </div>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="space-y-4 text-sm leading-relaxed whitespace-pre-line">
            <p>
              <strong>Cena konstrukcije {length}m x {width}m x {height}m na {padKrova == 1 ? (<>jednu vodu</>) : (<>dve vode</>)} je: {formatPrice(calculations.ukupnaCenaBezAnkerPloca)}€</strong>
              {includeAnkerPloca && calculations.ukupnaCenaAnkerPloca > 0 && (
                <span> plus <strong>{formatPrice(calculations.ukupnaCenaAnkerPloca)}€</strong> su anker ploče</span>
              )}
              .
            </p>

            <div className="mt-4">
              <p className="font-semibold mb-2">Profili za konstrukciju:</p>
              {selectedStub && (
                <p><strong>Stubovi:</strong> {selectedStub.tip} x {selectedStub.debljina}</p>
              )}
              {binderData && dostupniBinderi.length > 0 && (
                <p><strong>Binderi:</strong> {dostupniBinderi[0].tip} x {dostupniBinderi[0].debljina}</p>
              )}
              {tipRoznjace && ROZNJACE[tipRoznjace] && (
                <p><strong>Rožnjače:</strong> {tipRoznjace} x 2.8mm</p>
              )}
            </div>

            <p className="mt-4">
              Ukupno ima <strong>{calculations.brojStubova} stubova</strong> i <strong>{calculations.brojBindera} bindera</strong>.
            </p>

            <p className="mt-4">
              Stubovi i binderi se spajaju šrafovima, dok se rožnjače vare za L-profile koji su postavljeni na bindere.
            </p>

            <p className="mt-4">
              Kompletna konstrukcija je zaštićena i ofarbana u dve ruke osnovnom antikorozivnom farbom.
            </p>

            <p className="mt-4">
              Prevoz i montaža nisu uključeni u cenu.
              Montažu ne radimo, ali po potrebi možemo organizovati prevoz.
            </p>
          </div>
        </div>
      </section>

      {isAdmin && (
        <section className="mb-6 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Dodatni troškovi: Kalkulacija</h2>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <label className="flex flex-col">
              Povrsina krova (m²):
              <input
                type="number"
                step="1"
                min="0"
                max="5000"
                className="mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                value={povrsinaKrova}
                onChange={e => setPovrsinaKrova(parseInt(e.target.value))}
              />
            </label>
            <label className="flex flex-col">
              Cena lima po kg (€/kg):
              <input
                type="number"
                step="0.1"
                min="0"
                max="1000"
                className="mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                value={cenaLimaPoKg}
                onChange={e => setCenaLimaPoKg(parseFloat(e.target.value))}
              />
            </label>
            <label className="flex flex-col">
              Cena panela po m² (€/m²):
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                className="mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                value={cenaPanelPoM2}
                onChange={e => setCenaPanelPoM2(parseFloat(e.target.value))}
              />
            </label>
            <div className="p-4 col-span-full bg-gray-100 rounded-md shadow-sm font-bold text-lg text-gray-800">
              Cena limenog krova: {formatPrice(calculations.cenaKrova)} €
              <br />
              Cena panela: {formatPrice(calculations.cenaPanel)} €
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Ostali parametri */}
      {isAdmin && (
        <section className="mb-6 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Ostali parametri</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <label className="flex flex-col">
            Cena materijala po kg (€/kg)
            <input
              type="number"
              step="0.05"
              className="mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              value={cenaMaterijalaPoKg}
              onChange={e => setCenaMaterijalaPoKg(parseFloat(e.target.value) || 0)}
            />
          </label>
          <label className="flex flex-col">
            Naziv projekta (za PDF)
            <input
              type="text"
              className="mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="Unesite naziv projekta (opciono)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Naziv će biti uključen u ime PDF fajla
            </p>
          </label>
        </div>
      </section>
      )}
    </div>
  )
}



