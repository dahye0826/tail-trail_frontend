"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./PlaceListPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import axios from "axios"
import { favoriteAPI } from "../../services/api"

const API_BASE_URL = "http://localhost:9000/api"
const ML_SERVER_URL = "http://localhost:9001"

function PlaceListPage() {
  // State management
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [partialLoading, setPartialLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [regionFilter, setRegionFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [subCategoryFilter, setSubCategoryFilter] = useState("")
  const [petSizeFilter, setPetSizeFilter] = useState("")
  const [petSizeDisplay, setPetSizeDisplay] = useState({})
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [favorites, setFavorites] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(5)
  const [totalResults, setTotalResults] = useState(0)
  const [error, setError] = useState(null)
  const [recommendedPlaces, setRecommendedPlaces] = useState([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const placesPerPage = 9

  // Constants
  const categoryMapping = useMemo(
    () => ({
      여행지: ["여행지"],
      숙박업소: ["펜션", "호텔"],
      카페: ["카페"],
      식당: ["식당"],
      박물관: ["박물관"],
      문예회관: ["문예회관"],
    }),
    [],
  )

  const petSizes = useMemo(
    () => [
      { value: "small", label: "소형견" },
      { value: "medium", label: "중형견" },
      { value: "large", label: "대형견" },
    ],
    [],
  )

  // Initialize data and check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const userId = localStorage.getItem("userId");
      console.log("Checking login status - UserId:", userId);
      
      // userId가 존재하면 로그인 상태로 간주
      const loggedIn = !!userId;
      console.log("Setting isLoggedIn to:", loggedIn);
      setIsLoggedIn(loggedIn);
      
      return loggedIn;
    };

    const fetchInitialData = async () => {
      try {
        // 먼저 로그인 상태 확인
        const isUserLoggedIn = checkLoginStatus();
        
        // Load cities and categories
        const [citiesResponse, categoriesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/places/cities`),
          axios.get(`${API_BASE_URL}/places/categories`),
        ])

        if (citiesResponse.data) setCities(citiesResponse.data)
        if (categoriesResponse.data) setCategories(categoriesResponse.data)

        // 로그인된 경우에만 즐겨찾기 로드
        if (isUserLoggedIn) {
          await fetchFavorites()
        }
      } catch (error) {
        console.error("Error fetching initial data:", error)
      }
    }

    fetchInitialData()
  }, [])

  // 로그인 상태 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      const userId = localStorage.getItem("userId");
      const newLoginStatus = !!userId;
      console.log("Storage changed - New login status:", newLoginStatus);
      setIsLoggedIn(newLoginStatus);
    };

    // storage 이벤트 리스너 추가
    window.addEventListener('storage', handleStorageChange);
    
    // 초기 로그인 상태 확인
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fetch user favorites
  const fetchFavorites = async () => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) return

      const response = await favoriteAPI.getFavorites(userId, 1, 1000)
      if (response && response.data) {
        const favoritesData = response.data.favorites || response.data.content || response.data
        const favoriteIds = Array.isArray(favoritesData) 
          ? favoritesData.map(fav => fav.placeId || fav)
          : []
        console.log("Loaded favorites:", favoriteIds)
        setFavorites(favoriteIds)
      }
    } catch (error) {
      console.error("즐겨찾기 로드 오류:", error)
    }
  }

  // Update subcategories when category changes
  useEffect(() => {
    if (categoryFilter) {
      setSubCategories(categoryMapping[categoryFilter] || [])
      setSubCategoryFilter("")
    } else {
      setSubCategories([])
    }
  }, [categoryFilter, categoryMapping])

  // Calculate pet size categories
  const calculatePetSizeCategories = useCallback((petSizeStr) => {
    if (!petSizeStr) return []

    const sizes = []
    const lowerPetSize = petSizeStr.toLowerCase()

    // Universal indicators
    if (lowerPetSize.includes("모두") || lowerPetSize.includes("전체")) {
      return ["small", "medium", "large"]
    }

    // Text-based indicators
    if (lowerPetSize.includes("소형")) sizes.push("small")
    if (lowerPetSize.includes("중형")) sizes.push("medium")
    if (lowerPetSize.includes("대형")) sizes.push("large")

    // Weight-based parsing
    const weightMatch = lowerPetSize.match(/(\d+)\s*kg/)
    if (weightMatch) {
      const weight = Number.parseInt(weightMatch[1])
      if (weight < 10) sizes.push("small")
      else if (weight >= 10 && weight < 25) sizes.push("medium")
      else if (weight >= 25) sizes.push("large")
    }

    return [...new Set(sizes)]
  }, [])

  // Fetch places data with filters
  const fetchPlaces = useCallback(async () => {
    try {
      setPartialLoading(true)

      // Prepare filter parameters
      const params = {
        page: currentPage,
        size: placesPerPage,
        search: searchTerm || undefined,
        city: regionFilter || undefined,
        petSize: petSizeFilter || undefined,
      }

      // Handle category/subcategory filtering
      if (subCategoryFilter) {
        params.industry = subCategoryFilter
      } else if (categoryFilter) {
        params.industry = categoryFilter === "숙박업소" ? "펜션" : categoryFilter
      }

      const response = await axios.get(`${API_BASE_URL}/places`, { params })

      if (response.data && response.data.places) {
        setPlaces(response.data.places)
        setTotalPages(response.data.totalPages || 1)
        setTotalResults(response.data.totalCount || 0)
      } else {
        setPlaces([])
        setTotalPages(1)
        setTotalResults(0)
      }
      setError(null)
    } catch (error) {
      console.error("Error fetching places:", error)
      setError(
        error.response
          ? `서버 오류: ${error.response.status}`
          : error.request
            ? "서버 응답이 없습니다. 연결을 확인해주세요."
            : `오류: ${error.message}`,
      )
      setPlaces([])
    } finally {
      setLoading(false)
      setPartialLoading(false)
    }
  }, [currentPage, searchTerm, categoryFilter, subCategoryFilter, regionFilter, petSizeFilter, placesPerPage])

  useEffect(() => {
    fetchPlaces()
  }, [fetchPlaces])

  // Process pet size information
  useEffect(() => {
    if (!places.length) return

    const sizeDisplayMap = {}
    places.forEach((place) => {
      if (place.placeId) {
        sizeDisplayMap[place.placeId] =
          place.petSizeCategories?.length > 0 ? place.petSizeCategories : calculatePetSizeCategories(place.petSize)
      }
    })
    setPetSizeDisplay(sizeDisplayMap)
  }, [places, calculatePetSizeCategories])

  // 추천 장소 로드
  useEffect(() => {
    console.log("Recommendation useEffect - isLoggedIn:", isLoggedIn);
    const loadRecommendations = async () => {
      const userId = localStorage.getItem("userId");
      console.log("Current userId:", userId);
      
      if (!userId) {
        console.log("No userId found, skipping recommendations");
        return;
      }

      try {
        console.log("Starting to load recommendations...");
        setLoadingRecommendations(true);
        
        const response = await axios.post(`${ML_SERVER_URL}/recommend`, { userId });
        console.log("Recommendation response:", response.data);

        if (response.data && response.data.recommendedPlaceIds) {
          const top3Ids = response.data.recommendedPlaceIds.slice(0, 3);
          console.log("Top 3 recommended place IDs:", top3Ids);
          
          const placeDetailsPromises = top3Ids.map(placeId => 
            axios.get(`${API_BASE_URL}/places/${placeId}`)
          );
          
          const placeDetailsResponses = await Promise.all(placeDetailsPromises);
          const placeDetails = placeDetailsResponses.map(response => response.data);
          console.log("Place details:", placeDetails);
          
          setRecommendedPlaces(placeDetails);
        }
      } catch (error) {
        console.error("추천 장소 로드 실패:", error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    if (isLoggedIn) {
      loadRecommendations();
    }
  }, [isLoggedIn]);

  // Event handlers
  const handleSearch = () => setCurrentPage(1)

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return
    setCurrentPage(pageNumber)
    window.scrollTo({
      top: document.querySelector(".place-list-container").offsetTop - 100,
      behavior: "smooth",
    })
  }

  const handlePlaceClick = (placeId) => navigate(`/places/place/${placeId}`)

  const handleFavoriteToggle = useCallback(
    async (placeId, e) => {
      e.stopPropagation()
      if (!isLoggedIn) {
        navigate("/login", { state: { from: location } })
        return
      }

      try {
        const userId = localStorage.getItem("userId")
        if (!userId) {
          alert("로그인이 필요한 서비스입니다.")
          navigate("/login")
          return
        }

        const isFavorited = favorites.includes(placeId)
        
        // Use the toggle endpoint directly, which works in PlaceDetailPage
        const response = await axios.post(`${API_BASE_URL}/favorites/toggle`, null, {
          params: {
            userId: Number(userId),
            placeId: Number(placeId)
          }
        })
        
        console.log("즐겨찾기 토글 응답:", response.data)
        
        if (response.data.success) {
          // Update UI based on server response
          if (response.data.isAdded) {
            setFavorites(prev => [...prev, placeId])
            alert("즐겨찾기에 추가되었습니다.")
          } else {
            setFavorites(prev => prev.filter(id => id !== placeId))
            alert("즐겨찾기가 해제되었습니다.")
          }
        }
      } catch (error) {
        console.error("즐겨찾기 처리 오류:", error)
        alert("즐겨찾기 업데이트 중 오류가 발생했습니다.")
      }
    },
    [isLoggedIn, navigate, location, favorites]
  )

  const handleResetFilters = () => {
    setRegionFilter("")
    setCategoryFilter("")
    setSubCategoryFilter("")
    setPetSizeFilter("")
    setSearchTerm("")
    setCurrentPage(1)
  }

  // Helper rendering functions
  const renderPetSizeTags = useCallback(
    (placeId) => {
      const sizes = petSizeDisplay[placeId] || []
      if (!sizes.length) return null

      return (
        <div className="pet-sizes">
          {sizes.includes("small") && (
            <span className={`pet-tag ${petSizeFilter === "small" ? "pet-tag-active" : ""}`}>소형견</span>
          )}
          {sizes.includes("medium") && (
            <span className={`pet-tag ${petSizeFilter === "medium" ? "pet-tag-active" : ""}`}>중형견</span>
          )}
          {sizes.includes("large") && (
            <span className={`pet-tag ${petSizeFilter === "large" ? "pet-tag-active" : ""}`}>대형견</span>
          )}
        </div>
      )
    },
    [petSizeDisplay, petSizeFilter],
  )

  const getCategoryBadgeClass = useCallback((categoryLabel) => {
    switch (categoryLabel) {
      case "카페":
        return "bg-info"
      case "식당":
        return "bg-success"
      case "펜션":
        return "bg-warning"
      case "호텔":
        return "bg-warning text-dark"
      case "여행지":
        return "bg-primary"
      case "박물관":
        return "bg-secondary"
      case "문예회관":
        return "bg-dark"
      default:
        return "bg-primary"
    }
  }, [])

  const renderPaginationItems = useCallback(() => {
    const items = []
    const maxPageButtons = 5 // Reduced from 10 for cleaner UI

    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1)

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1)
    }

    // First and previous buttons
    items.push(
      <li key="first" className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => handlePageChange(1)} aria-label="First">
          <span aria-hidden="true">&laquo;&laquo;</span>
        </button>
      </li>,
      <li key="prev" className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </button>
      </li>,
    )

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>,
      )
    }

    // Next and last buttons
    items.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </button>
      </li>,
      <li key="last" className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => handlePageChange(totalPages)} aria-label="Last">
          <span aria-hidden="true">&raquo;&raquo;</span>
        </button>
      </li>,
    )

    return items
  }, [currentPage, totalPages, handlePageChange])

  const renderPlaceCard = (place) => {
    const isFavorited = favorites.includes(place.placeId)

    const handleCardClick = () => {
      handlePlaceClick(place.placeId)
    }

    return (
      <div className="col" key={place.placeId}>
        <div
          className="card h-100 place-card"
          onClick={handleCardClick}
          tabIndex="0"
          onKeyPress={(e) => e.key === "Enter" && handleCardClick()}
          aria-label={`${place.placeName} - ${place.city} ${place.district}`}
        >
          <div className="card-img-container">
            <img
              src={place.placeImage ? `http://localhost:9000${place.placeImage}` : "/assets/default-pet-place.jpg"}
              className="card-img-top"
              alt={place.placeName}
              loading="lazy"
              onError={(e) => { e.target.src = "/assets/default-pet-place.jpg" }}
            />
            {isLoggedIn && (
              <button
                className="btn-favorite"
                onClick={(e) => handleFavoriteToggle(place.placeId, e)}
                aria-label={isFavorited ? "즐겨찾기 삭제" : "즐겨찾기 추가"}
              >
                <i className={`bi ${isFavorited ? "bi-heart-fill" : "bi-heart"}`}></i>
              </button>
            )}
          </div>
          <div className="card-body">
            <span className={`badge ${getCategoryBadgeClass(place.industryMain)}`}>{place.industryMain}</span>
            <h5 className="card-title mt-2">{place.placeName}</h5>
            <p className="card-text">
              <i className="bi bi-geo-alt me-1"></i> {place.city} {place.district}
            </p>
            <div className="card-meta">
              {renderPetSizeTags(place.placeId)}
              {place.rating > 0 && (
                <span className="rating">
                  <i className="bi bi-star-fill"></i> {place.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const CustomDropdown = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleSelect = (option) => {
      onChange(option);
      setIsOpen(false);
    };

    const selectedLabel = value ? options.find(opt => opt.value === value)?.label : placeholder;

    return (
      <div className="custom-dropdown" ref={dropdownRef}>
        <div 
          className={`dropdown-header ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedLabel}</span>
          <i className={`bi bi-chevron-down dropdown-icon ${isOpen ? 'open' : ''}`}></i>
        </div>
        {isOpen && (
          <div className="dropdown-menu open">
            {options.map((option) => (
              <div
                key={option.value}
                className={`dropdown-item ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render main component
  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
{/* /**zz */}
      <div className="places-background">
        <div className="container mt-4 mb-5">
          <div className="places-content-wrapper">
            {/* Header */}
            <div className="place-header">
              <h2>반려동물과 함께하는 장소</h2>
              <p className="subtitle">반려동물과 함께 방문할 수 있는 다양한 장소를 찾아보세요.</p>
            </div>

            {/* 추천 장소 섹션 - 필터 컨테이너 위로 이동 */}
            {isLoggedIn && (
              <div className="recommended-section mb-4">
                <h4 className="mb-3">좋아할만한 장소</h4>
                <div className="row row-cols-1 row-cols-md-3 g-4">
                  {loadingRecommendations ? (
                    <div className="col-12 text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : recommendedPlaces.length > 0 ? (
                    recommendedPlaces.map((place) => (
                      <div key={place.placeId} className="col">
                        <div
                          className="card h-100 place-card"
                          onClick={() => handlePlaceClick(place.placeId)}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src={place.placeImage ? `http://localhost:9000${place.placeImage}` : "/assets/default-pet-place.jpg"}
                            className="card-img-top"
                            alt={place.placeName}
                            loading="lazy"
                            onError={(e) => { e.target.src = "/assets/default-pet-place.jpg" }}
                          />
                          <div className="card-body">
                            <span className={`badge ${getCategoryBadgeClass(place.industryMain)}`}>
                              {place.industryMain}
                            </span>
                            <h5 className="card-title mt-2">{place.placeName}</h5>
                            <p className="card-text">
                              <i className="bi bi-geo-alt me-1"></i> {place.city} {place.district}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <p className="text-center">추천할 장소가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Filters and search */}
            <div className="filter-container p-3 mb-4 rounded shadow-sm">
              <div className="row g-3">
                <div className="col-md-3">
                  <CustomDropdown
                    options={[
                      { value: "", label: "지역 선택" },
                      ...cities.map(city => ({ value: city, label: city }))
                    ]}
                    value={regionFilter}
                    onChange={(value) => {
                      setRegionFilter(value);
                      setCurrentPage(1);
                    }}
                    placeholder="지역 선택"
                  />
                </div>
                <div className="col-md-2">
                  <CustomDropdown
                    options={[
                      { value: "", label: "카테고리 선택" },
                      ...Object.keys(categoryMapping).map(category => ({ value: category, label: category }))
                    ]}
                    value={categoryFilter}
                    onChange={(value) => {
                      setCategoryFilter(value);
                      setCurrentPage(1);
                    }}
                    placeholder="카테고리 선택"
                  />
                </div>
                {categoryFilter === "숙박업소" && (
                  <div className="col-md-2">
                    <CustomDropdown
                      options={[
                        { value: "", label: "세부 카테고리" },
                        ...subCategories.map(subCat => ({ value: subCat, label: subCat }))
                      ]}
                      value={subCategoryFilter}
                      onChange={(value) => {
                        setSubCategoryFilter(value);
                        setCurrentPage(1);
                      }}
                      placeholder="세부 카테고리"
                    />
                  </div>
                )}
                <div className="col-md-2">
                  <CustomDropdown
                    options={[
                      { value: "", label: "반려견 크기" },
                      ...petSizes.map(size => ({ value: size.value, label: size.label }))
                    ]}
                    value={petSizeFilter}
                    onChange={(value) => {
                      setPetSizeFilter(value);
                      setCurrentPage(1);
                    }}
                    placeholder="반려견 크기"
                  />
                </div>
                <div className={categoryFilter === "숙박업소" ? "col-md-3" : "col-md-5"}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="장소 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      aria-label="장소 검색"
                    />
                    <button className="btn btn-primary" type="button" onClick={handleSearch} aria-label="검색">
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter control buttons */}
              <div className="d-flex justify-content-between mt-3">
                <div>
                  <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={handleResetFilters}
                    aria-label="필터 초기화"
                  >
                    <i className="bi bi-x-circle me-1"></i> 필터 초기화
                  </button>
                </div>
              </div>
            </div>

            {/* Search results summary */}
            {!loading && places && (
              <div className="search-summary mb-3">
                <p className="m-0">
                  <strong>{totalResults}</strong>개의 장소를 찾았습니다
                  {regionFilter && ` - ${regionFilter}`}
                  {categoryFilter && ` - ${categoryFilter}`}
                  {subCategoryFilter && ` - ${subCategoryFilter}`}
                  {petSizeFilter && ` - ${petSizes.find((s) => s.value === petSizeFilter)?.label}`}
                  {searchTerm && ` - "${searchTerm}" 검색결과`}
                </p>
              </div>
            )}

            {/* Place list */}
            <div className="place-list-container">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <p>{error}</p>
                  <button className="btn btn-outline-danger mt-2" onClick={fetchPlaces} aria-label="다시 시도">
                    <i className="bi bi-arrow-clockwise me-1"></i> 다시 시도
                  </button>
                </div>
              ) : places && places.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-3 g-4 position-relative">
                  {partialLoading && (
                    <div className="partial-loading-overlay">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}
                  {places.map(renderPlaceCard)}
                </div>
              ) : (
                <div className="no-results-message">검색 결과가 없습니다. 다른 검색어나 필터를 시도해보세요.</div>
              )}
            </div>

            {/* Pagination */}
            {!loading && places && places.length > 0 && (
              <nav aria-label="Page navigation" className="mt-4">
                <ul className="pagination justify-content-center">{renderPaginationItems()}</ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default PlaceListPage