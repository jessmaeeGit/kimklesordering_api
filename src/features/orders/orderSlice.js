import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clearCart } from '../cart/cartSlice';
import { addUser, addOrderToUser } from '../users/usersSlice';

// Mock function to simulate API call
const createOrderAPI = async (orderData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...orderData,
        id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: orderData.status || 'processing',
        orderDate: orderData.orderDate || new Date().toISOString(),
        estimatedDelivery: orderData.estimatedDelivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }, 1000);
  });
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { dispatch, getState }) => {
    try {
      const response = await createOrderAPI(orderData);
      // Clear the cart after successful order
      dispatch(clearCart());
      
      // Add user if they don't exist, or add order to existing user
      if (orderData.customerEmail) {
        const { customerEmail, customerName, ...orderInfo } = orderData;
        dispatch(addUser({ email: customerEmail, name: customerName }));
        dispatch(addOrderToUser({ email: customerEmail, orderId: response.id }));
      }
      
      return response;
    } catch (error) {
      throw new Error('Failed to create order');
    }
  }
);

// Load initial state from localStorage
const loadStateFromStorage = () => {
  try {
    const serializedState = localStorage.getItem('kimkles_orderHistory');
    if (serializedState === null) {
      return { currentOrder: null, status: 'idle', error: null, orderHistory: [] };
    }
    const parsed = JSON.parse(serializedState);
    return { currentOrder: null, status: 'idle', error: null, orderHistory: parsed };
  } catch (err) {
    return { currentOrder: null, status: 'idle', error: null, orderHistory: [] };
  }
};

const orderSlice = createSlice({
  name: 'order',
  initialState: loadStateFromStorage(),
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setOrderStatus: (state, action) => {
      if (state.currentOrder) {
        state.currentOrder.status = action.payload;
      }
    },
    approveOrder: (state, action) => {
      const orderId = action.payload;
      const order = state.orderHistory.find(order => order.id === orderId);
      if (order) {
        // Change status to 'processing' when approved (from pending/paid)
        if (order.status === 'pending' || order.status === 'paid') {
          order.status = 'processing';
        }
      }
      // Also update currentOrder if it matches
      if (state.currentOrder && state.currentOrder.id === orderId) {
        if (state.currentOrder.status === 'pending' || state.currentOrder.status === 'paid') {
          state.currentOrder.status = 'processing';
        }
      }
      // Save to localStorage
      try {
        localStorage.setItem('kimkles_orderHistory', JSON.stringify(state.orderHistory));
      } catch (err) {
        console.error('Failed to save orders to localStorage:', err);
      }
    },
    rejectOrder: (state, action) => {
      const orderId = action.payload;
      const order = state.orderHistory.find(order => order.id === orderId);
      if (order) {
        order.status = 'cancelled';
      }
      if (state.currentOrder && state.currentOrder.id === orderId) {
        state.currentOrder.status = 'cancelled';
      }
      // Save to localStorage
      try {
        localStorage.setItem('kimkles_orderHistory', JSON.stringify(state.orderHistory));
      } catch (err) {
        console.error('Failed to save orders to localStorage:', err);
      }
    },
    completeOrder: (state, action) => {
      const orderId = action.payload;
      const order = state.orderHistory.find(order => order.id === orderId);
      if (order) {
        order.status = 'completed';
      }
      if (state.currentOrder && state.currentOrder.id === orderId) {
        state.currentOrder.status = 'completed';
      }
      // Save to localStorage
      try {
        localStorage.setItem('kimkles_orderHistory', JSON.stringify(state.orderHistory));
      } catch (err) {
        console.error('Failed to save orders to localStorage:', err);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOrder = action.payload;
        state.orderHistory.unshift(action.payload);
        // Save to localStorage
        try {
          localStorage.setItem('kimkles_orderHistory', JSON.stringify(state.orderHistory));
        } catch (err) {
          console.error('Failed to save orders to localStorage:', err);
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { clearCurrentOrder, setOrderStatus, approveOrder, rejectOrder, completeOrder } = orderSlice.actions;

export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectOrderStatus = (state) => state.order.status;
export const selectOrderError = (state) => state.order.error;
export const selectOrderHistory = (state) => state.order.orderHistory;

export default orderSlice.reducer;
