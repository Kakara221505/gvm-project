import React, { useEffect } from 'react';
import { RatingSectionStyles } from './RatingSectionStyles';

function RatingSection({ onRatingChange, rating }: any) {
  useEffect(() => {
    // Check if rating is available and not 0
    if (rating !== undefined && rating !== 0) {
      // Do something if needed
    }
  }, [rating]);

  return (
    <RatingSectionStyles>
      <section>
        <div className='headRateText py-2'>
          <h4 className='text-black'>How would you rate it ?</h4>
        </div>
        <div className='mainRating'>
          {rating !== undefined && rating !== 0 ? (
            <div className='rating'>
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className='rating-label' htmlFor={`kt_rating_input_${value}`}>
                  <i
                    className={`ki-duotone ki-star fs-1 ${value <= rating ? 'yellow-star' : ''}`}
                    style={{ color: value <= rating ? '#ffad0f' : 'gray' }}
                  ></i>
                  <input
                    className='rating-input'
                    name='rating'
                    value={value}
                    type='radio'
                    id={`kt_rating_input_${value}`}
                    checked={rating === value}
                    onChange={() => onRatingChange(value)}
                  />
                </label>
              ))}
            </div>
          ) : (
            // Render stars without yellow color when rating is 0 or not available
            <div className='rating'>
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className='rating-label' htmlFor={`kt_rating_input_${value}`}>
                  <i
                    className={`ki-duotone ki-star fs-1`}
                    style={{ color: 'gray' }}
                  ></i>
                  <input
                    className='rating-input'
                    name='rating'
                    value={value}
                    type='radio'
                    id={`kt_rating_input_${value}`}
                    checked={rating === value}
                    onChange={() => onRatingChange(value)}
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      </section>
    </RatingSectionStyles>
  );
}

export default RatingSection;
