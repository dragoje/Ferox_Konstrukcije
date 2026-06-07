'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import Shed3DVisualization from './Shed3DVisualization'
import { STUBOVI_PO_DUZINI, BINDERI_PO_SIRINI, ROZNJACE, ANKER_PLOCA_CENA, ANKER_SRAFO_CENA, formatAnkerSrafOpis } from '@/data/konstrukcijaData'
import { addProjekat } from '@/lib/projektiStorage'

// Helper function to format numbers with comma as thousand separator
const formatPrice = (value) => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Uvek zaokružuje na višu pedeseticu (npr. 5.201 → 5.250, 5.250 → 5.250)
const roundUpTo50 = (value) => {
  const amount = Math.round((Number(value) || 0) * 100) / 100
  if (amount <= 0) return 0
  return Math.ceil(amount / 50) * 50
}

const VALID_HEIGHTS = Array.from({ length: 8 }, (_, i) => 2.5 + i * 0.5)

const formatDimenzije = (l, w, h) => `${l}x${w}x${h}`

const scrollToSection = (sectionId) => {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const parseDimenzije = (input) => {
  const trimmed = input.trim()
  if (!trimmed) return { error: 'Unesite dimenzije' }

  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)$/i)
  if (!match) return { error: 'Format: dužina x širina x visina (npr. 20x6x3)' }

  const length = parseFloat(match[1])
  const width = parseFloat(match[2])
  const height = parseFloat(match[3])

  if (length < 1 || length > 100 || !Number.isInteger(length)) {
    return { error: 'Dužina mora biti ceo broj od 1 do 100 m' }
  }
  if (width < 5 || width > 16 || !Number.isInteger(width)) {
    return { error: 'Širina mora biti ceo broj od 5 do 16 m' }
  }
  if (!VALID_HEIGHTS.includes(height)) {
    return { error: 'Visina mora biti od 2.5 do 6 m (koraci 0.5)' }
  }

  return { length, width, height }
}

