import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHome, FaUtensils, FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaShoppingBag } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const Nav = styled.nav`
  background: #8B4513; /* Brown color */
  padding: 1rem 5%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: #FFF8DC; /* Cream color */
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #FFD700; /* Gold color on hover */
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: #FFF8DC;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
  
  &:hover {
    color: #FFD700;
  }
`;

const CartIcon = styled.div`
  position: relative;
  cursor: pointer;
  
  &:hover {
    color: #FFD700;
  }
`;

const CartCount = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #FF4500;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserButton = styled.button`
  background: transparent;
  border: 1px solid #FFF8DC;
  color: #FFF8DC;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: #FFF8DC;
    color: #8B4513;
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
`;

const UserInfo = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  
  .name {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
  }
  
  .email {
    font-size: 0.875rem;
    color: #666;
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #333;
  transition: background 0.2s;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &.danger {
    color: #e74c3c;
    
    &:hover {
      background: #fee;
    }
  }
`;

const Navbar = () => {
  const { totalQuantity } = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const checkAuth = () => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userData = localStorage.getItem('user');
    
    setIsLoggedIn(loggedIn);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth();
    
    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event when login/logout happens in same tab
    window.addEventListener('authChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowUserMenu(false);
    
    // Trigger auth change event
    window.dispatchEvent(new Event('authChange'));
    
    navigate('/');
  };

  return (
    <Nav>
      <NavContainer>
        <Logo to="/">
          <FaUtensils /> Kimkles Cravings
        </Logo>
        
        <NavLinks>
          <NavLink to="/">
            <FaHome /> Home
          </NavLink>
          <NavLink to="/menu">
            <FaUtensils /> Menu
          </NavLink>
          {isLoggedIn && user && (
            <NavLink to="/my-orders">
              <FaShoppingBag /> My Orders
            </NavLink>
          )}
          <CartIcon onClick={() => navigate('/cart')}>
            <FaShoppingCart size={20} />
            {totalQuantity > 0 && <CartCount>{totalQuantity}</CartCount>}
          </CartIcon>
          
          {isLoggedIn && user ? (
            <UserMenu>
              <UserButton onClick={() => setShowUserMenu(!showUserMenu)}>
                <FaUser /> {user.name || user.email.split('@')[0]}
              </UserButton>
              {showUserMenu && (
                <>
                  <div 
                    style={{ 
                      position: 'fixed', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      bottom: 0, 
                      zIndex: 999 
                    }} 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <UserDropdown>
                    <UserInfo>
                      <div className="name">{user.name || 'User'}</div>
                      <div className="email">{user.email}</div>
                    </UserInfo>
                    <DropdownItem onClick={() => { navigate('/'); setShowUserMenu(false); }}>
                      <FaHome /> Home
                    </DropdownItem>
                    <DropdownItem onClick={handleLogout} className="danger">
                      <FaSignOutAlt /> Logout
                    </DropdownItem>
                  </UserDropdown>
                </>
              )}
            </UserMenu>
          ) : (
            <>
              <NavLink to="/login">
                <FaSignInAlt /> Login
              </NavLink>
              <NavLink to="/register">
                <FaUserPlus /> Register
              </NavLink>
            </>
          )}
        </NavLinks>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;
