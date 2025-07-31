import React, {useEffect, useState} from 'react'
import {PageLink, PageTitle} from '../../../../../_metronic/admin-layout/core'
import axios from 'axios'
import * as authHelper from '../../../auth/core/AuthHelpers'
import {useParams} from 'react-router-dom'
import {toAbsoluteUrl} from '../../../../../_metronic/helpers'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Orders',
    path: '..',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const OrderDetails = () => {
  const [loading, setLoading] = useState(false)
  const [orderDetails, setOrderDetails] = useState<any>()
  const TOKEN = authHelper.getAuth()

  const {orderID} = useParams()

  useEffect(() => {
    if (orderID) {
      // console.log('Dealer id exist', orderID)
      axios
        .get(`${process.env.REACT_APP_SERVER_URL}/order/${orderID}`, {
          headers: {Authorization: 'Bearer ' + TOKEN?.AccessToken},
        })
        .then((res) => {
          if (res.data) {
            let orderDetData = res.data.data
            // console.log('FROMAPI:', orderDetData)
            setOrderDetails(orderDetData)
          }
        })
        .catch((err) => console.log(err))
    }
  }, [orderID])

  const customStyles: any = {
    customSpanStyling: {
      color: '#99a1b7',
      fontSize: '1rem',
    },
    customSpanDetail: {
      color: '#78829D',
      fontSize: '1rem',
      fontWeight: '700',
    },
    customTotalFont: {
      color: '#071437',
      fontSize: '1.25rem',
    },
  }

  return (
    <div>
      <div className='row' style={customStyles}>
        <div className='col-md-4 '>
          <div className='bg-white rounded p-2 flex-grow-1 px-8 py-10 shadow-sm'>
            <h2>Order Details- (#{orderDetails?.OrderID})</h2>

            <div className='d-flex justify-content-between align-items-center'>
              <div>
                {/* <!--<FontAwesomeIcon icon={faCalendarDays} style={{"--fa-primary-color": "#99a1b7", "--fa-secondary-color": "#99a1b7",}} />--> */}
                <span style={customStyles.customSpanStyling}>Date Added</span>
              </div>
              <span style={customStyles.customSpanDetail}>{orderDetails?.Order_date}</span>
            </div>

            <div className='d-flex justify-content-between align-items-center'>
              <div>
                {/* <img src="your_image_url" alt="Payment Method Icon" /> */}
                <span style={customStyles.customSpanStyling}>Payment Method</span>
              </div>
              <span style={customStyles.customSpanDetail}>
                {orderDetails?.paymentMethod || '-'}
              </span>
            </div>

            <div className='d-flex justify-content-between align-items-center'>
              <div>
                {/* <img src="your_image_url" alt="Shipping Method Icon" /> */}
                <span style={customStyles.customSpanStyling}>Shipping Method</span>
              </div>
              <span style={customStyles.customSpanDetail}>
                {orderDetails?.shippingMethod || '-'}
              </span>
            </div>
          </div>
        </div>

        <div className='col-md-4    '>
          <div className='bg-white rounded p-2 flex-grow-1  px-8 py-10 shadow-sm'>
            <h2>Dealer Details</h2>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                {/* <img></img> */}
                <span style={customStyles.customSpanStyling}>Company Name</span>
              </div>

              <span style={customStyles.customSpanDetail}>
                {orderDetails?.DealerDetails?.Company_name || '-'}
              </span>
            </div>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                {/* <img></img> */}
                <span style={customStyles.customSpanStyling}>Contact</span>
              </div>

              <span style={customStyles.customSpanDetail}>
                {orderDetails?.DealerDetails?.Contact_phone || '-'}
              </span>
            </div>

            <div className='d-flex justify-content-between align-items-center'>
              <div>
                {/* <img></img> */}
                <span style={customStyles.customSpanStyling}>Address</span>
              </div>

              <span style={customStyles.customSpanDetail}>
                {orderDetails?.DealerDetails?.Address?.Address || '-'},{' '}
                {orderDetails?.DealerDetails?.Address?.City || '-'},{' '}
                {orderDetails?.DealerDetails?.Address?.State || ''}
              </span>
            </div>
          </div>
        </div>

        <div className='col-md-4'>
          <div className='bg-white rounded p-2 flex-grow-1  px-8 py-10 shadow-sm'>
            <h2>Documents</h2>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                {/* <img></img> */}
                <span style={customStyles.customSpanStyling}>Invoice</span>
              </div>

              <span style={customStyles.customSpanDetail}> - </span>
            </div>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                {/* <img></img> */}
                <span style={customStyles.customSpanStyling}>Shipping </span>
              </div>

              <span style={customStyles.customSpanDetail}>- </span>
            </div>

            <div className='d-flex justify-content-between align-items-center'>
              <div>
                {/* <img></img> */}
                <span style={customStyles.customSpanStyling}>Additional</span>
              </div>

              <span style={customStyles.customSpanDetail}>-</span>
            </div>
          </div>
        </div>
      </div>

      <div className='row mt-12 gap-6 px-4'>
        <div className='col-md-2 bg-white rounded p-2 flex-grow-1  px-8 py-10 shadow-sm'>
          <h2>Billing Address</h2>
          <div>
            <p>
              {orderDetails?.BillingAddress?.Company_name} {orderDetails?.BillingAddress?.Address},{' '}
              {orderDetails?.BillingAddress?.City}, {orderDetails?.BillingAddress?.State}-
              {orderDetails?.BillingAddress?.PostalCode}, {orderDetails?.BillingAddress?.Country}
            </p>
            <p>
              {orderDetails?.BillingAddress?.Phone_number},{' '}
              {orderDetails?.BillingAddress?.Phone_number_2}{' '}
            </p>
          </div>
          <div>
            {/* shipping icon  */}
            {/* <img></img> */}
          </div>
        </div>

        <div className=' col-md-2 bg-white rounded p-2 flex-grow-1  px-8 py-10 shadow-sm'>
          <h2>Shipping Address</h2>
          <div>
            <p>
              {orderDetails?.ShippingAddress?.First_name} {orderDetails?.ShippingAddress?.Last_name}{' '}
              {orderDetails?.ShippingAddress?.Address} {orderDetails?.ShippingAddress?.City}{' '}
              {orderDetails?.ShippingAddress?.State} {orderDetails?.ShippingAddress?.PostalCode}{' '}
              {orderDetails?.ShippingAddress?.Country}
            </p>
            <p>
              {orderDetails?.BillingAddress?.Phone_number}{' '}
              {orderDetails?.BillingAddress?.Phone_number_2}{' '}
            </p>
          </div>
          <div>
            {/* shipping icon  */}
            {/* <img></img> */}
          </div>
        </div>
      </div>

      <div className='row mt-12 bg-white px-10 py-10 rounded border shadow-sm rounded'>
        <h2>Order #14534</h2>
        {/* order table  */}
        {orderDetails?.OrderItems.length > 0 ? (
          <div className='dataTables_wrapper dt-bootstrap4 no-footer mt-4 '>
            <div className='table-responsive'>
              <table className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'>
                <thead>
                  <tr
                    className='text-start  fw-bold fs-7 text-uppercase gs-0'
                    style={customStyles.customSpanDetail}
                  >
                    <th className=' min-w-125px fw-medium fs-6'>Product</th>
                    <th className='text-center  min-w-125px fw-medium fs-6'>SKU</th>
                    <th className='text-center  min-w-125px fw-medium fs-6'>Quantity</th>
                    <th className='text-center  min-w-125px fw-medium fs-6'>Unit Price</th>
                    <th className='text-center  min-w-125px fw-medium fs-6'>Total Amount</th>
                  </tr>
                </thead>
                <tbody className='text-gray-600 fw-semibold'>
                  {orderDetails?.OrderItems &&
                    orderDetails?.OrderItems?.map((data: any, index: any) => (
                      <tr key={index}>
                        <td className='text-black text-center'>
                          <div className='d-flex gap-4 align-items-center'>
                            <img
                              src={data?.ProductImage || toAbsoluteUrl('/media/avatars/blank.png')}
                              alt='productImg'
                              width={120}
                              height={80}
                              className='border p-2'
                            />
                            {/* {data.ProductImage ? (
                                  <div
                                    className='image-input '
                                    data-kt-image-input='true'
                                    style={{
                                      backgroundImage: `url(${toAbsoluteUrl('/media/avatars/blank.png')})`,

                                    }}
                                  >
                                    <div
                                      className='image-input-wrapper w-60px h-50px '
                                      style={{
                                        backgroundImage: `url(${toAbsoluteUrl(data.ProductImage)})`,
                                      }}
                                    ></div>
                                  </div>
                                ) : (
                                  '-'
                                )} */}
                            <div>
                              <h4
                                className='text-left d-flex start'
                                style={customStyles.customSpanDetail}
                              >
                                {data?.ProductName}
                              </h4>
                              <p
                                className='text-left d-flex start'
                                style={customStyles.customSpanStyling}
                              >
                                Color: {data?.Color}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='text-center cellText'>{data.SkuNumber || '-'}</td>
                        <td className='text-center cellText'>{data.Quantity || '-'}</td>
                        <td className='text-center cellText'>{data.Price || '-'}</td>
                        <td className='text-center cellText'>{data.Price || '-'}</td>

                       
                  
                      </tr>
                    ))}
                  <tr>
                    <td className='text-center'></td>
                    <td className='text-center'></td>
                    <td className='text-center'></td>
                    <td className='text-center'>Subtotal </td>
                    <td className='text-center'>$ {orderDetails?.Sub_total_amount}</td>
                  </tr>
                  <tr>
                    <td className='text-center'></td>
                    <td className='text-center'></td>
                    <td className='text-center'></td>
                    <td className='text-center'>Discount </td>
                    <td className='text-center'>- ${orderDetails?.Discount_amount}</td>
                  </tr>
                  <tr>
                    <td className='text-center'></td>
                    <td className='text-center'></td>
                    <td className='text-center'></td>
                    <td className='text-center'>VAT (0%) </td>
                    <td className='text-center'>$ 0.00</td>
                  </tr>
                  <tr>
                    <td className='text-center'></td>
                    <td className='text-center'></td>
                    <td className='text-center'></td>
                    <td className='text-center'>Shipping Rate </td>
                    <td className='text-center'>$ {orderDetails?.Shipping_charge}</td>
                  </tr>
                  <tr>
                    <td className='text-center'></td>
                    <td className='text-center'></td>
                    <td className='text-center'></td>
                    <td className='text-center fw-medium' style={customStyles.customTotalFont}>
                      Grand Total{' '}
                    </td>
                    <td className='text-center fw-bolder' style={customStyles.customTotalFont}>
                      $ {orderDetails?.Total_amount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : loading ? (
          <span className='indicator-progress text-center d-block'>
            Please wait...{' '}
            <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
          </span>
        ) : (
          <div className='text-center w-90'>
            <h2 className='mt-9'>Records not found</h2>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
