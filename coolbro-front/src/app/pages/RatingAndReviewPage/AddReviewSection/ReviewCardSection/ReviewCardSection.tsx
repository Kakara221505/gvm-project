import { FC } from 'react';
import { ReviewCardSectionStyles } from './ReviewCardSectionStyles';
import { toAbsoluteUrl } from '../../../../../_metronic/helpers';

interface ReviewCardSectionProps {
  data: any;
}

const ReviewCardSection: FC<ReviewCardSectionProps> = ({ data }) => {

  return (
    <>
      <ReviewCardSectionStyles>
        <div className='card '>
          <div className='card-horizontal mobileFlexColumn'>
            <div className='img-square-wrapper p-6 ps-1'>
              <div className=''>
                <div className='commonBGMain'>
                  <img
                    height={100}
                    width={100}
                    className='mobileWFull'
                    src={toAbsoluteUrl(data?.MainMedia || '')}
                    alt='Card cap'
                  />
                  <div className='commonBGACMain'>
                    <img
                      height={75}
                      width={75}
                      className='mobileWFull ACImageCommon'
                      src={toAbsoluteUrl('/media/vectors/AC1Common.png')}
                      alt=''
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='card-body p-6 '>
              <h4 className='card-title primaryTextBold'>{data?.Name || ''}</h4>
              {data?.SKU_number ?
                <p className='fs-6 card-text mb-0 pb-0 d-flex align-items-center primaryTextBold'>
                  SKU: {data?.SKU_number || ''}
                </p>
                :
                ""
              }
            </div>
          </div>
        </div>
      </ReviewCardSectionStyles>
    </>
  );
};

export default ReviewCardSection;
