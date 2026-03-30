export function startOfDayISO(dateStr: string) {
  // dateStr au format yyyy-mm-dd
  const d = new Date(`${dateStr}T00:00:00`)
  return d.toISOString()
}

export function endOfDayISO(dateStr: string) {
  const d = new Date(`${dateStr}T23:59:59.999`)
  return d.toISOString()
}

export function dateToISO(dateStr: string) {
  // Pour inputs type="datetime-local" si besoin plus tard
  const d = new Date(dateStr)
  return d.toISOString()
}

