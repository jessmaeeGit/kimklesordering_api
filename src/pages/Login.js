import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { addUser } from '../features/users/usersSlice';
import { loginAdmin, selectAdminAccounts } from '../features/admin/adminSlice';

const LoginContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const Title = styled.h1`
  color: #8B4513;
  text-align: center;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #DDD;
    border-radius: 4px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: #8B4513;
      box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.2);
    }
  }
`;

const InputWrapper = styled.div`
  position: relative;
  
  input {
    padding-left: 2.5rem;
  }
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  background: #8B4513;
  color: white;
  border: none;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  
  &:hover {
    background: #A0522D;
  }
  
  &:disabled {
    background: #CCCCCC;
    cursor: not-allowed;
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  
  a {
    color: #8B4513;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminAccounts = useSelector(selectAdminAccounts);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, you would send this to your backend
      // const response = await fetch('/api/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if admin login
      const admin = adminAccounts.find(
        admin => admin.email === formData.email && admin.password === formData.password
      );
      
      if (admin) {
        // Admin login
        dispatch(loginAdmin({ email: formData.email, password: formData.password }));
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUser', JSON.stringify({
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        }));
        
        // Trigger auth change event
        window.dispatchEvent(new Event('authChange'));
        
        // Redirect to admin page
        navigate('/admin');
        return;
      }
      
      // Check if user exists in localStorage (from registration)
      const storedUser = localStorage.getItem('user');
      
      let userData = null;
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.email === formData.email) {
          userData = user;
          // Set logged in state
          localStorage.setItem('isLoggedIn', 'true');
          
          // Add user to Redux if not already there
          dispatch(addUser({
            email: user.email,
            name: user.name || user.email.split('@')[0],
          }));
          
          // Trigger auth change event
          window.dispatchEvent(new Event('authChange'));
          
          // Redirect to home page
          navigate('/');
          return;
        }
      }
      
      // Demo: Allow any login for testing
      userData = {
        name: formData.email.split('@')[0],
        email: formData.email
      };
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Add user to Redux
      dispatch(addUser({
        email: userData.email,
        name: userData.name,
      }));
      
      // Trigger auth change event
      window.dispatchEvent(new Event('authChange'));
      
      // Redirect to home page
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>Login</Title>
        
        {error && (
          <div style={{
            background: '#FFEBEE',
            color: '#C62828',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="email">Email Address</label>
            <InputWrapper>
              <FaEnvelope />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="password">Password</label>
            <InputWrapper>
              <FaLock />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </FormGroup>
          
          <LoginButton type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </LoginButton>
        </form>
        
        <RegisterLink>
          Don't have an account? <Link to="/register">Register here</Link>
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;

