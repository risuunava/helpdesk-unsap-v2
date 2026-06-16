'use client'

import React, { useState, useRef } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { importUsersAction } from './actions'

export default function ImportUsersDialog() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResults(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const ext = droppedFile.name.split('.').pop()?.toLowerCase()
      if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') {
        setFile(droppedFile)
        setResults(null)
      } else {
        toast.error('Hanya mendukung file Excel (.xlsx, .xls) atau CSV.')
      }
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Silakan pilih file terlebih dahulu.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await importUsersAction(formData)

      if (res.success && res.results) {
        setResults(res.results)
        if (res.results.failed === 0) {
          toast.success(`Berhasil mengimpor semua data (${res.results.success} user).`)
          setFile(null)
          if (fileInputRef.current) fileInputRef.current.value = ''
        } else if (res.results.success > 0) {
          toast.warning(`Berhasil mengimpor ${res.results.success} user, namun ${res.results.failed} user gagal.`)
        } else {
          toast.error(`Semua data (${res.results.failed} user) gagal diimpor.`)
        }
      } else {
        toast.error(res.error || 'Gagal mengimpor data user.')
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat mengunggah file.')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) {
          setFile(null)
          setResults(null)
          setUploading(false)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="flex items-center gap-2 text-xs font-semibold shadow-xs">
          <Icons.upload size={14} className="stroke-[2]" />
          Import CSV / Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card/95 border border-border/80 shadow-lg backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold tracking-tight">Import Akun Pengguna</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Unggah file Excel (`.xlsx`, `.xls`) atau `.csv` untuk mendaftarkan mahasiswa, dosen, atau staf secara massal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* File Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-muted/10 transition-all duration-200 ${
              file ? 'border-primary/50 bg-primary/5' : 'border-border/80 hover:border-muted-foreground/50'
            }`}
          >
            <div className={`p-2.5 rounded-full border ${file ? 'border-primary/20 bg-primary/10 text-primary' : 'border-border bg-muted/40 text-muted-foreground'}`}>
              <Icons.upload className="h-5 w-5 stroke-[1.5]" />
            </div>

            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              id="file-import-input"
            />

            {!file ? (
              <div className="text-center space-y-1">
                <label
                  htmlFor="file-import-input"
                  className="text-xs font-bold cursor-pointer text-primary hover:underline"
                >
                  Pilih file Excel / CSV
                </label>
                <p className="text-[10px] text-muted-foreground">
                  atau seret dan taruh file Anda di sini
                </p>
              </div>
            ) : (
              <div className="text-center w-full max-w-xs space-y-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <Icons.page className="h-4 w-4 shrink-0 text-primary" />
                    <span className="font-semibold text-foreground truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap mr-2">
                    {formatFileSize(file.size)}
                  </span>
                  <button
                    onClick={handleRemoveFile}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Icons.close size={14} className="stroke-[2]" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Help / Instructions */}
          <div className="p-4 rounded-xl border border-border/40 bg-muted/20 text-[11px] text-muted-foreground space-y-2">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <Icons.info className="h-3.5 w-3.5 text-primary stroke-[2]" />
                Petunjuk Format File
              </span>
              <a
                href="/contoh_import_user.csv"
                download="contoh_import_user.csv"
                className="text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <Icons.chevronDown size={12} className="-rotate-90 stroke-[2]" />
                Unduh Format Contoh (.csv)
              </a>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground/90">
              <li>Header file wajib: <code className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">Email</code>, <code className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">Nama Lengkap</code>, <code className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">NIM</code>, <code className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">Role</code>.</li>
              <li>Role yang didukung: <code className="font-mono">mahasiswa</code>, <code className="font-mono">admin</code>, atau <code className="font-mono">master_admin</code>.</li>
              <li>Password default: Berdasarkan kolom password/sandi di file, NIM/NIP user, atau default ke <code className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">unsap12345</code>.</li>
            </ul>
          </div>

          {/* Results Reporting */}
          {results && (
            <div className="p-4 rounded-xl bg-card border border-border/60 text-xs space-y-3 shadow-2xs">
              <div className="font-bold flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-foreground">Laporan Import</span>
                <div className="flex gap-3">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Sukses: {results.success}
                  </span>
                  <span className="text-destructive font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    Gagal: {results.failed}
                  </span>
                </div>
              </div>
              {results.errors.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Detail Kesalahan</span>
                  <div className="max-h-28 overflow-y-auto divide-y divide-border/20 border-l-2 border-destructive pl-2 text-[11px] text-muted-foreground/80 space-y-1">
                    {results.errors.map((err, i) => (
                      <div key={i} className="py-1 flex items-start gap-1.5">
                        <span className="text-destructive font-bold shrink-0">•</span>
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 border-t border-border/30 pt-3">
          <DialogClose asChild>
            <Button variant="outline" size="sm" disabled={uploading} className="text-xs">
              Tutup
            </Button>
          </DialogClose>
          <Button
            onClick={handleUpload}
            size="sm"
            disabled={uploading || !file}
            isLoading={uploading}
            className="text-xs font-semibold"
          >
            Mulai Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
