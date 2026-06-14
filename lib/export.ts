import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'

interface ExportData {
  ticket_number: string
  title: string
  category: string
  priority: string
  status: string
  created_at: string
  full_name: string
  department: string
}

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets')
  XLSX.writeFile(workbook, `${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`)
}

export const exportToPDF = (data: any[], title: string, fileName: string) => {
  const doc = new jsPDF()
  
  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm')}`, 14, 30)

  const tableColumn = [
    'No. Tiket',
    'Judul',
    'Kategori',
    'Prioritas',
    'Status',
    'Pelapor',
    'Tanggal'
  ]
  const tableRows: any[] = []

  data.forEach(item => {
    const rowData = [
      item.ticket_number,
      item.title,
      item.category,
      item.priority.toUpperCase(),
      item.status.toUpperCase(),
      item.reporter?.full_name || 'Anonim',
      format(new Date(item.created_at), 'dd/MM/yyyy')
    ]
    tableRows.push(rowData)
  })

  autoTable(doc, {
    startY: 40,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 'auto' },
    }
  })

  doc.save(`${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`)
}
