import "./Navbar.css"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { authAPI } from "./../services/api"

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)


  useEffect(() => {
    checkLoginStatus()
  }, [location]) 


  const checkLoginStatus = () => {
    const loginStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loginStatus);
  
    if (loginStatus) {

      const userRole = localStorage.getItem("userRole");
     
  
      if (userRole === "admin") {
        setIsAdmin(true);   
      } else {
        setIsAdmin(false);   
      }
    } else {
      setIsAdmin(false);     
    }
  }

  // 로그아웃 처리 함수
  const handleLogout = async (e) => {
    e.preventDefault()
    try {
      await authAPI.logout()

      // 로컬 스토리지 클리어
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("userId")
      localStorage.removeItem("userName")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userProfile")

      setIsLoggedIn(false)
      setIsAdmin(false)
      navigate("/")
      alert("로그아웃 되었습니다.")
    } catch (error) {
      console.error("로그아웃 오류:", error)
      alert("로그아웃 처리 중 오류가 발생했습니다.")
    }
  }



  return (
    <nav className="navbar navbar-expand-lg navbar-light mb-4" style={{ padding: 0}}>
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img
            src={process.env.PUBLIC_URL + "/images/weblogo2.png" || "/placeholder.svg"}
            alt="이음길"
            className="navbar-logo me-2"
            style={{ height: "74px", width: "auto", display: "inline-block" }}
          />
        </Link>


        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item mx-2">
              <Link className={`nav-link ${path.includes("/places") ? "active" : ""}`} to="/places">
                <i className="bi bi-geo-alt me-1"></i> 장소
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className={`nav-link ${path === "/map" ? "active" : ""}`} to="/map">
                <i className="bi bi-map me-1"></i> 지도
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className={`nav-link ${path.includes("/community") ? "active" : ""}`} to="/community">
                <i className="bi bi-people me-1"></i> 커뮤니티
              </Link>
            </li>
          </ul>


          <div className="d-flex">
            {isLoggedIn ? (
              <>
                {isAdmin ? (
                  <Link to="/admin" className="btn btn-outline-secondary me-2">
                    <i className="bi bi-person-circle me-1"></i> 관리자 대시보드
                  </Link>
                ) : (
                  <Link to="/mypage" className="btn btn-outline-secondary me-2">
                    <i className="bi bi-person-circle me-1"></i> 마이페이지
                  </Link>
                )}
                <button className="btn btn-danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-1"></i> 로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary me-2">
                  <i className="bi bi-box-arrow-in-right me-1"></i> 로그인
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  <i className="bi bi-person-plus me-1"></i> 회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
