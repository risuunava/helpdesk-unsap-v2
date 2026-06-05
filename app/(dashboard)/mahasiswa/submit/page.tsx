'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTicketForm } from '@/hooks/useTicketForm'
import { FaqSuggestion } from '@/components/ticket/FaqSuggestion'
import {
  Send,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  EyeOff,
  Loader2,
  Upload
} from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'akademik', label: 'Akademik' },
  { value: 'keuangan', label: 'Keuangan' },
  { value: 'fasilitas', label: 'Fasilitas' },
  { value: 'keamanan', label: 'Keamanan' },
  { value: 'lainnya', label: 'Lainnya' },
]

const DEPARTMENTS = [
  { value: 'Akademik', label: 'Akademik' },
  { value: 'Keuangan', label: 'Keuangan' },
  { value: 'Kemahasiswaan', label: 'Kemahasiswaan' },
  { value: 'IT', label: 'IT' },
  { value: 'Sarana & Prasarana', label: 'Sarana & Prasarana' },
  { value: 'Lainnya', label: 'Lainnya' },
]

export default function SubmitTicketPage() {
  const router = useRouter()
  const { loading, error, fieldErrors, success, ticketNumber, ticketId, submitTicket, reset } = useTicketForm()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [department, setDepartment] = useState('')
  const [description, setDescription] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName))
  }

  const getFieldError = (fieldName: string) => {
    if (!touchedFields.has(fieldName) && !Object.keys(fieldErrors).length) return null
    return fieldErrors[fieldName] || null
  }

  const getLocalValidation = (fieldName: string): string | null => {
    if (!touchedFields.has(fieldName)) return null
    switch (fieldName) {
      case 'title':
        if (title.length > 0 && title.length < 10) return 'Judul minimal 10 karakter'
        break
      case 'description':
        if (description.length > 0 && description.length < 20) return 'Deskripsi minimal 20 karakter'
        break
      case 'category':
        if (!category) return 'Pilih kategori'
        break
      case 'department':
        if (!department) return 'Pilih departemen tujuan'
        break
    }
    return null
  }

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Tipe file tidak diizinkan. Gunakan JPG, PNG, atau PDF.')
      return
    }
    if (selectedFile.size > 2 * 1024 * 1024) {
      alert('File maksimal 2MB.')
      return
    }

    setFile(selectedFile)

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setFilePreview(e.target?.result as string)
      reader.readAsDataURL(selectedFile)
    } else {
      setFilePreview(null)
    }
  }

  const removeFile = () => {
    setFile(null)
    setFilePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileChange(droppedFile)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouchedFields(new Set(['title', 'category', 'department', 'description']))

    await submitTicket(
      {
        title,
        description,
        category: category as any,
        department,
        is_anonymous: isAnonymous,
      },
      file
    )
  }

  // --- SUCCESS STATE ---
  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-bg-surface rounded-2xl border border-border p-8 text-center shadow-capsule">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ECFDF5] flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-text-primary mb-2">
            Laporan Berhasil Dibuat!
          </h2>
          <p className="text-text-secondary mb-1">
            Nomor tiket Anda:
          </p>
          <p className="text-xl font-mono font-bold text-accent mb-6 bg-bg-elevated inline-block px-4 py-2 rounded-lg border border-border">
            {ticketNumber}
          </p>
          <p className="text-sm text-text-muted mb-8">
            Laporan Anda telah diterima dan akan segera ditinjau oleh tim helpdesk.
            Anda dapat memantau status laporan di dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/mahasiswa/tiket/${ticketId}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-text-inverse rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <FileText className="w-4 h-4" />
              Lihat Detail Tiket
            </Link>
            <button
              onClick={() => {
                reset()
                setTitle('')
                setCategory('')
                setDepartment('')
                setDescription('')
                setIsAnonymous(false)
                removeFile()
                setTouchedFields(new Set())
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-text-primary rounded-xl font-semibold text-sm hover:bg-bg-elevated transition-colors"
            >
              <Send className="w-4 h-4" />
              Buat Laporan Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- FORM STATE ---
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-text-primary">
          Buat Laporan Baru
        </h1>
        <p className="text-text-secondary mt-1">
          Sampaikan keluhan atau pertanyaan Anda. Tim helpdesk akan segera menindaklanjuti.
        </p>
      </div>

      {/* Global Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-error/20 bg-error/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card wrapper */}
        <div className="bg-bg-surface rounded-2xl border border-border p-6 lg:p-8 space-y-6 shadow-capsule">

          {/* Judul */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-text-primary mb-1.5">
              Judul Laporan <span className="text-error">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleBlur('title')}
              placeholder="Contoh: KRS tidak bisa diakses saat pengisian"
              maxLength={200}
              className={`w-full px-4 py-3 rounded-xl border bg-bg-base text-text-primary placeholder:text-text-muted text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent ${
                (getFieldError('title') || getLocalValidation('title'))
                  ? 'border-error'
                  : 'border-border'
              }`}
            />
            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-error">
                {getFieldError('title') || getLocalValidation('title') || ''}
              </p>
              <span className={`text-xs ${title.length < 10 ? 'text-text-muted' : 'text-success'}`}>
                {title.length}/200
              </span>
            </div>
          </div>

          {/* Kategori & Departemen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-text-primary mb-1.5">
                Kategori <span className="text-error">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onBlur={() => handleBlur('category')}
                className={`w-full px-4 py-3 rounded-xl border bg-bg-base text-text-primary text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent appearance-none ${
                  !category && touchedFields.has('category') ? 'text-text-muted' : ''
                } ${
                  (getFieldError('category') || getLocalValidation('category'))
                    ? 'border-error'
                    : 'border-border'
                }`}
              >
                <option value="" disabled>Pilih kategori...</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <p className="text-xs text-error mt-1.5">
                {getFieldError('category') || getLocalValidation('category') || ''}
              </p>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-semibold text-text-primary mb-1.5">
                Departemen Tujuan <span className="text-error">*</span>
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                onBlur={() => handleBlur('department')}
                className={`w-full px-4 py-3 rounded-xl border bg-bg-base text-text-primary text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent appearance-none ${
                  !department && touchedFields.has('department') ? 'text-text-muted' : ''
                } ${
                  (getFieldError('department') || getLocalValidation('department'))
                    ? 'border-error'
                    : 'border-border'
                }`}
              >
                <option value="" disabled>Pilih departemen...</option>
                {DEPARTMENTS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <p className="text-xs text-error mt-1.5">
                {getFieldError('department') || getLocalValidation('department') || ''}
              </p>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-text-primary mb-1.5">
              Deskripsi <span className="text-error">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleBlur('description')}
              placeholder="Jelaskan masalah Anda secara detail. Semakin jelas, semakin cepat kami bisa membantu..."
              rows={5}
              maxLength={5000}
              className={`w-full px-4 py-3 rounded-xl border bg-bg-base text-text-primary placeholder:text-text-muted text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y min-h-[120px] ${
                (getFieldError('description') || getLocalValidation('description'))
                  ? 'border-error'
                  : 'border-border'
              }`}
            />
            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-error">
                {getFieldError('description') || getLocalValidation('description') || ''}
              </p>
              <span className={`text-xs ${description.length < 20 ? 'text-text-muted' : 'text-success'}`}>
                {description.length}/5000
              </span>
            </div>
          </div>

          {/* FAQ Suggestion */}
          <FaqSuggestion query={description} />

          {/* Lampiran */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Lampiran <span className="text-text-muted font-normal">(opsional)</span>
            </label>

            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 text-center ${
                  dragOver
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-border-strong hover:bg-bg-elevated'
                }`}
              >
                <Upload className="w-8 h-8 mx-auto text-text-muted mb-2" />
                <p className="text-sm text-text-secondary font-medium">
                  Klik atau seret file ke sini
                </p>
                <p className="text-xs text-text-muted mt-1">
                  JPG, PNG, atau PDF · Maks 2MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-bg-elevated">
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-error" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 rounded-lg hover:bg-bg-overlay transition-colors text-text-muted hover:text-error"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Anonim Toggle */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-bg-elevated border border-border">
            <button
              type="button"
              role="switch"
              aria-checked={isAnonymous}
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/20 ${
                isAnonymous ? 'bg-accent' : 'bg-border-strong'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform duration-200 ${
                  isAnonymous ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-semibold text-text-primary">Lapor sebagai Anonim</span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Identitas Anda akan disembunyikan dari admin biasa. Hanya master admin yang dapat melihat siapa pelapor.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-accent text-text-inverse rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-capsule"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Mengirim Laporan...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Kirim Laporan
            </>
          )}
        </button>
      </form>
    </div>
  )
}
