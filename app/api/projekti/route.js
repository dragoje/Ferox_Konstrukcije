import { createSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('projekti')
      .select('*')
      .order('datum_kreiranja', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const projekti = (data || []).map((row) => ({
      id: row.id,
      naziv: row.naziv,
      dimenzije: row.dimenzije,
      napomena: row.napomena || '',
      mobil: row.mobil || '',
      rok: row.rok,
      datumPocetka: row.datum_pocetka,
      status: row.status,
      datumKreiranja: row.datum_kreiranja,
      datumAzuriranja: row.datum_azuriranja,
      detalji: row.detalji,
      slika3D: row.slika_3d,
      todos: row.todos || [],
    }))

    return NextResponse.json(projekti)
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const supabase = createSupabaseClient()

    const row = {
      naziv: body.naziv || 'Projekat bez naziva',
      dimenzije: body.dimenzije || '',
      napomena: body.napomena || null,
      mobil: body.mobil || null,
      rok: body.rok || null,
      datum_pocetka: body.datumPocetka || null,
      status: body.status || 'novo',
      datum_kreiranja: body.datumKreiranja || new Date().toISOString(),
      datum_azuriranja: body.datumAzuriranja || new Date().toISOString(),
      detalji: body.detalji || null,
      slika_3d: body.slika3D || null,
      todos: body.todos || [],
    }

    if (body.id) row.id = body.id

    const { data, error } = await supabase.from('projekti').insert(row).select().single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      id: data.id,
      naziv: data.naziv,
      dimenzije: data.dimenzije,
      napomena: data.napomena || '',
      mobil: data.mobil || '',
      rok: data.rok,
      datumPocetka: data.datum_pocetka,
      status: data.status,
      datumKreiranja: data.datum_kreiranja,
      datumAzuriranja: data.datum_azuriranja,
      detalji: data.detalji,
      slika3D: data.slika_3d,
      todos: data.todos || [],
    })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
