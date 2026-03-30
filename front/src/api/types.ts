export type BBox = {
  south: number
  west: number
  north: number
  east: number
}

export type AtmosPoint = {
  id: string
  stationId?: string
  stationName: string
  latitude: number
  longitude: number
  timestamp: string // ISO string
  index: number // indice combiné pollution + météo

  // Données optionnelles (selon ce que l'équipe data renvoie)
  pollutants?: Record<string, number>
  weather?: {
    temperatureC?: number
    humidityPercent?: number
    pressureHpa?: number
    windSpeedKmh?: number
  }
}

export type FetchAtmosPointsParams = {
  from: string // ISO datetime
  to: string // ISO datetime
  indexMin?: number
  indexMax?: number
  bbox?: BBox
  page?: number
  limit?: number
  sort?: string
}

export type FetchAtmosPointsResponse =
  | AtmosPoint[]
  | {
      points: AtmosPoint[]
    }

export type BackendIndiceRow = {
  id: number
  date: string
  indice: number
  localisation_id: number
}

export type BackendIndicesResponse = {
  data: BackendIndiceRow[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

