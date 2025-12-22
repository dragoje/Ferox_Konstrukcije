'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function QuoteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // TODO: Implementirati API endpoint za slanje email-a
      const response = await fetch('/api/trazi-ponudu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Uspešno poslato! Kontaktiraćemo vas uskoro.' })
        reset()
      } else {
        setSubmitStatus({ type: 'error', message: 'Greška pri slanju. Molimo pokušajte ponovo.' })
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Greška pri slanju. Molimo pokušajte ponovo.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="ime" className="block text-sm font-medium text-gray-700 mb-1">
          Ime i Prezime *
        </label>
        <input
          type="text"
          id="ime"
          {...register('ime', { required: 'Ime je obavezno' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
        />
        {errors.ime && (
          <p className="mt-1 text-sm text-red-600">{errors.ime.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          {...register('email', {
            required: 'Email je obavezan',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Nevažeća email adresa'
            }
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-1">
          Telefon *
        </label>
        <input
          type="tel"
          id="telefon"
          {...register('telefon', { required: 'Telefon je obavezan' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
        />
        {errors.telefon && (
          <p className="mt-1 text-sm text-red-600">{errors.telefon.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="tipHale" className="block text-sm font-medium text-gray-700 mb-1">
          Tip Hale
        </label>
        <select
          id="tipHale"
          {...register('tipHale')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
        >
          <option value="">Izaberite tip hale</option>
          <option value="industrijska">Industrijska hala</option>
          <option value="poljoprivredna">Poljoprivredna hala</option>
          <option value="sportska">Sportska hala</option>
          <option value="komercialna">Komercialna hala</option>
          <option value="hangar">Hangar</option>
          <option value="prilagodjena">Prilagođena hala</option>
        </select>
      </div>

      <div>
        <label htmlFor="dimenzije" className="block text-sm font-medium text-gray-700 mb-1">
          Dimenzije (opciono)
        </label>
        <input
          type="text"
          id="dimenzije"
          {...register('dimenzije')}
          placeholder="npr. 20m x 30m x 5m"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
        />
      </div>

      <div>
        <label htmlFor="poruka" className="block text-sm font-medium text-gray-700 mb-1">
          Poruka *
        </label>
        <textarea
          id="poruka"
          rows={5}
          {...register('poruka', { required: 'Poruka je obavezna' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          placeholder="Opišite vaš projekat ili postavite pitanja..."
        />
        {errors.poruka && (
          <p className="mt-1 text-sm text-red-600">{errors.poruka.message}</p>
        )}
      </div>

      {submitStatus && (
        <div
          className={`p-4 rounded-lg ${
            submitStatus.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Šalje se...' : 'Pošalji Ponudu'}
      </button>
    </form>
  )
}

