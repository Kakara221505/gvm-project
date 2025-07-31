// MyOrderBillingAddress.tsx

import React, { FC } from 'react';
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

interface MyOrderBillingAddressProps {
  address: Address;
}

const MyOrderBillingAddress: FC<MyOrderBillingAddressProps> = ({ address }) => {
  // Check if the address object is defined
  if (!address) {
    return <div>No data available</div>;
  }

  const displayCompany = address.Company_name ? address.Company_name : '-';
  const displayGST = address.GST_number ? address.GST_number : '-';
  const displayFirstName = address.First_name ? address.First_name : '-';
  const displayLastName = address.Last_name ? address.Last_name : '';
  const displayPhoneNumber = address.Phone_number ? `${address.Phone_number}` : '-';
  const displayAddress = address.Address
    ? `${address.Address} ${address.City} ${address.Country} ${address.State}`
    : '-';

  return (
    <section>
      <div className='card border border-1 border-gray-300 rounded-4'>
        <div className='card-header border-0 py-4 px-8 d-flex align-items-center' id='headingOne2'>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='d-flex align-items-center mt-4'>
              <h2 className='primaryTextSemiBold mb-0'>Billing Address</h2>
            </div>
          </div>
          <button
            className='btn btn-link '
            aria-expanded='false'
            aria-controls='collapseOne2'
          ></button>
        </div>
          <div className='px-8 pb-0  mb-0   innerContactDetails my-5 mt-0 pb-10'>
            <div className='innerContactDetails zza mobilePaddingNone '>
              <div className='d-flex addAlignStart mobileFlexColumn align-items-center mt-0'>
                <div className='d-flex align-items-center mt-5'>
                  <img
                    className='img-fluid'
                    alt='OrganizationIcon'
                    src={toAbsoluteUrl('/media/vectors/OrganizationIcon.png')}
                  />
                  <h4 className='text-gray-500 fw-normal mb-0 ps-3'>{displayCompany}</h4>
                </div>
                <div className='d-flex mt-5 align-items-center zza mobilePaddingNone ps-10'>
                  <img
                    className='img-fluid'
                    alt='GSTWhiteIcon'
                    src={toAbsoluteUrl('/media/vectors/GSTWhiteIcon.png')}
                  />
                  <h4 className='text-gray-500 fw-normal mb-0 ps-3'>{displayGST}</h4>
                </div>
              </div>
            </div>

            <div className='d-flex addAlignStart  align-items-center mobileFlexColumn align-items-center my-3 mt-0'>
              {displayFirstName !== '-' && (
                <div className=' d-flex  mt-5 align-items-center  '>
                  <img
                    className='img-fluid'
                    alt='nameIconCustom'
                    src={toAbsoluteUrl('/media/vectors/nameIconCustom.png')}
                  />
                  <h4 className='text-black fw-normal mb-0 ps-3 text-gray-500'>
                    {displayFirstName} {displayLastName}
                  </h4>
                </div>
              )}

              {displayPhoneNumber !== '-' && (
                <div className='zza d-flex mt-5 align-items-center mobilePaddingNone ps-10 '>
                  <img
                    className='img-fluid'
                    alt='dialIconCustom'
                    src={toAbsoluteUrl('/media/vectors/dialIconCustom.png')}
                  />
                  <h4 className='text-black fw-normal mb-0 ps-3 text-gray-500'>
                    {displayPhoneNumber}
                  </h4>
                </div>
              )}
            </div>

            {displayAddress !== '-' && (
              <div className='d-flex addAlignStart  align-items-center mt-5 '>
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

export default MyOrderBillingAddress;
