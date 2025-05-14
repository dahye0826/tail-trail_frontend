import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./MapViewPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"

const API_BASE_URL = "http://localhost:9000/api"

// 커스텀 드롭다운 컴포넌트
function CustomDropdown({ options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || "")
  const dropdownRef = useRef(null)

  useEffect(() => {
    setSelectedValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (option) => {
    setSelectedValue(option)
    onChange(option)
    setIsOpen(false)
  }

  const displayValue = selectedValue || placeholder

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className={`dropdown-header ${isOpen ? "active" : ""}`} onClick={() => setIsOpen(!isOpen)}>
        <span>{displayValue}</span>
        <i className={`bi bi-chevron-down dropdown-icon ${isOpen ? "open" : ""}`}></i>
      </div>
      <div className={`dropdown-menu ${isOpen ? "open" : ""}`}>
        <div className={`dropdown-item ${selectedValue === "" ? "selected" : ""}`} onClick={() => handleSelect("")}>
          {placeholder}
        </div>
        {options.map((option, index) => (
          <div
            key={index}
            className={`dropdown-item ${selectedValue === option ? "selected" : ""}`}
            onClick={() => handleSelect(option)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  )
}

// 별점 렌더링 함수 추가
function renderStarRating(rating) {
  if (!rating)
    return (
      <span className="star-rating">
        <i className="bi bi-star text-warning"></i>
        <i className="bi bi-star text-warning"></i>
        <i className="bi bi-star text-warning"></i>
        <i className="bi bi-star text-warning"></i>
        <i className="bi bi-star text-warning"></i>
        <span className="ms-1">(0)</span>
      </span>
    )

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating - fullStars >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <span className="star-rating">
      {[...Array(fullStars)].map((_, i) => (
        <i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>
      ))}
      {hasHalfStar && <i className="bi bi-star-half text-warning"></i>}
      {[...Array(emptyStars)].map((_, i) => (
        <i key={`empty-${i}`} className="bi bi-star text-warning"></i>
      ))}
      <span className="ms-1">({rating.toFixed(1)})</span>
    </span>
  )
}

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
  const [mapHeight, setMapHeight] = useState("calc(100vh - 150px)")
  const navigate = useNavigate()

  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [averageRatings, setAverageRatings] = useState({})

  const [sortByRating, setSortByRating] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth
      setIsMobile(windowWidth <= 768)

      if (windowWidth <= 768) {
        setMapHeight("300px")
        setSidebarVisible(true)
      } else {
        setMapHeight("calc(100vh - 150px)")
        setSidebarVisible(true)
      }
    }
    handleResize()
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

  useEffect(() => {
    const fetchAverageRatings = async () => {
      const response = await axios.get(`${API_BASE_URL}/visited-place/average-ratings`)
      setAverageRatings(response.data)
    }

    fetchAverageRatings()
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


  const sortedPlaces = sortByRating
    ? [...filteredPlaces].sort((a, b) => {
        const ratingA = averageRatings[a.id] || 0
        const ratingB = averageRatings[b.id] || 0
        return ratingB - ratingA 
      })
    : filteredPlaces

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place)
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

  const toggleSortByRating = () => {
    setSortByRating(!sortByRating)
  }

  return (
    <div className="map-page-wrapper">
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="map-view-background">
        <div className="container-fluid py-4">
          {isMobile && (
            <div className="mobile-map-container mb-4">
              <h4 className="sidebar-title mb-3">함께 가는 지도</h4>
              <div className="mobile-map-wrapper">
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
                    markerPositions={sortedPlaces.map((place) => ({
                      id: place.id,
                      lat: place.lat,
                      lng: place.lng,
                      name: place.name,
                      address: place.address,
                      category: place.category,
                      rating: averageRatings[place.id] || 0.0,
                    }))}
                    selectedPlace={selectedPlace}
                    height="300px"
                    showSearchBar={false}
                    defaultLevel={selectedPlace ? 3 : 7}
                    showInfoCard={true}
                    onLocationSelect={handlePlaceSelect}
                    review={selectedPlace?.review}
                  />
                )}
              </div>
            </div>
          )}

          <div className="row map-view-row g-3">
            {/* 사이드바 */}
            <div className={`col-md-4 col-lg-3 sidebar-col`}>
              <div className="sidebar-containermap">
                {!isMobile && (
                  <div className="sidebar-header">
                    <h4 className="sidebar-title">함께 가는 지도</h4>
                  </div>
                )}

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

                  <CustomDropdown
                    options={cities}
                    value={regionFilter}
                    onChange={setRegionFilter}
                    placeholder="지역 선택"
                  />

                  <CustomDropdown
                    options={categories}
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    placeholder="카테고리 선택"
                  />

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
                    <div className="places-list-items-scrollable">
                      {sortedPlaces.map((place) => {
                        const placeRating = averageRatings[place.id] || 0.0

                        return (
                          <div
                            key={place.id}
                            className={`place-list-item ${selectedPlace?.id === place.id ? "active" : ""}`}
                            onClick={() => handlePlaceSelect(place)}
                          >
                            <div className="place-name">{place.name || "이름 없음"}</div>

                            <div className="place-info-rating">{renderStarRating(placeRating)}</div>

                            <div className="place-address">
                              <i className="bi bi-geo-alt me-1"></i>
                              {place.address || "주소 없음"}
                            </div>
                            <span className="place-category">{place.category}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 지도 (데스크톱 전용) */}
            {!isMobile && (
              <div className="col-md-8 col-lg-9 map-col">
                <div className="map-container">
                  <button
                    className={`rating-sort-button ${sortByRating ? "active" : ""}`}
                    onClick={toggleSortByRating}
                    title="별점 높은 순으로 정렬"
                  >
                    <i className="bi bi-star-fill me-1"></i> 별점 순
                  </button>
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
                      markerPositions={sortedPlaces.map((place) => ({
                        id: place.id,
                        lat: place.lat,
                        lng: place.lng,
                        name: place.name,
                        address: place.address,
                        category: place.category,
                        rating: averageRatings[place.id] || 0.0,
                      }))}
                      selectedPlace={selectedPlace}
                      height={mapHeight}
                      showSearchBar={false}
                      defaultLevel={selectedPlace ? 3 : 7}
                      showInfoCard={true}
                      onLocationSelect={handlePlaceSelect}
                      review={selectedPlace?.review}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
export default MapViewPage
