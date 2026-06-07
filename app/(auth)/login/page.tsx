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
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold tracking-tight">
          {errorMsg === 'Invalid login credentials' 
            ? 'Email atau password salah.' 
            : errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[13px] font-bold uppercase tracking-wider text-text-muted ml-1">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="mahasiswa@unsap.ac.id"
            className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-border focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all font-sans text-[15px] placeholder:text-text-muted/50"
          />
          {errors.email && (
            <p className="text-red-500 text-[12px] font-medium ml-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-bold uppercase tracking-wider text-text-muted ml-1">Password</label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-border focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all font-sans text-[15px] placeholder:text-text-muted/50"
          />
          {errors.password && (
            <p className="text-red-500 text-[12px] font-medium ml-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-white font-sans font-bold text-[15px] py-4 rounded-2xl hover:bg-emerald-900 transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
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
      <h2 className="text-2xl font-serif font-bold text-text-primary mb-8 tracking-tight">
        Selamat <span className="italic text-text-muted">Datang.</span>
      </h2>

      <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="animate-spin text-accent" /></div>}>
        <LoginForm />
      </Suspense>

      <div className="mt-10 text-center pt-8 border-t border-zinc-100">
        <p className="text-[13px] text-text-secondary font-medium">
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="text-accent font-bold hover:underline underline-offset-4"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
