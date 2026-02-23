const API = '/api/projekti'

function mapFromApi(row) {
  return {
    id: row.id,
    naziv: row.naziv,
    dimenzije: row.dimenzije,
    napomena: row.napomena || '',
    mobil: row.mobil || '',
    rok: row.rok,
    datumPocetka: row.datumPocetka,
    status: row.status,
    datumKreiranja: row.datumKreiranja,
    datumAzuriranja: row.datumAzuriranja,
    detalji: row.detalji,
    slika3D: row.slika3D,
    todos: Array.isArray(row.todos) ? row.todos : [],
  }
}

export async function getProjekti() {
  const res = await fetch(API)
  if (!res.ok) {
    let msg = await res.text()
    try {
      const j = JSON.parse(msg)
      msg = j.error || msg
    } catch {}
    throw new Error(msg || 'Greška pri učitavanju')
  }
  const data = await res.json()
  return Array.isArray(data) ? data.map(mapFromApi) : []
}

export async function saveProjekti(projekti) {
  for (const p of projekti) {
    try {
      await fetch(`${API}/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: p.status,
          datumAzuriranja: p.datumAzuriranja,
        }),
      })
    } catch (err) {
      console.error('saveProjekti error:', err)
    }
  }
}

export async function addProjekat(projekat) {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        id: projekat.id,
        naziv: projekat.naziv,
        dimenzije: projekat.dimenzije,
        napomena: projekat.napomena || null,
        mobil: projekat.mobil || null,
        rok: projekat.rok || null,
        datumPocetka: projekat.datumPocetka || null,
        status: projekat.status || 'novo',
        datumKreiranja: projekat.datumKreiranja,
        datumAzuriranja: projekat.datumAzuriranja,
        detalji: projekat.detalji || null,
        slika3D: projekat.slika3D || null,
      }),
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return mapFromApi(data)
  } catch (err) {
    console.error('addProjekat error:', err)
    throw err
  }
}

export async function updateProjekat(id, updates) {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return mapFromApi(data)
  } catch (err) {
    console.error('updateProjekat error:', err)
    throw err
  }
}

export async function deleteProjekat(id) {
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(await res.text())
    return true
  } catch (err) {
    console.error('deleteProjekat error:', err)
    throw err
  }
}
