'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import Navbar from '@/components/Navbar'
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  MapPin,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react'
import { uploadToCloudinary } from '@/lib/cloudinary'

const LeafletMap = dynamic(() => import('@/components/Map'), { ssr: false })

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
]

const PRIORITIES = [
  {
    value: 'Low',
    label: 'Low',
    description: 'Minor inconvenience',
    bg: 'bg-green-50',
    selectedBg: 'bg-green-50',
    selectedBorder: 'border-green-500',
    dotColor: 'bg-green-500',
  },
  {
    value: 'Medium',
    label: 'Medium',
    description: 'Needs attention soon',
    bg: 'bg-gray-50',
    selectedBg: 'bg-yellow-50',
    selectedBorder: 'border-yellow-500',
    dotColor: 'bg-yellow-500',
  },
  {
    value: 'High',
    label: 'High',
    description: 'Urgent — safety risk',
    bg: 'bg-gray-50',
    selectedBg: 'bg-red-50',
    selectedBorder: 'border-red-500',
    dotColor: 'bg-red-500',
  },
] as const

type Priority = 'Low' | 'Medium' | 'High'

interface CategoryOption {
  id: number
  name: string
  department: { name: string }
}

interface FormState {
  categoryId: string
  title: string
  description: string
  photoUrl: string
  priority: Priority
  address: string
  district: string
  latitude: number | null
  longitude: number | null
}

const initialForm: FormState = {
  categoryId: '',
  title: '',
  description: '',
  photoUrl: '',
  priority: 'Medium',
  address: '',
  district: '',
  latitude: null,
  longitude: null,
}

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.22, ease: 'easeIn' } }),
}

const STEP_LABELS = ['Issue Details', 'Location', 'Review & Submit']

function inputClass(hasError?: boolean) {
  return `w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
    hasError
      ? 'border-red-300 focus:ring-red-400 focus:border-transparent'
      : 'border-gray-200 focus:ring-green-500 focus:border-transparent'
  }`
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {message}
    </p>
  )
}

