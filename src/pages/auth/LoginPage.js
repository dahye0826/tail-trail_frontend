
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./AuthPages.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // For Navbar

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // 실제 API 호출 로직으로 대체 필요
      // const response = await api.login(email, password);

      // Mock login for demonstration
      if (email && password) {
        // 로그인 성공 시 토큰 저장 (실제론 API 응답에서 받은 토큰 사용)
        localStorage.setItem("token", "mock-jwt-token")
        localStorage.setItem("user", JSON.stringify({ email, name: "반려인" }))

        // 마이페이지로 리다이렉트
        navigate("/mypage")
      } else {
        setError("이메일과 비밀번호를 입력해주세요.")
      }
    } catch (err) {
      setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.")
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

