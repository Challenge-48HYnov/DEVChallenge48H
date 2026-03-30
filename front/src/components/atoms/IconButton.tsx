import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export default function IconButton({ children, className, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`icon-button ${className ?? ''}`.trim()}
      type={rest.type ?? 'button'}
    >
      {children}
    </button>
  )
}

