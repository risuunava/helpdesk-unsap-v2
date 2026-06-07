'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { motion, useSpring } from 'framer-motion'
import { 
  ArrowRight, 
  Brain, 
  Clock, 
  CaretRight,
  ShieldChevron,
  Pulse,
  Monitor
} from '@phosphor-icons/react'

/* ── Refined FadeUp Component ──────────────────────── */
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ── Magnetic Button Wrapper ───────────────────────── */
function MagneticButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useSpring(0, { stiffness: 150, damping: 15 })
  const mouseY = useSpring(0, { stiffness: 150, damping: 15 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const x = (clientX - (left + width / 2)) * 0.35
    const y = (clientY - (top + height / 2)) * 0.35
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: mouseX, y: mouseY }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base selection:bg-accent/10 selection:text-accent grain-texture overflow-x-hidden">
      
      {/* ── Navigation: Unified Capsule ───────────── */}
      <header className="fixed top-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-5xl z-50">
        <nav className="flex items-center justify-between px-3 py-2 bg-white/60 backdrop-blur-xl rounded-full border border-white/40 shadow-glass">
          <Link href="/" className="flex items-center gap-2 px-3 py-1 group">
            <img 
              src="/assets/UNSAP.png" 
              alt="UNSAP Logo" 
              className="w-7 h-7 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-serif font-bold text-[16px] tracking-tight text-text-primary hidden sm:block">UNSAP</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-[13px] font-semibold text-text-secondary hover:text-accent transition-colors">Platform</Link>
            <Link href="#about" className="text-[13px] font-semibold text-text-secondary hover:text-accent transition-colors">Ecosystem</Link>
            <Link href="/login" className="text-[13px] font-semibold text-text-secondary hover:text-accent transition-colors">Log In</Link>
          </div>

          <Link href="/register" className="h-10 px-6 bg-accent text-white rounded-full text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-accent/20 hover:bg-emerald-900 transition-colors">
            Mulai <ArrowRight weight="bold" size={14} />
          </Link>
        </nav>
      </header>

      <main>
        {/* ── Hero: Centered Editorial Manifesto ───────── */}
        <section className="relative pt-32 lg:pt-40 pb-32 overflow-hidden text-center">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <FadeUp>
              <h1 className="font-serif text-[clamp(48px,9vw,110px)] leading-[0.9] tracking-tight text-text-primary mb-10">
                Kekuatan <span className="italic font-serif font-normal text-text-muted italic">Penyelesaian</span> <br /> di Tangan Anda.
              </h1>
              <p className="text-base md:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed mb-14 text-balance">
                Transformasi layanan kampus dengan AI dan transparansi total. Selesaikan kendala akademik lebih cepat dari sebelumnya.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <MagneticButton>
                  <Link href="/register" className="h-16 px-10 bg-accent text-white rounded-full font-bold text-lg flex items-center gap-2 shadow-xl shadow-accent/20 hover:shadow-accent/30 transition-all">
                    Buka Laporan <CaretRight weight="bold" size={20} />
                  </Link>
                </MagneticButton>
                <Link href="/login" className="h-16 px-10 bg-white border border-border text-text-primary rounded-full font-bold text-lg flex items-center gap-2 hover:bg-zinc-50 transition-colors shadow-sm">
                  Masuk Portal
                </Link>
              </div>
            </FadeUp>
          </div>
          
          {/* Refined Graphic Accents: Intensified Depth */}
          <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
            {/* 1. Intensified Mesh Blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  x: [-20, 20, -20],
                  y: [-20, 30, -20]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[-10%] w-[60%] aspect-square bg-accent/[0.15] blur-[140px] rounded-full" 
              />
              <motion.div 
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  x: [30, -30, 30],
                  y: [20, -40, 20]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-10%] right-[-10%] w-[60%] aspect-square bg-emerald-500/[0.12] blur-[140px] rounded-full" 
              />
              <motion.div 
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] aspect-square bg-white blur-[120px] rounded-full opacity-40" 
              />
            </div>

            {/* 2. Primary Backdrop Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,95,70,0.08),transparent_70%)]" />

            {/* 3. Architectural Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.07]" 
                 style={{ backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-text-primary) 1px, transparent 0)`, backgroundSize: '48px 48px' }} 
            />
            
            {/* 4. Central Architectural Focal Point */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[1000px] h-[1000px] border border-text-primary/[0.04] rounded-full" />
              <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-text-primary/[0.12] to-transparent" />
              <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-text-primary/[0.12] to-transparent" />
              
              <div className="absolute top-1/4 left-1/4 text-text-primary/[0.15] font-mono text-2xl">+</div>
              <div className="absolute top-1/4 right-1/4 text-text-primary/[0.15] font-mono text-2xl">+</div>
              <div className="absolute bottom-1/4 left-1/4 text-text-primary/[0.15] font-mono text-2xl">+</div>
              <div className="absolute bottom-1/4 right-1/4 text-text-primary/[0.15] font-mono text-2xl">+</div>
            </div>
            
            {/* 5. Massive Decorative Text */}
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 font-serif text-[26vw] font-bold text-text-primary/[0.02] whitespace-nowrap select-none tracking-tighter">
              UNSAP HELPDESK
            </div>

            {/* 6. Edge Scrims */}
            <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-transparent to-bg-base opacity-80" />
          </div>
        </section>

        {/* ── Logo Marquee ────────────────────────────── */}
        <section className="py-20 border-y border-border/40 overflow-hidden bg-white/50 relative z-10">
          <div className="max-w-7xl mx-auto px-6 mb-10 text-center lg:text-left">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted">Dipercaya oleh Unit Kerja Kampus</p>
          </div>
          <div className="flex gap-20 animate-marquee whitespace-nowrap">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center gap-12 text-text-muted opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-200" />
                  <span className="font-serif font-bold text-xl uppercase tracking-widest">Unit {i}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-200" />
                  <span className="font-serif font-bold text-xl uppercase tracking-widest">Fakultas {i}</span>
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={`dup-${i}`} className="flex items-center gap-12 text-text-muted opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-200" />
                  <span className="font-serif font-bold text-xl uppercase tracking-widest">Unit {i}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-200" />
                  <span className="font-serif font-bold text-xl uppercase tracking-widest">Fakultas {i}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features: Bento Grid ────────────────────── */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <FadeUp>
            <div className="mb-20 text-center lg:text-left">
              <h2 className="font-serif text-[42px] md:text-[64px] leading-[1.05] tracking-tight text-text-primary mb-6">
                Platform Modern untuk <br /> <span className="text-text-muted italic">Masa Depan Kampus.</span>
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Hero Card with Background Image */}
            <div className="md:col-span-8 group relative overflow-hidden rounded-[2.5rem]">
              <FadeUp delay={0.1}>
                <div className="h-full min-h-[480px] p-12 bg-white border border-border shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-end relative overflow-hidden">
                  <img 
                    src="https://picsum.photos/seed/ai-neural/1200/800" 
                    alt="AI Processing" 
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.03] group-hover:opacity-[0.07] transition-opacity"
                  />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center mb-8 shadow-lg shadow-accent/20">
                      <Brain size={36} weight="duotone" />
                    </div>
                    <h3 className="text-4xl font-bold text-text-primary mb-6">AI Klasifikasi Otomatis</h3>
                    <p className="text-text-secondary max-w-md text-lg leading-relaxed">
                      Lupakan proses manual. AI kami mendeteksi kategori laporan Anda dan meneruskannya ke departemen yang tepat secara instan.
                    </p>
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* Image Card (The visual break) */}
            <div className="md:col-span-4 rounded-[2.5rem] overflow-hidden border border-border">
              <FadeUp delay={0.2}>
                <img 
                  src="https://picsum.photos/seed/minimal-clock/800/1200" 
                  alt="Precision" 
                  className="w-full h-full min-h-[480px] object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </FadeUp>
            </div>

            {/* Small Card 1 */}
            <div className="md:col-span-4 group">
              <FadeUp delay={0.3}>
                <div className="h-full p-10 rounded-[2.5rem] bg-accent text-white shadow-xl shadow-accent/20 hover:-translate-y-2 transition-transform duration-500 flex flex-col justify-between min-h-[320px]">
                  <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                    <Clock size={32} weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4">SLA Terjamin</h3>
                    <p className="text-white/80 leading-relaxed">
                      Setiap keluhan memiliki batas waktu penyelesaian yang transparan dan terpantau.
                    </p>
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* Medium Card with Data Visual */}
            <div className="md:col-span-8 group">
              <FadeUp delay={0.4}>
                <div className="h-full min-h-[320px] p-12 rounded-[2.5rem] bg-white border border-border shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row items-center gap-12 overflow-hidden">
                  <div className="flex-1">
                    <div className="w-14 h-14 rounded-xl bg-zinc-50 flex items-center justify-center text-text-primary mb-8">
                      <Monitor size={32} weight="duotone" />
                    </div>
                    <h3 className="text-3xl font-bold text-text-primary mb-4">Dashboard Pimpinan</h3>
                    <p className="text-text-secondary leading-relaxed">
                      Pantau kinerja penyelesaian masalah di setiap fakultas melalui data visual yang akurat.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 w-full md:w-64">
                    {[80, 45, 95].map((w, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-text-muted">
                          <span>Department {i+1}</span>
                          <span>{w}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            whileInView={{ width: `${w}%` }} 
                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                            className="h-full bg-accent" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ── Ecosystem Section ─────────────────────── */}
        <section id="about" className="bg-zinc-950 text-white py-32 md:py-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10">
             <div>
                <FadeUp>
                  <div className="w-12 h-1 px-0 bg-accent mb-12" />
                  <h2 className="font-serif text-[clamp(40px,6vw,72px)] leading-[1] tracking-tighter mb-10">
                    Transparansi yang <br /> <span className="text-zinc-500 italic">Membangun Kepercayaan.</span>
                  </h2>
                  <p className="text-xl text-zinc-400 leading-relaxed mb-16 max-w-xl">
                    Kami percaya bahwa setiap keluhan adalah peluang untuk tumbuh. Dengan UNSAP Helpdesk, seluruh proses resolusi dapat dipantau secara real-time.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    {[
                      { label: 'Resolusi Tepat Waktu', val: '98%' },
                      { label: 'Layanan Mandiri', val: '24/7' },
                      { label: 'Kepuasan Pengguna', val: '4.9/5' },
                      { label: 'Unit Terintegrasi', val: '12+' },
                    ].map((stat, i) => (
                      <div key={i} className="group cursor-default">
                        <div className="text-5xl font-serif font-bold text-white mb-2 group-hover:text-accent transition-colors">{stat.val}</div>
                        <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </FadeUp>
             </div>
             
             <div className="relative">
                <FadeUp delay={0.2}>
                  <div className="aspect-square rounded-[3rem] border border-white/10 overflow-hidden group shadow-2xl">
                     <img 
                        src="https://picsum.photos/seed/unsap-night/1000/1000" 
                        alt="Security" 
                        className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                     <div className="absolute bottom-12 left-12 right-12">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-10 h-10 rounded-full bg-accent/20 backdrop-blur-md border border-accent/20 flex items-center justify-center text-accent">
                              <ShieldChevron weight="bold" size={20} />
                           </div>
                           <span className="text-xs font-bold tracking-widest uppercase text-white/60">Enkripsi Data 256-bit</span>
                        </div>
                        <h4 className="text-2xl font-bold text-white leading-tight">Privasi Anda adalah prioritas utama dalam setiap laporan.</h4>
                     </div>
                  </div>
                </FadeUp>
             </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white">
              <span className="font-bold text-[12px]">U</span>
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-text-primary">UNSAP</span>
          </div>
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Universitas Sebelas April. Didukung oleh AI Terintegrasi.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-sm font-medium text-text-muted hover:text-accent transition-colors">Privacy</Link>
            <Link href="#" className="text-sm font-medium text-text-muted hover:text-accent transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
