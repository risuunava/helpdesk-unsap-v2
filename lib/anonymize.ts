export function generateAnonymousCode(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash |= 0
  }
  return `Anonim_#${Math.abs(hash).toString(16).toUpperCase().slice(0, 4)}`
}
