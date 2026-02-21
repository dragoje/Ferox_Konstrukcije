import { Suspense } from 'react'
import Projekti from '@/components/Admin/Projekti'

export default function AdminProjektiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Učitavanje...</div>}>
      <Projekti />
    </Suspense>
  )
}
