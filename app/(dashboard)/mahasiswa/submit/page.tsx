'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useTicketForm } from '@/hooks/useTicketForm'
import { useToast } from '@/hooks/use-toast'
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
  { id: 'akademik', label: 'Akademik', icon: '🎓' },
  { id: 'keuangan', label: 'Keuangan', icon: '💰' },
  { id: 'fasilitas', label: 'Fasilitas', icon: '🏢' },
  { id: 'keamanan', label: 'Keamanan', icon: '🛡️' },
  { id: 'lainnya', label: 'Lainnya', icon: '⚙️' },
]

const DEPARTMENTS = [
  'BAAK (Biro Administrasi Akademik & Kemahasiswaan)',
  'BAUK (Biro Administrasi Umum & Keuangan)',
  'LPPM (Lembaga Penelitian & Pengabdian Masyarakat)',
  'UPT IT (Pusat Komputer/IT)',
  'Perpustakaan Pusat',
  'Fakultas Keguruan dan Ilmu Pendidikan',
  'Fakultas Ilmu Budaya',
  'Fakultas Ekonomi dan Bisnis',
  'Fakultas Ilmu Sosial dan Ilmu Politik',
  'Fakultas Teknologi Informasi',
  'Fakultas Teknik',
  'Fakultas Ilmu Kesehatan',
  'Fakultas Hukum',
  'Fakultas Agama Islam',
]

