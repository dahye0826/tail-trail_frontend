"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./PlaceListPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { mockPlaces } from "./mockData"

function PlaceListPage() {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // 로그인 상태 관리
  const [searchTerm, setSearchTerm] = useState("")
  const [regionFilter, setRegionFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  // 페이징 관련 상태 추가
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(5) // 테스트용 총 페이지 수
  const placesPerPage = 9

  useEffect(() => {
    // Fetch places from backend
    const fetchPlaces = async () => {
      try {
        setLoading(true)
        // 실제 API 연결 시 아래 주석을 해제하세요
        // const response = await axios.get('/api/places');
        // setPlaces(response.data);

        // 테스트용 목업 데이터
        setTimeout(() => {
          setPlaces(mockPlaces)
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error("Error fetching places:", error)
        setLoading(false)
      }
    }

    fetchPlaces()
  }, [])

  const handleSearch = () => {
    if (!searchTerm.trim() && !regionFilter && !categoryFilter) return

    // 실제 구현에서는 API 호출로 대체
    setLoading(true)
    setTimeout(() => {
      const filteredPlaces = mockPlaces.filter((place) => {
        const matchesSearch = searchTerm
          ? place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            place.address.toLowerCase().includes(searchTerm.toLowerCase())
          : true
        const matchesRegion = regionFilter ? place.region === regionFilter : true
        const matchesCategory = categoryFilter ? place.category === categoryFilter : true

        return matchesSearch && matchesRegion && matchesCategory
      })
      setPlaces(filteredPlaces)
      setCurrentPage(1)
      setLoading(false)
    }, 300)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handlePlaceClick = (placeId) => {
    navigate(`/places/place/${placeId}`)
  }

  // 페이지 변경 핸들러 추가
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)

    // 실제 구현에서는 여기서 해당 페이지의 데이터를 불러옵니다
    setLoading(true)
    setTimeout(() => {
      // 테스트용 데이터 - 페이지 번호에 따라 다른 데이터를 보여줍니다
      const paginatedPlaces = mockPlaces.map((place) => ({
        ...place,
        id: place.id + (page - 1) * placesPerPage,
        name: `${place.name} - 페이지 ${page}`,
      }))
      setPlaces(paginatedPlaces)
      setLoading(false)
    }, 500)
  }

  // 현재 페이지에 표시할 장소 목록
  const getCurrentPlaces = () => {
    const indexOfLastPlace = currentPage * placesPerPage
    const indexOfFirstPlace = indexOfLastPlace - placesPerPage
    return places.slice(indexOfFirstPlace, indexOfLastPlace)
  }

  // 페이지네이션 UI를 위한 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // 한 번에 보여줄 페이지 번호 개수

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = startPage + maxPagesToShow - 1

    if (endPage > totalPages) {
      endPage = totalPages
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return pageNumbers
  }

  // 별점 렌더링 함수
  const renderStars = (rating) => {
    return (
      <>
        {[...Array(Math.floor(rating))].map((_, i) => (
          <i key={i} className="bi bi-star-fill text-warning"></i>
        ))}
        {rating % 1 !== 0 && <i className="bi bi-star-half text-warning"></i>}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <i key={i} className="bi bi-star text-warning"></i>
        ))}
      </>
    )
  }

  // Update the JSX structure to use the new wrapper
  return (
    <>
      {/* 네비게이션 바 컴포넌트 */}
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="places-background">
        <div className="container mt-4 mb-5">
          <div className="places-content-wrapper">
            <div className="place-header text-center">
              <h2 className="mb-4">반려동물과 함께하는 장소</h2>
              <p className="subtitle mb-5">반려동물과 함께 방문할 수 있는 다양한 장소를 찾아보세요.</p>
            </div>

            {/* 필터 및 검색 */}
            <div className="filter-container">
              <div className="row g-3">
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                  >
                    <option value="">지역 선택</option>
                    <option value="서울">서울</option>
                    <option value="부산">부산</option>
                    <option value="제주">제주</option>
                    <option value="강원">강원</option>
                    <option value="경주">경주</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">카테고리 선택</option>
                    <option value="여행지">여행지</option>
                    <option value="숙박업소">숙박업소</option>
                    <option value="카페">카페</option>
                    <option value="식당">식당</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="장소 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button className="btn btn-primary" type="button" onClick={handleSearch}>
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 장소 목록 */}
            <div className="place-list-container">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : places.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-3 g-4">
                  {getCurrentPlaces().map((place) => (
                    <div key={place.id} className="col">
                      <div className="card h-100 place-card" onClick={() => handlePlaceClick(place.id)}>
                        <img
                          src={place.image || "/placeholder.svg?height=200&width=300"}
                          className="card-img-top"
                          alt={place.name}
                        />
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="card-title">{place.name}</h5>
                            <span className="rating">{renderStars(place.rating)}</span>
                          </div>
                          <p className="card-text location">
                            <i className="bi bi-geo-alt me-1"></i>
                            {place.address}
                          </p>
                          <div className="badges">
                            <span className="badge bg-secondary me-1">{place.category}</span>
                            {place.amenities.map((amenity, index) => (
                              <span key={index} className="badge">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>

            {/* 페이지네이션 */}
            {places.length > 0 && (
              <div className="pagination-container">
                <nav aria-label="Page navigation">
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => handlePageChange(1)} aria-label="First">
                        <i className="bi bi-chevron-double-left"></i>
                      </button>
                    </li>
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        aria-label="Previous"
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>

                    {getPageNumbers().map((number) => (
                      <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                        <button className="page-link" onClick={() => handlePageChange(number)}>
                          {number}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next">
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => handlePageChange(totalPages)} aria-label="Last">
                        <i className="bi bi-chevron-double-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>

          <div className="admin-controls-container">
            <button className="btn btn-outline-secondary me-2" onClick={() => setIsLoggedIn(!isLoggedIn)}>
              테스트: {isLoggedIn ? "로그아웃 상태로 변경" : "로그인 상태로 변경"}
            </button>
          </div>
        </div>
      </div>

      {/* 푸터 컴포넌트 */}
      <Footer />
    </>
  )
}

export default PlaceListPage

