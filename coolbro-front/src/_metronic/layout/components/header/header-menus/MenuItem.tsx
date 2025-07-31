import {FC} from 'react'
import {useLocation} from 'react-router'
import {Link} from 'react-router-dom'
import clsx from 'clsx'
import {checkIsActive, KTIcon, toAbsoluteUrl} from '../../../../helpers'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasArrow?: boolean
  hasBullet?: boolean
}

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
const MenuItem: FC<Props> = ({to, title, icon, fontIcon, hasArrow = false, hasBullet = false}) => {
  const {pathname} = useLocation()

  return (
    <div className='menu-item me-lg-1'>
      <div className='d-flex align-items-center'>
        <div>
          <Link to='/' className=''>
            <img alt='Logo' src={toAbsoluteUrl('/media/logos/logo.png')} className='h-30px' />
          </Link>
        </div>
        <div>
          <div className='row ms-5  d-flex'>
            <div className='input-group'>
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
                      fillRule='evenodd'
                      clipRule='evenodd'
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
                  className='customSearchInp form-control border-0 ms-1 py-5'
                  placeholder='Search'
                  aria-label='Text input with dropdown button'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export {MenuItem}
