import { FC, useState, useEffect } from 'react';
import { toAbsoluteUrl } from '../../../../_metronic/helpers';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { HomeBrandPageStyles } from '../HomeBrandPage/HomeBrandPageStyles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 6,
    slidesToSlide: 3, // optional, default to 1.
  },
  desktop2: {
    breakpoint: { max: 1500, min: 1024 },
    items: 4,
    slidesToSlide: 4, // optional, default to 1.
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 2, // optional, default to 1.
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1, // optional, default to 1.
  },
};

const containerStyle = {
  overflow: 'hidden',
};

const customItemStyle = {
  // Adjust this value to your desired spacing
  width: '170px',
  height: '170px',
  boxShadow:'0px 2.82837px 11.31346px 0px rgba(0, 0, 0, 0.14)',
  borderRadius: '50%',
  backgroundColor: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop:5,
  marginBottom:7
};

const HomeBrandPage: FC = () => {
  const navigate = useNavigate();
  const [brandData, setBrandData] = useState<any[]>([]);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/brand/get_brand_with_pagination`)
      .then((res) => {
        setLoading(false);
        setBrandData(res.data.data);
        // console.log(brandData);
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
      });
  }, []);

  const navigateToProdList = () => {
    navigate('/product-list');
  };
  const navigateToProdListBrand = (brandId: string) => {
    navigate(`/product-list?brandId=${brandId}`);
  };

  return (
    <>
      <HomeBrandPageStyles>
        <section className='marginPageMY marginPageMYMobile mt-5'>
          <div className='innerTextMain mobileFlexColumn'>
            <div className='excText primaryTextBold fs-xxl-1 fs-xl-1 fs-md-1 responsiveFontLargeHeading'>
              Pick Your Air Conditioner Brand
            </div>
            <div onClick={navigateToProdList} className='fs-md-2 fs-lg-2 viewText mobileDisplayNone'>
              View all
            </div>
          </div>
        </section>
        <div style={containerStyle} className='innerExcGrid marginPageMY'>
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
              containerClass='carousel-container'
              deviceType={''}
              dotListClass='custom-dot-list-style'
              itemClass='carousel-item-padding-40-px'
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
        </div>
      </HomeBrandPageStyles>
    </>
  );
};

export default HomeBrandPage;
