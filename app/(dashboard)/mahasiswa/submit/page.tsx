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
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  EyeOff,
  Loader2,
  Upload,
  ChevronRight,
  Info,
  GraduationCap,
  Wallet,
  Building2,
  ShieldCheck,
  Settings2,
  Calendar,
  Clock,
  Layout
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import PageContainer from '@/components/layout/page-container'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Icons } from '@/components/icons'

const CATEGORIES = [
  { id: 'akademik', label: 'Akademik', icon: GraduationCap },
  { id: 'keuangan', label: 'Keuangan', icon: Wallet },
  { id: 'fasilitas', label: 'Fasilitas', icon: Building2 },
  { id: 'keamanan', label: 'Keamanan', icon: ShieldCheck },
  { id: 'lainnya', label: 'Lainnya', icon: Settings2 },
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
    
    if (!title || !category || !department || !description) {
      toast({
        title: "Data Belum Lengkap",
        description: "Harap isi semua kolom yang wajib diisi.",
        variant: "destructive",
      })
      return
    }

    await submitTicket({ 
      title, 
      description, 
      category: category as any, 
      department, 
      is_anonymous: isAnonymous 
    }, file)
  }

  const urgentKeywords = detectUrgentKeywords(description)

  const infoContent = {
    title: "Panduan Pelaporan",
    sections: [
      {
        title: "Detail Laporan",
        description: "Berikan detail yang jelas dan objektif untuk mempercepat proses identifikasi masalah oleh tim bantuan."
      },
      {
        title: "Privasi Laporan",
        description: "Gunakan fitur anonim jika laporan mengandung informasi sensitif. Nama Anda akan tetap tercatat di sistem namun disembunyikan dari petugas operasional."
      }
    ]
  }

  if (success) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto py-8 md:py-20 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/40 shadow-sm overflow-hidden bg-card p-6 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-inner">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Laporan Terkirim!</CardTitle>
                <CardDescription className="text-base mt-2 text-muted-foreground">
                  Nomor tiket Anda adalah <span className="font-mono font-bold text-foreground">#{ticketNumber}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-xl p-6 text-left border border-border/50 max-w-md mx-auto">
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    Terima kasih telah melapor. Tim operasional akan meninjau laporan Anda dalam waktu maksimal 3x24 jam kerja. Anda dapat memantau perkembangan tiket secara real-time melalui dashboard.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                <Button 
                  asChild
                  className="rounded-md px-6 h-10 font-bold flex items-center gap-2 shadow-sm"
                >
                  <Link href={`/mahasiswa/tiket/${ticketId}`}>
                    Lihat Detail Laporan
                    <ChevronRight size={16} />
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  asChild
                  className="rounded-md px-6 h-10 font-bold"
                >
                  <Link href="/mahasiswa">
                    Kembali ke Dashboard
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      pageTitle="Buat Laporan Baru"
      pageDescription="Sampaikan keluhan, aspirasi, atau kendala Anda secara profesional melalui sistem bantuan terintegrasi."
      infoContent={infoContent}
    >
      <div className="flex flex-1 flex-col gap-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Form Section */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive shadow-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div className="text-sm font-bold leading-relaxed">{error}</div>
                </div>
              )}

              {urgentKeywords.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-600 shadow-sm"
                >
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div className="text-xs font-bold leading-relaxed">
                    Prioritas Tinggi Terdeteksi: Laporan Anda mengandung kata kunci darurat ({urgentKeywords.join(', ')}) dan akan mendapat penanganan prioritas.
                  </div>
                </motion.div>
              )}

              {/* Title Card */}
              <Card className="border-border/40 shadow-sm overflow-hidden bg-card">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Judul Laporan</Label>
                    <Input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={() => setTouchedFields(prev => new Set(prev).add('title'))}
                      placeholder="Gunakan judul yang singkat dan deskriptif..."
                      className={cn(
                        "rounded-md h-10 font-medium",
                        fieldErrors.title && touchedFields.has('title') && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {fieldErrors.title && touchedFields.has('title') && (
                      <p className="text-[10px] font-bold text-destructive uppercase px-1">{fieldErrors.title}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Selection */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Kategori Layanan</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <Select 
                          value={category} 
                          onValueChange={(val) => {
                            setCategory(val)
                            setTouchedFields(prev => new Set(prev).add('category'))
                          }}
                        >
                          <SelectTrigger className={cn(
                            "rounded-md h-10 font-medium",
                            fieldErrors.category && touchedFields.has('category') && "border-destructive focus-visible:ring-destructive"
                          )}>
                            <SelectValue placeholder="Pilih Kategori" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id} className="rounded-md font-medium">
                                <div className="flex items-center gap-2">
                                  <cat.icon size={14} className="text-primary" />
                                  <span>{cat.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {fieldErrors.category && touchedFields.has('category') && (
                        <p className="text-[10px] font-bold text-destructive uppercase px-1">{fieldErrors.category}</p>
                      )}
                    </div>

                    {/* Department Selection */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Tujuan Unit/Fakultas</Label>
                      <Select 
                        value={department} 
                        onValueChange={(val) => {
                          setDepartment(val)
                          setTouchedFields(prev => new Set(prev).add('department'))
                        }}
                      >
                        <SelectTrigger className={cn(
                          "rounded-md h-10 font-medium",
                          fieldErrors.department && touchedFields.has('department') && "border-destructive focus-visible:ring-destructive"
                        )}>
                          <SelectValue placeholder="Pilih Tujuan" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg max-h-[300px]">
                          {DEPARTMENTS.map((d) => (
                            <SelectItem key={d} value={d} className="rounded-md font-medium">
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldErrors.department && touchedFields.has('department') && (
                        <p className="text-[10px] font-bold text-destructive uppercase px-1">{fieldErrors.department}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description Card */}
              <Card className="border-border/40 shadow-sm overflow-hidden bg-card">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Detail Deskripsi</Label>
                    <Textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={() => setTouchedFields(prev => new Set(prev).add('description'))}
                      placeholder="Jelaskan secara rinci permasalahan, waktu kejadian, dan pihak terkait..."
                      rows={6}
                      className={cn(
                        "rounded-md font-medium leading-relaxed resize-none",
                        fieldErrors.description && touchedFields.has('description') && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {fieldErrors.description && touchedFields.has('description') && (
                      <p className="text-[10px] font-bold text-destructive uppercase px-1">{fieldErrors.description}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Lampiran Pendukung (Opsional)</Label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "group border border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-muted/20 hover:bg-muted/40",
                        file ? "border-emerald-500/30 bg-emerald-500/5" : "border-border hover:border-muted-foreground/30"
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
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle2 size={18} className="text-emerald-500" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-foreground truncate max-w-[250px]">{file.name}</p>
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); setFile(null); }}
                              className="text-[9px] font-bold text-destructive uppercase tracking-widest mt-1 hover:underline"
                            >
                              Hapus File
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-card rounded-xl border border-border flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                            <Upload size={18} className="text-muted-foreground" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-foreground">Pilih file atau tarik ke sini</p>
                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Maksimal 2MB (PDF/JPG/PNG)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Anonymous Toggle */}
              <div 
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group shadow-sm",
                    isAnonymous 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "bg-card border-border/40 hover:border-muted-foreground/30"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center border transition-colors", 
                    isAnonymous ? "bg-primary-foreground/10 border-primary-foreground/20" : "bg-muted border-border"
                  )}>
                    <EyeOff size={18} className={isAnonymous ? "text-primary-foreground" : "text-muted-foreground"} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold">Kirim Secara Anonim</p>
                    <p className={cn("text-[10px] font-medium leading-tight", isAnonymous ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      Identitas Anda disembunyikan dari petugas biasa.
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", 
                  isAnonymous ? "bg-primary-foreground border-primary-foreground" : "border-border"
                )}>
                  {isAnonymous && <Icons.check size={12} className="text-primary" />}
                </div>
              </div>

              {/* Action */}
              <Button
                type="submit"
                disabled={loading}
                className="h-11 rounded-md font-bold text-sm shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses Laporan...
                  </>
                ) : (
                  <>
                    Kirim Laporan Sekarang
                    <Send size={18} />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Info Section */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <FaqSuggestion query={title} />

            <Card className="border-border/40 shadow-sm overflow-hidden bg-card">
              <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-primary" />
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Ketentuan Layanan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-sm">
                    <Clock size={16} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Respon Cepat</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">Laporan akan diproses dalam waktu 3 hari kerja.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-sm">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Data Valid</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">Laporan palsu atau tidak pantas akan dikenakan sanksi administrasi.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-sm">
                    <Layout size={16} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Satu Pintu</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">Pantau semua progres laporan Anda melalui dashboard mahasiswa.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </PageContainer>
  )
}
