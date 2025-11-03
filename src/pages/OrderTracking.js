import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaCheckCircle, FaTruck, FaBoxOpen, FaHome } from 'react-icons/fa';
import { selectOrderHistory } from '../features/orders/orderSlice';

const OrderTrackingContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 5%;
`;

const OrderHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    color: #8B4513;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
    font-size: 1.1rem;
  }
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const OrderInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  div {
    h3 {
      color: #8B4513;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    p {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
    }
  }
`;

const StatusTimeline = styled.div`
  position: relative;
  padding: 1rem 0 2rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 30px;
    height: 100%;
    width: 2px;
    background: #E0D6C9;
    z-index: 1;
  }
`;

const StatusItem = styled.div`
  position: relative;
  padding-left: 70px;
  margin-bottom: 2rem;
  z-index: 2;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 24px;
    top: 0;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${props => props.active ? '#8B4513' : '#E0D6C9'};
    z-index: 3;
  }
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: ${props => props.active ? '#333' : '#999'};
    font-size: 1.1rem;
  }
  
  p {
    margin: 0;
    color: ${props => props.active ? '#666' : '#999'};
    font-size: 0.95rem;
  }
  
  svg {
    position: absolute;
    left: 20px;
    top: -2px;
    font-size: 1.5rem;
    color: ${props => props.active ? '#8B4513' : '#E0D6C9'};
  }
`;

const OrderItems = styled.div`
  margin-top: 3rem;
  
  h2 {
    color: #8B4513;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }
`;

const OrderItem = styled.div`
  display: flex;
  padding: 1rem 0;
  border-bottom: 1px solid #EEE;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.div`
  width: 80px;
  height: 80px;
  background: #F5F5F5;
  border-radius: 4px;
  margin-right: 1.5rem;
  background-image: ${props => props.image ? `url(${props.image})` : 'none'};
  background-size: cover;
  background-position: center;
`;

const ItemDetails = styled.div`
  flex: 1;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.1rem;
  }
  
  p {
    margin: 0;
    color: #666;
  }
`;

const ItemPrice = styled.div`
  font-weight: bold;
  color: #8B4513;
  text-align: right;
  
  .quantity {
    display: block;
    font-size: 0.9rem;
    color: #999;
    font-weight: normal;
  }
