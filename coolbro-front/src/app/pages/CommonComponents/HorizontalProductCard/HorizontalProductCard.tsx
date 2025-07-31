import { FC, useEffect } from 'react'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import { useNavigate } from 'react-router-dom'
import Slider from 'react-slick'
import { HorizontalProductCardStyles } from './HorizontalProductCardStyles'

interface HorizontalProductCardProps {
  products: any
}

const HorizontalProductCard: FC<HorizontalProductCardProps> = ({ products }) => {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4, // Display more slides initially on larger screens
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024, // Adjust this breakpoint as needed for iPad
        settings: {
          slidesToShow: 2, // Display 3 slides on screens below 1024px wide (e.g., iPad)
        },
      },
      {
        breakpoint: 768, // Adjust this breakpoint as needed for mobile
        settings: {
          slidesToShow: 2, // Display 2 slides on screens below 768px wide (e.g., mobile)
        },
      },
      {
        breakpoint: 576, // Adjust this breakpoint as needed for mobile
        settings: {
          slidesToShow: 1, // Display 2 slides on screens below 768px wide (e.g., mobile)
        },
      },
      {
        breakpoint: 320, // Adjust this breakpoint as needed for mobile
        settings: {
          slidesToShow: 1, // Display 2 slides on screens below 768px wide (e.g., mobile)
        },
      },
    ],
  }

  useEffect(() => { }, [products])

  const navigate = useNavigate()

  const navigateToProdList = () => {
    navigate('/product-list')
  }

  return (
    <>
      <HorizontalProductCardStyles>
        <Slider {...sliderSettings}>
          {products.map((product: any, index: number) => (
            <div className='' key={index}>
              <div className='marginPageMYMobile m-3 mt-xxl-6 mt-xl-6 mt-lg-6 mt-md-6'>
                <div className='mobileMarginNone card rounded-top-5 mx-2 cardHeightSame'>
                  {/* Adjust the 'height' value above as needed */}
                  <div className=''>
                    <div className='commonBGMain'>
                      <img
                        className='card-img-top'
                        src={toAbsoluteUrl('/media/vectors/BGCommonLandscapeImage.png')}
                        alt='Card cap'
                      />
                      <div className='commonBGACMain'>
                        <img
                          className='ACImageCommon'
                          src={toAbsoluteUrl(product.Media_url) || product.productImg}
                          alt=''
                        />
                      </div>
                    </div>
                  </div>

                  <div className='p-lg-5 card-body'>
                    <h2 className='card-title viewTitle fs-lg-6 fs-xxl-3 '>{product.Name}</h2>
                    <div
                      className={`d-flex mt-4 align-items-center ${!product.Price ? 'my-13' : ''}`}
                    >
                      <h1 className='fs-lg-5 normal priceTitle mx-2 ms-xxl-0 fs-xxl-2'>
                        {product.Sale_price}
                      </h1>
                      {product.Price && (
                        <h3 className='fs-lg-6 fw-medium viewChildTitle mx-2 text-decoration-line-through fs-xxl-4'>
                          {product.Price}
                        </h3>
                      )}
                    </div>

                    <a
                      className='fs-lg-7 w-100 btn btn-default primaryBtn mt-5 d-flex align-items-center justify-content-center fs-xxl-6'
                      onClick={navigateToProdList}
                    >
                      <img className='img-fluid' src={toAbsoluteUrl('/media/vectors/Buy.png')} />{' '}
                      <div className='ms-2 fw-medium' onClick={navigateToProdList}>
                        Buy Now
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </HorizontalProductCardStyles>
    </>
  )
}

export default HorizontalProductCard
