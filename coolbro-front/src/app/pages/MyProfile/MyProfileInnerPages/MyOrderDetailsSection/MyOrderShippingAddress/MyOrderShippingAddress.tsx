// MyOrderShippingAddress.tsx

import { FC } from 'react';
import { toAbsoluteUrl } from '../../../../../../_metronic/helpers';

interface Address {
  Company_name?: string;
  GST_number?: string;
  First_name?: string;
  Last_name?: string;
  Phone_number?: string;
  Phone_number_2?: string;
  Address?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Country?: string;
}

interface MyOrderShippingAddressProps {
  address: Address;
}

const MyOrderShippingAddress: FC<MyOrderShippingAddressProps> = ({ address }) => {
  // Check if the address object is defined
  if (!address) {
    return <div>No data available</div>;
  }

  const displayFirstName = address.First_name ? address.First_name : '-';
  const displayLastName = address.Last_name ? address.Last_name : '';
  const displayPhoneNumber = address.Phone_number ? `${address.Phone_number}` : '-';
  const displayAddress = address.Address
    ? `${address.Address} ${address.City} ${address.Country} ${address.State}`
    : '-';

  return (
    <section>
      <div className='card border border-1 border-gray-300 rounded-4'>
        <div className='card-header border-0 mb-0 py-4 px-8 d-flex align-items-center' id='headingOne2'>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='d-flex align-items-center mt-4'>
              <h2 className='primaryTextSemiBold mb-0'>Shipping Address</h2>
            </div>
          </div>
          <button
            className='btn btn-link '
            aria-expanded='false'
            aria-controls='collapseOne2'
          ></button>
        </div>
          <div className=' card-header border-0 pb-0 mb-0 mt-0  innerContactDetails my-5 pb-10'>
            <div className='d-flex addAlignStart mobileFlexColumn align-items-center mt-0'>
              {displayFirstName !== '-' && (
                <div className='d-flex align-items-center  mt-5'>
                  <div className=''>
                    <img
                      className='img-fluid'
                      src={toAbsoluteUrl('/media/vectors/nameIconCustom.png')}
                    />
                  </div>
                  <h4 className='text-black fw-normal mb-0 ps-3 text-gray-500'>
                    {displayFirstName} {displayLastName}
                  </h4>
                </div>
              )}

              {displayPhoneNumber !== '-' && (
                <div className='d-flex align-items-center  mt-5'>
                  <div className='zza mobilePaddingNone ps-10 '>
                    <img
                      className='img-fluid'
                      src={toAbsoluteUrl('/media/vectors/dialIconCustom.png')}
                    />
                  </div>
                  <h4 className='text-black fw-normal mb-0 ps-3 text-gray-500'>
                    {displayPhoneNumber}
                  </h4>
                </div>
              )}
            </div>

            {displayAddress !== '-' && (
              <div className='d-flex addAlignStart align-items-center mt-5 '>
                <div className='my-2 paddingPagePXMobile'>
                  <img className='' src={toAbsoluteUrl('/media/vectors/pinIconCustom.png')} />
                </div>
                <h4 className='text-black fw-normal mb-0 ps-3 text-gray-500'>{displayAddress}</h4>
              </div>
            )}
          </div>
      </div>
    </section>
  );
};

export default MyOrderShippingAddress;
