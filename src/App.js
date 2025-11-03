import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import styled from 'styled-components';
import { store } from './app/store';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Register from './pages/Register';
import Login from './pages/Login';
import MyOrders from './pages/MyOrders';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import './App.css';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem 5%;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const paypalOptions = {
  'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID,
  currency: 'PHP',
  intent: 'capture',
  components: 'buttons'
};

function App() {
  return (
    <Provider store={store}>
      <PayPalScriptProvider options={paypalOptions}>
        <Router>
          <Routes>
            {/* Admin Routes - Full page without user Navbar/Footer */}
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="users" element={<Users />} />
            </Route>
            
            {/* User Routes - With Navbar and Footer */}
            <Route path="/*" element={
              <AppContainer>
                <Navbar />
                <MainContent>
                  <Outlet />
                </MainContent>
                <Footer />
              </AppContainer>
            }>
              <Route index element={<Home />} />
              <Route path="menu" element={<Menu />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="track-order/:orderId" element={<OrderTracking />} />
              <Route path="my-orders" element={<MyOrders />} />
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
            </Route>
          </Routes>
        </Router>
      </PayPalScriptProvider>
    </Provider>
  );
}

export default App;
