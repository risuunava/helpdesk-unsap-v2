'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { toast } from 'sonner'
import { Icons } from '@/components/icons'
import { updateUserRoleAction, deleteUserAction } from './actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Profile {
  id: string
  nim: string | null
  full_name: string
  role: string
  department: string | null
  avatar_url: string | null
  created_at: string | null
  updated_at: string | null
}

interface UserTableProps {
  initialProfiles: Profile[]
  currentAdminId: string
  departments: string[]
}

const ITEMS_PER_PAGE = 10

export default function UserTable({ initialProfiles, currentAdminId, departments }: UserTableProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('semua')
  const [selectedDept, setSelectedDept] = useState<string>('semua')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Pending transitions
  const [isPending, startTransition] = useTransition()
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  
  // Deletion State
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 1. Calculate general stats from initial profiles
  const stats = useMemo(() => {
    const total = profiles.length
    const masterAdmins = profiles.filter((p) => p.role === 'master_admin').length
    const admins = profiles.filter((p) => p.role === 'admin').length
    const mahasiswa = profiles.filter((p) => p.role === 'mahasiswa').length
    return { total, masterAdmins, admins, mahasiswa }
  }, [profiles])

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }

  // Generate dynamic soft theme-based avatar colors
  const getAvatarStyle = (name: string) => {
    const colors = [
      'bg-red-500/10 text-red-500 border-red-500/20 dark:text-red-400 dark:border-red-500/30',
      'bg-orange-500/10 text-orange-500 border-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
      'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
      'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
      'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30',
      'bg-violet-500/10 text-violet-500 border-violet-500/20 dark:text-violet-400 dark:border-violet-500/30',
      'bg-purple-500/10 text-purple-500 border-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
      'bg-pink-500/10 text-pink-500 border-pink-500/20 dark:text-pink-400 dark:border-pink-500/30',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  // Dynamic filter logic
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // 1. Search Query Match
      const matchesSearch =
        p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.nim && p.nim.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.department && p.department.toLowerCase().includes(searchQuery.toLowerCase()))

      // 2. Role Filter Match
      const matchesRole = selectedRole === 'semua' || p.role === selectedRole

      // 3. Department Filter Match
      const matchesDept = selectedDept === 'semua' || p.department === selectedDept

      return matchesSearch && matchesRole && matchesDept
    })
  }, [profiles, searchQuery, selectedRole, selectedDept])

  // Pagination Math
  const totalItems = filteredProfiles.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1
  const paginatedProfiles = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProfiles.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [filteredProfiles, currentPage])

  // Handle page resets when filters change
  const handleRoleChange = (role: string) => {
    setSelectedRole(role)
    setCurrentPage(1)
  }

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDept(e.target.value)
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  // Action: Update User Role
  const handleUpdateRole = (userId: string, newRole: 'mahasiswa' | 'admin' | 'master_admin') => {
    setUpdatingUserId(userId)
    startTransition(async () => {
      try {
        const res = await updateUserRoleAction(userId, newRole)
        if (res.success) {
          setProfiles((prev) =>
            prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
          )
          toast.success('Berhasil mengubah role pengguna.')
        } else {
          toast.error(res.error || 'Gagal mengubah role.')
        }
      } catch (err) {
        toast.error('Terjadi kesalahan koneksi.')
      } finally {
        setUpdatingUserId(null)
      }
    })
  }

  // Action: Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete) return
    setDeleting(true)
    try {
      const res = await deleteUserAction(userToDelete.id)
      if (res.success) {
        setProfiles((prev) => prev.filter((p) => p.id !== userToDelete.id))
        toast.success(`Berhasil menghapus akun ${userToDelete.name}.`)
        setUserToDelete(null)
      } else {
        toast.error(res.error || 'Gagal menghapus pengguna.')
      }
    } catch (err) {
      toast.error('Terjadi kesalahan server.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* 1. Metrics Bar - Borderless Dashboard Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 border border-border/40 rounded-xl bg-card/25 backdrop-blur-[2px]">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">Total Pengguna</span>
          <span className="text-3xl font-extrabold tracking-tight text-foreground">{stats.total}</span>
        </div>
        <div className="flex flex-col gap-1 border-l border-border/40 pl-6">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">Master Admin</span>
          <span className="text-3xl font-extrabold tracking-tight text-destructive">{stats.masterAdmins}</span>
        </div>
        <div className="flex flex-col gap-1 border-l border-border/40 pl-6">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">Admin</span>
          <span className="text-3xl font-extrabold tracking-tight text-primary">{stats.admins}</span>
        </div>
        <div className="flex flex-col gap-1 border-l border-border/40 pl-6">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">Mahasiswa</span>
          <span className="text-3xl font-extrabold tracking-tight text-foreground/80">{stats.mahasiswa}</span>
        </div>
      </div>

      {/* 2. Controls Panel (Search, Role Tabs, Prodi Select) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama, NIM, atau prodi..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-9 pl-9 pr-8 bg-background border border-border/80 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring placeholder:text-muted-foreground/60"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setCurrentPage(1)
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Icons.close size={12} />
            </button>
          )}
        </div>

        {/* Filters and Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Tabs */}
          <div className="inline-flex rounded-lg border border-border/80 bg-muted/20 p-0.5">
            {[
              { id: 'semua', label: 'Semua' },
              { id: 'master_admin', label: 'Master' },
              { id: 'admin', label: 'Admin' },
              { id: 'mahasiswa', label: 'Mhs' },
            ].map((tab) => {
              const isActive = selectedRole === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleRoleChange(tab.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    isActive
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Department Select Filter */}
          <select
            value={selectedDept}
            onChange={handleDeptChange}
            className="h-9 px-3 bg-background border border-border/80 rounded-lg text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring"
          >
            <option value="semua">Semua Prodi / Dept</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden shadow-sm backdrop-blur-[2px]">
        {filteredProfiles.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
            <Icons.teams className="h-8 w-8 text-muted-foreground/40 stroke-[1.5]" />
            <p className="font-medium">Tidak ada pengguna yang cocok.</p>
            <p className="text-xs text-muted-foreground/60">Coba ubah filter pencarian Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow className="border-b border-border/30">
                  <TableHead className="px-6 py-3.5 font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">Pengguna</TableHead>
                  <TableHead className="px-6 py-3.5 font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">NIM / NIP</TableHead>
                  <TableHead className="px-6 py-3.5 font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">Role</TableHead>
                  <TableHead className="px-6 py-3.5 font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">Prodi / Dept</TableHead>
                  <TableHead className="px-6 py-3.5 font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">Tanggal Terdaftar</TableHead>
                  <TableHead className="px-6 py-3.5 font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/20">
                {paginatedProfiles.map((p) => {
                  const isSelf = p.id === currentAdminId
                  const initials = getInitials(p.full_name)
                  const avatarColorClass = getAvatarStyle(p.full_name)
                  const isChangingRole = updatingUserId === p.id

                  const formattedDate = p.created_at
                    ? new Date(p.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-'

                  return (
                    <TableRow key={p.id} className="transition-colors hover:bg-muted/20 border-b border-border/10">
                      {/* Name & Avatar */}
                      <TableCell className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${avatarColorClass}`}
                          >
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                              {p.full_name}
                              {isSelf && (
                                <span className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                  Anda
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* NIM / NIP */}
                      <TableCell className="px-6 py-3 font-mono text-xs">
                        {p.nim ? (
                          <span className="bg-muted/50 border border-border/40 px-2 py-0.5 rounded text-muted-foreground font-semibold">
                            {p.nim}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </TableCell>

                      {/* Role Badge */}
                      <TableCell className="px-6 py-3">
                        {isChangingRole ? (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <Icons.spinner className="animate-spin h-3.5 w-3.5" />
                            <span>Mengubah...</span>
                          </div>
                        ) : (
                          <Badge
                            variant={
                              p.role === 'master_admin'
                                ? 'destructive'
                                : p.role === 'admin'
                                ? 'default'
                                : 'secondary'
                            }
                            className={`text-[10px] uppercase tracking-wider font-semibold py-0.5 px-2.5 ${
                              p.role === 'mahasiswa'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 border-emerald-500/10'
                                : p.role === 'admin'
                                ? 'bg-primary/10 text-primary hover:bg-primary/15 border-primary/10'
                                : ''
                            }`}
                          >
                            {p.role.replace('_', ' ')}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Prodi / Dept */}
                      <TableCell className="px-6 py-3 text-xs text-muted-foreground font-medium">
                        {p.department || <span className="text-muted-foreground/30">-</span>}
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell className="px-6 py-3 text-xs text-muted-foreground font-medium">
                        {formattedDate}
                      </TableCell>

                      {/* Actions (Update Role dropdown & Delete button) */}
                      <TableCell className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Change Role Trigger */}
                          {!isSelf && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  disabled={isChangingRole}
                                >
                                  <Icons.userPen size={15} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  Ubah Role Ke:
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(p.id, 'mahasiswa')}
                                  disabled={p.role === 'mahasiswa'}
                                  className="text-xs py-2 font-medium"
                                >
                                  Mahasiswa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(p.id, 'admin')}
                                  disabled={p.role === 'admin'}
                                  className="text-xs py-2 font-medium"
                                >
                                  Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(p.id, 'master_admin')}
                                  disabled={p.role === 'master_admin'}
                                  className="text-xs py-2 font-medium text-destructive hover:text-destructive focus:text-destructive"
                                >
                                  Master Admin
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                          {/* Delete Trigger */}
                          {!isSelf && (
                            <Button
                              onClick={() => setUserToDelete({ id: p.id, name: p.full_name })}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Icons.trash size={15} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 4. Pagination Panel */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/20 bg-muted/5 text-xs text-muted-foreground font-medium">
            <div>
              Menampilkan {Math.min(totalItems, (currentPage - 1) * ITEMS_PER_PAGE + 1)} -{' '}
              {Math.min(totalItems, currentPage * ITEMS_PER_PAGE)} dari {totalItems} pengguna
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                disabled={currentPage === 1}
                className="h-7 text-xs"
              >
                Sebelumnya
              </Button>
              <div className="flex items-center justify-center px-3 font-semibold text-foreground bg-muted/40 h-7 rounded border border-border/40">
                Hal {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                disabled={currentPage === totalPages}
                className="h-7 text-xs"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Centralized Alert Dialog for User Deletion */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Akun Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus akun milik <strong>{userToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan dan pengguna tidak akan bisa masuk ke dalam portal ini lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleDeleteUser()
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
