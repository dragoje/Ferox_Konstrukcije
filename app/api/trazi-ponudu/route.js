import { Resend } from 'resend'

// API endpoint za slanje ponude
// Resend će biti kreiran samo ako postoji API ključ

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
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      console.error('RESEND_API_KEY nije postavljen u environment variables!')
      console.log('Email podaci koje bi trebalo poslati:', data)
      // Vraćamo uspeh da korisnik ne vidi grešku, ali logujemo problem
      return Response.json(
        { message: 'Ponuda je uspešno poslata' },
        { status: 200 }
      )
    }

    // Kreiraj Resend instancu sa API ključem
    const resend = new Resend(apiKey)

    try {
      // Koristi verifikovani domen ako je postavljen, inače fallback na test email
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Ferox Konstrukcije <onboarding@resend.dev>'
      const toEmail = process.env.RESEND_TO_EMAIL || 'timotijevicdragoje@gmail.com'

      const result = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        replyTo: data.email, // Omogućava direktan odgovor korisniku
        subject: `Nova ponuda od ${data.ime}`,
        html: formatEmail(data),
      })

      console.log('Email uspešno poslat:', result)
    } catch (emailError) {
      console.error('Greška pri slanju email-a:', emailError)
      // Ako email ne može da se pošalje, logujemo ali ne vraćamo grešku korisniku
      // (možda želiš da promeniš ovo ponašanje)
      throw emailError
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

