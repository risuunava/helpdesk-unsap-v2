import { z } from 'zod'

export const createTicketSchema = z.object({
  title:       z.string().min(10, 'Judul minimal 10 karakter').max(200),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter').max(5000),
  category:    z.enum(['akademik','keuangan','fasilitas','keamanan','lainnya']),
  department:  z.string().min(1, 'Pilih departemen tujuan'),
  is_anonymous:z.boolean().default(false),
})

export const updateTicketSchema = z.object({
  status:     z.enum(['open','in_progress','resolved','closed']).optional(),
  priority:   z.enum(['low','normal','urgent']).optional(),
  assigned_to:z.string().uuid().optional(),
})
