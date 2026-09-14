import { Suspense } from 'react'
import Binder2DEditor from '@/components/Crtez/Binder2DEditor'

export const metadata = {
  title: '2D binder editor | FEROX KONSTRUKCIJE',
  description: '2D crtež bindera sa profilima i DXF exportom po komadu.',
}

export default function CrtezPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Učitavanje...
        </div>
      }
    >
      <div className="container mx-auto px-4 py-6">
        <Binder2DEditor />
      </div>
    </Suspense>
  )
}
