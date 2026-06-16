'use client'

import React, { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { updatePasswordSchema, type UpdatePasswordInput } from '@/lib/validations/auth.schema'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'motion/react'

function UpdatePasswordForm() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
  })

  const onSubmit = async (data: UpdatePasswordInput) => {
    setErrorMsg(null)
    setSuccessMsg(null)
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (error) {
      setErrorMsg(error.message)
      return
    }

    setSuccessMsg('Kata sandi berhasil diperbarui. Mengalihkan...')
    setTimeout(() => {
      router.push('/login')
      router.refresh()
    }, 2000)
  }

  return (
    <>
      {errorMsg && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-[13px] font-medium tracking-tight">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-[13px] font-medium tracking-tight">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Kata Sandi Baru</label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-md bg-transparent border border-border focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all font-sans text-[15px] placeholder:text-muted-foreground/40"
          />
          {errors.password && (
            <p className="text-destructive text-[12px] font-medium mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Konfirmasi Kata Sandi Baru</label>
          <input
            {...register('confirm_password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-md bg-transparent border border-border focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all font-sans text-[15px] placeholder:text-muted-foreground/40"
          />
          {errors.confirm_password && (
            <p className="text-destructive text-[12px] font-medium mt-1">{errors.confirm_password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-foreground text-background font-medium text-[14px] py-4 rounded-md hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
        </button>
      </form>
    </>
  )
}

export default function UpdatePasswordPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 className="text-3xl font-medium tracking-tight mb-2">
        Setel Ulang Kata Sandi.
      </h2>
      <p className="text-muted-foreground mb-10">
        Silakan masukkan kata sandi baru Anda di bawah ini.
      </p>

      <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="animate-spin text-foreground/50" /></div>}>
        <UpdatePasswordForm />
      </Suspense>
    </motion.div>
  )
}
