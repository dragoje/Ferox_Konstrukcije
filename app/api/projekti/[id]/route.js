import { createSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = createSupabaseClient()

    const updates = {}
    if (body.status !== undefined) updates.status = body.status
    if (body.todos !== undefined) updates.todos = body.todos
    updates.datum_azuriranja = body.datumAzuriranja || new Date().toISOString()

    const { data, error } = await supabase
      .from('projekti')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

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

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const supabase = createSupabaseClient()

    const { error } = await supabase.from('projekti').delete().eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
