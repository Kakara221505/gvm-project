import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import { EmptyCartStyles } from './EmptyCartStyles'

const EmptyCart: FC = () => {
  const navigate = useNavigate();
  const navigateToProdList = () => {
    // navigate('/product-list')
    navigate('/')
  }

  return (
    <EmptyCartStyles>
      <section>
        <div className='container'>
          <div className='row my-20'>
            <div className='col-lg-12'>
              <div className='d-flex flex-column align-items-center  justify-content-center'>
                <img
                  className='mobileWFull'
                  src={toAbsoluteUrl('/media/vectors/NoCartVector.png')}
                  alt='Card cap'
                />
                <div className='innerTextBottomNoCart d-flex justify-content-center flex-column align-items-center'>
                  <h1 className='primaryTextBold my-10 mb-2'>
                    Your Cart is Empty
                  </h1>
                  <h3 className='primaryTextBold my-6  textAlignCenterMobile'>
                    Looks like you haven’t added anything to your cart yet
                  </h3>

                  <button className='primaryBtn btn btn-default px-15 mt-6' onClick={navigateToProdList}>Continue Shopping</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </EmptyCartStyles>
  )
}

export default EmptyCart
