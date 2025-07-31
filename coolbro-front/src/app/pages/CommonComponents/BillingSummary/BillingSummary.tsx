import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import { BillingSummaryStyles } from './BillingSummaryStyles'
import axios from 'axios';
import * as authHelper from '../../../modules/auth/core/AuthHelpers'
import { useAuth } from '../../../modules/auth';
import {
  defaultFormErrorConfig,
  defaultDealerConfig,
  defaultShippingAddressConfig, defaultBillingAddressConfig, defaultOutOfStockConfig
} from '../../../config/sweetAlertConfig'
import Swal from 'sweetalert2';
interface OrderItem {
  ID: number;
  ProductID: number;
  VariationID: number;
  Quantity: number;
  Product: {
    Name: string;
    SKU_number: string;
    Price: string;
    Sale_price: string;
  };
  Variation: {
    Type: string;
    Value: string;
  };
  ProductMedia: {
    Media_url: string;
  };
}
interface BillingSummaryProps {
  isCart: boolean
  orderItems: OrderItem[]
  itemQuantities: { [key: number]: number }
}

const BillingSummary: FC<BillingSummaryProps> = ({ isCart, orderItems, itemQuantities }) => {
  const [loading, setLoading] = useState(false);
  const TOKEN = authHelper.getAuth()
  const { currentUser, setCurrentUser, logout } = useAuth()
  const navigate = useNavigate();
  const navigateToProdList = () => {
    navigate('/product-list')
  }
  const navigateToCheckout = () => {
    navigate('/user/checkout')
  }

  const calculateDiscountAmount = () => {
    return orderItems.reduce((total, item) => {
      const itemTotal = (isCart ? (itemQuantities[item.ID] || 0) : item.Quantity) * parseFloat(item.Product.Price)-(isCart ? (itemQuantities[item.ID] || 0) : item.Quantity) * parseFloat(item.Product.Sale_price);
      return total + itemTotal;
    }, 0);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => {
      const itemTotal = (isCart ? (itemQuantities[item.ID] || 0) : item.Quantity) * parseFloat(item.Product.Sale_price);
      return total + itemTotal;
    }, 0);
  };

  const discountamount = calculateDiscountAmount();
  const shippingCharge = 50;
  const subtotal = calculateSubtotal();
  const grandTotal = subtotal + shippingCharge;

  const navigateToOrderConfirmation = () => {
    const shippingAddressId = localStorage.getItem('shippingId');
    const billingAddressId = localStorage.getItem('billingId');
    const storedDealerId = localStorage.getItem('selectedDealerId');
    if (!storedDealerId) {
      Swal.fire(defaultDealerConfig)
      return;
    }
    if (!shippingAddressId) {
      Swal.fire(defaultShippingAddressConfig)
      return;
    }
    if (!billingAddressId) {
      Swal.fire(defaultBillingAddressConfig)
      return;
    }
    try {
      setLoading(true)
      // Prepare order payload
      const orderPayload = {
        UserID: currentUser ? currentUser.ID : '',
        DealerID: storedDealerId,
        Email: currentUser ? currentUser.Email : '',
        BillingAddressID: billingAddressId,
        ShippingAddressID: shippingAddressId,
        Sub_total_amount: subtotal,
        Shipping_charge: 50, // static value for now
        Discount_amount: 0,
        orderItems: orderItems.map(item => ({
          ProductID: item.ProductID,
          Quantity: isCart ? (itemQuantities[item.ID] || 0) : item.Quantity,
          Color: item.Variation.Value, // assuming Color is the Variation.Value
          Price: parseFloat(item.Product.Sale_price)
        }))
      };
      axios
        .post(`${process.env.REACT_APP_SERVER_URL}/order/add_order`, orderPayload, {
          headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
        })
        .then(async (res) => {
          if (res.status === 200 && res.data.message) {
            setLoading(false)
            localStorage.removeItem("shippingId")
            localStorage.removeItem("selectedDealerId")
            localStorage.removeItem("billingId")
            navigate(`/user/confirmation/${res.data.OrderID}`);
          }
          else if (res.status === 401) {
            logout()
          } else {
            setLoading(false)
            console.log('Error: ', res.data.error)
          }

        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            // Handle 400 status code
            setLoading(false);
            Swal.fire(
              defaultOutOfStockConfig
            ).then(() => {
              navigate('/user/cart');
            });
          }
        })
    } catch (err) {
      Swal.fire(defaultFormErrorConfig)
      setLoading(false)
      // Handle the error
    }

  }

  return (
    <BillingSummaryStyles>
      <section>
        {isCart ? (
          <></>
        ) : (
          <div className='row my-10 mb-0' >
            <div className='col-lg-12'>
              <div className='headingText'>
                <h1 className='primaryTextBold'>ORDER SUMMARY</h1>
              </div>
              <div className='orderCard mt-5'>
                {orderItems.map((item, index) => (
                  <div className='card mb-5' key={item.ID}>
                    <div className='card-horizontal mobileFlexColumn'>
                      <div className='img-square-wrapper p-6'>
                        <div className=''>
                          <div className='commonBGMain'>
                            <img
                              height={100}
                              width={100}
                              className='mobileWFull'
                              src={toAbsoluteUrl('/media/vectors/BGCommonPortraitImage.png')}
                              alt='Card cap'
                            />
                            <div className='commonBGACMain'>
                              <img
                                height={75}
                                width={75}
                                className='mobileWFull ACImageCommon'
                                src={item.ProductMedia?.Media_url}
                                alt=''
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='card-body p-6 '>
                        <h4 className='card-title11 primaryTextBold'>
                          {item.Product.Name}
                        </h4>
                        <p className='fs-8 card-text mb-0 pb-0 d-flex align-items-center primaryTextBold'>
                          SKU: {item.Product.SKU_number}
                        </p>
                        <div className='d-flex  align-items-center mt-1 mb-0'>
                          <img
                            className='img-fluid'
                            src={toAbsoluteUrl('/media/vectors/Quantity.png')}
                            alt=''
                          />
                          <h5 className='mb-0 fw-medium viewChildTitle mx-2 '>{item.Quantity}</h5>
                        </div>
                        <div className='d-flex mb-0 align-items-center'>
                          <img
                            className='img-fluid'
                            src={toAbsoluteUrl('/media/vectors/ColorIcon.png')}
                            alt=''
                          />
                          <h5 className='mb-0 mt-0 fw-medium viewChildTitle mx-2 '>{item.Variation?.Value}</h5>
                          <div className='d-flex ms-auto align-items-center   '>
                            <h5 className='mb-0 fw-medium viewChildTitle mx-2 '>₹ {item.Product.Sale_price}</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Order Summary Inner */}

        {/* End of Order Summary Inner */}

        <div className={`row ${isCart ? 'my-10' : 'my-5'}`}>
          <div className='col-lg-12'>
            <div className='headingText'>
              <h1 className='primaryTextBold'>BILLING SUMMARY</h1>
            </div>

            <div className='orderCard'>
              <div className='card my-6'>
                <div className='card-header1 py-6 pb-2'>
                  <h4 className='text-center'>Gift Card / Discount code</h4>
                </div>
                <div className='card-body pb-0'>
                  <div className='promoCodeSection'>
                    <div className='input-group mb-3'>
                      <input
                        type='text'
                        className='applyText form-control'
                        placeholder='Enter coupon code'
                        aria-label="Recipient's username"
                        aria-describedby='button-addon2'
                      />
                      <button
                        className='applyBtn btn btn-outline-secondary'
                        type='button'
                        id='button-addon2'
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className='totalBillSection mt-5'>
                    <div className='d-flex justify-content-between my-3'>
                      <h4 className='text-black fw-normal'>Subtotal</h4>
                      <h3 className='text-black fw-medium'>₹ {subtotal.toFixed(2)}</h3>
                    </div>
                    <div className='d-flex justify-content-between my-3'>
                      <h4 className='text-black fw-normal'>Discount Charge</h4>
                      {/* <h3 className='text-black fw-medium'>₹ {discountamount.toFixed(2)}</h3> */}
                      <h3 className='text-black fw-medium'>₹ 0</h3>
                    </div>
                    <div className='d-flex justify-content-between my-3'>
                      <h4 className='text-black fw-normal'>Shipping Charge</h4>
                      <h3 className='text-black fw-medium'>₹ {shippingCharge.toFixed(2)}</h3>
                    </div>
                  </div>
                </div>
                <div className='card-footer text-muted pt-3'>
                  <div className='d-flex justify-content-between my-3 mt-0 '>
                    <h4 className='text-black fw-medium'>Grand Total</h4>
                    <h3 className='text-black fw-medium'>₹ {grandTotal.toFixed(2)}</h3>
                  </div>
                  <div className='installationChargeSection my-6 '>
                    <h4 className='dangerText text-center'>
                      Installation charges will be applicable.
                    </h4>
                  </div>

                  <div className='checkoutBtnSection d-flex flex-column'>
                    {isCart ? (
                      <button
                        className='primaryBtn btn btn-default my-4'
                        onClick={navigateToCheckout}
                      >
                        Checkout
                      </button>
                    ) : (
                      <button
                        className='primaryBtn btn btn-default my-4'
                        onClick={navigateToOrderConfirmation}
                      >
                        {loading ? 'Placing Order..' : '  Place Order'}

                      </button>
                    )}

                    <button className='primaryOutlineBtn btn btn-default ' onClick={navigateToProdList}>
                      Continue to shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BillingSummaryStyles>
  )
}

export default BillingSummary
