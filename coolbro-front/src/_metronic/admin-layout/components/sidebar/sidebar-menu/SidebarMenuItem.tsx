import {FC} from 'react'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {useLocation} from 'react-router'
import {checkIsActive, KTIcon, WithChildren} from '../../../../helpers'
import {useLayout} from '../../../core'
import './Sidebar.css'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  imageSrc?: string,
  isDropdownOpen? : boolean, // Default to closed

}

const SidebarMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  imageSrc,
  fontIcon,
  hasBullet = false,
  isDropdownOpen, // Default to closed

}) => {
  const {pathname} = useLocation()
  const isActive = checkIsActive(pathname, to)
  const {config} = useLayout()
  const {app} = config

  const menuClasses = clsx('customMenuItem ps-0 menu-item', {
    'ps-3': isDropdownOpen,
  });

  return (
    <div className={menuClasses}>
      <Link className={clsx('customMenuLink ps-0 menu-link without-sub', {active: isActive})} to={to}>
        {/* {hasBullet && (
      <span className='pe-5 text-white'>&#124;</span>

        )} */}
       {imageSrc && app?.sidebar?.default?.menu?.iconType === 'svg' && (
          <span className='menu-icon '>
            {' '}
            <img src={imageSrc}  className='customImage fs-2' />
          </span>
        )}
        {fontIcon && app?.sidebar?.default?.menu?.iconType === 'font' && (
          <i className={clsx('bi fs-3', fontIcon)}></i>
        )}
        <span className='customMenuTitle ps-2 menu-title'>{title}</span>
      </Link>
      {children}
    </div>
  )
}

export {SidebarMenuItem}
