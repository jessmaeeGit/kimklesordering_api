import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FaSearch, FaTrash, FaEdit, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import { selectOrderHistory, approveOrder, rejectOrder, completeOrder } from '../../features/orders/orderSlice';
import { format } from 'date-fns';

const OrdersContainer = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin: 0;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  width: 300px;

  input {
    border: none;
    background: transparent;
    padding: 0.5rem;
    width: 100%;
    outline: none;
  }

  svg {
    color: #666;
    margin-right: 0.5rem;
  }
`;

const StatusFilter = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  margin-left: 1rem;
`;

const OrderTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #555;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover {
    background: #f9f9f9;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${props => {
    const status = props.status?.toLowerCase();
    if (status === 'completed') return '#d4edda';
    if (status === 'processing') return '#fff3cd';
    if (status === 'paid') return '#d1ecf1';
    if (status === 'cancelled') return '#f8d7da';
    return '#f8d7da'; // Default for pending/other
  }};
  color: ${props => {
    const status = props.status?.toLowerCase();
    if (status === 'completed') return '#155724';
    if (status === 'processing') return '#856404';
    if (status === 'paid') return '#0c5460';
    if (status === 'cancelled') return '#721c24';
    return '#721c24'; // Default for pending/other
  }};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  margin: 0 0.25rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #333;
    background: #f0f0f0;
  }
  
  &.approve {
    color: #27ae60;
    
    &:hover {
      background: #d4edda;
      color: #155724;
    }
  }
  
  &.reject {
    color: #e74c3c;
    
    &:hover {
      background: #f8d7da;
      color: #721c24;
    }
  }
  
  &.complete {
    color: #3498db;
    
    &:hover {
      background: #d4edda;
      color: #155724;
    }
  }
`;

const Orders = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrderHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Transform orders for display
  const transformedOrders = orders.map(order => ({
    id: order.id,
    customer: order.customerName || order.customerEmail || 'Guest',
    email: order.customerEmail,
    date: order.orderDate ? format(new Date(order.orderDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    status: order.status || 'processing',
    total: order.total || order.amount || 0,
    items: order.items ? order.items.length : 0,
    orderData: order, // Keep full order data for reference
  }));

  const filteredOrders = transformedOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      order.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Handle order approval
  const handleApproveOrder = (orderId) => {
    if (window.confirm('Are you sure you want to approve this order?')) {
      dispatch(approveOrder(orderId));
    }
  };

  // Handle order rejection
  const handleRejectOrder = (orderId) => {
    if (window.confirm('Are you sure you want to reject this order? This action cannot be undone.')) {
      dispatch(rejectOrder(orderId));
    }
  };

  // Handle order completion
  const handleCompleteOrder = async (orderId) => {
    if (window.confirm('Mark this order as completed? This will send a notification email to the customer.')) {
      // Find the order data
      const order = orders.find(o => o.id === orderId);
      
      if (!order) {
        alert('Order not found');
        return;
      }

      // Dispatch the completion action
      dispatch(completeOrder(orderId));

      // Send completion notification
      if (order.customerEmail) {
        try {
          const API_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
          
          const response = await fetch(`${API_URL}/api/notify-order-completion`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: order.id,
              amount: order.total || order.amount || 0,
              customerEmail: order.customerEmail,
              customerName: order.customerName || order.customerEmail.split('@')[0],
              customerPhone: order.customerPhone || order.phone || '',
              items: order.items || [],
            }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Completion notification sent:', result);
            alert('Order marked as completed! Customer has been notified via email.');
          } else {
            const error = await response.json();
            console.error('❌ Failed to send completion notification:', error);
            alert('Order marked as completed, but failed to send notification email. Please notify the customer manually.');
          }
        } catch (error) {
          console.error('Error sending completion notification:', error);
          alert('Order marked as completed, but failed to send notification email. Please notify the customer manually.');
        }
      } else {
        alert('Order marked as completed! (No customer email available for notification)');
      }
    }
  };

  // Check if order can be approved
  const canApprove = (status) => {
    const s = status?.toLowerCase();
    return s === 'pending' || s === 'paid';
  };

  // Check if order can be completed
  const canComplete = (status) => {
    const s = status?.toLowerCase();
    return s === 'processing';
  };

  return (
    <OrdersContainer>
      <Header>
        <Title>Orders</Title>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SearchBar>
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
          <StatusFilter 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </StatusFilter>
        </div>
      </Header>

      <OrderTable>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Items</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.date}</td>
              <td>
                <StatusBadge status={order.status.toLowerCase()}>
                  {order.status}
                </StatusBadge>
              </td>
              <td>{order.items}</td>
              <td>₱{order.total.toFixed(2)}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {canApprove(order.status) && (
                    <ActionButton 
                      className="approve" 
                      title="Approve Order" 
                      onClick={() => handleApproveOrder(order.id)}
                    >
                      <FaCheck /> Approve
                    </ActionButton>
                  )}
                  {canComplete(order.status) && (
                    <ActionButton 
                      className="complete" 
                      title="Complete Order" 
                      onClick={() => handleCompleteOrder(order.id)}
                    >
                      <FaCheck /> Complete
                    </ActionButton>
                  )}
                  {(order.status === 'pending' || order.status === 'paid' || order.status === 'processing') && (
                    <ActionButton 
                      className="reject" 
                      title="Reject Order" 
                      onClick={() => handleRejectOrder(order.id)}
                    >
                      <FaTimes /> Reject
                    </ActionButton>
                  )}
                  <ActionButton title="View Order">
                    <FaEye />
                  </ActionButton>
                  <ActionButton title="Edit Order">
                    <FaEdit />
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </OrderTable>
      
      {filteredOrders.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: 'white', 
          borderRadius: '8px',
          marginTop: '1rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1rem' }}>
            No orders found
          </p>
          <p style={{ color: '#999' }}>
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Orders will appear here once customers place them'}
          </p>
        </div>
      )}
    </OrdersContainer>
  );
};

export default Orders;
