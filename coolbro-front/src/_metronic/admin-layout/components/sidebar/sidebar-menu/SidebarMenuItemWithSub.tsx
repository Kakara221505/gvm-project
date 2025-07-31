import React from 'react'
import clsx from 'clsx'
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
  imageSrc?: string
}

const SidebarMenuItemWithSub: React.FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  imageSrc,
  fontIcon,
  hasBullet,
}) => {
  const {pathname} = useLocation()
  const isActive = checkIsActive(pathname, to)
  const {config} = useLayout()
  const {app} = config

  return (
    <div
      className={clsx('customMenuItem ps-0 menu-item', {'here show': isActive}, 'menu-accordion')}
      data-kt-menu-trigger='click'
    >
      <span className='customMenuLink ps-0 menu-link'>
        {hasBullet && (
      <span className='text-white'>&#124;</span>

        )}
           {imageSrc && app?.sidebar?.default?.menu?.iconType === 'svg' && (
          <span className='menu-icon '>
            {' '}
            <img src={imageSrc}  className='customImage fs-2' />
          </span>
        )}
        {fontIcon && app?.sidebar?.default?.menu?.iconType === 'font' && (
          <i className={clsx('bi fs-3', fontIcon)}></i>
        )}
        <span className='customMenuTitle menu-title'>{title}</span>
        <span className='menu-arrow'></span>
      </span>
      <div className={clsx('border-start ps-6 menu-sub menu-sub-accordion', {'border-start ps-6 menu-active-bg': isActive})}>
        {children}
      </div>
    </div>
  )
}

export {SidebarMenuItemWithSub}
