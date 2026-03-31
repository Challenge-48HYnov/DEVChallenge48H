import type { AtmosPoint } from '../../api/types'
import { formatIndex, getIndexBucket } from '../../lib/indexScoring'
import Icon from '../atoms/Icon'

type Props = {
  point: AtmosPoint | null
  onClose: () => void
}

export default function StationDetailsModal({ point, onClose }: Props) {
  if (!point) return null

  const bucket = getIndexBucket(point.index)

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
              <strong>
                {point.weather?.temperatureC != null ? `${point.weather.temperatureC.toFixed(1)}°C` : 'N/A'}
              </strong>
            </div>
            <div className="station-strip">
              <span>Humidité</span>
              <strong>
                {point.weather?.humidityPercent != null ? `${point.weather.humidityPercent.toFixed(0)}%` : 'N/A'}
              </strong>
            </div>
            <div className="station-strip">
              <span>Pression</span>
              <strong>
                {point.weather?.pressureHpa != null ? `${point.weather.pressureHpa.toFixed(0)} hPa` : 'N/A'}
              </strong>
            </div>
          </div>

          <div className="station-footer">
            <p>Dernière mise à jour : {new Date(point.timestamp).toLocaleString('fr-FR')}</p>
          </div>
        </div>

        <div className="station-modal-right">
          <div className="station-grid">
            <div className="station-card">
              <span>Particules PM2.5</span>
              <strong>{point.pollutants?.PM2_5 != null ? `${point.pollutants.PM2_5.toFixed(0)} µg/m³` : 'N/A'}</strong>
            </div>
            <div className="station-card">
              <span>Dioxyde d'Azote NO2</span>
              <strong>{point.pollutants?.NO2 != null ? `${point.pollutants.NO2.toFixed(0)} µg/m³` : 'N/A'}</strong>
            </div>
            <div className="station-card">
              <span>Ozone O3</span>
              <strong>{point.pollutants?.O3 != null ? `${point.pollutants.O3.toFixed(0)} µg/m³` : 'N/A'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

