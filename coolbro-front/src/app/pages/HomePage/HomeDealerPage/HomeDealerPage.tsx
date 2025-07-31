import { FC, useState, useEffect } from 'react'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import 'react-multi-carousel/lib/styles.css'
import { HomeDealerBrandPageStyles } from './HomeDealerPageStyles'
import { useNavigate } from 'react-router-dom'
import Slider from 'react-slick'


const HomeDealerBrandPage: FC = () => {
  const navigate = useNavigate()

  var settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: false,
        },
      },      
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  }

  // useEffect(() => {
  //   setLoading(true);
  //   axios
  //     .get(`${process.env.REACT_APP_SERVER_URL}/brand/get_brand_with_pagination`)
  //     .then((res) => {
  //       setLoading(false);
  //       setBrandData(res.data.data);
  //       // console.log(brandData);
  //     })
  //     .catch((error) => {
  //       setLoading(false);
  //       console.error(error);
  //     });
  // }, []);


  const navigateToProdList = () => {
    navigate('/product-list')
  }
  const navigateToProdListBrand = (brandId: string) => {
    navigate(`/product-list?brandId=${brandId}`)
  }

  return (
    <>
      <HomeDealerBrandPageStyles>
        <section className='marginPageMY marginPageMYMobile mt-14'>
          <div className='innerTextMain mobileFlexColumn'>
            <div
              className='excText primaryTextBold fs-xxl-1 fs-xl-1 fs-md-1 responsiveFontLargeHeading' >
              Pick Your Top Dealers
            </div>
            <div
              onClick={navigateToProdList}
              className='fs-md-2 fs-lg-2 viewText mobileDisplayNone'
            >
              View all
            </div>
          </div>
        </section>

        <Slider {...settings} className='d-flex'>
          <div className='d-flex justify-content-center'>
          <div className='card bg-gold  p-6'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <h1 className='text-white'>Climtech</h1>

                <span className='text-white '>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </span>
              </div>
              <div className=''>
                <img
                  className=''
                  height={100}
                  width={100}
                  src={toAbsoluteUrl('/media/vectors/Dealer1.png')}
                  alt=''
                />
              </div>
            </div>
          </div>
          </div>
          <div className='d-flex justify-content-center'>
          <div className='card bg-gold  p-6'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <h1 className='text-white'>Thompson</h1>

                <span className='text-white '>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </span>
              </div>
              <div className=''>
                <img
                  className=''
                  height={100}
                  width={100}
                  src={toAbsoluteUrl('/media/vectors/Dealer2.png')}
                  alt=''
                />
              </div>
            </div>
          </div>
          </div>
          <div className='d-flex justify-content-center'>
          <div className='card bg-gold  p-6'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <h1 className='text-white'>Airco</h1>

                <span className='text-white '>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </span>
              </div>
              <div className=''>
                <img
                  className=''
                  height={100}
                  width={100}
                  src={toAbsoluteUrl('/media/vectors/Dealer3.png')}
                  alt=''
                />
              </div>
            </div>
          </div>
          </div>
          <div className='d-flex justify-content-center'>
          <div className='card bg-gold  p-6'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <h1 className='text-white'>Marcos</h1>

                <span className='text-white '>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </span>
              </div>
              <div className=''>
                <img
                  className=''
                  height={100}
                  width={100}
                  src={toAbsoluteUrl('/media/vectors/Dealer4.png')}
                  alt=''
                />
              </div>
            </div>
          </div>
          </div>
          <div className='d-flex justify-content-center'>
          <div className='card bg-gold  p-6'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <h1 className='text-white'>TechLe</h1>

                <span className='text-white '>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </span>
              </div>
              <div className=''>
                <img
                  className=''
                  height={100}
                  width={100}
                  src={toAbsoluteUrl('/media/vectors/Dealer5.png')}
                  alt=''
                />
              </div>
            </div>
          </div>
          </div>
          <div className='d-flex justify-content-center'>
          <div className='card bg-gold  p-6'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <h1 className='text-white'>Climtech</h1>

                <span className='text-white '>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </span>
              </div>
              <div className=''>
                <img
                  className=''
                  height={100}
                  width={100}
                  src={toAbsoluteUrl('/media/vectors/Dealer1.png')}
                  alt=''
                />
              </div>
            </div>
          </div>
          </div>
          <div className='d-flex justify-content-center'>
          <div className='card bg-gold p-6'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <h1 className='text-white'>Climtech</h1>

                <span className='text-white '>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </span>
              </div>
              <div className=''>
                <img
                  className=''
                  height={100}
                  width={100}
                  src={toAbsoluteUrl('/media/vectors/Dealer1.png')}
                  alt=''
                />
              </div>
            </div>
          </div>
          </div>
          
        </Slider>


        {/* <div style={containerStyle} className='innerExcGrid marginPageMY'>
          <div className='carousel-container'>
            <Carousel
              swipeable={false}
              draggable={false}
              showDots={false}
              responsive={responsive}
              ssr={true}
              infinite={true}
              autoPlay={false}
              autoPlaySpeed={3000}
              keyBoardControl={true}
              customTransition='all .5'
              transitionDuration={500}
              containerclassName='carousel-container'
              deviceType={''}
              dotListclassName='custom-dot-list-style'
              itemclassName='carousel-item-padding-40-px'
            >
              {brandData.map((brand, index) => (
                <div key={index} className='d-flex ' style={customItemStyle}>
                  <div
                    style={{
                      backgroundImage: `url(${brand.Image_url})`,
                      width: '150px',
                      height: '150px',
                      backgroundSize: '110px',
                      backgroundPosition: 'center',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      backgroundRepeat:'no-repeat'
                    }}
                    onClick={() => navigateToProdListBrand(brand.ID)}
                  ></div>
                </div>
              ))}
            </Carousel>
          </div>
        </div> */}
      </HomeDealerBrandPageStyles>
    </>
  )
}

export default HomeDealerBrandPage
