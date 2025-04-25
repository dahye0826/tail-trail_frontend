"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./MyPageStyles.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import axios from "axios"

const API_BASE_URL = "http://localhost:9000/api"

const FavoritesPage = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 10

  // 장소 클릭 처리
  const handlePlaceClick = useCallback((placeId) => {
    if (placeId) {
      navigate(`/places/place/${placeId}`)
    }
  }, [navigate])

  // 즐겨찾기 목록 로드
  const loadFavorites = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        navigate("/login")
        return
      }

      setLoading(true)
      setError(null)

      // 1. 즐겨찾기 목록 가져오기
      const favoritesResponse = await axios.get(`${API_BASE_URL}/favorites`, {
        params: {
          userId: Number(userId),
          page: currentPage,
          size: pageSize
        }
      });

      if (favoritesResponse.data && favoritesResponse.data.favorites) {
        // 2. 각 즐겨찾기에 대한 장소 정보 가져오기
        const favoritesWithPlaces = await Promise.all(
          favoritesResponse.data.favorites.map(async (favorite) => {
            try {
              const placeResponse = await axios.get(`${API_BASE_URL}/places/${favorite.placeId}`);
              return {
                ...favorite,
                place: placeResponse.data
              };
            } catch (error) {
              console.error(`장소 정보 로드 오류 (ID: ${favorite.placeId}):`, error);
              return favorite;
            }
          })
        );

        setFavorites(favoritesWithPlaces);
        setTotalItems(favoritesResponse.data.totalItems || 0);
        setTotalPages(favoritesResponse.data.totalPages || 0);
      }
    } catch (error) {
      console.error("즐겨찾기 로드 오류:", error)
      setError("즐겨찾기를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setLoading(false)
    }
  }, [currentPage, navigate])

  // 컴포넌트 마운트 시 즐겨찾기 로드
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loginStatus)
    if (loginStatus) {
      loadFavorites()
    } else {
      navigate("/login")
    }
  }, [loadFavorites, navigate])

  // 즐겨찾기 삭제 처리
  const handleRemoveFavorite = useCallback(async (placeId) => {
    if (!window.confirm("즐겨찾기를 삭제하시겠습니까?")) {
      return
    }

    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        navigate("/login")
        return
      }

      await axios.post(`${API_BASE_URL}/favorites/toggle`, null, {
        params: {
          userId: Number(userId),
          placeId: Number(placeId)
        }
      })
      
      // 삭제 후 현재 페이지 데이터 다시 로드
      loadFavorites()
    } catch (error) {
      console.error("즐겨찾기 삭제 오류:", error)
      alert("즐겨찾기 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
    }
  }, [navigate, loadFavorites])

  // 페이지 변경 처리
  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

  // 이미지 URL 생성
  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return "/assets/default-pet-place.jpg"
    if (imagePath.startsWith('http')) return imagePath
    // 이미지 경로가 /images로 시작하면 API_BASE_URL과 결합
    if (imagePath.startsWith('/images')) {
      return `${API_BASE_URL}${imagePath}`
    }
    // 이미지 경로가 상대 경로인 경우 /images/places/ 경로 추가
    return `${API_BASE_URL}/images/places/${imagePath}`
  }, [])

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <div className="mypage-background">
        <div className="container py-5">
          <div className="row">
            {/* 사이드바 */}
            <div className="col-lg-3 col-md-4 mb-4">
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
                    <Link to="/mypage/visited" className="sidebar-menu-link">
                      <i className="bi bi-star me-2"></i>방문이력관광지
                    </Link>
                  </li>
                  <li className="sidebar-menu-item active">
                    <Link to="/mypage/favorites" className="sidebar-menu-link">
                      <i className="bi bi-bookmark-heart me-2"></i>즐겨찾기
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

            {/* 메인 컨텐츠 */}
            <div className="col-lg-9 col-md-8">
              <div className="mypage-content-container">
                <div className="mb-4">
                  <h2 className="mypage-title">즐겨찾기</h2>
                  <p className="mypage-subtitle">내가 즐겨찾기한 장소들을 관리하세요.</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">로딩 중...</span>
                    </div>
                    <p className="mt-3">즐겨찾기를 불러오는 중입니다...</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-end mb-3 text-muted small">총 {totalItems}개의 즐겨찾기</p>

                    {favorites.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="bi bi-bookmark-heart display-1 text-muted"></i>
                        <p className="mt-3">즐겨찾기한 장소가 없습니다.</p>
                        <Link to="/places" className="btn btn-primary mt-2">
                          장소 둘러보기
                        </Link>
                      </div>
                    ) : (
                      <div className="row row-cols-1 g-4">
                        {favorites.map((favorite) => (
                          <div className="col" key={favorite.favoriteId}>
                            <div className="card h-100">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="place-info">
                                    <div className="location-badge mb-2">
                                      {favorite.place?.city} {favorite.place?.district}
                                    </div>
                                    <h5 className="place-name mb-2">
                                      {favorite.place?.placeName}
                                    </h5>
                                    <p className="place-address mb-2">
                                      {favorite.place?.roadAddress || favorite.place?.landAddress}
                                    </p>
                                    {favorite.place?.petRestrictions && (
                                      <p className="place-restrictions mb-2">
                                        반려동물 제한: {favorite.place?.petRestrictions}
                                      </p>
                                    )}
                                    {favorite.place?.openingHours && (
                                      <p className="place-hours mb-2">
                                        영업시간: {favorite.place?.openingHours}
                                      </p>
                                    )}
                                    {favorite.place?.admissionFee && (
                                      <p className="place-price mb-2">
                                        입장료: {favorite.place?.admissionFee}
                                      </p>
                                    )}
                                    <p className="place-date mb-0">
                                      {new Date(favorite.addedDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="d-flex">
                                    <button
                                      className="btn btn-outline-primary btn-sm me-2"
                                      onClick={() => handlePlaceClick(favorite.placeId)}
                                    >
                                      상세보기
                                    </button>
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFavorite(favorite.placeId);
                                      }}
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                      <nav aria-label="Page navigation" className="mt-4">
                        <ul className="pagination justify-content-center">
                          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              이전
                            </button>
                          </li>
                          {[...Array(totalPages)].map((_, i) => (
                            <li
                              key={i + 1}
                              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(i + 1)}
                              >
                                {i + 1}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              다음
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </div>
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

export default FavoritesPage