'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useReducedMotion, useSpring } from 'motion/react'
import { 
  ArrowRight, 
  Checks, 
  ClockClockwise, 
  ShieldCheck,
  Lightning,
  MagnifyingGlass
} from '@phosphor-icons/react'

/* ── Minimalist Staggered Reveal ──────────────────────── */
function StaggerReveal({ children, delay = 0, className = "", blur = false }: { children: React.ReactNode; delay?: number; className?: string; blur?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16, filter: blur ? "blur(12px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
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

/* ── Infinite Marquee ─────────────────────────────────── */
function InfiniteMarquee() {
  const items = [
    "Fakultas Teknik", "Fakultas Ekonomi", "Biro Administrasi", 
    "UPT Perpustakaan", "Fakultas Ilmu Budaya", "Lembaga Penelitian",
    "Fakultas Hukum", "UPT Teknologi Informasi"
  ];

  return (
    <section className="py-12 border-b border-border/50 bg-background overflow-hidden flex items-center relative">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <motion.div
        className="flex gap-20 pr-20 whitespace-nowrap min-w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 40,
        }}
      >
        {/* Render twice for seamless loop */}
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-4 text-muted-foreground/50 hover:text-foreground transition-colors duration-300">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground/50">{item.charAt(0)}</span>
            </div>
            <span className="font-mono text-sm uppercase tracking-widest">{item}</span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

/* ── Sticky Parallax Section ──────────────────────────── */
function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} className="relative min-h-[100dvh] flex items-center pt-24 overflow-hidden border-b border-border/50">
      <div className="absolute inset-0 bg-background z-0" />
      
      {/* Abstract Architectural Background instead of blobs */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0 pointer-events-none flex items-center justify-end pr-[5%] opacity-20">
        <div className="w-[60vw] aspect-square rounded-full border-[1px] border-border/60 absolute right-[-10vw] top-[-10vh]" />
        <div className="w-[45vw] aspect-square rounded-full border-[1px] border-border/80 absolute right-[-2vw] top-[5vh]" />
        <div className="w-[30vw] aspect-square rounded-full border-[1px] border-foreground/10 absolute right-[5vw] top-[15vh]" />
      </motion.div>

      <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <StaggerReveal>
            <div className="inline-flex items-center gap-3 px-3 py-1.5 border border-border rounded-full bg-background/80 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-[0.1em] text-foreground/70">Sistem Layanan Terpadu v2.0</span>
            </div>
          </StaggerReveal>
          
          <StaggerReveal delay={0.1} blur>
            <h1 className="text-[clamp(3rem,6vw,5.5rem)] leading-[1.05] tracking-tight font-medium text-foreground mb-6">
              Resolusi cepat untuk <br />
              <span className="text-muted-foreground italic font-serif">kampus yang bergerak maju.</span>
            </h1>
          </StaggerReveal>
          
          <StaggerReveal delay={0.2} blur>
            <p className="text-lg md:text-xl text-muted-foreground max-w-[50ch] leading-relaxed mb-10 text-balance">
              Layanan bantuan akademik dan infrastruktur yang transparan, terpantau, dan diselesaikan sesuai SLA. Tanpa birokrasi berbelit.
            </p>
          </StaggerReveal>
          
          <StaggerReveal delay={0.3}>
            <div className="flex flex-wrap items-center gap-4">
              <MagneticWrap strength={0.3}>
                <Link href="/register" className="h-14 px-8 bg-foreground text-background rounded-full font-medium text-[15px] flex items-center gap-3 hover:scale-[0.98] transition-transform active:scale-95 shadow-lg shadow-foreground/10">
                  Buat Laporan Baru <ArrowRight weight="bold" size={16} />
                </Link>
              </MagneticWrap>
              <MagneticWrap strength={0.15}>
                <Link href="/login" className="h-14 px-8 bg-transparent border border-border text-foreground rounded-full font-medium text-[15px] flex items-center gap-3 hover:bg-muted/50 transition-colors">
                  Cek Status Tiket
                </Link>
              </MagneticWrap>
            </div>
          </StaggerReveal>
        </div>

        <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative">
          <StaggerReveal delay={0.4} className="w-full">
            {/* Contextual UI preview rather than generic images */}
            <div className="w-full aspect-[4/5] bg-muted/30 border border-border/50 rounded-2xl p-6 relative shadow-2xl flex flex-col gap-4 overflow-hidden backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                <div className="w-24 h-4 bg-border/80 rounded-sm" />
                <div className="w-8 h-8 rounded-full bg-border/80" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full p-4 bg-background border border-border rounded-xl shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between">
                    <div className="w-16 h-3 bg-accent/20 rounded-sm" />
                    <div className="w-12 h-3 bg-border rounded-sm" />
                  </div>
                  <div className="w-3/4 h-4 bg-foreground/80 rounded-sm" />
                  <div className="w-1/2 h-3 bg-muted-foreground/30 rounded-sm" />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
            </div>
          </StaggerReveal>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20 selection:text-accent font-sans">
      
      {/* ── Navigation: Floating Capsule ───────────── */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl z-50">
        <nav className="h-16 px-4 sm:px-6 bg-background/70 backdrop-blur-xl rounded-full border border-border/60 shadow-sm flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/assets/UNSAP.png" 
              alt="UNSAP Logo" 
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-semibold text-base tracking-tight hidden sm:block">UNSAP Helpdesk</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#workflow" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Alur Layanan</Link>
            <Link href="#features" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Kapabilitas</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Masuk
            </Link>
            <Link href="/register" className="h-9 px-5 bg-foreground text-background rounded-full text-[13px] font-medium flex items-center hover:bg-foreground/90 transition-colors shadow-sm">
              Portal Akademik
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <ParallaxHero />
        <InfiniteMarquee />

        {/* ── Data Reality Section: No Fake Metric Grids ────────────────────── */}
        <section className="py-24 border-b border-border/50 bg-muted/20">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-12">
              <div className="md:col-span-1 flex flex-col justify-between">
                <h3 className="text-lg font-medium">Bukan sekadar form pelaporan.</h3>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  Kami membangun sistem yang mengutamakan kecepatan respons dan kejelasan status tiket di setiap departemen.
                </p>
              </div>
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8 border-l border-border/50 pl-8">
                <div className="flex flex-col gap-2">
                  <span className="text-3xl font-light tracking-tight">Real-time</span>
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Pelacakan Status</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-3xl font-light tracking-tight">Terintegrasi</span>
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Lintas Fakultas</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-3xl font-light tracking-tight">Terukur</span>
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">SLA Penyelesaian</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Capabilities: Clean List over Bento Boxes ────────────────────── */}
        <section id="features" className="py-32">
          <div className="max-w-[1400px] mx-auto px-6">
            <StaggerReveal blur>
              <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] leading-tight tracking-tight font-medium mb-20 max-w-[20ch]">
                Infrastruktur pelaporan yang dirancang untuk kejelasan.
              </h2>
            </StaggerReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {[
                {
                  icon: <Lightning size={24} weight="light" />,
                  title: "Routing Otomatis",
                  desc: "Sistem mengenali jenis laporan dan langsung meneruskannya ke departemen terkait. Mengurangi waktu tunggu."
                },
                {
                  icon: <MagnifyingGlass size={24} weight="light" />,
                  title: "Transparansi Penuh",
                  desc: "Lihat siapa yang sedang menangani tiket Anda dan langkah apa yang sedang dikerjakan saat ini."
                },
                {
                  icon: <ShieldCheck size={24} weight="light" />,
                  title: "Prioritas Terstruktur",
                  desc: "Isu kritikal kampus mendapatkan eskalasi otomatis. Tidak ada laporan penting yang terabaikan."
                },
                {
                  icon: <ClockClockwise size={24} weight="light" />,
                  title: "Arsip Resolusi",
                  desc: "Seluruh kendala yang pernah diselesaikan tersimpan sebagai basis pengetahuan untuk penanganan masa depan."
                }
              ].map((feat, i) => (
                <StaggerReveal key={i} delay={0.1 * i} className="flex flex-col gap-5 group border-t border-border pt-6">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors duration-500">
                    {feat.icon}
                  </div>
                  <h3 className="text-xl font-medium">{feat.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feat.desc}
                  </p>
                </StaggerReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Workflow: Split Screen Architectural ────────────────────── */}
        <section id="workflow" className="min-h-screen bg-foreground text-background flex items-center py-24">
          <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="flex flex-col justify-center">
              <StaggerReveal blur>
                <h2 className="text-[clamp(3rem,5vw,4.5rem)] leading-[1.1] tracking-tight font-medium mb-8">
                  Satu portal untuk semua kebutuhan operasional.
                </h2>
              </StaggerReveal>
              <StaggerReveal delay={0.1} blur>
                <p className="text-xl text-background/70 mb-12 max-w-[40ch] leading-relaxed">
                  Tinggalkan komunikasi terpisah melalui grup pesan. UNSAP Helpdesk memusatkan laporan akademik, IT, dan fasilitas dalam satu jalur.
                </p>
              </StaggerReveal>
                
              <StaggerReveal delay={0.2}>
                <ul className="flex flex-col gap-6">
                  {["Buat laporan dengan konteks lengkap.", "Dapatkan notifikasi perubahan status.", "Beri umpan balik setelah resolusi."].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-background/80 group">
                      <div className="mt-1 min-w-5 text-background/40 group-hover:text-accent transition-colors"><Checks size={20} weight="bold" /></div>
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </StaggerReveal>
            </div>
            
            <div className="flex items-center justify-center lg:justify-end">
              <StaggerReveal delay={0.2} className="w-full max-w-md">
                <div className="aspect-[3/4] bg-background/5 border border-background/10 rounded-3xl p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-center opacity-50">
                    <span className="font-mono text-sm uppercase tracking-widest">Sistem Aktif</span>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-5 bg-background text-foreground rounded-2xl">
                      <div className="text-xs text-muted-foreground mb-2">Tiket #4091</div>
                      <div className="font-medium text-lg">Perbaikan Jaringan Gedung B</div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Selesai</span>
                        <span className="text-xs text-muted-foreground">Hari ini, 09:41</span>
                      </div>
                    </div>
                    
                    <div className="p-5 bg-background/10 text-background rounded-2xl opacity-60">
                      <div className="text-xs text-background/60 mb-2">Tiket #4092</div>
                      <div className="font-medium text-lg">Akses Portal Akademik</div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="px-3 py-1 border border-background/20 text-background/80 text-xs font-semibold rounded-full">Dalam Proses</span>
                        <span className="text-xs text-background/60">Hari ini, 10:15</span>
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerReveal>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer: Stripped back and structured ─────────────────────────────────── */}
      <footer className="pt-24 pb-12 bg-background border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="/assets/UNSAP.png" 
                  alt="UNSAP Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="font-semibold text-lg tracking-tight">UNSAP Helpdesk</span>
              </div>
              <p className="text-muted-foreground max-w-[40ch] leading-relaxed">
                Platform resolusi masalah terpadu untuk Sivitas Akademika Universitas Sebelas April.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Navigasi</h4>
              <Link href="/login" className="text-sm hover:text-foreground text-muted-foreground transition-colors w-fit">Portal Masuk</Link>
              <Link href="/register" className="text-sm hover:text-foreground text-muted-foreground transition-colors w-fit">Pendaftaran</Link>
              <Link href="#workflow" className="text-sm hover:text-foreground text-muted-foreground transition-colors w-fit">Cara Kerja</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Legal</h4>
              <Link href="#" className="text-sm hover:text-foreground text-muted-foreground transition-colors w-fit">Privasi Data</Link>
              <Link href="#" className="text-sm hover:text-foreground text-muted-foreground transition-colors w-fit">Ketentuan Layanan</Link>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-border/50 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Universitas Sebelas April.</p>
            <p className="mt-2 sm:mt-0">Sistem Layanan Terpadu v2.0</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
