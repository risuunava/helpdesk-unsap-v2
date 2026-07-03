'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'motion/react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('redirect') || '/mahasiswa'
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const emailValue = watch('email')

  const onSubmit = async (data: LoginInput) => {
    setErrorMsg(null)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        if (error.message === 'Invalid login credentials') {
          const res = await fetch('/api/auth/check-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email }),
          })
          const { exists } = await res.json()
          setErrorMsg(exists ? 'Password salah.' : 'Email belum terdaftar.')
        } else if (error.message === 'Email not confirmed') {
          setErrorMsg('Email belum dikonfirmasi. Silakan cek inbox email Anda.')
        } else {
          setErrorMsg(error.message)
        }
        return
      }

      router.push(nextPath)
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan jaringan. Silakan coba lagi.')
    }
  }

  return (
    <>
      {errorMsg && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-[13px] font-medium tracking-tight">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Alamat Email</label>
          <div className="relative">
            <input
              {...register('email')}
              type="email"
              placeholder="mahasiswa@unsap.ac.id"
              className="w-full px-4 py-3 pr-11 rounded-md bg-transparent border border-border focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all font-sans text-[15px] placeholder:text-muted-foreground/40"
            />
            {emailValue && (
              <button
                type="button"
                onClick={() => setValue('email', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
          {errors.email && (
            <p className="text-destructive text-[12px] font-medium mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Kata Sandi</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-11 rounded-md bg-transparent border border-border focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all font-sans text-[15px] placeholder:text-muted-foreground/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-[12px] font-medium mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-foreground text-background font-medium text-[14px] py-4 rounded-md hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Memproses...' : 'Masuk ke Portal'}
        </button>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 className="text-3xl font-medium tracking-tight mb-2">
        Selamat Datang.
      </h2>
      <p className="text-muted-foreground mb-10">
        Silakan masuk ke akun Anda untuk melanjutkan.
      </p>

      <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="animate-spin text-foreground/50" /></div>}>
        <LoginForm />
      </Suspense>

      <div className="mt-10 pt-8 border-t border-border/50 flex justify-between items-center">
        <Link
          href="/forgot-password"
          className="text-[13px] text-muted-foreground hover:text-foreground font-medium hover:underline underline-offset-4 transition-all"
        >
          Lupa kata sandi?
        </Link>
      </div>
    </motion.div>
  )
}