export default function SubmitTicketPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { loading, error, fieldErrors, success, ticketNumber, ticketId, submitTicket } = useTicketForm()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [department, setDepartment] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.size > 2 * 1024 * 1024) {
        toast({
          title: "File Terlalu Besar",
          description: "Maksimal ukuran file adalah 2MB",
          variant: "destructive",
        })
        return
      }
      setFile(selected)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouchedFields(new Set(['title', 'category', 'department', 'description']))
    
    await submitTicket({ 
      title, 
      description, 
      category: category as any, 
      department, 
      is_anonymous: isAnonymous 
    }, file)
  }

  const urgentKeywords = detectUrgentKeywords(description)

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-zinc-200 rounded-3xl p-10 text-center shadow-xl shadow-emerald-500/5"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-emerald-100">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Laporan Terkirim!</h1>
          <p className="text-zinc-500 mb-8">Nomor tiket Anda adalah <span className="font-mono font-bold text-zinc-900">#{ticketNumber}</span></p>
          
          <div className="bg-zinc-50 rounded-2xl p-6 mb-8 text-left border border-zinc-100">
            <p className="text-sm text-zinc-600 leading-relaxed">
              Tim admin akan meninjau laporan Anda sesegera mungkin. Anda dapat memantau status perkembangan laporan melalui dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={`/mahasiswa/tiket/${ticketId}`}
              className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            >
              Lihat Detail Laporan
              <ChevronRight size={16} />
            </Link>
            <Link 
              href="/mahasiswa"
              className="px-8 py-3 bg-white border border-zinc-200 text-zinc-600 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-1 pt-4 border-b border-zinc-100 pb-10">
        <Link 
          href="/mahasiswa" 
          className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest mb-4 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">Buat <span className="text-zinc-400">Laporan Baru</span></h1>
        <p className="text-zinc-500 text-sm font-medium mt-2 max-w-xl">
          Sampaikan keluhan, aspirasi, atau pertanyaan Anda. Gunakan bahasa yang sopan dan jelas agar kami dapat membantu lebih cepat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="text-sm font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {urgentKeywords.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 text-amber-700 shadow-sm"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="text-xs font-medium leading-relaxed">
                <span className="font-bold">Prioritas Urgent Terdeteksi:</span> Laporan Anda mengandung kata kunci darurat ({urgentKeywords.join(', ')}) dan akan otomatis mendapat prioritas tinggi.
              </div>
            </motion.div>
          )}

          {/* Title */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Judul Laporan</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouchedFields(prev => new Set(prev).add('title'))}
              placeholder="Contoh: Masalah Pembayaran UKT Semester Ganjil"
              className={clsx(
                "w-full px-6 py-4 bg-white border rounded-2xl text-sm font-semibold focus:outline-none transition-all placeholder:text-zinc-300",
                fieldErrors.title && touchedFields.has('title') ? "border-rose-300 ring-4 ring-rose-500/5" : "border-zinc-200 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5"
              )}
            />
            {fieldErrors.title && touchedFields.has('title') && <p className="text-[10px] font-bold text-rose-500 uppercase px-1">{fieldErrors.title}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Kategori</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                        setCategory(cat.id)
                        setTouchedFields(prev => new Set(prev).add('category'))
                    }}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-bold transition-all",
                      category === cat.id 
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-900/10" 
                        : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                    )}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
              {fieldErrors.category && touchedFields.has('category') && <p className="text-[10px] font-bold text-rose-500 uppercase px-1">{fieldErrors.category}</p>}
            </div>

            {/* Department */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Tujuan Laporan</label>
              <select
                value={department}
                onChange={(e) => {
                    setDepartment(e.target.value)
                    setTouchedFields(prev => new Set(prev).add('department'))
                }}
                className={clsx(
                  "w-full px-6 py-4 bg-white border rounded-2xl text-xs font-bold focus:outline-none transition-all appearance-none cursor-pointer",
                  fieldErrors.department && touchedFields.has('department') ? "border-rose-300" : "border-zinc-200 focus:border-zinc-400"
                )}
              >
                <option value="">Pilih Departemen/Unit</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {fieldErrors.department && touchedFields.has('department') && <p className="text-[10px] font-bold text-rose-500 uppercase px-1">{fieldErrors.department}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Detail Deskripsi</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setTouchedFields(prev => new Set(prev).add('description'))}
              placeholder="Jelaskan secara rinci permasalahan Anda..."
              rows={8}
              className={clsx(
                "w-full px-6 py-4 bg-white border rounded-3xl text-sm font-medium leading-relaxed focus:outline-none transition-all placeholder:text-zinc-300 resize-none",
                fieldErrors.description && touchedFields.has('description') ? "border-rose-300 ring-4 ring-rose-500/5" : "border-zinc-200 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5"
              )}
            />
            {fieldErrors.description && touchedFields.has('description') && <p className="text-[10px] font-bold text-rose-500 uppercase px-1">{fieldErrors.description}</p>}
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Lampiran (Opsional, Max 2MB)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                "group border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                file ? "bg-emerald-50 border-emerald-200" : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50"
              )}
            >
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf"
              />
              {file ? (
                <>
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-zinc-900 truncate max-w-[200px]">{file.name}</p>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-2 hover:underline"
                    >
                      Hapus Lampiran
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-xl border border-zinc-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="text-zinc-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-zinc-900">Pilih file atau tarik ke sini</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-1">PNG, JPG, PDF</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Anonymous Option */}
          <div 
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={clsx(
                "p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group",
                isAnonymous ? "bg-zinc-900 border-zinc-900 text-white shadow-xl" : "bg-white border-zinc-200 hover:border-zinc-300"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center border transition-colors", isAnonymous ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-100 group-hover:bg-zinc-100")}>
                <EyeOff size={20} className={isAnonymous ? "text-zinc-400" : "text-zinc-400"} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold">Kirim secara Anonim</p>
                <p className={clsx("text-[10px] font-medium leading-relaxed", isAnonymous ? "text-zinc-500" : "text-zinc-400")}>Nama asli Anda akan disembunyikan dari petugas biasa.</p>
              </div>
            </div>
            <div className={clsx("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", isAnonymous ? "bg-white border-white" : "border-zinc-100")}>
              {isAnonymous && <CheckCircle2 size={16} className="text-zinc-900" />}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-zinc-900 text-white rounded-3xl font-bold text-lg hover:bg-zinc-800 disabled:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-xl shadow-zinc-900/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                Kirim Laporan Sekarang
                <Send size={20} />
              </>
            )}
          </button>
        </form>

        {/* Info Column */}
        <aside className="lg:col-span-5 space-y-10">
          <FaqSuggestion query={title} />

          <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 bg-zinc-50/50 border-b border-zinc-100 flex items-center gap-3">
                <Info size={16} className="text-zinc-400" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Informasi Penting</h3>
            </div>
            <div className="p-8 space-y-8">
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                        <CheckCircle2 size={16} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-zinc-900">SLA Resolution</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Laporan akan ditangani dalam waktu maksimal 3x24 jam kerja sesuai prioritas.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                        <AlertTriangle size={16} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-zinc-900">Validitas Data</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Pastikan data yang Anda lampirkan benar. Laporan palsu dapat dikenakan sanksi etik.</p>
                    </div>
                </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
