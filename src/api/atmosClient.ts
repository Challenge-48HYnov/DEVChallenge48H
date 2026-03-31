import type {
  AtmosPoint,
  BackendIndiceRow,
  BackendIndicesResponse,
  FetchAtmosPointsParams,
} from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const DEFAULT_ENDPOINT = '/indices'
const POINTS_ENDPOINT = import.meta.env.VITE_POINTS_ENDPOINT ?? DEFAULT_ENDPOINT

function mapRowToPoint(row: BackendIndiceRow): AtmosPoint | null {
  const latitudeRaw =
    row.latitude ?? row.lat ?? row.location?.latitude ?? row.localisation?.latitude
  const longitudeRaw =
    row.longitude ?? row.lng ?? row.location?.longitude ?? row.localisation?.longitude
  if (!Number.isFinite(Number(latitudeRaw)) || !Number.isFinite(Number(longitudeRaw))) {
    return null
  }

  const latitude = Number(latitudeRaw)
  const longitude = Number(longitudeRaw)

  return {
    id: String(row.id),
    stationId: String(row.localisation_id),
    stationName:
      row.stationName ??
      row.location?.name ??
      row.location?.ville ??
      row.localisation?.name ??
      row.localisation?.ville ??
      `Localisation #${row.localisation_id}`,
    latitude,
    longitude,
    timestamp: row.date,
    index: Number(row.indice),
    pollutants:
      row.PM2_5 != null || row.NO2 != null || row.O3 != null
        ? {
            ...(row.PM2_5 != null ? { PM2_5: Number(row.PM2_5) } : {}),
            ...(row.NO2 != null ? { NO2: Number(row.NO2) } : {}),
            ...(row.O3 != null ? { O3: Number(row.O3) } : {}),
          }
        : undefined,
    weather:
      row.temperatureC != null ||
      row.humidityPercent != null ||
      row.pressureHpa != null ||
      row.windSpeedKmh != null
        ? {
            ...(row.temperatureC != null ? { temperatureC: Number(row.temperatureC) } : {}),
            ...(row.humidityPercent != null ? { humidityPercent: Number(row.humidityPercent) } : {}),
            ...(row.pressureHpa != null ? { pressureHpa: Number(row.pressureHpa) } : {}),
            ...(row.windSpeedKmh != null ? { windSpeedKmh: Number(row.windSpeedKmh) } : {}),
          }
        : undefined,
  }
}

function buildUrl(params: FetchAtmosPointsParams) {
  const base = API_BASE_URL || window.location.origin
  const url = new URL(POINTS_ENDPOINT, base)
  url.searchParams.set('sort', params.sort ?? '-id')
  url.searchParams.set('page', String(params.page ?? 1))
  url.searchParams.set('limit', String(params.limit ?? 500))
  url.searchParams.set('include', 'location')
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
  const url = buildUrl(params)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`API indisponible (${res.status})`)
  }
  const json = await res.json()

  const rawRows: BackendIndiceRow[] = Array.isArray(json)
    ? (json as BackendIndiceRow[])
    : ((json as BackendIndicesResponse).data ?? [])

  const mapped = rawRows.map(mapRowToPoint).filter((p): p is AtmosPoint => p !== null)
  return mapped
}

