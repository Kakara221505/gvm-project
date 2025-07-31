import { FC, useState, useEffect } from 'react'
import { ConfirmationStyles } from './ConfirmationStyles'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'

const Confirmation: FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [orderData, setOrderData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchOrder()
  }, [orderId])
  const fetchOrder = () => {
    setLoading(true)
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/order/${orderId}`)
      .then((res: any) => {
        setLoading(false)
        if (res.data && res.data.data) {
          setOrderData(res.data.data)
        }
        console.log("hii", orderData)
      })
      .catch((err) => {
        setLoading(false)
        console.error(err)
      })
  }
  return (
    <ConfirmationStyles>
      <section>
        <div className='container mobilePaddingNone'>
          <div className='mobilePaddingNone app-container marginPageMY'>
            <div className='row d-flex justify-content-center m-auto'>
              <div className='col-lg-10'>
                <div className=''>
                  <div className='boxNavPills1 card text-center'>
                    <div className='card-header border-0 text-center navbarMarginForSearch d-flex justify-content-center align-items-center pb-0'>
                      <h1 className='responsiveFontLargeHeading  card-titleOrder text-center mb-0 pb-0 primaryTextMediumBold '>
                        Your Order has been received!
                      </h1>
                    </div>
                    <div className='card-body'>
                      <img
                        className='py-6'
                        src={toAbsoluteUrl('/media/vectors/BigCalanderICO.png')}
                        alt='Card cap'
                      />
                      <h1 className='text-black fw-medium card-title py-4 pb-2'>
                        Thank you for your purchase!
                      </h1>
                      <h5 className='text-black fw-medium card-text py-4'>
                        Your order ID is : {orderId}
                      </h5>
                      <h5 className='text-black fw-medium card-text '>
                        Your will receive an order confirmation email with details of your order.
                      </h5>
                    </div>
                    <div className='card-footer border-0 text-muted'>
                      <a href='#' className='primaryBtn btn btn-primary px-15'>
                        Track Your Order
                      </a>
                    </div>
                  </div>
                </div>
                <div className='row mx-0 marginPageMY d-flex justify-content-between'>
                  <div className='col-lg-5 border-3 ps-0'>
                    <div className='boxNavPills1 card h-300px mh-300px'>
                      <div className='card-body px-6'>
                        <div className=''>
                          <h4 className='card-title primaryTextBold'>ESTIMATED DELIEVERY</h4>
                          <h5 className='fw-normal text-gray-600'>16 Aug 2023</h5>
                        </div>
                        {orderData.ShippingAddress && (
                          <div className='d-flex my-4 mb-0 align-items-center'>
                            <div className='my-2 mb-0'>
                              <img
                                className=''
                                src={toAbsoluteUrl('/media/vectors/pinIconCustom.png')}
                              />
                            </div>
                            <h5 className='addText fw-normal mb-0 ps-3'>
                              {orderData.ShippingAddress.Address} {orderData.ShippingAddress.City} {orderData.ShippingAddress.Country} {orderData.ShippingAddress.State} {orderData.ShippingAddress.PostalCode}
                            </h5>
                          </div>
                        )}
                      </div>
                      {orderData.OrderItems && orderData.OrderItems.map((item: any, index: number) => (
                        <div key={index} className='card-footer border-top-2 px-6 text-muted'>
                          <div className='row d-flex  align-items-center'>
                            <div className='col-lg-4 dFLexAlignItemsCenterMobile mobileFlexColumn'>
                              <img
                                className='img-fluid'
                                // src={toAbsoluteUrl('/media/vectors/AcOrderRecieved.png')}
                                src={item.ProductImage}
                                alt='Card cap'
                              />
                            </div>
                            <div className='col-lg-5 dFLexAlignItemsCenterMobile mobileFlexColumn'>
                              <small className='text-black fw-bold fs-7'>{item.ProductName}</small>
                              <div className='d-flex'>
                                <div className='px-1 ps-0'>
                                  <small>Color:</small>
                                  <small>{item.ProductName}</small>
                                </div>
                                |
                                <div className='px-1'>
                                  <small>Qty:</small>
                                  <small>{item.Quantity}</small>
                                </div>
                              </div>
                            </div>
                            <div className='col-lg-3 dFLexAlignItemsCenterMobile mobileFlexColumn navbarMarginForSearch d-flex ms-auto text-end justify-content-end'>
                              <small className='text-black fw-bold fs-7'>₹ {item.Price}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className='col-lg-5 border-3 ps-0 marginPageMYMobile'>
                    <div className='boxNavPills1 card h-300px mh-300px'>
                      <div className='card-body px-6 pb-6'>
                        <div className=''>
                          <h4 className='card-title primaryTextBold'>TOTAL SUMMARY</h4>
                        </div>
                        <div className='d-flex justify-content-between align-items-center my-4 mb-0'>
                          <h4 className='my-2 fw-normal'>Subtotal</h4>
                          <h5 className='addText fw-bold mb-0 ps-3'>₹ {orderData.Sub_total_amount}</h5>
                        </div>
                        <div className='d-flex justify-content-between align-items-center my-4 mb-0'>
                          <h4 className='my-2 fw-normal'>Discount</h4>
                          {/* <h5 className='addText fw-bold mb-0 ps-3'>-₹ {orderData.Discount_amount}</h5> */}
                          <h5 className='addText fw-bold mb-0 ps-3'>-₹ 0</h5>
                        </div>
                        <div className='d-flex justify-content-between align-items-center my-4 mb-0'>
                          <h4 className='my-2 mb-0 fw-normal'>Shipping Charge</h4>
                          <h5 className='addText fw-bold mb-0 ps-3'>₹ {orderData.Shipping_charge}</h5>
                        </div>
                      </div>
                      <hr className='border-top-2 border-opacity-50 border-success' />
                      <div className='card-footer border-0 px-6 text-muted pt-4'>
                        <div className='row d-flex align-items-center'>
                          <div className='d-flex justify-content-between align-items-center my-4 mt-0 mb-0'>
                            <h4 className='mb-0 fw-bold'>Grand Total</h4>
                            <h5 className='addText fw-bold mb-0 ps-3'>₹ {orderData.Total_amount}</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='row'>
                  <div className='buttonContinue d-flex justify-content-center'>
                    <Link to='/' className=''>
                      <button className='primaryOutlineBtn btn btn-default px-12'>
                        Continue Shopping
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ConfirmationStyles>
  )
}

export default Confirmation
