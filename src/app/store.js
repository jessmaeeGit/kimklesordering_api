import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/cartSlice';
import productsReducer from '../features/products/productsSlice';
import orderReducer from '../features/orders/orderSlice';
import usersReducer from '../features/users/usersSlice';
import adminReducer from '../features/admin/adminSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productsReducer,
    order: orderReducer,
    users: usersReducer,
    admin: adminReducer,
  },
});
