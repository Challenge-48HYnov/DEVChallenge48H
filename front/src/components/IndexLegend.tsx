import { getIndexBucket } from '../lib/indexScoring'

const RANGE_ROWS: Array<{ min: number; max: number; color: string }> = [
  { min: 0, max: 50, color: getIndexBucket(0).color },
  { min: 51, max: 100, color: getIndexBucket(60).color },
  { min: 101, max: 150, color: getIndexBucket(120).color },
  { min: 151, max: 1000, color: getIndexBucket(200).color },
]

export default function IndexLegend() {
  return (
    <div className="legend-panel">
      <h3 className="legend-title">Atmospheric Index</h3>
      <p className="legend-subtitle">
        Indice combiné de la qualité de l'air et des conditions météo.
      </p>
      <div className="legend-rows">
        {RANGE_ROWS.map((row) => (
          <div className="legend-row" key={`${row.min}-${row.max}`}>
            <span className="legend-dot" style={{ background: row.color }} />
            <span className="legend-label">
              {row.min} - {row.max >= 1000 ? '150+' : row.max} :
            </span>
            <span className="legend-labelStrong">
              {getIndexBucket(row.min).label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

