import {FC} from 'react'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import Carousel from 'react-bootstrap/Carousel'
import {HomeDealsPageStyles} from '../HomeDealsPage/HomeDealsPageStyles'
import {useNavigate} from 'react-router-dom'

const HomeClimateSolutionPage: FC = () => {
  const navigate = useNavigate()

  const navigateToProdList = () => {
    navigate('/product-list')
  }
  return (
    <>
      <HomeDealsPageStyles>
        <section className='marginPageMYMobile'>
          <div className='innerTextMain mt-xxl-8 mt-xl-8 mt-lg-8 mt-md-8'>
            <div className='excText primaryTextBold fs-xxl-1 fs-xl-1 fs-md-1 responsiveFontLargeHeading'>Deals of the day</div>
            <div onClick={navigateToProdList} className='mobileDisplayNone fs-md-2 fs-lg-2 viewText'>
              View all
            </div>
          </div>
        </section>
        <div className='innerExcGrid mt-xxl-6 mt-xl-6 mt-lg-6 mt-md-6'>
          <div className='row' id='r1'>
            <div className='marginPageMYMobile col-lg-4 mt-xxl-6 mt-xl-6 mt-lg-6 mt-md-6'>
              <div className='card rounded-top-5 text-light border-0 shadow'>
                <img
                  src={toAbsoluteUrl('/media/vectors/Deal1.png')}
                  className='rounded-4 card-img'
                  alt='...'
                />
                <div className='rounded-4 card-img-overlay rounded-4 text-center'>
                  <div className='d-flex flex-column align-items-center marginPageMY mt-4'>
                    <h1 className='fs-lg-3 card-title fw-bold '>
                      Blue Star 1.5 Ton 5 Star Inverter Split AC
                    </h1>
                    <small className='fs-lg-5 text-white fs-3 mt-2'>5 Years Comprehensive Warranty</small>
                    <div className='d-flex mt-4'>
                      <h1 className='fs-lg-2 text-white mx-2'>₹ 43999</h1>
                      <h1 className='fs-lg-2 text-white mx-2 text-decoration-line-through'>₹ 48999</h1>
                    </div>
                  </div>
                  {/* <button className='btn btn-outline-light btn-sm rounded-0 mt-2'>Shop Now</button> */}
                </div>
              </div>
            </div>
            <div className='marginPageMYMobile col-lg-4 mt-xxl-6 mt-xl-6 mt-lg-6 mt-md-6'>
              <div className='card text-light border-0 shadow'>
                <img
                  src={toAbsoluteUrl('/media/vectors/Deal2.png')}
                  className='rounded-4 card-img'
                  alt='...'
                />
                <div className='rounded-4 card-img-overlay rounded-4 text-center'>
                  <div className='d-flex flex-column align-items-center marginPageMY mt-4'>
                    <h1 className='fs-lg-3  card-title fw-bold '>
                      Blue Star 1.5 Ton 5 Star Inverter Split AC
                    </h1>
                    <small className='fs-lg-5 text-white fs-3 mt-2'>5 Years Comprehensive Warranty</small>
                    <div className='d-flex mt-4'>
                      <h1 className='fs-lg-2 text-white mx-2'>₹ 43999</h1>
                      <h1 className='fs-lg-2 text-white mx-2 text-decoration-line-through'>₹ 48999</h1>
                    </div>
                  </div>
                  {/* <button className='btn btn-outline-light btn-sm rounded-0 mt-2'>Shop Now</button> */}
                </div>
              </div>
            </div>
            <div className='marginPageMYMobile col-lg-4 mt-xxl-6 mt-xl-6 mt-lg-6 mt-md-6'>
              <div className='card text-light border-0 shadow'>
                <img
                  src={toAbsoluteUrl('/media/vectors/Deal3.png')}
                  className='rounded-4 card-img'
                  alt='...'
                />
                <div className='rounded-4 card-img-overlay rounded-4 text-center'>
                  <div className='d-flex flex-column align-items-center marginPageMY mt-4'>
                    <h1 className='fs-lg-3 card-title fw-bold '>
                      Blue Star 1.5 Ton 5 Star Inverter Split AC
                    </h1>
                    <small className='fs-lg-5 text-white fs-3 mt-2'>5 Years Comprehensive Warranty</small>
                    <div className='d-flex mt-4'>
                      <h1 className='fs-lg-2 text-white mx-2'>₹ 43999</h1>
                      <h1 className='fs-lg-2 text-white mx-2 text-decoration-line-through'>₹ 48999</h1>
                    </div>
                  </div>
                  {/* <button className='btn btn-outline-light btn-sm rounded-0 mt-2'>Shop Now</button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </HomeDealsPageStyles>
    </>
  )
}

export default HomeClimateSolutionPage
