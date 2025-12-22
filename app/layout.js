import './globals.css'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'

export const metadata = {
  title: 'FEROX KONSTRUKCIJE - Profesionalne Hale i Konstrukcije',
  description: 'Profesionalne hale i metalne konstrukcije po meri. Kvalitet, pouzdanost i najbolje cene.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

