/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC} from 'react'
import {ReviewListSectionStyles} from './ReviewListSectionStyles'
const reviewListItems = [
  {
    question: 'Have you used this product?',
    answer: 'Your review should be about your experience with the product.',
  },
  {
    question: 'How to review a product?',
    answer:
      'Your review should include facts. An honest opinion is always appreciated. If you have an issue with the product or service please contact us from the help centre.',
  },
  // Add more items as needed
]

const ReviewListSection: FC = () => {
  return (
    <ReviewListSectionStyles>
      <section className='reviewListSection my-6'>
        <div className='card reviewListCard'>
          <ul className='list-group list-group-flush'>
            <li className='list-group-item headerReview fs-4 fw-bold py-5 px-6'>
              What makes a good review
            </li>
            {reviewListItems.map((item, index) => (
              <li className='list-group-item' key={index}>
                <div className='my-4 mt-2 px-3 d-flex flex-column'>
                  <span className='question fw-medium fs-5 my-2'>{item.question}</span>
                  <span className='answer fw-normal fs-5'>{item.answer}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </ReviewListSectionStyles>
  )
}

export default ReviewListSection
