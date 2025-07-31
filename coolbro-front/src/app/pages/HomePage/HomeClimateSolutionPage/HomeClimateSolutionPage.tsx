import {FC} from 'react'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import Carousel from 'react-bootstrap/Carousel'
import {HomeClimateSolutionPageStyles} from '../HomeClimateSolutionPage/HomeClimateSolutionPageStyles'
import {useNavigate} from 'react-router-dom'

const HomeClimateSolutionPage: FC = () => {
  const navigate = useNavigate()

  const navigateToProdList = () => {
    navigate('/product-list')
  }
  return (
    <>
      <HomeClimateSolutionPageStyles>
        <section className='marginPageMYMobile'>
          <div className='innerTextMain mt-xxl-8 mt-xl-8 mt-lg-8 mt-md-8'>
            <div className='excText primaryTextBold fs-xxl-1 fs-xl-1 fs-md-1 responsiveFontLargeHeading'>
              Discover climate solutions for your business
            </div>
            <div
              onClick={navigateToProdList}
              className='mobileDisplayNone fs-md-2 fs-lg-2 viewText'
            >
              View all
            </div>
          </div>
        </section>
        <div className='innerExcGrid mt-xxl-6 mt-xl-6 mt-lg-6 mt-md-6'>
          <div className='row' id='r1'>
            <div className='col-lg-4 climateCard'>
              <img
                src={toAbsoluteUrl('/media/vectors/VRF.png')}
                className='img-fluid rounded-3 w-100'
              />
              <h1 className='primaryTextBold cursor-pointer py-5 '>VRF System</h1>
            </div>
            <div className='col-lg-4 climateCard'>
              <img
                src={toAbsoluteUrl('/media/vectors/cassette.png')}
                className='img-fluid rounded-3 w-100'
              />
              <h1 className='primaryTextBold cursor-pointer py-5 '>Cassette AC </h1>
            </div>
            <div className='col-lg-4 climateCard'>
              <img
                src={toAbsoluteUrl('/media/vectors/Ductable.png')}
                className='img-fluid rounded-3 w-100'
              />
              <h1 className='primaryTextBold cursor-pointer py-5 '>Ductable AC </h1>
            </div>
            <div className='col-lg-4 climateCard'>
              <img
                src={toAbsoluteUrl('/media/vectors/Chiller.png')}
                className='img-fluid rounded-3 w-100'
              />
              <h1 className='primaryTextBold cursor-pointer py-5 '>Chiller</h1>
            </div>
            <div className='col-lg-4 climateCard'>
              <img
                src={toAbsoluteUrl('/media/vectors/Portable.png')}
                className='img-fluid rounded-3 w-100'
              />
              <h1 className='primaryTextBold cursor-pointer py-5 '>Portable AC </h1>
            </div>
            <div className='col-lg-4 climateCard'>
              <img
                src={toAbsoluteUrl('/media/vectors/Package Unit.png')}
                className='img-fluid rounded-3 w-100'
              />
              <h1 className='primaryTextBold cursor-pointer py-5 '>Package Unit</h1>
            </div>
          </div>
        </div>
      </HomeClimateSolutionPageStyles>
    </>
  )
}

export default HomeClimateSolutionPage
