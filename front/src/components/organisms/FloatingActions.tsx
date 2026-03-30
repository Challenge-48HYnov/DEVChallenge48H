import Icon from '../atoms/Icon'

export default function FloatingActions() {
  return (
    <div className="floating-actions">
      <button className="floating-btn floating-btn--glass" type="button">
        <Icon name="share" />
        <span>Exporter Données</span>
      </button>
      <button className="floating-btn floating-btn--green" type="button">
        <Icon name="add_circle" />
        <span>Nouveau Rapport</span>
      </button>
    </div>
  )
}

