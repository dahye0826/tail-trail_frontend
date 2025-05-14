import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate, Link, useLocation } from "react-router-dom"
import axios from "axios"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./PlaceDetailPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"
import { usePlaceViewTracker } from "../../api/PlaceViewTracker"

// API 기본 URL
const API_BASE_URL = "http://localhost:9000/api"

function PlaceDetailPage() {
  // 상태 관리
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const location = useLocation()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false) // 수정 모드인지 새 리뷰 작성 모드인지 구분
  const [currentEditReviewId, setCurrentEditReviewId] = useState(null) // 현재 수정 중인 리뷰 ID
  const [mapContainerReady, setMapContainerReady] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    note: "",
    visitDate: new Date().toISOString().split("T")[0],
  })
  const [userHasReview, setUserHasReview] = useState(false) // 사용자가 이미 리뷰를 작성했는지 여부
  const [userReviewId, setUserReviewId] = useState(null) // 사용자가 작성한 리뷰 ID
  const mapContainerRef = useRef(null)
  const { id } = useParams()
  const navigate = useNavigate()
  const reviewRef = useRef(null)
  const [averageRating, setAverageRating] = useState(0)
  const [reviewList, setReviewList] = useState([])
  const [showReportDropdown, setShowReportDropdown] = useState({})
  const [hoverRating, setHoverRating] = useState(0)
  // 알림 상태
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" })

  // 장소 데이터 포맷팅 함수
  const formatPlaceData = useCallback((placeData) => {
    return {
      id: placeData.placeId,
      name: placeData.placeName,
      region: placeData.city,
      address: placeData.fullAddress || `${placeData.city} ${placeData.district}`,
      description: placeData.description || "상세 정보가 없습니다.",
      operatingHours: placeData.openingHours || "정보 없음",
      closedDay: placeData.closedDay || "정보 없음",
      entryFee: placeData.admissionFee || "무료",
      parkingAvailable: placeData.parkingAvailable || "정보 없음",
      isOutdoor: placeData.outdoor === "Y" ? "야외" : placeData.indoor === "Y" ? "실내" : "정보 없음",
      phoneNumber: placeData.placePhone || "정보 없음",
      category: placeData.industryMain || "기타",
      petSize: placeData.petSize || "정보 없음",
      petSizeCategories: placeData.petSizeCategories || [],
      petExtraCharge: placeData.petExtraCharge || "정보 없음",
      rating:
        placeData.reviews?.length > 0
          ? (placeData.reviews.reduce((sum, review) => sum + review.rating, 0) / placeData.reviews.length).toFixed(1)
          : 0,
      amenities: placeData.petRestrictions
        ? placeData.petRestrictions.split(",").map((item) => item.trim())
        : ["반려견 동반 가능"],
      reviews:
        placeData.reviews?.map((review) => ({
          name: review.memberName || "익명",
          rating: review.rating,
          comment: review.reviewContent,
        })) || [],
      images: [
        placeData.placeImage ? `http://localhost:9000${placeData.placeImage}` : "/placeholder.svg?height=400&width=800",
      ],
      lat: placeData.latitude || 37.5665,
      lng: placeData.longitude || 126.978,
      lastUpdated: placeData.lastUpdated || null,
    }
  }, [])

  const userId = localStorage.getItem("userId")
  // 장소 조회 트래킹 (추천 알고리즘 구현)
  usePlaceViewTracker({
    placeId: Number(id),
    userId: Number(userId),
  })

  // 사용자가 이미 리뷰를 작성했는지 확인
  const checkUserReview = useCallback(() => {
    if (!isLoggedIn || !userId || reviewList.length === 0) {
      setUserHasReview(false)
      setUserReviewId(null)
      return
    }

    const userReview = reviewList.find((review) => review.userId === Number(userId))
    if (userReview) {
      setUserHasReview(true)
      setUserReviewId(userReview.visitId)
    } else {
      setUserHasReview(false)
      setUserReviewId(null)
    }
  }, [isLoggedIn, userId, reviewList])

  // 리뷰 목록이 변경될 때마다 사용자 리뷰 확인
  useEffect(() => {
    checkUserReview()
  }, [reviewList, checkUserReview])

  // 알림 표시 함수
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type })

    // 3초 후 자동 숨김
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" })
    }, 3000)
  }

  // 방문 후기 제출 함수
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    const userId = localStorage.getItem("userId")
    if (!userId) {
      showNotification("로그인이 필요합니다.", "error")
      setTimeout(() => {
        navigate("/login")
      }, 1500)
      return
    }

    // 이미 리뷰를 작성한 경우 중복 작성 방지
    if (userHasReview) {
      showNotification("이미 리뷰를 작성하셨습니다. 기존 리뷰를 수정해주세요.", "error")
      return
    }

    try {
      const today = new Date().toISOString().split("T")[0]
      const reviewData = {
        userId: Number(userId),
        placeId: Number(id),
        rating: Number(newReview.rating),
        note: newReview.note,
        visitDate: today,
        createdAt: today,
      }

      console.log("전송할 리뷰 데이터:", reviewData) // 디버깅용 로그

      const response = await axios.post(`${API_BASE_URL}/visited-place`, reviewData)

      if (response.data) {
        console.log("서버 응답:", response.data) // 디버깅용 로그

        // 리뷰 목록에 새 리뷰 추가
        setReviewList((prevReviews) => [...prevReviews, response.data])

        // 사용자 리뷰 상태 업데이트
        setUserHasReview(true)
        setUserReviewId(response.data.visitId)

        // 폼 상태 초기화
        resetFormState()

        showNotification("방문 후기가 등록되었습니다.")

        // 평균 별점 다시 가져오기
        fetchAverageRating()
      }
    } catch (error) {
      console.error("리뷰 제출 오류:", error)
      showNotification("방문 후기 등록에 실패했습니다.", "error")
    }
  }

  // 방문 후기 수정 함수
  const handleReviewUpdate = async (e) => {
    e.preventDefault()
    if (!currentEditReviewId) return

    try {
      const today = new Date().toISOString().split("T")[0]
      const reviewData = {
        userId: Number(localStorage.getItem("userId")),
        placeId: Number(id),
        rating: Number(newReview.rating),
        note: newReview.note,
        visitDate: today,
        createdAt: today,
      }

      console.log("수정할 리뷰 데이터:", reviewData) // 디버깅용 로그

      const response = await axios.put(`${API_BASE_URL}/visited-place/${currentEditReviewId}`, reviewData)

      if (response.data) {
        console.log("서버 응답:", response.data) // 디버깅용 로그

        // 리뷰 목록에서 수정된 리뷰 업데이트
        setReviewList((prevReviews) =>
          prevReviews.map((review) => (review.visitId === currentEditReviewId ? response.data : review)),
        )

        // 폼 상태 초기화
        resetFormState()

        showNotification("방문 후기가 수정되었습니다.")

        // 평균 별점 다시 가져오기
        fetchAverageRating()
      }
    } catch (error) {
      console.error("리뷰 수정 오류:", error)
      showNotification("방문 후기 수정에 실패했습니다.", "error")
    }
  }

  // 방문 후기 삭제 함수
  const handleReviewDelete = async (reviewId) => {
    if (!reviewId || !window.confirm("방문 후기를 삭제하시겠습니까?")) return

    try {
      await axios.delete(`${API_BASE_URL}/visited-place/${reviewId}`)

      // 리뷰 목록에서 삭제된 리뷰 제거
      setReviewList((prev) => prev.filter((review) => review.visitId !== reviewId))

      // 사용자의 리뷰를 삭제한 경우 상태 업데이트
      if (reviewId === userReviewId) {
        setUserHasReview(false)
        setUserReviewId(null)
      }

      // 폼 상태 초기화
      resetFormState()

      showNotification("방문 후기가 삭제되었습니다.")

      // 평균 별점 다시 가져오기
      fetchAverageRating()
    } catch (error) {
      console.error("리뷰 삭제 오류:", error)
      showNotification("방문 후기 삭제에 실패했습니다.", "error")
    }
  }

  // 폼 상태 초기화 함수
  const resetFormState = () => {
    setShowReviewForm(false)
    setIsEditMode(false)
    setCurrentEditReviewId(null)
    setNewReview({
      rating: 5,
      note: "",
      visitDate: new Date().toISOString().split("T")[0],
    })
    setHoverRating(0)
  }

  // 즐겨찾기 상태 체크 함수
  const checkFavoriteStatus = useCallback(async () => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      setIsFavorite(false)
      return
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/favorites`, {
        params: {
          userId: Number(userId),
          placeId: Number(id),
          page: 1,
          size: 1,
        },
      })

      // 응답 데이터 구조 확인 후 로깅
      console.log("즐겨찾기 상태 응답:", response.data)

      // favorites 배열이 있고 길이가 0보다 크면 즐겨찾기된 상태
      const isFavorited = response.data.favorites && response.data.favorites.length > 0
      setIsFavorite(isFavorited)
    } catch (error) {
      console.error("즐겨찾기 상태 확인 실패:", error)
      setIsFavorite(false)
    }
  }, [id])

  // 로그인 상태 체크
  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn") === "true"
      setIsLoggedIn(loginStatus)

      if (loginStatus) {
        checkFavoriteStatus()
      } else {
        setIsFavorite(false)
        setUserHasReview(false)
        setUserReviewId(null)
      }
    }

    checkLoginStatus()
    // 로그인 상태 변경 감지
    window.addEventListener("storage", checkLoginStatus)

    return () => {
      window.removeEventListener("storage", checkLoginStatus)
    }
  }, [checkFavoriteStatus])

  // 즐겨찾기 토글 함수
  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      showNotification("로그인이 필요한 서비스입니다.", "error")

      // 지연 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate("/login")
      }, 1500)
      return
    }

    const userId = localStorage.getItem("userId")
    if (!userId) {
      showNotification("로그인이 필요한 서비스입니다.", "error")

      // 지연 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate("/login")
      }, 1500)
      return
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/favorites/toggle`, null, {
        params: {
          userId: Number(userId),
          placeId: Number(id),
        },
      })

      console.log("즐겨찾기 토글 응답:", response.data)

      if (response.data.success) {
        setIsFavorite(response.data.isAdded)
        const message = response.data.isAdded ? "즐겨찾기에 추가되었습니다." : "즐겨찾기가 해제되었습니다."
        showNotification(message)
      }
    } catch (error) {
      console.error("즐겨찾기 처리 실패:", error)
      showNotification("즐겨찾기 처리 중 오류가 발생했습니다.", "error")
    }
  }

  // 장소 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/places/${id}`)
        if (response.data) {
          setPlace(formatPlaceData(response.data))
        }
      } catch (error) {
        console.error("데이터 로드 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, formatPlaceData])

  // 해시 링크 스크롤 처리
  useEffect(() => {
    if (location.hash === "#review" && reviewRef.current) {
      reviewRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [location])

  // 별점 렌더링 함수
  const renderStars = (rating) => (
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

  // 별점 표시 함수 (숫자 포함)
  const renderStarsWithNumber = (rating) => (
    <div className="place-detail-stars-with-number">
      {renderStars(rating)}
      <span className="place-detail-rating-number">({rating})</span>
    </div>
  )

  // 반려견 크기 아이콘 렌더링
  const renderPetSizeIcons = (categories) => {
    if (!categories?.length) return null

    return (
      <div className="place-detail-pet-size-icons mb-2">
        {categories.includes("small") && (
          <span className="place-detail-badge bg-info me-1" title="소형견 출입 가능">
            소형견
          </span>
        )}
        {categories.includes("medium") && (
          <span className="place-detail-badge bg-success me-1" title="중형견 출입 가능">
            중형견
          </span>
        )}
        {categories.includes("large") && (
          <span className="place-detail-badge bg-warning me-1" title="대형견 출입 가능">
            대형견
          </span>
        )}
      </div>
    )
  }

  // 별점 선택 핸들러
  const handleStarClick = (rating) => {
    setNewReview((prev) => ({ ...prev, rating }))
  }

  // 별점 호버 핸들러
  const handleStarHover = (rating) => {
    setHoverRating(rating)
  }

  // 별점 호버 종료 핸들러
  const handleStarLeave = () => {
    setHoverRating(0)
  }

  // 별점 선택 UI 렌더링
  const renderStarRating = () => {
    return (
      <div className="place-detail-star-rating-container mb-3">
        <label className="form-label d-block">평점</label>
        <div className="place-detail-star-rating" onMouseLeave={handleStarLeave}>
          {[1, 2, 3, 4, 5].map((star) => (
            <i
              key={star}
              className={`bi ${star <= (hoverRating || newReview.rating) ? "bi-star-fill" : "bi-star"
                } place-detail-star-icon text-warning`}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
            ></i>
          ))}
          <span className="place-detail-rating-text ms-2">({newReview.rating}점)</span>
        </div>
      </div>
    )
  }

  // 방문 후기 폼 렌더링
  const renderReviewForm = () => (
    <form onSubmit={isEditMode ? handleReviewUpdate : handleReviewSubmit} className="place-detail-review-form">
      {renderStarRating()}
      <div className="mb-3">
        <label className="form-label">후기 내용</label>
        <textarea
          className="form-control"
          rows="4"
          value={newReview.note}
          onChange={(e) => setNewReview({ ...newReview, note: e.target.value })}
          placeholder="방문 후기를 작성해주세요"
          required
        ></textarea>
      </div>
      {/* 수정된 버튼 스타일: 취소 버튼과 등록하기 버튼을 동일한 크기로 설정 */}
      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-secondary me-2" onClick={resetFormState} style={{ width: "100px" }}>
          취소
        </button>
        <button type="submit" className="btn btn-primary" style={{ width: "100px" }}>
          {isEditMode ? "수정하기" : "등록하기"}
        </button>
      </div>
    </form>
  )

  // 방문 후기 섹션 렌더링
  const renderReviewSection = () => {
    if (!isLoggedIn) {
      return (
        <div className="text-center py-4">
          <p>로그인 후 방문 후기를 작성할 수 있습니다.</p>
          <Link to="/login" className="btn btn-primary">
            로그인하기
          </Link>
        </div>
      )
    }

    if (showReviewForm) {
      return renderReviewForm()
    }

    return (
      <div className="text-center py-4">
        {!userHasReview ? (
          <button
            className="btn btn-primary"
            onClick={() => {
              setNewReview({
                rating: 5,
                note: "",
                visitDate: new Date().toISOString().split("T")[0],
              })
              setIsEditMode(false)
              setCurrentEditReviewId(null)
              setShowReviewForm(true)
            }}
          >
            방문 후기 작성하기
          </button>
        ) : (
          <div className="alert alert-info" role="alert">
            이미 리뷰를 작성하셨습니다. 리뷰 목록에서 수정하거나 삭제할 수 있습니다.
          </div>
        )}
      </div>
    )
  }

  // 지도 컴포넌트 렌더링
  const renderMap = () => {
    if (loading || !place) return null

    return (
      <div className="place-detail-row mt-4">
        <div className="place-detail-col">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="place-detail-mb-0 place-detail-section-titlelocation">위치</h3>
          </div>
          <div
            ref={mapContainerRef}
            className="place-detail-map-container"
            style={{ minHeight: "700px", width: "100%" }}
          >
            {mapContainerRef.current && (
              <KakaoMap
                key={`map-${place.id}-${mapContainerRef.current ? "mounted" : "loading"}`}
                readOnly={true}
                initialLocation={{
                  id: place.id,
                  name: place.name,
                  address: place.address,
                  lat: place.lat,
                  lng: place.lng,
                  isRegisteredPlace: true,
                  category: place.category,
                  rating: place.rating,
                }}
                height="700px"
                showSearchBar={false}
                defaultLevel={3}
                showRegisteredPlaces={false}
                showInfoCard={false}
                containerRef={mapContainerRef}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // 지도 컨테이너 초기화 확인
  useEffect(() => {
    if (mapContainerRef.current && place) {
      // 지도 컨테이너가 준비되면 강제로 리렌더링
      setMapContainerReady(true)
    }
  }, [place, mapContainerRef.current])

  // 이미지 섹션에 즐겨찾기 버튼 추가
  const renderImageSection = () => (
    <div className="place-detail-row place-detail-mb-4">
      <div className="place-detail-col">
        <div className="place-detail-position-relative">
          <img
            src={place.images[0] || "/placeholder.svg"}
            alt={place.name}
            className="place-detail-image img-fluid rounded shadow-sm"
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=400&width=800"
            }}
          />
          <button
            className={`place-detail-btn-favorite ${isFavorite ? "active" : ""}`}
            onClick={toggleFavorite}
            aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          >
            <i className={`bi ${isFavorite ? "bi-heart-fill" : "bi-heart"}`}></i>
          </button>
        </div>
      </div>
    </div>
  )

  // 평균 별점 조회
  const fetchAverageRating = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/visited-place/places/${id}/average-rating`)
      setAverageRating(response.data)
    } catch (error) {
      console.error("평균 별점 조회 실패:", error)
    }
  }, [id])

  // 컴포넌트 마운트 시 평균 별점 조회
  useEffect(() => {
    fetchAverageRating()
  }, [fetchAverageRating])

  // 카테고리와 별점 표시 컴포넌트
  const renderCategoryAndRating = () => (
    <div className="place-detail-category-rating-container">
      <span className="place-detail-category-badge">{place.category}</span>
      <div className="place-detail-rating-display">
        {renderStars(averageRating)}
        <span className="place-detail-rating-count">({averageRating ? averageRating.toFixed(1) : "0.0"})</span>
      </div>
    </div>
  )

  // 에러 메시지 추출 함수
  const extractErrorMessage = (error, fallback = "오류가 발생했습니다.") => {
    const data = error?.response?.data

    if (!data) return fallback

    if (typeof data === "string") return data
    if (typeof data === "object") {
      return data.message || data.error || fallback
    }

    return fallback
  }

  // 신고 드롭다운 토글 핸들러
  const handleReportToggle = (reviewId) => {
    setShowReportDropdown((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }))
  }

  // 로컬 스토리지에서 신고 여부를 확인하는 함수
  const isReported = (reviewId) => {
    const userId = localStorage.getItem("userId")
    const key = `VISITEDPLACE_${userId}_${reviewId}`
    const reportedItems = JSON.parse(localStorage.getItem("reportedItems") || "{}")
    return reportedItems[key] === true
  }

  // 리뷰 목록 가져오기
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/visited-place/reviews`, {
          params: { placeId: id },
        })

        // 각 리뷰에 대해 로컬 스토리지에서 신고 여부 확인
        const reviewsWithReportStatus = response.data.map((review) => ({
          ...review,
          isReported: isReported(review.visitId),
        }))

        setReviewList(reviewsWithReportStatus)
      } catch (error) {
        console.error("리뷰 리스트 불러오기 오류:", error)
      }
    }
    fetchReviews()
  }, [id])

  // 리뷰 신고 핸들러
  const handleReport = async (reviewId, reason) => {
    if (!isLoggedIn) {
      showNotification("로그인이 필요한 서비스입니다.", "error")

      // 지연 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate("/login")
      }, 1500)
      return
    }

    // 이미 신고한 경우 방어 코드
    const reportedItems = JSON.parse(localStorage.getItem("reportedItems") || "{}")
    const userId = localStorage.getItem("userId")
    const key = `VISITEDPLACE_${userId}_${reviewId}`
    
    // 이미 신고한 경우
    if (reportedItems[key]) {
      showNotification("이미 이 후기를 신고하셨습니다.", "error")
      return
    }
    
    if (!window.confirm(`이 후기를 '${reason}' 사유로 신고하시겠습니까?`)) return
    
    try {
      const reportData = {
        userId: Number(userId),
        targetId: reviewId,
        targetType: "VISITEDPLACE",
        reason: reason,
      }
    
      await axios.post(`${API_BASE_URL}/report`, reportData)
    
    
      reportedItems[key] = true
      localStorage.setItem("reportedItems", JSON.stringify(reportedItems))
    
      setReviewList((prevList) =>
        prevList.map((r) =>
          r.visitId === reviewId
            ? { ...r, isReported: true }
            : r
        )
      )

      showNotification(`후기가 '${reason}' 사유로 신고되었습니다.`)
      setShowReportDropdown((prev) => ({
        ...prev,
        [reviewId]: false,
      }))
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "신고 처리 중 오류가 발생했습니다.")

      if (errorMessage.includes("이미 신고하셨습니다")) {
        showNotification("이미 이 후기를 신고하셨습니다.", "error")
      } else {
        showNotification(errorMessage, "error")
      }

      console.error("신고 처리 오류:", errorMessage)
    }
  }

  // 리뷰 수정 시작
  const handleEditReview = (review) => {
    setNewReview({
      rating: review.rating,
      note: review.note,
      visitDate: review.visitDate,
    })
    setIsEditMode(true)
    setCurrentEditReviewId(review.visitId)
    setShowReviewForm(true)

    // 리뷰 폼으로 스크롤
    if (reviewRef.current) {
      reviewRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // 리뷰 목록 렌더링
  const renderReviewList = () => (
    <div>
      {reviewList.length === 0 ? (
        <p style={{ fontSize: "1.2rem" }}>아직 등록된 방문후기가 없습니다.</p>
      ) : (
        reviewList.map((review, idx) => {
          const isCurrentUserReview = isLoggedIn && Number(localStorage.getItem("userId")) === review.userId
          console.log("isReported:", review.visitId, review.isReported)
          return (
            <div key={idx} className="place-detail-review-item">
              <div className="place-detail-review-header">
                <span className="place-detail-review-author">{review.userName || "익명"}</span>
                <div className="place-detail-review-rating-stars">{renderStarsWithNumber(review.rating)}</div>
                <span className="place-detail-review-dates">
                  방문일: {review.visitDate} | 작성일: {review.createdAt}
                </span>

                {/* 작성자인 경우 수정/삭제 버튼 표시 */}
                {isCurrentUserReview && (
                  <div className="place-detail-review-actions">
                    <button
                      className="btn btn-sm btn-link"
                      onClick={() => handleEditReview(review)}
                      style={{ textDecoration: "none", color: "#0d6efd" }}
                    >
                      수정
                    </button>
                    <button
                      className="btn btn-sm btn-link text-danger"
                      onClick={() => handleReviewDelete(review.visitId)}
                      style={{ textDecoration: "none" }}
                    >
                      삭제
                    </button>
                  </div>
                )}

                {isLoggedIn && !isCurrentUserReview && (
                  <div className="place-detail-report-dropdown-container">
                    {isReported(review.visitId) ? (
                      // 신고된 경우 - "신고됨"만 표시
                      <span className="text-muted small" style={{ fontSize: "0.8rem" }}>
                        <i className="bi bi-flag-fill"></i> 신고됨
                      </span>
                    ) : (
                      // 신고 안 된 경우에만 버튼 렌더링
                      <>
                        <button
                          className="btn btn-sm btn-link text-secondary place-detail-report-btn"
                          onClick={() => handleReportToggle(review.visitId)}
                          title="후기 신고하기"
                        >
                          <i className="bi bi-flag"></i>
                        </button>
                        {showReportDropdown[review.visitId] && (
                          <div className="place-detail-report-dropdown">
                            <div className="place-detail-report-dropdown-header">신고 사유 선택</div>
                            <div
                              className="place-detail-report-dropdown-item"
                              onClick={() => handleReport(review.visitId, "영리 목적/홍보성")}
                            >
                              영리 목적/홍보성
                            </div>
                            <div
                              className="place-detail-report-dropdown-item"
                              onClick={() => handleReport(review.visitId, "욕설/인신공격")}
                            >
                              욕설/인신공격
                            </div>
                            <div
                              className="place-detail-report-dropdown-item"
                              onClick={() => handleReport(review.visitId, "스팸")}
                            >
                              스팸
                            </div>
                            <div
                              className="place-detail-report-dropdown-item"
                              onClick={() => handleReport(review.visitId, "기타")}
                            >
                              기타
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="place-detail-review-content">{review.note}</div>
            </div>
          )
        })
      )}
    </div>
  )

  // 알림 토스트 렌더링
  const renderNotification = () => {
    if (!notification.show) return null

    return (
      <div className={`place-notification ${notification.type === "error" ? "place-notification-error" : ""}`}>
        <div className="place-notification-content">{notification.message}</div>
      </div>
    )
  }

  // 로딩 중 표시
  if (loading) {
    return (
      <>
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="place-detail-background">
          <div className="container mt-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // 메인 렌더링
  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      {/* 알림 토스트 */}
      {renderNotification()}

      <div className="place-detail-background" style={{ backgroundColor: "#fbfbe9" }}>
        <div className="container py-4 place-detail-container">
          {/* 뒤로가기 버튼 */}
          <button className="place-detail-btn-outline-secondary mb-3" onClick={() => navigate("/places")}>
            <i className="bi bi-arrow-left me-1"></i> 목록으로
          </button>

          {/* 장소 헤더와 이미지 */}
          {!loading && place && (
            <>
              {renderImageSection()}
              <div className="place-detail-row place-detail-mb-3">
                <div className="place-detail-col">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      {renderCategoryAndRating()}
                      <h3 className="place-detail-mb-1">{place.name}</h3>
                    </div>
                  </div>
                  <p className="text-muted mb-3" style={{ fontSize: "15px" }}>
                    {place.description}
                  </p>
                  <div className="mb-3">
                    {/* 반려견 크기 아이콘 */}
                    {renderPetSizeIcons(place.petSizeCategories)}

                    {place.amenities?.length > 0 && (
                      <div className="place-detail-amenities mb-3">
                        {place.amenities.map((amenity, index) => (
                          <span key={index} className="place-detail-badge place-detail-amenity-badge">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 장소 정보 */}
              <div className="card mb-4 place-detail-info-card">
                <div className="card-body">
                  <div className="place-detail-row">
                    <div className="place-detail-col-md-6">
                      <h4 className="place-detail-section-titleplaceinfo mb-3">장소 정보</h4>
                      <dl className="place-detail-row">
                        <dt className="place-detail-col-sm-4">주소</dt>
                        <dd className="place-detail-col-sm-8">
                          {place.address}
                          <button
                            type="button"
                            className="place-detail-btn-icon-copy ms-2"
                            onClick={() => navigator.clipboard.writeText(place.address)}
                            title="주소 복사"
                          >
                            <i className="bi bi-clipboard"></i>
                          </button>
                          <a
                            href={`https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`}
                            className="place-detail-btn-kakao-small ms-2"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="카카오맵으로 길찾기"
                          >
                            <i className="bi bi-geo-alt"></i> 길찾기
                          </a>
                        </dd>

                        <dt className="place-detail-col-sm-4">운영시간</dt>
                        <dd className="place-detail-col-sm-8">{place.operatingHours}</dd>

                        <dt className="place-detail-col-sm-4">휴무일</dt>
                        <dd className="place-detail-col-sm-8">{place.closedDay}</dd>

                        <dt className="place-detail-col-sm-4">입장료</dt>
                        <dd className="place-detail-col-sm-8">{place.entryFee}</dd>
                      </dl>
                    </div>
                    <div className="place-detail-col-md-6">
                      <h4 className="place-detail-section-titleadditionalinfo mb-3">추가 정보</h4>
                      <dl className="place-detail-row">
                        <dt className="place-detail-col-sm-4">주차여부</dt>
                        <dd className="place-detail-col-sm-8">{place.parkingAvailable}</dd>

                        <dt className="place-detail-col-sm-4">실외여부</dt>
                        <dd className="place-detail-col-sm-8">{place.isOutdoor}</dd>

                        <dt className="place-detail-col-sm-4">문의 및 안내</dt>
                        <dd className="place-detail-col-sm-8">{place.phoneNumber}</dd>

                        <dt className="place-detail-col-sm-4">반려견 추가 요금</dt>
                        <dd className="place-detail-col-sm-8">{place.petExtraCharge}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* 방문 후기 섹션 */}
              <div className="place-detail-review-section mt-4" ref={reviewRef}>
                <h3 className="place-detail-section-titlereview mb-3">방문 후기</h3>
                {renderReviewList()}
                {renderReviewSection()}
              </div>

              {/* 지도 */}
              {renderMap()}
            </>
          )}

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}
export default PlaceDetailPage