"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [showReviewForm, setShowReviewForm] = useState(false)
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
      images: [placeData.placeImage || "/placeholder.svg?height=400&width=800"],
      lat: placeData.latitude || 37.5665,
      lng: placeData.longitude || 126.978,
      lastUpdated: placeData.lastUpdated || null,
    }
  }, [])

  // Fetch place details
  useEffect(() => {
    const fetchPlaceDetail = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/places/${id}`)
        const formattedPlace = formatPlaceData(response.data)
        setPlace(formattedPlace)
      } catch (error) {
        console.error("장소 로딩 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaceDetail()
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

  // Handle review submission
  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (!newReview.comment) return

    try {
      // Add review to UI
      const updatedPlace = { ...place }
      updatedPlace.reviews = [
        {
          name: "사용자",
          rating: newReview.rating,
          comment: newReview.comment,
        },
        ...updatedPlace.reviews,
      ]

      // Update average rating
      const totalRating = updatedPlace.reviews.reduce((sum, review) => sum + review.rating, 0)
      updatedPlace.rating = (totalRating / updatedPlace.reviews.length).toFixed(1)

      setPlace(updatedPlace)
      setNewReview({ rating: 5, comment: "" })
      setShowReviewForm(false)
    } catch (error) {
      console.error("리뷰 제출 오류:", error)
      alert("리뷰 제출 중 오류가 발생했습니다.")
    }
  }

  // Get map URLs

  const getKakaoMapUrl = () =>
    place ? `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}` : "#"

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
          <div className="row mb-4">
            <div className="col">
              <img
                src={place.images[0] || "/placeholder.svg"}
                alt={place.name}
                className="img-fluid rounded shadow-sm"
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
                      <a
                        href={getKakaoMapUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-kakao-small ms-2"
                        title="카카오맵으로 길찾기"
                      >
                        <i className="bi bi-geo-alt-fill me-1"></i>길찾기
                      </a>
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

          {/* Reviews section */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0 section-title review-title">방문 후기</h3>
            {isLoggedIn && (
              <button className="btn btn-primary" onClick={() => setShowReviewForm(!showReviewForm)}>
                <i className="bi bi-pencil-square me-1"></i>
                {showReviewForm ? "작성 취소" : "리뷰 작성하기"}
              </button>
            )}
          </div>

          {/* Review form */}
          {showReviewForm && (
            <div className="card mb-4 review-form-card">
              <div className="card-body">
                <h5 className="card-title mb-3">리뷰 작성</h5>
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3">
                    <label className="form-label">평점</label>
                    <div className="rating-select">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`bi ${newReview.rating >= star ? "bi-star-fill" : "bi-star"} text-warning fs-4 me-1`}
                          style={{ cursor: "pointer" }}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                        ></i>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="reviewComment" className="form-label">
                      후기
                    </label>
                    <textarea
                      className="form-control"
                      id="reviewComment"
                      rows="3"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="이 장소에 대한 경험을 공유해주세요"
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    제출하기
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Review list - 후기 없음 영역 디자인 수정 */}
          {place.reviews?.length > 0
            ? place.reviews.map((review, index) => (
                <div key={index} className="card mb-3 review-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title mb-0">{review.name}</h5>
                      <div>{renderStars(review.rating)}</div>
                    </div>
                    <p className="card-text">{review.comment}</p>
                  </div>
                </div>
              ))
            : !showReviewForm && (
                <div className="no-reviews-container">
                  <div className="no-reviews-icon">
                    <i className="bi bi-chat-square-text"></i>
                  </div>
                  <p className="no-reviews-text">아직 작성된 리뷰가 없습니다</p>
                  <p className="no-reviews-subtext">첫 번째 리뷰를 작성해보세요!</p>
                </div>
              )}

          {/* Map */}
          <div className="row mt-4">
            <div className="col">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0 section-title">위치</h3>
              </div>
              <div className="map-container">
                <KakaoMap
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
                />
              </div>
            </div>
          </div>

          {/* Last updated */}
          {place.lastUpdated && (
            <div className="text-muted mt-4 text-end">
              <small>마지막 정보 업데이트: {place.lastUpdated}</small>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}

export default PlaceDetailPage
