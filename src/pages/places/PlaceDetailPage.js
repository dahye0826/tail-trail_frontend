"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./PlaceDetailPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"
import { usePlaceViewTracker } from "../../api/PlaceViewTracker"
import { useReview } from "../../hooks/useReview"

const API_BASE_URL = "http://localhost:9000/api"

function PlaceDetailPage() {
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [visitHistory, setVisitHistory] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [mapContainerReady, setMapContainerReady] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    note: "",
    visitDate: new Date().toISOString().split('T')[0]
  })
  const mapContainerRef = useRef(null)
  const { id } = useParams()
  const navigate = useNavigate()

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
          placeData.placeImage
            ? `http://localhost:9000${placeData.placeImage}`
            : "/placeholder.svg?height=400&width=800"
        ],
      lat: placeData.latitude || 37.5665,
      lng: placeData.longitude || 126.978,
      lastUpdated: placeData.lastUpdated || null,
    }
  }, [])

  // 방문 이력 로드
  const loadVisitHistory = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) return

      const response = await axios.get(`${API_BASE_URL}/visited-place/check`, {
        params: {
          userId: Number(userId),
          placeId: Number(id)
        }
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
      const today = new Date().toISOString().split('T')[0];
      const reviewData = {
        userId: Number(userId),
        placeId: Number(id),
        rating: Number(newReview.rating),
        note: newReview.note,
        visitDate: today,
        createdAt: today
      }

      console.log("전송할 리뷰 데이터:", reviewData); // 디버깅용 로그

      const response = await axios.post(`${API_BASE_URL}/visited-place`, reviewData)
      
      if (response.data) {
        console.log("서버 응답:", response.data); // 디버깅용 로그
        setVisitHistory(response.data)
        setShowReviewForm(false)
        alert("방문 후기가 등록되었습니다.")
        window.location.reload() // 페이지 새로고침
      }
    } catch (error) {
      console.error("리뷰 제출 오류:", error)
      alert("방문 후기 등록에 실패했습니다. 오류: " + error.message)
    }
  }

  // 방문 후기 수정
  const handleReviewUpdate = async () => {
    if (!visitHistory) return

    try {
      const today = new Date().toISOString().split('T')[0];
      const reviewData = {
        userId: Number(localStorage.getItem("userId")),
        placeId: Number(id),
        rating: Number(newReview.rating),
        note: newReview.note,
        visitDate: today,
        createdAt: today
      }

      console.log("수정할 리뷰 데이터:", reviewData); // 디버깅용 로그

      const response = await axios.put(
        `${API_BASE_URL}/visited-place/${visitHistory.visitId}`,
        reviewData
      )

      if (response.data) {
        console.log("서버 응답:", response.data); // 디버깅용 로그
        setVisitHistory(response.data)
        setShowReviewForm(false)
        alert("방문 후기가 수정되었습니다.")
        window.location.reload() // 페이지 새로고침
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
      setVisitHistory(null)
      alert("방문 후기가 삭제되었습니다.")
    } catch (error) {
      console.error("리뷰 삭제 오류:", error)
      alert("방문 후기 삭제에 실패했습니다.")
    }
  }

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loginStatus)
    
    if (loginStatus) {
      loadVisitHistory()
    }
  }, [loadVisitHistory])

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

  // Render stars for ratings
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

  // Render pet size icons - 아이콘 제거
  const renderPetSizeIcons = (categories) => {
    if (!categories?.length) return null

    return (
      <div className="pet-size-icons mb-2">
        {categories.includes("small") && (
          <span className="badge bg-info me-1" title="소형견 출입 가능">
            소형
          </span>
        )}
        {categories.includes("medium") && (
          <span className="badge bg-success me-1" title="중형견 출입 가능">
            중형
          </span>
        )}
        {categories.includes("large") && (
          <span className="badge bg-warning me-1" title="대형견 출입 가능">
            대형
          </span>
        )}
      </div>
    )
  }

  // 방문 후기 폼 렌더링
  const renderReviewForm = () => (
    <form onSubmit={visitHistory ? handleReviewUpdate : handleReviewSubmit} className="review-form">
      <div className="mb-3">
        <label className="form-label">평점</label>
        <select
          className="form-control"
          value={newReview.rating}
          onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
          required
        >
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating}점
            </option>
          ))}
        </select>
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
          {visitHistory ? "수정하기" : "등록하기"}
        </button>
      </div>
    </form>
  )

  // 방문 후기 표시
  const renderReviewContent = () => (
    <div className="review-content">
      <div className="d-flex align-items-center mb-3">
        <div className="rating me-3">
          {renderStars(visitHistory.rating)}
          <span className="ms-2">{visitHistory.rating}점</span>
        </div>
        <small className="text-muted">
          방문일: {new Date(visitHistory.visitDate).toLocaleDateString()}
        </small>
      </div>
      <div className="review-text-container">
        <p className="review-text mb-2">{visitHistory.note}</p>
        <small className="text-muted">
          작성일: {new Date(visitHistory.createdAt).toLocaleDateString()}
        </small>
      </div>
      <div className="mt-3 d-flex justify-content-end gap-2">
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => {
            setNewReview({
              rating: visitHistory.rating,
              note: visitHistory.note,
              visitDate: visitHistory.visitDate
            })
            setShowReviewForm(true)
          }}
        >
          수정
        </button>
        <button className="btn btn-outline-danger btn-sm" onClick={handleReviewDelete}>
          삭제
        </button>
      </div>
    </div>
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

    if (visitHistory) {
      return renderReviewContent()
    }

    return (
      <div className="text-center py-4">
        <button className="btn btn-primary" onClick={() => setShowReviewForm(true)}>
          방문 후기 작성하기
        </button>
      </div>
    )
  }

  // 지도 컴포넌트 렌더링
  const renderMap = () => {
    if (loading || !place) return null;

    return (
      <div className="row mt-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0 section-title">위치</h3>
          </div>
          <div 
            ref={mapContainerRef}
            className="map-container" 
            style={{ minHeight: "700px", width: "100%" }}
          >
            {mapContainerRef.current && (
              <KakaoMap
                key={`map-${place.id}-${mapContainerRef.current ? 'mounted' : 'loading'}`}
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
    );
  };

  // 지도 컨테이너 초기화 확인
  useEffect(() => {
    if (mapContainerRef.current && place) {
      // 지도 컨테이너가 준비되면 강제로 리렌더링
      setMapContainerReady(true);
    }
  }, [place, mapContainerRef.current]);

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
              <div className="row mb-4">
                <div className="col">
                  <img
                    src={place.images[0] || "/placeholder.svg"}
                    alt={place.name}
                    className="img-fluid rounded shadow-sm"
                    onError={(e) => {e.target.src = "/placeholder.svg?height=400&width=800"}}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <h3 className="mb-1">{place.name}</h3>
                  <p className="text-muted mb-1">{place.address}</p>
                  <p className="text-muted mb-3" style={{ fontSize: "15px" }}>
                    {place.description}
                  </p>
                  <div className="mb-3">
                    <span className="badge category-badge">{place.category}</span>
                    <span className="rating-display ms-2">
                      {renderStars(place.rating)} <span className="rating-text">({place.rating})</span>
                    </span>
                  </div>

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

              {/* Place information */}
              <div className="card mb-4 info-card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h4 className="section-title mb-3">장소 정보</h4>
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
                      <h4 className="section-title mb-3">추가 정보</h4>
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

              {/* 방문 후기 섹션 */}
              <div className="review-section mt-4">
                <h3 className="section-title mb-3">방문 후기</h3>
                {renderReviewSection()}
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
