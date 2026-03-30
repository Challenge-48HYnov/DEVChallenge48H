import type { ReactNode } from 'react'
import AppLayout from './templates/AppLayout'

type Props = {
  children: ReactNode
}

export default function AtmosShell({ children }: Props) {
  return <AppLayout>{children}</AppLayout>
}

