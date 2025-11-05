import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { addUser } from '../features/users/usersSlice';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';

const RegisterContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 5%;
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 576px) {
    padding: 1rem;
  }
`;

const RegisterCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  
  @media (max-width: 576px) {
    padding: 1.5rem;
  }
`;

const Title = styled.h1`
  color: #8B4513;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
  
  @media (max-width: 576px) {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
    font-size: 0.95rem;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #DDD;
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
    
    &:focus {
      outline: none;
      border-color: #8B4513;
      box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.2);
    }
    
    &::placeholder {
      color: #999;
    }
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  
  input {
    padding-left: 2.5rem;
    width: 100%;
    box-sizing: border-box;
  }
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    z-index: 1;
    pointer-events: none;
  }
`;

const RegisterButton = styled.button`
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

const ErrorMessage = styled.div`
  background: #FFEBEE;
  color: #C62828;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 500;
`;

const LoginLink = styled.div`
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

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, you would send this to your backend
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add user to Redux store
      dispatch(addUser({
        email: formData.email,
        name: formData.fullName,
      }));
      
      // Store user data in localStorage (in a real app, this would be handled by auth)
      localStorage.setItem('user', JSON.stringify({
        name: formData.fullName,
        email: formData.email
      }));
      
      // Redirect to login page
      navigate('/login');
      
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Title>Create Account</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="fullName">Full Name</label>
            <InputWrapper>
              <FaUser />
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                autoComplete="name"
              />
            </InputWrapper>
          </FormGroup>
          
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
                placeholder="Enter your email address"
                required
                autoComplete="email"
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
                placeholder="Enter your password (min. 6 characters)"
                required
                autoComplete="new-password"
                minLength={6}
              />
            </InputWrapper>
            <small style={{ 
              display: 'block', 
              marginTop: '0.5rem', 
              color: '#666', 
              fontSize: '0.85rem' 
            }}>
              Password must be at least 6 characters long
            </small>
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <InputWrapper>
              <FaLock />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
              />
            </InputWrapper>
          </FormGroup>
          
          <RegisterButton type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </RegisterButton>
        </form>
        
        <LoginLink>
          Already have an account? <Link to="/login">Login here</Link>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;

