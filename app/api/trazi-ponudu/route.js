// API endpoint za slanje ponude
// TODO: Implementirati email servis (Resend, SendGrid, itd.)

export async function POST(request) {
  try {
    const data = await request.json()

    // TODO: Implementirati logiku za slanje email-a
    // Primer sa Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'noreply@ferox.rs',
    //   to: 'info@ferox.rs',
    //   subject: 'Nova ponuda sa sajta',
    //   html: formatEmail(data)
    // })

    // Za sada samo logujemo podatke
    console.log('Nova ponuda:', data)

    // Simulacija uspešnog slanja
    return Response.json(
      { message: 'Ponuda je uspešno poslata' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Greška pri slanju ponude:', error)
    return Response.json(
      { message: 'Greška pri slanju ponude' },
      { status: 500 }
    )
  }
}

