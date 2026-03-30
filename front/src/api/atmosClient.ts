import type {
  AtmosPoint,
  BackendIndiceRow,
  BackendIndicesResponse,
  FetchAtmosPointsParams,
} from './types'
import { mockFetchAtmosPoints } from './mockAtmos'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const DEFAULT_ENDPOINT = '/indices'
const POINTS_ENDPOINT = import.meta.env.VITE_POINTS_ENDPOINT ?? DEFAULT_ENDPOINT
const USE_MOCK_DATA = (import.meta.env.VITE_USE_MOCK_DATA ?? 'false') === 'true'

const LOCATION_META: Record<
  number,
  {
    stationName: string
    latitude: number
    longitude: number
  }
> = {
  1: { stationName: 'Paris', latitude: 48.8566, longitude: 2.3522 },
  2: { stationName: 'Lyon', latitude: 45.764, longitude: 4.8357 },
  3: { stationName: 'Bruxelles', latitude: 50.8503, longitude: 4.3517 },
  4: { stationName: 'Zurich', latitude: 47.3769, longitude: 8.5417 },
  5: { stationName: 'Berlin', latitude: 52.52, longitude: 13.405 },
}

function fallbackCoords(localisationId: number) {
  // Dispersion déterministe autour de la France (si id inconnu)
  const seed = localisationId * 9301 + 49297
  const latJitter = ((seed % 1000) / 1000 - 0.5) * 6
  const lngJitter = (((seed * 7) % 1000) / 1000 - 0.5) * 10
  return {
    latitude: 46.6 + latJitter,
    longitude: 2.3 + lngJitter,
  }
}

function mapRowToPoint(row: BackendIndiceRow): AtmosPoint {
  const known = LOCATION_META[row.localisation_id]
  const fallback = fallbackCoords(row.localisation_id)
  return {
    id: String(row.id),
    stationId: String(row.localisation_id),
    stationName: known?.stationName ?? `Localisation #${row.localisation_id}`,
    latitude: known?.latitude ?? fallback.latitude,
    longitude: known?.longitude ?? fallback.longitude,
    timestamp: row.date,
    index: Number(row.indice),
  }
}

function buildUrl(params: FetchAtmosPointsParams) {
  const base = API_BASE_URL || window.location.origin
  const url = new URL(POINTS_ENDPOINT, base)
  url.searchParams.set('sort', params.sort ?? '-id')
  url.searchParams.set('fields', 'id,date,indice,localisation_id')
  url.searchParams.set('page', String(params.page ?? 1))
  url.searchParams.set('limit', String(params.limit ?? 500))
  // Le backend supporte bien les filtres numériques.
  // Les filtres de date peuvent dépendre du parsing SQL; on applique donc
  // le filtre temporel côté front pour éviter les erreurs serveur.
  if (params.indexMin != null) {
    url.searchParams.set('filter[indice][gte]', String(params.indexMin))
  }
  if (params.indexMax != null) {
    url.searchParams.set('filter[indice][lte]', String(params.indexMax))
  }
  return url.toString()
}

export async function fetchAtmosPoints(params: FetchAtmosPointsParams): Promise<AtmosPoint[]> {
  if (USE_MOCK_DATA) return mockFetchAtmosPoints(params)

  const url = buildUrl(params)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`API indisponible (${res.status})`)
  }
  const json = (await res.json()) as BackendIndicesResponse
  let points = (json.data ?? []).map(mapRowToPoint)

  const fromMs = new Date(params.from).getTime()
  const toMs = new Date(params.to).getTime()
  points = points.filter((p) => {
    const t = new Date(p.timestamp).getTime()
    return t >= fromMs && t <= toMs
  })

  if (!params.bbox) return points

  return points.filter((p) => {
    return (
      p.latitude >= params.bbox!.south &&
      p.latitude <= params.bbox!.north &&
      p.longitude >= params.bbox!.west &&
      p.longitude <= params.bbox!.east
    )
  })
}

