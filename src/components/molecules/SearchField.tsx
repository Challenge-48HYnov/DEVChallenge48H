import Icon from '../atoms/Icon'

type Props = {
  placeholder?: string
}

export default function SearchField({ placeholder = 'Rechercher une station...' }: Props) {
  return (
    <label className="search-field">
      <Icon name="search" className="search-field-icon" />
      <input className="search-field-input" type="text" placeholder={placeholder} />
    </label>
  )
}

