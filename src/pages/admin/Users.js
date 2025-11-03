import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaSearch, FaEdit, FaTrash, FaUser, FaEnvelope, FaShoppingCart, FaCalendarAlt } from 'react-icons/fa';
import { selectAllUsers } from '../../features/users/usersSlice';
import { selectOrderHistory } from '../../features/orders/orderSlice';
import { format } from 'date-fns';

const UsersContainer = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
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

  @media (max-width: 768px) {
    width: 100%;
  }

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

const UsersTable = styled.table`
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
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
    
    th, td {
      padding: 0.75rem 0.5rem;
    }
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B5E3C, #A67C52);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
`;

const UserDetails = styled.div`
  .name {
    font-weight: 500;
    color: #333;
    margin-bottom: 0.25rem;
  }
  
  .email {
    font-size: 0.875rem;
    color: #666;
  }
`;

const OrderCount = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #8B5E3C;
  font-weight: 500;
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
  
  &.delete:hover {
    color: #e74c3c;
    background: #fee;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  margin-top: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  p {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 1rem;
  }
  
  .subtitle {
    color: #999;
    font-size: 0.9rem;
  }
`;

const Users = () => {
  const users = useSelector(selectAllUsers);
  const orders = useSelector(selectOrderHistory);
  const [searchTerm, setSearchTerm] = useState('');

  // Get order count for each user
  const getUserOrderCount = (userEmail) => {
    return orders.filter(order => order.customerEmail === userEmail).length;
  };

  // Get total spent for each user
  const getUserTotalSpent = (userEmail) => {
    return orders
      .filter(order => order.customerEmail === userEmail)
      .reduce((sum, order) => sum + (order.total || order.amount || 0), 0);
  };

  // Transform users with additional data
  const usersWithStats = users.map(user => ({
    ...user,
    orderCount: getUserOrderCount(user.email),
    totalSpent: getUserTotalSpent(user.email),
  }));

  // Filter users by search term
  const filteredUsers = usersWithStats.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  return (
    <UsersContainer>
      <Header>
        <Title>Users</Title>
        <SearchBar>
          <FaSearch />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </Header>

      {filteredUsers.length > 0 ? (
        <UsersTable>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <UserInfo>
                    <UserAvatar>
                      {getUserInitials(user.name)}
                    </UserAvatar>
                    <UserDetails>
                      <div className="name">{user.name}</div>
                      <div className="email">{user.email}</div>
                    </UserDetails>
                  </UserInfo>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaEnvelope style={{ color: '#999', fontSize: '0.875rem' }} />
                    {user.email}
                  </div>
                </td>
                <td>
                  <OrderCount>
                    <FaShoppingCart />
                    {user.orderCount}
                  </OrderCount>
                </td>
                <td>₱{user.totalSpent.toFixed(2)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaCalendarAlt style={{ color: '#999', fontSize: '0.875rem' }} />
                    {formatDate(user.createdAt)}
                  </div>
                </td>
                <td>
                  <ActionButton title="View User">
                    <FaUser />
                  </ActionButton>
                  <ActionButton title="Edit User">
                    <FaEdit />
                  </ActionButton>
                  <ActionButton title="Delete User" className="delete">
                    <FaTrash />
                  </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </UsersTable>
      ) : (
        <EmptyState>
          <p>No users found</p>
          <p className="subtitle">
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'Users will appear here once they register'}
          </p>
        </EmptyState>
      )}
    </UsersContainer>
  );
};

export default Users;

