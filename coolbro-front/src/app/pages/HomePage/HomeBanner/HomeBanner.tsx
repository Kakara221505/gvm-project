import {FC} from 'react'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import Carousel from 'react-bootstrap/Carousel'
import {HomeBannerStyles} from '../HomeBanner/HomeBanner.styles'
import {Link} from 'react-router-dom'

const HomeBanner: FC = () => {
  return (
    <>
      <HomeBannerStyles>
        <Carousel indicators={true} nextIcon={true} prevIcon={true}>
          <Carousel.Item interval={100000000}>
            <div className=''>
              <div className='innerCarouselImage'>
                <img
                  src={toAbsoluteUrl('/media/vectors/HomeBanner.png')}
                  className='mobileWFull w-100 d-block'
                  alt=''
                />
              </div>
              <div className='floatingTextCarousel'>
                <div className='d-flex flex-column  '>
                  <div className='bolderHeadingMain '>Air Conditioners</div>
                  <div className=' d-flex justify-content-lg-center'>
                    <div className='fw-normal bolderHeadingChild'>Fine weather</div>{' '}
                    <div className='ps-3 bolderHeadingChild'>all year round</div>
                  </div>
                  <Link to='/product-list' className='shopRespMediaBtn btn btn-default bg-white col-lg-6 d-block m-auto mt-6 mt-md-3'>
                  <h1 className=' secondary2Text fs-lg-2 mb-0 fs-md-3 shopRespMedia'>Shop Now</h1>

                  </Link>
                </div>
              </div>
            </div>
            <Carousel.Caption></Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item interval={1000}>
            <div className=''>
              <div className='innerCarouselImage'>
                <img
                  src={toAbsoluteUrl('/media/vectors/HomeBanner2.png')}
                  className='mobileWFull w-100 d-block'
                  alt=''
                />
              </div>
              <div className='floatingTextCarousel'>
                <div className='d-none d-flex flex-column  '>
                  <div className='bolderHeadingMain '>Air Conditioners</div>
                  <div className=' d-flex justify-content-lg-center'>
                    <div className='fw-normal bolderHeadingChild'>Fine weather</div>{' '}
                    <div className='ps-3 bolderHeadingChild'>all year round</div>
                  </div>
                  <Link to='/product-list' className='shopRespMediaBtn btn btn-default bg-white col-lg-6 d-block m-auto mt-6 mt-md-3'>
                  <h1 className=' secondary2Text fs-lg-2 mb-0 fs-md-3 shopRespMedia'>Shop Now</h1>

                  </Link>
                </div>
              </div>
            </div>
            <Carousel.Caption></Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item interval={1000}>
            <div className=''>
              <div className='innerCarouselImage'>
                <img
                  src={toAbsoluteUrl('/media/vectors/HomeBanner3.png')}
                  className='mobileWFull w-100 d-block'
                  alt=''
                />
              </div>
              <div className='floatingTextCarousel'>
                <div className='d-none d-flex flex-column  '>
                  <div className='bolderHeadingMain '>Air Conditioners</div>
                  <div className=' d-flex justify-content-lg-center'>
                    <div className='fw-normal bolderHeadingChild'>Fine weather</div>{' '}
                    <div className='ps-3 bolderHeadingChild'>all year round</div>
                  </div>
                  <Link to='/product-list' className='shopRespMediaBtn btn btn-default bg-white col-lg-6 d-block m-auto mt-6 mt-md-3'>
                  <h1 className=' secondary2Text fs-lg-2 mb-0 fs-md-3 shopRespMedia'>Shop Now</h1>

                  </Link>
                </div>
              </div>
            </div>
            <Carousel.Caption></Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item interval={1000}>
            <div className=''>
              <div className='innerCarouselImage'>
                <img
                  src={toAbsoluteUrl('/media/vectors/HomeBanner4.png')}
                  className='mobileWFull w-100 d-block'
                  alt=''
                />
              </div>
              <div className='floatingTextCarousel'>
                <div className='d-none d-flex flex-column  '>
                  <div className='bolderHeadingMain '>Air Conditioners</div>
                  <div className=' d-flex justify-content-lg-center'>
                    <div className='fw-normal bolderHeadingChild'>Fine weather</div>{' '}
                    <div className='ps-3 bolderHeadingChild'>all year round</div>
                  </div>
                  <Link to='/product-list' className='shopRespMediaBtn btn btn-default bg-white col-lg-6 d-block m-auto mt-6 mt-md-3'>
                  <h1 className=' secondary2Text fs-lg-2 mb-0 fs-md-3 shopRespMedia'>Shop Now</h1>

                  </Link>
                </div>
              </div>
            </div>
            <Carousel.Caption></Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </HomeBannerStyles>
    </>
  )
}

export default HomeBanner
