// src/contexts/AuthContext.js
import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    // 로컬 스토리지에서 로그인 상태 확인
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loginStatus);
      
      if (loginStatus) {
        setUser({
          id: localStorage.getItem("userId"),
          name: localStorage.getItem("userName"),
          email: localStorage.getItem("userEmail"),
          role: localStorage.getItem("userRole"),
          profile: localStorage.getItem("userProfile")
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };
    
    checkLoginStatus();
  }, []);

  // 로그인 처리
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.data && response.data.success) {
        const userData = response.data.data;
        
        setIsLoggedIn(true);
        setUser({
          id: userData.userId,
          name: userData.userName,
          email: userData.email,
          role: userData.role,
          profile: userData.profile
        });
        
        navigate("/mypage");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("로그인 오류:", error);
      return false;
    }
  };

  // 로그아웃 처리
  const logout = async () => {
    try {
      await authAPI.logout();
      
      setIsLoggedIn(false);
      setUser(null);
      
      navigate("/");
      return true;
    } catch (error) {
      console.error("로그아웃 오류:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);