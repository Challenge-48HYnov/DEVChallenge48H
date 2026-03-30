import { NavLink } from 'react-router-dom'
import Icon from '../atoms/Icon'

type Props = {
  to: string
  icon: string
  label: string
  end?: boolean
  disabled?: boolean
}

export default function SideNavItem({ to, icon, label, end, disabled }: Props) {
  if (disabled) {
    return (
      <span className="side-nav-item is-disabled">
        <Icon name={icon} />
        {label}
      </span>
    )
  }

  return (
    <NavLink to={to} end={end} className={({ isActive }) => `side-nav-item ${isActive ? 'is-active' : ''}`}>
      <Icon name={icon} />
      {label}
    </NavLink>
  )
}

