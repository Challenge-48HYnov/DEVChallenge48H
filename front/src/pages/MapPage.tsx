import { useCallback, useEffect, useMemo, useState } from 'react'
import AtmosMap from '../components/AtmosMap'
import FilterDrawer, { type AtmosFilters } from '../components/FilterDrawer'
import IndexLegend from '../components/IndexLegend'
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

function subDaysISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return yyyyMmDd(d)
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
  const [drawerOpen, setDrawerOpen] = useState(true)

  const [filters, setFilters] = useState<AtmosFilters>({
    dateMode: 'day',
    day: today,
    from: subDaysISO(7),
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

  return (
    <div className="map-page">
      <div className="map-topButtons">
        <button
          type="button"
          className="map-filterToggle"
          onClick={() => setDrawerOpen(true)}
          aria-label="Ouvrir les filtres"
        >
          Parametres
        </button>
      </div>

      <div className="map-overlay">
        <div className="metric-card">
          <div className="metric-label">Indice du jour</div>
          <div className="metric-value" style={{ color: dailyBucket?.color ?? undefined }}>
            {dailyIndex != null ? formatIndex(dailyIndex) : '—'}
          </div>
          <div className="metric-status">
            {dailyBucket ? dailyBucket.label : 'En attente'}
          </div>
          <div className="metric-sub">
            {points.length} points • {latestTs ? new Date(latestTs).toLocaleString('fr-FR') : '—'}
          </div>
        </div>

        <div className="legend-card">
          <IndexLegend />
        </div>
      </div>

      <AtmosMap
        points={points}
        isLoading={loading}
        onBoundsChange={(next) => setBbox(next)}
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
    </div>
  )
}

