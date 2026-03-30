import type { AtmosPoint, FetchAtmosPointsParams, FetchAtmosPointsResponse } from './types'
import { mockFetchAtmosPoints } from './mockAtmos'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const DEFAULT_ENDPOINT = '/api/atmos/points'
const POINTS_ENDPOINT = import.meta.env.VITE_POINTS_ENDPOINT ?? DEFAULT_ENDPOINT
const USE_MOCK_DATA = (import.meta.env.VITE_USE_MOCK_DATA ?? 'true') === 'true'

function buildUrl(params: FetchAtmosPointsParams) {
  const base = API_BASE_URL || ''
  const url = new URL(POINTS_ENDPOINT, base.startsWith('http') ? base : `http://_local${base}`)

  url.searchParams.set('from', params.from)
  url.searchParams.set('to', params.to)
  if (params.indexMin != null) url.searchParams.set('indexMin', String(params.indexMin))
  if (params.indexMax != null) url.searchParams.set('indexMax', String(params.indexMax))
  if (params.bbox) {
    url.searchParams.set('south', String(params.bbox.south))
    url.searchParams.set('west', String(params.bbox.west))
    url.searchParams.set('north', String(params.bbox.north))
    url.searchParams.set('east', String(params.bbox.east))
  }

  // Si API_BASE_URL est vide (cas mock/localhost), on renvoie juste le path + query
  if (!API_BASE_URL) {
    return `${POINTS_ENDPOINT}?${url.searchParams.toString()}`
  }

  return url.toString()
}

function normalizeResponse(json: FetchAtmosPointsResponse): AtmosPoint[] {
  if (Array.isArray(json)) return json
  return json.points
}

export async function fetchAtmosPoints(params: FetchAtmosPointsParams): Promise<AtmosPoint[]> {
  if (USE_MOCK_DATA) return mockFetchAtmosPoints(params)

  const url = buildUrl(params)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`API indisponible (${res.status})`)
  }
  const json = (await res.json()) as FetchAtmosPointsResponse
  return normalizeResponse(json)
}

