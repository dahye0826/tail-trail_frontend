"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate, Link, useLocation } from "react-router-dom"
import axios from "axios"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./PlaceDetailPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"

const API_BASE_URL = "http://localhost:9000/api"

function PlaceDetailPage() {
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [visitHistory, setVisitHistory] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [mapContainerReady, setMapContainerReady] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [newReview, setNewReview] = useState({
    rating: 5,
    note: "",
    visitDate: new Date().toISOString().split("T")[0],
  })
  const mapContainerRef = useRef(null)
  const { id } = useParams()
  const navigate = useNavigate()
  const reviewRef = useRef(null)
  const location = useLocation()
  const [averageRating, setAverageRating] = useState(0)
  const [reviewList, setReviewList] = useState([])
  const [reportingReviewId, setReportingReviewId] = useState(null)

  // Format incoming place data
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
      isReported: placeData.isReported || false,
    }
  }, [])

  // 리뷰 신고 처리 함수 추가
  const handleReviewReport = async (visitId, reason) => {
    try {
      const response = await axios.post("http://localhost:9000/api/report", {
        targetId: visitId,
        targetType: "VISITEDPLACE",
        userId: currentUser.userId,
        reason: reason,
      })

      alert(`리뷰가 '${reason}' 사유로 신고되었습니다.`)
      setReportingReviewId(null)

      // 신고된 리뷰 표시 업데이트
      setReviewList((prev) =>
        prev.map((review) => (review.visitId === visitId ? { ...review, isReported: true } : review)),
      )
    } catch (err) {
      console.log("신고 오류", err)
      alert("신고 처리 중 오류가 발생하였습니다")
    }
  }

  // 현재 사용자 정보 로드
  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const userName = localStorage.getItem("userName")
    const userEmail = localStorage.getItem("userEmail")

    if (userId && userName) {
      const userData = {
        userId: Number(userId),
        userName,
        email: userEmail,
      }
      setCurrentUser(userData)
      setIsLoggedIn(true)
    } else {
      setCurrentUser(null)
      setIsLoggedIn(false)
    }
  }, [location])

  // 방문 이력 로드
  const loadVisitHistory = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) return

      const response = await axios.get(`${API_BASE_URL}/visited-place/check`, {
        params: {
          userId: Number(userId),
          placeId: Number(id),
        },
      })

      if (response.data) {
        setVisitHistory(response.data)
      }
    } catch (error) {
      console.error("방문 이력 로드 오류:", error)
    }
  }, [id])

  // 방문 후기 제출
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    const userId = localStorage.getItem("userId")
    if (!userId) {
      alert("로그인이 필요합니다.")
      navigate("/login")
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

        // 리뷰 목록 다시 불러오기
        const reviewsResponse = await axios.get(`${API_BASE_URL}/visited-place/reviews`, {
          params: { placeId: id },
        })
        setReviewList(reviewsResponse.data)

        // 평균 별점 다시 불러오기
        fetchAverageRating()

        setShowReviewForm(false)
        setIsEditMode(false)
        alert("방문 후기가 등록되었습니다.")
      }
    } catch (error) {
      console.error("리뷰 제출 오류:", error)
      alert("방문 후기 등록에 실패했습니다. 오류: " + error.message)
    }
  }

  // 방문 후기 수정
  const handleReviewUpdate = async (e) => {
    e.preventDefault()
    if (!visitHistory) return

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

      const response = await axios.put(`${API_BASE_URL}/visited-place/${visitHistory.visitId}`, reviewData)

      if (response.data) {
        console.log("서버 응답:", response.data) // 디버깅용 로그

        // 리뷰 목록 다시 불러오기
        const reviewsResponse = await axios.get(`${API_BASE_URL}/visited-place/reviews`, {
          params: { placeId: id },
        })
        setReviewList(reviewsResponse.data)

        // 평균 별점 다시 불러오기
        fetchAverageRating()

        setVisitHistory(response.data)
        setShowReviewForm(false)
        setIsEditMode(false)
        alert("방문 후기가 수정되었습니다.")
      }
    } catch (error) {
      console.error("리뷰 수정 오류:", error)
      alert("방문 후기 수정에 실패했습니다. 오류: " + error.message)
    }
  }

  // 방문 후기 삭제
  const handleReviewDelete = async () => {
    if (!visitHistory || !window.confirm("방문 후기를 삭제하시겠습니까?")) return

    try {
      await axios.delete(`${API_BASE_URL}/visited-place/${visitHistory.visitId}`)

      // 리뷰 목록 다시 불러오기
      const reviewsResponse = await axios.get(`${API_BASE_URL}/visited-place/reviews`, {
        params: { placeId: id },
      })
      setReviewList(reviewsResponse.data)

      // 평균 별점 다시 불러오기
      fetchAverageRating()

      setVisitHistory(null)
      alert("방문 후기가 삭제되었습니다.")
    } catch (error) {
      console.error("리뷰 삭제 오류:", error)
      alert("방문 후기 삭제에 실패했습니다.")
    }
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
        loadVisitHistory()
      } else {
        setIsFavorite(false)
      }
    }

    checkLoginStatus()
    // 로그인 상태 변경 감지
    window.addEventListener("storage", checkLoginStatus)

    return () => {
      window.removeEventListener("storage", checkLoginStatus)
    }
  }, [checkFavoriteStatus, loadVisitHistory])

  // 즐겨찾기 토글 함수
  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.")
      navigate("/login")
      return
    }

    const userId = localStorage.getItem("userId")
    if (!userId) {
      alert("로그인이 필요한 서비스입니다.")
      navigate("/login")
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
        alert(message)
      }
    } catch (error) {
      console.error("즐겨찾기 처리 실패:", error)
      alert("즐겨찾기 처리 중 오류가 발생했습니다.")
    }
  }

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

  useEffect(() => {
    if (location.hash === "#review" && reviewRef.current) {
      reviewRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [location])

  // 별점 선택 컴포넌트
  const StarRating = ({ rating, onRatingChange }) => {
    const [hoverRating, setHoverRating] = useState(0)

    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1
          return (
            <i
              key={index}
              className={`bi ${ratingValue <= (hoverRating || rating) ? "bi-star-fill" : "bi-star"} text-warning star-icon`}
              onClick={() => onRatingChange(ratingValue)}
              onMouseEnter={() => setHoverRating(ratingValue)}
              onMouseLeave={() => setHoverRating(0)}
            ></i>
          )
        })}
        <span className="ms-2 rating-text">({rating}점)</span>
      </div>
    )
  }

  // 새 리뷰 작성 시작
  const handleStartNewReview = () => {
    setNewReview({
      rating: 5,
      note: "",
      visitDate: new Date().toISOString().split("T")[0],
    })
    setIsEditMode(false)
    setShowReviewForm(true)
  }

  // 리뷰 수정 시작
  const handleStartEditReview = (review) => {
    setNewReview({
      rating: review.rating,
      note: review.note,
      visitDate: review.visitDate,
    })
    setVisitHistory(review)
    setIsEditMode(true)
    setShowReviewForm(true)
  }

  // renderReviewForm 함수를 다음과 같이 수정합니다:
  const renderReviewForm = () => (
    <form onSubmit={isEditMode ? handleReviewUpdate : handleReviewSubmit} className="review-form">
      <div className="mb-3">
        <label className="form-label">평점</label>
        <StarRating
          rating={newReview.rating}
          onRatingChange={(value) => setNewReview({ ...newReview, rating: value })}
        />
      </div>
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
      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-secondary" onClick={() => setShowReviewForm(false)}>
          취소
        </button>
        <button type="submit" className="btn btn-primary">
          {isEditMode ? "수정하기" : "등록하기"}
        </button>
      </div>
    </form>
  )

  // renderStars 함수를 다음과 같이 수정합니다:
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="d-inline-flex align-items-center">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>
        ))}
        {hasHalfStar && <i className="bi bi-star-half text-warning"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="bi bi-star text-warning"></i>
        ))}
        <span className="ms-1">({rating.toFixed(1)})</span>
      </div>
    )
  }

  // renderReviewContent 함수를 다음과 같이 수정합니다:
  const renderReviewContent = () => (
    <div className="review-content">
      <div className="d-flex align-items-center mb-3">
        <div className="rating me-3">{renderStars(visitHistory.rating)}</div>
        <small className="text-muted">방문일: {new Date(visitHistory.visitDate).toLocaleDateString()}</small>
      </div>
      <div className="review-text-container">
        <p className="review-text mb-2">{visitHistory.note}</p>
        <small className="text-muted">작성일: {new Date(visitHistory.createdAt).toLocaleDateString()}</small>
      </div>
      <div className="mt-3 d-flex justify-content-end gap-2">
        <button className="btn btn-outline-primary btn-sm" onClick={() => handleStartEditReview(visitHistory)}>
          수정
        </button>
        <button className="btn btn-outline-danger btn-sm" onClick={handleReviewDelete}>
          삭제
        </button>
      </div>
    </div>
  )

  const renderPetSizeIcons = (categories) => {
    if (!categories?.length) return null

    return (
      <div className="pet-size-icons mb-2">
        {categories.includes("small") && (
          <span className="badge bg-info me-1" title="소형견 출입 가능">
            소형견
          </span>
        )}
        {categories.includes("medium") && (
          <span className="badge bg-success me-1" title="중형견 출입 가능">
            중형견
          </span>
        )}
        {categories.includes("large") && (
          <span className="badge bg-warning me-1" title="대형견 출입 가능">
            대형견
          </span>
        )}
      </div>
    )
  }

  // 방문 후기가 없을 때 표시할 컴포넌트
  const renderNoReviews = () => (
    <div className="no-reviews-container">
      <div className="no-reviews-icon">
        <i className="bi bi-chat-square-text"></i>
      </div>
      <p className="no-reviews-text">아직 후기가 없습니다</p>
      <p className="no-reviews-subtext">첫 후기를 남겨주세요!</p>
      {isLoggedIn && (
        <button className="btn btn-primary review-write-btn mt-3" onClick={handleStartNewReview}>
          방문 후기 작성하기
        </button>
      )}
    </div>
  )

  // 방문 후기 섹션 렌더링
  const renderReviewSection = () => {
    if (!isLoggedIn) {
      return (
        <div className="text-center py-4">
          <div className="no-reviews-icon">
            <i className="bi bi-chat-square-text"></i>
          </div>
          <p className="no-reviews-text">로그인 후 방문 후기를 작성할 수 있습니다</p>
          <Link to="/login" className="btn btn-primary mt-3">
            로그인하기
          </Link>
        </div>
      )
    }

    if (showReviewForm) {
      return renderReviewForm()
    }

    if (visitHistory) {
      return renderReviewContent()
    }

    return renderNoReviews()
  }

  // 지도 컴포넌트 렌더링
  const renderMap = () => {
    if (loading || !place) return null

    return (
      <div className="row mt-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0 section-titlelocation">위치</h3>
          </div>
          <div className="map-container" ref={mapContainerRef} style={{ minHeight: "700px", width: "100%" }}>
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
    <div className="row mb-4">
      <div className="col">
        <div className="position-relative">
          <img
            src={place.images[0] || "/placeholder.svg"}
            alt={place.name}
            className="img-fluid rounded shadow-sm"
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=400&width=800"
            }}
          />
          <button
            className={`btn-favorite ${isFavorite ? "active" : ""}`}
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
    <div className="category-rating-container">
      <div className="category-badge-wrapper">
        <span className="category-badge">{place.category}</span>
      </div>
      <div className="rating-display">
        {renderStars(averageRating)}
        <span className="rating-count">({averageRating ? averageRating.toFixed(1) : "0.0"})</span>
      </div>
    </div>
  )

  // 리뷰 목록 조회
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/visited-place/reviews`, {
          params: { placeId: id },
        })
        setReviewList(response.data)
      } catch (error) {
        console.error("리뷰 리스트 불러오기 오류:", error)
      }
    }

    if (!loading) {
      fetchReviews()
    }
  }, [id, loading])

  // 리뷰 목록 렌더링
  const renderReviewList = () => {
    if (reviewList.length === 0) {
      return (
        <div className="no-reviews-container">
          <div className="no-reviews-icon">
            <i className="bi bi-chat-square-text"></i>
          </div>
          <p className="no-reviews-text">아직 등록된 방문후기가 없습니다</p>
          {isLoggedIn && (
            <button className="btn btn-primary review-write-btn mt-3" onClick={handleStartNewReview}>
              첫 방문 후기 작성하기
            </button>
          )}
        </div>
      )
    }

    return (
      <>
        <div className="review-list">
          {reviewList.map((review, idx) => (
            <div key={idx} className="review-item">
              <div className="review-header">
                <div className="user-initial-avatar">{review.userName ? review.userName.charAt(0) : "?"}</div>
                <div className="review-author-info">
                  <div className="review-author">{review.userName || "익명"}</div>
                  <div className="review-dates">
                    <span>방문일: {new Date(review.visitDate).toLocaleDateString()}</span>
                    <span className="mx-2">|</span>
                    <span>작성일: {new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="review-rating-container ms-auto">
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`bi ${i < review.rating ? "bi-star-fill" : "bi-star"} text-warning`}></i>
                    ))}
                  </div>

                  {/* 신고 기능 - 별점 오른쪽에 배치 */}
                  {isLoggedIn && currentUser && currentUser.userId !== review.userId && (
                    <div className="report-icon-container">
                      {review.isReported ? (
                        <span className="reported-icon" title="신고됨">
                          <i className="bi bi-flag-fill"></i>
                        </span>
                      ) : (
                        <>
                          <i
                            className="bi bi-flag report-icon"
                            onClick={() =>
                              setReportingReviewId(reportingReviewId === review.visitId ? null : review.visitId)
                            }
                            title="신고하기"
                          ></i>
                          {reportingReviewId === review.visitId && (
                            <div className="report-dropdown">
                              <div className="report-dropdown-header">신고 사유 선택</div>
                              <div
                                className="report-dropdown-item"
                                onClick={() => handleReviewReport(review.visitId, "영리목적/홍보성")}
                              >
                                영리목적/홍보성
                              </div>
                              <div
                                className="report-dropdown-item"
                                onClick={() => handleReviewReport(review.visitId, "욕설/인신공격")}
                              >
                                욕설/인신공격
                              </div>
                              <div
                                className="report-dropdown-item"
                                onClick={() => handleReviewReport(review.visitId, "스팸")}
                              >
                                스팸
                              </div>
                              <div
                                className="report-dropdown-item"
                                onClick={() => handleReviewReport(review.visitId, "기타")}
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
              </div>
              <div className="review-content-text">{review.note}</div>

              {/* 내 리뷰인 경우 수정/삭제 버튼 표시 */}
              {currentUser && currentUser.userId === review.userId && (
                <div className="review-actions">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleStartEditReview(review)}>
                    수정
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger ms-2"
                    onClick={() => {
                      if (window.confirm("정말 삭제하시겠습니까?")) {
                        axios
                          .delete(`${API_BASE_URL}/visited-place/${review.visitId}`)
                          .then(() => {
                            setReviewList((prev) => prev.filter((r) => r.visitId !== review.visitId))
                            alert("리뷰가 삭제되었습니다.")
                          })
                          .catch((err) => {
                            console.error("리뷰 삭제 오류:", err)
                            alert("리뷰 삭제에 실패했습니다.")
                          })
                      }
                    }}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 항상 방문 후기 작성하기 버튼 표시 */}
        {isLoggedIn && (
          <div className="text-center mt-4">
            <button className="btn btn-primary review-write-btn" onClick={handleStartNewReview}>
              방문 후기 작성하기
            </button>
          </div>
        )}
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="places-background">
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

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="places-background">
        <div className="container py-4 place-detail-container">
          {/* Back button */}
          <button className="btn btn-outline-secondary mb-3" onClick={() => navigate("/places")}>
            <i className="bi bi-arrow-left me-1"></i> 목록으로
          </button>

          {/* Place header and image */}
          {!loading && place && (
            <>
              {renderImageSection()}
              <div className="row mb-3">
                <div className="col">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="place-name-rating">
                        <h2 className="mb-1 section-titleplacename">{place.name}</h2>
                        <div className="place-rating">{renderStars(averageRating)}</div>
                      </div>
                      <div className="place-category">{place.category}</div>
                    </div>
                  </div>
                  <p className="text-muted mb-3" style={{ fontSize: "15px" }}>
                    {place.description}
                  </p>
                  <div className="mb-3">
                    {/* Pet size icons */}
                    {renderPetSizeIcons(place.petSizeCategories)}

                    {place.amenities?.length > 0 && (
                      <div className="amenities mb-3">
                        {place.amenities.map((amenity, index) => (
                          <span key={index} className="badge amenity-badge">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Place information */}
              <div className="card mb-4 info-card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h4 className="section-titleplaceinfo mb-3">장소 정보</h4>
                      <dl className="row">
                        <dt className="col-sm-4">주소</dt>
                        <dd className="col-sm-8">
                          {place.address}
                          <button
                            type="button"
                            className="btn-icon-copy ms-2"
                            onClick={() => navigator.clipboard.writeText(place.address)}
                            title="주소 복사"
                          >
                            <i className="bi bi-clipboard"></i>
                          </button>
                        </dd>

                        <dt className="col-sm-4">운영시간</dt>
                        <dd className="col-sm-8">{place.operatingHours}</dd>

                        <dt className="col-sm-4">휴무일</dt>
                        <dd className="col-sm-8">{place.closedDay}</dd>

                        <dt className="col-sm-4">입장료</dt>
                        <dd className="col-sm-8">{place.entryFee}</dd>
                      </dl>
                    </div>
                    <div className="col-md-6">
                      <h4 className="section-titleadditionalinfo mb-3">추가 정보</h4>
                      <dl className="row">
                        <dt className="col-sm-4">주차여부</dt>
                        <dd className="col-sm-8">{place.parkingAvailable}</dd>

                        <dt className="col-sm-4">실외여부</dt>
                        <dd className="col-sm-8">{place.isOutdoor}</dd>

                        <dt className="col-sm-4">문의 및 안내</dt>
                        <dd className="col-sm-8">{place.phoneNumber}</dd>

                        <dt className="col-sm-4">반려견 추가 요금</dt>
                        <dd className="col-sm-8">{place.petExtraCharge}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* 방문 후기 섹션 - 제목을 카드 밖으로 이동 */}
              <div className="row mt-4" ref={reviewRef}>
                <div className="col">
                  <h3 className="mb-0 section-titlereview">방문 후기</h3>
                  <div className="review-card-container mt-3">
                    {showReviewForm ? renderReviewForm() : renderReviewList()}
                  </div>
                </div>
              </div>

              {/* Map */}
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
