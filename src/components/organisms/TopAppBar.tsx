import Icon from '../atoms/Icon'
import IconButton from '../atoms/IconButton'
import SearchField from '../molecules/SearchField'

export default function TopAppBar() {
  return (
    <header className="ui-topbar">
      <div className="ui-brand">AtmosObserver</div>
      <div className="ui-topbar-right">
        <div className="ui-topbar-search">
          <SearchField />
        </div>
        <div className="ui-topbar-actions">
          <IconButton aria-label="Notifications">
            <Icon name="notifications" />
          </IconButton>
          <IconButton aria-label="Profil">
            <Icon name="account_circle" />
          </IconButton>
        </div>
      </div>
    </header>
  )
}

