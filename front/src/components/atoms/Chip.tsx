type Props = {
  label: string
  tone?: 'default' | 'success'
}

export default function Chip({ label, tone = 'default' }: Props) {
  return <span className={`chip chip--${tone}`}>{label}</span>
}

