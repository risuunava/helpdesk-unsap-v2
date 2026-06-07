'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useTicketForm } from '@/hooks/useTicketForm'
import { FaqSuggestion } from '@/components/ticket/FaqSuggestion'
import { detectUrgentKeywords } from '@/lib/escalation'
import {
  Send,
  Paperclip,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  EyeOff,
  Loader2,
  Upload,
  ChevronRight,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { clsx } from 'clsx'

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
    await submitTicket({ title, description, category: category as any, department, is_anonymous: isAnonymous }, file)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto pt-10">
            <div className="bg-white rounded-2xl border border-zinc-200 p-10 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Laporan Terkirim</h2>
              <p className="text-zinc-500 text-sm mb-8">Nomor Tiket: <span className="font-mono font-bold text-emerald-600">#{ticketNumber}</span></p>
              <div className="flex flex-col gap-3">
                <Link href={`/mahasiswa/tiket/${ticketId}`} className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-bold text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                  Pantau Laporan <ChevronRight size={14} />
                </Link>
                <button onClick={() => { reset(); setTitle(''); setCategory(''); setDepartment(''); setDescription(''); setIsAnonymous(false); removeFile(); setTouchedFields(new Set()) }} className="text-sm font-bold text-zinc-500 hover:text-zinc-900">Buat laporan baru lainnya</button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <header className="border-b border-zinc-200 pb-8 space-y-1">
              <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest mb-3">
                <ArrowLeft size={14} /> Kembali
              </button>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Sampaikan Keluhan</h1>
              <p className="text-sm font-medium text-zinc-500">Tim kami siap membantu menyelesaikan kendala akademik dan fasilitas Anda.</p>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-zinc-200 rounded-xl p-6 lg:p-8 space-y-8 shadow-sm">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Subjek Keluhan</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={() => handleBlur('title')}
                      placeholder="Apa inti dari masalah Anda?"
                      className="w-full px-4 py-3 bg-zinc-50 border-none rounded-lg text-sm font-semibold text-zinc-900 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all placeholder:text-zinc-300"
                    />
                    {(getFieldError('title') || getLocalValidation('title')) && <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase">{getFieldError('title') || getLocalValidation('title')}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Kategori</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} onBlur={() => handleBlur('category')} className="w-full px-4 py-3 bg-zinc-50 border-none rounded-lg text-sm font-semibold text-zinc-900 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all appearance-none cursor-pointer">
                        <option value="" disabled>Pilih Kategori</option>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Departemen</label>
                      <select value={department} onChange={(e) => setDepartment(e.target.value)} onBlur={() => handleBlur('department')} className="w-full px-4 py-3 bg-zinc-50 border-none rounded-lg text-sm font-semibold text-zinc-900 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all appearance-none cursor-pointer">
                        <option value="" disabled>Pilih Unit</option>
                        {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Deskripsi Detail</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={() => handleBlur('description')}
                      rows={6}
                      placeholder="Ceritakan kendala Anda secara lengkap di sini..."
                      className="w-full px-4 py-3 bg-zinc-50 border-none rounded-lg text-sm font-medium text-zinc-900 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all placeholder:text-zinc-300 leading-relaxed resize-none"
                    />
                  </div>

                  <FaqSuggestion query={description} />
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Sedang Mengirim...</> : <><Send size={18} /> Kirim Laporan Sekarang</>}
                </button>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-6 shadow-sm">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Lampiran Media</p>
                    {!file ? (
                      <div
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onClick={() => fileInputRef.current?.click()}
                        className={`h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
                          dragOver ? 'border-indigo-500 bg-indigo-50/50' : 'border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50/50'
                        }`}
                      >
                        <Upload size={24} className="text-zinc-300 mb-2" />
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center px-4">Seret file atau klik (Maks 2MB)</p>
                        <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} className="hidden" />
                      </div>
                    ) : (
                      <div className="bg-zinc-50 rounded-lg p-3 flex items-center gap-3 border border-zinc-100">
                        {filePreview ? <img src={filePreview} className="w-10 h-10 rounded object-cover border border-zinc-200" /> : <div className="w-10 h-10 bg-white flex items-center justify-center rounded border border-zinc-200"><Paperclip size={14} className="text-zinc-400" /></div>}
                        <div className="flex-1 min-w-0"><p className="text-xs font-bold text-zinc-700 truncate">{file.name}</p></div>
                        <button type="button" onClick={removeFile} className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"><X size={14} /></button>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-zinc-100 space-y-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Opsi Privasi</p>
                    <button type="button" onClick={() => setIsAnonymous(!isAnonymous)} className={clsx("w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left", isAnonymous ? "bg-zinc-900 border-zinc-900 text-white shadow-md" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50")}>
                      <div className="flex items-center gap-2">
                        <EyeOff size={16} className={isAnonymous ? "text-indigo-400" : "text-zinc-400"} />
                        <span className="text-xs font-bold uppercase tracking-wider">Lapor Anonim</span>
                      </div>
                      <div className={clsx("w-3 h-3 rounded-full border-2", isAnonymous ? "bg-indigo-500 border-indigo-400" : "border-zinc-300")} />
                    </button>
                    <p className="text-[10px] text-zinc-400 font-medium leading-relaxed italic">* Identitas Anda hanya akan terlihat oleh Master Admin.</p>
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 flex gap-3">
                  <Info size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                    Sistem otomatis memprioritaskan laporan dengan indikasi urgensi tinggi. Lampirkan tangkapan layar untuk mempermudah proses verifikasi.
                  </p>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