export default function Kalkulator() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const capture3DRef = useRef(null)
  const [showKreirajModal, setShowKreirajModal] = useState(false)
  const [kreirajNaziv, setKreirajNaziv] = useState('')
  const [kreirajRok, setKreirajRok] = useState('')
  const [kreirajDatumPocetka, setKreirajDatumPocetka] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const [kreirajMobil, setKreirajMobil] = useState('')
  const [kreirajNapomena, setKreirajNapomena] = useState('')

  useEffect(() => {
    const adminParam = searchParams.get('admin')
    if (adminParam === 'dzoni') {
      setIsAdmin(true)
      localStorage.setItem('kalkulator_admin', 'true')
    } else {
      const savedAdmin = localStorage.getItem('kalkulator_admin')
      setIsAdmin(savedAdmin === 'true')
    }
    setIsLoaded(true)
  }, [searchParams])

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, isLoaded, router])

  // --- Šupa parametri ---
  const [width, setWidth] = useState(5)
  const [length, setLength] = useState(6)
  const [height, setHeight] = useState(2.5)
  const [padKrova, setPadKrova] = useState(1)
  const [pricePerKg, setPricePerKg] = useState(1.6)
  const [cenaMaterijalaPoKg, setCenaMaterijalaPoKg] = useState(0.85)
  const [projectName, setProjectName] = useState('')
  const [povrsinaHale, setPovrsinaHale] = useState(0)
  const [povrsinaKrova, setPovrsinaKrova] = useState(0)
  const [cenaLimaPoKg, setCenaLimaPoKg] = useState(0)
  const [cenaPanelPoM2, setCenaPanelPoM2] = useState(0)
  const [copiedNotification, setCopiedNotification] = useState(false)
  const [dimenzijeInput, setDimenzijeInput] = useState('')
  const [dimenzijeError, setDimenzijeError] = useState(null)
  const [dimenzijeConfirmed, setDimenzijeConfirmed] = useState(false)

  const applyDimenzije = (input) => {
    const trimmed = input.trim()
    if (!trimmed) {
      setDimenzijeError(null)
      setDimenzijeInput('')
      return
    }
    const result = parseDimenzije(input)
    if (result.error) {
      setDimenzijeError(result.error)
      setDimenzijeInput(dimenzijeConfirmed ? formatDimenzije(length, width, height) : '')
      return
    }
    const { length: newLength, width: newWidth, height: newHeight } = result
    if (newLength !== length) setBrojBindera(null)
    setLength(newLength)
    setWidth(newWidth)
    setHeight(newHeight)
    setDimenzijeInput(formatDimenzije(newLength, newWidth, newHeight))
    setDimenzijeError(null)
    setDimenzijeConfirmed(true)
  }

  const handleDimenzijeBlur = () => applyDimenzije(dimenzijeInput)

  // --- Stubovi ---
  const [selectedStubIndex, setSelectedStubIndex] = useState(0)
  const [includeAnkerPloca, setIncludeAnkerPloca] = useState(false)
  const [includeAnkerSraf, setIncludeAnkerSraf] = useState(true)

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
  
  // Predloženi index - uvek druga opcija (indeks 1), ili prva ako ima samo jedna opcija
  const suggestedStubIndex = dostupniStubovi.length > 1 ? 1 : 0

  // Kada se promeni visina hale, automatski postavi predloženu opciju (druga opcija)
  useEffect(() => {
    if (dostupniStubovi.length > 0) {
      if (dostupniStubovi.length > 1) {
        setSelectedStubIndex(1) // Druga opcija
      } else {
        setSelectedStubIndex(0) // Prva opcija ako ima samo jedna
      }
    }
  }, [height, dostupniStubovi.length])

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
    if (shedWidth < 14) return '12'
    if (shedWidth < 16) return '14'
    return '16'
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

  // Izračunaj predloženi broj bindera (minimum 2)
  const suggestedBrojBindera = Math.max(2, Math.ceil(length / 4) + 1)

  // Koristi korisnikov unos ili predloženu vrednost (minimum 2)
  const finalBrojBindera = Math.max(2, brojBindera !== null ? brojBindera : suggestedBrojBindera)
  
  // Izračunaj razmak između stubova (razmak = dužina / (broj bindera - 1))
  const razmakIzmedjuStubova = finalBrojBindera > 1 ? length / (finalBrojBindera - 1) : length
  
  // Automatski određuj predloženi tip rožnjače na osnovu razmaka između stubova
  const suggestedTipRoznjace = useMemo(() => {
    if (razmakIzmedjuStubova <= 3) {
      return '60x40'
    } else if (razmakIzmedjuStubova <= 4) {
      return '80x40'
    } else {
      return '100x50'
    }
  }, [razmakIzmedjuStubova])
  
  // Kada se promeni razmak između stubova, automatski ažuriraj tip rožnjače
  useEffect(() => {
    setTipRoznjace(suggestedTipRoznjace)
  }, [suggestedTipRoznjace])

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
    
    // Anker šraf cena (po dimenzijama stubova)
    const ankerSrafData = ANKER_SRAFO_CENA.find(item => item.tip === selectedStub.tip) || null
    const ankerSrafCena = ankerSrafData?.cena || 0
    const ukupnaCenaAnkerSraf = includeAnkerSraf ? ankerSrafCena * brojStubova : 0

    const ukupnaCenaStubova = brojStubova * (cenaOsnovneTezine + cenaDodatneTezine + cenaPloca) + ukupnaCenaAnkerPloca + ukupnaCenaAnkerSraf
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
    const ukupnaCenaBezAnkerPloca = ukupnaCenaStubova + ukupnaCenaBindera + ukupnaCenaRoznjaca - ukupnaCenaAnkerPloca - ukupnaCenaAnkerSraf
    const ukupnaCenaPreZaokruzivanja = ukupnaCenaStubova + ukupnaCenaBindera + ukupnaCenaRoznjaca
    const ukupnaCena = roundUpTo50(ukupnaCenaPreZaokruzivanja)

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
      ankerSrafCena,
      ankerSrafData,
      ukupnaCenaAnkerSraf,
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
  }, [length, selectedStub, width, binderType, padKrova, pricePerKg, cenaMaterijalaPoKg, tipRoznjace, finalBrojBindera, includeAnkerPloca, includeAnkerSraf, cenaLimaPoKg, cenaPanelPoM2, povrsinaKrova])

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
      if (includeAnkerSraf && calculations.ankerSrafCena > 0) {
        const ankerSrafDataForPDF = ANKER_SRAFO_CENA.find(item => item.tip === selectedStub.tip)
        if (ankerSrafDataForPDF) {
          doc.text(`Anker šrafovi (${selectedStub.tip}): ${calculations.ankerSrafCena}€ po komadu`, 20, currentYPos)
          doc.text(`Opis: ${formatAnkerSrafOpis(ankerSrafDataForPDF)}`, 20, currentYPos + 5)
          doc.text(`Ukupna cena anker šrafova: ${calculations.ukupnaCenaAnkerSraf.toFixed(2)}€`, 20, currentYPos + 10)
          currentYPos += 15
        }
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
        doc.text(`Tip: ${binderType === 'standardni' ? 'Standardna nosivost' : 'Veća nosivost'}`, 20, yPos)
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

    ponudaText += `Cena konstrukcije ${length}m x ${width}m x ${height}m na ${padKrova === 1 ? 'jednu vodu' : 'dve vode'} je: ${formatPrice(calculations.ukupnaCena)}€`
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

    if (includeAnkerSraf) {
      ponudaText += `Uz konstrukciju dolaze šrafovi za bindere i anker šrafovi za beton (${formatAnkerSrafOpis(calculations.ankerSrafData)}). Takođe dolazi tehnički crtež sa dimenzijama i rasporedom montaže stubova.\n\n`
    }

    ponudaText += 'Kompletna konstrukcija je zaštićena i ofarbana u dve ruke osnovnom antikorozivnom farbom.\n\n'

    ponudaText += 'Prevoz i montaža nisu uključeni u cenu.\nMontažu ne radimo, ali po potrebi možemo organizovati prevoz.\n\n'
    ponudaText += 'Naša proizvodnja je u Čačku\n\nhttps://maps.app.goo.gl/4Gc6WEnsANG1E5Ya7'

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

  const kreirajProjekatIzKalkulatora = async (e) => {
    e.preventDefault()
    const slika3D = (await capture3DRef.current?.()) || null
    const detalji = {
      dimenzije: { length, width, height },
      padKrova: padKrova === 1 ? 'jedna voda' : 'dve vode',
      brojStubova: calculations.brojStubova,
      brojBindera: calculations.brojBindera,
      ukupanBrojRoznjaca: calculations.ukupanBrojRoznjaca,
      tipStubova: selectedStub ? `${selectedStub.tip} x ${selectedStub.debljina}` : null,
      tipBindera: binderData && dostupniBinderi.length > 0 ? `${dostupniBinderi[0].tip} x ${dostupniBinderi[0].debljina}` : null,
      tipRoznjaca: tipRoznjace ? `${tipRoznjace} x 2.8mm` : null,
      ukupnaTezina: calculations.ukupnaTezina,
      ukupnaTezinaStubova: calculations.ukupnaTezinaStubova,
      ukupnaTezinaBindera: calculations.ukupnaTezinaBindera,
      ukupnaTezinaRoznjaca: calculations.ukupnaTezinaRoznjaca,
      ukupnaCena: calculations.ukupnaCena,
      cenaPoMetru: calculations.cenaPoMetru,
      cenaStubova: calculations.ukupnaCenaStubova,
      cenaBindera: calculations.ukupnaCenaBindera,
      cenaRoznjaca: calculations.ukupnaCenaRoznjaca,
      includeAnkerPloca,
      includeAnkerSraf,
      ukupnaCenaAnkerPloca: calculations.ukupnaCenaAnkerPloca,
      ukupnaCenaAnkerSraf: calculations.ukupnaCenaAnkerSraf,
    }
    const novi = {
      id: crypto.randomUUID(),
      naziv: kreirajNaziv.trim() || 'Projekat iz kalkulatora',
      dimenzije: `${length} x ${width} x ${height}`,
      napomena: kreirajNapomena.trim() || null,
      mobil: kreirajMobil.trim() || null,
      datumPocetka: kreirajDatumPocetka || null,
      rok: kreirajRok || null,
      status: 'novo',
      datumKreiranja: new Date().toISOString(),
      datumAzuriranja: new Date().toISOString(),
      detalji,
      slika3D,
    }
    try {
      await addProjekat(novi)
      setShowKreirajModal(false)
      setKreirajNaziv('')
      setKreirajRok('')
      setKreirajDatumPocetka((() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      })())
      setKreirajMobil('')
      setKreirajNapomena('')
      router.push('/admin/projekti')
    } catch (err) {
      console.error('Greška pri kreiranju projekta:', err)
      alert('Greška pri kreiranju projekta. Proverite internet konekciju i Supabase podešavanja.')
    }
  }

  if (!isLoaded || !isAdmin) {
    return null
  }

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen font-sans text-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Kalkulator</h1>

      {/* Hale parametri */}
      <section className="mb-4 p-4 rounded-lg shadow-md" style={{ backgroundColor: '#F0F0F0' }}>
        <h2 className="text-lg font-semibold mb-2">Parametri hale</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col text-sm">
            Dimenzije hale (D × Š × V)
            <input
              type="text"
              className={`mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${dimenzijeError ? 'border-red-500' : ''}`}
              value={dimenzijeInput}
              onChange={e => {
                setDimenzijeInput(e.target.value)
                setDimenzijeError(null)
              }}
              onBlur={handleDimenzijeBlur}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyDimenzije(dimenzijeInput)
                  e.target.blur()
                }
              }}
              placeholder="npr. 20x6x3"
            />
            {dimenzijeError ? (
              <p className="text-xs text-red-600 mt-1">{dimenzijeError}</p>
            ) : dimenzijeConfirmed ? (
              <p className="text-xs text-gray-600 mt-1">
                Dužina: <strong>{length}m</strong> · Širina: <strong>{width}m</strong> · Visina: <strong>{height}m</strong>
              </p>
            ) : null}
          </label>
          <label className="flex flex-col text-sm">
            Pad krova
            <select className="mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900" value={padKrova} onChange={e => setPadKrova(parseInt(e.target.value))}>
              <option value={1}>Jedna voda</option>
              <option value={2}>Dve vode</option>
            </select>
          </label>
        </div>
        {isAdmin && (
          <div className="mt-3 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={copyPonudaToClipboard}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copiedNotification ? 'Kopirano!' : 'Kopiraj ponudu'}
            </button>
            <div className="flex w-full max-w-md gap-2">
              <button
                type="button"
                onClick={() => scrollToSection('sekcija-ponuda')}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Idi na ponudu
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('sekcija-3d')}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Idi na 3D prikaz
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Stubovi, Binderi i Roznjace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Stubovi */}
        <section className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'rgba(185, 28, 28, 0.1)' }}>
          <h2 className="text-lg font-semibold mb-2">Stubovi</h2>
          {isAdmin && (<div className="mb-2">
            <p className="text-sm text-gray-600">
              Visina hale: <strong>{height}m</strong> → Dužina stuba: <strong>{stubDuzina}m</strong>
            </p>
          </div>)}
          <div className="grid grid-cols-1 gap-3">
            <label className="flex flex-col text-sm">
              Tip stuba i debljina
              <select
                className="mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 w-full"
                value={selectedStubIndex}
                onChange={e => setSelectedStubIndex(parseInt(e.target.value))}
              >
                {dostupniStubovi.map((stub, index) => {
                  return (
                    <option key={index} value={index}>
                      {stub.tip} x {stub.debljina} {index === suggestedStubIndex ? '(predloženo)' : ''}
                    </option>
                  )
                })}
              </select>
              {dostupniStubovi.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Predloženo: {dostupniStubovi[suggestedStubIndex]?.tip} x {dostupniStubovi[suggestedStubIndex]?.debljina}
                </p>
              )}
            </label>
          </div>
          {selectedStub && (
            <div className="mt-2 space-y-2">
              {isAdmin && (
                <div className="p-2 bg-gray-100 rounded-md">
                  <p className="text-sm">
                    <strong>Izabrano:</strong> {selectedStub.tip} x {selectedStub.debljina} (dužina: {stubDuzina}m) - {selectedStub.tezina}kg
                    {selectedStub.dodatnaTezina && ` + ${selectedStub.dodatnaTezina}kg = ${selectedStub.tezina + selectedStub.dodatnaTezina}kg`}
                    {' | '}Cena ploče: {selectedStub.ploca}€
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Binderi */}
        <section className="p-4 rounded-lg shadow-md" style={{ backgroundColor: '#F0F0F0' }}>
          <h2 className="text-lg font-semibold mb-2">Binderi/krovni nosač</h2>
          {isAdmin && (
            <div className="mb-2">
              <p className="text-sm text-gray-600">
                Širina hale: <strong>{width}m</strong> → Kategorija: <strong>{widthCategory}m</strong>
              </p>
            </div>
          )}
          <div className="mb-2">
            <label className="flex flex-col text-sm">
              Broj bindera
              <select
                className="mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 w-full"
                value={finalBrojBindera}
                onChange={e => {
                  const value = parseInt(e.target.value) || 2
                  setBrojBindera(value)
                }}
              >
                {(() => {
                  const minBroj = Math.max(2, suggestedBrojBindera - 2)
                  const maxBroj = suggestedBrojBindera + 2
                  const options = []
                  for (let i = minBroj; i <= maxBroj; i++) {
                    options.push(
                      <option key={i} value={i}>
                        {i} {i === suggestedBrojBindera ? '(predloženo)' : ''}
                      </option>
                    )
                  }
                  return options
                })()}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Predloženo: {suggestedBrojBindera} (izračunato na osnovu dužine: {length}m)
              </p>
            </label>
          </div>
          <div className="mb-2">
            <label className="flex flex-col text-sm">
              <span>Nosivost</span>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setBinderType('standardni')}
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    binderType === 'standardni'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Standardna nosivost
                </button>
                {hasBinderTypeOptions(widthCategory) && (
                  <button
                    type="button"
                    onClick={() => setBinderType('jaci')}
                    className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      binderType === 'jaci'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Veća nosivost
                  </button>
                )}
              </div>
            </label>
          </div>
          {binderData && (
            <div className="p-2 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-700 mb-1">
                Masa bindera: <strong>{binderData.masa}kg</strong>
              </p>
              <p className="text-sm text-gray-700 mb-2">
                Broj rožnjača po binderu: <strong>{binderData.roznjace?.[padKrova.toString()] || 0}</strong> kom ({padKrova === 1 ? '1 voda' : '2 vode'})
              </p>
              {dostupniBinderi.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold text-sm mb-1 text-gray-900">Profili bindera:</p>
                  <ul className="space-y-1">
                    {dostupniBinderi.map((binder, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        • {binder.tip} x {binder.debljina} - {binder.duzina}m
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Roznjace */}
        <section className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'rgba(185, 28, 28, 0.1)' }}>
          <h2 className="text-lg font-semibold mb-2">Rožnjače/krovna letva</h2>
          {isAdmin && (
            <div className="mb-2">
              <p className="text-sm text-gray-600">
                Broj rožnjača po binderu: <strong>{binderData?.roznjace?.[padKrova.toString()] || 0}</strong> kom ({padKrova === 1 ? '1 voda' : '2 vode'})
                {' × '}Dužina hale: <strong>{length}m</strong> = <strong>{(binderData?.roznjace?.[padKrova.toString()] || 0) * length}</strong> kom ukupno
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3">
            <label className="flex flex-col text-sm">
              Tip rožnjače
              <select
                className="mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 w-full"
                value={tipRoznjace}
                onChange={e => setTipRoznjace(e.target.value)}
              >
                {Object.keys(ROZNJACE).map(tip => (
                  <option key={tip} value={tip}>
                    {tip} x 2.8mm {tip === suggestedTipRoznjace ? '(predloženo)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Predloženo: {suggestedTipRoznjace} x 2.8mm (razmak između stubova: {razmakIzmedjuStubova.toFixed(2)}m)
              </p>
            </label>
          </div>
          {tipRoznjace && ROZNJACE[tipRoznjace] && isAdmin && (
            <div className="mt-2 p-2 bg-gray-100 rounded-md">
              <p className="text-sm">
                <strong>Izabrano:</strong> {tipRoznjace} x 2.8mm
                {' | '}Masa: {ROZNJACE[tipRoznjace]['2.8'].masa}kg po komadu
                {' | '}Cena: {ROZNJACE[tipRoznjace]['2.8'].cenaPoMetru}€ po metru
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Opcije ankerisanja */}
      {selectedStub && (ANKER_PLOCA_CENA[selectedStub.tip] || ANKER_SRAFO_CENA.find(item => item.tip === selectedStub.tip)) && (() => {
        const ankerSrafDataForDisplay = ANKER_SRAFO_CENA.find(item => item.tip === selectedStub.tip) || null
        return (
        <section className="mb-4 p-4 rounded-lg shadow-md" style={{ backgroundColor: '#F0F0F0' }}>
          <h2 className="text-lg font-semibold mb-2">Opcije ankerisanja</h2>
          <div className="space-y-2">
            <div className="p-2 bg-gray-100 rounded-md">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAnkerPloca}
                  onChange={e => {
                    setIncludeAnkerPloca(e.target.checked)
                    if (e.target.checked) {
                      setIncludeAnkerSraf(false) // Isključi anker šrafove ako se anker ploča izabere
                    }
                  }}
                  className="w-4 h-4 text-red-700 border-gray-300 rounded focus:ring-red-500 mt-1"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    Anker ploča za betoniranje: <strong>{ANKER_PLOCA_CENA[selectedStub.tip]}€ po stubu</strong>
                  </span>
                  <p className="text-xs text-gray-600 mt-1 ml-6">
                    Opis: Navoj M18 8,8 kvalitet, 30cm dužina
                  </p>
                  {includeAnkerPloca && (
                    <p className="text-xs text-red-700 mt-1 ml-6">
                      (Ukupno: {ANKER_PLOCA_CENA[selectedStub.tip] * calculations.brojStubova}€)
                    </p>
                  )}
                </div>
              </label>
            </div>
            <div className="p-2 bg-gray-100 rounded-md">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAnkerSraf}
                  onChange={e => {
                    setIncludeAnkerSraf(e.target.checked)
                    if (e.target.checked) {
                      setIncludeAnkerPloca(false) // Isključi anker ploču ako se anker šrafovi izaberu
                    }
                  }}
                  className="w-4 h-4 text-red-700 border-gray-300 rounded focus:ring-red-500 mt-1"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    Anker šrafovi: <strong>{ankerSrafDataForDisplay ? ankerSrafDataForDisplay.cena : 0}€ po stubu</strong>
                  </span>
                  {ankerSrafDataForDisplay && (
                    <p className="text-xs text-gray-600 mt-1 ml-6">
                      Opis: {formatAnkerSrafOpis(ankerSrafDataForDisplay)}
                    </p>
                  )}
                  {includeAnkerSraf && ankerSrafDataForDisplay && (
                    <p className="text-xs text-red-700 mt-1 ml-6">
                      (Ukupno: {ankerSrafDataForDisplay.cena * calculations.brojStubova}€)
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>
        </section>
        )
      })()}

      {/* Ponuda */}
      {isAdmin && (
      <section id="sekcija-ponuda" className="mb-4 p-4 rounded-lg shadow-md scroll-mt-4" style={{ backgroundColor: '#F0F0F0' }}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
          <h2 className="text-lg font-semibold">Ponuda</h2>
          {isAdmin && <button
            key="copy-ponuda"
            type="button"
            onClick={copyPonudaToClipboard}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2 self-center sm:self-auto shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copiedNotification ? 'Kopirano!' : 'Kopiraj ponudu'}
          </button>}
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="space-y-2 text-sm leading-relaxed whitespace-pre-line">
            <p>
              <strong>Cena konstrukcije {length}m x {width}m x {height}m na {padKrova == 1 ? (<>jednu vodu</>) : (<>dve vode</>)} je: {formatPrice(calculations.ukupnaCena)}€</strong>.
            </p>

            <div className="mt-2">
              <p className="font-semibold mb-1">Profili za konstrukciju:</p>
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

            <p className="mt-2">
              Ukupno ima <strong>{calculations.brojStubova} stubova</strong> i <strong>{calculations.brojBindera} bindera</strong>.
            </p>

            <p className="mt-2">
              Stubovi i binderi se spajaju šrafovima, dok se rožnjače vare za L-profile koji su postavljeni na bindere.
            </p>

            {includeAnkerSraf && (
              <p className="mt-2">
                Uz konstrukciju dolaze šrafovi za bindere i anker šrafovi za beton ({formatAnkerSrafOpis(calculations.ankerSrafData)}). Takođe dolazi tehnički crtež sa dimenzijama i rasporedom montaže stubova.
              </p>
            )}

            <p className="mt-2">
              Kompletna konstrukcija je zaštićena i ofarbana u dve ruke osnovnom antikorozivnom farbom.
            </p>

            <p className="mt-2">
              Prevoz i montaža nisu uključeni u cenu.
              Montažu ne radimo, ali po potrebi možemo organizovati prevoz.
            </p>

            <p className="mt-2">
              Naša proizvodnja je u Čačku
            </p>
            <p className="mt-1">
              <a
                href="https://maps.app.goo.gl/4Gc6WEnsANG1E5Ya7"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-700 underline break-all"
              >
                https://maps.app.goo.gl/4Gc6WEnsANG1E5Ya7
              </a>
            </p>
          </div>
        </div>
      </section>
      )}

      {/* Rezultati */}
      <section className="mb-4 p-4 rounded-lg shadow-md" style={{ backgroundColor: 'rgba(185, 28, 28, 0.1)' }}>
        <h2 className="text-lg font-semibold mb-2">Rezultati</h2>
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <div className="p-2 bg-gray-50 rounded-md shadow-sm text-sm">
              <h3 className="font-semibold mb-1">Stubovi</h3>
              <ul className="space-y-1">
                <li>Broj stubova: {calculations.brojStubova}</li>
                <li>Razmak između stubova: {calculations.brojBindera > 1 ? formatPrice(length / (calculations.brojBindera - 1)) : formatPrice(0)} m</li>
                <li>Težina po stubu: {calculations.tezinaStuba} kg</li>
                <li>Ukupna težina: {calculations.ukupnaTezinaStubova.toFixed(2)} kg</li>
                <li>Ukupna cena: {formatPrice(calculations.ukupnaCenaStubova)} €</li>
              </ul>
            </div>
            <div className="p-2 bg-gray-50 rounded-md shadow-sm text-sm">
              <h3 className="font-semibold mb-1">Binderi</h3>
              <ul className="space-y-1">
                <li>Broj bindera: {calculations.brojBindera}</li>
                <li>Težina: {calculations.tezinaBindera} kg</li>
                <li>Ukupna težina: {calculations.ukupnaTezinaBindera.toFixed(2)} kg</li>
                <li>Cena: {formatPrice(calculations.ukupnaCenaBindera)} €</li>
              </ul>
            </div>
            <div className="p-2 bg-gray-50 rounded-md shadow-sm text-sm">
              <h3 className="font-semibold mb-1">Rožnjače</h3>
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
        <div className="p-3 bg-gray-100 rounded-md shadow-sm text-sm">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Okvirna cena konstrukcije</h3>
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(calculations.ukupnaCena)} €
            </div>
          </div>
          
          <div className="mb-2 border-t pt-2">
            <p className="font-semibold text-gray-800 mb-1">Šta ulazi u cenu:</p>
            <ul className="space-y-0.5 text-gray-700">
              <li>• <strong>{calculations.brojStubova} stubova</strong> ({selectedStub?.tip} x {selectedStub?.debljina})</li>
              <li>• <strong>{calculations.brojBindera} bindera</strong> {binderData && dostupniBinderi.length > 0 && `(${dostupniBinderi[0].tip} x ${dostupniBinderi[0].debljina})`}</li>
              <li>• <strong>{calculations.ukupanBrojRoznjaca} metara rožnjača</strong> {tipRoznjace && ROZNJACE[tipRoznjace] && `(${tipRoznjace} x 2.8mm)`}</li>
              {includeAnkerPloca && calculations.ukupnaCenaAnkerPloca > 0 && (
                <li>• <strong>{calculations.brojStubova} anker ploča</strong> (Navoj M18 8,8 kvalitet, 30cm dužina)</li>
              )}
              {includeAnkerSraf && calculations.ukupnaCenaAnkerSraf > 0 && calculations.ankerSrafData && (
                <li>• <strong>{calculations.brojStubova} anker šrafova</strong> ({formatAnkerSrafOpis(calculations.ankerSrafData)})</li>
              )}
            </ul>
          </div>

          {isAdmin && (
            <div className="mb-2 border-t pt-2 text-sm text-gray-600">
              <p>Cena po metru kvadratnom: {formatPrice(calculations.cenaPoMetru)} €/m²</p>
              <p>Ukupna težina: {formatPrice(calculations.ukupnaTezina)} kg</p>
            </div>
          )}

          <div className="border-t pt-2">
            <p className="text-sm text-gray-600 italic"><strong>Napomena:</strong></p>
            <ul className="list-disc list-inside">
              <li>Prikazana cena je okvirna i može varirati.</li>
              <li>Za preciznu cenu i finalnu ponudu, molimo kontaktirajte nas.</li>
              <li>Prevoz i montaza nisu ukljuceni u cenu.</li>
              <li><strong>Montažu ne radimo</strong>, ali po potrebi možemo organizovati prevoz.</li>
              <li>Rok isporuke je od 2 do 4 nedelje</li>
            </ul>
          </div>

        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-md shadow-md hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Izvezi u PDF
              </button>
              <button
                onClick={() => setShowKreirajModal(true)}
                className="px-4 py-2 bg-red-700 text-white text-sm font-semibold rounded-md shadow-md hover:bg-red-800 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Kreiraj projekat
              </button>
            </>
          )}
        </div>
      </section>

      {/* 3D Vizualizacija */}
      <section id="sekcija-3d" className="mb-4 p-4 rounded-lg shadow-md scroll-mt-4" style={{ backgroundColor: '#F0F0F0' }}>
        <h2 className="text-lg font-semibold mb-2">3D Vizualizacija hale</h2>
        <p className="text-sm text-gray-600 mb-2">
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
            brojRoznjacaPoBinderu={binderData?.roznjace?.[padKrova.toString()] || 0}
            ukupanBrojRoznjaca={calculations.ukupanBrojRoznjaca}
            binderProfili={dostupniBinderi}
            onCaptureReady={(fn) => { capture3DRef.current = fn }}
          />
        </div>
      </section>

      {isAdmin && (
        <section className="mb-4 p-4 rounded-lg shadow-md" style={{ backgroundColor: 'rgba(185, 28, 28, 0.3)' }}>
          <h2 className="text-lg font-semibold mb-2">Dodatni troškovi: Kalkulacija</h2>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label className="flex flex-col text-sm">
              Povrsina krova (m²):
              <input
                type="number"
                step="1"
                min="0"
                max="5000"
                className="mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                value={povrsinaKrova}
                onChange={e => setPovrsinaKrova(parseInt(e.target.value))}
              />
            </label>
            <label className="flex flex-col text-sm">
              Cena lima po kg (€/kg):
              <input
                type="number"
                step="0.1"
                min="0"
                max="1000"
                className="mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                value={cenaLimaPoKg}
                onChange={e => setCenaLimaPoKg(parseFloat(e.target.value))}
              />
            </label>
            <label className="flex flex-col text-sm">
              Cena panela po m² (€/m²):
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                className="mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                value={cenaPanelPoM2}
                onChange={e => setCenaPanelPoM2(parseFloat(e.target.value))}
              />
            </label>
            <div className="p-2 col-span-full bg-gray-100 rounded-md shadow-sm font-bold text-sm text-gray-800">
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
        <section className="mb-4 p-4 rounded-lg shadow-md" style={{ backgroundColor: '#F0F0F0' }}>
          <h2 className="text-lg font-semibold mb-2">Ostali parametri</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <label className="flex flex-col text-sm">
            Cena materijala po kg (€/kg)
            <input
              type="number"
              step="0.05"
              className="mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              value={cenaMaterijalaPoKg}
              onChange={e => setCenaMaterijalaPoKg(parseFloat(e.target.value) || 0)}
            />
          </label>
          <label className="flex flex-col text-sm">
            Naziv projekta (za PDF)
            <input
              type="text"
              className="mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="Unesite naziv projekta (opciono)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Naziv će biti uključen u ime PDF fajla
            </p>
          </label>
          <label className="flex flex-col text-sm">
            Cena po kg (€/kg)
            <input
              type="number"
              step="0.05"
              className="mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              value={pricePerKg}
              onChange={e => setPricePerKg(parseFloat(e.target.value) || 0)}
            />
          </label>
          <label className="flex flex-col text-sm">
            Površina hale (m²)
            <div className="mt-1 p-1.5 border rounded-md bg-gray-50 font-bold text-sm">
              {calculations.povrsinaHale}m²
            </div>
          </label>
        </div>
      </section>
      )}

      {/* Modal Kreiraj projekat */}
      {showKreirajModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Kreiraj projekat iz kalkulatora</h2>
            <p className="text-sm text-gray-600 mb-4">
              Svi podaci (dimenzije, stubovi, binderi, rožnjače, cene) će biti sačuvani u projekat. Uključena je i 3D vizualizacija.
            </p>
            <form onSubmit={kreirajProjekatIzKalkulatora} className="space-y-4">
              <label className="flex flex-col">
                Naziv projekta *
                <input
                  type="text"
                  value={kreirajNaziv}
                  onChange={(e) => setKreirajNaziv(e.target.value)}
                  placeholder="npr. Hala za Jovanovića"
                  className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </label>
              <label className="flex flex-col">
                Datum početka
                <input
                  type="date"
                  value={kreirajDatumPocetka}
                  onChange={(e) => setKreirajDatumPocetka(e.target.value)}
                  className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </label>
              <label className="flex flex-col">
                Mobilni telefon
                <input
                  type="tel"
                  value={kreirajMobil}
                  onChange={(e) => setKreirajMobil(e.target.value)}
                  placeholder="npr. 063 123 4567"
                  className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </label>
              <label className="flex flex-col">
                Napomena
                <input
                  type="text"
                  value={kreirajNapomena}
                  onChange={(e) => setKreirajNapomena(e.target.value)}
                  placeholder="Opciono"
                  className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </label>
              <label className="flex flex-col">
                Rok do kada treba da se završi
                <input
                  type="date"
                  value={kreirajRok}
                  onChange={(e) => setKreirajRok(e.target.value)}
                  className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-700 text-white rounded-md font-medium hover:bg-red-800"
                >
                  Kreiraj
                </button>
                <button
                  type="button"
                  onClick={() => {
                  setShowKreirajModal(false)
                  setKreirajNaziv('')
                  setKreirajRok('')
                  const d = new Date()
                  setKreirajDatumPocetka(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
                  setKreirajMobil('')
                  setKreirajNapomena('')
                }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300"
                >
                  Otkaži
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}



