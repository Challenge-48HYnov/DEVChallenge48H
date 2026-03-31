import { memo, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import * as L from 'leaflet'
import type { AtmosPoint, BBox } from '../api/types'
import { formatIndex, getIndexBucket, getIndexRadiusPx } from '../lib/indexScoring'

type Props = {
  points: AtmosPoint[]
  isLoading?: boolean
  onBoundsChange?: (bbox: BBox) => void
  onPointClick?: (point: AtmosPoint) => void
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
  const glowColor = `${bucket.color}66`
  const station = point.stationName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const html = `
    <div class="index-marker-shell">
      <div class="index-circle"
        style="
          width: ${size}px;
          height: ${size}px;
          background: ${bucket.color}22;
          color: ${bucket.color};
          border: 2px solid ${bucket.color};
          box-shadow: 0 0 20px ${glowColor};
        "
      >
        <div class="index-circle-value">${value}</div>
      </div>
      <div class="index-circle-label">${station}</div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'index-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function AtmosMap({
  points,
  isLoading,
  onBoundsChange,
  onPointClick,
  initialCenter = [46.2276, 2.2137], // France
  initialZoom = 5,
  tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}: Props) {
  const markers = useMemo(
    () =>
      points.map((p) => (
        <Marker
          key={p.id}
          position={[p.latitude, p.longitude]}
          icon={makeIndexDivIcon(p)}
          eventHandlers={{
            click: () => {
              onPointClick?.(p)
            },
          }}
        />
      )),
    [points, onPointClick],
  )

  return (
    <div className="map-container">
      <MapContainer center={initialCenter} zoom={initialZoom} scrollWheelZoom className="map-leaflet">
        <TileLayer
          url={tileUrl}
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        <BoundsWatcher onBoundsChange={onBoundsChange} />

        {isLoading ? null : null}

        {markers}
      </MapContainer>
    </div>
  )
}

export default memo(AtmosMap)

