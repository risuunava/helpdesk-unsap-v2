'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('redirect') || '/mahasiswa'
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setErrorMsg(null)
    const supabase = createClient()
    
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setErrorMsg(error.message)
      return
    }

    router.push(nextPath)
    router.refresh() // Just in case, to update layouts
  }

  return (
    <>
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[14px] font-sans">
          {errorMsg === 'Invalid login credentials' 
            ? 'Email atau password salah.' 
            : errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[14px] font-medium text-text-secondary">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="mahasiswa@unsap.ac.id"
            className="w-full px-4 py-3 rounded-2xl bg-bg-base border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans text-[15px]"
          />
          {errors.email && (
            <p className="text-red-500 text-[13px]">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-medium text-text-secondary">Password</label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-2xl bg-bg-base border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans text-[15px]"
          />
          {errors.password && (
            <p className="text-red-500 text-[13px]">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-800 text-white font-sans font-medium text-[15px] py-3.5 rounded-2xl hover:bg-emerald-900 transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          {isSubmitting ? 'Memproses...' : 'Masuk Sekarang'}
        </button>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <div>
      <h2 className="text-[22px] font-serif font-medium text-text-primary mb-6">
        Masuk ke Akun Anda
      </h2>

      <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="animate-spin text-emerald-800" /></div>}>
        <LoginForm />
      </Suspense>

      <div className="mt-8 text-center">
        <p className="text-[14px] text-text-secondary font-sans">
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="text-emerald-700 font-medium hover:text-emerald-800 underline underline-offset-4"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
