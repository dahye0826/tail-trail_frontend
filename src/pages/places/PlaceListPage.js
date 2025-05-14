import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./PlaceListPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import axios from "axios"

// API 및 서버 관련 상수
const API_BASE_URL = "http://localhost:9000/api"
const ML_SERVER_URL = "http://localhost:9001"

function PlaceListPage() {
  // State 관리
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [partialLoading, setPartialLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("") // 사용자 이름 상태
  const [searchTerm, setSearchTerm] = useState("")
  
  // 로그인 상태 확인 및 초기화
  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const userName = localStorage.getItem("userName")
    
    console.log('Initial check:', { userId, isLoggedIn, userName })
    
    setIsLoggedIn(isLoggedIn)
    setUserName(userName)
  }, [])
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
  // 알림 상태
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" })

  const navigate = useNavigate()
  const location = useLocation()
  const placesPerPage = 9

  // 상수 정의
  // 카테고리 매핑 (카테고리와 세부 카테고리 연결)
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

  // 카테고리와 API 매핑을 위한 상수
  const categoryApiMapping = useMemo(
    () => ({
      여행지: "여행지",
      숙박업소: "펜션", // 기본값은 펜션으로 설정
      카페: "카페",
      식당: "식당",
      박물관: "박물관",
      문예회관: "문예회관",
    }),
    [],
  )

  // 반려견 크기 옵션
  const petSizes = useMemo(
    () => [
      { value: "small", label: "소형견" },
      { value: "medium", label: "중형견" },
      { value: "large", label: "대형견" },
    ],
    [],
  )

  // 데이터 초기화 및 로그인 상태 확인
  useEffect(() => {
    // 로그인 상태 확인 함수
    const checkLoginStatus = () => {
      const userId = localStorage.getItem("userId")
      const loggedIn = !!userId
      setIsLoggedIn(loggedIn)

      // 사용자 이름 가져오기
      if (loggedIn) {
        const storedUserName = localStorage.getItem("userName")
        if (storedUserName) {
          setUserName(storedUserName)
        } else {
          // 이름이 저장되어 있지 않으면 API에서 가져오기
          fetchUserName(userId)
        }
      }

      return loggedIn
    }

    // 사용자 이름 가져오기 함수
    const fetchUserName = async (userId) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}`)
        if (response.data && response.data.name) {
          setUserName(response.data.name)
          localStorage.setItem("userName", response.data.name)
        } else if (response.data && response.data.nickname) {
          setUserName(response.data.nickname)
          localStorage.setItem("userName", response.data.nickname)
        } else {
          setUserName("회원")
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error)
        setUserName("회원")
      }
    }

    // 초기 데이터 로드 함수
    const fetchInitialData = async () => {
      try {
        // 먼저 로그인 상태 확인
        const isUserLoggedIn = checkLoginStatus()

        // 도시 및 카테고리 데이터 로드
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
        console.error("초기 데이터 로드 오류:", error)
      }
    }

    fetchInitialData()
  }, [])

  // 페이지 가시성 변경 시 즐겨찾기 새로고침
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isLoggedIn) {
        fetchFavorites()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // 정리 함수
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isLoggedIn])

  // 로그인 상태 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      const userId = localStorage.getItem("userId")
      const newLoginStatus = !!userId
      console.log("로컬 스토리지 변경 - 새로운 로그인 상태:", newLoginStatus)
      setIsLoggedIn(newLoginStatus)

      // 로그인 상태가 변경되면 사용자 이름도 업데이트
      if (newLoginStatus) {
        const storedUserName = localStorage.getItem("userName")
        if (storedUserName) {
          setUserName(storedUserName)
        }
      } else {
        setUserName("")
      }
    }

    // storage 이벤트 리스너 추가
    window.addEventListener("storage", handleStorageChange)

    // 초기 로그인 상태 확인
    handleStorageChange()

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // 페이지 포커스 시 즐겨찾기 새로고침
  useEffect(() => {
    const handleFocus = () => {
      if (isLoggedIn) {
        fetchFavorites()
      }
    }

    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("focus", handleFocus)
    }
  }, [isLoggedIn])

  // 경로 변경 시 즐겨찾기 새로고침
  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites()
    }
  }, [isLoggedIn, location.pathname])

  // 즐겨찾기 데이터 가져오기 함수
  const fetchFavorites = async () => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        console.log("사용자 ID가 없어 즐겨찾기를 가져올 수 없습니다.")
        setFavorites([])
        return
      }

      // 직접 API 호출
      const response = await axios.get(`${API_BASE_URL}/favorites`, {
        params: {
          userId: Number(userId),
          page: 1,
          size: 1000,
        },
      })

      console.log("즐겨찾기 API 응답:", response.data)

      if (response.data) {
        let favoritesList = []

        // 다양한 API 응답 구조 처리
        if (Array.isArray(response.data)) {
          favoritesList = response.data
        } else if (response.data.favorites && Array.isArray(response.data.favorites)) {
          favoritesList = response.data.favorites
        } else if (response.data.content && Array.isArray(response.data.content)) {
          favoritesList = response.data.content
        }

        // 장소 ID 추출 및 숫자로 변환
        const favoriteIds = favoritesList
          .map((item) => {
            if (typeof item === "number") return item
            if (item.placeId !== undefined) return Number(item.placeId)
            if (item.id !== undefined) return Number(item.id)
            return null
          })
          .filter((id) => id !== null)

        console.log("추출된 즐겨찾기 ID 목록:", favoriteIds)
        setFavorites(favoriteIds)
      } else {
        setFavorites([])
      }
    } catch (error) {
      console.error("즐겨찾기 로드 오류:", error)
      setFavorites([])
    }
  }

  // 카테고리 변경 시 서브카테고리 업데이트
  useEffect(() => {
    if (categoryFilter) {
      setSubCategories(categoryMapping[categoryFilter] || [])
      setSubCategoryFilter("")
    } else {
      setSubCategories([])
    }
  }, [categoryFilter, categoryMapping])

  // 반려견 크기 카테고리 계산 함수
  const calculatePetSizeCategories = useCallback((petSizeStr) => {
    if (!petSizeStr) return []

    const sizes = []
    const lowerPetSize = petSizeStr.toLowerCase()

    // 모든 크기 포함 여부 확인
    if (lowerPetSize.includes("모두") || lowerPetSize.includes("전체")) {
      return ["small", "medium", "large"]
    }

    // 텍스트 기반 지표
    if (lowerPetSize.includes("소형")) sizes.push("small")
    if (lowerPetSize.includes("중형")) sizes.push("medium")
    if (lowerPetSize.includes("대형")) sizes.push("large")

    // 무게 기반 파싱
    const weightMatch = lowerPetSize.match(/(\d+)\s*kg/)
    if (weightMatch) {
      const weight = Number.parseInt(weightMatch[1])
      if (weight < 10) sizes.push("small")
      else if (weight >= 10 && weight < 25) sizes.push("medium")
      else if (weight >= 25) sizes.push("large")
    }

    return [...new Set(sizes)]
  }, [])

  // 필터 적용하여 장소 데이터 가져오기
  const fetchPlaces = useCallback(async () => {
    try {
      setPartialLoading(true)
      
      // 필터 파라미터 준비
      const params = {
        page: currentPage,
        size: placesPerPage,
        search: searchTerm || undefined,
        city: regionFilter || undefined,
        petSize: petSizeFilter || undefined,
      }

      // 카테고리 필터링 로직
      if (subCategoryFilter) {
        params.industry = subCategoryFilter
      } else if (categoryFilter) {
        params.industry = categoryApiMapping[categoryFilter] || categoryFilter
      }

      // 디버깅 로그
      console.log("필터 적용:", {
        categoryFilter,
        subCategoryFilter,
        industry: params.industry,
      })

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
      console.error("장소 데이터 로드 오류:", error)
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
  }, [currentPage, searchTerm, categoryFilter, subCategoryFilter, regionFilter, petSizeFilter, placesPerPage, categoryApiMapping])

  // 장소 데이터 로드
  useEffect(() => {
    fetchPlaces()
  }, [fetchPlaces])

  // 반려견 크기 정보 처리
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
    const loadRecommendations = async () => {
      const userId = localStorage.getItem("userId")

      if (!userId) {
        return
      }

      try {
        setLoadingRecommendations(true)
        console.log('Sending request to:', `${ML_SERVER_URL}/api/ml/recommend`)
        console.log('Request data:', { userId })
        
        const response = await axios.post(`${ML_SERVER_URL}/api/ml/recommend`, { userId })
        
        if (response.data && response.data.success && response.data.recommendedPlaceIds) {
          const top3Ids = response.data.recommendedPlaceIds.slice(0, 3)

          const placeDetailsPromises = top3Ids.map((placeId) => axios.get(`${API_BASE_URL}/places/${placeId}`))

          const placeDetailsResponses = await Promise.all(placeDetailsPromises)
          const placeDetails = placeDetailsResponses.map((response) => response.data)

          setRecommendedPlaces(placeDetails)
        }
      } catch (error) {
        console.error("추천 장소 로드 실패:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        })
      } finally {
        setLoadingRecommendations(false)
      }
    }

    console.log('Is logged in:', isLoggedIn)
    if (isLoggedIn) {
      const userId = localStorage.getItem("userId")
      console.log('User ID from localStorage:', userId)
      loadRecommendations()
    }
  }, [isLoggedIn])

  // 알림 표시 함수
  const showNotification = (message, type = "success") => {
    console.log("알림 표시:", message, type);
    setNotification({ show: true, message, type });
  
    // 3초 후 자동 숨김
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // 이벤트 핸들러
  // 검색 핸들러
  const handleSearch = () => { 
    console.log("검색어:", `"${searchTerm}"`) 
    setCurrentPage(1)
  }
  
  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (pageNumber) => {
      if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return
      setCurrentPage(pageNumber)
      window.scrollTo({
        top: document.querySelector(".place-list-container").offsetTop - 100,
        behavior: "smooth",
      })
    },
    [currentPage, totalPages],
  )

  // 장소 클릭 핸들러
  const handlePlaceClick = useCallback((placeId) => navigate(`/places/place/${placeId}`), [navigate])

  // 알림 렌더링 함수
  const renderNotification = () => {
    if (!notification.show) return null;

    return (
      <div className={`place-notification ${notification.type === "error" ? "place-notification-error" : ""}`}>
        <div className="place-notification-content">{notification.message}</div>
      </div>
    );
  };

  // 즐겨찾기 토글 핸들러
  const handleFavoriteToggle = useCallback(
    async (placeId, e) => {
      e.stopPropagation();
      if (!isLoggedIn) {
        // 알림 표시
        setNotification({ show: true, message: "로그인이 필요한 서비스입니다.", type: "error" });
        
        // 잠시 후 리디렉션 (알림을 볼 시간 제공)
        setTimeout(() => {
          navigate("/login", { state: { from: location } });
        }, 1500); // 1.5초 후 리디렉션
        
        return;
      }

      try {
        const userId = localStorage.getItem("userId");
        const numericPlaceId = Number(placeId);

        const response = await axios.post(`${API_BASE_URL}/favorites/toggle`, null, {
          params: { userId: Number(userId), placeId: numericPlaceId },
        });

        console.log("즐겨찾기 토글 응답:", response.data);

        if (response.data.success) {
          if (response.data.isAdded) {
            setFavorites((prevFavorites) => {
              return [...prevFavorites, numericPlaceId];
            });
            showNotification("즐겨찾기에 추가되었습니다.");
          } else {
            setFavorites((prevFavorites) => {
              return prevFavorites.filter((id) => Number(id) !== numericPlaceId);
            });
            showNotification("즐겨찾기가 해제되었습니다.");
          }
        }
      } catch (error) {
        console.error("즐겨찾기 처리 오류:", error);
        showNotification("즐겨찾기 업데이트 중 오류가 발생했습니다.", "error");
      }
    },
    [isLoggedIn, navigate, location],
  );

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setRegionFilter("")
    setCategoryFilter("")
    setSubCategoryFilter("")
    setPetSizeFilter("")
    setSearchTerm("")
    setCurrentPage(1)
  }

  // 헬퍼 렌더링 함수
  // 반려견 크기 태그 렌더링
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

  // 페이지네이션 아이템 렌더링
  const renderPaginationItems = useCallback(() => {
    const items = []
    const maxPageButtons = 5 // 깔끔한 UI를 위해 10에서 5로 축소

    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1)

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1)
    }

    // 처음 및 이전 버튼
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

    // 페이지 번호
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>,
      )
    }

    // 다음 및 마지막 버튼
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

  // 즐겨찾기 여부 확인 함수
  const isFavorited = useCallback(
    (placeId) => {
      const numericPlaceId = Number(placeId)
      return favorites.some((id) => Number(id) === numericPlaceId)
    },
    [favorites],
  )

  // 장소 카드 렌더링 함수
  const renderPlaceCard = useCallback(
    (place) => {
      // 일관된 비교를 위해 placeId가 숫자인지 확인
      const favorite = isFavorited(place.placeId)

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
                onError={(e) => {
                  e.target.src = "/assets/default-pet-place.jpg"
                }}
              />
              {/* 로그인 상태와 무관하게 즐겨찾기 버튼 표시 */}
              <button
                className="btn-favorite"
                onClick={(e) => handleFavoriteToggle(place.placeId, e)}
                aria-label={favorite ? "즐겨찾기 삭제" : "즐겨찾기 추가"}
              >
                <i className={`bi ${favorite ? "bi-heart-fill" : "bi-heart"}`}></i>
              </button>
            </div>
            <div className="card-body">
              <span className="place-category-badge">{place.industryMain}</span>
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
    },
    [isFavorited, handleFavoriteToggle, handlePlaceClick, renderPetSizeTags],
  )

  // 커스텀 드롭다운 컴포넌트
  const CustomDropdown = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

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

    const handleSelect = useCallback(
      (option) => {
        onChange(option)
        setIsOpen(false)
      },
      [onChange],
    )

    const selectedLabel = value ? options.find((opt) => opt.value === value)?.label : placeholder

    return (
      <div className="custom-dropdown" ref={dropdownRef}>
        <div className={`dropdown-header ${isOpen ? "active" : ""}`} onClick={() => setIsOpen(!isOpen)}>
          <span>{selectedLabel}</span>
          <i className={`bi bi-chevron-down dropdown-icon ${isOpen ? "open" : ""}`}></i>
        </div>
        {isOpen && (
          <div className="dropdown-menu open">
            {options.map((option) => (
              <div
                key={option.value}
                className={`dropdown-item ${value === option.value ? "selected" : ""}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // 추천 장소 렌더링 함수
  const renderRecommendedPlace = (place) => {
    const isFavorite = isFavorited(place.placeId)

    return (
      <div key={place.placeId} className="col">
        <div
          className="card h-100 place-card"
          onClick={() => handlePlaceClick(place.placeId)}
          style={{ cursor: "pointer" }}
        >
          <div className="card-img-container">
            <img
              src={place.placeImage ? `http://localhost:9000${place.placeImage}` : "/assets/default-pet-place.jpg"}
              className="card-img-top"
              alt={place.placeName}
              loading="lazy"
              onError={(e) => {
                e.target.src = "/assets/default-pet-place.jpg"
              }}
            />
            <button
              className="btn-favorite"
              onClick={(e) => {
                e.stopPropagation()
                handleFavoriteToggle(place.placeId, e)
              }}
              aria-label={isFavorite ? "즐겨찾기 삭제" : "즐겨찾기 추가"}
            >
              <i className={`bi ${isFavorite ? "bi-heart-fill" : "bi-heart"}`}></i>
            </button>
          </div>
          <div className="card-body">
            <span className="place-category-badge">{place.industryMain}</span>
            <h5 className="card-title mt-2">{place.placeName}</h5>
            <p className="card-text">
              <i className="bi bi-geo-alt me-1"></i> {place.city} {place.district}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 개인화된 메시지 생성 함수
  const getPersonalizedMessage = () => {
    if (!isLoggedIn) return "좋아할만한 장소"
    return `${userName || "회원"}님이 좋아할 만한 장소를 찾아봤어요!`
  }

  // 메인 컴포넌트 렌더링
  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      {/* 알림 토스트 */}
      {renderNotification()}

      <div className="places-background">
        <div className="container mt-4 mb-5">
          <div className="places-content-wrapper">
            {/* 헤더 */}
            <div className="post-header text-center">
              <h2 className="mb-4">반려동물과 함께하는 장소</h2>
              <p className="subtitle mb-5">반려동물과 함께 방문할 수 있는 다양한 장소를 찾아보세요.</p>
            </div>

            {/* 추천 장소 섹션 - 필터 컨테이너 위로 이동 */}
            {isLoggedIn && (
              <div className="recommended-section mb-4">
                <h4 className="mb-3">
                  {userName ? `${userName}님이 좋아할 만한 장소를 찾아봤어요!` : "좋아할만한 장소"}
                </h4>
                <div className="row row-cols-1 row-cols-md-3 g-4">
                  {loadingRecommendations ? (
                    <div className="col-12 text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : recommendedPlaces.length > 0 ? (
                    recommendedPlaces.map(renderRecommendedPlace)
                  ) : (
                    <div className="col-12">
                      <p className="text-center">추천할 장소가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 필터 및 검색 */}
            <div className="filter-container p-3 mb-4 rounded shadow-sm">
              <div className="row g-3">
                <div className="col-md-3">
                  <CustomDropdown
                    options={[
                      { value: "", label: "지역 선택" },
                      ...cities.map((city) => ({ value: city, label: city })),
                    ]}
                    value={regionFilter}
                    onChange={(value) => {
                      setRegionFilter(value)
                      setCurrentPage(1)
                    }}
                    placeholder="지역 선택"
                  />
                </div>
                <div className="col-md-2">
                  <CustomDropdown
                    options={[
                      { value: "", label: "카테고리 선택" },
                      ...Object.keys(categoryMapping).map((category) => ({ value: category, label: category })),
                    ]}
                    value={categoryFilter}
                    onChange={(value) => {
                      setCategoryFilter(value)
                      setCurrentPage(1)
                    }}
                    placeholder="카테고리 선택"
                  />
                </div>
                {categoryFilter === "숙박업소" && (
                  <div className="col-md-2">
                    <CustomDropdown
                      options={[
                        { value: "", label: "세부 카테고리" },
                        ...subCategories.map((subCat) => ({ value: subCat, label: subCat })),
                      ]}
                      value={subCategoryFilter}
                      onChange={(value) => {
                        setSubCategoryFilter(value)
                        setCurrentPage(1)
                      }}
                      placeholder="세부 카테고리"
                    />
                  </div>
                )}
                <div className="col-md-2">
                  <CustomDropdown
                    options={[
                      { value: "", label: "반려견 크기" },
                      ...petSizes.map((size) => ({ value: size.value, label: size.label })),
                    ]}
                    value={petSizeFilter}
                    onChange={(value) => {
                      setPetSizeFilter(value)
                      setCurrentPage(1)
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

              {/* 필터 컨트롤 버튼 */}
              <div className="d-flex justify-content-between mt-3">
                <div>
                  <button className="reset-btn" type="button" onClick={handleResetFilters} title="검색 초기화">
                    <i className="bi bi-arrow-counterclockwise me-1"></i> 초기화
                  </button>
                </div>
              </div>
            </div>

            {/* 검색 결과 요약 */}
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

            {/* 장소 목록 */}
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

            {/* 페이지네이션 */}
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
