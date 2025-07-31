/* eslint-disable react/jsx-no-target-blank */
// import React from 'react'
import {useIntl} from 'react-intl'
// import {KTIcon} from '../../../../helpers'
import {SidebarMenuItem} from './SidebarMenuItem'
import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {toAbsoluteUrl} from '../../../../helpers'
import {useAuth} from '../../../../../app/modules/auth'

const userAvatarClass = 'symbol-35px symbol-md-40px'

const stylesTransBtn = {
  background: 'transparent',
  borderBottomLeftRadius: '8px', // Use camelCased property name
  borderTopLeftRadius: '8px', // Use camelCased property name
  paddingLeft: 19,
  paddingTop: 19,
  paddingBottom: 19,
  paddingRight: 19,
}

const dropdownButtonStyle = {
  display: 'flex',
  color: '#fff',
  alignItems: 'center',
  justifyContent: 'space-between', // To align content within the button
  ...stylesTransBtn, // Include your existing button styles
}

const SidebarMenuMain = () => {
  const {currentUser, logout} = useAuth()

  const intl = useIntl()

  return (
    <>
      <div className='px-4 '>
        <div className='dropdown marginPageMYMobile mt-0  d-flex justify-content-start'>
          <button
            style={dropdownButtonStyle}
            className='pt-3 pb-3 zza avatarButton px-0 d-flex align-items-center btn btn-default '
            type='button'
            id='dropdownMenuButton1'
            data-bs-toggle='dropdown'
            aria-expanded='false'
          >
            <div className='d-flex '>
              <div className={`rounded-circle cursor-pointer symbol me-5 ${userAvatarClass}`}>
                <img
                  className='rounded-circle'
                  src={toAbsoluteUrl('/media/avatars/300-1.jpeg')}
                  alt=''
                />
              </div>
              <div className='d-flex flex-column justify-content-center align-items-baseline '>
                <small className='text-white  fw-bolder'>Welcome</small>
                <small className='text-white fw-bolder'>{currentUser ? currentUser.Name : ''}</small>
              </div>
            </div>
            {/* <span style={caretStyle}></span> Add this span for the caret */}
          </button>
        
        </div>
        <span className='menu-section fw-bold text-white text-uppercase fs-8 ls-1 py-3 d-block'>
          MAIN
        </span>
        <SidebarMenuItem
          to='admin/dashboard'
          imageSrc={toAbsoluteUrl('/media/vectors/DashboardIcon.png')}
          title={intl.formatMessage({id: 'MENU.DASHBOARD'})}
          fontIcon='bi-app-indicator'
        />

        <SidebarMenuItemWithSub
          to='/admin/user'
          title='User management'
          fontIcon='bi-layers'
          imageSrc={toAbsoluteUrl('/media/vectors/UserIcon.png')}
        >
          <SidebarMenuItem to='/admin/user/list' title='Users' hasBullet={true} />
        </SidebarMenuItemWithSub>

        <SidebarMenuItem
          to='/admin/dealer'
          title='Dealers'
          imageSrc={toAbsoluteUrl('/media/vectors/DealerIcon.png')}
        ></SidebarMenuItem>

        <SidebarMenuItem
          to='/admin/distributor'
          title='Distributor'
          imageSrc={toAbsoluteUrl('/media/vectors/DistributorIcon.png')}
        ></SidebarMenuItem>

        <SidebarMenuItemWithSub
          to='/admin/products'
          title='Product Settings'
          fontIcon='bi-layers'
          imageSrc={toAbsoluteUrl('/media/vectors/ProductIcon.png')}
        >
          <SidebarMenuItem to='/admin/product/list' title='Product' hasBullet={true} />
          <SidebarMenuItem to='/admin/brand/list' title='Brand' hasBullet={true} />
          <SidebarMenuItem
            to='/admin/energyEfficiencyRating/list'
            title='Energy Efficiency'
            hasBullet={true}
          />
          <SidebarMenuItem to='/admin/category/list' title='Category' hasBullet={true} />
        </SidebarMenuItemWithSub>

        <SidebarMenuItem
          to='/admin/orders'
          title='Orders'
          imageSrc={toAbsoluteUrl('/media/vectors/DistributorIcon.png')}
        ></SidebarMenuItem>

        {/* <SidebarMenuItem
          to='/sfs'
          title='Product Settings'
          imageSrc={toAbsoluteUrl('/media/vectors/ProductIcon.png')}
          fontIcon='bi-layers'
        ></SidebarMenuItem> */}

        {/* <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Crafted</span>
        </div>
      </div> */}
        {/* <SidebarMenuItemWithSub
        to='/crafted/accounts'
        title='Accounts'
        icon='profile-circle'
        fontIcon='bi-person'
      >
        <SidebarMenuItem to='/crafted/account/overview' title='Overview' hasBullet={true} />
        <SidebarMenuItem to='/crafted/account/settings' title='Settings' hasBullet={true} />
      </SidebarMenuItemWithSub> */}
        {/* <SidebarMenuItemWithSub to='/error' title='Errors' fontIcon='bi-sticky' icon='cross-circle'>
        <SidebarMenuItem to='/error/404' title='Error 404' hasBullet={true} />
        <SidebarMenuItem to='/error/500' title='Error 500' hasBullet={true} />
      </SidebarMenuItemWithSub> */}
        <div className='menu-item'>
          <div className='menu-content ps-0 pt-8 pb-2'>
            <span className='menu-section fw-bold text-white text-uppercase fs-8 ls-1 py-3 d-block'>
              Settings
            </span>
          </div>
        </div>
        <SidebarMenuItem
          to='/dv'
          title='Notification'
          imageSrc={toAbsoluteUrl('/media/vectors/Bellicon.png')}
          fontIcon='bi-layers'
        ></SidebarMenuItem>

        <SidebarMenuItemWithSub
          to='/admin/settings'
          title='Settings'
          fontIcon='bi-layers'
          imageSrc={toAbsoluteUrl('/media/vectors/SettingsIcon.png')}
        >
          <SidebarMenuItem to='/admin/product/list' title='Demo' hasBullet={true} />
        </SidebarMenuItemWithSub>
      </div>
    </>
  )
}

export {SidebarMenuMain}
