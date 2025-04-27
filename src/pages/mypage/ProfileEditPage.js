// ProfileEditPage.js 완성
"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { FaUser, FaDog, FaKey, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa"
import axios from "axios"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./MyPageStyles.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

const ProfileEditPage = () => {
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    userPhone: "",
    userAddress: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    petName: "",
    petType: "",
    petBreed: "",
    petAge: "",
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const defaultTab = params.get("tab") || "info"
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => {
    // 로그인 상태 확인
    const loginStatus = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loginStatus)

    if (!loginStatus) {
      navigate("/login")
      return
    }

    const userId = localStorage.getItem("userId")
    if (!userId) {
      navigate("/login")
      return
    }

    // 사용자 데이터 가져오기
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:9000/api/users/${userId}`)
        
        setUserProfile({
          name: response.data.userName || "",
          email: response.data.email || "",
          userPhone: response.data.userPhone || "",
          userAddress: response.data.userAddress || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          petName: response.data.petName || "",
          petType: response.data.type || "",
          petBreed: response.data.breed || "",
          petAge: response.data.petAge || "",
        })
        
        setLoading(false)
      } catch (error) {
        console.error("사용자 프로필 로딩 오류:", error)
        setError("프로필 정보를 불러오는데 실패했습니다.")
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserProfile({
      ...userProfile,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSubmitting(true)

    // 비밀번호 변경 시 유효성 검사
    if (userProfile.newPassword) {
      if (!userProfile.currentPassword) {
        setError("현재 비밀번호를 입력해주세요.")
        setSubmitting(false)
        return
      }

      if (userProfile.newPassword !== userProfile.confirmPassword) {
        setError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.")
        setSubmitting(false)
        return
      }
    }

    const userId = localStorage.getItem("userId")
    if (!userId) {
      setError("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.")
      setSubmitting(false)
      return
    }

    try {
      // 프로필 업데이트 요청
      const updateData = {
        userName: userProfile.name,
        userPhone: userProfile.userPhone,
        userAddress: userProfile.userAddress,
        petName: userProfile.petName,
        type: userProfile.petType,
        breed: userProfile.petBreed,
        petAge: userProfile.petAge ? parseInt(userProfile.petAge) : null
      }

      // 비밀번호 변경이 있는 경우만 비밀번호 필드 추가
      if (userProfile.newPassword) {
        updateData.currentPassword = userProfile.currentPassword
        updateData.newPassword = userProfile.newPassword
      }

      const response = await axios.put(`http://localhost:9000/api/users/${userId}`, updateData)
      
      // 로컬 스토리지 업데이트
      localStorage.setItem("userName", response.data.userName)
      
      setSuccess("프로필이 성공적으로 업데이트되었습니다.")
      
      // 비밀번호 필드 초기화
      setUserProfile({
        ...userProfile,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } catch (err) {
      console.error("프로필 업데이트 오류:", err)
      if (err.response && err.response.data) {
        setError(err.response.data.message || "프로필 업데이트에 실패했습니다.")
      } else {
        setError("프로필 업데이트에 실패했습니다. 다시 시도해주세요.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="mypage-background">
        <div className="container py-5">
          <div className="row">
            <div className="col-auto mb-4">
              <div className="sidebar-container">
                <div className="sidebar-header">
                  <h5 className="sidebar-title">마이페이지</h5>
                </div>
                <ul className="sidebar-menu">
                  <li className="sidebar-menu-item">
                    <Link to="/mypage" className="sidebar-menu-link">
                      <i className="bi bi-person-circle me-2"></i>내 정보
                    </Link>
                  </li>
                  <li className="sidebar-menu-item">
                    <Link to="/mypage/posts" className="sidebar-menu-link">
                      <i className="bi bi-pencil-square me-2"></i>내가 쓴 글
                    </Link>
                  </li>
                  <li className="sidebar-menu-item">
                    <Link to="/mypage/rated" className="sidebar-menu-link">
                      <i className="bi bi-star me-2"></i>별점 등록한 곳
                    </Link>
                  </li>
                    {/* 여기에 즐겨찾기 항목 추가 */}
                  <li className="sidebar-menu-item">
                    <Link to="/mypage/favorites" className="sidebar-menu-link">
                      <i className="bi bi-bookmark-heart me-2"></i>즐겨찾기
                    </Link>
                  </li>
                  <li className="sidebar-menu-item active">
                    <Link to="/mypage/edit-profile" className="sidebar-menu-link">
                      <i className="bi bi-gear me-2"></i>개인정보 수정
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col">
              <div className="mypage-content-container">
                <div className="mb-4">
                  <h2 className="mypage-title">개인정보 수정</h2>
                  <p className="mypage-subtitle">내 정보와 반려동물 정보를 관리하세요.</p>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: "var(--primary-color)" }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">프로필 정보를 불러오는 중...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="profile-section mb-4">
                      <div className="profile-section-header">
                        <h5 className="profile-section-title">
                          <FaUser className="me-2" /> 기본 정보
                        </h5>
                      </div>
                      <div className="profile-section-body">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="name" className="form-label">
                              이름
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="name"
                              name="name"
                              value={userProfile.name}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="email" className="form-label">
                              이메일
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              id="email"
                              name="email"
                              value={userProfile.email}
                              onChange={handleChange}
                              required
                              disabled
                            />
                            <div className="form-text">이메일은 변경할 수 없습니다.</div>
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="userPhone" className="form-label">
                              <FaPhoneAlt className="me-1" /> 휴대폰 번호
                            </label>
                            <input
                              type="tel"
                              className="form-control"
                              id="userPhone"
                              name="userPhone"
                              value={userProfile.userPhone}
                              onChange={handleChange}
                              placeholder="010-0000-0000"
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="userAddress" className="form-label">
                              <FaMapMarkerAlt className="me-1" /> 주소
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="userAddress"
                              name="userAddress"
                              value={userProfile.userAddress}
                              onChange={handleChange}
                              placeholder="주소를 입력하세요"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="profile-section mb-4">
                      <div className="profile-section-header">
                        <h5 className="profile-section-title">
                          <FaKey className="me-2" /> 비밀번호 변경
                        </h5>
                      </div>
                      <div className="profile-section-body">
                        <div className="row">
                          <div className="col-md-12 mb-3">
                            <label htmlFor="currentPassword" className="form-label">
                              현재 비밀번호
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              id="currentPassword"
                              name="currentPassword"
                              value={userProfile.currentPassword}
                              onChange={handleChange}
                              placeholder="현재 비밀번호를 입력하세요"
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="newPassword" className="form-label">
                              새 비밀번호
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              id="newPassword"
                              name="newPassword"
                              value={userProfile.newPassword}
                              onChange={handleChange}
                              placeholder="새 비밀번호를 입력하세요"
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="confirmPassword" className="form-label">
                              새 비밀번호 확인
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              id="confirmPassword"
                              name="confirmPassword"
                              value={userProfile.confirmPassword}
                              onChange={handleChange}
                              placeholder="새 비밀번호를 다시 입력하세요"
                            />
                          </div>
                        </div>
                        <div className="form-text">비밀번호를 변경하지 않으려면 위 필드를 비워두세요.</div>
                      </div>
                    </div>

                    <div className="profile-section mb-4">
                      <div className="profile-section-header">
                        <h5 className="profile-section-title">
                          <FaDog className="me-2" /> 반려동물 정보
                        </h5>
                      </div>
                      <div className="profile-section-body">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="petName" className="form-label">
                              반려동물 이름
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="petName"
                              name="petName"
                              value={userProfile.petName}
                              onChange={handleChange}
                              placeholder="반려동물 이름을 입력하세요"
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="petType" className="form-label">
                              반려동물 종류
                            </label>
                            <select
                              className="form-select"
                              id="petType"
                              name="petType"
                              value={userProfile.petType}
                              onChange={handleChange}
                            >
                              <option value="">선택하세요</option>
                              <option value="강아지">강아지</option>
                              <option value="고양이">고양이</option>
                              <option value="기타">기타</option>
                            </select>
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="petBreed" className="form-label">
                              품종
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="petBreed"
                              name="petBreed"
                              value={userProfile.petBreed}
                              onChange={handleChange}
                              placeholder="반려동물 품종을 입력하세요"
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="petAge" className="form-label">
                              나이
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              id="petAge"
                              name="petAge"
                              value={userProfile.petAge}
                              onChange={handleChange}
                              min="0"
                              max="30"
                              placeholder="반려동물 나이를 입력하세요"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                      <Link to="/mypage" className="btn btn-outline-secondary">
                        취소
                      </Link>
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? "저장 중..." : "저장하기"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default ProfileEditPage