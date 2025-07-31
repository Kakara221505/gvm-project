import { FC, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { useAuth } from '../../modules/auth';
import { addToCart } from '../../../redux/Slices/cartSlice';
import { CheckoutStyles } from './CheckoutStyles';
import OrderDetail from './OrderDetail/OrderDetail';
import BillingSummary from '../CommonComponents/BillingSummary/BillingSummary';
import * as authHelper from '../../modules/auth/core/AuthHelpers';
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

const Checkout: FC = () => {

  const { logout } = useAuth()
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const TOKEN = authHelper.getAuth();
  const dispatch = useDispatch();

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/cart/get_cart_with_pagination`, {
        headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
      });

      if (response.data.data) {
        console.log(response.data.data);
        setCartItems(response.data.data);
        dispatch(addToCart(response.data.data.length));
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        logout();
      }
    } finally { }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <CheckoutStyles>
      <section>
        <div className='container-fluid px-20'>
          <div className='app-container'>
            <div className='row'>
              <div className='col-lg-8'>
                <OrderDetail />
              </div>
              <div className='col-lg-4'>
                <BillingSummary orderItems={cartItems} isCart={false} itemQuantities={{}} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </CheckoutStyles>
  );
};

export default Checkout;
