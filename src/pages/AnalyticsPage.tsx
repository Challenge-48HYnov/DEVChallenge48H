import { useCallback, useEffect, useMemo, useState } from 'react'
import FilterDrawer, { type AtmosFilters } from '../components/FilterDrawer'
import { fetchAtmosPoints } from '../api/atmosClient'
import type { AtmosPoint } from '../api/types'
import { formatIndex, getIndexBucket } from '../lib/indexScoring'
import { buildFetchWindow } from '../lib/buildFetchWindow'
import { Globe } from '../components/ui/globe'
import '../styles/atmos.css'

function yyyyMmDd(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function hourKey(ts: string) {
  const d = new Date(ts)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:00`
}

function buildSeries(points: AtmosPoint[]) {
  const map = new Map<string, { sum: number; count: number }>()
  for (const p of points) {
    if (!p.timestamp) continue
    const k = hourKey(p.timestamp)
    const prev = map.get(k)
    if (!prev) map.set(k, { sum: p.index, count: 1 })
    else map.set(k, { sum: prev.sum + p.index, count: prev.count + 1 })
  }
  const items = Array.from(map.entries())
    .map(([k, v]) => ({ k, value: v.sum / v.count }))
    .sort((a, b) => a.k.localeCompare(b.k))
  return items
}

export default function AnalyticsPage() {
  const today = useMemo(() => yyyyMmDd(new Date()), [])
  const defaultFrom = '2024-01-01'
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [filters, setFilters] = useState<AtmosFilters>({
    dateMode: 'range',
    day: today,
    from: defaultFrom,
    to: today,

    indexMin: 0,
    indexMax: 200,

    useBbox: false,
    bboxPreview: undefined,

    autoRefresh: false,
    refreshMinutes: 2,
  })

  const [points, setPoints] = useState<AtmosPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchParams = useMemo(() => {
    const window = buildFetchWindow(filters)
    return {
      from: window.from,
      to: window.to,
      indexMin: filters.indexMin,
      indexMax: filters.indexMax,
      bbox: undefined,
    }
  }, [filters])

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
    void refresh()
  }, [refresh])

  const series = useMemo(() => buildSeries(points), [points])
  const latestAvg = series.length ? series[series.length - 1].value : null
  const bucket = latestAvg != null ? getIndexBucket(latestAvg) : null

  type SvgData = {
    path: string
    pts?: Array<{ x: number; y: number }>
    w: number
    h: number
    pad: number
    min: number
    max: number
  }

  const svg = useMemo((): SvgData => {
    const w = 840
    const h = 220
    const pad = 26
    if (series.length < 2) {
      return { path: '', pts: undefined, min: 0, max: 1, w, h, pad }
    }
    const values = series.map((s) => s.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const denom = max - min || 1
    const xFor = (i: number) => pad + (i * (w - pad * 2)) / Math.max(1, series.length - 1)
    const yFor = (v: number) => pad + (1 - (v - min) / denom) * (h - pad * 2)
    const d = series
      .map((s, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(2)} ${yFor(s.value).toFixed(2)}`)
      .join(' ')
    const pts = series.map((s, i) => ({ x: xFor(i), y: yFor(s.value) }))
    return { path: d, pts, min, max, w, h, pad }
  }, [series])

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <div className="page-kicker">Analyse & tendances</div>
          <h1 className="page-title">Évolution temporelle</h1>
          <p className="page-subtitle">
            Visualise la tendance de l'indice sur la période filtrée.
          </p>
        </div>

        <button type="button" className="map-filterToggle" onClick={() => setDrawerOpen(true)}>
          Parametres
        </button>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card analytics-card--hero">
          <div className="analytics-cardTitle">Indice (dernier point)</div>
          <div className="analytics-heroValue" style={{ color: bucket?.color ?? undefined }}>
            {latestAvg != null ? formatIndex(latestAvg) : '—'}
          </div>
          <div className="analytics-heroStatus">{bucket ? bucket.label : '—'}</div>
          <div className="analytics-heroSub">{points.length} points</div>
          <div style={{ marginTop: 18 }}>
            <Globe />
          </div>
        </div>

        <div className="analytics-card analytics-card--chart">
          <div className="analytics-cardTitle">Courbe (moyenne par heure)</div>
          <div className="chart-wrap">
            {svg.path ? (
              <svg viewBox={`0 0 ${svg.w} ${svg.h}`} className="analytics-svg">
                <path d={svg.path} fill="none" stroke={bucket?.color ?? '#9ecaff'} strokeWidth="3" />
                {svg.pts?.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={5}
                    fill={bucket?.color ?? '#9ecaff'}
                    stroke="rgba(0,0,0,0.25)"
                    strokeWidth="1"
                  />
                ))}
              </svg>
            ) : (
              <div className="chart-empty">Pas assez de données pour tracer la courbe.</div>
            )}
          </div>
        </div>
      </div>

      {error ? <div className="map-error">{error}</div> : null}
      {loading ? <div className="loading-inline">Chargement...</div> : null}

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
    </div>
  )
}

