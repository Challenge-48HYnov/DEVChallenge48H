import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import * as L from 'leaflet'
import type { AtmosPoint, BBox } from '../api/types'
import { formatIndex, getIndexBucket, getIndexRadiusPx } from '../lib/indexScoring'

type Props = {
  points: AtmosPoint[]
  isLoading?: boolean
  onBoundsChange?: (bbox: BBox) => void
  initialCenter?: [number, number]
  initialZoom?: number
  tileUrl?: string
}

function BoundsWatcher({ onBoundsChange }: { onBoundsChange?: (bbox: BBox) => void }) {
  useMapEvents({
    moveend: (event) => {
      if (!onBoundsChange) return
      const bounds = event.target.getBounds()
      onBoundsChange({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      })
    },
    zoomend: (event) => {
      if (!onBoundsChange) return
      const bounds = event.target.getBounds()
      onBoundsChange({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      })
    },
  })
  return null
}

function makeIndexDivIcon(point: AtmosPoint) {
  const bucket = getIndexBucket(point.index)
  const r = getIndexRadiusPx(point.index)
  const size = Math.round(r * 2)
  const value = formatIndex(point.index)

  const html = `
    <div class="index-circle"
      style="
        width: ${size}px;
        height: ${size}px;
        background: ${bucket.color};
        color: ${bucket.textColor};
        border: 2px solid rgba(0,0,0,0.25);
      "
    >
      <div class="index-circle-value">${value}</div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'index-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function AtmosMap({
  points,
  isLoading,
  onBoundsChange,
  initialCenter = [46.2276, 2.2137], // France
  initialZoom = 5,
  tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
}: Props) {
  return (
    <div className="map-container">
      <MapContainer center={initialCenter} zoom={initialZoom} scrollWheelZoom className="map-leaflet">
        <TileLayer url={tileUrl} attribution="&copy; OpenStreetMap contributors" />
        <BoundsWatcher onBoundsChange={onBoundsChange} />

        {isLoading ? null : null}

        {points.map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={makeIndexDivIcon(p)}>
            <Popup>
              <div className="popup-title">{p.stationName}</div>
              <div className="popup-row">
                <span className="popup-key">Indice</span>
                <span className="popup-val">{formatIndex(p.index)}</span>
              </div>
              <div className="popup-row">
                <span className="popup-key">Coord.</span>
                <span className="popup-val">
                  {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                </span>
              </div>
              <div className="popup-row">
                <span className="popup-key">Date</span>
                <span className="popup-val">
                  {p.timestamp ? new Date(p.timestamp).toLocaleString('fr-FR') : '—'}
                </span>
              </div>

              {p.weather?.temperatureC != null ? (
                <div className="popup-row">
                  <span className="popup-key">Temp.</span>
                  <span className="popup-val">{p.weather.temperatureC.toFixed(1)}°C</span>
                </div>
              ) : null}

              {p.weather?.humidityPercent != null ? (
                <div className="popup-row">
                  <span className="popup-key">Humidité</span>
                  <span className="popup-val">{p.weather.humidityPercent.toFixed(0)}%</span>
                </div>
              ) : null}

              {p.pollutants?.PM2_5 != null ? (
                <div className="popup-row">
                  <span className="popup-key">PM2.5</span>
                  <span className="popup-val">{p.pollutants.PM2_5.toFixed(0)} µg/m³</span>
                </div>
              ) : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

