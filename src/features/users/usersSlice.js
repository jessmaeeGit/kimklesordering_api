import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadUsersFromStorage = () => {
  try {
    const serializedState = localStorage.getItem('kimkles_users');
    if (serializedState === null) {
      return { items: [] };
    }
    return { items: JSON.parse(serializedState) };
  } catch (err) {
    return { items: [] };
  }
};

const usersSlice = createSlice({
  name: 'users',
  initialState: loadUsersFromStorage(),
  reducers: {
    addUser: (state, action) => {
      const { email, name, ...otherData } = action.payload;
      
      // Check if user already exists
      const existingUserIndex = state.items.findIndex(user => user.email === email);
      
      if (existingUserIndex === -1) {
        // Add new user
        const newUser = {
          id: action.payload.id || String(Date.now()),
          email,
          name: name || email.split('@')[0],
          orders: [],
          createdAt: new Date().toISOString(),
          ...otherData,
        };
        state.items.push(newUser);
        // Save to localStorage
        try {
          localStorage.setItem('kimkles_users', JSON.stringify(state.items));
        } catch (err) {
          console.error('Failed to save users to localStorage:', err);
        }
      }
    },
    updateUser: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(user => user.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
        // Save to localStorage
        try {
          localStorage.setItem('kimkles_users', JSON.stringify(state.items));
        } catch (err) {
          console.error('Failed to save users to localStorage:', err);
        }
      }
    },
    addOrderToUser: (state, action) => {
      const { email, orderId } = action.payload;
      const user = state.items.find(u => u.email === email);
      
      if (user) {
        // Add order ID if not already present
        if (!user.orders.includes(orderId)) {
          user.orders.push(orderId);
        }
      } else {
        // Create new user with this order if they don't exist
        state.items.push({
          id: String(Date.now()),
          email,
          name: email.split('@')[0],
          orders: [orderId],
          createdAt: new Date().toISOString(),
        });
      }
      // Save to localStorage
      try {
        localStorage.setItem('kimkles_users', JSON.stringify(state.items));
      } catch (err) {
        console.error('Failed to save users to localStorage:', err);
      }
    },
    deleteUser: (state, action) => {
      state.items = state.items.filter(user => user.id !== action.payload);
      // Save to localStorage
      try {
        localStorage.setItem('kimkles_users', JSON.stringify(state.items));
      } catch (err) {
        console.error('Failed to save users to localStorage:', err);
      }
    },
  },
});

export const { addUser, updateUser, addOrderToUser, deleteUser } = usersSlice.actions;

export const selectAllUsers = (state) => state.users.items;
export const selectUserById = (state, userId) =>
  state.users.items.find(user => user.id === userId);
export const selectUserByEmail = (state, email) =>
  state.users.items.find(user => user.email === email);

export default usersSlice.reducer;
