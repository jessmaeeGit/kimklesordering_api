import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data - in a real app, this would come from an API
const initialProducts = [
  {
    id: '1',
    name: 'Biscoff Lava',
    description: 'Delicious biscoff cookie with creamy lava center',
    price: 45.99,
    category: 'cookies',
    image: '/images/Biscoff Lava.png',
    inStock: true,
  },
  {
    id: '2',
    name: 'Kimkles Creamcheese',
    description: 'Perfectly baked Kimkles with smooth cream cheese frosting',
    price: 25.99,
    category: 'cookies',
    image: '/images/Kimkles Creamcheese.png',
    inStock: true,
  },
  {
    id: '3',
    name: 'Red Velvet Creamcheese',
    description: 'Moist red velvet Kimkles with cream cheese frosting',
    price: 45.49,
    category: 'cookies',
    image: '/images/Redvelvet Creamcheese.png',
    inStock: true,
  },
  {
    id: '4',
    name: 'Plain Kimkles',
    description: 'Classic Kimkles cookie, simple and delicious',
    price: 12.99,
    category: 'cookies',
    image: '/images/Plain Kimkles.png',
    inStock: true,
  },
];

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.get('/api/products');
      // return response.data;
      
      // Simulate API call with timeout
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(initialProducts);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Load initial state from localStorage
const loadProductsFromStorage = () => {
  try {
    const serializedState = localStorage.getItem('kimkles_products');
    if (serializedState === null) {
      return { items: [], status: 'idle', error: null, categories: ['all', 'cookies', 'brownies', 'cupcakes'], selectedCategory: 'all' };
    }
    return { items: JSON.parse(serializedState), status: 'idle', error: null, categories: ['all', 'cookies', 'brownies', 'cupcakes'], selectedCategory: 'all' };
  } catch (err) {
    return { items: [], status: 'idle', error: null, categories: ['all', 'cookies', 'brownies', 'cupcakes'], selectedCategory: 'all' };
  }
};

const productsSlice = createSlice({
  name: 'products',
  initialState: loadProductsFromStorage(),
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    addProduct: (state, action) => {
      const newProduct = {
        ...action.payload,
        id: action.payload.id || String(Date.now()),
        inStock: action.payload.inStock !== undefined ? action.payload.inStock : true,
      };
      state.items.push(newProduct);
      // Save to localStorage
      try {
        localStorage.setItem('kimkles_products', JSON.stringify(state.items));
      } catch (err) {
        console.error('Failed to save products to localStorage:', err);
      }
    },
    updateProduct: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(product => product.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
        // Save to localStorage
        try {
          localStorage.setItem('kimkles_products', JSON.stringify(state.items));
        } catch (err) {
          console.error('Failed to save products to localStorage:', err);
        }
      }
    },
    deleteProduct: (state, action) => {
      state.items = state.items.filter(product => product.id !== action.payload);
      // Save to localStorage
      try {
        localStorage.setItem('kimkles_products', JSON.stringify(state.items));
      } catch (err) {
        console.error('Failed to save products to localStorage:', err);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        // Save to localStorage
        try {
          localStorage.setItem('kimkles_products', JSON.stringify(state.items));
        } catch (err) {
          console.error('Failed to save products to localStorage:', err);
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setSelectedCategory, addProduct, updateProduct, deleteProduct } = productsSlice.actions;

export const selectAllProducts = (state) => {
  const { items, selectedCategory } = state.products;
  if (selectedCategory === 'all') return items;
  return items.filter(product => product.category === selectedCategory);
};

export const selectProductById = (state, productId) =>
  state.products.items.find(product => product.id === productId);

export const selectProductsStatus = (state) => state.products.status;
export const selectProductsError = (state) => state.products.error;
export const selectCategories = (state) => state.products.categories;
export const selectSelectedCategory = (state) => state.products.selectedCategory;

export default productsSlice.reducer;
