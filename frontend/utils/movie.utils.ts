const NEW_EPISODE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
export function headlineTitle(rawTitle: string): string {
  const parts = rawTitle
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length >= 2) return parts[1]!
  return parts[0] ?? rawTitle.trim()
}

// export function hasNewEpisodeSince(
//   isSeries: boolean,
//   lastAdded: Date | string | null | undefined
// ): boolean {
//   if (!isSeries) return false
//   const added = getLastAddedEpisodeTime(lastAdded)
//   if (added == null) return false
//   const now = Date.now()
//   if (added > now) return false
//   return now - added <= NEW_EPISODE_MAX_AGE_MS
// }

export function formatRuntime(minutes: number): string | null {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m} мин`
  if (m === 0) return `${h} ч`
  return `${h} ч ${m} мин`
}
