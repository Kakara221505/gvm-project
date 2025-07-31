/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC } from 'react'
import Slider from "react-slick";
import { DealerImageVideoSectionStylesStyles } from './DealerImageVideoSectionStyles';
import { toAbsoluteUrl } from '../../../../_metronic/helpers';

const productMedia = [
    {
    id: 1,
      Media_url:toAbsoluteUrl('/media/vectors/DefaultImageProd1.png'),
      alt: 'Image 1',
    },
    {
        id: 2,
      Media_url: toAbsoluteUrl('/media/vectors/DefaultImageProd2.png'),
      alt: 'Image 2',
    },
    {
        id: 3,
          Media_url:toAbsoluteUrl('/media/vectors/DefaultImageProd1.png'),
          alt: 'Image 1',
        },
        {
            id: 4,
          Media_url: toAbsoluteUrl('/media/vectors/DefaultImageProd2.png'),
          alt: 'Image 2',
        },
        {
            id: 5,
              Media_url:toAbsoluteUrl('/media/vectors/DefaultImageProd1.png'),
              alt: 'Image 1',
            },
            {
                id: 6,
              Media_url: toAbsoluteUrl('/media/vectors/DefaultImageProd2.png'),
              alt: 'Image 2',
            },
    // Add more image objects as needed
  ];

const DealerImageVideoSection: FC = () => { 
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
              slidesToShow: 3, // Display 3 slides on screens below 1024px wide (e.g., iPad)
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
    return(
        <>
        <DealerImageVideoSectionStylesStyles>
        <div className='excText my-4 primaryTextBold fs-xxl-1 fs-xl-1 fs-md-1 responsiveFontLargeHeading'>
              Images And Video
            </div>
        <Slider {...sliderSettings}>
          {productMedia.map((image) => (
            <div key={image.id} className='d-flex justify-content-center'>
              <img
                src={image.Media_url}
                alt={`Image ${image.id}`}
                className='img-fluid borderStylesDelaer'
              />
            </div>
          ))}
        </Slider>
        </DealerImageVideoSectionStylesStyles>

        </>
    )
}

export default DealerImageVideoSection