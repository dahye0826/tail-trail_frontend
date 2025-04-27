"use client"

// MapViewPage.js - PlaceListPage 방식으로 지역/카테고리 옵션 설정 (도로명 주소에서 시(city)만 추출)

import axios from "axios"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./MapViewPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"

const API_BASE_URL = "http://localhost:9000/api"

function MapViewPage() {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [regionFilter, setRegionFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const navigate = useNavigate()

  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setSidebarVisible(true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/places/all`)
        const raw = response.data || []

        const citySet = new Set()
        const categorySet = new Set()

        const formattedPlaces = raw.map((place) => {
          const city = place.roadAddress?.split(" ")[0] || ""
          if (city) citySet.add(city)
          if (place.industrySub) categorySet.add(place.industrySub)

          return {
            id: place.placeId,
            name: place.placeName,
            address: place.roadAddress || `${place.city} ${place.district}`,
            region: city,
            category: place.industrySub || "기타",
            lat: Number(place.latitude),
            lng: Number(place.longitude),
            description: place.description || "상세 정보 없음",
          }
        })

        setPlaces(formattedPlaces)
        setCities([...citySet])
        setCategories([...categorySet])
      } catch (err) {
        console.error("장소를 불러오기 실패:", err)
        setPlaces([])
      } finally {
        setLoading(false)
      }
    }
    fetchPlaces()
  }, [])

  const filteredPlaces = places.filter((place) => {
    const matchesSearch = searchKeyword
      ? place.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        place.address.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        place.description.toLowerCase().includes(searchKeyword.toLowerCase())
      : true

    const matchesRegion = regionFilter ? place.region === regionFilter : true
    const matchesCategory = categoryFilter ? place.category === categoryFilter : true

    return matchesSearch && matchesRegion && matchesCategory
  })

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place)
    if (isMobile) {
      setSidebarVisible(false)
    }
  }

  const handleViewDetail = (placeId) => {
    navigate(`/places/place/${placeId}`)
  }

  const handleSearch = () => {
    console.log("Searching for:", searchKeyword)
  }

  const handleResetFilters = () => {
    setSearchKeyword("")
    setRegionFilter("")
    setCategoryFilter("")
  }

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="map-view-background">
        <div className="container-fluid py-4">
          <div className="row map-view-row">
            <div className={`col-md-4 col-lg-3 sidebar-col ${isMobile && !sidebarVisible ? "d-none" : ""}`}>
              <div className="sidebar-containermap">
                <div className="sidebar-header">
                  <h4 className="sidebar-title">함께 가는 지도</h4>
                </div>

                <div className="filter-section">
                  <div className="input-group">
                    <input
                      type="text"
                      className="sidebar-search-input"
                      placeholder="장소 검색..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button className="sidebar-search-btn" type="button" onClick={handleSearch}>
                      <i className="bi bi-search"></i>
                    </button>
                  </div>

                  <select
                    className="sidebar-filter-select"
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                  >
                    <option value="">지역 선택</option>
                    {cities.map((city, index) => (
                      <option key={index} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>

                  <select
                    className="sidebar-filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <button className="sidebar-reset-btn" onClick={handleResetFilters}>
                    필터 초기화
                  </button>
                </div>

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
                          key={place.id}
                          className={`place-list-item ${selectedPlace?.id === place.id ? "active" : ""}`}
                          onClick={() => handlePlaceSelect(place)}
                        >
                          <div className="place-name">{place.name || "이름 없음"}</div>
                          <div className="place-address">
                            <i className="bi bi-geo-alt me-1"></i>
                            {place.address || "주소 없음"}
                          </div>
                          <span className="place-category">{place.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`col-md-8 col-lg-9 map-col ${isMobile && sidebarVisible ? "d-none" : ""}`}>
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
                    initialLocation={null}
                    markerPositions={filteredPlaces.map((place) => ({
                      id: place.id,
                      lat: place.lat,
                      lng: place.lng,
                      name: place.name,
                      address: place.address,
                      category: place.category,
                    }))}
                    selectedPlace={selectedPlace}
                    height="calc(100vh - 150px)"
                    showSearchBar={false}
                    defaultLevel={selectedPlace ? 3 : 7}
                    showInfoCard={true}
                    onLocationSelect={handlePlaceSelect}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isMobile && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i className={`bi ${sidebarVisible ? "bi-map" : "bi-list"}`}></i>
        </button>
      )}

      <Footer />
    </>
  )
}
export default MapViewPage
