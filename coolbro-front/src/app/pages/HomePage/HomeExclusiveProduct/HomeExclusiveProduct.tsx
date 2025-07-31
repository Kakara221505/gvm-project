import {FC} from 'react'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import Carousel from 'react-bootstrap/Carousel'
import {HomeExclusiveProductStyles} from '../HomeExclusiveProduct/HomeExclusiveProductStyles'
import {useNavigate} from 'react-router-dom'

const HomeExclusiveProduct: FC = () => {
  const navigate = useNavigate()

  const navigateToProdList = () => {
    navigate('/product-list')
  }
  return (
    <>
      <HomeExclusiveProductStyles>
        <section className='marginPageMYMobile'>
          <div className='innerTextMain'>
            <div className='excText primaryTextBold fs-xxl-1 fs-xl-1 fs-md-1 responsiveFontLargeHeading'>Exclusive Product</div>
            <div onClick={navigateToProdList} className='mobileDisplayNone fs-md-2 fs-lg-2 viewText'>
              View all
            </div>
          </div>
        </section>
        <div className='innerExcGrid '>
          <div className='row' id='r1'>
            <div className='col-lg-4 marginPageMYMobile mt-xxl-12 mt-xl-12 mt-lg-12 mt-md-12'>
              <div className='card  oneCard'>
                <img
                  src={toAbsoluteUrl('/media/vectors/1.png')}
                  className='h-100 rounded-4 img-fluid'
                  alt=''
                />
                <div className='imageCardText m-13'>
                  <h1 className='text-white allNewBtn fs-lg-1 responsiveFontMediumHeading'>All New</h1>
                  <small className='text-white saveBtnText my-3 mb-3 d-block mt-lg-0'>Save up to 30%</small>
                  <h4 className='text-white mt-lg-2'>SHOP NOW</h4>
                </div>
              </div>
            </div>

            <div className='col-lg-8  mt-xxl-6 mt-xl-6 mt-lg-6 mt-md-6'>
              <div className='row' id='r21'>
                <div className='col-lg-6 marginPageMYMobile mt-xxl-6 mt-xl-6 mt-lg-6 mt-md-6'>
                  <div className='card twoCard'>
                    <img
                      src={toAbsoluteUrl('/media/vectors/2.png')}
                      className='rounded-4 img-fluid'
                      alt=''
                    />
                    <div className='imageCardText1 m-13'>
                      <h1 className='text-white allNewBtn fs-lg-1 responsiveFontMediumHeading'>Exclusive Item</h1>
                      <small className='text-white saveBtnText my-3 mb-3 d-block mt-lg-0'>
                        Save up to 30%
                      </small>
                      <h4 className='text-white mt-lg-2'>SHOP NOW</h4>
                    </div>
                  </div>
                </div>
                <div className='col-lg-6 marginPageMYMobile mt-xxl-6 mt-xl-6 mt-lg-6 mt-md-6'>
                  <div className='card twoCard'>
                    <img
                      src={toAbsoluteUrl('/media/vectors/3.png')}
                      className='rounded-4 img-fluid'
                      alt=''
                    />
                    <div className='imageCardText1 m-13'>
                      <h1 className='text-white allNewBtn fs-lg-1 responsiveFontMediumHeading'>Exclusive Item</h1>
                      <small className='text-white saveBtnText my-3 mb-3 d-block mt-lg-0'>
                        Save up to 30%
                      </small>
                      <h4 className='text-white mt-lg-2'>SHOP NOW</h4>
                    </div>
                  </div>
                </div>
              </div>
              <div className='row' id='r22'>
                <div className='col-lg-12 mt-6'>
                  <div className='card oneCard'>
                    <img
                      src={toAbsoluteUrl('/media/vectors/4.png')}
                      className='rounded-4 img-fluid'
                      alt=''
                    />
                    <div className='imageCardText m-13'>
                      <h1 className='text-white allNewBtn fs-lg-1 responsiveFontMediumHeading'>All New</h1>
                      <h4 className='text-white mt-lg-2'>SHOP NOW</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HomeExclusiveProductStyles>
    </>
  )
}

export default HomeExclusiveProduct
