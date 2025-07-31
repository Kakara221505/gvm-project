import { FC } from 'react'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'

import { HomeSizeUpRoomPageStyles } from '../HomeSizeUpRoomPage/HomeSizeUpRoomPageStyles'
import { useNavigate } from 'react-router-dom'
import Carousel from 'react-multi-carousel'
import { RoomSize } from '../../../constants/common'
const customItemStyle = {
  // Adjust this value to your desired spacing
  // You can also adjust padding if needed:
  // padding: '0 5px',
}

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    slidesToSlide: 3, // optional, default to 1.
  },
  desktop2: {
    breakpoint: { max: 1500, min: 1024 },
    items: 3,
    slidesToSlide: 3, // optional, default to 1.
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 3,
    slidesToSlide: 2, // optional, default to 1.
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1, // optional, default to 1.
  },
}

const containerStyle = {
  overflow: 'hidden',
}

interface RoomCardProps {
  roomSize: RoomSize;
  imageUrl: string;
  title: string;
  sqft: string;
}

const RoomCard: FC<RoomCardProps> = ({ roomSize, imageUrl, title, sqft }) => {
  const navigate = useNavigate();

  const navigateToProdList = () => {
    navigate(`/product-list?roomSize=${roomSize}`);
  };

  return (
    <div className='px-2' style={customItemStyle} onClick={navigateToProdList}>
      <div className='card text-light rounded-4 position-relative border-0'>
        <img src={toAbsoluteUrl(imageUrl)} className='card-img1 rounded-4' alt='...' />
        <div className='card-img-overlay rounded-4 overlay1 text-center'>
          <div className='bottomRoomText d-flex flex-column align-items-center marginPageMY mt-4'>
            <h1 className='card-title fw-bold w-50 fs-md-2 w-md-100 fs-lg-3'>{title}</h1>
            <small className='text-white fs-3 mt-2'>{sqft}</small>
          </div>
        </div>
      </div>
    </div>
  );
};


const HomeSizeUpRoomPage: FC = () => {
  const navigate = useNavigate()

  const navigateToProdList = (roomSize: string) => {
    navigate(`/product-list?roomSize=${roomSize}`);
  };

  return (
    <>
      <HomeSizeUpRoomPageStyles>
        <section className='marginPageMY marginPageMYMobile mt-14'>
          <div className='innerTextMain'>
            <div className='responsiveFontLargeHeading excText primaryTextBold fs-xxl-1 fs-xl-1 fs-md-1'>
              Size Up Your Room
            </div>
          </div>
        </section>
        <div className=' '>
          <Carousel
            // ... (previous carousel props)
            swipeable={false}
            draggable={false}
            showDots={false}
            responsive={responsive}
            ssr={true} // means to render carousel on server-side.
            infinite={true}
            autoPlay={false} // Removed the condition based on this.props.deviceType
            autoPlaySpeed={3000}
            keyBoardControl={true}
            customTransition='all .5'
            transitionDuration={500}
            containerClass='carousel-container'
            // removeArrowOnDeviceType={['tablet', 'mobile']}
            deviceType={''}
            dotListClass='custom-dot-list-style'
            itemClass='carousel-item-padding-40-px'
          >
            {[
              { roomSize: RoomSize.SMALL, imageUrl: '/media/vectors/smallRoom.png', title: 'Small Bedroom', sqft: 'Less than 120 sq. ft' },
              { roomSize: RoomSize.MEDIUM, imageUrl: '/media/vectors/mediumRoom.png', title: 'Medium Bedroom', sqft: '120-300 sq. ft' },
              { roomSize: RoomSize.LARGE, imageUrl: '/media/vectors/largeRoom.png', title: 'Large Room', sqft: '300-500 sq. ft' },
              { roomSize: RoomSize.EXTRA_LARGE, imageUrl: '/media/vectors/xxlargeRoom.png', title: 'Extra Large Room', sqft: '500+ sq. ft' },
            ].map((room) => (
              <RoomCard key={room.roomSize} {...room} />
            ))}
          </Carousel>
        </div>
      </HomeSizeUpRoomPageStyles>
    </>
  )
}

export default HomeSizeUpRoomPage
