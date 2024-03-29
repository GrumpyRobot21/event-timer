import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          axios.defaults.headers.common['X-CSRFToken'] = getCookie('csrftoken');
          const response = await axios.get('https://eventtimerdb.herokuapp.com/profile/me');
          setUser({ token, ...response.data });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    const login = async (email, password) => {
      try {
        const response = await axios.post('https://eventtimerdb.herokuapp.com/api/auth/login/', {
          email,
          password,
        }, {
          headers: {
            'X-CSRFToken': getCookie('csrftoken'),
          },
        });
        const token = response.data.access;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser({ token, ...response.data.user });
      } catch (error) {
        console.error('Error logging in:', error);
        throw error;
      }
    };

    const signup = async (email, password, name) => {
      try {
        const response = await axios.post('https://eventtimerdb.herokuapp.com/register/', {
          email,
          password,
          name,
        }, {
          headers: {
            'X-CSRFToken': getCookie('csrftoken'),
          },
        });
        const token = response.data.access;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser({ token, ...response.data.user });
      } catch (error) {
        console.error('Error signing up:', error);
        throw error;
      }
    };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};