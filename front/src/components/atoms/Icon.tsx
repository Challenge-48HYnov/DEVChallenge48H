type Props = {
  name: string
  className?: string
}

export default function Icon({ name, className }: Props) {
  return <span className={`material-symbols-outlined ${className ?? ''}`.trim()}>{name}</span>
}

