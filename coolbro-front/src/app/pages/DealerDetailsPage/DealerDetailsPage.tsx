/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DealerDetailsPageStyles } from './DealerDetailsPageStyles'
import { toAbsoluteUrl } from '../../../_metronic/helpers'
import PeopleAlsoBoughtPage from '../PeopleAlsoBoughtPage/PeopleAlsoBoughtPage'
import SimilarProductsPage from '../SimilarProductsPage/SimilarProductsPage'
import axios from 'axios'
import { useAuth } from '../../modules/auth'
import DealerImageVideoSection from './DealerImageVideoSection/DealerImageVideoSection'
const sortingOptions = [
  { label: 'Most Recent', value: 'MostRecent' },
  { label: 'Positive First', value: 'PositiveFirst' },
  { label: 'Negative First', value: 'NegativeFirst' },
]

const DealerDetailsPage: FC = () => {
  const navigate = useNavigate()
  const [dealerData, setDealerData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [reviewAllData, setReviewAllData] = useState<any>({})
  const { dealerId } = useParams<{ dealerId: string }>()
  const [reviewData, setReviewData] = useState<any[]>([])
  const [isOpenDiv, onToggle] = useState(true)
  const [selectedSort, setSelectedSort] = useState<{ label: string; value: string }>({
    label: 'SORT BY',
    value: '',
  })
  const [isOpen, setIsOpen] = useState(false)
  const { currentUser } = useAuth()

  const onDealerDetailsPage = () => {
    navigate('/dealer-details')
  }
  const onToggleDiv = () => {
    onToggle(isOpenDiv)
  }
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const renderRatingStars = (rating: any) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <div className={`rating-label ${i <= rating ? 'checked' : ''}`} key={i}>
          <i className={`ki-duotone ki-star ${i <= rating ? 'checked' : ''}`}></i>
        </div>
      )
    }
    return stars
  }
  const handleSortChange = (sortOption: string) => {
    const selectedOption = sortingOptions.find((option) => option.value === sortOption)
    if (selectedOption) {
      setSelectedSort(selectedOption)
      setIsOpen(false)
    }
  }

  const handleWriteReviewClick = () => {
    if (currentUser) {
      navigate(`/reviews/dealer/${dealerData.ID}`)
    } else {
      navigate('/');
    }
  };

  // const handleWriteReviewClick = () => {
  //   if (currentUser) {
  //     navigate(`/reviews/dealer/${dealerId}`)
  //   } else {
  //     navigate('/')
  //   }
  // }
  function formatDate(inputDate: any) {
    const date = new Date(inputDate)
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'long' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }
  useEffect(() => {
    const fetchDealers = () => {
      setLoading(true)
      axios
        .get(`${process.env.REACT_APP_SERVER_URL}/dealer/dealer-details/${dealerId}`)
        .then((res: any) => {
          setLoading(false)
          if (res.data && res.data.data) {
            setDealerData(res.data.data)
          }
        })
        .catch((err) => {
          setLoading(false)
          console.error(err)
        })
    }
    if (dealerId) {
      fetchDealers()
    }
    if (dealerId) {
      fetchReviewData()
    }
  }, [dealerId, selectedSort])

  const fetchReviewData = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/rating/get_rating`, {
        Rated_item_type: 'dealer',
        Rated_item_id: dealerId,
        Sort_by: selectedSort.value,
      })
      if (response.data.status === 'success') {
        setLoading(false)
        setReviewAllData(response.data.data)
        setReviewData(response.data.data.ReviewDetails)
      }
    } catch (error) {
      setLoading(false)
      console.error(error)
    }
  }

  const establishmentDate = new Date(dealerData.Year_of_establishment)
  const formattedEstablishmentDate = establishmentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <DealerDetailsPageStyles>
      <div className='mobilePaddingNew container-fluid px-20'>
        <section className=''>
          <div className=''>
            <div className=''>
              <div className='row my-8 '>
                <div className='col-lg-6 px-3 ps-0 mobilePaddingNone'>
                  <div className='card bg-white h-100' >
                    <div className='card-horizontal dealerDetailsFlexCol'>
                      <div className='img-square-wrapper p-6'>
                        <div className=''>
                          <div className='rateImageDiv ratingBorder'>
                            {dealerData.MainMedia ? (
                              <img
                                className='dealerDetailImg mobileImageResponsive mobileImageResponsiveMax'
                                src={dealerData.MainMedia}
                                alt='Card cap'
                              />
                            ) : (
                              <img
                                height={170}
                                width={170}
                                src={toAbsoluteUrl('/media/vectors/NoProductImage.png')}
                                alt='Card cap'
                              />
                            )}
                            {dealerData.totalRating > 0 && dealerData.totalReview > 0 ? (
                              <>
                                <div className='ratingMainDiv'>
                                  <div className='rateText'>{dealerData.averageRating || '-'}</div>
                                  <div className=''>
                                    <i
                                      className='fa fa-star ps-2 text-white'
                                      aria-hidden='true'
                                    ></i>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div>
                                <h4>-</h4>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='card-body p-xxl-6 p-xl-6  pe-10 d-flex flex-column justify-content-center'>
                        <h2 className='card-title primaryTextBold dealerDetailsFont'>
                          {dealerData.Company_name || '-'}
                        </h2>

                        <div className='d-flex align-items-center'>
                          <div className='my-2'>
                            <img
                              className='img-fluid'
                              src={toAbsoluteUrl('/media/vectors/typcn_location.png')}
                              alt=''
                            />
                          </div>
                          <h5 className='secondaryText mb-0 ps-2'>{dealerData.City || '-'}</h5>
                        </div>

                        <div className='mt-4'>
                          <div className='d-flex'>
                            <a className='w-auto  btn btn-default primaryBtn d-flex align-items-center justify-content-center'>
                              <i className='fa fa-phone text-white' />
                              <div className='ms-2 fw-medium fontCall'>Call Us</div>
                            </a>
                            <a className='w-auto ms-2  btn btn-default primaryBtn d-flex align-items-center justify-content-center'>
                              <i className='fa fa-envelope text-white' />
                              <div className='ms-2 fw-medium fontCall'>Mail Us</div>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-lg-6 px-3 marginPageMYMobile mobilePaddingNone'>
                  <div className='card bg-white h-100' >
                    <div className='card-horizontal align-items-center'>
                      <div className='img-square-wrapper '></div>
                      <div className='card-body p-6 pe-10 d-flex flex-column justify-content-center'>
                        <h2 className='textAlignCenterMobile card-title primaryTextBold'>
                          Contact Details
                        </h2>

                        <div className='addressDetailsMainResp  navbarMarginForSearch '>
                          <div className='d-flex align-items-center'>
                            <div className='my-2'>
                              <img
                                height={30}
                                width={30}
                                className=''
                                src={toAbsoluteUrl('/media/vectors/nameIconCustom.png')}
                                alt=''
                              />
                            </div>
                            <h4 className='text-black mb-0 ps-2 fw-normal fontCall '>
                              {dealerData.Contact_name || '-'}
                            </h4>
                          </div>
                          <div className='d-flex mobilePaddingNone ps-8 align-items-center'>
                            <div className='my-2 mobilePaddingNone'>
                              <img
                                height={30}
                                width={30}
                                className=''
                                src={toAbsoluteUrl('/media/vectors/mailIconCustom.png')}
                                alt=''
                              />
                            </div>
                            <h4 className='text-black mb-0 ps-2 fw-normal fontCall'>
                              {dealerData.Contact_email || '-'}
                            </h4>
                          </div>
                        </div>

                        <div className='d-flex align-items-center '>
                          <div className=''>
                            <img
                              height={30}
                              width={30}
                              src={toAbsoluteUrl('/media/vectors/dialIconCustom.png')}
                              alt=''
                            />
                          </div>
                          <h4 className='text-black mb-0 ps-2 fw-normal fontCall'>
                            {' '}
                            +{dealerData.Contact_phone || '-'}
                          </h4>
                        </div>

                        <div className='d-flex align-items-baseline addressResp'>
                          <div className='my-2'>
                            <img
                              className=''
                              height={30}
                              width={30}
                              src={toAbsoluteUrl('/media/vectors/pinIconCustom.png')}
                              alt=''
                            />
                          </div>
                          <h4 className='text-black mb-0 ps-2 fw-normal fontCall'>
                            {dealerData.Address || '-'}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='compnyDe'>
                <h1 className='primaryTextBold my-5'>COMPANY DETAILS</h1>
                <h4 className='fw-normal justifyText'>{dealerData.Description || '-'}</h4>
              </div>
              <div className='tickerIconMain mt-2'>
                <div className='container-fluid '>
                  <div className='row'>
                    <div className='col-md-3 my-4'>
                      <div className='mainInnerTickerMain'>
                        <div className='d-flex align-items-center'>
                          <img
                            className=''
                            src={toAbsoluteUrl('/media/vectors/Buisness.png')}
                            alt='Card cap'
                          />
                          <div className='d-flex flex-column ps-4'>
                            <small className='secondary3Text fs-6'>Business Type</small>
                            <small className='text-black fw-medium fs-7'>
                              {' '}
                              {dealerData.BusinessType || '-'}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='col-md-3 my-4'>
                      <div className='mainInnerTickerMain'>
                        <div className='d-flex align-items-center'>
                          <img
                            className=''
                            src={toAbsoluteUrl('/media/vectors/Employee.png')}
                            alt='Card cap'
                          />
                          <div className='d-flex flex-column ps-4'>
                            <small className='secondary3Text fs-6'>Number of Employees</small>
                            <small className='text-black fw-medium fs-7'>
                              {' '}
                              {dealerData.NumberOfEmployees || '-'}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='col-md-3 my-4'>
                      <div className='mainInnerTickerMain'>
                        <div className='d-flex align-items-center'>
                          <img
                            className=''
                            src={toAbsoluteUrl('/media/vectors/Establishment.png')}
                            alt='Card cap'
                          />
                          <div className='d-flex flex-column ps-4'>
                            <small className='secondary3Text fs-6'>Year of Establishment</small>
                            <small className='text-black fw-medium fs-7'>
                              {' '}
                              {formattedEstablishmentDate || '-'}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-md-3 my-4'>
                      <div className='mainInnerTickerMain'>
                        <div className='d-flex align-items-center'>
                          <img
                            className=''
                            src={toAbsoluteUrl('/media/vectors/Legal.png')}
                            alt='Card cap'
                          />
                          <div className='d-flex flex-column ps-4'>
                            <small className='secondary3Text fs-6'>Legal Status of Firm</small>
                            <small className='text-black fw-medium fs-7'>
                              {dealerData.LegalStatus || '-'}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row'>
                    <div className='col-md-3 my-4'>
                      <div className='mainInnerTickerMain'>
                        <div className='d-flex align-items-center'>
                          <img
                            className=''
                            src={toAbsoluteUrl('/media/vectors/GST.png')}
                            alt='Card cap'
                          />
                          <div className='d-flex flex-column ps-4'>
                            <small className='secondary3Text fs-6'>GST Number</small>
                            <small className='text-black fw-medium fs-7'>
                              {dealerData.GstNumber || '-'}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='col-md-3 my-4'>
                      <div className='mainInnerTickerMain'>
                        <div className='d-flex align-items-center'>
                          <img
                            className=''
                            src={toAbsoluteUrl('/media/vectors/UPI.png')}
                            alt='Card cap'
                          />
                          <div className='d-flex flex-column ps-4'>
                            <small className='secondary3Text fs-6'>UPI ID</small>
                            <small className='text-black fw-medium fs-7'>
                              {dealerData.UPI_id || '-'}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-md-3 my-4'>
                      <div className='mainInnerTickerMain'>
                        <div className='d-flex align-items-center'>
                          <img
                            className=''
                            src={toAbsoluteUrl('/media/vectors/QRCode.png')}
                            alt='Card cap'
                          />
                          <div className='d-flex flex-column ps-4'>
                            <small className='text-black fw-medium fs-7 text-decoration-underline'>
                              Get QR Code
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {reviewAllData.TotalRating > 0 || reviewAllData.TotalReview > 0 ? (
              <div className='accordion my-5' id='accordionExample3'>
                <div className='accordion-item'>
                  <h2 className='accordion-header' id='headingThree'>
                    <button
                      className='accBtn1 accordion-button collapsed'
                      type='button'
                      onClick={onToggleDiv}
                      data-bs-toggle='collapse'
                      data-bs-target='#collapseThree'
                      aria-expanded='false'
                      aria-controls='collapseThree'
                    >
                      Reviews
                    </button>
                  </h2>
                  <div
                    id='collapseThree'
                    className={`accordion-collapse collapse ${isOpenDiv ? 'show' : ''}`}
                    aria-labelledby='headingThree'
                    data-bs-parent='#accordionExample3'
                  >
                    <div className='accordion-body bodyAcc'>
                      <div className='border-bottom border-gray-200 pb-5 border-2'>
                        <div className='d-flex '>
                          <div className='d-flex flex-column'>
                            <h1 className='bigRateText'>{reviewAllData.AverageRating}</h1>
                            <small className='ratingReviewText'>
                              {reviewAllData.TotalReview} reviews <br />
                              {reviewAllData.TotalRating} ratings
                            </small>
                          </div>
                          <div className='ratingDiv ps-4'>
                            {reviewAllData &&
                              reviewAllData.StarredCount &&
                              [5, 4, 3, 2, 1].map((rating, index) => (
                                <div className='mainRating d-flex align-items-center' key={index}>
                                  <div>
                                    <div className='rating'>{renderRatingStars(rating)}</div>
                                  </div>
                                  <div className='mx-2'>
                                    <div className={`ratingProcessBar${rating}`}></div>
                                  </div>
                                  <div className='fs-5 text-body-tertiary'>
                                    {reviewAllData.StarredCount[rating]}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                        <div className='mt-10'>
                          <h2 className='text-black fw-medium my-3'>Review this product</h2>
                          <h4 className='text-black fw-normal my-3'>
                            Help other customers make their decision
                          </h4>
                          <div className=''>
                            <a
                              className='mx-0 px-8 btn btn-default primaryOutlineBtn  mt-8 '
                              onClick={handleWriteReviewClick}
                            >
                              <div className='ms-2 fw-medium'>Write a review</div>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className='innerSecondDiv'>
                        <div className='d-flex justify-content-between align-items-center py-8'>
                          <div className=''>
                            <h2>Customer Reviews:</h2>
                          </div>
                          <div className='btn-group'>
                            <button
                              type='button'
                              className={`primaryOutlineBtn fs-7 justify-content-between btn btn-default btn-active-light-primary btn-flex  btn-center btn-sm ${isOpen ? 'open' : ''
                                }`}
                              onClick={toggleDropdown}
                              aria-expanded={isOpen ? 'true' : 'false'}
                            >
                              {selectedSort.label}
                              <i
                                className={`ki-duotone ki-down primaryTextMediumBold fs-5 ms-1 mt-1 ${isOpen ? 'open' : ''
                                  }`}
                              ></i>
                            </button>
                            <div
                              className={`dropdown-menu menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600  menu-state-bg-light-primary fw-semibold fs-7  py-4 ${isOpen ? 'show' : ''
                                }`}
                            >
                              {sortingOptions.map((option) => (
                                <div
                                  key={option.value}
                                  className={`dropdown-item menu-item ${selectedSort.value === option.value ? 'active' : ''
                                    }`}
                                  onClick={() => handleSortChange(option.value)}
                                >
                                  <div className='primaryTextMediumBold menu-link '>
                                    {option.label}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          {reviewData.map((review, index) => (
                            <div className='mainReviewDiv' key={index}>
                              <div className='d-flex '>
                                <div className='d-flex'>
                                  <img
                                    src={
                                      review.UserMainImage || '/media/vectors/defaultAvatar.png'
                                    }
                                    className='rounded-circle'
                                    height={50}
                                    width={50}
                                    alt='User Avatar'
                                  />
                                  <div className='d-flex flex-column ps-3'>
                                    <h5>{review.Name || 'Anonymous'}</h5>
                                    <div className=''>
                                      <img
                                        src={toAbsoluteUrl('/media/vectors/clock.png')}
                                        className=''
                                        alt='Clock Icon'
                                      />
                                      <small className='ps-1'>
                                        {formatDate(review.Created_at)}
                                      </small>
                                    </div>
                                    <div className=''>
                                      <div className='rating'>
                                        {renderRatingStars(parseInt(review.Rating))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className=''>
                                <h4 className='fw-medium  my-4'>{review.Review}</h4>
                              </div>
                              <div className='d-flex mb-4'>
                                {review.MediaUrl.map((media: any, mediaIndex: any) => (
                                  <img
                                    key={mediaIndex}
                                    src={media.URL || '/media/vectors/NoProductImage.png'}
                                    width={60}
                                    height={60}
                                    className='card-img1 me-2  ps-0 border'
                                    alt={`Review ${mediaIndex + 1}`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className=''>
                <div className='headeretext'>
                  <h1 className='primaryTextBold my-5'>REVIEWS</h1>
                </div>
                <div className='my-2'>
                  <div className='rating'>
                    <input
                      className='rating-input'
                      name='rating'
                      value='0'
                      checked
                      type='radio'
                      id='kt_rating_input_0'
                    />

                    <label className='rating-label' htmlFor='kt_rating_input_1'>
                      <i className='ki-duotone ki-star fs-1'></i>
                    </label>
                    <input
                      className='rating-input'
                      name='rating'
                      value='1'
                      type='radio'
                      id='kt_rating_input_1'
                    />

                    <label className='rating-label' htmlFor='kt_rating_input_2'>
                      <i className='ki-duotone ki-star fs-1'></i>
                    </label>
                    <input
                      className='rating-input'
                      name='rating'
                      value='2'
                      type='radio'
                      id='kt_rating_input_2'
                    />

                    <label className='rating-label' htmlFor='kt_rating_input_3'>
                      <i className='ki-duotone ki-star fs-1'></i>
                    </label>
                    <input
                      className='rating-input'
                      name='rating'
                      value='3'
                      type='radio'
                      id='kt_rating_input_3'
                    />

                    <label className='rating-label' htmlFor='kt_rating_input_4'>
                      <i className='ki-duotone ki-star fs-1'></i>
                    </label>
                    <input
                      className='rating-input'
                      name='rating'
                      value='4'
                      type='radio'
                      id='kt_rating_input_4'
                    />

                    <label className='rating-label' htmlFor='kt_rating_input_5'>
                      <i className='ki-duotone ki-star fs-1'></i>
                    </label>
                    <input
                      className='rating-input'
                      name='rating'
                      value='5'
                      type='radio'
                      id='kt_rating_input_5'
                    />
                  </div>
                </div>
                <div className=''>
                  <a className='text-decoration-underline text-gray fs-5 cursor-pointer' onClick={handleWriteReviewClick}>Be the first to review this product</a>
                </div>
              </div>
            )}
            <div className='row'>
              <div className='prodMain'>
                <DealerImageVideoSection/>
                <SimilarProductsPage />
                <PeopleAlsoBoughtPage />
              </div>
            </div>
          </div>
        </section>
      </div>
    </DealerDetailsPageStyles>
  )
}

export default DealerDetailsPage
function useDisclosure(): { isOpen: any; onToggle: any } {
  throw new Error('Function not implemented.')
}
