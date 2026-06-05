const ML_URL = process.env.ML_SERVICE_URL!
const ML_KEY = process.env.ML_SERVICE_API_KEY!

const headers = { 'Content-Type': 'application/json', 'X-API-Key': ML_KEY }

export async function classifyTicket(text: string) {
  try {
    const res = await fetch(`${ML_URL}/classify`, {
      method: 'POST', headers,
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(5000)  // timeout 5 detik
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }  // fail-safe: return null jika timeout/error
}

export async function suggestFaq(text: string, topK = 3) {
  try {
    const res = await fetch(`${ML_URL}/faq-suggest`, {
      method: 'POST', headers,
      body: JSON.stringify({ text, top_k: topK }),
      signal: AbortSignal.timeout(3000)
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.suggestions ?? []
  } catch { return [] }
}
