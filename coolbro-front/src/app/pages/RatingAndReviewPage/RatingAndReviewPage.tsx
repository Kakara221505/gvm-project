/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC } from 'react'
import { RatingAndReviewPageStyles } from './RatingAndReviewPageStyles';
import ReviewListSection from './ReviewListSection/ReviewListSection';
import AddReviewSection from './AddReviewSection/AddReviewSection';



const RatingAndReviewPage: FC = () => {

  return (
    <RatingAndReviewPageStyles>
    <div className='mobilePaddingNew container-fluid px-20'>
      <div className=''>
        <div className=''>
          <div className='row marginPageMYMobile my-8 '>
          <h1 className='primaryTextSemiBold fs-2hx'>RATINGS & REVIEWS</h1>
            <div className='col-lg-4 '>
                <ReviewListSection/>
            </div>
            <div className='col-lg-8'>
                <AddReviewSection/>
            </div>
          </div>
        </div>
      </div>
    </div>
    </RatingAndReviewPageStyles>
  )
}

export default RatingAndReviewPage
