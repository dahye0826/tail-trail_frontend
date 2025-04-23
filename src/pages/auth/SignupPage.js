<<<<<<< HEAD
// SignupPage.js 업데이트
"use client"
=======

>>>>>>> 5eb7e8411869dbb9b4a9eaae0b14fff53d8d0835

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./AuthPages.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { authAPI } from "../../services/api" // api.js에서 authAPI 사용

const SignupPage = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userPhone: "",
    userAddress: "",
    birthdate: "",
    petName: "",
    type: "",
    breed: "",
    petAge: ""
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) 

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
      // authAPI를 사용하여 회원가입 API 호출
      const response = await authAPI.signup({
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        userPhone: formData.userPhone || null,
        userAddress: formData.userAddress || null,
        birthdate: formData.birthdate || null,
        petName: formData.petName || null,
        type: formData.type || null,
        breed: formData.breed || null,
        petAge: formData.petAge ? parseInt(formData.petAge) : null
      })

      // 회원가입 성공
      alert("회원가입이 완료되었습니다. 로그인해주세요.")
      navigate("/login")
    } catch (err) {
      console.error("회원가입 오류:", err)
      if (err.response && err.response.data) {
        setError(err.response.data.message || "회원가입에 실패했습니다.")
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해주세요.")
      }
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
                          <label htmlFor="userName" className="form-label">
                            이름 <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="userName"
                            name="userName"
                            placeholder="이름을 입력하세요"
                            value={formData.userName}
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

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="userPhone" className="form-label">
                            전화번호
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            id="userPhone"
                            name="userPhone"
                            placeholder="010-0000-0000"
                            value={formData.userPhone}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="userAddress" className="form-label">
                            주소
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="userAddress"
                            name="userAddress"
                            placeholder="주소를 입력하세요"
                            value={formData.userAddress}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="birthdate" className="form-label">
                            생년월일
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            id="birthdate"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleChange}
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
                          <label htmlFor="type" className="form-label">
                            반려동물 종류
                          </label>
                          <select
                            className="form-select"
                            id="type"
                            name="type"
                            value={formData.type}
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

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="breed" className="form-label">
                            품종
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="breed"
                            name="breed"
                            placeholder="품종을 입력하세요"
                            value={formData.breed}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="petAge" className="form-label">
                            나이
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="petAge"
                            name="petAge"
                            placeholder="나이를 입력하세요"
                            value={formData.petAge}
                            onChange={handleChange}
                            min="0"
                          />
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