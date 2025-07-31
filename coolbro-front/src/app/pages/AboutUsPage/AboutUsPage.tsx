 import {useState} from 'react'
import {FC} from 'react'
import {useNavigate} from 'react-router-dom'
import {toAbsoluteUrl} from '../../../_metronic/helpers'
import {AboutUsPageStyles} from './AboutUsPageStyles'

const AboutUsPage: FC = () => {
  const navigate = useNavigate()

  const navigateContactUs = () => {
    navigate('contact-us')
  }
  return (
    <>
      <AboutUsPageStyles>
        <div className='mobilePaddingNew container-fluid px-20'>
          <div className=''>
            <div className=''>
              <div className='row marginPageMYMobile d-flex align-items-center my-16'>
                <div className='col-lg-6'>
                  <img
                    className='img-fluid mobileImageResponsive'
                    src={toAbsoluteUrl('/media/vectors/AboutUsVector.png')}
                    alt='Card cap'
                  />
                </div>
                <div className='col-lg-6'>
                  <div className='innerAboutUsText'>
                    <h1 className=' responsiveFontLargeHeading marginPageMYMobile lh-sm aboutUsBigText primaryTextMediumBold'>
                      Know About Our Ecomerce Business, History
                    </h1>
                    <p className='aboutUsP text-justify marginPagePXMobile py-8'>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mattis neque ultrices
                      mattis aliquam, malesuada diam est. Malesuada sem tristique amet erat vitae
                      eget dolor lobortis. Accumsan faucibus vitae lobortis quis bibendum quam.
                    </p>
                    <button className='primaryBtn btn btn-default marginPageMYMobile' onClick={navigateContactUs}>Contact Us</button>
                  </div>
                </div>
              </div>
              <div className='row marginPageMYMobile d-flex align-items-center my-16'>
                <h1 className='text-center aboutUsBigText primaryTextMediumBold mb-10'>
                  Our Features
                </h1>
                <div className='col-lg-3 marginPageMYMobile'>
                  <div className='card py-8 pb-0 customAboutCard'>
                    <img
                      height={70}
                      width={70}
                      src={toAbsoluteUrl('/media/vectors/free-delivery.png')}
                      className='d-block m-auto'
                      alt='Card cap'
                    />
                    <div className='card-body'>
                      <h2 className='card-title primaryTextMediumBold text-center'>
                        Free Delivery
                      </h2>
                      <h4 className='card-text text-center mb-0 py-5'>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa purus
                        gravida.
                      </h4>
                    </div>
                  </div>
                </div>
                <div className='col-lg-3 marginPageMYMobile'>
                  <div className='card py-8 pb-0 customAboutCard'>
                    <img
                      height={70}
                      width={70}
                      src={toAbsoluteUrl('/media/vectors/cashback.png')}
                      className='d-block m-auto'
                      alt='Card cap'
                    />
                    <div className='card-body'>
                      <h2 className='card-title primaryTextMediumBold text-center'>
                        100% Cash Back
                      </h2>
                      <h4 className='card-text text-center mb-0 py-5'>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa purus
                        gravida.
                      </h4>
                    </div>
                  </div>
                </div>
                <div className='col-lg-3 marginPageMYMobile'>
                  <div className='card py-8 pb-0 customAboutCard'>
                    <img
                      height={70}
                      width={70}
                      src={toAbsoluteUrl('/media/vectors/premium-quality.png')}
                      className='d-block m-auto'
                      alt='Card cap'
                    />
                    <div className='card-body'>
                      <h2 className='card-title primaryTextMediumBold text-center'>
                        Quality Product
                      </h2>
                      <h4 className='card-text text-center mb-0 py-5'>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa purus
                        gravida.
                      </h4>
                    </div>
                  </div>
                </div>
                <div className='col-lg-3 marginPageMYMobile'>
                  <div className='card py-8 pb-0 customAboutCard'>
                    <img
                      height={70}
                      width={70}
                      src={toAbsoluteUrl('/media/vectors/24-hours-support.png')}
                      className='d-block m-auto'
                      alt='Card cap'
                    />
                    <div className='card-body'>
                      <h2 className='card-title primaryTextMediumBold text-center'>24/7 Support</h2>
                      <h4 className='card-text text-center mb-0 py-5'>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa purus
                        gravida.
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AboutUsPageStyles>
    </>
  )
}

export default AboutUsPage
