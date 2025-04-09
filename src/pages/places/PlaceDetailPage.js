"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./PlaceDetailPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"

function PlaceDetailPage() {
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(true) // 테스트용
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    // 장소 상세 정보 가져오기
    const fetchPlaceDetail = async () => {
      try {
        console.log("Fetching place details for id:", id) // 디버깅용
        setLoading(true)

        // 실제 구현에서는 API 호출로 대체
        // 테스트용 목업 데이터
        setTimeout(() => {
          const mockPlaceDetail = {
            id: Number(id),
            name: "해운대 반려견 비치파크",
            region: "부산",
            address: "부산광역시 해운대구 우동",
            description:
              "이 곳은 반려견과 함께 즐길 수 있는 멋진 장소입니다. 넓은 공원과 다양한 시설을 갖추고 있습니다.",
            operatingHours: "09:00 - 18:00",
            entryFee: "무료",
            parkingAvailable: "가능",
            isOutdoor: "야외",
            phoneNumber: "02-123-4567",
            category: "여행지",
            rating: 4.5,
            amenities: ["반려견 전용 공간", "물놀이 시설", "샤워 시설"],
            reviews: [
              {
                name: "홍길동",
                rating: 5,
                comment: "정말 멋진 관광지였습니다! 방문할 가치가 있어요.",
              },
              {
                name: "김철수",
                rating: 4,
                comment: "아이들과 함께 가기 좋은 장소였습니다.",
              },
              {
                name: "박영희",
                rating: 3,
                comment: "조금 더 개선이 필요하지만 나쁘지 않았습니다.",
              },
            ],
            images: ["/placeholder.svg?height=400&width=800", "/placeholder.svg?height=400&width=800"],
            lat: 35.1586,
            lng: 129.1615,
          }

          console.log("Setting place data:", mockPlaceDetail) // 디버깅용
          setPlace(mockPlaceDetail)
          setLoading(false)
        }, 800)
      } catch (error) {
        console.error("장소 로딩 오류:", error)
        setLoading(false)
      }
    }

    fetchPlaceDetail()
  }, [id])

  const handleGoBack = () => {
    navigate("/places")
  }

  // 별점 렌더링 함수
  const renderStars = (rating) => {
    return (
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
          {/* 뒤로 가기 버튼 */}
          <button className="btn btn-outline-secondary mb-3" onClick={handleGoBack}>
            <i className="bi bi-arrow-left me-1"></i> 목록으로 돌아가기
          </button>

          {/* 장소 헤더 및 이미지 */}
          <div className="row mb-4">
            <div className="col">
              <img
                src={place.images[0] || "/placeholder.svg?height=400&width=800"}
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

              {place.amenities && place.amenities.length > 0 && (
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

          {/* 장소 정보 */}
          <div className="card mb-4 info-card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h4 className="border-bottom pb-2 mb-3">장소 정보</h4>
                  <dl className="row">
                    <dt className="col-sm-4">주소</dt>
                    <dd className="col-sm-8">
                      {place.address}
                      <button type="button" className="btn btn-sm btn-outline-secondary ms-2">
                        <i className="bi bi-clipboard"></i> 복사
                      </button>
                    </dd>

                    <dt className="col-sm-4">운영시간</dt>
                    <dd className="col-sm-8">{place.operatingHours}</dd>

                    <dt className="col-sm-4">입장료</dt>
                    <dd className="col-sm-8">{place.entryFee}</dd>
                  </dl>
                </div>
                <div className="col-md-6">
                  <h4 className="border-bottom pb-2 mb-3">추가 정보</h4>
                  <dl className="row">
                    <dt className="col-sm-4">주차여부</dt>
                    <dd className="col-sm-8">{place.parkingAvailable}</dd>

                    <dt className="col-sm-4">실외여부</dt>
                    <dd className="col-sm-8">{place.isOutdoor}</dd>

                    <dt className="col-sm-4">문의 및 안내</dt>
                    <dd className="col-sm-8">{place.phoneNumber}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 리뷰 섹션 */}
          <h3 className="mb-3">방문 후기</h3>
          {place.reviews.map((review, index) => (
            <div key={index} className="card mb-3 review-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">{review.name}</h5>
                  <div>{renderStars(review.rating)}</div>
                </div>
                <p className="card-text">{review.comment}</p>
              </div>
            </div>
          ))}

          {/* 지도 */}
          <div className="row mt-4">
            <div className="col">
              <h3 className="mb-3">위치</h3>
              <div className="map-container">
                <KakaoMap
                  readOnly={true}
                  initialLocation={{
                    id: place.id, // Places 엔티티 ID 추가
                    name: place.name,
                    address: place.address,
                    lat: place.lat || 37.5665, // 기본값 설정
                    lng: place.lng || 126.978, // 기본값 설정
                    isRegisteredPlace: true, // 등록된 장소임을 표시
                    category: place.category,
                    rating: place.rating,
                  }}
                  height="400px"
                  showSearchBar={false}
                  defaultLevel={3}
                  showRegisteredPlaces={false} // 장소 상세 페이지에서는 등록된 장소 검색 비활성화
                />
              </div>
            </div>
          </div>

          <div className="admin-controls-container mt-4">
            <button className="btn btn-outline-secondary me-2" onClick={() => setIsLoggedIn(!isLoggedIn)}>
              테스트: {isLoggedIn ? "로그아웃 상태로 변경" : "로그인 상태로 변경"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default PlaceDetailPage
