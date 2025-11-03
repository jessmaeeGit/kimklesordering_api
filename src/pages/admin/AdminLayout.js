import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaSignOutAlt, FaTachometerAlt, FaBox, FaShoppingBag, FaUsers, FaCreditCard, FaTags, FaBars, FaTimes } from 'react-icons/fa';
import { logoutAdmin, setCurrentAdmin, selectCurrentAdmin } from '../../features/admin/adminSlice';

const AdminContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
`;

const Sidebar = styled.div`
  width: 280px;
  background: #1e293b;
  color: #f8fafc;
  padding: 1.5rem 0;
  position: fixed;
  height: 100%;
  transition: all 0.3s ease-in-out;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 1024px) {
    transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-100%)')};
    width: 300px;
  }
`;

const SidebarHeader = styled.div`
  padding: 0 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
  
  h2 {
    color: #fff;
    font-size: 1.25rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  span {
    color: #f39c12;
  }
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.875rem 1.75rem;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.9375rem;
  font-weight: 500;
  margin: 0.25rem 1rem;
  border-radius: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    transform: translateX(4px);
  }
  
  &.active {
    background: rgba(99, 102, 241, 0.15);
    color: #6366f1;
    font-weight: 600;
  }
  
  svg {
    margin-right: 0.875rem;
    font-size: 1.125rem;
    width: 1.25em;
    flex-shrink: 0;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: #ecf0f1;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e74c3c;
  }
  
  svg {
    margin-right: 0.75rem;
    font-size: 1.1rem;
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 2rem 2.5rem;
  transition: all 0.3s ease;
  min-height: 100vh;
  background-color: #f8fafc;
  
  @media (max-width: 1024px) {
    margin-left: 0;
    padding: 1.5rem;
    width: 100%;
  }
  
  @media (max-width: 640px) {
    padding: 1.25rem;
  }
`;

const TopBar = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ToggleSidebar = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #2c3e50;
  cursor: pointer;
  display: none;
  
  @media (max-width: 992px) {
    display: block;
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  span {
    font-weight: 500;
    color: #2c3e50;
  }
  
  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentAdmin = useSelector(selectCurrentAdmin);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const storedAdmin = localStorage.getItem('adminUser');
    
    // If no admin session, redirect immediately to homepage
    if (!adminLoggedIn || !storedAdmin) {
      console.log('No admin session found, redirecting to homepage...');
      navigate('/');
      return;
    }
    
    // Verify admin data
    try {
      const admin = JSON.parse(storedAdmin);
      
      // Check if user has admin role
      if (!admin.role || admin.role !== 'admin') {
        console.log('User is not an admin, redirecting to homepage...');
        // Clear invalid admin data
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUser');
        navigate('/');
        return;
      }
      
      // Set admin in Redux
      dispatch(setCurrentAdmin(admin));
      
      // Set admin user for display
      setAdminUser({
        name: admin.name || 'Admin User',
        email: admin.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name || 'Admin')}&background=8B4513&color=fff`
      });
    } catch (e) {
      console.error('Error parsing admin data:', e);
      // Clear corrupted data
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminUser');
      navigate('/');
      return;
    }
    
    // Listen for auth changes
    const handleAuthChange = () => {
      const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      if (!adminLoggedIn) {
        navigate('/');
      }
    };
    
    // Listen for logout events
    const handleLogout = () => {
      navigate('/');
    };
    
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('adminLogout', handleLogout);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('adminLogout', handleLogout);
    };
  }, []); // Only run once on mount
  
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logoutAdmin());
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminUser');
      setAdminUser(null);
      
      // Trigger logout event
      window.dispatchEvent(new Event('adminLogout'));
      window.dispatchEvent(new Event('authChange'));
      
      navigate('/');
    }
  };
  
  // Show loading state while checking auth
  // Only show loading if we're actually checking (has dispatch), otherwise redirect
  if (!adminUser) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Verifying admin access...
      </div>
    );
  }
  
  const isActive = (path) => {
    // Check if current path matches or is the index route (/admin)
    const currentPath = location.pathname;
    if (path === '/admin/dashboard' && (currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/admin/dashboard')) {
      return 'active';
    }
    return currentPath === path || currentPath.startsWith(path + '/') ? 'active' : '';
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AdminContainer>
      <Sidebar isOpen={isSidebarOpen}>
        <SidebarHeader>
          <h2>Kimkles <span>Admin</span></h2>
        </SidebarHeader>
        
        <nav>
          <MenuItem to="/admin/dashboard" className={isActive('/admin/dashboard')}>
            <FaTachometerAlt /> Dashboard
          </MenuItem>
          
          <MenuItem to="/admin/products" className={location.pathname.startsWith('/admin/products') ? 'active' : ''}>
            <FaBox /> Products
          </MenuItem>
          
          <MenuItem to="/admin/orders" className={location.pathname.startsWith('/admin/orders') ? 'active' : ''}>
            <FaShoppingBag /> Orders
          </MenuItem>
          
          <MenuItem to="/admin/users" className={location.pathname.startsWith('/admin/users') ? 'active' : ''}>
            <FaUsers /> Users
          </MenuItem>
          
          <MenuItem to="/admin/payments" className={location.pathname.startsWith('/admin/payments') ? 'active' : ''}>
            <FaCreditCard /> Payments
          </MenuItem>
          
          <MenuItem to="/admin/promotions" className={location.pathname.startsWith('/admin/promotions') ? 'active' : ''}>
            <FaTags /> Promotions
          </MenuItem>
          
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </LogoutButton>
        </nav>
      </Sidebar>
      
      <MainContent>
        <TopBar>
          <ToggleSidebar onClick={toggleSidebar}>
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </ToggleSidebar>
          
          <UserMenu>
            <span>{adminUser.name}</span>
            <img src={adminUser.avatar} alt={adminUser.name} />
          </UserMenu>
        </TopBar>
        
        <div className="content">
          <Outlet />
        </div>
      </MainContent>
    </AdminContainer>
  );
};

export default AdminLayout;
