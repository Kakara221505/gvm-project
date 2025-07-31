import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toAbsoluteUrl } from '../../../helpers'
import { useLayout } from '../../core'
import { useAuth } from '../../../../app/modules/auth'
import { HeaderWrapperStyles } from './HeaderWrapperStyles'
import ResponsiveNavbar from './ResponsiveNavbar/ResponsiveNavbar'
import { selectCartItems } from '../../../../redux/Slices/cartSlice'
import { useGeolocation } from '../../../../context/GeolocationContext'

const userAvatarClass = 'symbol-35px symbol-md-40px'

const stylesTransBtn = {
  background: '#F9F9F9',
  borderBottomLeftRadius: '8px', // Use camelCased property name
  borderTopLeftRadius: '8px', // Use camelCased property name
}

const dropdownButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between', // To align content within the button
  ...stylesTransBtn, // Include your existing button styles
}

interface MenuItemProps {
  icon: string
  text: string
}

interface HeaderWrapperProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  handleSearchSubmit: () => void;
}


export function HeaderWrapper({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
}: HeaderWrapperProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const coordinates = useGeolocation()
  const { currentUser, logout } = useAuth()
  const totalItems = useSelector(selectCartItems)
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('us')

  useEffect(() => {
    const fetchData = async () => {
      if (coordinates) {
        const { latitude, longitude } = coordinates
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_SERVER_URL}/common/get_zipcode_details_from_latlong`,
            {
              lat: latitude,
              lng: longitude,
            }
          )

          if (response.data.status === 'success') {
            const data = response.data.data
            const initialLocation = data.area + ' ' + data.zipcode
            localStorage.setItem('deliveryLocation', initialLocation)
            // setDeliveryLocation(data.area + " " + data.zipcode);
          }
        } catch (error) {
          console.log(error)
        }
      }
    }

    const storedDeliveryLocation = localStorage.getItem('deliveryLocation')
    if (!storedDeliveryLocation) {
      const initialLocation = 'Surat 394107'
      localStorage.setItem('deliveryLocation', initialLocation)
      fetchData()
    }
  }, [coordinates])

  const handleLanguageChange = (lang: any) => {
    setSelectedLanguage(lang)
    // Add logic to handle language change, such as updating the language in the state or triggering language-related actions.
  }

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const onClickLogout = () => {
    navigate('/auth')
  }

  const navigateToMyProfile = () => {
    navigate('/user/my-profile')
  }

  const onClickMyCart = () => {
    if (!currentUser) {
      navigate('/auth')
    } else {
      navigate('/user/cart')
    }
  }

  const onClickDownloadApp = () => {
    navigate('/download-app')
  }
  const handleHover = () => {
    setDropdownOpen(true)
  }

  const handleLeave = () => {
    setDropdownOpen(false)
  }

  const handleClick = () => {
    if (!currentUser) {
      navigate('/auth')
    } else {
      navigateToMyProfile()
    }
  }

  const { config } = useLayout()
  if (!config.app?.header?.display) {
    return null
  }

  const menuItems = [
    { path: '/product-list', label: 'Product' },
    { path: '/dealer-list', label: 'Dealers' },
  ]

  const iconUrl = searchQuery
    ? 'url("https://example.com/clear-icon.png")'
    : 'url("https://cdn.icon-icons.com/icons2/2551/PNG/512/search_icon_152764.png")'

  // Find the active item based on the current location.
  const activeItem = menuItems.find((item) => item.path === location.pathname)

  function MenuItem({ icon, text }: MenuItemProps) {
    return (
      <span className='dropdown-item'>
        <div className='d-flex align-items-center mt-2'>
          <i className={`fs-5 ${icon}`}></i>
          <strong className='fs-6 ps-2 fw-normal moreTextDrp'>{text}</strong>
        </div>
      </span>
    )
  }

  return (
    <>
      <HeaderWrapperStyles>
        <div
          id='kt_app_header'
          className='primaryBG  py-2 commonMobilePX py-5 border-bottom-0'
        >
          <div className='row ipadDisplayNone'>
            <nav className='navbar navbar-expand-lg pb-0 navbar-light bg-transparent'>
              <div className='container-fluid px-0'>
                <span className='position-relative navbar-brand me-0'>
                  <Link to='/' className=''>
                    <img
                      alt='Logo'
                      src={toAbsoluteUrl('/media/logos/logo.png')}
                      className='h-30px d-flex justify-content-center m-auto'
                    />
                  </Link>
                </span>
                <div className='collapse navbar-collapse' id='navbarTogglerDemo02'>
                  <div className='col-lg-12 d-flex'>
                    <div className='col-lg-9'>
                      <div className='col-lg-12 d-flex'>
                        <div className='col-lg-3'>
                        </div>
                        <div className='col-lg-8 col-xl-9 col-xxl-9'>
                          <div className='input-group '>
                            <button
                              className='btn btn-outline-secondary dropdown-toggle bg-white me-1'
                              type='button'
                              data-bs-toggle='dropdown'
                              aria-expanded='false'
                            >
                              {activeItem ? activeItem.label : 'Products'}
                            </button>
                            <ul className='dropdown-menu'>
                              {menuItems.map((menuItem) => (
                                <li key={menuItem.path}>
                                  <Link
                                    to={menuItem.path}
                                    className={`dropdown-item ${activeItem && activeItem.path === menuItem.path
                                      ? 'active'
                                      : ''
                                      }`}
                                  >
                                    {menuItem.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <input
                              type='search'
                              placeholder='Search'
                              className='searchInputBox bg-white form-control border-0 ms-1'
                              aria-label='Text input with dropdown button'
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyPress={handleKeyPress}
                              style={{
                                backgroundImage: iconUrl,
                                backgroundPosition: 'right 2% center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '5%',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-3 d-flex justify-content-end'>
                      <div className='d-flex align-items-center justify-content-end gap-3 gap-lg-5 gap-xl-5 gap-xxl-8 float-end pe-4'>
                        <div>
                          <div
                            className='d-flex '
                            onMouseEnter={handleHover}
                            onMouseLeave={handleLeave}
                          >
                            <div className='dropdown  text-white'>
                              <button
                                style={dropdownButtonStyle}
                                className='py-1 px-0 d-flex bg-transparent text-white justify-content-evenly align-items-center btn btn-default dropdown-toggle'
                                type='button'
                                id='dropdownMenuButton1'
                                data-bs-toggle='dropdown'
                                aria-expanded='false'
                                onClick={handleClick}
                              >
                                <div className='d-flex  text-white align-items-center'>
                                  <div className='d-flex  text-white flex-column justify-content-center align-items-end pe-2'>
                                    {/* <small className='text-black '>Welcome</small>
                                            <small className='text-black '>
                                              {currentUser.Name}
                                            </small> */}
                                  </div>
                                  <div
                                    className={`rounded-circle  text-white cursor-pointer  ${userAvatarClass}`}
                                  >
                                    <img
                                      height={30}
                                      width={30}
                                      className='rounded-circle'
                                      src={toAbsoluteUrl('/media/vectors/UserIconVector.png')}
                                      alt=''
                                    />
                                  </div>
                                </div>
                              </button>
                              <ul
                                className={`dropdown-menu text-white  w-100 ${isDropdownOpen ? 'show' : ''
                                  }`}
                                aria-labelledby='dropdownMenuButton1'
                              >
                                {currentUser ? (
                                  currentUser && (
                                    <li>
                                      <button
                                        onClick={navigateToMyProfile}
                                        className='dropdown-item  cursor-pointer'
                                      >
                                        My Profile
                                      </button>
                                    </li>
                                  )
                                ) : (
                                  <li>
                                    <button
                                      onClick={onClickLogout}
                                      className='dropdown-item  cursor-pointer'
                                    >
                                      Login
                                    </button>
                                  </li>
                                )}
                                <li>
                                  <button
                                    onClick={navigateToMyProfile}
                                    className='dropdown-item cursor-pointer'
                                  >
                                    Notifications
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={onClickDownloadApp}
                                    className='dropdown-item cursor-pointer'
                                  >
                                    Download App
                                  </button>
                                </li>
                                {currentUser
                                  ? currentUser && (
                                    <li>
                                      <button
                                        onClick={logout}
                                        className='dropdown-item cursor-pointer'
                                      >
                                        Logout
                                      </button>
                                    </li>
                                  )
                                  : ''}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className='d-flex '>
                            <button
                              style={stylesTransBtn}
                              type='button'
                              className='d-flex align-items-center cartImgMain px-0 bg-transparent  btn btn-default'
                              onClick={onClickMyCart}
                            >
                              <div className='position-relative'>
                                <img
                                  alt='Cart'
                                  src={toAbsoluteUrl('/media/vectors/Cart.png')}
                                  className='img-fluid'
                                />
                                <div className='cartCounterMain position-absolute end-0 top-0 bg-danger text-white rounded-circle'>
                                  {totalItems}
                                </div>
                              </div>
                              {/* <small className='text-white ps-3 fw-bold mt-1 fs-6'>Cart</small> */}
                            </button>
                          </div>
                        </div>
                        <div className='text-white d-flex'>
                          <div className='dropdown  text-white'>
                            <button
                              className='btn btn-default bg-transparent  text-white dropdown-toggle px-0'
                              type='button'
                              id='languageDropdown'
                              data-bs-toggle='dropdown'
                              aria-haspopup='true'
                              aria-expanded='false'
                            >
                              <img
                                src={`https://flagicons.lipis.dev/flags/4x3/${selectedLanguage}.svg`}
                                alt={`${selectedLanguage} flag`}
                                style={{ marginRight: '8px', width: '24px', height: '16px' }}
                              />
                              {selectedLanguage === 'us' ? 'EN' : 'ES'}
                            </button>
                            <div
                              className='text-white dropdown-menu lgDrp'
                              aria-labelledby='languageDropdown'
                            >
                              <a
                                className={`dropdown-item ${selectedLanguage === 'en' ? 'active' : ''
                                  }`}
                                href='#'
                                onClick={() => handleLanguageChange('us')}
                              >
                                <img
                                  src='https://flagicons.lipis.dev/flags/4x3/us.svg'
                                  alt='US flag'
                                  style={{ marginRight: '8px', width: '24px', height: '16px' }}
                                />
                                English
                              </a>
                              <a
                                className={`dropdown-item ${selectedLanguage === 'es' ? 'active' : ''
                                  }`}
                                href='#'
                                onClick={() => handleLanguageChange('es')}
                              >
                                {/* Use the CDN link for the Spanish flag or another flag as needed */}
                                <img
                                  src='https://flagicons.lipis.dev/flags/4x3/es.svg'
                                  alt='Spanish flag'
                                  style={{ marginRight: '8px', width: '24px', height: '16px' }}
                                />
                                Spanish
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
          <div className='mobileDisplayNoneDesktop'>
            <ResponsiveNavbar />
          </div>
        </div>
      </HeaderWrapperStyles>
    </>
  )
}

const styles = `
  .zipCodeModal {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  }

  .zipCodeModal .modal-content {
    background-color: #fff;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    max-width: 650px;
  }

  .zipCodeModal .closeBtn {
    cursor: pointer;
    position: absolute;
    top: 10px;
    right: 10px;
  }
`
const styleSheet = document.createElement('style')
styleSheet.type = 'text/css'
styleSheet.innerText = styles
document.head.appendChild(styleSheet)