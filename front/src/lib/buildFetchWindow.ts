import type { AtmosFilters } from '../components/FilterDrawer'
import { endOfDayISO, startOfDayISO } from './dateUtils'

export function buildFetchWindow(filters: AtmosFilters) {
  if (filters.dateMode === 'day') {
    return {
      from: startOfDayISO(filters.day),
      to: endOfDayISO(filters.day),
    }
  }
  return {
    from: startOfDayISO(filters.from),
    to: endOfDayISO(filters.to),
  }
}

