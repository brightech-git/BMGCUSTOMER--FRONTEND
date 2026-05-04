// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedRole = await AsyncStorage.getItem('userRole');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        setUserRole(storedRole || 'user');
      }
    } catch (error) {
      console.log("Auth check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData, userToken, role = 'user') => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userRole', role);
      
      setUser(userData);
      setToken(userToken);
      setUserRole(role);
      
      return { success: true };
    } catch (error) {
      console.log("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'userToken', 'userRole']);
      setUser(null);
      setToken(null);
      setUserRole(null);
      return { success: true };
    } catch (error) {
      console.log("Logout error:", error);
      return { success: false, error: error.message };
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      const newUserData = { ...user, ...updatedUserData };
      await AsyncStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);
      return { success: true };
    } catch (error) {
      console.log("Update user error:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    isLoading,
    user,
    userRole,
    token,
    isLoggedIn: !!user && !!token,
    isAdmin: userRole === 'admin',
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};