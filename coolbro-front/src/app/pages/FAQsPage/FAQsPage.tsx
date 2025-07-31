import {useState} from 'react'
import {FC} from 'react'
import {toAbsoluteUrl} from '../../../_metronic/helpers'
import {FAQsPageStyles} from './FAQsPageStyles'

const FAQsPage: FC = () => {
  return (
    <>
      <FAQsPageStyles>
        <div className='mobilePaddingNew container-fluid px-20'>
          <div className=''>
            <div className=''>
              <div className='row marginPageMYMobile d-flex align-items-center my-20'>
                <div className='col-lg-6'>
                  <img
                    className='mobileWFull'
                    src={toAbsoluteUrl('/media/vectors/FAQVector.png')}
                    alt='Card cap'
                  />
                </div>
                <div className='col-lg-6 marginPageMYMobile'>
                  <div className='accordion' id='accordionExample'>
                    <div className='accordion-item bg-transparent border-0'>
                      <h2 className='accordion-header' id='headingOne'>
                        <button
                          className='fw-medium fs-4 accordion-button bg-transparent bg-transparent'
                          type='button'
                          data-bs-toggle='collapse'
                          data-bs-target='#collapseOne'
                          aria-expanded='true'
                          aria-controls='collapseOne'
                        >
                          Why is the Cash on Delivery (COD) option not offered in my location?
                        </button>
                      </h2>
                      <div
                        id='collapseOne'
                        className='accordion-collapse collapse  bg-transparent border-0'
                        aria-labelledby='headingOne'
                        data-bs-parent='#accordionExample'
                      >
                        <div className='accordion-body fs-5'>
                          <strong>This is the first item's accordion body.</strong> It is shown by
                          default, until the collapse plugin adds the appropriate classes that we
                          use to style each element. These classes control the overall appearance,
                          as well as the showing and hiding via CSS transitions. You can modify any
                          of this with custom CSS or overriding our default variables. It's also
                          worth noting that just about any HTML can go within the{' '}
                          <code>.accordion-body fs-5</code>, though the transition does limit overflow.
                        </div>
                      </div>
                    </div>
                    <div className='accordion-item bg-transparent border-0'>
                      <h2 className='accordion-header' id='headingTwo'>
                        <button
                          className='fw-medium fs-4 accordion-button bg-transparent collapsed'
                          type='button'
                          data-bs-toggle='collapse'
                          data-bs-target='#collapseTwo'
                          aria-expanded='false'
                          aria-controls='collapseTwo'
                        >
                          How do I know my order has been confirmed?
                        </button>
                      </h2>
                      <div
                        id='collapseTwo'
                        className='accordion-collapse collapse bg-transparent border-0'
                        aria-labelledby='headingTwo'
                        data-bs-parent='#accordionExample'
                      >
                        <div className='accordion-body fs-5'>
                          <strong>This is the second item's accordion body.</strong> It is hidden by
                          default, until the collapse plugin adds the appropriate classes that we
                          use to style each element. These classes control the overall appearance,
                          as well as the showing and hiding via CSS transitions. You can modify any
                          of this with custom CSS or overriding our default variables. It's also
                          worth noting that just about any HTML can go within the{' '}
                          <code>.accordion-body fs-5</code>, though the transition does limit overflow.
                        </div>
                      </div>
                    </div>
                    <div className='accordion-item bg-transparent border-0'>
                      <h2 className='accordion-header' id='headingThree'>
                        <button
                          className='fw-medium fs-4 accordion-button bg-transparent collapsed'
                          type='button'
                          data-bs-toggle='collapse'
                          data-bs-target='#collapseThree'
                          aria-expanded='false'
                          aria-controls='collapseThree'
                        >
                          Can I buy online and pick delivery at the nearest store?
                        </button>
                      </h2>
                      <div
                        id='collapseThree'
                        className='accordion-collapse collapse bg-transparent border-0'
                        aria-labelledby='headingThree'
                        data-bs-parent='#accordionExample'
                      >
                        <div className='accordion-body fs-5'>
                          <strong>This is the third item's accordion body.</strong> It is hidden by
                          default, until the collapse plugin adds the appropriate classes that we
                          use to style each element. These classes control the overall appearance,
                          as well as the showing and hiding via CSS transitions. You can modify any
                          of this with custom CSS or overriding our default variables. It's also
                          worth noting that just about any HTML can go within the{' '}
                          <code>.accordion-body fs-5</code>, though the transition does limit overflow.
                        </div>
                      </div>
                    </div>
                    <div className='accordion-item bg-transparent border-0'>
                      <h2 className='accordion-header' id='headingFour'>
                        <button
                          className='fw-medium fs-4 accordion-button bg-transparent collapsed'
                          type='button'
                          data-bs-toggle='collapse'
                          data-bs-target='#collapseFour'
                          aria-expanded='false'
                          aria-controls='collapseFour'
                        >
                          Can I choose the time and date for PFS?
                        </button>
                      </h2>
                      <div
                        id='collapseFour'
                        className='accordion-collapse collapse bg-transparent border-0'
                        aria-labelledby='headingFour'
                        data-bs-parent='#accordionExample'
                      >
                        <div className='accordion-body fs-5'>
                          <strong>This is the third item's accordion body.</strong> It is hidden by
                          default, until the collapse plugin adds the appropriate classes that we
                          use to style each element. These classes control the overall appearance,
                          as well as the showing and hiding via CSS transitions. You can modify any
                          of this with custom CSS or overriding our default variables. It's also
                          worth noting that just about any HTML can go within the{' '}
                          <code>.accordion-body fs-5</code>, though the transition does limit overflow.
                        </div>
                      </div>
                    </div>
                    <div className='accordion-item bg-transparent border-0'>
                      <h2 className='accordion-header' id='headingFive'>
                        <button
                          className='fw-medium fs-4 accordion-button bg-transparent collapsed'
                          type='button'
                          data-bs-toggle='collapse'
                          data-bs-target='#collapseFive'
                          aria-expanded='false'
                          aria-controls='headingFive'
                        >
                          What is Insta Delivery?
                        </button>
                      </h2>
                      <div
                        id='collapseFive'
                        className='accordion-collapse collapse bg-transparent border-0'
                        aria-labelledby='headingFive'
                        data-bs-parent='#accordionExample'
                      >
                        <div className='accordion-body fs-5'>
                          <strong>This is the third item's accordion body.</strong> It is hidden by
                          default, until the collapse plugin adds the appropriate classes that we
                          use to style each element. These classes control the overall appearance,
                          as well as the showing and hiding via CSS transitions. You can modify any
                          of this with custom CSS or overriding our default variables. It's also
                          worth noting that just about any HTML can go within the{' '}
                          <code>.accordion-body fs-5</code>, though the transition does limit overflow.
                        </div>
                      </div>
                    </div>
                    <div className='accordion-item bg-transparent border-0'>
                      <h2 className='accordion-header' id='headingSix'>
                        <button
                          className='fw-medium fs-4 accordion-button bg-transparent collapsed'
                          type='button'
                          data-bs-toggle='collapse'
                          data-bs-target='#collapseSix'
                          aria-expanded='false'
                          aria-controls='collapseSix'
                        >
                          How does Pick at Store work?
                        </button>
                      </h2>
                      <div
                        id='collapseSix'
                        className='accordion-collapse collapse show bg-transparent border-0'
                        aria-labelledby='headingSix'
                        data-bs-parent='#accordionExample'
                      >
                        <div className='accordion-body fs-5'>
                          On the second step of checkout, you can choose Pick at store instead of
                          choosing Standard delivery or Insta delivery. Once you have chosen Pick at
                          Store option, you need to enter your pin code. This will give you choices
                          of the stores in the vicinity of your pin code. You can choose any store
                          from where you can pick the order.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FAQsPageStyles>
    </>
  )
}

export default FAQsPage
