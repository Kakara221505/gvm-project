import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authHelper from '../../app/modules/auth/core/AuthHelpers';
interface CartState {
  cartItemCount: number;
}

const initialState: CartState = {
  cartItemCount: 0,
};

// Create an async thunk to fetch initial value from the API
export const fetchCartItemCount = createAsyncThunk('cart/fetchCartItemCount', async (_, { dispatch }) => {
  const TOKEN = authHelper.getAuth();
  if (!TOKEN) return 0;
  const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/cart/cart_item_count`, {
    headers: { Authorization: `Bearer ${TOKEN?.AccessToken}` },
  });
  const data = await response.json();
  return data.status ? data.count : 0;
});


const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    increment: (state) => {
      state.cartItemCount += 1;
    },
    decrement: (state) => {
      state.cartItemCount -= 1;
    },
    addToCart: (state, action) => {
      state.cartItemCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCartItemCount.fulfilled, (state, action) => {
      state.cartItemCount = action.payload;
    });
  },
});

export const { increment, decrement, addToCart } = cartSlice.actions;
export const selectCartItems = (state: { cart: CartState }) => state.cart.cartItemCount;

export const cartAsyncActions = {
  fetchCartItemCount
};

export default cartSlice.reducer;
