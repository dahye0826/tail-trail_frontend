"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./MapViewPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"
import { mockPlaces } from "../places/mockData"

function MapViewPage() {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // 테스트용
  const [searchKeyword, setSearchKeyword] = useState("")
  const [regionFilter, setRegionFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const navigate = useNavigate()

  useEffect(()=>{
    const fetchPlaces = async () => 
      {try{
        setLoading(true)
        const response = await axios.get("http://localhost:9000/api/places/all")
        setPlaces(response.data)

      }catch(err){
        console.error("장소를 불러오기 실패:",err)
      }finally{
        setLoading(false)
      }
    }

    fetchPlaces()
  },[])

  // 필터링된 장소 목록
  const filteredPlaces = places.filter((place) => {
    const matchesSearch = searchKeyword
      ? place.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        place.address.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (place.description && place.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      : true
    const matchesRegion = regionFilter ? place.region === regionFilter : true
    const matchesCategory = categoryFilter ? place.category === categoryFilter : true

    return matchesSearch && matchesRegion && matchesCategory
  })

  // 장소 선택 핸들러
  const handlePlaceSelect = (place) => {
    setSelectedPlace(place)
  }

  // 장소 상세 페이지로 이동
  const handleViewDetail = (placeId) => {
    navigate(`/places/place/${placeId}`)
  }

  // 검색 핸들러
  const handleSearch = () => {
    // 검색 로직은 이미 filteredPlaces에서 처리됨
    console.log("Searching for:", searchKeyword)
  }

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchKeyword("")
    setRegionFilter("")
    setCategoryFilter("")
  }

  // 별점 렌더링 함수
  // const renderStars = (rating) => {
  //   return (
  //     <>
  //       {[...Array(Math.floor(rating))].map((_, i) => (
  //         <i key={i} className="bi bi-star-fill text-warning"></i>
  //       ))}
  //       {rating % 1 !== 0 && <i className="bi bi-star-half text-warning"></i>}
  //       {[...Array(5 - Math.ceil(rating))].map((_, i) => (
  //         <i key={i} className="bi bi-star text-warning"></i>
  //       ))}
  //     </>
  //   )
  // }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="map-view-background">
        <div className="container-fluid py-4">
          <div className="row">
            {/* 왼쪽 사이드바 (필터 및 장소 목록) */}
            <div className="col-md-4 col-lg-3">
              <div className="sidebar-container">
                <div className="sidebar-header">
                  <h4 className="sidebar-title">지도로 보기</h4>
                  <p className="sidebar-subtitle">반려동물과 함께 갈 수 있는 장소</p>
                </div>

                {/* 검색 및 필터 */}
                <div className="filter-section">
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="장소 검색..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button className="btn btn-primary" type="button" onClick={handleSearch}>
                      <i className="bi bi-search"></i>
                    </button>
                  </div>

                  <div className="mb-3">
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

                  <div className="mb-3">
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
                      <option value="의료시설">의료시설</option>
                    </select>
                  </div>

                  <button className="btn btn-outline-secondary w-100 mb-3" onClick={handleResetFilters}>
                    필터 초기화
                  </button>
                </div>

                {/* 장소 목록 */}
                <div className="places-list">
                  <div className="list-header">
                    <h5>검색 결과 ({filteredPlaces.length})</h5>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : filteredPlaces.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted">검색 결과가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="places-list-items">
                      {filteredPlaces.map((place) => (
                        <div
                          key={place.placeId}
                          className={`place-list-item ${selectedPlace?.id === place.id ? "active" : ""}`}
                          onClick={() => setSelectedPlace({
                            lat: Number(place.latitude),
                            lng: Number(place.longitude),
                            name: place.placeName,
                            address: place.roadAddress
                          })}
                        >
                          <h5 className="place-name">{place.placeName || "이름 없음"}</h5>
                          <p className="place-address">
                            <i className="bi bi-geo-alt me-1"></i>
                            {place.roadAddress || "주소 없음"}
                          </p>
                          {/* <div className="place-info">
                            <span className="badge category-badge me-2">{place.category}</span>
                            <span className="rating">
                              {renderStars(place.rating)}
                              <span className="rating-value ms-1">{place.rating}</span>
                            </span>
                          </div> */}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽 지도 영역 */}
            <div className="col-md-8 col-lg-9">
              <div className="map-container">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">지도를 불러오는 중...</p>
                  </div>
                ) : (
                  <KakaoMap
                    readOnly={false}
                    initialLocation={ 
                           { lat: 37.5665,
                            lng: 126.978,
                            name: "서울시청",
                            address: "서울특별시 중구 세종대로 110" 
                            }}
                    markerPositions={filteredPlaces.map((place) => ({
                    
                      lat:  place.latitude,
                      lng: place.longitude,
                      name: place.placeName,
                      address: place.roadAddress,
                      category: place.industrySub
                    }))}
                    selectedPlace={selectedPlace}
                    height="calc(100vh - 150px)"
                    showSearchBar={false}
                    defaultLevel={selectedPlace ? 3 : 7}
                  />
                )}

                {/* 선택된 장소 정보 표시 */}
                {selectedPlace && (
                  <div className="selected-place-info">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h4>{selectedPlace.name}</h4>
                        <p className="mb-1">
                          <i className="bi bi-geo-alt me-1"></i>
                          {selectedPlace.address}
                        </p>
                        {/* <div className="mb-2">
                          <span className="badge category-badge me-2">{selectedPlace.category}</span>
                          <span className="rating">
                            {renderStars(selectedPlace.rating)}
                            <span className="rating-value ms-1">{selectedPlace.rating}</span>
                          </span>
                        </div> */}
                        <p className="place-description">{selectedPlace.description}</p>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => handleViewDetail(selectedPlace.id)}>
                        상세보기
                      </button>
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

export default MapViewPage