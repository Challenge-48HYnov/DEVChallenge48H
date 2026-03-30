import { useMemo, useState, type FormEvent } from 'react'
import './App.css'

type WeatherResult = {
  cityLabel: string
  latitude: number
  longitude: number
  current: {
    time: string
    temperatureC: number
    weatherCode: number
    windSpeedKmh: number
  }
}

type OpenMeteoGeocodingResponse = {
  results?: Array<{
    latitude: number
    longitude: number
    name?: string
    country?: string
  }>
}

type OpenMeteoForecastResponse = {
  current?: {
    time?: string
    temperature_2m?: number
    weather_code?: number
    wind_speed_10m?: number
  }
}

function weatherCodeToLabel(code: number) {
  // https://open-meteo.com/en/docs (weather code WMO simplified)
  switch (code) {
    case 0:
      return 'Ciel dégagé'
    case 1:
      return 'Principalement clair'
    case 2:
      return 'Partiellement nuageux'
    case 3:
      return 'Couvert'
    case 45:
      return 'Brouillard'
    case 48:
      return 'Brouillard givrant'
    case 51:
      return 'Drizzle léger'
    case 53:
      return 'Drizzle modéré'
    case 55:
      return 'Drizzle dense'
    case 56:
      return 'Drizzle givrant léger'
    case 57:
      return 'Drizzle givrant dense'
    case 61:
      return 'Pluie faible'
    case 63:
      return 'Pluie modérée'
    case 65:
      return 'Pluie forte'
    case 66:
      return 'Pluie verglaçante légère'
    case 67:
      return 'Pluie verglaçante forte'
    case 71:
      return 'Neige faible'
    case 73:
      return 'Neige modérée'
    case 75:
      return 'Neige forte'
    case 77:
      return 'Grains de neige'
    case 80:
      return 'Averses de pluie faibles'
    case 81:
      return 'Averses de pluie modérées'
    case 82:
      return 'Averses de pluie violentes'
    case 85:
      return 'Averses de neige faibles'
    case 86:
      return 'Averses de neige fortes'
    case 95:
      return 'Orage léger/modéré'
    case 96:
      return 'Orage avec grésil (léger)'
    case 99:
      return 'Orage avec grésil (fort)'
    default:
      return 'Conditions inconnues'
  }
}

export default function App() {
  const [city, setCity] = useState('Paris')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<WeatherResult | null>(null)

  const canSubmit = useMemo(() => city.trim().length > 0 && !loading, [city, loading])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = city.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // 1) Géocodage (chercher latitude/longitude à partir du nom de ville)
      const geoUrl = new URL(
        'https://geocoding-api.open-meteo.com/v1/search',
      )
      geoUrl.searchParams.set('name', trimmed)
      geoUrl.searchParams.set('count', '1')
      geoUrl.searchParams.set('language', 'fr')
      geoUrl.searchParams.set('format', 'json')

      const geoRes = await fetch(geoUrl.toString())
      if (!geoRes.ok) throw new Error('Impossible de contacter le service de géocodage.')
      const geoJson = (await geoRes.json()) as OpenMeteoGeocodingResponse

      const first = geoJson.results?.[0]
      if (!first || !Number.isFinite(first.latitude) || !Number.isFinite(first.longitude)) {
        throw new Error('Ville introuvable. Essaie une autre saisie.')
      }

      const latitude = Number(first.latitude)
      const longitude = Number(first.longitude)
      const name = String(first.name ?? trimmed)
      const country = first.country ? String(first.country) : ''
      const cityLabel = country ? `${name}, ${country}` : name

      // 2) Prévision "current" (température + code météo + vent)
      const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast')
      forecastUrl.searchParams.set('latitude', String(latitude))
      forecastUrl.searchParams.set('longitude', String(longitude))
      forecastUrl.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m')
      forecastUrl.searchParams.set('timezone', 'auto')
      forecastUrl.searchParams.set('temperature_unit', 'celsius')

      const fcRes = await fetch(forecastUrl.toString())
      if (!fcRes.ok) throw new Error('Impossible de récupérer la météo.')
      const fcJson = (await fcRes.json()) as OpenMeteoForecastResponse

      const current = fcJson.current
      if (!current) throw new Error('Données météo indisponibles.')

      const temperatureC = Number(current.temperature_2m)
      const weatherCode = Number(current.weather_code)
      const windSpeedKmh = Number(current.wind_speed_10m)
      const time = String(current.time ?? '')

      setResult({
        cityLabel,
        latitude,
        longitude,
        current: { time, temperatureC, weatherCode, windSpeedKmh },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="weather-page">
      <h1 className="weather-title">Application météo</h1>

      <form className="weather-form" onSubmit={handleSubmit}>
        <label className="weather-label">
          Ville
          <input
            className="weather-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex: Paris"
            autoComplete="off"
          />
        </label>

        <button className="weather-button" type="submit" disabled={!canSubmit}>
          {loading ? 'Chargement...' : 'Rechercher'}
        </button>
      </form>

      {error ? <div className="weather-error">{error}</div> : null}

      {result ? (
        <section className="weather-card" aria-live="polite">
          <div className="weather-card-top">
            <div>
              <div className="weather-city">{result.cityLabel}</div>
              <div className="weather-desc">{weatherCodeToLabel(result.current.weatherCode)}</div>
            </div>

            <div className="weather-temp">
              {Math.round(result.current.temperatureC)}&deg;C
            </div>
          </div>

          <div className="weather-meta">
            <div className="weather-meta-item">
              <span className="weather-meta-key">Vent</span>
              <span className="weather-meta-val">{Math.round(result.current.windSpeedKmh)} km/h</span>
            </div>

            <div className="weather-meta-item">
              <span className="weather-meta-key">Mise à jour</span>
              <span className="weather-meta-val">
                {result.current.time ? new Date(result.current.time).toLocaleString('fr-FR') : '-'}
              </span>
            </div>
          </div>
        </section>
      ) : null}

      <div className="weather-hint">
        Donnees via Open-Meteo (geocodage + meteo temps reel). L'API meteo peut ensuite etre
        branchee sur ton backend.
      </div>
    </div>
  )
}
