"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaPen, FaUser } from "react-icons/fa"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./MyPageStyles.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

const MyPage = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    petName: "",
    petType: "",
  })

  const [stats, setStats] = useState({
    favorites: 0,
    visited: 0,
    posts: 0,
  })

  const [isLoggedIn, setIsLoggedIn] = useState(true) // For Navbar

  useEffect(() => {
    // 실제 구현에서는 API 호출로 데이터를 가져옴
    // 지금은 로컬 스토리지에서 가져오는 것으로 대체
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    // 사용자 데이터 설정 (로컬 스토리지에 없으면 기본값 사용)
    setUserData({
      name: user.name || "김반려",
      email: user.email || "pet@example.com",
      petName: user.petName || "멍멍이",
      petType: user.petType || "강아지",
    })

    // 통계 데이터 설정 (실제로는 API에서 가져와야 함)
    setStats({
      favorites: 5,
      visited: 8,
      posts: 3,
    })
  }, [])

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="mypage-background">
        <div className="container py-5">
          <div className="row">
            <div className="col-lg-3 col-md-4 mb-4">
              <div className="sidebar-container">
                <div className="sidebar-header">
                  <h5 className="sidebar-title">마이페이지</h5>
                </div>

                <ul className="sidebar-menu">
                  <li className="sidebar-menu-item active">
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
                  <li className="sidebar-menu-item">
                    <Link to="/mypage/edit-profile" className="sidebar-menu-link">
                      <i className="bi bi-gear me-2"></i>개인정보 수정
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-9 col-md-8">
              <div className="mypage-content-container">
                <div className="mb-4">
                  <h2 className="mypage-title">마이페이지</h2>
                  <p className="mypage-subtitle">나의 활동 정보와 즐겨찾기, 방문이력을 관리하세요.</p>
                </div>

                <div className="profile-card mb-4">
                  <div className="row">
                    <div className="col-md-3 text-center mb-3 mb-md-0">
                      <div className="profile-avatar">{userData.name.charAt(0)}</div>
                    </div>

                    <div className="col-md-9">
                      <h4 className="mb-2">{userData.name}님</h4>
                      <p className="text-muted mb-1">{userData.email}</p>

                      {userData.petName && (
                        <p className="mb-3">
                          <span className="badge bg-light text-dark me-2">
                            반려동물: {userData.petName} ({userData.petType})
                          </span>
                        </p>
                      )}

                      <Link to="/mypage/edit-profile" className="btn btn-outline-secondary btn-sm">
                        <FaUser className="me-1" /> 프로필 수정
                      </Link>
                    </div>
                  </div>
                </div>

                <h5 className="activity-title mb-3">나의 활동</h5>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <Link to="/mypage/posts" className="activity-card">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="m-0 activity-card-title">내가 쓴 글</h5>
                          <FaPen className="activity-icon" />
                        </div>
                        <h3 className="mb-2">{stats.posts}</h3>
                        <p className="text-muted mb-0">작성한 글</p>
                      </div>
                    </Link>
                  </div>

                  <div className="col-md-6 mb-3">
                    <Link to="/mypage/rated" className="activity-card">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="m-0 activity-card-title">별점 등록한 곳</h5>
                          <i className="bi bi-star-fill activity-icon"></i>
                        </div>
                        <h3 className="mb-2">{stats.visited}</h3>
                        <p className="text-muted mb-0">평가한 장소</p>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="promo-banner mt-4">
                  <h5 className="promo-title">반려동물과 함께하는 새로운 여행지를 발견해보세요!</h5>
                  <p className="mb-3">전국의 반려동물 친화적인 장소들을 둘러보고 여행 계획을 세워보세요.</p>
                  <Link to="/places" className="btn btn-primary">
                    여행지 둘러보기
                  </Link>
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

export default MyPage

