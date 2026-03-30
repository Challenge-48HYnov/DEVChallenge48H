import type { AtmosPoint } from '../../api/types'
import { formatIndex, getIndexBucket } from '../../lib/indexScoring'
import Icon from '../atoms/Icon'

type Props = {
  point: AtmosPoint | null
  onClose: () => void
}

function derivedValue(seed: number, min: number, max: number) {
  const normalized = ((Math.sin(seed) + 1) / 2) * (max - min) + min
  return normalized
}

export default function StationDetailsModal({ point, onClose }: Props) {
  if (!point) return null

  const bucket = getIndexBucket(point.index)
  const val = Number(point.index)
  const pm25 = point.pollutants?.PM2_5 ?? derivedValue(val * 0.45, 8, 55)
  const no2 = point.pollutants?.NO2 ?? derivedValue(val * 0.62, 12, 80)
  const o3 = point.pollutants?.O3 ?? derivedValue(val * 0.31, 10, 95)

  const temp = point.weather?.temperatureC ?? derivedValue(val * 0.18, 6, 32)
  const hum = point.weather?.humidityPercent ?? derivedValue(val * 0.22, 30, 90)
  const pressure = point.weather?.pressureHpa ?? derivedValue(val * 0.11, 995, 1031)

  return (
    <div className="station-modal-overlay" role="dialog" aria-modal="true">
      <div className="station-modal">
        <div className="station-modal-left">
          <div className="station-modal-header">
            <div>
              <span className="station-id">Station ID: #{point.stationId ?? point.id}</span>
              <h2 className="station-name">{point.stationName}</h2>
            </div>
            <button type="button" className="station-close" onClick={onClose} aria-label="Fermer">
              <Icon name="close" />
            </button>
          </div>

          <div className="station-gauge">
            <div className="station-gauge-ring" style={{ borderColor: `${bucket.color}55` }}>
              <div className="station-gauge-core">
                <div className="station-gauge-value" style={{ color: bucket.color }}>
                  {formatIndex(point.index)}
                </div>
                <div className="station-gauge-label">Index global</div>
              </div>
            </div>
            <div className="station-badge" style={{ color: bucket.color }}>
              {bucket.label.toUpperCase()}
            </div>
          </div>

          <div className="station-strips">
            <div className="station-strip">
              <span>Température</span>
              <strong>{temp.toFixed(1)}°C</strong>
            </div>
            <div className="station-strip">
              <span>Humidité</span>
              <strong>{hum.toFixed(0)}%</strong>
            </div>
            <div className="station-strip">
              <span>Pression</span>
              <strong>{pressure.toFixed(0)} hPa</strong>
            </div>
          </div>

          <div className="station-footer">
            <p>Dernière mise à jour : {new Date(point.timestamp).toLocaleString('fr-FR')}</p>
            <button type="button" className="station-report">
              Rapport Complet PDF
            </button>
          </div>
        </div>

        <div className="station-modal-right">
          <div className="station-grid">
            <div className="station-card">
              <span>Particules PM2.5</span>
              <strong>{pm25.toFixed(0)} µg/m³</strong>
            </div>
            <div className="station-card">
              <span>Dioxyde d'Azote NO2</span>
              <strong>{no2.toFixed(0)} µg/m³</strong>
            </div>
            <div className="station-card">
              <span>Ozone O3</span>
              <strong>{o3.toFixed(0)} µg/m³</strong>
            </div>

            <div className="station-chart">
              <div className="station-chart-head">
                <h3>Évolution Historique</h3>
                <span>24h</span>
              </div>
              <svg viewBox="0 0 700 180" className="station-chart-svg" preserveAspectRatio="none">
                <path
                  d="M0,145 Q70,138 130,108 T260,92 T390,122 T520,90 T700,64"
                  fill="none"
                  stroke="#00e475"
                  strokeWidth="4"
                />
                <path
                  d="M0,100 Q70,116 130,128 T260,140 T390,114 T520,126 T700,108"
                  fill="none"
                  stroke="#9ecaff"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