`;

const BackToHome = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #8B4513;
  text-decoration: none;
  margin-top: 2rem;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Mock order data - in a real app, this would come from an API
const mockOrder = (orderId) => ({
  id: orderId,
  orderDate: new Date().toISOString(),
  status: 'shipped', // 'processing', 'shipped', 'delivered', 'cancelled'
  estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  items: [
    {
      id: '1',
      name: 'Chocolate Chip Cookie',
      price: 2.99,
      quantity: 2,
      image: '/images/cookie-chocolate-chip.jpg'
    },
    {
      id: '2',
      name: 'Double Chocolate Brownie',
      price: 3.99,
      quantity: 1,
      image: '/images/brownie-double-chocolate.jpg'
    }
  ],
  subtotal: 9.97,
  discount: 1.50,
  shipping: 0,
  total: 8.47,
  shippingAddress: {
    name: 'John Doe',
    street: '123 Bakery Lane',
    city: 'Sweetville',
    state: 'CA',
    zipCode: '90210',
    country: 'United States'
  },
  paymentMethod: 'PayPal',
  trackingNumber: '1Z999AA1234567890',
  carrier: 'USPS'
});

const OrderTracking = () => {
  const { orderId } = useParams();
  const orderHistory = useSelector(selectOrderHistory);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Try to find the order in the order history first
    const foundOrder = orderHistory.find(o => o.id === orderId);
    
    if (foundOrder) {
      setOrder(foundOrder);
      setLoading(false);
    } else {
      // Fallback to mock data if order not found in history
      // This handles page refreshes or direct navigation
      const orderData = mockOrder(orderId);
      setOrder(orderData);
      setLoading(false);
    }
  }, [orderId, orderHistory]);
  
  if (loading) {
    return (
      <OrderTrackingContainer>
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Loading order details...</h2>
        </div>
      </OrderTrackingContainer>
    );
  }
  
  if (!order) {
    return (
      <OrderTrackingContainer>
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Order not found</h2>
          <p>We couldn't find an order with ID: {orderId}</p>
          <BackToHome to="/">
            <FaHome /> Back to Home
          </BackToHome>
        </div>
      </OrderTrackingContainer>
    );
  }
  
  const getStatusSteps = () => {
    const statuses = [
      { 
        id: 'processing', 
        title: 'Order Placed', 
        description: 'Your order has been received',
        icon: <FaCheckCircle />
      },
      { 
        id: 'shipped', 
        title: 'Shipped', 
        description: 'Your order is on the way',
        icon: <FaTruck />
      },
      { 
        id: 'delivered', 
        title: 'Delivered', 
        description: 'Your order has been delivered',
        icon: <FaBoxOpen />
      }
    ];
    
    // Map 'paid' status to 'processing' for timeline display
    const displayStatus = order.status === 'paid' ? 'processing' : order.status;
    const currentStatusIndex = statuses.findIndex(s => s.id === displayStatus);
    
    return statuses.map((status, index) => ({
      ...status,
      active: index <= currentStatusIndex
    }));
  };
  
  const statusSteps = getStatusSteps();
  const deliveryDate = new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Handle different address formats (from checkout formData vs shippingAddress object)
  const getShippingAddress = () => {
    if (order.shippingAddress) {
      return order.shippingAddress;
    }
    
    // Format from checkout formData
    return {
      name: order.fullName || 'N/A',
      street: order.address || 'N/A',
      city: 'N/A',
      state: 'N/A',
      zipCode: 'N/A',
      country: 'Philippines'
    };
  };
  
  const shippingAddress = getShippingAddress();

  return (
    <OrderTrackingContainer>
      <OrderHeader>
        <h1>Order #{order.id}</h1>
        <p>Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
      </OrderHeader>
      
      <OrderCard>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#8B4513' }}>Order Status</h2>
        
        <StatusTimeline>
          {statusSteps.map((step) => (
            <StatusItem key={step.id} active={step.active}>
              {step.icon}
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </StatusItem>
          ))}
        </StatusTimeline>
        
        <OrderInfo>
          <div>
            <h3>Estimated Delivery</h3>
            <p>{deliveryDate}</p>
          </div>
          
          <div>
            <h3>Shipping To</h3>
            <p>{shippingAddress.name}</p>
            <p>{shippingAddress.street}</p>
            <p>{shippingAddress.city !== 'N/A' ? `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}` : ''}</p>
            <p>{shippingAddress.country}</p>
          </div>
          
          <div>
            <h3>Payment Method</h3>
            <p>{order.paymentMethod || 'PayPal'}</p>
            {order.deliveryInstructions && (
              <p><small>Instructions: {order.deliveryInstructions}</small></p>
            )}
          </div>
        </OrderInfo>
      </OrderCard>
      
      <OrderCard>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#8B4513' }}>Order Summary</h2>
        
        <OrderItems>
          {order.items.map((item) => (
            <OrderItem key={item.id}>
              <ItemImage image={item.image} />
              <ItemDetails>
                <h3>{item.name}</h3>
                <p>Quantity: {item.quantity}</p>
              </ItemDetails>
              <ItemPrice>
                ₱{(item.price * item.quantity).toFixed(2)}
                <span className="quantity">₱{item.price.toFixed(2)} each</span>
              </ItemPrice>
            </OrderItem>
          ))}
          
          <div style={{ marginTop: '2rem', borderTop: '1px solid #EEE', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal</span>
              <span>₱{order.subtotal.toFixed(2)}</span>
            </div>
            
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'green' }}>
                <span>Discount</span>
                <span>-₱{order.discount.toFixed(2)}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'Free' : `₱${order.shipping.toFixed(2)}`}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #EEE', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <span>Total</span>
              <span>₱{order.total.toFixed(2)}</span>
            </div>
            
            {order.paymentMethod && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
              </div>
            )}
          </div>
        </OrderItems>
      </OrderCard>
      
      <BackToHome to="/">
        <FaHome /> Back to Home
      </BackToHome>
    </OrderTrackingContainer>
  );
};

export default OrderTracking;
