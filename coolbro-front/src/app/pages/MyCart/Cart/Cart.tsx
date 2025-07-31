import { FC, useState, useEffect, } from 'react';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { toAbsoluteUrl } from '../../../../_metronic/helpers';
import { CartStyles } from './CartStyles';
import * as authHelper from '../../../modules/auth/core/AuthHelpers';
import { useAuth } from '../../../modules/auth';
import {
  defaultDeleteErrorConfig,
  defaultDeleteSuccessConfig,
  defaultDeleteConfig,
  defaultFormErrorConfig,
} from '../../../config/sweetAlertConfig';
import { decrement } from '../../../../redux/Slices/cartSlice';

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

interface CartProps {
  orderItems: OrderItem[];
  fetchCartItems: () => void;
  itemQuantities: { [key: number]: number };
  setItemQuantities: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>; // add this line
}

const Cart: FC<CartProps> = ({ orderItems, fetchCartItems, itemQuantities, setItemQuantities }) => {
  const [loading, setLoading] = useState(true);
  const TOKEN = authHelper.getAuth();
  const { currentUser } = useAuth();

  const dispatch = useDispatch();
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(false); // Set loading to false in the initial render
    const initialQuantities: { [key: number]: number } = {};
    orderItems.forEach((item) => {
      initialQuantities[item.ID] = item.Quantity;
    });
    setItemQuantities(initialQuantities);

    setLoading(false); // Set loading to false in the initial render
  }, [orderItems]);// Empty dependency array to run the effect only once

  const deleteCart = async (id: any) => {
    const confirmDelete = await Swal.fire(defaultDeleteConfig);
    if (confirmDelete.isConfirmed) {
      try {
        const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/cart/${id}`, {
          headers: { Authorization: `Bearer ${TOKEN?.AccessToken}` },
        });

        if (response.data.message) {
          console.log("Remove Cart");
          dispatch(decrement());
          fetchCartItems();
          Swal.fire(defaultDeleteSuccessConfig);
        } else {
          Swal.fire(defaultDeleteErrorConfig);
        }
      } catch (error) {
        Swal.fire(defaultDeleteErrorConfig);
        console.error('Delete Brand Error:', error);
      }
    }
  };

  const incrementQuantity = (cartId: number) => {
    const newQuantity = (itemQuantities[cartId] || 0) + 1;
    setItemQuantities({ ...itemQuantities, [cartId]: newQuantity });
    updateCartQuantity(cartId, newQuantity);
  };

  const decrementQuantity = (cartId: number) => {
    const currentQuantity = itemQuantities[cartId] || 0;
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      setItemQuantities({ ...itemQuantities, [cartId]: newQuantity });
      updateCartQuantity(cartId, newQuantity);
    }
  };

  const updateCartQuantity = async (cartId: number, newQuantity: number) => {
    console.log('newQuantity', newQuantity);
    try {
      setLoading(true);
      const cartData = {
        UserID: currentUser ? Number(currentUser.ID) : 0,
        Quantity: newQuantity,
        id: cartId,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/cart/add_update_cart`,
        cartData,
        { headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken } }
      );

      if (response.data.status === "success") {
        console.log("QTY update");
      } else {
        Swal.fire(defaultFormErrorConfig);
      }
    } catch (err) {
      console.error(err);
      Swal.fire(defaultFormErrorConfig);
    } finally {
      setLoading(false);
    }
  };

  const navigateToProdList = (id: any) => {
    navigate('/product-details/' + id)
  }

  return (
    <CartStyles>
      <section>
        <div className='row my-10'>
          <div className='col-lg-12'>
            <div className='headingText'>
              <h1 className='primaryTextBold'>My Shopping Bag</h1>
            </div>
            <div className='productCard'>
              {orderItems.map((item, index) => (
                <div className='card bg-white my-6' key={item.ID}>
                  <div className='card-horizontal mobileFlexColumn'>
                    <div className='navbarMarginForSearch img-square-wrapper'>
                      <div className='p-5'>
                        <div className='contentAround commonBGMain'>
                          <img
                            className='img-fluid ACImageCommon'
                            src={toAbsoluteUrl('/media/vectors/BGCommonPortraitImage.png')}
                            alt='Card cap'
                          />
                          <div className='commonBGACMain'>
                            <img
                              className='img-fluid ACImageCommon'
                              src={item.ProductMedia?.Media_url}
                              alt=''
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='card-body p-8 pe-10'>
                      <h2 className='card-title primaryTextBold pointer' onClick={() => navigateToProdList(item.ProductID)}>{item.Product.Name}</h2>
                      <p className='card-text pb-5 d-flex align-items-center primaryTextBold my-5'>
                        SKU: {item.Product.SKU_number}
                      </p>
                      <div className='my-5'>
                        <div className='d-flex'>
                          {item.Variation?.Value && (
                            <div className=' mobileFlexColumn'>
                              <h3 className='card-title primaryTextBold my-5'>Color</h3>
                              <div className='innerColorVariant d-flex mt-3'>
                                <div className='mx-3 ms-0'>
                                  <div
                                    className='outerVariantActive'
                                    style={{ backgroundColor: item.Variation.Value }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className={`d-flex align-items-baseline ${item.Variation?.Value ? 'm-auto' : ''} flex-column mobileFlexColumn`}>
                            <h3 className='card-title primaryTextBold my-5'>Quantity</h3>
                            <div className='innerColorVariant d-flex align-items-center'>
                              <div className='mx-1 ms-0'>
                                <div
                                  className='incrementBtn'
                                  onClick={() => decrementQuantity(item.ID)}
                                >
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                  >
                                    <rect x='5' y='12' width='14' height='2' fill='#99A1B7' />
                                  </svg>
                                </div>
                              </div>
                              <div className='px-3'>{itemQuantities[item.ID] || item.Quantity}</div>
                              <div className='mx-1'>
                                <div
                                  className='incrementBtn'
                                  onClick={() => incrementQuantity(item.ID)}
                                >
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                  >
                                    <g clipPath='url(#clip0_762_13207)'>
                                      <path
                                        fillRule='evenodd'
                                        clipRule='evenodd'
                                        d='M11 5V11H5V13H11V19H13V13H19V11H13V5H11Z'
                                        fill='#99A1B7'
                                      />
                                    </g>
                                    <defs>
                                      <clipPath id='clip0_762_13207'>
                                        <rect width='24' height='24' fill='white' />
                                      </clipPath>
                                    </defs>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='row border-top border-top-2 '>
                        <div className='col-lg-12 ps-3 d-flex justify-content-center'>
                          <span className='w-auto ps-0 btn btn-default mt-4 d-flex align-items-center mobilePaddingNone'>
                            <img
                              className='img-fluid'
                              src={toAbsoluteUrl('/media/vectors/DeleteAction.png')}
                              alt=''
                            />{' '}
                            <div
                              className='ms-2 mt-1 fw-medium'
                              onClick={() => deleteCart(item.ID)}
                            >
                              Remove
                            </div>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </CartStyles>
  );
};

export default Cart;
