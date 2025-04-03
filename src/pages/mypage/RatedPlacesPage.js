"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./MyPageStyles.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

const RatedPlacesPage = () => {
  const [ratedPlaces, setRatedPlaces] = useState([])
  const [filteredPlaces, setFilteredPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [isLoggedIn, setIsLoggedIn] = useState(true) // For Navbar

  useEffect(() => {
    const loadRatedPlaces = async () => {
      try {
        // 실제 API 호출 대신 목업 데이터 사용
        setTimeout(() => {
          const mockRatedPlaces = [
            {
              id: 1,
              name: "해운대 반려견 비치파크",
              city: "부산",
              road_address: "부산광역시 해운대구 우동",
              rating_date: "2023-05-10",
              rating: 4.5,
              comment: "넓은 공간에서 반려견과 함께 즐길 수 있어 좋았습니다. 다양한 시설도 잘 갖춰져 있어요.",
              image: "/placeholder.svg?height=200&width=300",
            },
            {
              id: 2,
              name: "멍멍 애견카페",
              city: "서울",
              road_address: "서울시 강남구 테헤란로 123",
              rating_date: "2023-04-15",
              rating: 4.2,
              comment: "친절한 직원분들과 깨끗한 환경이 인상적이었습니다. 다양한 간식도 맛있어요.",
              image: "/placeholder.svg?height=200&width=300",
            },
            {
              id: 3,
              name: "펫 프렌들리 호텔",
              city: "제주",
              road_address: "제주시 애월읍 해안로 123",
              rating_date: "2023-03-20",
              rating: 4.8,
              comment: "반려견을 위한 배려가 돋보이는 호텔입니다. 객실도 넓고 청결하며 서비스도 훌륭해요.",
              image: "/placeholder.svg?height=200&width=300",
            },
            {
              id: 4,
              name: "가평 글램핑장",
              city: "경기",
              road_address: "경기도 가평군 청평면",
              rating_date: "2023-02-25",
              rating: 4.0,
              comment: "자연 속에서 반려견과 함께 힐링할 수 있는 좋은 장소입니다. 다만 시설이 조금 노후되어 있어요.",
              image: "/placeholder.svg?height=200&width=300",
            },
          ]

          setRatedPlaces(mockRatedPlaces)
          setFilteredPlaces(mockRatedPlaces)
          setLoading(false)
        }, 1000)
      } catch (err) {
        setError("별점 등록한 장소를 불러오는데 실패했습니다.")
        console.error(err)
        setLoading(false)
      }
    }

    loadRatedPlaces()
  }, [])

  useEffect(() => {
    let result = [...ratedPlaces]

    if (searchTerm) {
      result = result.filter(
        (place) =>
          place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          place.road_address.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filter !== "all") {
      result = result.filter((place) => place.city === filter)
    }

    setFilteredPlaces(result)
  }, [searchTerm, filter, ratedPlaces])

  const cities = ["all", ...new Set(ratedPlaces.map((place) => place.city))]

  // 별점 렌더링 함수
  const renderStars = (rating) => {
    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`bi ${i < Math.floor(rating) ? "bi-star-fill" : i < rating ? "bi-star-half" : "bi-star"}`}
          ></i>
        ))}
      </div>
    )
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
                  <li className="sidebar-menu-item active">
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
                  <h2 className="mypage-title">별점 등록한 곳</h2>
                  <p className="mypage-subtitle">내가 방문하고 별점을 남긴 반려동물 친화 장소들을 확인하세요.</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="장소명 또는 주소로 검색"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                      <option value="all">전체 지역</option>
                      {cities
                        .filter((city) => city !== "all")
                        .map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: "var(--primary-color)" }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">별점 등록한 장소를 불러오는 중...</p>
                  </div>
                ) : filteredPlaces.length === 0 ? (
                  <div className="alert alert-info">
                    {searchTerm || filter !== "all"
                      ? "검색 조건에 맞는 별점 등록한 장소가 없습니다."
                      : "별점을 등록한 장소가 없습니다. 반려동물과 함께 여행하고 평가해보세요!"}
                  </div>
                ) : (
                  <div>
                    <p className="text-end mb-3 text-muted small">
                      총 {filteredPlaces.length}개의 장소에 별점을 등록했습니다.
                    </p>

                    <div className="row">
                      {filteredPlaces.map((place) => (
                        <div key={place.id} className="col-md-6 mb-4">
                          <div className="rated-place-card h-100">
                            <div className="row g-0 h-100">
                              <div className="col-md-5">
                                <img
                                  src={place.image || "/placeholder.svg"}
                                  className="img-fluid rated-place-image"
                                  alt={place.name}
                                />
                              </div>
                              <div className="col-md-7">
                                <div className="card-body d-flex flex-column h-100">
                                  <div>
                                    <span className="badge">{place.city}</span>
                                    <h5 className="card-title">{place.name}</h5>
                                    <p className="card-text">
                                      <i className="bi bi-geo-alt me-1"></i> {place.road_address}
                                    </p>
                                  </div>

                                  <div className="comment-text">"{place.comment}"</div>

                                  <div className="mt-auto">
                                    <div className="d-flex align-items-center mb-2">
                                      {renderStars(place.rating)}
                                      <span className="rating-value">{place.rating}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <span className="rating-date">
                                        <i className="bi bi-calendar3"></i> {place.rating_date}
                                      </span>
                                      <Link to={`/places/place/${place.id}`} className="btn btn-sm btn-outline-primary">
                                        상세보기
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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

export default RatedPlacesPage

