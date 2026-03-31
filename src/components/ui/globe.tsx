import createGlobe, { type COBEOptions } from 'cobe'
import { useEffect, useRef } from 'react'
import type { HTMLAttributes } from 'react'

type GlobeProps = HTMLAttributes<HTMLDivElement> & {
  className?: string
  config?: COBEOptions
}

export function Globe({ className = '', config, ...rest }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const devicePixelRatio = window.devicePixelRatio || 1
    const size = Math.min(containerRef.current.offsetWidth, 320)
    canvas.width = size * devicePixelRatio
    canvas.height = size * devicePixelRatio

    const baseConfig: COBEOptions = {
      width: canvas.width,
      height: canvas.height,
      devicePixelRatio,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      scale: 1.05,
      mapSamples: 16000,
      mapBrightness: 2,
      baseColor: [0.03, 0.08, 0.2],
      markerColor: [0.0, 0.9, 0.45],
      glowColor: [0.1, 0.5, 1.0],
      markers: [],
      ...config,
      onRender: (state) => {
        state.phi += 0.002
        config?.onRender?.(state)
      },
    }

    const globe = createGlobe(canvas, baseConfig)

    const handleResize = () => {
      if (!containerRef.current) return
      const newSize = Math.min(containerRef.current.offsetWidth, 320)
      canvas.width = newSize * devicePixelRatio
      canvas.height = newSize * devicePixelRatio
      globe.resize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      globe.destroy()
      window.removeEventListener('resize', handleResize)
    }
  }, [config])

  return (
    <div
      ref={containerRef}
      className={`atmos-globe-shell ${className}`.trim()}
      aria-hidden="true"
      {...rest}
    >
      <canvas ref={canvasRef} className="atmos-globe-canvas" />
      <div className="atmos-globe-overlay" />
    </div>
  )
}

