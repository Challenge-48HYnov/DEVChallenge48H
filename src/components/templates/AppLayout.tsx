import type { ReactNode } from 'react'
import SideNavBar from '../organisms/SideNavBar'
import TopAppBar from '../organisms/TopAppBar'

type Props = {
  children: ReactNode
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="ui-layout">
      <TopAppBar />
      <SideNavBar />
      <main className="ui-main">{children}</main>
    </div>
  )
}