export default function SubmitPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [direction, setDirection] = useState(1)
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'photo' | 'agree' | 'submit', string>>>({})
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [agreeChecked, setAgreeChecked] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(() => {})
      .finally(() => setCategoriesLoading(false))
  }, [])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function validate(s: number): boolean {
    const e: typeof errors = {}
    if (s === 1) {
      if (!form.categoryId) e.categoryId = 'Please select a category'
      if (form.title.trim().length < 3) e.title = 'Title must be at least 3 characters'
      if (form.description.trim().length < 20) e.description = 'Description must be at least 20 characters'
    }
    if (s === 2) {
      if (!form.district) e.district = 'Please select a district'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function goNext() {
    if (!validate(step)) return
    setDirection(1)
    setStep((s) => (s + 1) as 1 | 2 | 3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => (s - 1) as 1 | 2 | 3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'Please select an image file' }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'Image must be less than 5 MB' }))
      return
    }

    setErrors((prev) => ({ ...prev, photo: '' }))
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoUploading(true)

    try {
      const url = await uploadToCloudinary(file)
      update('photoUrl', url)
    } catch {
      setErrors((prev) => ({ ...prev, photo: 'Upload failed — photo will not be attached' }))
      setPhotoPreview('')
    } finally {
      setPhotoUploading(false)
    }
  }

  function removePhoto() {
    setPhotoPreview('')
    update('photoUrl', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update('latitude', pos.coords.latitude)
        update('longitude', pos.coords.longitude)
      },
      () => {}
    )
  }

  async function handleSubmit() {
    if (!agreeChecked) {
      setErrors((prev) => ({ ...prev, agree: 'You must agree to continue' }))
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: Number(form.categoryId),
          title: form.title.trim(),
          description: form.description.trim(),
          photoUrl: form.photoUrl || undefined,
          priority: form.priority,
          address: form.address.trim() || undefined,
          district: form.district,
          latitude: form.latitude,
          longitude: form.longitude,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setReferenceNumber(data.referenceNumber)
      setSubmitted(true)
    } catch {
      setErrors((prev) => ({ ...prev, submit: 'Submission failed. Please try again.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="flex-1 min-h-screen bg-gray-50 pt-20 pb-16 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h1>
            <p className="text-gray-500 text-sm mb-8">
              Your complaint has been received. Use your reference number to track its progress.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
              <p className="text-xs font-medium text-green-600 uppercase tracking-widest mb-1">Reference Number</p>
              <p className="text-3xl font-bold text-gray-900 tracking-wide">{referenceNumber}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push(`/track?ref=${referenceNumber}`)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors duration-200 cursor-pointer"
              >
                Track this Report
              </button>
              <button
                onClick={() => {
                  setForm(initialForm)
                  setPhotoPreview('')
                  setAgreeChecked(false)
                  setSubmitted(false)
                  setStep(1)
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 hover:border-gray-300 font-semibold text-sm py-3.5 rounded-xl transition-colors duration-200 cursor-pointer"
              >
                Submit Another
              </button>
            </div>
          </motion.div>
        </main>
      </>
    )
  }

  const selectedCategory = categories.find((c) => c.id === Number(form.categoryId))

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="pt-8 pb-6">
            <h1 className="text-2xl font-bold text-gray-900">Report a Civic Issue</h1>
            <p className="mt-1 text-sm text-gray-500">
              Step {step} of 3 — {STEP_LABELS[step - 1]}
            </p>

            <div className="mt-5 flex items-center gap-2">
              {STEP_LABELS.map((label, i) => {
                const num = i + 1
                const done = num < step
                const active = num === step
                return (
                  <div key={label} className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold transition-colors duration-300 ${
                        done
                          ? 'bg-green-600 text-white'
                          : active
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {done ? <CheckCircle className="w-4 h-4" /> : num}
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors duration-200 hidden sm:block ${
                        active ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                    {i < STEP_LABELS.length - 1 && (
                      <div className="flex-1 h-px bg-gray-200 mx-1">
                        <motion.div
                          className="h-full bg-green-600"
                          initial={{ width: 0 }}
                          animate={{ width: done ? '100%' : '0%' }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="p-6 sm:p-8"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Issue Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.categoryId}
                        onChange={(e) => update('categoryId', e.target.value)}
                        className={inputClass(!!errors.categoryId)}
                        disabled={categoriesLoading}
                      >
                        <option value="">
                          {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                        </option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} — {cat.department.name}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.categoryId} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Issue Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Large pothole on Main Street near Temple Junction"
                        value={form.title}
                        onChange={(e) => update('title', e.target.value)}
                        className={inputClass(!!errors.title)}
                        maxLength={200}
                      />
                      <FieldError message={errors.title} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Describe the issue in detail — what you observed, when it started, how it affects the community..."
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)}
                        className={`${inputClass(!!errors.description)} resize-none`}
                      />
                      <div className="flex items-center justify-between mt-1">
                        <FieldError message={errors.description} />
                        <span
                          className={`text-xs ml-auto ${
                            form.description.length < 20 ? 'text-gray-400' : 'text-green-600'
                          }`}
                        >
                          {form.description.length}/20 min
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Photo Evidence{' '}
                        <span className="text-gray-400 font-normal">(optional)</span>
                      </label>

                      {photoPreview ? (
                        <div className="relative inline-block">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                          />
                          {photoUploading && (
                            <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                            </div>
                          )}
                          {!photoUploading && (
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors duration-200"
                              aria-label="Remove photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-3 px-4 py-3.5 border-2 border-dashed border-gray-200 hover:border-green-400 rounded-xl text-sm text-gray-500 hover:text-green-600 transition-all duration-200 cursor-pointer w-full sm:w-auto"
                        >
                          <Upload className="w-4 h-4 flex-shrink-0" />
                          Click to upload a photo (max 5 MB)
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        aria-label="Upload photo"
                      />
                      <FieldError message={errors.photo} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Priority Level <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {PRIORITIES.map((p) => {
                          const selected = form.priority === p.value
                          return (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => update('priority', p.value)}
                              className={`p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                                selected
                                  ? `${p.selectedBorder} ${p.selectedBg}`
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2.5 h-2.5 rounded-full ${p.dotColor}`} />
                                <span className="text-sm font-semibold text-gray-900">
                                  {p.label}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 leading-tight">
                                {p.description}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      type="button"
                      onClick={goNext}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors duration-200 cursor-pointer"
                    >
                      Next: Location
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="p-6 sm:p-8"
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          District <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.district}
                          onChange={(e) => update('district', e.target.value)}
                          className={inputClass(!!errors.district)}
                        >
                          <option value="">Select district</option>
                          {DISTRICTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <FieldError message={errors.district} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Address{' '}
                          <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Street, town or landmark"
                          value={form.address}
                          onChange={(e) => update('address', e.target.value)}
                          className={inputClass()}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Pin Location on Map{' '}
                          <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleUseMyLocation}
                          className="flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700 transition-colors duration-200 cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          Use my location
                        </button>
                      </div>

                      <p className="text-xs text-gray-400 mb-3">
                        Click anywhere on the map to place a marker at the issue location.
                      </p>

                      <LeafletMap
                        position={
                          form.latitude && form.longitude
                            ? [form.latitude, form.longitude]
                            : null
                        }
                        onPositionChange={(lat, lng) => {
                          update('latitude', lat)
                          update('longitude', lng)
                        }}
                      />

                      {form.latitude && form.longitude && (
                        <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Location pinned: {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-8">
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors duration-200 cursor-pointer"
                    >
                      Review Report
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="p-6 sm:p-8"
                >
                  <div className="space-y-5">
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                      <SummaryRow label="Category" value={selectedCategory?.name ?? '—'} />
                      <SummaryRow label="Title" value={form.title} />
                      <SummaryRow
                        label="Description"
                        value={
                          form.description.length > 120
                            ? form.description.slice(0, 120) + '...'
                            : form.description
                        }
                      />
                      <SummaryRow label="Priority" value={form.priority} />
                      <SummaryRow label="District" value={form.district} />
                      {form.address && <SummaryRow label="Address" value={form.address} />}
                      {form.latitude && form.longitude && (
                        <SummaryRow
                          label="Coordinates"
                          value={`${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)}`}
                        />
                      )}
                      {form.photoUrl && (
                        <div className="flex gap-3 py-1">
                          <span className="text-xs font-medium text-gray-500 w-24 flex-shrink-0 pt-0.5">
                            Photo
                          </span>
                          <img
                            src={photoPreview}
                            alt="Attached"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800 mb-2">What happens next?</p>
                          <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
                            <li>Your report receives a unique reference number</li>
                            <li>It&apos;s routed to the relevant government department</li>
                            <li>You&apos;ll receive an email confirmation</li>
                            <li>Track progress using your reference number at any time</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeChecked}
                          onChange={(e) => {
                            setAgreeChecked(e.target.checked)
                            setErrors((prev) => ({ ...prev, agree: '' }))
                          }}
                          className="mt-0.5 w-4 h-4 accent-green-600 cursor-pointer flex-shrink-0"
                        />
                        <span className="text-sm text-gray-600 leading-snug">
                          I confirm that the information provided is accurate and that this report
                          is a genuine civic issue.
                        </span>
                      </label>
                      <FieldError message={errors.agree} />
                    </div>

                    {errors.submit && (
                      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                        {errors.submit}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-8">
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Report'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-500 w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 flex-1">{value}</span>
    </div>
  )
}
