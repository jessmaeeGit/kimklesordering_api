import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaHome, FaShoppingBag, FaClock, FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import { selectOrderHistory } from '../features/orders/orderSlice';
import { format } from 'date-fns';

const OrdersContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 5%;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #8B4513;
  margin: 0;
  font-size: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BackButton = styled.button`
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #A0522D;
  }
`;

const OrdersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
`;

const OrderDate = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  margin-top: 0.5rem;
  
  ${props => {
    const status = props.status?.toLowerCase();
    if (status === 'completed') return 'background: #d4edda; color: #155724;';
    if (status === 'processing') return 'background: #fff3cd; color: #856404;';
    if (status === 'paid') return 'background: #d1ecf1; color: #0c5460;';
    if (status === 'cancelled') return 'background: #f8d7da; color: #721c24;';
    return 'background: #f8d7da; color: #721c24;'; // Default
  }}
`;

const OrderDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const OrderTotal = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #8B4513;
`;

const ViewButton = styled.button`
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #A0522D;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  svg {
    font-size: 4rem;
    color: #ccc;
    margin-bottom: 1rem;
  }

  h3 {
    color: #666;
    margin-bottom: 0.5rem;
  }

  p {
    color: #999;
  }
`;

const ItemsCount = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
`;

const MyOrders = () => {
  const navigate = useNavigate();
  const orders = useSelector(selectOrderHistory);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Filter orders for current user (if email matches)
  const userOrders = orders.filter(order => 
    order.customerEmail === user.email
  );

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed') return <FaCheckCircle />;
    if (s === 'cancelled') return <FaTimesCircle />;
    return <FaClock />;
  };

  return (
    <OrdersContainer>
      <PageHeader>
        <Title>
          <FaShoppingBag /> My Orders
        </Title>
        <BackButton onClick={() => navigate('/')}>
          <FaHome /> Back to Home
        </BackButton>
      </PageHeader>

      {userOrders.length === 0 ? (
        <EmptyState>
          <FaShoppingBag />
          <h3>No Orders Yet</h3>
          <p>Start shopping to see your orders here!</p>
        </EmptyState>
      ) : (
        <OrdersGrid>
          {userOrders.map(order => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <div>
                  <OrderNumber>Order #{order.id}</OrderNumber>
                  <OrderDate>
                    {order.orderDate 
                      ? format(new Date(order.orderDate), 'MMM d, yyyy') 
                      : 'Recently'}
                  </OrderDate>
                </div>
              </OrderHeader>

              <div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Items: {order.items ? order.items.length : 0}
                </div>
                <ItemsCount>
                  {order.items && order.items.length > 0 && (
                    <span>
                      {order.items.slice(0, 2).map(item => item.name).join(', ')}
                      {order.items.length > 2 && '...'}
                    </span>
                  )}
                </ItemsCount>
              </div>

              <StatusBadge status={order.status}>
                {getStatusIcon(order.status)}
                {order.status || 'Processing'}
              </StatusBadge>

              <OrderDetails>
                <OrderTotal>₱{(order.total || order.amount || 0).toFixed(2)}</OrderTotal>
                <ViewButton onClick={() => navigate(`/track-order/${order.id}`)}>
                  <FaEye /> View
                </ViewButton>
              </OrderDetails>
            </OrderCard>
          ))}
        </OrdersGrid>
      )}
    </OrdersContainer>
  );
};

export default MyOrders;

