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
      <h2 className="text-[22px] font-serif font-medium text-text-primary mb-6">
        Daftar Akun Baru
      </h2>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[14px] font-sans">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="space-y-2">
          <label className="text-[14px] font-medium text-text-secondary">NIM</label>
          <input
            {...register('nim')}
            type="text"
            placeholder="12345678"
            className="w-full px-4 py-3 rounded-2xl bg-bg-base border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans text-[15px]"
          />
          {errors.nim && <p className="text-red-500 text-[13px]">{errors.nim.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-medium text-text-secondary">Nama Lengkap</label>
          <input
            {...register('full_name')}
            type="text"
            placeholder="Budi Santoso"
            className="w-full px-4 py-3 rounded-2xl bg-bg-base border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans text-[15px]"
          />
          {errors.full_name && <p className="text-red-500 text-[13px]">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-medium text-text-secondary">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="mahasiswa@unsap.ac.id"
            className="w-full px-4 py-3 rounded-2xl bg-bg-base border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans text-[15px]"
          />
          {errors.email && <p className="text-red-500 text-[13px]">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-medium text-text-secondary">Password</label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-2xl bg-bg-base border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans text-[15px]"
          />
          {errors.password && <p className="text-red-500 text-[13px]">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-medium text-text-secondary">Konfirmasi Password</label>
          <input
            {...register('confirm_password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-2xl bg-bg-base border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans text-[15px]"
          />
          {errors.confirm_password && <p className="text-red-500 text-[13px]">{errors.confirm_password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-800 text-white font-sans font-medium text-[15px] py-3.5 rounded-2xl hover:bg-emerald-900 transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-4"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-[14px] text-text-secondary font-sans">
          Sudah punya akun?{' '}
          <Link
            href="/login"
            className="text-emerald-700 font-medium hover:text-emerald-800 underline underline-offset-4"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
