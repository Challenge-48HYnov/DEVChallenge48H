export type IndexBucket = {
  minInclusive: number
  maxInclusive: number
  label: string
  color: string
  textColor: string
}

const BUCKETS: IndexBucket[] = [
  {
    minInclusive: 0,
    maxInclusive: 50,
    label: 'Excellent',
    color: '#00e475',
    textColor: '#003918',
  },
  {
    minInclusive: 51,
    maxInclusive: 100,
    label: 'Modéré',
    color: '#9ecaff',
    textColor: '#001d36',
  },
  {
    minInclusive: 101,
    maxInclusive: 150,
    label: 'Sensible',
    color: '#fbbf24',
    textColor: '#1f2937',
  },
  {
    minInclusive: 151,
    maxInclusive: Number.POSITIVE_INFINITY,
    label: 'Critique',
    color: '#ffb4ab',
    textColor: '#690005',
  },
]

export function getIndexBucket(index: number): IndexBucket {
  return (
    BUCKETS.find((b) => index >= b.minInclusive && index <= b.maxInclusive) ??
    BUCKETS[0]
  )
}

export function formatIndex(index: number): string {
  return String(Math.round(index))
}

export function getIndexRadiusPx(index: number): number {
  // On garde une échelle “lisible” : un point faible reste visible,
  // un point fort attire l'oeil sans devenir énorme.
  const clamped = Math.max(0, Math.min(200, index))
  return 14 + (clamped / 200) * 18
}

