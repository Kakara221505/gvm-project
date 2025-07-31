import React, { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SimilarProductsPageStyles } from './SimilarProductsPageStyles';
import HorizontalProductCard from '../CommonComponents/HorizontalProductCard/HorizontalProductCard';

const SimilarProductsPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const similarProduct = [
    {
      commonBG: '/media/vectors/BGCommonLandscapeImage.png',
      Media_url: '/media/vectors/AC1Common.png',
      Name: 'Blue Star 1.5 Ton 5 Star Inverter Split AC',
      Sale_price: '₹ 43999',
      Price: '₹ 43999',
    },
    {
      commonBG: '/media/vectors/BGCommonLandscapeImage.png',
      Media_url: '/media/vectors/AC2Common.png',
      Name: 'Another Product',
      Sale_price: '₹ 5999',
      Price: '₹ 6999',
    },
    {
      commonBG: '/media/vectors/BGCommonLandscapeImage.png',
      Media_url: '/media/vectors/AC1Common.png',
      Name: 'Yet Another Product',
      Sale_price: '₹ 2999',
      Price: '₹ 3999',
    },
    {
      commonBG: '/media/vectors/BGCommonLandscapeImage.png',
      Media_url: '/media/vectors/AC1Common.png',
      Name: 'One More Product',
      Sale_price: '₹ 8999',
      Price: '₹ 9999',
    },
    {
      commonBG: '/media/vectors/BGCommonLandscapeImage.png',
      Media_url: '/media/vectors/AC2Common.png',
      Name: 'Final Product',
      Sale_price: '₹ 7499',
      Price: '₹ 7999',
    },
  ]
  const getTitle = () => {
    if (location.pathname === '/dealer-details') {
      return 'Recommended Products';
    } else {
      return 'SIMILAR PRODUCTS';
    }
  };

  const navigateToProdList = () => {
    navigate('/product-list');
  };

  return (
    <>
      <SimilarProductsPageStyles>
        <section className='marginPageMYMobile mt-xxl-8 mt-xl-8 mt-lg-8 mt-md-8'>
          <div className='innerTextMain'>
            <div className='excText primaryTextBold fs-xxl-1 fs-xl-1 fs-md-1 responsiveFontLargeHeading'>
              {getTitle()}
            </div>
            <div
              onClick={navigateToProdList}
              className='mobileDisplayNone fs-md-2 fs-lg-2 viewText'
            >
              View all
            </div>
          </div>
        </section>
        <div className='innerExcGrid mb-10'>
          <div className='row' id='r1'>
          <HorizontalProductCard products={similarProduct}/>
          </div>
        </div>
      </SimilarProductsPageStyles>
    </>
  );
};

export default SimilarProductsPage;
