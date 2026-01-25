export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-lime-600'
  if (score >= 40) return 'text-yellow-600'
  if (score >= 20) return 'text-orange-600'
  return 'text-red-600'
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-50 border-green-200'
  if (score >= 60) return 'bg-lime-50 border-lime-200'
  if (score >= 40) return 'bg-yellow-50 border-yellow-200'
  if (score >= 20) return 'bg-orange-50 border-orange-200'
  return 'bg-red-50 border-red-200'
}

export function getScoreHexColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#84cc16'
  if (score >= 40) return '#eab308'
  if (score >= 20) return '#f97316'
  return '#ef4444'
}
