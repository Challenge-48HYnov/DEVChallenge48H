import { useCallback, useEffect, useMemo, useState } from 'react'
import AtmosMap from '../components/AtmosMap'
import FilterDrawer, { type AtmosFilters } from '../components/FilterDrawer'
import IndexLegend from '../components/IndexLegend'
import StationDetailsModal from '../components/organisms/StationDetailsModal'
import { fetchAtmosPoints } from '../api/atmosClient'
import type { BBox, AtmosPoint } from '../api/types'
import { formatIndex, getIndexBucket } from '../lib/indexScoring'
import { buildFetchWindow } from '../lib/buildFetchWindow'
import '../styles/atmos.css'

function yyyyMmDd(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function maxTimestamp(points: AtmosPoint[]): string | null {
  const t = points
    .map((p) => (p.timestamp ? new Date(p.timestamp).getTime() : 0))
    .reduce((acc, v) => Math.max(acc, v), 0)
  if (!t) return null
  return new Date(t).toISOString()
}

export default function MapPage() {
  const today = useMemo(() => yyyyMmDd(new Date()), [])
  const defaultFrom = '2024-01-01'
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [kpiOpen, setKpiOpen] = useState(true)
  const [legendOpen, setLegendOpen] = useState(true)

  const [filters, setFilters] = useState<AtmosFilters>({
    dateMode: 'range',
    day: today,
    from: defaultFrom,
    to: today,

    indexMin: 0,
    indexMax: 200,

    useBbox: true,
    bboxPreview: undefined,

    autoRefresh: true,
    refreshMinutes: 2,
  })

  const [bbox, setBbox] = useState<BBox | undefined>(undefined)
  const [points, setPoints] = useState<AtmosPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<AtmosPoint | null>(null)

  // Pour le "preview" dans le drawer (optionnel)
  useEffect(() => {
    setFilters((prev) => ({ ...prev, bboxPreview: bbox }))
  }, [bbox])

  const fetchParams = useMemo(() => {
    const window = buildFetchWindow(filters)
    const next = {
      from: window.from,
      to: window.to,
      indexMin: filters.indexMin,
      indexMax: filters.indexMax,
      bbox: filters.useBbox ? bbox : undefined,
    }
    return next
  }, [filters, bbox])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAtmosPoints(fetchParams)
      setPoints(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [fetchParams])

  useEffect(() => {
    // chargement initial
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!filters.autoRefresh) return
    const ms = Math.max(1, filters.refreshMinutes) * 60 * 1000
    const id = window.setInterval(() => {
      void refresh()
    }, ms)
    return () => window.clearInterval(id)
  }, [filters.autoRefresh, filters.refreshMinutes, refresh])

  const dailyIndex = useMemo(() => {
    if (points.length === 0) return null
    const avg = points.reduce((acc, p) => acc + p.index, 0) / points.length
    return avg
  }, [points])

  const dailyBucket = dailyIndex != null ? getIndexBucket(dailyIndex) : null

  const latestTs = useMemo(() => maxTimestamp(points), [points])
  const mapPoints = useMemo(() => {
    const latestByStation = new Map<string, AtmosPoint>()
    for (const point of points) {
      const stationKey =
        point.stationId ?? `${point.stationName}-${point.latitude.toFixed(4)}-${point.longitude.toFixed(4)}`
      const prev = latestByStation.get(stationKey)
      if (!prev) {
        latestByStation.set(stationKey, point)
        continue
      }
      const prevTs = new Date(prev.timestamp).getTime()
      const nextTs = new Date(point.timestamp).getTime()
      if (nextTs >= prevTs) {
        latestByStation.set(stationKey, point)
      }
    }
    return Array.from(latestByStation.values())
  }, [points])
  const handleBoundsChange = useCallback((next: BBox) => setBbox(next), [])
  const handlePointClick = useCallback((point: AtmosPoint) => setSelectedPoint(point), [])

  return (
    <div className={`map-page ${drawerOpen ? 'map-page--with-drawer' : ''}`}>
      <div className="map-topButtons">
        {!drawerOpen ? (
          <button
            type="button"
            className={`map-filterToggle ${drawerOpen ? 'is-open' : ''}`}
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? 'Fermer les filtres' : 'Ouvrir les filtres'}
          >
            Parametres
          </button>
        ) : null}
      </div>

      <div className="map-overlay">
        <div className="metric-card collapsible-card">
          <button type="button" className="collapse-head" onClick={() => setKpiOpen((v) => !v)}>
            <span className="collapse-title">Indice du jour</span>
            <span className="collapse-icon">{kpiOpen ? '−' : '+'}</span>
          </button>
          {kpiOpen ? (
            <>
              <div className="metric-value" style={{ color: dailyBucket?.color ?? undefined }}>
                {dailyIndex != null ? formatIndex(dailyIndex) : '—'}
              </div>
              <div className="metric-status">
                {dailyBucket ? dailyBucket.label : 'En attente'}
              </div>
              <div className="metric-sub">
                {points.length} points • {latestTs ? new Date(latestTs).toLocaleString('fr-FR') : '—'}
              </div>
              {points.length === 0 ? (
                <div className="metric-sub">Aucune donnée sur la plage actuelle, élargis les dates.</div>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="legend-card">
          <div className="legend-panel collapsible-card">
            <button type="button" className="collapse-head" onClick={() => setLegendOpen((v) => !v)}>
              <span className="collapse-title">Atmospheric Index</span>
              <span className="collapse-icon">{legendOpen ? '−' : '+'}</span>
            </button>
            {legendOpen ? <IndexLegend withPanel={false} withTitle={false} /> : null}
          </div>
        </div>
      </div>

      <AtmosMap
        points={mapPoints}
        isLoading={loading}
        onBoundsChange={handleBoundsChange}
        onPointClick={handlePointClick}
        initialZoom={5}
      />

      {error ? <div className="map-error">{error}</div> : null}

      <FilterDrawer
        open={drawerOpen}
        filters={filters}
        onClose={() => setDrawerOpen(false)}
        onApply={(next) => {
          setFilters(next)
          void refresh()
          setDrawerOpen(false)
        }}
        onFiltersChange={(next) => setFilters(next)}
      />

      {loading ? <div className="loading-overlay">Chargement...</div> : null}
      <StationDetailsModal point={selectedPoint} onClose={() => setSelectedPoint(null)} />
    </div>
  )
}

