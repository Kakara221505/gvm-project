import React, {useState} from 'react'
import Offcanvas from 'react-bootstrap/Offcanvas'
import {Link, useNavigate} from 'react-router-dom'
import {toAbsoluteUrl} from '../../../../helpers'
import './ResponsiveNavbar.css'
import {useAuth} from '../../../../../app/modules/auth'
import {useSelector} from 'react-redux'
import {selectCartItems} from '../../../../../redux/Slices/cartSlice'

const userAvatarClass = 'symbol-35px symbol-md-40px'

const stylesTransTxt = {
  background: '#F9F9F9',
  borderBottomRightRadius: '8px', // Use camelCased property name
  borderTopRightRadius: '8px', // Use camelCased property name
  borderBottomLeftRadius: '0px', // Use camelCased property name
  borderTopLeftRadius: '0px', // Use camelCased property name
  outline: 'none', // Remove the outline when in focus
}
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
export default function ResponsiveNavbar() {
  const [show, setShow] = useState(false)
  const {currentUser, logout} = useAuth()
  const navigate = useNavigate()
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const totalItems = useSelector(selectCartItems)
  const [selectedLanguage, setSelectedLanguage] = useState('us')
  const [isDropdownOpen, setDropdownOpen] = useState(false)

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
  const onClickMyCart = () => {
    navigate('/cart')
  }

  const onClickLogout = () => {
    navigate('/auth')
  }

  const navigateToMyProfile = () => {
    navigate('/user/my-profile')
  }
  const onClickDownloadApp = () => {
    navigate('/download-app')
  }

  const handleLanguageChange = (lang: any) => {
    setSelectedLanguage(lang)
    // Add logic to handle language change, such as updating the language in the state or triggering language-related actions.
  }

  return (
    <>
      <div>
        <div className='row justify-content-center'>
          <div className='px-0 py-2 d-flex justify-content-between'>
            <div className='d-flex align-items-center'>
              <div className='d-flex align-items-center' onClick={handleShow}>
                <div className='hamburger-container ms-0'>
                  <ul className='hamburger ps-0'>
                    <li className='list-style-none'></li>
                    <li className='list-style-none'></li>
                    <li className='list-style-none'></li>
                  </ul>
                </div>
              </div>
              <Link to='/dashboard' className=''>
                <img alt='Logo' src={toAbsoluteUrl('/media/logos/logo.png')} className='h-30px' />
              </Link>
            </div>
            <div className='d-flex justify-content-end align-items-center'>
              <div className='col-lg-3 d-flex justify-content-end'>
                <div className='d-flex align-items-center justify-content-end gap-3 gap-lg-5 gap-xl-5 gap-xxl-8 float-end pe-4'>
                  <div>
                    <div className='d-flex ' onMouseEnter={handleHover} onMouseLeave={handleLeave}>
                      <div className='dropdown  text-white'>
                        <button
                          style={dropdownButtonStyle}
                          className='py-1 px-1 d-flex bg-transparent text-white justify-content-evenly align-items-center btn btn-default dropdown-toggle'
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
                                height={26}
                                width={26}
                                className='rounded-circle'
                                src={toAbsoluteUrl('/media/vectors/UserIconVector.png')}
                                alt=''
                              />
                            </div>
                          </div>
                        </button>
                        <ul
                          className={`dropdown-menu text-white  w-100 ${
                            isDropdownOpen ? 'show' : ''
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
                                  <button onClick={logout} className='dropdown-item cursor-pointer'>
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
                        className='d-flex align-items-center cartImgMain px-1 bg-transparent  btn btn-default'
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
                </div>
              </div>
            </div>
          </div>
          <div className='row mobilePaddingNone'>
            <div className='px-0'>
              <div className='input-group'>
                <button
                  className='btn btn-outline-secondary dropdown-toggle bg-white '
                  type='button'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'
                >
                  Products
                </button>
                <ul className='dropdown-menu'>
                  <li>
                    <Link to='/product-list' className='dropdown-item'>
                      Product
                    </Link>
                  </li>
                  <li>
                    <Link to='/dealer-list' className='dropdown-item'>
                      Dealers
                    </Link>
                  </li>
                </ul>
                <input
                  style={{
                    ...stylesTransTxt,
                  }}
                  type='text'
                  placeholder='Search'
                  className='customSearchInp bg-white form-control border-0 ms-1 py-5'
                  aria-label='Text input with dropdown button'
                />
              </div>
            </div>
          </div>

          {/* <div className='input-group '>
                      <button
                        className='btn btn-outline-secondary dropdown-toggle bg-white me-1'
                        type='button'
                        data-bs-toggle='dropdown'
                        aria-expanded='false'
                      >
                        Products
                      </button>
                      <ul className='dropdown-menu'>
                        <li>
                          <Link to='/product-list' className='dropdown-item'>
                            Product
                          </Link>
                        </li>
                        <li>
                          <Link to='/dealer-list' className='dropdown-item'>
                            Dealers
                          </Link>
                        </li>
                      </ul>
                      <input
                        style={{
                          ...stylesTransTxt,
                        }}
                        type='text'
                        placeholder='Search'
                        className='customSearchInp bg-white form-control border-0 ms-1 py-5'
                        aria-label='Text input with dropdown button'
                      />
                    </div> */}
        </div>
      </div>

      <Offcanvas className='offcanvasDemo' show={show} onHide={handleClose} placement='start'>
        <Offcanvas.Header
          className='headerCanvas px-5 py-5 d-flex justify-content-end'
          closeButton
        ></Offcanvas.Header>
        <div className='px-5 d-flex justify-content-between align-items-center flex-row-reverse headerCanvas'>
          <div className='text-white d-flex ms-auto justify-content-end'>
            <div className='text-white d-flex'>
              <div className='dropdown  text-white'>
                <button
                  className='btn btn-default bg-transparent  text-white dropdown-toggle px-2'
                  type='button'
                  id='languageDropdown'
                  data-bs-toggle='dropdown'
                  aria-haspopup='true'
                  aria-expanded='false'
                >
                  <img
                    src={`https://flagicons.lipis.dev/flags/4x3/${selectedLanguage}.svg`}
                    alt={`${selectedLanguage} flag`}
                    style={{marginRight: '8px', width: '24px', height: '16px'}}
                  />
                  {selectedLanguage === 'us' ? 'EN' : 'ES'}
                </button>
                <div className='text-white dropdown-menu lgDrp' aria-labelledby='languageDropdown'>
                  <a
                    className={`dropdown-item ${selectedLanguage === 'en' ? 'active' : ''}`}
                    href='#'
                    onClick={() => handleLanguageChange('us')}
                  >
                    <img
                      src='https://flagicons.lipis.dev/flags/4x3/us.svg'
                      alt='US flag'
                      style={{marginRight: '8px', width: '24px', height: '16px'}}
                    />
                    English
                  </a>
                  <a
                    className={`dropdown-item ${selectedLanguage === 'es' ? 'active' : ''}`}
                    href='#'
                    onClick={() => handleLanguageChange('es')}
                  >
                    <img
                      src='https://flagicons.lipis.dev/flags/4x3/es.svg'
                      alt='Spanish flag'
                      style={{marginRight: '8px', width: '24px', height: '16px'}}
                    />
                    Spanish
                  </a>
                </div>
              </div>
            </div>
          </div>
          <Offcanvas.Title>
            <div className='text-white d-flex pb-4'>
              <div className={`rounded-circle mt-1 text-white cursor-pointer  ${userAvatarClass}`}>
                <img
                  height={26}
                  width={26}
                  className='rounded-circle'
                  src={toAbsoluteUrl('/media/vectors/UserIconVector.png')}
                  alt=''
                />
              </div>
              <div className='d-flex flex-column ps-2'>
                <h4 className='text-white mb-1'>Welcome</h4>
                <h5 className='text-white'>Rushabh Narekar</h5>
              </div>
            </div>
          </Offcanvas.Title>
        </div>
        <Offcanvas.Body className='p-0'>
          <div className=''>
            <div className='border-bottom border-2 border-gray-300'>
              <h1 className='p-4 mb-0'>Shop By Category</h1>
            </div>
            <div className='p-4'>
              <ul className='list-style-none ps-0'>
                <li className='text-black fs-4 my-4 mt-0'>Window AC</li>
                <li className='text-black fs-4 my-4'>Cassette AC</li>
                <li className='text-black fs-4 my-4'>Ductable AC</li>
                <li className='text-black fs-4 my-4'>Portable AC</li>
                <li className='text-black fs-4 my-4'>Split AC</li>
                <li className='text-black fs-4 my-4'>Others</li>
                <li className='text-black fs-4 my-4'>Upcoming Pre-Requirements</li>
              </ul>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}
