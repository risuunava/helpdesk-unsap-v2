'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import * as XLSX from 'xlsx'

export async function importUsersAction(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) {
      return { success: false, error: 'File tidak ditemukan' }
    }

    const bytes = await file.arrayBuffer()
    const workbook = XLSX.read(bytes, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json<any>(sheet)

    if (data.length === 0) {
      return { success: false, error: 'File Excel/CSV kosong' }
    }

    const supabaseAdmin = await createAdminClient()
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const row of data) {
      // Normalize row keys to lowercase for flexible column naming
      const rowNormalized: Record<string, any> = {}
      Object.keys(row).forEach(key => {
        rowNormalized[key.toLowerCase().trim()] = row[key]
      })

      const email = rowNormalized.email
      const full_name = rowNormalized['nama lengkap'] || rowNormalized.nama || rowNormalized.name || rowNormalized.fullname
      const nim = String(rowNormalized.nim || rowNormalized.nip || rowNormalized.no_induk || '')
      const role = (rowNormalized.role || 'mahasiswa').toLowerCase().trim()

      if (!email) {
        results.failed++
        results.errors.push('Baris dilewati karena email kosong.')
        continue
      }

      // Validate role against enum values
      const validRoles = ['mahasiswa', 'admin', 'master_admin']
      const finalRole = validRoles.includes(role) ? role : 'mahasiswa'

      const password = String(rowNormalized.password || rowNormalized.sandi || nim || 'unsap12345')

      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: full_name || 'User',
          nim: nim || null,
          role: finalRole,
        }
      })

      if (createError) {
        results.failed++
        results.errors.push(`Gagal membuat ${email}: ${createError.message}`)
      } else {
        results.success++
      }
    }

    revalidatePath('/admin/users')
    return { success: true, results }
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem' }
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const supabaseAdmin = await createAdminClient()
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) {
      return { success: false, error: error.message }
    }
    revalidatePath('/admin/users')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus user' }
  }
}

export async function updateUserRoleAction(userId: string, newRole: 'mahasiswa' | 'admin' | 'master_admin') {
  try {
    const supabaseAdmin = await createAdminClient()
    
    // 1. Update auth.users metadata
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole }
    })
    if (authError) {
      return { success: false, error: authError.message }
    }

    // 2. Update profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    if (profileError) {
      return { success: false, error: profileError.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengubah role user' }
  }
}
