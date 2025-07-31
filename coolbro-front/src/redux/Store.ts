import { configureStore } from "@reduxjs/toolkit";
import cartReducer, {  fetchCartItemCount} from "./Slices/cartSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

store.dispatch(fetchCartItemCount());

export default store;