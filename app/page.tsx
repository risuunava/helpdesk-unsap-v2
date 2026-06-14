'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useReducedMotion, useSpring, AnimatePresence } from 'motion/react'
import { Icons } from '@/components/icons'

/* ── Minimalist Staggered Reveal ──────────────────────── */
function StaggerReveal({ children, delay = 0, className = "", blur = false }: { children: React.ReactNode; delay?: number; className?: string; blur?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12, filter: blur ? "blur(8px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Magnetic Interaction ─────────────────────────────── */
function MagneticWrap({ children, strength = 0.2, className = "" }: { children: React.ReactNode, strength?: number, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
  const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    x.set((clientX - (left + width / 2)) * strength);
    y.set((clientY - (top + height / 2)) * strength);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Interactive Ticket Simulator (Hero Widget) ───────── */
const TICKET_STEPS = [
  {
    status: 'Diajukan',
    title: 'Akses Portal Akademik Lambat',
    desc: 'Laporan diterima oleh sistem dan sedang masuk antrean verifikasi departemen.',
    category: 'Akademik & IT',
    priority: 'Tinggi',
    time: 'Baru saja',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    progress: 30,
    agent: 'Sistem Terintegrasi',
  },
  {
    status: 'Diproses',
    title: 'Akses Portal Akademik Lambat',
    desc: 'Laporan diverifikasi. Staf IT Puskom sedang mengoptimalkan server database.',
    category: 'Akademik & IT',
    priority: 'Tinggi',
    time: '2 menit yang lalu',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    progress: 65,
    agent: 'Rian Hermawan (Staf Puskom)',
  },
  {
    status: 'Selesai',
    title: 'Akses Portal Akademik Lambat',
    desc: 'Database optimization selesai dan redis cache aktif. Kendala terselesaikan.',
    category: 'Akademik & IT',
    priority: 'Tinggi',
    time: '10 menit yang lalu',
    badgeClass: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
    progress: 100,
    agent: 'Rian Hermawan (Staf Puskom)',
  }
]

function InteractiveTicketPreview() {
  const [stepIndex, setStepIndex] = useState(0)

  const handleNextStep = () => {
    setStepIndex((prev) => (prev + 1) % TICKET_STEPS.length)
  }

  const active = TICKET_STEPS[stepIndex]

  return (
    <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl p-6 shadow-md relative overflow-hidden">
      {/* Background design line */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-foreground/[0.02] rounded-full translate-x-8 -translate-y-8" />
      
      {/* Widget Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Tiket Simulasi</span>
          <h4 className="text-sm font-semibold mt-1">#TK-7034</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${active.badgeClass}`}>
            {active.status}
          </span>
          <span className="text-[11px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full border border-border/40 font-mono">
            {active.priority}
          </span>
        </div>
      </div>

      {/* Ticket Details */}
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-mono text-muted-foreground block uppercase">Subjek</span>
          <span className="text-base font-medium text-foreground">{active.title}</span>
        </div>
        
        <div>
          <span className="text-[10px] font-mono text-muted-foreground block uppercase">Kategori & Penanggung Jawab</span>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-foreground">{active.category}</span>
            <span className="text-xs text-muted-foreground">{active.agent}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>KECEPATAN RESOLUSI</span>
            <span>{active.progress}%</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-foreground"
              initial={{ width: '0%' }}
              animate={{ width: `${active.progress}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            />
          </div>
        </div>

        {/* Description panel */}
        <div className="p-3.5 bg-muted/30 border border-border/40 rounded-xl min-h-[72px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.p 
              key={stepIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-muted-foreground leading-relaxed"
            >
              {active.desc}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <button
          onClick={handleNextStep}
          className="w-full h-11 border border-border/60 hover:bg-muted/50 active:scale-[0.98] transition-all rounded-xl text-xs font-medium flex items-center justify-center gap-2"
        >
          <Icons.history size={14} className="text-muted-foreground" />
          Simulasikan Alur Tiket ({stepIndex + 1}/3)
        </button>
      </div>
    </div>
  )
}

/* ── Infinite Marquee ─────────────────────────────────── */
function InfiniteMarquee() {
  const items = [
    "Fakultas Teknik", "Fakultas Ekonomi", "Biro Akademik", 
    "UPT Perpustakaan", "Fakultas Ilmu Budaya", "Lembaga Penelitian",
    "Fakultas Hukum", "UPT Teknologi Informasi"
  ];

  return (
    <section className="py-8 border-y border-border/40 bg-background overflow-hidden flex items-center relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <motion.div
        className="flex gap-24 pr-24 whitespace-nowrap min-w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 35,
        }}
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-muted-foreground/40 hover:text-foreground/80 transition-colors duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-border" />
            <span className="font-mono text-xs uppercase tracking-[0.2em]">{item}</span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

/* ── Bento Component 1: Routing Otomatis ────────────── */
function BentoRoutingWidget() {
  return (
    <div className="w-full h-44 bg-muted/20 border border-border/30 rounded-xl relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Node Student */}
      <div className="flex flex-col items-center gap-1.5 z-10">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-foreground text-background flex items-center justify-center shadow-sm">
          <Icons.user className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span className="text-[8px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-tight truncate max-w-[50px] sm:max-w-none">Mahasiswa</span>
      </div>

      {/* Connected Lines with Flow Dot */}
      <div className="flex-1 relative h-6 mx-2 sm:mx-4">
        {/* Horizontal Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-border/80" />
        {/* Animated dot 1 */}
        <motion.div
          className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-foreground -translate-y-1/2 top-1/2"
          animate={{ left: ["0%", "100%"] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        />
        {/* Animated dot 2 (offset delay) */}
        <motion.div
          className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-foreground -translate-y-1/2 top-1/2"
          animate={{ left: ["0%", "100%"] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 1.25 }}
        />
      </div>

      {/* Node Hub/Routing */}
      <div className="flex flex-col items-center gap-1.5 z-10">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted border border-border/80 text-foreground flex items-center justify-center shadow-sm">
          <Icons.dashboard className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span className="text-[8px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-tight truncate max-w-[50px] sm:max-w-none">Routing Hub</span>
      </div>

      <div className="flex-1 relative h-6 mx-2 sm:mx-4">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-border/80" />
        <motion.div
          className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-foreground -translate-y-1/2 top-1/2"
          animate={{ left: ["0%", "100%"] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      {/* Node Department */}
      <div className="flex flex-col items-center gap-1.5 z-10">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-foreground text-background flex items-center justify-center shadow-sm">
          <Icons.workspace className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span className="text-[8px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-tight truncate max-w-[55px] sm:max-w-none">Fakultas / Biro</span>
      </div>
    </div>
  )
}

/* ── Bento Component 2: Transparansi Penuh ──────────── */
function BentoStatusWidget() {
  const steps = [
    { label: 'Diajukan', completed: true, active: false },
    { label: 'Diverifikasi', completed: true, active: false },
    { label: 'Tindak Lanjut', completed: false, active: true },
    { label: 'Resolusi', completed: false, active: false }
  ];

  return (
    <div className="w-full h-44 bg-muted/20 border border-border/30 rounded-xl p-4 flex flex-col justify-between">
      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">Pelacakan Alur</span>
      <div className="space-y-3 my-auto">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              {step.completed ? (
                <div className="w-4 h-4 rounded-full bg-foreground text-background flex items-center justify-center">
                  <Icons.check size={10} />
                </div>
              ) : step.active ? (
                <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-amber-500"
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full border border-border/80" />
              )}
              {idx < steps.length - 1 && (
                <div className={`absolute top-4 w-[1px] h-3 ${step.completed ? 'bg-foreground' : 'bg-border/60'}`} />
              )}
            </div>
            <span className={`text-xs ${step.active ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Bento Component 4: Arsip Resolusi (Knowledge Base) ─ */
const KB_ARTICLES = [
  { filter: 'Akademik', title: 'Cara Pengisian KRS Online Mahasiswa Baru', time: 'Dibaca 1.2k kali' },
  { filter: 'Akademik', title: 'Panduan Ajukan Cuti Kuliah via Portal Akademik', time: 'Dibaca 800 kali' },
  { filter: 'Wi-Fi', title: 'Menghubungkan ke Jaringan Wi-Fi UNSAP-Secure', time: 'Dibaca 2.1k kali' },
  { filter: 'Wi-Fi', title: 'Lupa Password Akun Wi-Fi Kampus', time: 'Dibaca 1.4k kali' },
  { filter: 'Sarana', title: 'Prosedur Peminjaman Ruang Kelas & Aula Fakultas', time: 'Dibaca 500 kali' },
  { filter: 'Sarana', title: 'Laporan Kerusakan Fasilitas Kelas & Gedung', time: 'Dibaca 950 kali' }
];

function BentoSearchWidget() {
  const [activeFilter, setActiveFilter] = useState('Semua')
  const filters = ['Semua', 'Akademik', 'Wi-Fi', 'Sarana']

  const filtered = activeFilter === 'Semua' 
    ? KB_ARTICLES.slice(0, 3) 
    : KB_ARTICLES.filter(art => art.filter === activeFilter)

  return (
    <div className="w-full bg-muted/20 border border-border/30 rounded-xl p-4 flex flex-col gap-4">
      {/* Mini search bar */}
      <div className="flex items-center gap-2.5 px-3 py-2 bg-card border border-border/60 rounded-lg">
        <Icons.search size={13} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground/60 select-none">Cari panduan cepat...</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all ${
              activeFilter === filter
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-muted-foreground border-border/60 hover:text-foreground'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2 min-h-[120px]">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.div
              layout
              key={item.title}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-2.5 bg-card border border-border/40 hover:border-border/80 rounded-lg flex justify-between items-center gap-4 transition-colors"
            >
              <span className="text-xs text-foreground font-medium truncate">{item.title}</span>
              <span className="text-[9px] font-mono text-muted-foreground/80 shrink-0">{item.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Hero Section ─────────────────────────────────────── */
function ParallaxHero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden border-b border-border/40 bg-background">
      {/* Subtle Architectural Dot Grid Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]" 
        style={{
          backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      
      <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10 py-16">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <StaggerReveal>
            <div className="inline-flex items-center gap-2.5 px-3 py-1 border border-border/60 rounded-full bg-muted/40 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground">Sistem Layanan Terpadu v2.0</span>
            </div>
          </StaggerReveal>
          
          <StaggerReveal delay={0.08} blur>
            <h1 className="text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.15] tracking-tight font-medium text-foreground mb-6 pb-1">
              Resolusi cepat untuk seluruh <br />
              <span className="italic font-normal text-muted-foreground">sivitas akademik.</span>
            </h1>
          </StaggerReveal>
          
          <StaggerReveal delay={0.16} blur>
            <p className="text-base md:text-lg text-muted-foreground max-w-[52ch] leading-relaxed mb-8">
              Layanan bantuan akademik, IT, dan infrastruktur Universitas Sebelas April dengan pelacakan status real-time.
            </p>
          </StaggerReveal>
          
          <StaggerReveal delay={0.24}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <MagneticWrap strength={0.25} className="w-full sm:w-auto">
                <Link href="/register" className="h-12 px-6 w-full sm:w-auto justify-center bg-foreground text-background hover:bg-foreground/90 rounded-xl font-medium text-sm flex items-center gap-2 active:scale-[0.98] transition-all shadow-sm">
                  Buat Laporan <Icons.arrowRight size={14} />
                </Link>
              </MagneticWrap>
              <MagneticWrap strength={0.12} className="w-full sm:w-auto">
                <Link href="/login" className="h-12 px-6 w-full sm:w-auto justify-center bg-transparent border border-border hover:bg-muted/50 text-foreground rounded-xl font-medium text-sm flex items-center transition-all">
                  Masuk Portal
                </Link>
              </MagneticWrap>
            </div>
          </StaggerReveal>
        </div>

        <div className="lg:col-span-5 flex items-center justify-center lg:justify-end relative">
          <StaggerReveal delay={0.32} className="w-full flex justify-center lg:justify-end">
            <InteractiveTicketPreview />
          </StaggerReveal>
        </div>
      </div>
    </section>
  )
}

/* ── Workflow Interaction Section ─────────────────────── */
const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Laporkan Kendala',
    desc: 'Isi formulir pelaporan dengan melampirkan file pendukung (foto/dokumen) secara jelas.',
    previewTitle: 'Mulai Pengajuan Baru',
    type: 'form',
  },
  {
    step: '02',
    title: 'Tindak Lanjut & Verifikasi',
    desc: 'Laporan Anda diklasifikasikan secara otomatis dan diteruskan langsung ke divisi yang bertanggung jawab.',
    previewTitle: 'Status Pelacakan Tiket',
    type: 'timeline',
  },
  {
    step: '03',
    title: 'Solusi & Feedback',
    desc: 'Setelah kendala ditangani, berikan penilaian dan umpan balik atas kualitas layanan yang diberikan.',
    previewTitle: 'Resolusi Selesai',
    type: 'feedback',
  }
];

/* ── Workflow Preview Component ──────────────────────── */
function WorkflowPreview({ activeStep }: { activeStep: number }) {
  return (
    <div className="w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/3] bg-muted/20 border border-border/40 rounded-2xl p-6 flex flex-col justify-between shadow-2xs">
      <div className="flex justify-between items-center pb-3 border-b border-border/40">
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          {WORKFLOW_STEPS[activeStep].previewTitle}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      </div>

      {/* Dynamic Preview Content */}
      <div className="flex-1 py-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="h-8 bg-card border border-border/40 rounded-lg px-3 flex items-center text-[11px] text-muted-foreground">
                Kategori: IT & Jaringan
              </div>
              <div className="h-8 bg-card border border-border/40 rounded-lg px-3 flex items-center text-[11px] text-muted-foreground">
                Subjek: Akun portal tidak sinkron
              </div>
              <div className="h-14 bg-card border border-border/40 rounded-lg p-3 text-[11px] text-muted-foreground">
                Deskripsi singkat mengenai kendala yang terjadi...
              </div>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 font-mono text-[10px] text-muted-foreground"
            >
              <div className="flex gap-3 items-center">
                <span className="text-green-500">✓</span>
                <span>08:12 - Tiket diajukan oleh Mahasiswa</span>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-green-500">✓</span>
                <span>08:15 - Verifikasi otomatis selesai</span>
              </div>
              <div className="flex gap-3 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-foreground">08:20 - Tiket ditugaskan ke Staff IT</span>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="text-center space-y-4"
            >
              <span className="text-xs text-foreground font-medium block">
                Apakah kendala Anda sudah terselesaikan?
              </span>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-amber-400 text-lg">★</span>
                ))}
              </div>
              <span className="inline-block text-[10px] font-mono text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                Resolusi Sukses & Ditutup
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-[10px] font-mono text-muted-foreground flex justify-between">
        <span>TAHAPAN {activeStep + 1} / 3</span>
        <span>PENGGUNA: MAHASISWA</span>
      </div>
    </div>
  )
}

function InteractiveWorkflow() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section id="workflow" className="py-24 border-b border-border/40 bg-background text-foreground">
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Column Content */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <StaggerReveal blur>
            <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight font-medium mb-6">
              Satu alur terintegrasi untuk kenyamanan kampus.
            </h2>
          </StaggerReveal>
          
          <StaggerReveal delay={0.08} blur>
            <p className="text-base text-muted-foreground mb-12 max-w-[50ch] leading-relaxed">
              Tinggalkan koordinasi manual. UNSAP Helpdesk memusatkan laporan akademik, IT, dan fasilitas dalam satu alur teratur.
            </p>
          </StaggerReveal>

          <StaggerReveal delay={0.16} className="space-y-4">
            {WORKFLOW_STEPS.map((wf, idx) => {
              const isActive = activeStep === idx;
              return (
                <div key={idx} className="space-y-3">
                  <button
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                      isActive 
                        ? 'bg-muted/40 border-border/80 shadow-2xs' 
                        : 'bg-transparent border-transparent hover:border-border/30'
                    }`}
                  >
                    <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                    }`}>
                      {wf.step}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{wf.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{wf.desc}</p>
                    </div>
                  </button>
                  
                  {/* On Mobile, render the preview card inline right below the active step */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="block lg:hidden overflow-hidden pl-4 pr-1"
                      >
                        <div className="py-2">
                          <WorkflowPreview activeStep={idx} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </StaggerReveal>
        </div>

        {/* Right Column Preview - Desktop Only */}
        <div className="lg:col-span-6 hidden lg:flex items-center justify-center lg:justify-end">
          <StaggerReveal delay={0.24} className="w-full max-w-md">
            <WorkflowPreview activeStep={activeStep} />
          </StaggerReveal>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground/10 selection:text-foreground font-sans">
      
      {/* ── Navigation: Clean Sticky Bar ───────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <nav className="max-w-[1400px] mx-auto h-16 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/assets/UNSAP.png" 
              alt="UNSAP Logo" 
              className="w-8 h-8 object-contain transition-transform group-hover:scale-102"
            />
            <span className="font-semibold text-sm tracking-tight">UNSAP Helpdesk</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#workflow" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Alur Layanan</Link>
            <Link href="#features" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Kapabilitas</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="h-10 px-4 hover:bg-muted/50 rounded-xl text-[13px] font-medium flex items-center transition-all">
              Masuk Portal
            </Link>
            <Link href="/register" className="h-10 px-4 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-[13px] font-medium flex items-center transition-all shadow-sm">
              Buat Laporan
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden hover:bg-muted/50 rounded-lg border border-border/40 transition-colors"
          >
            {mobileMenuOpen ? <Icons.close size={18} /> : <Icons.list size={18} />}
          </button>
        </nav>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-t border-border/40 bg-background overflow-hidden"
            >
              <div className="px-6 py-5 flex flex-col gap-4">
                <Link 
                  href="#workflow" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5"
                >
                  Alur Layanan
                </Link>
                <Link 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5"
                >
                  Kapabilitas
                </Link>
                <div className="h-[1px] bg-border/40 my-1" />
                <div className="flex flex-col gap-2.5">
                  <Link 
                    href="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-11 w-full border border-border/60 hover:bg-muted/50 rounded-xl text-sm font-medium flex items-center justify-center transition-all"
                  >
                    Masuk Portal
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-11 w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl text-sm font-medium flex items-center justify-center transition-all shadow-sm"
                  >
                    Buat Laporan
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <ParallaxHero />
        <InfiniteMarquee />

        {/* ── Data Metrics Section ────────────────────────── */}
        <section className="py-20 border-b border-border/40 bg-muted/10">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-4 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-lg font-medium text-foreground">Kejelasan status di setiap langkah.</h3>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-[36ch]">
                    Kami merancang sistem ini untuk menghapus birokrasi berbelit dan memberikan resolusi terpantau.
                  </p>
                </div>
              </div>
              
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:border-l lg:border-border/40 lg:pl-12">
                <div className="flex flex-col gap-1.5 border border-border/40 bg-card p-5 rounded-xl">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Rata-rata Resolusi</span>
                  <span className="text-2xl font-semibold tracking-tight text-foreground">1.5 Jam</span>
                </div>
                <div className="flex flex-col gap-1.5 border border-border/40 bg-card p-5 rounded-xl">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Unit Terintegrasi</span>
                  <span className="text-2xl font-semibold tracking-tight text-foreground">8 Fakultas</span>
                </div>
                <div className="flex flex-col gap-1.5 border border-border/40 bg-card p-5 rounded-xl">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">SLA Terpenuhi</span>
                  <span className="text-2xl font-semibold tracking-tight text-foreground">98.6%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bento Grid Capabilities Section ────────────── */}
        <section id="features" className="py-24 border-b border-border/40 bg-background">
          <div className="max-w-[1400px] mx-auto px-6">
            <StaggerReveal blur>
              <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight font-medium mb-16 max-w-[24ch] leading-tight">
                Infrastruktur pelaporan yang dirancang untuk transparansi.
              </h2>
            </StaggerReveal>

            {/* Asymmetric Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Routing Otomatis (2 Cols) */}
              <StaggerReveal delay={0.05} className="md:col-span-2 border border-border/40 bg-card rounded-2xl p-6 flex flex-col justify-between gap-6 overflow-hidden">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-muted border border-border/40 flex items-center justify-center text-foreground">
                    <Icons.send size={18} />
                  </div>
                  <h3 className="text-base font-semibold pt-1">Routing Otomatis</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[48ch]">
                    Tiket laporan secara pintar langsung diarahkan ke tim teknis fakultas atau biro yang bertanggung jawab tanpa antrean manual.
                  </p>
                </div>
                <BentoRoutingWidget />
              </StaggerReveal>

              {/* Card 2: Transparansi Penuh (1 Col) */}
              <StaggerReveal delay={0.1} className="md:col-span-1 border border-border/40 bg-card rounded-2xl p-6 flex flex-col justify-between gap-6">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-muted border border-border/40 flex items-center justify-center text-foreground">
                    <Icons.checks size={18} />
                  </div>
                  <h3 className="text-base font-semibold pt-1">Pantau Progress Real-Time</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Setiap pembaruan status, penugasan staf, hingga komentar dapat dipantau langsung oleh pelapor.
                  </p>
                </div>
                <BentoStatusWidget />
              </StaggerReveal>

              {/* Card 3: Prioritas Terstruktur (1 Col) */}
              <StaggerReveal delay={0.15} className="md:col-span-1 border border-border/40 bg-card rounded-2xl p-6 flex flex-col justify-between gap-6">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-muted border border-border/40 flex items-center justify-center text-foreground">
                    <Icons.alertCircle size={18} />
                  </div>
                  <h3 className="text-base font-semibold pt-1">Skala Prioritas</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sistem mendeteksi isu kritis seperti pemadaman Wi-Fi kampus atau kendala ujian untuk eskalasi prioritas.
                  </p>
                </div>
                
                <div className="w-full bg-muted/20 border border-border/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">KLASIFIKASI</span>
                    <span className="text-muted-foreground">SLA RESPONS</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-mono text-[10px] font-medium">Kritikal</span>
                    <span className="text-foreground font-mono text-[11px]">&lt; 30 mnt</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono text-[10px] font-medium">Tinggi</span>
                    <span className="text-foreground font-mono text-[11px]">&lt; 2 jam</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 font-mono text-[10px] font-medium">Normal</span>
                    <span className="text-foreground font-mono text-[11px]">&lt; 24 jam</span>
                  </div>
                </div>
              </StaggerReveal>

              {/* Card 4: Arsip & Knowledge Base (2 Cols) */}
              <StaggerReveal delay={0.2} className="md:col-span-2 border border-border/40 bg-card rounded-2xl p-6 flex flex-col justify-between gap-6">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-muted border border-border/40 flex items-center justify-center text-foreground">
                    <Icons.page size={18} />
                  </div>
                  <h3 className="text-base font-semibold pt-1">Basis Pengetahuan Bersama</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[48ch]">
                    Resolusi dari laporan yang sudah selesai diarsipkan menjadi basis panduan mandiri agar sivitas akademik dapat menyelesaikan masalah umum.
                  </p>
                </div>
                <BentoSearchWidget />
              </StaggerReveal>

            </div>
          </div>
        </section>

        <InteractiveWorkflow />
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="pt-20 pb-12 bg-background border-t border-border/40 text-foreground">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/UNSAP.png" 
                  alt="UNSAP Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="font-semibold text-sm tracking-tight">UNSAP Helpdesk</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-[36ch] leading-relaxed">
                Platform resolusi masalah terpadu untuk Sivitas Akademika Universitas Sebelas April.
              </p>
            </div>
            
            <div className="flex flex-col gap-3.5">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Navigasi</h4>
              <Link href="/login" className="text-xs hover:text-foreground text-muted-foreground transition-colors w-fit">Masuk Portal</Link>
              <Link href="/register" className="text-xs hover:text-foreground text-muted-foreground transition-colors w-fit">Buat Laporan</Link>
              <Link href="#workflow" className="text-xs hover:text-foreground text-muted-foreground transition-colors w-fit">Alur Layanan</Link>
            </div>
            
            <div className="flex flex-col gap-3.5">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Legalitas</h4>
              <Link href="#" className="text-xs hover:text-foreground text-muted-foreground transition-colors w-fit">Kebijakan Privasi</Link>
              <Link href="#" className="text-xs hover:text-foreground text-muted-foreground transition-colors w-fit">Syarat & Ketentuan</Link>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
            <p>&copy; {new Date().getFullYear()} Universitas Sebelas April. Hak Cipta Dilindungi.</p>
            <p className="mt-2 sm:mt-0">Sistem Layanan Terpadu v2.0</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
