'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth.schema'
import { createClient } from '@/lib/supabase/client'

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
    <div>
      <h2 className="text-2xl font-serif font-bold text-text-primary mb-8 tracking-tight">
        Daftar Akun <span className="italic text-text-muted">Baru.</span>
      </h2>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold tracking-tight">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="space-y-2">
          <label className="text-[13px] font-bold uppercase tracking-wider text-text-muted ml-1">NIM</label>
          <input
            {...register('nim')}
            type="text"
            placeholder="12345678"
            className="w-full px-5 py-3.5 rounded-2xl bg-zinc-50 border border-border focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all font-sans text-[15px] placeholder:text-text-muted/50"
          />
          {errors.nim && <p className="text-red-500 text-[12px] font-medium ml-1">{errors.nim.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-bold uppercase tracking-wider text-text-muted ml-1">Nama Lengkap</label>
          <input
            {...register('full_name')}
            type="text"
            placeholder="Budi Santoso"
            className="w-full px-5 py-3.5 rounded-2xl bg-zinc-50 border border-border focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all font-sans text-[15px] placeholder:text-text-muted/50"
          />
          {errors.full_name && <p className="text-red-500 text-[12px] font-medium ml-1">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-bold uppercase tracking-wider text-text-muted ml-1">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="mahasiswa@unsap.ac.id"
            className="w-full px-5 py-3.5 rounded-2xl bg-zinc-50 border border-border focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all font-sans text-[15px] placeholder:text-text-muted/50"
          />
          {errors.email && <p className="text-red-500 text-[12px] font-medium ml-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-bold uppercase tracking-wider text-text-muted ml-1">Password</label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-5 py-3.5 rounded-2xl bg-zinc-50 border border-border focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all font-sans text-[15px] placeholder:text-text-muted/50"
          />
          {errors.password && <p className="text-red-500 text-[12px] font-medium ml-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-bold uppercase tracking-wider text-text-muted ml-1">Konfirmasi Password</label>
          <input
            {...register('confirm_password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-5 py-3.5 rounded-2xl bg-zinc-50 border border-border focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all font-sans text-[15px] placeholder:text-text-muted/50"
          />
          {errors.confirm_password && <p className="text-red-500 text-[12px] font-medium ml-1">{errors.confirm_password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-white font-sans font-bold text-[15px] py-4 rounded-2xl hover:bg-emerald-900 transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
        </button>
      </form>

      <div className="mt-10 text-center pt-8 border-t border-zinc-100">
        <p className="text-[13px] text-text-secondary font-medium">
          Sudah punya akun?{' '}
          <Link
            href="/login"
            className="text-accent font-bold hover:underline underline-offset-4"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
