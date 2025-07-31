/* eslint-disable react-hooks/exhaustive-deps */
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {useLayout} from '../../core'
import {Header} from './Header'
import {Navbar} from './Navbar'

const stylesTransBtn = {
  background: '#F9F9F9',
  borderBottomLeftRadius: '8px', // Use camelCased property name
  borderTopLeftRadius: '8px', // Use camelCased property name
}
const stylesTransTxt = {
  background: '#F9F9F9',
  borderBottomRightRadius: '8px', // Use camelCased property name
  borderTopRightRadius: '8px', // Use camelCased property name
  borderBottomLeftRadius: '0px', // Use camelCased property name
  borderTopLeftRadius: '0px', // Use camelCased property name
  outline: 'none', // Remove the outline when in focus
}

export function HeaderWrapper() {
  const {config, classes} = useLayout()
  if (!config.app?.header?.display) {
    return null
  }

  return (
    <div id='kt_app_header' className='border-0 primaryBGMobile  app-header py-14'>
      <div
        id='kt_app_header_container'
        className={clsx(
          'app-container flex-grow-1',
          classes.headerContainer.join(' '),
          config.app?.header?.default?.containerClass
        )}
      >
        {config.app.sidebar?.display && (
          <>
            <div
              className='d-flex align-items-center d-lg-none ms-n2 me-2'
              title='Show sidebar menu'
            >
              <div
                className='btn btn-icon btn-active-color-primary w-35px h-35px'
                id='kt_app_sidebar_mobile_toggle'
              >
                <KTIcon iconName='abstract-14' className=' fs-1' />
              </div>
              <div className='d-flex align-items-center flex-grow-1 flex-lg-grow-0'>
                <Link to='/dashboard' className='d-lg-none'>
                  <img alt='Logo' src={toAbsoluteUrl('/media/logos/logo.png')} className='h-30px' />
                </Link>
              </div>
            </div>
          </>
        )}

        {!(config.layoutType === 'dark-sidebar' || config.layoutType === 'light-sidebar') && (
          <div className='d-flex align-items-center flex-grow-1 flex-lg-grow-0 me-lg-15'>
            <Link to='/dashboard'>
              {config.layoutType !== 'dark-header' ? (
                <img
                  alt='Logo'
                  src={toAbsoluteUrl('/media/logos/logo.png')}
                  className='h-20px h-lg-30px app-sidebar-logo-default'
                />
              ) : (
                <>
                  <img
                    alt='Logo'
                    src={toAbsoluteUrl('/media/logos/logo.png')}
                    className='h-20px h-lg-30px app-sidebar-logo-default theme-light-show'
                  />
                  <img
                    alt='Logo'
                    src={toAbsoluteUrl('/media/logos/logo.png')}
                    className='h-20px h-lg-30px app-sidebar-logo-default theme-dark-show'
                  />
                </>
              )}
            </Link>
          </div>
        )}

        <div
          id='kt_app_header_wrapper'
          className='d-flex align-items-stretch justify-content-between flex-lg-grow-1'
        >
          {/* <div className='row ms-5'>
            <div className='input-group mb-3'>
              <button
                style={stylesTransBtn}
                className=' btn btn-outline-secondary dropdown-toggle'
                type='button'
                data-bs-toggle='dropdown'
                aria-expanded='false'
              >
                Products
              </button>
              <ul className='dropdown-menu'>
                <li>
                  <a className='dropdown-item' href='#'>
                    Action
                  </a>
                </li>
                <li>
                  <a className='dropdown-item' href='#'>
                    Another action
                  </a>
                </li>
                <li>
                  <a className='dropdown-item' href='#'>
                    Something else here
                  </a>
                </li>

                <li>
                  <a className='dropdown-item' href='#'>
                    Separated link
                  </a>
                </li>
              </ul>
              <div style={{position: 'relative'}}>
                <span
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 20 20'
                    fill='none'
                  >
                    <path
                      fill-rule='evenodd'
                      clip-rule='evenodd'
                      d='M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z'
                      stroke='#99A1B7'
                      stroke-width='2'
                      stroke-linecap='round'
                      stroke-linejoin='round'
                    />
                    <path
                      d='M18.9984 19.0004L14.6484 14.6504'
                      stroke='#99A1B7'
                      stroke-width='2'
                      stroke-linecap='round'
                      stroke-linejoin='round'
                    />
                  </svg>
                </span>
                <input
                  style={{...stylesTransTxt, paddingLeft: '33px'}} // Add paddingLeft to create space for the icon
                  type='text'
                  className='form-control border-0 ms-1'
                  placeholder='Search'
                  aria-label='Text input with dropdown button'
                />
              </div>
            </div>
            <button     style={stylesTransBtn} type="button" className="btn btn-default">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 6.79633C15.7071 8.05226 16.039 8.79253 16.7695 9.64559C17.3231 10.2741 17.5 11.0808 17.5 11.956C17.5 12.8302 17.2128 13.6601 16.6373 14.3339C15.884 15.1417 14.8215 15.6573 13.7372 15.747C12.1659 15.8809 10.5937 15.9937 9.0005 15.9937C7.40634 15.9937 5.83505 15.9263 4.26375 15.747C3.17846 15.6573 2.11602 15.1417 1.36367 14.3339C0.78822 13.6601 0.5 12.8302 0.5 11.956C0.5 11.0808 0.677901 10.2741 1.23049 9.64559C1.98384 8.79253 2.29392 8.05226 2.29392 6.79633V6.3703C2.29392 4.68834 2.71333 3.58852 3.577 2.51186C4.86106 0.941697 6.91935 0 8.95577 0H9.04522C11.1254 0 13.2502 0.987019 14.5125 2.62466C15.3314 3.67916 15.7071 4.73265 15.7071 6.3703V6.79633ZM6.07367 18.0608C6.07367 17.5573 6.53582 17.3266 6.96318 17.2279C7.46309 17.1222 10.5093 17.1222 11.0092 17.2279C11.4366 17.3266 11.8987 17.5573 11.8987 18.0608C11.8738 18.5402 11.5926 18.9653 11.204 19.2352C10.7001 19.628 10.1088 19.8767 9.49057 19.9664C9.14868 20.0107 8.81276 20.0117 8.48279 19.9664C7.86362 19.8767 7.27227 19.628 6.76938 19.2342C6.37978 18.9653 6.09852 18.5402 6.07367 18.0608Z" fill="#99A1B7"/>
</svg>
            </button>
          </div> */}

          {config.app.header.default?.content === 'menu' &&
            config.app.header.default.menu?.display && (
              <div
                className='app-header-menu app-header-mobile-drawer align-items-stretch'
                data-kt-drawer='true'
                data-kt-drawer-name='app-header-menu'
                data-kt-drawer-activate='{default: true, lg: false}'
                data-kt-drawer-overlay='true'
                data-kt-drawer-width='225px'
                data-kt-drawer-direction='end'
                data-kt-drawer-toggle='#kt_app_header_menu_toggle'
                data-kt-swapper='true'
                data-kt-swapper-mode="{default: 'append', lg: 'prepend'}"
                data-kt-swapper-parent="{default: '#kt_app_body', lg: '#kt_app_header_wrapper'}"
              >
                <Header />
              </div>
            )}
          <Navbar />
        </div>
      </div>
    </div>
  )
}
