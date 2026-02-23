'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProjekti, addProjekat, updateProjekat, deleteProjekat } from '@/lib/projektiStorage'
import ProjektiKalendar from './ProjektiKalendar'

const STATUSI = [
  { id: 'novo', label: 'Novo', color: 'text-blue-700 border-blue-300' },
  { id: 'aktivan', label: 'Aktivan', color: 'text-amber-700 border-amber-300' },
  { id: 'zavrseno', label: 'Završen', color: 'text-green-700 border-green-300' },
]

export default function Projekti() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [projekti, setProjekti] = useState([])
  const [filterStatus, setFilterStatus] = useState('svi')
  const [pretraga, setPretraga] = useState('')
  const [showForma, setShowForma] = useState(false)
  const [detaljiProjekat, setDetaljiProjekat] = useState(null)
  const [noviTodo, setNoviTodo] = useState('')
  const [obrisiProjekatId, setObrisiProjekatId] = useState(null)
  const [izabraniDatum, setIzabraniDatum] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const danasStr = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const [forma, setForma] = useState({
    naziv: '',
    duzina: 6,
    sirina: 5,
    visina: 2.5,
    napomena: '',
    mobil: '',
    datumPocetka: '',
    rok: '',
  })

  useEffect(() => {
    const savedAdmin = localStorage.getItem('kalkulator_admin')
    setIsAdmin(savedAdmin === 'true')
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded && isAdmin) {
      setLoading(true)
      setError(null)
      getProjekti()
        .then((lista) => {
          const map = { dodato: 'novo', materijal_nabavljen: 'aktivan', nabavka: 'aktivan', u_izradi: 'aktivan', proizvodnja: 'aktivan', slanje: 'aktivan', isporuka: 'aktivan' }
          const migrirani = lista.map((p) => (map[p.status] ? { ...p, status: map[p.status] } : p))
          setProjekti(migrirani)
        })
        .catch((err) => setError(err?.message || 'Greška pri učitavanju'))
        .finally(() => setLoading(false))
    }
  }, [isLoaded, isAdmin])

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, isLoaded, router])

  const dodajProjekat = async (e) => {
    e.preventDefault()
    const dimenzije = [forma.duzina, forma.sirina, forma.visina].join(' x ')
    const novi = {
      id: crypto.randomUUID(),
      naziv: forma.naziv.trim() || 'Projekat bez naziva',
      dimenzije,
      napomena: forma.napomena.trim() || null,
      mobil: forma.mobil.trim() || null,
      datumPocetka: forma.datumPocetka || danasStr(),
      rok: forma.rok || null,
      status: 'novo',
      datumKreiranja: new Date().toISOString(),
      datumAzuriranja: new Date().toISOString(),
    }
    setLoading(true)
    try {
      const created = await addProjekat(novi)
      setProjekti([created, ...projekti])
      setForma({ naziv: '', duzina: 6, sirina: 5, visina: 2.5, napomena: '', mobil: '', datumPocetka: '', rok: '' })
      setShowForma(false)
    } catch (err) {
      setError(err?.message || 'Greška pri dodavanju')
    } finally {
      setLoading(false)
    }
  }

  const promeniStatus = async (id, noviStatus) => {
    const datumAzuriranja = new Date().toISOString()
    const novo = projekti.map((p) =>
      p.id === id ? { ...p, status: noviStatus, datumAzuriranja } : p
    )
    setProjekti(novo)
    try {
      await updateProjekat(id, { status: noviStatus, datumAzuriranja })
    } catch (err) {
      setError(err?.message || 'Greška pri ažuriranju')
      setProjekti(projekti)
    }
  }

  const azurirajTodos = async (id, newTodos) => {
    const datumAzuriranja = new Date().toISOString()
    const novo = projekti.map((p) =>
      p.id === id ? { ...p, todos: newTodos, datumAzuriranja } : p
    )
    setProjekti(novo)
    if (detaljiProjekat?.id === id) setDetaljiProjekat((d) => (d ? { ...d, todos: newTodos } : null))
    try {
      await updateProjekat(id, { todos: newTodos, datumAzuriranja })
    } catch (err) {
      setError(err?.message || 'Greška pri ažuriranju')
      getProjekti().then((lista) => {
        const map = { dodato: 'novo', materijal_nabavljen: 'aktivan', nabavka: 'aktivan', u_izradi: 'aktivan', proizvodnja: 'aktivan', slanje: 'aktivan', isporuka: 'aktivan' }
        setProjekti(lista.map((p) => (map[p.status] ? { ...p, status: map[p.status] } : p)))
      })
    }
  }

  const dodajTodo = () => {
    if (!detaljiProjekat || !noviTodo.trim()) return
    const todo = { id: crypto.randomUUID(), text: noviTodo.trim(), completed: false }
    const newTodos = [...(detaljiProjekat.todos || []), todo]
    azurirajTodos(detaljiProjekat.id, newTodos)
    setNoviTodo('')
  }

  const toggleTodo = (todoId) => {
    if (!detaljiProjekat) return
    const newTodos = (detaljiProjekat.todos || []).map((t) =>
      t.id === todoId ? { ...t, completed: !t.completed } : t
    )
    azurirajTodos(detaljiProjekat.id, newTodos)
  }

  const toggleTodoNaKartici = (projectId, todoId) => {
    const projekat = projekti.find((pr) => pr.id === projectId)
    if (!projekat?.todos?.length) return
    const newTodos = projekat.todos.map((t) =>
      t.id === todoId ? { ...t, completed: !t.completed } : t
    )
    azurirajTodos(projectId, newTodos)
  }

  const obrisiTodo = (todoId) => {
    if (!detaljiProjekat) return
    const newTodos = (detaljiProjekat.todos || []).filter((t) => t.id !== todoId)
    azurirajTodos(detaljiProjekat.id, newTodos)
  }

  const potvrdiBrisanje = async (id) => {
    const prethodno = projekti
    setProjekti(projekti.filter((p) => p.id !== id))
    setObrisiProjekatId(null)
    try {
      await deleteProjekat(id)
    } catch (err) {
      setError(err?.message || 'Greška pri brisanju')
      setProjekti(prethodno)
    }
  }

  const projekatObuhvataDan = (p, dan) => {
    const parseD = (iso) => {
      if (!iso) return null
      const s = String(iso)
      return new Date(s.includes('T') ? s : s + 'T12:00:00')
    }
    const start = parseD(p.datumKreiranja)
    const end = p.rok ? parseD(p.rok) : start
    if (!start) return false
    const d = new Date(dan.getFullYear(), dan.getMonth(), dan.getDate())
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    return d >= s && d <= e
  }

  const filtriraniProjekti = projekti.filter((p) => {
    const matchStatus = filterStatus === 'svi' || p.status === filterStatus
    const matchPretraga =
      !pretraga.trim() ||
      p.naziv.toLowerCase().includes(pretraga.toLowerCase()) ||
      p.dimenzije.toLowerCase().includes(pretraga.toLowerCase())
    const matchDatum = !izabraniDatum || projekatObuhvataDan(p, izabraniDatum)
    return matchStatus && matchPretraga && matchDatum
  })

  const formatDatum = (iso) => {
    if (!iso) return '-'
    const dateStr = String(iso).includes('T') ? iso : iso + 'T12:00:00'
    const d = new Date(dateStr)
    return d.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatRokDana = (iso) => {
    if (!iso) return '-'
    const dateStr = String(iso).includes('T') ? iso : iso + 'T23:59:59'
    const rok = new Date(dateStr)
    const danas = new Date()
    danas.setHours(0, 0, 0, 0)
    rok.setHours(0, 0, 0, 0)
    const razlika = Math.ceil((rok - danas) / (1000 * 60 * 60 * 24))
    if (razlika < 0) return 'Rok istekao'
    if (razlika === 0) return 'Danas'
    if (razlika === 1) return '1 dan'
    return `${razlika} dana`
  }

  const getStatusInfo = (statusId) => STATUSI.find((s) => s.id === statusId) || STATUSI[0]
  const normalizeStatus = (s) => ({ dodato: 'novo', materijal_nabavljen: 'aktivan', nabavka: 'aktivan', u_izradi: 'aktivan', proizvodnja: 'aktivan', slanje: 'aktivan', isporuka: 'aktivan' }[s] || s)

  const formatPrice = (value) => {
    if (value == null || typeof value !== 'number') return '-'
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Učitavanje...</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Upravljanje projektima</h1>

      <div className="mb-6">
        <ProjektiKalendar
          projekti={projekti}
          izabraniDatum={izabraniDatum}
          onDayClick={(dan) => {
            setIzabraniDatum((prev) =>
              prev && prev.getTime() === dan.getTime() ? null : dan
            )
          }}
        />
        {izabraniDatum && (
          <button
            type="button"
            onClick={() => setIzabraniDatum(null)}
            className="mt-2 text-xs text-gray-600 hover:text-gray-800 underline"
          >
            Prikaži sve projekte (filtrirano: {izabraniDatum.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })})
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Filteri i pretraga */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="svi">Svi statusi</option>
          {STATUSI.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Pretraži po nazivu ili dimenzijama..."
          value={pretraga}
          onChange={(e) => setPretraga(e.target.value)}
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          onClick={() => setShowForma(!showForma)}
          className="px-4 py-2 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
        >
          {showForma ? 'Otkaži' : '+ Novi projekat'}
        </button>
      </div>

      {/* Forma za dodavanje */}
      {showForma && (
        <form
          onSubmit={dodajProjekat}
          className="mb-8 p-6 rounded-lg shadow-md bg-white border border-gray-200"
        >
          <h2 className="text-xl font-semibold mb-4">Dodaj novi projekat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <label className="flex flex-col">
              Naziv projekta *
              <input
                type="text"
                value={forma.naziv}
                onChange={(e) => setForma((f) => ({ ...f, naziv: e.target.value }))}
                placeholder="npr. Hala za Jovanovića"
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </label>
            <label className="flex flex-col">
              Dužina (m)
              <select
                value={forma.duzina}
                onChange={(e) => setForma((f) => ({ ...f, duzina: parseFloat(e.target.value) }))}
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {Array.from({ length: 50 }, (_, i) => i + 1).map((val) => (
                  <option key={val} value={val}>{val}m</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col">
              Širina (m)
              <select
                value={forma.sirina}
                onChange={(e) => setForma((f) => ({ ...f, sirina: parseFloat(e.target.value) }))}
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {Array.from({ length: 8 }, (_, i) => 5 + i).map((val) => (
                  <option key={val} value={val}>{val}m</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col">
              Visina (m)
              <select
                value={forma.visina}
                onChange={(e) => setForma((f) => ({ ...f, visina: parseFloat(e.target.value) }))}
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {Array.from({ length: 8 }, (_, i) => 2.5 + i * 0.5).map((val) => (
                  <option key={val} value={val}>{val}m</option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col mb-2">
            Datum početka
            <input
              type="date"
              value={forma.datumPocetka || danasStr()}
              onChange={(e) => setForma((f) => ({ ...f, datumPocetka: e.target.value }))}
              className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </label>
          <label className="flex flex-col mb-2">
            Mobilni telefon
            <input
              type="tel"
              value={forma.mobil}
              onChange={(e) => setForma((f) => ({ ...f, mobil: e.target.value }))}
              placeholder="npr. 063 123 4567"
              className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </label>
          <label className="flex flex-col mb-2">
            Napomena
            <input
              type="text"
              value={forma.napomena}
              onChange={(e) => setForma((f) => ({ ...f, napomena: e.target.value }))}
              placeholder="Opciono"
              className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </label>
          <label className="flex flex-col mb-4">
            Rok (datum završetka)
            <input
              type="date"
              value={forma.rok}
              onChange={(e) => setForma((f) => ({ ...f, rok: e.target.value }))}
              className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800"
          >
            Dodaj projekat
          </button>
        </form>
      )}

      {/* Lista projekata */}
      <div className="space-y-4">
        {loading && projekti.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow border border-gray-200 text-gray-500">
            Učitavanje projekata...
          </div>
        ) : filtriraniProjekti.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow border border-gray-200 text-gray-500">
            {projekti.length === 0
              ? 'Nema projekata. Dodajte prvi projekat.'
              : 'Nema projekata koji odgovaraju filterima.'}
          </div>
        ) : (
          filtriraniProjekti.map((p) => {
            const statusInfo = getStatusInfo(p.status)
            return (
              <div
                key={p.id}
                className="relative p-4 sm:p-6 rounded-lg shadow-md bg-white border border-gray-200"
              >
                {/* Status u gornjem desnom uglu */}
                <div className="absolute top-3 right-3">
                  <select
                    value={normalizeStatus(p.status)}
                    onChange={(e) => promeniStatus(p.id, e.target.value)}
                    className={`appearance-none cursor-pointer pl-2 pr-6 py-1 rounded text-xs font-medium border bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 w-[82px] ${statusInfo.color}`}
                  >
                    {STATUSI.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <svg className="w-3 h-3 pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-current opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <div className="pr-20">
                  <h3 className="font-semibold text-gray-900 truncate">{p.naziv}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Dimenzije: {p.dimenzije}
                  </p>
                  {p.rok && (
                    <p className="mt-2">
                      <span className="inline-block px-2.5 py-1 rounded-md text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        Rok: {formatRokDana(p.rok)}
                      </span>
                    </p>
                  )}
                  {p.napomena && (
                    <p className="text-gray-500 mt-1 text-sm">Napomena: {p.napomena}</p>
                  )}
                  {p.todos && p.todos.length > 0 && (
                    <div className="mt-4 pt-3 flex flex-wrap gap-1.5 border-t border-gray-100">
                      {p.todos.map((t) => (
                        <label
                          key={t.id}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity ${
                            t.completed ? 'bg-green-50 text-green-700 line-through' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!t.completed}
                            onChange={() => toggleTodoNaKartici(p.id, t.id)}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                          />
                          {t.text}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setObrisiProjekatId(p.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Obriši"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDetaljiProjekat(p)}
                    className="px-3 py-1.5 text-sm bg-sky-50 text-sky-700 border border-sky-200 rounded-md hover:bg-sky-100 font-medium"
                  >
                    Detaljnije
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal potvrda brisanja */}
      {obrisiProjekatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-5 border border-gray-200">
            <p className="text-gray-700 mb-4">Da li ste sigurni da želite da obrišete ovaj projekat?</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setObrisiProjekatId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Otkaži
              </button>
              <button
                onClick={() => potvrdiBrisanje(obrisiProjekatId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detaljnije */}
      {detaljiProjekat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => { setDetaljiProjekat(null); setNoviTodo('') }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{detaljiProjekat.naziv}</h2>
              <button
                onClick={() => { setDetaljiProjekat(null); setNoviTodo('') }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {/* Todo lista - uvek na vrhu */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Lista zadataka</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={noviTodo}
                    onChange={(e) => setNoviTodo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), dodajTodo())}
                    placeholder="Dodaj novi zadatak..."
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                  />
                  <button
                    type="button"
                    onClick={dodajTodo}
                    className="px-3 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
                  >
                    Dodaj
                  </button>
                </div>
                <ul className="space-y-2">
                  {(detaljiProjekat.todos || []).map((t) => (
                    <li key={t.id} className="flex items-center gap-2 group">
                      <input
                        type="checkbox"
                        checked={!!t.completed}
                        onChange={() => toggleTodo(t.id)}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className={`flex-1 text-sm ${t.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {t.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => obrisiTodo(t.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Obriši"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
                {(!detaljiProjekat.todos || detaljiProjekat.todos.length === 0) && (
                  <p className="text-sm text-gray-500 italic">Nema zadataka. Dodajte prvi.</p>
                )}
              </div>

              {(detaljiProjekat.mobil || detaljiProjekat.napomena) && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Kontakt i napomena</h3>
                  <ul className="text-sm space-y-1 text-gray-700">
                    {detaljiProjekat.mobil && <li>Mobilni: {detaljiProjekat.mobil}</li>}
                    {detaljiProjekat.napomena && <li>Napomena: {detaljiProjekat.napomena}</li>}
                  </ul>
                </div>
              )}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                Kreirano: {formatDatum(detaljiProjekat.datumKreiranja)} • Ažurirano: {formatDatum(detaljiProjekat.datumAzuriranja)}
              </div>
              {detaljiProjekat.detalji ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Dimenzije i parametri</h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>Dimenzije: {detaljiProjekat.detalji.dimenzije ? `${detaljiProjekat.detalji.dimenzije.length}m x ${detaljiProjekat.detalji.dimenzije.width}m x ${detaljiProjekat.detalji.dimenzije.height}m` : detaljiProjekat.dimenzije}</li>
                      <li>Pad krova: {detaljiProjekat.detalji.padKrova || '-'}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Konstrukcija</h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>Stubovi: {detaljiProjekat.detalji.brojStubova} kom ({detaljiProjekat.detalji.tipStubova || '-'})</li>
                      <li>Binderi: {detaljiProjekat.detalji.brojBindera} kom ({detaljiProjekat.detalji.tipBindera || '-'})</li>
                      <li>Rožnjače: {detaljiProjekat.detalji.ukupanBrojRoznjaca} m ({detaljiProjekat.detalji.tipRoznjaca || '-'})</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cene</h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>Ukupna cena: {formatPrice(detaljiProjekat.detalji.ukupnaCena)} €</li>
                      <li>Cena po m²: {formatPrice(detaljiProjekat.detalji.cenaPoMetru)} €/m²</li>
                      <li>Stubovi: {formatPrice(detaljiProjekat.detalji.cenaStubova)} €</li>
                      <li>Binderi: {formatPrice(detaljiProjekat.detalji.cenaBindera)} €</li>
                      <li>Rožnjače: {formatPrice(detaljiProjekat.detalji.cenaRoznjaca)} €</li>
                      {detaljiProjekat.detalji.includeAnkerPloca && (
                        <li>Anker ploče: {formatPrice(detaljiProjekat.detalji.ukupnaCenaAnkerPloca)} €</li>
                      )}
                      {detaljiProjekat.detalji.includeAnkerSraf && (
                        <li>Anker šrafovi: {formatPrice(detaljiProjekat.detalji.ukupnaCenaAnkerSraf)} €</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Težina</h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>Stubovi: {formatPrice(detaljiProjekat.detalji.ukupnaTezinaStubova)} kg</li>
                      <li>Binderi: {formatPrice(detaljiProjekat.detalji.ukupnaTezinaBindera)} kg</li>
                      <li>Rožnjače: {formatPrice(detaljiProjekat.detalji.ukupnaTezinaRoznjaca)} kg</li>
                      <li className="font-medium pt-1">Ukupna težina: {formatPrice(detaljiProjekat.detalji.ukupnaTezina)} kg</li>
                    </ul>
                  </div>
                  {detaljiProjekat.slika3D && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">3D Vizualizacija</h3>
                      <img
                        src={detaljiProjekat.slika3D}
                        alt="3D vizualizacija hale"
                        className="max-w-full rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Ovaj projekat nema sačuvane detalje (kreiran ručno).</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
