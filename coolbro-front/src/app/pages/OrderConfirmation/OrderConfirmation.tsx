import { FC } from 'react';
import { OrderConfirmationStyles } from './OrderConfirmationStyles';
import Confirmation from './Confirmation/Confirmation';

const MyCart: FC = () => {

  return (
    <OrderConfirmationStyles>
      <section>
        <div className='mobilePaddingNew container-fluid px-20'>
          <div className=''>
            <div className='row'>
              <div className='col-lg-12'>
                <Confirmation />
              </div>
            </div>
          </div>
        </div>
      </section>
    </OrderConfirmationStyles>
  );
};

export default MyCart;
