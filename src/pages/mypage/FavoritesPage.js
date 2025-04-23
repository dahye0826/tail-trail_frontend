"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./MyPageStyles.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { favoriteAPI, placeAPI } from "../../services/api"

const FavoritesPage = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [placeDetails, setPlaceDetails] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 10

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        // 로그인 상태 확인
        const loginStatus = localStorage.getItem("isLoggedIn") === "true"
        setIsLoggedIn(loginStatus)
        
        if (!loginStatus) {
          navigate("/login")
          return
        }
        
        const userId = localStorage.getItem("userId")
        console.log('사용자 ID:', userId)
        
        if (!userId) {
          navigate("/login")
          return
        }
        
        // 즐겨찾기 목록 가져오기
        const response = await favoriteAPI.getFavorites(userId, currentPage, pageSize)
        console.log('API 응답:', response.data)
        
        // 백엔드 응답 구조에 맞게 데이터 처리
        if (response.data) {
          const favoritesData = response.data.favorites || []
          
          setFavorites(favoritesData)
          setTotalPages(response.data.totalPages || 0)
          setTotalItems(response.data.totalItems || 0)
          
          // 데이터가 있는 경우만 장소 상세 정보 요청
          if (favoritesData.length > 0) {
            // 각 장소 ID에 대한 장소 상세 정보 가져오기
            const placeDetailsMap = {}
            
            // 각 즐겨찾기 항목에 대해 장소 상세 정보 요청
            for (const favorite of favoritesData) {
              try {
                const placeResponse = await placeAPI.getPlaceById(favorite.placeId)
                if (placeResponse && placeResponse.data) {
                  placeDetailsMap[favorite.placeId] = placeResponse.data
                }
              } catch (err) {
                console.error(`장소 ID ${favorite.placeId} 정보 가져오기 오류:`, err)
              }
            }
            
            setPlaceDetails(placeDetailsMap)
          }
        }
        
        setLoading(false)
      } catch (err) {
        console.error("즐겨찾기 로딩 오류:", err)
        setError("즐겨찾기 목록을 불러오는데 실패했습니다.")
        setLoading(false)
        
        // 테스트용 더미 데이터 제공
        provideMockData()
      }
    }
    
    // 테스트용 더미 데이터 함수
    const provideMockData = () => {
      const mockFavorites = [
        {
          favoriteId: 1,
          userId: Number(localStorage.getItem("userId")) || 1,
          placeId: 101,
          addedDate: "2023-05-15T10:30:00"
        },
        {
          favoriteId: 2,
          userId: Number(localStorage.getItem("userId")) || 1,
          placeId: 102,
          addedDate: "2023-04-20T14:20:00"
        }
      ]
      
      const mockPlaceDetails = {
        101: {
          placeId: 101,
          placeName: "서울 반려동물 놀이터",
          placeImage: "/api/placeholder/400/300",
          city: "서울",
          district: "강남구",
          roadAddress: "서울특별시 강남구 테헤란로 123",
          petRestrictions: "제한사항 없음",
          description: "넓은 공간에서 반려동물과 함께 놀 수 있는 곳"
        },
        102: {
          placeId: 102,
          placeName: "해운대 반려견 비치파크",
          placeImage: "/api/placeholder/400/300",
          city: "부산",
          district: "해운대구",
          roadAddress: "부산광역시 해운대구 해운대해변로 123",
          petRestrictions: "리드줄 필수",
          description: "바다를 보며 반려견과 산책할 수 있는 해변 공원"
        }
      }
      
      setFavorites(mockFavorites)
      setPlaceDetails(mockPlaceDetails)
      setTotalItems(mockFavorites.length)
      setTotalPages(1)
    }

    fetchFavorites()
  }, [navigate, currentPage, pageSize])

  // 즐겨찾기 삭제 처리
  const handleRemoveFavorite = async (userId, placeId, favoriteId) => {
  // 변경 후
  if (!window.confirm("정말로 이 즐겨찾기를 삭제하시겠습니까?")) {
  return
  }
    
    try {
      await favoriteAPI.removeFavorite(userId, placeId)
      // 삭제 후 목록 갱신
      setFavorites(favorites.filter(fav => fav.favoriteId !== favoriteId))
      setTotalItems(prev => prev - 1)
      
      // 현재 페이지에 항목이 없고, 이전 페이지가 있으면 이전 페이지로 이동
      if (favorites.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
      }
    } catch (err) {
      console.error("즐겨찾기 삭제 오류:", err)
      setError("즐겨찾기를 삭제하는데 실패했습니다.")
    }
  }

  // 페이지 변경 처리
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  // 날짜 형식 변환 함수
  const formatDate = (dateString) => {
    if (!dateString) return "날짜 정보 없음"
    
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

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
                      favorites.map((favorite) => {
                        const place = placeDetails[favorite.placeId]
                        return place ? (
                          <div key={favorite.favoriteId} className="card mb-3">
                            <div className="row g-0">
                              <div className="col-md-4">
                                <img
                                  src={place?.placeImage || "/api/placeholder/400/300"}
                                  className="img-fluid rounded-start"
                                  alt={place?.placeName || "장소 이미지"}
                                  style={{height: "100%", objectFit: "cover"}}
                                />
                              </div>
                              <div className="col-md-8">
                                <div className="card-body">
                                  <span className="badge bg-primary mb-2">
                                    {place?.city || "지역"} {place?.district || ""}
                                  </span>
                                  <h5 className="card-title">{place?.placeName || "장소명"}</h5>
                                  <p className="card-text">
                                    <small>
                                      <i className="bi bi-geo-alt me-1"></i>
                                      {place?.roadAddress || place?.fullAddress || "주소 정보 없음"}
                                    </small>
                                  </p>
                                  
                                  {place?.petRestrictions && (
                                    <p className="card-text">
                                      <small>
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        반려동물 제한: {place.petRestrictions}
                                      </small>
                                    </p>
                                  )}
                                  
                                  <p className="card-text">
                                    {place?.description || "설명 정보 없음"}
                                  </p>
                                  
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">
                                      <i className="bi bi-calendar3"></i> {formatDate(favorite.addedDate)}
                                    </span>
                                    
                                    <div>
                                      <Link 
                                        to={`/places/place/${favorite.placeId}`} 
                                        className="btn btn-sm btn-outline-primary me-2"
                                      >
                                        <i className="bi bi-eye me-1"></i> 상세보기
                                      </Link>
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => {
                                          const userId = localStorage.getItem("userId")
                                          handleRemoveFavorite(userId, favorite.placeId, favorite.favoriteId)
                                        }}
                                      >
                                        <i className="bi bi-x-circle me-1"></i> 삭제
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null
                      })
                    )}
                    
                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                      <nav aria-label="Page navigation">
                        <ul className="pagination justify-content-center">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(currentPage - 1)}
                            >
                              이전
                            </button>
                          </li>
                          
                          {[...Array(totalPages).keys()].map((page) => (
                            <li 
                              key={page + 1} 
                              className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}
                            >
                              <button 
                                className="page-link" 
                                onClick={() => handlePageChange(page + 1)}
                              >
                                {page + 1}
                              </button>
                            </li>
                          ))}
                          
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(currentPage + 1)}
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