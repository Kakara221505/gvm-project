import {FC} from 'react'
import {DownloadAppPageStyles} from './DownloadAppPageStyles'
import {Link} from 'react-router-dom'
import {toAbsoluteUrl} from '../../../_metronic/helpers'

const DownloadAppPage: FC = () => {
  return (
    <DownloadAppPageStyles>
      <div className='mobilePaddingNew container-fluid px-20'>
        <div className=''>
          <div className=''>
            <div className='row mobileFlexColumn p-15 p-xl-12 downloadAppMainScreen d-flex justify-content-between align-items-center'>
              <div className='col-xxl-6 col-lg-6 col-xl-7 py-10 px-0 d-flex justify-content-center align-items-center'>
                <div className='innerSectionOne d-flex flex-column align-items-center'>
                  <div className='logoInner'>
                    <Link to='/dashboard' className=''>
                      <img
                        alt='Logo'
                        src={toAbsoluteUrl('/media/logos/logo.png')}
                        className='w-25 mobileWFull downloadAppImage d-block m-auto'
                      />
                    </Link>
                  </div>
                  <div className='descriptionInner text-center py-3 pt-12'>
                    <h1 className='text-white uppercaseText fs-2hx'>India’s Most Popular!</h1>
                    <h1 className='text-white uppercaseText fs-2hx'>Shopping App</h1>
                  </div>
                  <div className='featureInner mt-10'>
                    <div className='row mobileFlexColumn marginPageMYMobile d-flex align-items-center'>
                      <div className='w-25 mobileWFull downloadAppImage marginPageMYMobile w-xl-150px'>
                        <div className='card py-4 customAboutCard'>
                          <img
                            height={40}
                            width={40}
                            src={toAbsoluteUrl('/media/vectors/fastDelievery.png')}
                            className='d-block m-auto'
                            alt='Card cap'
                          />
                          <div className='card-body p-2'>
                            <h2 className='card-title primaryTextMediumBold text-center fs-6 mb-0'>
                              Free Delivery
                            </h2>
                            <h5 className='fs-8 card-text text-center mb-0 py-3'>
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa purus
                              gravida.
                            </h5>
                          </div>
                        </div>
                      </div>
                      <div className='w-25 mobileWFull downloadAppImage marginPageMYMobile w-xl-150px'>
                        <div className='card py-4 customAboutCard'>
                          <img
                            height={40}
                            width={40}
                            src={toAbsoluteUrl('/media/vectors/cashback.png')}
                            className='d-block m-auto'
                            alt='Card cap'
                          />
                          <div className='card-body p-2'>
                            <h2 className='card-title primaryTextMediumBold text-center fs-6 mb-0'>
                              100% Cash Back
                            </h2>
                            <h4 className='fs-8 card-text text-center mb-0 py-3'>
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa purus
                              gravida.
                            </h4>
                          </div>
                        </div>
                      </div>
                      <div className='w-25 mobileWFull downloadAppImage marginPageMYMobile w-xl-150px'>
                        <div className='card py-4 customAboutCard'>
                          <img
                            height={40}
                            width={40}
                            src={toAbsoluteUrl('/media/vectors/premium-quality.png')}
                            className='d-block m-auto'
                            alt='Card cap'
                          />
                          <div className='card-body p-2'>
                            <h2 className='card-title primaryTextMediumBold text-center fs-6 mb-0'>
                              Quality Product
                            </h2>
                            <h4 className='fs-8 card-text text-center mb-0 py-3'>
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa purus
                              gravida.
                            </h4>
                          </div>
                        </div>
                      </div>
                      <div className='w-25 mobileWFull downloadAppImage marginPageMYMobile w-xl-150px'>
                        <div className='card py-4 customAboutCard'>
                          <img
                            height={40}
                            width={40}
                            src={toAbsoluteUrl('/media/vectors/24-hours-support.png')}
                            className='d-block m-auto'
                            alt='Card cap'
                          />
                          <div className='card-body p-2'>
                            <h2 className='card-title primaryTextMediumBold text-center fs-6 mb-0'>
                              24/7 Support
                            </h2>
                            <h4 className='fs-8 card-text text-center mb-0 py-3'>
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa purus
                              gravida.
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='downloadInnerBtn my-15 paddingPagePXMobile'>
                    <div className='d-flex justify-content-center'>
                      <button className='btn btn-default mx-2 marginPagePXMobile mobilePaddingNone'>
                        <img
                          alt='Logo'
                          className='mobileWFull img-fluid '
                          src={toAbsoluteUrl('/media/vectors/AppStore.png')}
                        />
                      </button>
                      <button className='btn btn-default mx-2 marginPagePXMobile mobilePaddingNone'>
                        <img
                          alt='Logo'
                          className='mobileWFull img-fluid '
                          src={toAbsoluteUrl('/media/vectors/PlayStore.png')}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-xxl-6 col-lg-6 col-xl-5 py-10'>
                <div className='downloadappImage'>
                  <img
                    alt='Logo'
                    className='img-fluid '
                    src={toAbsoluteUrl('/media/vectors/DownloadAppImage.png')}
                  />
                </div>
                <div className='filterRound'>dd</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DownloadAppPageStyles>
  )
}

export default DownloadAppPage
