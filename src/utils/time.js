export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'hace un momento'
  if (mins < 60)  return `hace ${mins} minuto${mins !== 1 ? 's' : ''}`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `hace ${hrs} hora${hrs !== 1 ? 's' : ''}`
  const days = Math.floor(hrs / 24)
  if (days < 30)  return `hace ${days} día${days !== 1 ? 's' : ''}`
  const months = Math.floor(days / 30)
  return `hace alrededor de ${months} mes${months !== 1 ? 'es' : ''}`
}
