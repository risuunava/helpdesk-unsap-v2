'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth.schema'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'motion/react'

export default function RegisterPage() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setErrorMsg(null)
    const supabase = createClient()
    
    // 1. Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          role: 'mahasiswa',
          nim: data.nim,
        },
      },
    })

    if (authError) {
      setErrorMsg(authError.message)
      return
    }

    if (!authData.session) {
      setErrorMsg('Registrasi berhasil! Silakan cek kotak masuk email Anda untuk link verifikasi. Setelah verifikasi, silakan login.')
      return
    }

    router.push('/mahasiswa')
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 className="text-3xl font-medium tracking-tight mb-2">
        Daftar Akun Baru.
      </h2>
      <p className="text-muted-foreground mb-10">
        Bergabung untuk kemudahan akses layanan terpadu kampus.
      </p>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-[13px] font-medium tracking-tight">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">NIM</label>
          <input
            {...register('nim')}
            type="text"
            placeholder="12345678"
            className="w-full px-4 py-3 rounded-md bg-transparent border border-border focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all font-sans text-[15px] placeholder:text-muted-foreground/40"
          />
          {errors.nim && <p className="text-destructive text-[12px] font-medium mt-1">{errors.nim.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Nama Lengkap</label>
          <input
            {...register('full_name')}
            type="text"
            placeholder="Budi Santoso"
            className="w-full px-4 py-3 rounded-md bg-transparent border border-border focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all font-sans text-[15px] placeholder:text-muted-foreground/40"
          />
          {errors.full_name && <p className="text-destructive text-[12px] font-medium mt-1">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Email Institusi</label>
          <input
            {...register('email')}
            type="email"
            placeholder="mahasiswa@unsap.ac.id"
            className="w-full px-4 py-3 rounded-md bg-transparent border border-border focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all font-sans text-[15px] placeholder:text-muted-foreground/40"
          />
          {errors.email && <p className="text-destructive text-[12px] font-medium mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Kata Sandi</label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-md bg-transparent border border-border focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all font-sans text-[15px] placeholder:text-muted-foreground/40"
          />
          {errors.password && <p className="text-destructive text-[12px] font-medium mt-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Konfirmasi Kata Sandi</label>
          <input
            {...register('confirm_password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-md bg-transparent border border-border focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all font-sans text-[15px] placeholder:text-muted-foreground/40"
          />
          {errors.confirm_password && <p className="text-destructive text-[12px] font-medium mt-1">{errors.confirm_password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-foreground text-background font-medium text-[14px] py-4 rounded-md hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 mt-6 active:scale-[0.98]"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-border/50">
        <p className="text-[13px] text-muted-foreground">
          Sudah mempunyai akses?{' '}
          <Link
            href="/login"
            className="text-foreground font-medium hover:underline underline-offset-4 transition-all"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
