import "./Navbar.css"
import { useLocation } from "react-router-dom"

function Navbar({ isLoggedIn }) {
  const location = useLocation()
  const path = location.pathname

  // Determine active page based on URL path
  const isPlacesActive = path.includes("/places")
  const isCommunityActive = path.includes("/community")
  const isMapActive = path === "/map"
  const isHomeActive = path === "/"

  return (
    <nav className="navbar navbar-expand-lg navbar-light mb-4">
      <div className="container">
        <a className="navbar-brand" href="/">
          <img
            src={process.env.PUBLIC_URL + "/images/logo.png" || "/placeholder.svg"}
            alt="이음길"
            className="navbar-logo me-2"
            style={{ height: "40px", width: "auto", display: "inline-block" }}
          />
          이음길
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item mx-2">
              <a className={`nav-link ${isPlacesActive ? "active" : ""}`} href="/places">
                <i className="bi bi-geo-alt me-1"></i>
                장소
              </a>
            </li>
            <li className="nav-item mx-2">
              <a className={`nav-link ${isMapActive ? "active" : ""}`} href="/map">
                <i className="bi bi-map me-1"></i> 지도
              </a>
            </li>
            <li className="nav-item mx-2">
              <a className={`nav-link ${isCommunityActive ? "active" : ""}`} href="/community">
                <i className="bi bi-people me-1"></i>
                커뮤니티
              </a>
            </li>
          </ul>

          {/* 로그인 상태에 따라 다른 메뉴 표시 */}
          <div className="d-flex">
            {isLoggedIn ? (
              <>
                <a href="/mypage" className="btn me-2">
                  <i className="bi bi-person-circle me-1"></i>
                  마이페이지
                </a>
                <button className="btn logout-btn">
                  <i className="bi bi-box-arrow-right me-1"></i>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="btn me-2">
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  로그인
                </a>
                <a href="/signup" className="btn btn-primary">
                  <i className="bi bi-person-plus me-1"></i>
                  회원가입
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
