import { FC, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { useAuth } from '../../modules/auth';
import * as authHelper from '../../modules/auth/core/AuthHelpers';
import { addToCart } from '../../../redux/Slices/cartSlice';
import Cart from './Cart/Cart';
import BillingSummary from '../CommonComponents/BillingSummary/BillingSummary';
import EmptyCart from './EmptyCart/EmptyCart';
import { MyCartStyles } from './MyCartStyles';

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

const MyCart: FC = () => {
  const { logout } = useAuth()
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const TOKEN = authHelper.getAuth();
  const dispatch = useDispatch();
  const [itemQuantities, setItemQuantities] = useState<{ [key: number]: number }>({});

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/cart/get_cart_with_pagination`, {
        headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
      });

      if (response.data.data) {
        console.log("update");
        setCartItems(response.data.data);
        dispatch(addToCart(response.data.data.length));
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        logout();
      }
    } finally {
      setLoading(false); // Set loading to false regardless of success or error
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);


  return (
    <MyCartStyles>
      <section>
        <div className='mobilePaddingNew container-fluid px-20'>

            <div className='row'>
              {loading ? (
                <p>Loading cart...</p>
              ) : cartItems.length > 0 ? (
                <>
                  <div className='col-lg-8'>
                    <Cart
                      orderItems={cartItems}
                      fetchCartItems={fetchCartItems}
                      itemQuantities={itemQuantities}
                      setItemQuantities={setItemQuantities} // pass the setter function
                    />
                  </div>
                  <div className='col-lg-4'>
                    <BillingSummary orderItems={cartItems} isCart={true} itemQuantities={itemQuantities} />
                  </div>
                </>
              ) : (
                <div className='col-lg-12'>
                  <EmptyCart />
                </div>
              )}
            </div>
        </div>
      </section>
    </MyCartStyles>
  );
};

export default MyCart;
