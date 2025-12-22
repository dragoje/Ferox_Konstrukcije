import { Resend } from 'resend'

// API endpoint za slanje ponude
const resend = new Resend(process.env.RESEND_API_KEY)

// Funkcija za formatiranje email-a
function formatEmail(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #1a1a1a; }
        .value { margin-top: 5px; color: #666; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nova Ponuda sa Sajta</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Ime i Prezime:</div>
            <div class="value">${data.ime || 'Nije navedeno'}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${data.email || 'Nije navedeno'}</div>
          </div>
          <div class="field">
            <div class="label">Telefon:</div>
            <div class="value">${data.telefon || 'Nije navedeno'}</div>
          </div>
          ${data.tipHale ? `
          <div class="field">
            <div class="label">Tip Hale:</div>
            <div class="value">${data.tipHale}</div>
          </div>
          ` : ''}
          ${data.dimenzije ? `
          <div class="field">
            <div class="label">Dimenzije:</div>
            <div class="value">${data.dimenzije}</div>
          </div>
          ` : ''}
          <div class="field">
            <div class="label">Poruka:</div>
            <div class="value" style="white-space: pre-wrap;">${data.poruka || 'Nije navedeno'}</div>
          </div>
        </div>
        <div class="footer">
          <p>Ova poruka je poslata sa kontakt forme sajta Ferox Konstrukcije.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request) {
  try {
    const data = await request.json()

    // Validacija obaveznih polja
    if (!data.ime || !data.email || !data.telefon || !data.poruka) {
      return Response.json(
        { message: 'Sva obavezna polja moraju biti popunjena' },
        { status: 400 }
      )
    }

    // Slanje email-a
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Ferox Konstrukcije <onboarding@resend.dev>', // Resend default sender
        to: 'nikolaslavkovic95@gmail.com',
        replyTo: data.email, // Omogućava direktan odgovor korisniku
        subject: `Nova ponuda od ${data.ime}`,
        html: formatEmail(data),
      })
    } else {
      // Fallback: samo loguj ako nema API ključa (za development)
      console.log('RESEND_API_KEY nije postavljen. Email podaci:', data)
    }

    return Response.json(
      { message: 'Ponuda je uspešno poslata' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Greška pri slanju ponude:', error)
    return Response.json(
      { message: 'Greška pri slanju ponude. Molimo pokušajte ponovo.' },
      { status: 500 }
    )
  }
}

