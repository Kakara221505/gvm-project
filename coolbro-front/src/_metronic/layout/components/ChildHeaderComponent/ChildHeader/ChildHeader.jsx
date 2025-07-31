import React, {useState} from 'react'
import {Link, useNavigate, useLocation} from 'react-router-dom'
import {toAbsoluteUrl} from '../../../../helpers'
import './ChildHeader.css'
import axios from 'axios'
import {useGeolocation, useGeolocationUpdater} from '../../../../../context/GeolocationContext'

const DeliveryPopup: React.FC<DeliveryPopupProps> = ({onClose, onApply}) => {
  const [zipCode, setZipCode] = useState('')
  const updateCoordinates = useGeolocationUpdater()

  const handleApply = async () => {
    const zipCodeRegex = /^[1-9][0-9]{5}$/
    if (zipCodeRegex.test(zipCode)) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/common/get_details_from_zipcode`,
          {
            zipCode: zipCode,
          }
        )

        if (response.data.status === 'success') {
          const data = response.data.data
          const city = data.city ? data.city : ''
          updateCoordinates({latitude: data.location.lat, longitude: data.location.lng})
          onApply(city + ' ' + zipCode)
          onClose()
        } else {
          alert('Please enter a valid zipCode.')
        }
      } catch (error) {
        alert('Please enter a valid zipCode.')
      }
    } else {
      alert('Please enter a valid zipCode.')
    }
  }

  return (
    <div id='deliveryPopup' className='zipCodeModal'>
      <div className='modal-content'>
        <div className='modal-header pb-2 justify-content-between'>
          <h2 className='primaryTextMediumBold mb-0 text-center'>Choose your location</h2>
          <div className='text-white btn btn-icon  ms-2' onClick={onClose}>
            <i className='fa fa-close text-black fs-2'></i>
          </div>
        </div>
        <div className='container-fluid px-0 mt-4'>
          <div className='row align-items-center'>
            <div className='col-lg-6'>
              <img
                src={toAbsoluteUrl('/media/vectors/Navigation.png')}
                className='img-fluid w-75 d-block m-auto'
                alt='Logout'
              />{' '}
            </div>
            <div className='col-lg-6'>
              <div className='d-flex my-4 mt-1 align-items-center navbarMarginForSearch'>
                <img
                  src={toAbsoluteUrl('/media/vectors/InfoIcon.png')}
                  className='img-fluid cursor-pointer'
                  alt='Logout'
                />{' '}
                <small className='text-black ps-2'>
                  Enter Zip code to see products availability
                </small>
              </div>
              <div className='fv-row  mb-0  d-block input-group  form-group paddingPagePXMobile'>
                <div className='row'>
                  <div className='col-lg-12'>
                    <div className='form-group '>
                      <input
                        id='zipcode'
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder=''
                        className='form-control bg-transparent shadow-none  customInput'
                        type='text'
                        name='zipcode'
                        autoComplete='off'
                      />
                      <label className='form-label fs-6 fw-bolder ' htmlFor='zipcode'>
                        Zip code
                      </label>
                    </div>
                    <button
                      className='d-block m-auto primaryBtn btn btn-primary px-15'
                      onClick={handleApply}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <div className='fv-row  mb-0  d-block input-group  form-group paddingPagePXMobile'>
        <input
          type="text"
          placeholder="Enter Zip code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
        />
        </div> */}
        </div>
      </div>
    </div>
  )
}

function ChildHeader() {
  const [isPopupOpen, setPopupOpen] = useState(false)

  const handleDeliveryClick = () => {
    setPopupOpen(true)
  }
  const closePopup = () => {
    setPopupOpen(false)
  }
  const applyDelivery = (zipcode: string) => {
    localStorage.setItem('deliveryLocation', zipcode)
    closePopup()
  }

  return (
    <>
      <nav className='navbar navbar-expand-lg p-0 navbar-light  px-6 py-2 customHead'>
        <div className='container-fluid d-block'>
          <div className='d-flex py-2 align-items-center justify-content-between'>
            <div className='d-flex'>
              <span className='navbar-brand invisible ps-0 ms-0 py-5'></span>{' '}
              <button
                className='navbar-toggler d-none'
                type='button'
                data-bs-toggle='collapse'
                data-bs-target='#navbarSupportedContent'
                aria-controls='navbarSupportedContent'
                aria-expanded='false'
                aria-label='Toggle navigation'
              >
                <span className='navbar-toggler-icon'></span>
              </button>
              <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                <ul className='navbar-nav mb-2 mb-lg-0 d-flex justify-content-center align-items-center '>
                  <li className='nav-item dropdown px-5 ps-0 fs-6 fs-xxl-6 fs-xl-6 fs-lg-7 fs-md-8'>
                    <a className='text-white fw-medium  ' href='#'>
                      Home
                    </a>
                  </li>
                  <li className='nav-item dropdown px-5 ps-0 fs-6 fs-xxl-6 fs-xl-6 fs-lg-7 fs-md-8'>
                    <a className='text-white fw-medium  ' href='#'>
                      Split AC
                    </a>
                  </li>
                  <li className='nav-item dropdown px-5 ps-0 fs-6 fs-xxl-6 fs-xl-6 fs-lg-7 fs-md-8'>
                    <a className='text-white fw-medium  ' href='#'>
                      Window AC
                    </a>
                  </li>
                  <li className='nav-item dropdown px-5 ps-0 fs-6 fs-xxl-6 fs-xl-6 fs-lg-7 fs-md-8'>
                    <a className='text-white fw-medium  ' href='#'>
                      Cassette AC
                    </a>
                  </li>
                  <li className='nav-item dropdown px-5 ps-0 fs-6 fs-xxl-6 fs-xl-6 fs-lg-7 fs-md-8'>
                    <a className='text-white fw-medium  ' href='#'>
                      Ductable AC
                    </a>
                  </li>
                  <li className='nav-item dropdown px-5 ps-0 fs-6 fs-xxl-6 fs-xl-6 fs-lg-7 fs-md-8'>
                    <a className='text-white fw-medium  ' href='#'>
                      Portable AC
                    </a>
                  </li>
                  <li className='nav-item dropdown px-5 ps-0 fs-6 fs-xxl-6 fs-xl-6 fs-lg-7 fs-md-8'>
                    <a className='text-white fw-medium  ' href='#'>
                      Others
                    </a>
                  </li>
                  <li className='nav-item dropdown px-5 ps-0 fs-6 fs-xxl-6 fs-xl-6 fs-lg-7 fs-md-8'>
                    <a className='text-white fw-medium  ' href='#'>
                      Upcoming Pre-Requirements
                    </a>
                  </li>
                  {/* <li className='nav-item dropdown px-5 fs-6'>
                <a
                  className='text-white fw-medium nav-link dropdown-toggle d-flex align-items-center'
                  href='#'
                  id='navbarDropdown'
                  role='button'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='me-2'
                    id='Layer_1'
                    data-name='Layer 1'
                    viewBox='0 0 24 24'
                    width='16'
                    height='13'
                    fill='#ffffff'
                  >
                    <path d='M21,0H3C1.346,0,0,1.346,0,3V11H24V3c0-1.654-1.346-3-3-3Zm-1,8H4v-2H20v2ZM5,24c-2.206,0-4-1.794-4-4s1.794-4,4-4v2c-1.103,0-2,.897-2,2s.897,2,2,2,2-.897,2-2v-7h2v7c0,2.206-1.794,4-4,4Zm14,0c-2.206,0-4-1.794-4-4v-7h2v7c0,1.103,.897,2,2,2s2-.897,2-2-.897-2-2-2v-2c2.206,0,4,1.794,4,4s-1.794,4-4,4Zm-6,0h-2V13h2v11Z' />
                  </svg>{' '}
                  Types
                </a>
                <ul className='dropdown-menu' aria-labelledby='navbarDropdown'>
                  <li>
                    <a className='text-black fw-normal dropdown-item' href='#'>
                      Windown AC
                    </a>
                  </li>
                  <li>
                    <a className='text-black fw-normal dropdown-item' href='#'>
                      Portable AC
                    </a>
                  </li>
                  <li>
                    <a className='text-black fw-normal dropdown-item' href='#'>
                      Split AC
                    </a>
                  </li>
                  <li>
                    <a className='text-black fw-normal dropdown-item' href='#'>
                      Stand AC
                    </a>
                  </li>
                </ul>
              </li>
              <li className='nav-item dropdown px-5 fs-6'>
                <a
                  className='text-white fw-medium nav-link d-flex align-items-center'
                  href='#'
                  id='navbarDropdown'
                  role='button'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'
                >
                  <i className='fa fa-users text-white pe-2' /> Dealers
                </a>
        
              </li>
              <li className='nav-item dropdown px-5 fs-6'>
                <a
                  className='text-white fw-medium nav-link  d-flex align-items-center'
                  href='#'
                  id='navbarDropdown'
                  role='button'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'
                >
                  <i className='fa fa-wrench text-white pe-2' /> Service
                </a>
          
              </li>
              <li className='nav-item dropdown px-5 fs-6'>
                <a
                  className='text-white fw-medium nav-link dropdown-toggle d-flex align-items-center'
                  href='#'
                  id='navbarDropdown'
                  role='button'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'
                >
                  <i className='fa fa-tag text-white pe-2' /> Brands
                </a>
                <ul className='dropdown-menu' aria-labelledby='navbarDropdown'>
                  <li>
                    <a className='text-black fw-normal dropdown-item' href='#'>
                      Samsung
                    </a>
                  </li>
                  <li>
                    <a className='text-black fw-normal dropdown-item' href='#'>
                      LG
                    </a>
                  </li>
                  <li>
                    <a className='text-black fw-normal dropdown-item' href='#'>
                      Daikin
                    </a>
                  </li>
                  <li>
                    <a className='text-black fw-normal dropdown-item' href='#'>
                      Daikin
                    </a>
                  </li>
                  <li>
                    <a className='text-black fw-normal dropdown-item' href='#'>
                      Bluestar
                    </a>
                  </li>
                </ul>
              </li> */}

                  {/* <div className="center ">
              <a className='text-white fw-medium glowText fs-6'><i className='fa text-white pe-2 fa-headphones-simple'/>24 x 7 Service</a>
      </div> */}
                </ul>
              </div>
            </div>
            <div className=''>
              <div className=''>
                <div
                  className='d-flex align-items-center justify-content-center'
                  onClick={handleDeliveryClick}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='pe-2'
                    id='Layer_1'
                    data-name='Layer 1'
                    viewBox='0 0 24 24'
                    width='28'
                    height='28'
                  >
                    <path
                      fill='#27AAE1'
                      d='M12,.007A10,10,0,0,0,4.937,17.085L12,23.993l7.071-6.916A10,10,0,0,0,12,.007Zm5.665,15.648L12,21.2,6.343,15.663a8,8,0,1,1,11.322-.008ZM16.018,7.423l-2.5-1.91a2.507,2.507,0,0,0-3.035,0l-2.5,1.91A2.513,2.513,0,0,0,7,9.409V14H17V9.409A2.515,2.515,0,0,0,16.018,7.423ZM15,12H13V10H11v2H9V9.409a.5.5,0,0,1,.2-.4L11.7,7.1a.5.5,0,0,1,.608,0l2.5,1.91a.5.5,0,0,1,.2.4Z'
                    />
                  </svg>

                  <div className='d-flex align-items-center cursor-pointer'>
                    <small className='text-white fs-6 fs-xxl-6 fs-xl-6 fs-lg-7 fs-md-7 fw-medium'>
                      Deliver to {localStorage.getItem('deliveryLocation')}{' '}
                    </small>
                  </div>
                </div>
                {isPopupOpen && <DeliveryPopup onClose={closePopup} onApply={applyDelivery} />}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
export default ChildHeader
