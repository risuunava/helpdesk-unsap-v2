'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowRight, BookOpen, Brain, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react'

/* ── Animated wrapper ──────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  )
}

/* ── Feature Card ──────────────────────────────────── */
function FeatureCard({ title, desc, icon, delay }: { title: string; desc: string; icon: React.ReactNode; delay: number }) {
  return (
    <FadeUp delay={delay}>
      <motion.div whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }} transition={{ duration: 0.3 }} className="p-8 bg-bg-surface rounded-3xl border border-border relative group overflow-hidden">
        <div className="absolute w-[200px] h-[200px] rounded-full blur-[60px] opacity-0 bg-emerald-100 top-0 right-0 -translate-y-1/2 translate-x-1/2 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-full bg-emerald-50/50 flex items-center justify-center mb-6 text-emerald-600 border border-emerald-100">{icon}</div>
          <h3 className="text-[20px] font-serif font-medium text-text-primary mb-3">{title}</h3>
          <p className="text-[15px] text-text-secondary leading-[1.65] font-sans">{desc}</p>
        </div>
      </motion.div>
    </FadeUp>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col relative overflow-x-hidden">
      
      {/* ── Background Glow Effects (Light Mode) ─────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-emerald-100/60 via-teal-100/40 to-green-100/40 blur-[100px] rounded-full pointer-events-none opacity-70" />

      {/* ── NAVBAR (Capsule Terbuka) ─────────────────── */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
        <div className="flex items-center justify-between bg-bg-surface/80 backdrop-blur-xl border border-border/60 px-2 py-2 rounded-full shadow-capsule">
          <div className="flex items-center gap-3 pl-3">
             <div className="w-8 h-8 rounded-full bg-text-primary flex items-center justify-center">
              <span className="text-[13px] font-bold text-bg-surface">U</span>
            </div>
            <span className="font-serif font-medium text-[16px] text-text-primary hidden sm:block">UNSAP</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 font-sans text-[14px] text-text-secondary font-medium">
            <Link href="#fitur" className="hover:text-text-primary transition-colors">Fitur</Link>
            <Link href="#keunggulan" className="hover:text-text-primary transition-colors">Keunggulan</Link>
          </nav>

          <div className="flex items-center gap-2 pr-1">
            <Link href="/login" className="font-sans font-medium text-[14px] text-text-primary px-4 py-2 hover:bg-bg-elevated rounded-full transition-colors hidden sm:block">
              Masuk
            </Link>
            <Link href="/register" className="bg-text-primary text-bg-surface font-sans font-medium text-[14px] px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity">
              Mulai
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-6 text-center pt-32">
        <FadeUp delay={0.1}>
          <div className="inline-flex items-center gap-2 border border-border bg-white px-4 py-1.5 rounded-full mb-10 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-sans font-semibold tracking-widest uppercase text-text-secondary">
              HELPDESK CERDAS V2.0
            </span>
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <h1 className="font-serif text-[56px] md:text-[80px] lg:text-[100px] leading-[1.05] tracking-tight text-text-primary mb-8 max-w-5xl mx-auto">
            Platform Helpdesk <br className="hidden md:block" />
            <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-emerald-800 to-emerald-600">Kampus.</span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.3}>
          <p className="font-sans text-[17px] md:text-[20px] text-text-secondary max-w-2xl mx-auto leading-relaxed mb-12">
            Sistem pelaporan dan penyelesaian keluhan terpadu. Kami memadukan <strong className="text-text-primary font-semibold">kecepatan</strong>, <strong className="text-text-primary font-semibold">transparansi</strong>, dan <strong className="text-text-primary font-semibold">AI</strong> dalam satu platform.
          </p>
        </FadeUp>

        <FadeUp delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/register" className="bg-emerald-800 text-white font-sans font-medium text-[16px] px-8 py-4 rounded-full hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-emerald-900/20">
              Mulai Sekarang <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="bg-white border border-border text-text-primary font-sans font-medium text-[16px] px-8 py-4 rounded-full hover:bg-emerald-50 hover:border-emerald-200 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm group">
              <BookOpen size={18} className="text-text-secondary group-hover:text-emerald-600 transition-colors" /> Login Portal
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ── FEATURES SECTION ─────────────────────────── */}
      <section id="fitur" className="relative z-10 mx-auto max-w-6xl w-full px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Klasifikasi Cerdas" 
            desc="Sistem NLP otomatis membaca keluhan Anda dan mengarahkan tiket ke departemen yang tepat secara instan." 
            icon={<Brain size={20} />} 
            delay={0.1} 
          />
          <FeatureCard 
            title="SLA Terukur" 
            desc="Setiap tiket memiliki batas waktu penyelesaian. Sistem memberikan prioritas otomatis berdasarkan tingkat urgensi." 
            icon={<Clock size={20} />} 
            delay={0.2} 
          />
          <FeatureCard 
            title="Mode Anonim" 
            desc="Laporkan masalah sensitif dengan identitas yang dilindungi. Komunikasi tetap berjalan dua arah secara aman." 
            icon={<ShieldCheck size={20} />} 
            delay={0.3} 
          />
        </div>
      </section>

      {/* ── INFO / SHOWCASE SECTION ──────────────────── */}
      <section id="keunggulan" className="relative z-10 bg-white border-y border-border py-24 md:py-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/50 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="mx-auto max-w-6xl w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <h2 className="font-serif text-[44px] md:text-[64px] leading-[1.1] text-text-primary mb-6 tracking-tight">
              Transparansi dalam <br/> <span className="italic text-gray-500">setiap resolusi.</span>
            </h2>
            <p className="font-sans text-[18px] text-text-secondary leading-relaxed mb-10 max-w-lg">
              Tinggalkan cara lama. Kami mengubah tumpukan kertas dan antrean panjang menjadi alur kerja digital yang presisi, cepat, dan transparan bagi seluruh civitas akademika.
            </p>
            <div className="space-y-5">
              {[
                'Dashboard analitik untuk pimpinan',
                'Notifikasi real-time via Web',
                'Riwayat penyelesaian masalah',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <span className="font-sans text-[16px] font-medium text-text-secondary">{text}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="relative rounded-3xl border border-border bg-white p-6 shadow-2xl shadow-gray-200/50">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/60">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-gray-200" />
              </div>
              
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gray-50 border border-border/60 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center shrink-0 font-medium text-[13px]">MK</div>
                  <div>
                    <h4 className="font-sans text-[15px] font-semibold text-text-primary mb-1">Mila Kusuma</h4>
                    <p className="font-sans text-[14px] text-text-secondary line-clamp-2">WiFi lantai 2 gedung B tidak stabil sejak kemarin pagi. Mohon segera diperbaiki.</p>
                  </div>
                </div>
                
                <div className="p-5 rounded-2xl bg-white border border-border/40 flex items-start gap-4 opacity-60">
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-border flex items-center justify-center shrink-0 font-medium text-[13px]">AD</div>
                  <div>
                    <h4 className="font-sans text-[15px] font-semibold text-text-primary mb-1">Ahmad Dhani</h4>
                    <p className="font-sans text-[14px] text-text-secondary line-clamp-2">AC Ruang Kelas 104 bocor, air menetes ke meja mahasiswa.</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="relative z-10 py-12 bg-white">
        <div className="mx-auto max-w-6xl w-full px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center">
              <span className="text-[12px] font-bold text-white">U</span>
            </div>
            <span className="font-serif font-medium text-[18px] text-text-primary">UNSAP</span>
          </div>
          <p className="font-sans text-[14px] text-text-secondary">&copy; {new Date().getFullYear()} Universitas Sebelas April. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
