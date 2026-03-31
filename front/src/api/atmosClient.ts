import type {
  AtmosPoint,
  BackendIndiceRow,
  BackendIndicesResponse,
  FetchAtmosPointsParams,
} from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const DEFAULT_ENDPOINT = '/api/indices'
const POINTS_ENDPOINT = import.meta.env.VITE_POINTS_ENDPOINT ?? DEFAULT_ENDPOINT

function mapRowToPoint(row: BackendIndiceRow): AtmosPoint | null {
  const latitudeRaw = row.latitude ?? row.lat ?? row.localisation?.latitude
  const longitudeRaw = row.longitude ?? row.lng ?? row.localisation?.longitude
  if (!Number.isFinite(Number(latitudeRaw)) || !Number.isFinite(Number(longitudeRaw))) {
    return null
  }

  const latitude = Number(latitudeRaw)
  const longitude = Number(longitudeRaw)

  return {
    id: String(row.id),
    stationId: String(row.localisation_id),
    stationName: row.stationName ?? row.localisation?.ville ?? `Localisation #${row.localisation_id}`,
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
  url.searchParams.set('fields', 'id,date,indice,localisation_id')
  url.searchParams.set('include', 'location')
  url.searchParams.set('page', String(params.page ?? 1))
  // Fetch more points by default to improve map visibility.
  url.searchParams.set('limit', String(params.limit ?? 5000))
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
  const json = (await res.json()) as BackendIndicesResponse
  const mapped = (json.data ?? []).map(mapRowToPoint).filter((p): p is AtmosPoint => p !== null)
  if ((json.data?.length ?? 0) > 0 && mapped.length === 0) {
    throw new Error(
      "Le backend ne renvoie pas de coordonnées GPS (latitude/longitude), impossible d'afficher la carte sans données réelles.",
    )
  }
  let points = mapped

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