import { createSlice } from '@reduxjs/toolkit';

// Default admin account
const defaultAdmin = {
  id: 'admin-1',
  email: 'admin@kimkles.com',
  password: 'admin123', // In production, this should be hashed
  name: 'Admin User',
  role: 'admin',
};

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    accounts: [defaultAdmin],
    currentAdmin: null,
    isAuthenticated: false,
  },
  reducers: {
    addAdmin: (state, action) => {
      const { email, password, name } = action.payload;
      // Check if admin already exists
      const existingAdmin = state.accounts.find(admin => admin.email === email);
      if (!existingAdmin) {
        const newAdmin = {
          id: `admin-${Date.now()}`,
          email,
          password, // In production, this should be hashed
          name: name || 'Admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        state.accounts.push(newAdmin);
      }
    },
    loginAdmin: (state, action) => {
      const { email, password } = action.payload;
      const admin = state.accounts.find(
        admin => admin.email === email && admin.password === password
      );
      
      if (admin) {
        state.currentAdmin = {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
        state.isAuthenticated = true;
      }
    },
    logoutAdmin: (state) => {
      state.currentAdmin = null;
      state.isAuthenticated = false;
    },
    setCurrentAdmin: (state, action) => {
      state.currentAdmin = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
});

export const { addAdmin, loginAdmin, logoutAdmin, setCurrentAdmin } = adminSlice.actions;

export const selectAdminAccounts = (state) => state.admin.accounts;
export const selectCurrentAdmin = (state) => state.admin.currentAdmin;
export const selectIsAdminAuthenticated = (state) => state.admin.isAuthenticated;

export default adminSlice.reducer;

