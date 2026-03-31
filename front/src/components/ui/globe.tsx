import type { HTMLAttributes } from 'react'

type GlobeProps = HTMLAttributes<HTMLDivElement> & {
  // API compatible basique avec MagicUI : on ignore config pour l’instant
  config?: unknown
}

export function Globe({ className = '', ...rest }: GlobeProps) {
  return (
    <div
      className={`atmos-globe ${className}`.trim()}
      aria-hidden="true"
      {...rest}
    >
      <div className="atmos-globe-core" />
      <div className="atmos-globe-ring atmos-globe-ring--inner" />
      <div className="atmos-globe-ring atmos-globe-ring--outer" />
    </div>
  )
}

