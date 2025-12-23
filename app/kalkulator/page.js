import { Suspense } from 'react'
import Kalkulator from '@/components/Kalkulator/Kalkulator'

export default function KalkulatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Učitavanje...</div>}>
      <Kalkulator />
    </Suspense>
  )
}
