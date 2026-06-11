const ML_URL = process.env.ML_SERVICE_URL!
const ML_KEY = process.env.ML_SERVICE_API_KEY!

const headers = { 'Content-Type': 'application/json', 'X-API-Key': ML_KEY }

export async function classifyTicket(text: string) {
  try {
    console.log(`[ML] Classifying text: "${text.substring(0, 50)}..."`);
    console.log(`[ML] Target URL: ${ML_URL}/classify`);
    
    const res = await fetch(`${ML_URL}/classify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(5000)
    })
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[ML] Classify failed with status ${res.status}: ${errorText}`);
      return null
    }
    
    const data = await res.json();
    console.log(`[ML] Classify success:`, data);
    return data
  } catch (error: any) {
    console.error(`[ML] Classify error:`, error.message || error);
    return null
  }
}

export async function analyzeSentiment(text: string) {
  try {
    const res = await fetch(`${ML_URL}/sentiment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(3000)
    })
    if (!res.ok) return { score: 0.5, label: 'neutral' }
    return await res.json()
  } catch (error) {
    return { score: 0.5, label: 'neutral' }
  }
}

export async function suggestFaq(text: string) {
  try {
    console.log(`[ML] Suggesting FAQ for: "${text.substring(0, 50)}..."`);
    const res = await fetch(`${ML_URL}/faq-suggest`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(3000)
    })
    
    if (!res.ok) {
      console.error(`[ML] FAQ Suggest failed with status ${res.status}`);
      return []
    }
    
    const data = await res.json()
    console.log(`[ML] FAQ Suggestions found: ${data.suggestions?.length || 0}`);
    return data.suggestions || []
  } catch (error: any) {
    console.error(`[ML] FAQ Suggest error:`, error.message || error);
    return []
  }
}

export async function triggerRetrain() {
  try {
    const res = await fetch(`${ML_URL}/retrain`, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(5000)
    })
    if (!res.ok) return { success: false, error: await res.text() }
    return { success: true, ...(await res.json()) }
  } catch (error) {
    return { success: false, error: 'Failed to trigger retrain' }
  }
}
