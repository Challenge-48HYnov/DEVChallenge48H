import Icon from '../atoms/Icon'
import SideNavItem from '../molecules/SideNavItem'

export default function SideNavBar() {
  return (
    <aside className="ui-sidenav">
      <div className="ui-sidenav-head">
        <div className="ui-sensorBadge">
          <Icon name="sensors" />
        </div>
        <div>
          <h2 className="ui-observerTitle">Observer Alpha</h2>
          <p className="ui-observerSub">Station 04-B</p>
        </div>
      </div>

      <nav className="ui-sidenav-nav">
        <SideNavItem to="/" end icon="map" label="Map View" />
        <SideNavItem to="/analytics" icon="insights" label="Analytics" />
        <SideNavItem to="#" icon="hub" label="Infrastructure" disabled />
      </nav>

      <div className="ui-sidenav-foot">
        <span className="side-nav-item is-disabled">
          <Icon name="settings" />
          Settings
        </span>
        <span className="side-nav-item is-disabled">
          <Icon name="help" />
          Support
        </span>
      </div>
    </aside>
  )
}

