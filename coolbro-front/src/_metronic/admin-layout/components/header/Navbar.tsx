import clsx from 'clsx'
import {toAbsoluteUrl} from '../../../helpers'
import {HeaderUserMenu} from '../../../partials'
import {useAuth} from '../../../../app/modules/auth'
// import {useLayout} from '../../core'

const itemClass = 'ms-1 ms-lg-3'
// const btnClass =
// 'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px'
const userAvatarClass = 'symbol-35px symbol-md-40px'
// const btnIconClass = 'fs-1'
const stylesTransBtn = {
  background: '#F9F9F9',
  borderBottomLeftRadius: '8px', // Use camelCased property name
  borderTopLeftRadius: '8px', // Use camelCased property name
  paddingLeft: 19,
  paddingTop: 19,
  paddingBottom: 19,
  paddingRight: 19,
}

const dropdownButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between', // To align content within the button
  ...stylesTransBtn, // Include your existing button styles
}

const caretStyle = {
  content: "''",
  borderTop: '0.3em solid',
  borderRight: '0.3em solid transparent',
  borderLeft: '0.3em solid transparent',
  verticalAlign: 'middle',
  marginLeft: '0.5rem', // Adjust the margin as needed
}

const Navbar = () => {
  const {currentUser, logout} = useAuth()

  // const {config} = useLayout()
  return (
    <div className='app-navbar flex-shrink-0'>
      {/* <div className={clsx('app-navbar-item align-items-stretch', itemClass)}>
        <Search />
      </div> */}

      {/* <div className={clsx('app-navbar-item', itemClass)}>
        <div id='kt_activities_toggle' className={btnClass}>
          <KTIcon iconName='chart-simple' className={btnIconClass} />
        </div>
      </div> */}

      {/* <div className={clsx('app-navbar-item', itemClass)}>
        <div
          data-kt-menu-trigger="{default: 'click'}"
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
          className={btnClass}
        >
          <KTIcon iconName='element-plus' className={btnIconClass} />
        </div>
        <HeaderNotificationsMenu />
      </div> */}

      {/* <div className={clsx('app-navbar-item', itemClass)}>
        <div className={clsx('position-relative', btnClass)} id='kt_drawer_chat_toggle'>
          <KTIcon iconName='message-text-2' className={btnIconClass} />
          <span className='bullet bullet-dot bg-success h-6px w-6px position-absolute translate-middle top-0 start-50 animation-blink' />
        </div>
      </div> */}

      <div className={clsx('app-navbar-item', itemClass)}>
        <div className='me-4'>
          <button style={stylesTransBtn} type='button' className='d-none  btn btn-default'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='18'
              height='20'
              viewBox='0 0 18 20'
              fill='none'
            >
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M15.7071 6.79633C15.7071 8.05226 16.039 8.79253 16.7695 9.64559C17.3231 10.2741 17.5 11.0808 17.5 11.956C17.5 12.8302 17.2128 13.6601 16.6373 14.3339C15.884 15.1417 14.8215 15.6573 13.7372 15.747C12.1659 15.8809 10.5937 15.9937 9.0005 15.9937C7.40634 15.9937 5.83505 15.9263 4.26375 15.747C3.17846 15.6573 2.11602 15.1417 1.36367 14.3339C0.78822 13.6601 0.5 12.8302 0.5 11.956C0.5 11.0808 0.677901 10.2741 1.23049 9.64559C1.98384 8.79253 2.29392 8.05226 2.29392 6.79633V6.3703C2.29392 4.68834 2.71333 3.58852 3.577 2.51186C4.86106 0.941697 6.91935 0 8.95577 0H9.04522C11.1254 0 13.2502 0.987019 14.5125 2.62466C15.3314 3.67916 15.7071 4.73265 15.7071 6.3703V6.79633ZM6.07367 18.0608C6.07367 17.5573 6.53582 17.3266 6.96318 17.2279C7.46309 17.1222 10.5093 17.1222 11.0092 17.2279C11.4366 17.3266 11.8987 17.5573 11.8987 18.0608C11.8738 18.5402 11.5926 18.9653 11.204 19.2352C10.7001 19.628 10.1088 19.8767 9.49057 19.9664C9.14868 20.0107 8.81276 20.0117 8.48279 19.9664C7.86362 19.8767 7.27227 19.628 6.76938 19.2342C6.37978 18.9653 6.09852 18.5402 6.07367 18.0608Z'
                fill='#99A1B7'
              />
            </svg>
          </button>
        </div>
        <div className='dropdown '>
          <button
            style={dropdownButtonStyle}
            className='pt-3 pb-3 zza d-flex align-items-center bg-transparent btn btn-default   dropdown-toggle3'
            type='button'
            id='dropdownMenuButton1'
            data-bs-toggle='dropdown'
            aria-expanded='false'
          >
            <div className='d-flex '>
              <div className='d-flex invisible flex-column justify-content-center align-items-end me-5'>
                <small className='text-black fw-medium'>Welcome</small>
                <small className='text-black fw-medium'>{currentUser ? currentUser.Name : ''}</small>
              </div>
              <div className={`rounded-circle cursor-pointer symbol ${userAvatarClass}`}>
              <img
                  className='rounded-circle logoutFilter p-2'
                  src={toAbsoluteUrl('/media/vectors/logout.png')}
                  alt=''
                />
              </div>
            </div>
            {/* <span style={caretStyle}></span> Add this span for the caret */}
          </button>
          <ul className='dropdown-menu w-100' aria-labelledby='dropdownMenuButton1'>
            <li onClick={logout}>
              <a className='dropdown-item cursor-pointer'>Logout</a>
            </li>
          </ul>
        </div>
        {/* <div
          className={clsx('cursor-pointer symbol', userAvatarClass)}
          data-kt-menu-trigger="{default: 'click'}"
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
        >
          <img src={toAbsoluteUrl('/media/avatars/300-1.jpg')} alt='' />
        </div> */}
        <HeaderUserMenu />
      </div>

      {/* {config.app?.header?.default?.menu?.display && (
        <div className='app-navbar-item d-lg-none ms-2 me-n3' title='Show header menu'>
          <div
            className='btn btn-icon btn-active-color-primary w-35px h-35px'
            id='kt_app_header_menu_toggle'
          >
            <KTIcon iconName='text-align-left' className={btnIconClass} />
          </div>
        </div>
      )} */}
    </div>
  )
}

export {Navbar}
