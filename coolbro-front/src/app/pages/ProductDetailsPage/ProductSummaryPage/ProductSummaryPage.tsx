import { FC, useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductSummaryPageStyles } from './ProductSummaryPageStyles'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import CustomSlides from './CustomSlides'
import Slider from 'react-slick'
import axios from 'axios'
import * as authHelper from '../../../modules/auth/core/AuthHelpers'
import {
  defaultColorConfig,
  quantityConfig,
  defaultFormErrorConfig,
  defaultVariationConfig,
} from '../../../config/sweetAlertConfig'
import { useAuth } from '../../../modules/auth'
import Swal from 'sweetalert2'
import { useDispatch } from 'react-redux'
import { increment } from '../../../../redux/Slices/cartSlice'

interface ProductSummaryPageProps {
  onProductData: (data: any) => void
}

// interface CartData {
//   id?: number; // Make 'id' property optional
//   UserID:number;
//   ProductID:number;
//   VariationID:number;
//   Quantity:number
// }

const ProductSummaryPage: FC<ProductSummaryPageProps> = ({
  onProductData,
}: ProductSummaryPageProps) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  }
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const TOKEN = authHelper.getAuth()
  const { productId } = useParams<{ productId: string }>()
  const [productData, setProductData] = useState<any>({})
  const [variations, setVariations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedVariationId, setVariationId] = useState<string | null>(null)
  const { currentUser } = useAuth()
  useEffect(() => {
    const fetchProducts = () => {
      setLoading(true)
      axios
        .get(`${process.env.REACT_APP_SERVER_URL}/product/product-details/${productId}`)
        .then((res: any) => {
          if (res.data && res.data.data) {
            setLoading(false)
            setProductData(res.data.data)
            const productData = { ...res.data.data };
            if (Array.isArray(productData.Variations) && productData.Variations.length > 0) {
              if (productData.MainMedia) {
                const mainMediaUrl = productData.MainMedia

                // Add MainMedia to the Media_urls of all variations at 0 position
                const updatedVariations = productData.Variations.map((variation: any) => {
                  const newVariation = { ...variation };
                  if (Array.isArray(newVariation.Media_urls)) {
                    newVariation.Media_urls.unshift({
                      ID: 'main_media',
                      Media_url: mainMediaUrl,
                    });
                  }
                  return newVariation;
                });

                setVariations(updatedVariations);
              }

              setSelectedColor(productData.Variations[0].Value)
              setVariationId(productData.Variations[0].ID)
            } else {
              const mainMediaUrl = productData.MainMedia
              const newVariations = [
                {
                  ID: 'main_media',
                  Type: 'Color',
                  Value: 'main_media_color', // You can set a default value
                  Media_urls: [
                    {
                      ID: 'main_media',
                      Media_url: mainMediaUrl,
                    },
                  ],
                },
              ]
              setVariations(newVariations);

              setSelectedColor(newVariations[0].Value)
              // setVariationId(newVariations[0].ID)
            }
            onProductData(productData)
          }
        })
        .catch((err) => {
          console.error(err)
          setLoading(false)
        })
    }

    if (productId) {
      fetchProducts() // Call the API when the component mounts
    }
  }, [])

  const navigateToProdList = () => {
    navigate('/product-list')
  }

  const incrementQuantity = () => {
    setQuantity(quantity + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }
  const handleWriteReviewClick = () => {
    if (currentUser) {
      navigate(`/reviews/product/${productData.ID}`)
    } else {
      navigate('/')
    }
  }

  const onBuyNowClick = () => {
    // Handle form submission
    try {
      setLoading(true)
      if (Array.isArray(productData.Variations) && productData.Variations.length === 0) {
        setLoading(false)
        Swal.fire(defaultVariationConfig)
        return
      }
      if (
        Array.isArray(productData.Variations) &&
        productData.Variations.length > 0 &&
        !selectedVariationId
      ) {
        setLoading(false)
        Swal.fire(defaultColorConfig)
        return
      }

      if (quantity < 1) {
        setLoading(false)
        Swal.fire(quantityConfig)
        return
      }
      const cartData = {
        UserID: currentUser ? Number(currentUser.ID) : 0,
        ProductID: productData.ID,
        VariationID: selectedVariationId,
        Quantity: quantity,
      }
      try {
        setLoading(false)
        axios
          .post(`${process.env.REACT_APP_SERVER_URL}/cart/add_update_cart`, cartData, {
            headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
          })
          .then(async (res) => {
            if (res.status === 200 && res.data.message) {
              navigate(`/user/cart`)
              dispatch(increment())
            } else {
              setLoading(false)
              Swal.fire(defaultFormErrorConfig)

              if (res.status === 400) {
                setLoading(false)
                console.log('Bad Request: ', res.data.error)
              } else if (res.status === 401) {
                setLoading(false)
                console.log('Unauthorized: ', res.data.error)
              } else {
                setLoading(false)
                console.log('Error: ', res.data.error)
              }
            }
          })
          .catch((err) => {
            setLoading(false)
            console.log(err)
            navigate(`/auth`)
          })
      } catch (err) {
        setLoading(false)
        Swal.fire(defaultFormErrorConfig)
      }
    } catch (err) {
      setLoading(false)
      Swal.fire(defaultFormErrorConfig)
    }
  }

  return (
    <ProductSummaryPageStyles>
      <section className=''>
        <div className='row align-items-center position-relative'>
          <div className='col-lg-6 align-items-center'>
            <CustomSlides
              productMedia={
                (variations || []).find((color: any) => color.Value === selectedColor)
                  ?.Media_urls || []
              }
            />
          </div>

          <div className='col-lg-6 zoom'>
            <div className='card-body mobilePaddingNone p-6 pt-0 pe-0 marginPageMYMobile'>
              <h3 className='card-title primaryTextSemiBold'>{productData.Name}</h3>
              <div className='card-text secondaryText '>
                <p className='card-text d-flex align-items-center primaryTextBold my-5'>
                  SKU: {productData.SKU_number}
                </p>
                <div>
                  {productData.totalRating > 0 ? (
                    <>
                      <div className='ratingMainDiv1'>
                        <div className='rateText1'>{productData.averageRating}</div>
                        <div className=''>
                          <i className='fa fa-star ps-2 text-white' aria-hidden='true'></i>
                        </div>
                      </div>
                    </>
                  ) : (
                    <a onClick={handleWriteReviewClick}>
                      <h4 className='reviewLinkHover'> Be the first to review this product</h4>
                    </a>
                  )}
                </div>
              </div>
              <div className='d-flex mt-4 align-items-center my-5'>
                <h1 className='normal primaryTextSemiBold viewTitle pe-3 mb-0'>
                  ₹ {productData.Sale_price}
                </h1>
                <h5 className='mt-2  fw-medium viewChildTitle  text-decoration-line-through '>
                  ₹ {productData.Price}{' '}
                </h5>
              </div>
              <div className='my-5 mt-0'>
                <h3 className='card-title primaryTextBold my-5 mt-0 mb-3'>Key Features</h3>
                <ul className='ps-5'>
                  <li className='textKeyFeature'>
                    {productData.Cooling_capacity} Ton {productData.CategoryName}{' '}
                    {productData.EnergyEfficiencyRatingName} Rating
                  </li>
                  <li className='textKeyFeature'>{productData.Condenser_coil} Condenser</li>
                  <li className='textKeyFeature'>
                    {productData.Warranty_period} Years Comprehensive Warranty
                  </li>
                  <li className='textKeyFeature'>For Voltage up to {productData.Voltage}</li>
                </ul>
              </div>
              <div className='my-5'>
                <div className='row'>
                  <div className='col-lg-12 d-flex'>
                    {Array.isArray(productData.Variations) && productData.Variations.length > 0 && (
                      <div className='dd'>
                        <h3 className='card-title primaryTextBold my-5 mt-0'>Color variants</h3>
                        <div className='innerColorVariant d-flex mt-3'>
                          {productData.Variations.map((color: any, index: any) => (
                            <div
                              key={index}
                              className={`mx-1 p-1 rounded-circle ${
                                index === 0 ? 'ms-0' : ''
                              }`}
                              onClick={() => {
                                setSelectedColor(color.Value)
                                setVariationId(color.ID)
                              }}
                            >
                              <div
                                style={{
                                  backgroundColor: color.Value,
                                }}
                                className='p-2 outerVariant cursor-pointer d-flex  align-items-center justify-content-center'
                              >
                                {selectedColor === color.Value && (
                                  <div className='tickSign'>
                                    {/* You can use an image, SVG, or any other element for the tick sign */}
                                    <i
                                      className={`fa fa-check fs-1 ${
                                        color.Value === 'White' ? 'text-black' : 'text-white'
                                      }`}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div
                      className={`${Array.isArray(productData.Variations) && productData.Variations.length > 0
                        ? 'ms-20'
                        : ''
                        }`}
                    >
                      <h3 className='card-title primaryTextBold my-5 mt-0'>Quantity</h3>
                      <div className='innerColorVariant d-flex mt-3 align-items-center'>
                        <div className='mx-1 ms-0'>
                          <div className='incrementBtn' onClick={decrementQuantity}>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='24'
                              height='24'
                              viewBox='0 0 24 24'
                              fill='none'
                            >
                              <rect x='5' y='12' width='14' height='2' fill='#99A1B7' />
                            </svg>
                          </div>
                        </div>
                        <div className='px-3'>{quantity}</div>
                        <div className='mx-1'>
                          <div className='incrementBtn' onClick={incrementQuantity}>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='24'
                              height='24'
                              viewBox='0 0 24 24'
                              fill='none'
                            >
                              <g clipPath='url(#clip0_762_13207)'>
                                <path
                                  fillRule='evenodd'
                                  clipRule='evenodd'
                                  d='M11 5V11H5V13H11V19H13V13H19V11H13V5H11Z'
                                  fill='#99A1B7'
                                />
                              </g>
                              <defs>
                                <clipPath id='clip0_762_13207'>
                                  <rect width='24' height='24' fill='white' />
                                </clipPath>
                              </defs>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='d-flex mobileFlexColumn'>
                <div className=''>
                  <a className='w-auto ps-xl-12 pe-xl-12 btn btn-default primaryBtn mt-4 d-flex align-items-center justify-content-center'>
                    <img
                      className='img-fluid'
                      src={toAbsoluteUrl('/media/vectors/Buy.png')}
                      alt=''
                    />{' '}
                    <div onClick={() => onBuyNowClick()} className='ms-2 fw-medium'>
                      {loading ? 'Processing...' : ' Buy Now'}
                    </div>
                  </a>
                </div>
                <div className='mobilePaddingNone ps-3'>
                  <a className='w-auto px-8 btn btn-default primaryOutlineBtn  mt-4 d-flex align-items-center justify-content-center'>
                    <img
                      className='img-fluid'
                      src={toAbsoluteUrl('/media/vectors/dial.png')}
                      alt=''
                    />{' '}
                    <div className='ms-2 fw-medium'>Contact Dealers</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-lg-12 mobileFlexColumn d-flex '>
            {(
              (productData.Variations || []).find((color: any) => color.Value === selectedColor)
                ?.Media_urls || []
            ).length > 0 ? (
              <div className='col-lg-2 ipadDisplayNone mobileDisplayNone'>
                {/* <CustomSlides productMedia={(productData.Variations || []).find((color: any) => color.Value === selectedColor)?.Media_urls || []} /> */}
              </div>
            ) : (
              ''
            )}
            {/* <div className='col-lg-10'>
              <div className='card bg-transparent '>
                <div className='card-horizontal mobileFlexColumn '>
                  <div className='img-square-wrapper mobileDisplayNone mobilePaddingNone p-6 pt-0 ps-0'>
                    <div className=''>
                      <div className='commonBGMain'>
                        <img
                          className='mobileImageResponsive '
                          src={toAbsoluteUrl('/media/vectors/BGCommonPortraitImageBig.png')}
                          alt='Card cap'
                        />
                        <div className='commonBGACMain'>
                          <img
                            className='mobileImageResponsive ACImageCommon w-100 h-100'
                            src={toAbsoluteUrl(productData.MainMedia || '/media/vectors/AC1CommonBig.png')}

                            alt=''
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='mobileDisplayNoneDesktop marginPageMYMobile'>
                    <Slider {...settings}>

                      <div>
                        <div className='commonBGMain'>
                          <img
                            className='mobileImageResponsive '
                            src={toAbsoluteUrl('/media/vectors/BGCommonPortraitImageBig.png')}
                            alt='Card cap'
                          />
                          <div className='commonBGACMain'>
                            <img
                              className='mobileImageResponsive ACImageCommon'
                              src={toAbsoluteUrl('/media/vectors/AC1CommonBig.png')}
                              alt=''
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className='commonBGMain'>
                          <img
                            className='mobileImageResponsive '
                            src={toAbsoluteUrl('/media/vectors/BGCommonPortraitImageBig.png')}
                            alt='Card cap'
                          />
                          <div className='commonBGACMain'>
                            <img
                              className='mobileImageResponsive ACImageCommon'
                              src={toAbsoluteUrl('/media/vectors/AC1CommonBig.png')}
                              alt=''
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className='commonBGMain'>
                          <img
                            className='mobileImageResponsive '
                            src={toAbsoluteUrl('/media/vectors/BGCommonPortraitImageBig.png')}
                            alt='Card cap'
                          />
                          <div className='commonBGACMain'>
                            <img
                              className='mobileImageResponsive ACImageCommon'
                              src={toAbsoluteUrl('/media/vectors/AC1CommonBig.png')}
                              alt=''
                            />
                          </div>
                        </div>
                      </div>
                    </Slider>
                  </div>

                  <div className='card-body mobilePaddingNone p-6 pt-0 pe-0 marginPageMYMobile'>
                    <h3 className='card-title primaryTextSemiBold'>
                      {productData.Name}
                    </h3>
                    <div className='card-text secondaryText '>
                      <p className='card-text d-flex align-items-center primaryTextBold my-5'>
                        SKU: {productData.SKU_number}
                      </p>
                      <div>
                        {productData.totalRating > 0 ? (
                          <>
                            <div className='ratingMainDiv1'>
                              <div className='rateText1'>{productData.averageRating}</div>
                              <div className=''>
                                <i className='fa fa-star ps-2 text-white' aria-hidden='true'></i>
                              </div>
                            </div>
                          </>
                        ) : (
                          <a onClick={handleWriteReviewClick}>
                            <h4 className='reviewLinkHover'> Be the first to review this product</h4>
                          </a>
                        )}
                      </div>
                    </div>
                    <div className='d-flex mt-4 align-items-center my-5'>
                      <h1 className='normal primaryTextSemiBold viewTitle pe-3 mb-0'>₹ {productData.Sale_price}</h1>
                      <h5 className='mt-2  fw-medium viewChildTitle  text-decoration-line-through '>
                        ₹ {productData.Price}{' '}
                      </h5>
                    </div>
                    <div className='my-5 mt-0'>
                      <h3 className='card-title primaryTextBold my-5 mt-0 mb-3'>Key Features</h3>
                      <ul className='ps-5'>
                        <li className='textKeyFeature'>{productData.Cooling_capacity} Ton {productData.CategoryName} {productData.EnergyEfficiencyRatingName} Rating</li>
                        <li className='textKeyFeature'>{productData.Condenser_coil} Condenser</li>
                        <li className='textKeyFeature'>
                          {productData.Warranty_period} Years Comprehensive Warranty
                        </li>
                        <li className='textKeyFeature'>For Voltage up to {productData.Voltage}</li>
                      </ul>
                    </div>
                    <div className='my-5'>
                      <div className='row'>
                        <div className='col-lg-12 d-flex'>
                          {Array.isArray(productData.Variations) && productData.Variations.length > 0 && (
                            <div className='dd'>
                              <h3 className='card-title primaryTextBold my-5 mt-0'>Color variants</h3>
                              <div className='innerColorVariant d-flex mt-3'>
                                {productData.Variations.map((color: any, index: any) => (
                                  <div
                                    key={index}
                                    className={`mx-1 ${index === 0 ? 'ms-0' : ''}`}
                                    // style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      setSelectedColor(color.Value);
                                      setVariationId(color.ID);
                                    }}
                                  >
                                    <div
                                      style={{
                                        backgroundColor: color.Value,
                                        border: selectedColor === color.Value ? '2px solid #000' : 'none',
                                      }}
                                      className='outerVariant'
                                    >

                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className={`${Array.isArray(productData.Variations) && productData.Variations.length > 0 ? 'ms-20' : ''}`}>
                            <h3 className='card-title primaryTextBold my-5 mt-0'>Quantity</h3>
                            <div className='innerColorVariant d-flex mt-3 align-items-center'>
                              <div className='mx-1 ms-0'>
                                <div className='incrementBtn' onClick={decrementQuantity}>
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                  >
                                    <rect x='5' y='12' width='14' height='2' fill='#99A1B7' />
                                  </svg>
                                </div>
                              </div>
                              <div className='px-3'>{quantity}</div>
                              <div className='mx-1'>
                                <div className='incrementBtn' onClick={incrementQuantity}>
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                  >
                                    <g clipPath='url(#clip0_762_13207)'>
                                      <path
                                        fillRule='evenodd'
                                        clipRule='evenodd'
                                        d='M11 5V11H5V13H11V19H13V13H19V11H13V5H11Z'
                                        fill='#99A1B7'
                                      />
                                    </g>
                                    <defs>
                                      <clipPath id='clip0_762_13207'>
                                        <rect width='24' height='24' fill='white' />
                                      </clipPath>
                                    </defs>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='d-flex mobileFlexColumn'>
                      <div className=''>
                        <a className='w-auto ps-xl-12 pe-xl-12 btn btn-default primaryBtn mt-4 d-flex align-items-center justify-content-center'>
                          <img
                            className='img-fluid'
                            src={toAbsoluteUrl('/media/vectors/Buy.png')}
                            alt=''
                          />{' '}
                          <div onClick={() => onBuyNowClick()} className='ms-2 fw-medium'>
                            {loading ? 'Processing...' : ' Buy Now'}
                          </div>
                        </a>
                      </div>
                      <div className='mobilePaddingNone ps-3'>
                        <a className='w-auto px-8 btn btn-default primaryOutlineBtn  mt-4 d-flex align-items-center justify-content-center'>
                          <img
                            className='img-fluid'
                            src={toAbsoluteUrl('/media/vectors/dial.png')}
                            alt=''
                          />{' '}
                          <div className='ms-2 fw-medium'>Contact Dealers</div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>
    </ProductSummaryPageStyles>
  )
}

export default ProductSummaryPage
