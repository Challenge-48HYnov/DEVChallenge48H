import type { BBox } from '../api/types'

export type DateMode = 'day' | 'range'

export type AtmosFilters = {
  dateMode: DateMode
  day: string // yyyy-mm-dd
  from: string // yyyy-mm-dd
  to: string // yyyy-mm-dd

  indexMin: number
  indexMax: number

  useBbox: boolean
  bboxPreview?: BBox

  autoRefresh: boolean
  refreshMinutes: number
}

type Props = {
  open: boolean
  pinned?: boolean
  filters: AtmosFilters
  onClose: () => void
  onApply: (next: AtmosFilters) => void
  onFiltersChange: (next: AtmosFilters) => void
}

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function FilterDrawer({
  open,
  pinned = false,
  filters,
  onClose,
  onApply,
  onFiltersChange,
}: Props) {
  const effectiveDay = filters.day || todayISO()

  function setDateMode(mode: DateMode) {
    if (mode === filters.dateMode) return
    if (mode === 'day') {
      onFiltersChange({
        ...filters,
        dateMode: 'day',
        day: effectiveDay,
      })
    } else {
      onFiltersChange({
        ...filters,
        dateMode: 'range',
        from: filters.from || effectiveDay,
        to: filters.to || effectiveDay,
      })
    }
  }

  function clampIndexPair(nextMin: number, nextMax: number) {
    const min = Math.max(0, Math.min(200, nextMin))
    const max = Math.max(0, Math.min(200, nextMax))
    if (min <= max) return { indexMin: min, indexMax: max }
    return { indexMin: max, indexMax: min }
  }

  return (
    <aside
      className={`filter-drawer ${open ? 'is-open' : ''} ${pinned ? 'is-pinned' : ''}`}
      role="dialog"
      aria-label="Filtres"
      aria-modal="true"
    >
      <div className="filter-drawer-header">
        <div>
          <h2 className="filter-title">Filters</h2>
          <p className="filter-subtitle">Adjust view parameters</p>
        </div>
        {!pinned ? (
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        ) : null}
      </div>

      <div className="filter-section">
        <div className="filter-sectionTitle">Plage temporelle</div>
        <div className="segmented">
          <button
            type="button"
            className={`seg-btn ${filters.dateMode === 'day' ? 'is-active' : ''}`}
            onClick={() => setDateMode('day')}
          >
            Jour
          </button>
          <button
            type="button"
            className={`seg-btn ${filters.dateMode === 'range' ? 'is-active' : ''}`}
            onClick={() => setDateMode('range')}
          >
            Plage
          </button>
        </div>

        {filters.dateMode === 'day' ? (
          <label className="field">
            <span className="field-label">Date</span>
            <input
              className="field-input"
              type="date"
              value={effectiveDay}
              onChange={(e) => onFiltersChange({ ...filters, day: e.target.value })}
            />
          </label>
        ) : (
          <div className="grid2">
            <label className="field">
              <span className="field-label">Du</span>
              <input
                className="field-input"
                type="date"
                value={filters.from}
                onChange={(e) => onFiltersChange({ ...filters, from: e.target.value })}
              />
            </label>
            <label className="field">
              <span className="field-label">Au</span>
              <input
                className="field-input"
                type="date"
                value={filters.to}
                onChange={(e) => onFiltersChange({ ...filters, to: e.target.value })}
              />
            </label>
          </div>
        )}
      </div>

      <div className="filter-section">
        <div className="filter-sectionTitle">Indice</div>
        <div className="pair">
          <label className="field">
            <span className="field-label">Min</span>
            <input
              className="field-input"
              type="number"
              min={0}
              max={200}
              step={1}
              value={filters.indexMin}
              onChange={(e) => {
                const nextMin = Number(e.target.value)
                const next = clampIndexPair(nextMin, filters.indexMax)
                onFiltersChange({ ...filters, ...next })
              }}
            />
          </label>
          <label className="field">
            <span className="field-label">Max</span>
            <input
              className="field-input"
              type="number"
              min={0}
              max={200}
              step={1}
              value={filters.indexMax}
              onChange={(e) => {
                const nextMax = Number(e.target.value)
                const next = clampIndexPair(filters.indexMin, nextMax)
                onFiltersChange({ ...filters, ...next })
              }}
            />
          </label>
        </div>

        <div className="sliderPair">
          <input
            type="range"
            min={0}
            max={200}
            step={1}
            value={filters.indexMin}
            onChange={(e) => {
              const nextMin = Number(e.target.value)
              const next = clampIndexPair(nextMin, filters.indexMax)
              onFiltersChange({ ...filters, ...next })
            }}
          />
          <input
            type="range"
            min={0}
            max={200}
            step={1}
            value={filters.indexMax}
            onChange={(e) => {
              const nextMax = Number(e.target.value)
              const next = clampIndexPair(filters.indexMin, nextMax)
              onFiltersChange({ ...filters, ...next })
            }}
          />
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-sectionTitle">Localisation</div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.useBbox}
            onChange={(e) => onFiltersChange({ ...filters, useBbox: e.target.checked })}
          />
          <span>Dans la zone affichée (bbox carte)</span>
        </label>

        {filters.useBbox && filters.bboxPreview ? (
          <div className="bbox-preview">
            bbox: {filters.bboxPreview.south.toFixed(2)},{' '}
            {filters.bboxPreview.west.toFixed(2)} - {filters.bboxPreview.north.toFixed(2)},{' '}
            {filters.bboxPreview.east.toFixed(2)}
          </div>
        ) : null}
      </div>

      <div className="filter-section">
        <div className="filter-sectionTitle">Mise a jour</div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.autoRefresh}
            onChange={(e) => onFiltersChange({ ...filters, autoRefresh: e.target.checked })}
          />
          <span>Auto-refresh</span>
        </label>

        <div className="refreshRow">
          <span className="refreshLabel">Toutes</span>
          <input
            className="refreshInput"
            type="number"
            min={1}
            max={30}
            step={1}
            value={filters.refreshMinutes}
            disabled={!filters.autoRefresh}
            onChange={(e) => onFiltersChange({ ...filters, refreshMinutes: Number(e.target.value) })}
          />
          <span className="refreshUnit">minutes</span>
        </div>
      </div>

      <div className="filter-footer">
        <button className="apply-btn" type="button" onClick={() => onApply(filters)}>
          Appliquer les filtres
        </button>
      </div>
    </aside>
  )
}

