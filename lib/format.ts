// Helpers para formatear fechas y numeros de forma consistente
// Evita errores de hidratacion usando formatos fijos

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getUTCDate().toString().padStart(2, '0')
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const year = date.getUTCFullYear()
  return `${day}/${month}/${year}`
}

export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatCurrency(num: number, currency: string = 'RD$'): string {
  return `${currency} ${formatNumber(num)}`
}

export function formatCompactCurrency(num: number, currency: string = "RD$"): string {
  const n = Number(num)
  if (!Number.isFinite(n)) return `${currency} 0`
  const abs = Math.abs(n)

  if (abs >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${currency} ${(n / 1_000).toFixed(0)}K`
  return `${currency} ${formatNumber(Math.round(n))}`
}

export function formatDateShort(dateString: string): string {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const date = new Date(dateString)
  const day = date.getUTCDate()
  const month = months[date.getUTCMonth()]
  return `${day} ${month}`
}
