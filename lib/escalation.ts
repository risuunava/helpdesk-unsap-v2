export const URGENT_KEYWORDS = [
  'krs', 'ukt', 'uang kuliah', 'spp', 'beasiswa',
  'kebakaran', 'kecelakaan', 'darurat',
  'pelecehan', 'kekerasan', 'bullying', 'pencurian', 'kehilangan',
  'do ', 'drop out', 'tidak lulus', 'wisuda', 'ijazah',
  'sakit parah', 'keracunan', 'pingsan'
]

export function detectUrgentKeywords(text: string): string[] {
  if (!text) return []
  const lower = text.toLowerCase()
  return URGENT_KEYWORDS.filter(kw => lower.includes(kw))
}
