import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import { HorizontalDealerCardStyles } from './HorizontalDealerCardStyles'

interface Dealers {
  dealerImg: string
  dealerRating: string
  dealerTitle: string
  dealerDescription: string
  dealerAddress: string
}

interface HorizontalDealerCardProps {
  dealers: Dealers[]
  loading: boolean
}
const HorizontalDealerCard: FC<HorizontalDealerCardProps> = ({ dealers, loading }) => {
  const navigate = useNavigate()

  const onDealerDetailsPage = (id: any) => {
    navigate('/dealer-details/' + id)
  }
  useEffect(() => { }, [dealers, loading])

  return (
    <>
      <HorizontalDealerCardStyles>
        <div>
          {loading ? (
            <p className='text-white'>Loading...</p>
          ) : (
            <div className='row'>
              {dealers.map((dealer: any, index: number) => (
                <div key={dealer.ID} className='col-md-6 col-lg-6 col-xl-6 col-xxl-6 px-3'>
                  <div className='card bg-white my-10 mt-0 cursor-pointer'>
                    <div className='mobileFlexColumn card-horizontal'>
                      <div className='img-square-wrapper mobilePaddingNone d-flex align-items-center contentCenter p-6'>
                        <div className=''>
                          <div className='rateImageDiv ratingBorder'>
                            <img
                              className='d-block m-auto dealerImg img-fluid'
                              src={toAbsoluteUrl(dealer.Media_url)}
                              // src={toAbsoluteUrl('/media/vectors/Dealer1.png')}
                              alt='Card cap'
                            />
                            <div className='ratingMainDiv'>
                              <div className='rateText'>{dealer.averageRating}</div>
                              <div className=''>
                                <i className='fa fa-star ps-2 text-white' aria-hidden='true'></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='card-body px-1 d-flex dFLexAlignItemsCenterMobile flex-column justify-content-center flex-fill'>
                        <div className='d-flex flex-column dFLexAlignItemsBaselineMobile mobileFlexColumn'>
                        <h2
                          className='card-title primaryTextBold'
                          onClick={() => onDealerDetailsPage(dealer.ID)}
                        >
                          {dealer.Company_name}
                        </h2>

                        <div className='d-flex mt-4 align-items-center  my-2'>
                          <h1 className='normal viewTitle pe-3'>
                            {dealer.Description.length > 50
                              ? `${dealer.Description.slice(0, 50)}...`
                              : dealer.Description}
                          </h1>
                        </div>

                        <div className='d-flex align-items-center'>
                          <div className='my-2'>
                            <img
                              className='img-fluid'
                              src={toAbsoluteUrl('/media/vectors/typcn_location.png')}
                              alt=''
                            />
                          </div>
                          <h5 className='secondaryText mb-0 ps-2'>
                            {dealer.addressDetailsArray && dealer.addressDetailsArray.length > 0
                              ? dealer.addressDetailsArray[0].City
                              : ''}
                          </h5>
                        </div>

                        <div className='d-flex'>
                          <div className=''>
                            <a className='w-175px btn btn-default primaryBtn mt-8 d-flex align-items-center justify-content-center'>
                              <i className='fa fa-phone text-white' />
                              <div className='ms-2 fw-medium'>Call Us</div>
                            </a>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </HorizontalDealerCardStyles>
    </>
  )
}

export default HorizontalDealerCard
