import type { AtmosPoint, BBox, FetchAtmosPointsParams } from './types'

const DEFAULT_STATIONS: Array<Pick<AtmosPoint, 'id' | 'stationName'>> = [
  { id: 'st-lyon-grolee', stationName: 'Lyon Centre - Grolée' },
  { id: 'st-paris-montparnasse', stationName: 'Montparnasse' },
  { id: 'st-paris-chatelet', stationName: 'Châtelet' },
  { id: 'st-lyon-perrache', stationName: 'Perrache' },
  { id: 'st-marseille-vieuxport', stationName: 'Vieux-Port' },
  { id: 'st-lille-centre', stationName: 'Lille Centre' },
  { id: 'st-bordeaux-centre', stationName: 'Bordeaux Centre' },
]

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function pickStations(params: FetchAtmosPointsParams): AtmosPoint[] {
  const bbox: BBox | undefined = params.bbox
  const approx =
    bbox ??
    ({
      south: 43,
      west: -1,
      north: 51,
      east: 9,
    } satisfies BBox)

  const count = 45
  const stations = Array.from({ length: count }).map((_, i) => {
    const base = DEFAULT_STATIONS[i % DEFAULT_STATIONS.length]
    const latitude = rand(approx.south, approx.north)
    const longitude = rand(approx.west, approx.east)
    const timestamp = new Date(
      Date.now() - rand(0, 1000 * 60 * 60 * 24),
    ).toISOString()

    // Indice simulé: plus il est élevé, plus la “zone” semble dégradée
    const index = Math.round(rand(5, 190))

    return {
      id: `${base.id}-${i}`,
      stationId: base.id,
      stationName: base.stationName,
      latitude,
      longitude,
      timestamp,
      index,
      pollutants: {
        PM2_5: rand(5, 120),
        NO2: rand(5, 150),
        O3: rand(5, 120),
      },
      weather: {
        temperatureC: rand(0, 30),
        humidityPercent: rand(20, 95),
        pressureHpa: rand(990, 1035),
        windSpeedKmh: rand(0, 50),
      },
    } satisfies AtmosPoint
  })

  return stations
}

export function mockFetchAtmosPoints(params: FetchAtmosPointsParams): Promise<AtmosPoint[]> {
  // Option de filtrage côté mock pour valider la logique UI
  const all = pickStations(params)
  const filtered = all.filter((p) => {
    if (params.indexMin != null && p.index < params.indexMin) return false
    if (params.indexMax != null && p.index > params.indexMax) return false
    const t = new Date(p.timestamp).getTime()
    const from = new Date(params.from).getTime()
    const to = new Date(params.to).getTime()
    return t >= from && t <= to
  })
  return Promise.resolve(filtered)
}

