// LoginPage.js 업데이트
"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation  } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./AuthPages.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { authAPI } from "../../services/api" // api.js에서 authAPI 사용

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const navigate = useNavigate()
  
  const location = useLocation();
  
  // 이전 페이지 정보를 가져오거나 기본값으로 홈('/')을 사용
  const from = location.state?.from || "/";


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // authAPI 사용하여 로그인 요청
      const response = await authAPI.login(email, password)

      if (response.data.success) {
        // 로그인 성공 시 로컬 스토리지에 사용자 정보 저장
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userId", response.data.userId)
        localStorage.setItem("userName", response.data.userName)
        localStorage.setItem("userEmail", response.data.email)
        localStorage.setItem("userRole", response.data.role)
        
        // 사용자 프로필 정보가 있으면 저장
        if (response.data.profile) {
          localStorage.setItem("userProfile", response.data.profile)
        }

        if (response.data.role === "admin") {
          navigate("/admin")
        } else {
          navigate("/mypage")
        }
      } else {
        setError(response.data.message || "로그인에 실패했습니다.")
      }
    } catch (err) {
      console.error("로그인 오류:", err)
      setError("로그인에 실패했습니다. 로그인을 다시 시도해주세요")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="auth-background">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="auth-card">
                <div className="auth-card-body p-5">
                  <div className="text-center mb-4">
                    <h2 className="auth-title">로그인</h2>
                    <p className="auth-subtitle">반려동물과 함께하는 여행, 지금 시작하세요!</p>
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        이메일
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="이메일을 입력하세요"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="password" className="form-label">
                        비밀번호
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "로그인 중..." : "로그인"}
                      </button>
                    </div>
                  </form>

                  <div className="text-center mt-4">
                    <p>
                      아직 회원이 아니신가요?{" "}
                      <Link to="/signup" className="auth-link">
                        회원가입
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default LoginPage