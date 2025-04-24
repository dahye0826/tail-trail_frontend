// src/contexts/AuthContext.js
import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation 추가
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation(); // 현재 위치 정보 가져오기

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
  const login = async (email, password, redirectUrl = null) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.data && response.data.success) {
        const userData = response.data.data;
        
        // 로컬 스토리지에 사용자 정보 저장
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", userData.userId);
        localStorage.setItem("userName", userData.userName);
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userRole", userData.role || "user");
        localStorage.setItem("userProfile", userData.profile || "");
        
        setIsLoggedIn(true);
        setUser({
          id: userData.userId,
          name: userData.userName,
          email: userData.email,
          role: userData.role || "user",
          profile: userData.profile || ""
        });
        
        // redirectUrl이 전달되면 해당 URL로 이동, 아니면 홈페이지로
        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          navigate("/");  // 마이페이지 대신 홈페이지로 이동
        }
        
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
      
      // 로컬 스토리지에서 사용자 정보 제거
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userProfile");
      
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