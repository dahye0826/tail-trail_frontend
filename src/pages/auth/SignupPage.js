

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./AuthPages.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    petName: "",
    petType: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // For Navbar

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      setLoading(false)
      return
    }

    try {
      // 실제 API 호출 로직으로 대체 필요
      // const response = await api.register(formData);

      // Mock signup for demonstration
      if (formData.name && formData.email && formData.password) {
        // 회원가입 성공 시 처리
        alert("회원가입이 완료되었습니다. 로그인해주세요.")
        navigate("/login")
      } else {
        setError("모든 필수 항목을 입력해주세요.")
      }
    } catch (err) {
      setError("회원가입에 실패했습니다. 다시 시도해주세요.")
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
            <div className="col-md-8">
              <div className="auth-card">
                <div className="auth-card-body p-5">
                  <div className="text-center mb-4">
                    <h2 className="auth-title">회원가입</h2>
                    <p className="auth-subtitle">반려동물과 함께하는 여행의 시작!</p>
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="name" className="form-label">
                            이름 <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            placeholder="이름을 입력하세요"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">
                            이메일 <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            placeholder="이메일을 입력하세요"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">
                            비밀번호 <span className="text-danger">*</span>
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            placeholder="비밀번호를 입력하세요"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="confirmPassword" className="form-label">
                            비밀번호 확인 <span className="text-danger">*</span>
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="비밀번호를 다시 입력하세요"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <hr className="my-4" />
                    <h5 className="mb-3 pet-info-title">반려동물 정보</h5>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="petName" className="form-label">
                            반려동물 이름
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="petName"
                            name="petName"
                            placeholder="반려동물 이름을 입력하세요"
                            value={formData.petName}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="petType" className="form-label">
                            반려동물 종류
                          </label>
                          <select
                            className="form-select"
                            id="petType"
                            name="petType"
                            value={formData.petType}
                            onChange={handleChange}
                          >
                            <option value="">선택하세요</option>
                            <option value="강아지">강아지</option>
                            <option value="고양이">고양이</option>
                            <option value="기타">기타</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="d-grid mt-4">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "가입 중..." : "회원가입"}
                      </button>
                    </div>
                  </form>

                  <div className="text-center mt-4">
                    <p>
                      이미 회원이신가요?{" "}
                      <Link to="/login" className="auth-link">
                        로그인
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

export default SignupPage

