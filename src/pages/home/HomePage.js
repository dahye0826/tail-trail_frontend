"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Carousel, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import axios from "axios"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./HomePage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"

const HomePage = () => {
  // 페이지 배경색 설정
  useEffect(() => {
    document.body.style.backgroundColor = "#fbfbe9"
    return () => {
      document.body.style.backgroundColor = ""
    }
  }, [])

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [communityPosts, setCommunityPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [places, setPlaces] = useState([])

  // 1. 리뷰 데이터를 위한 state와 loading state 추가
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])


  useEffect(() => {
    const fetchCommunityPosts = async () => {
      try {
        setLoading(true)

        const response = await axios.get("http://localhost:9000/api/community", {
          params: {
            page: 0,
            size: 4, 
          },
        })

        // 응답 데이터 형식에 맞게 처리
        const formattedPosts = response.data.content.map((post) => ({
          id: post.postId,
          title: post.title,
          content: post.content,
          userName: post.userName,
          createdAt: post.createdAt.split("T")[0],
        }))

        setCommunityPosts(formattedPosts)
        setLoading(false)
      } catch (error) {
        console.error("커뮤니티 게시글 로딩 오류:", error)
        setLoading(false) 
      }
    }

    fetchCommunityPosts()
  }, [])

  // 장소 데이터 가져오기
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get("http://localhost:9000/api/places/all")
        const rawPlaces = response.data || []

        // 이미지 경로 추가해서 가공
        const formattedPlaces = rawPlaces.map((place) => ({
          ...place,
          imageUrl: place.placeImage
            ? `http://localhost:9000${place.placeImage.startsWith("/") ? place.placeImage : "/" + place.placeImage}`
            : "/placeholder.svg", // 기본 이미지 대체
        }))

        setPlaces(formattedPlaces)
      } catch (error) {
        console.error("장소 데이터 로딩 오류:", error)
        setPlaces([])
      }
    }

    fetchPlaces()
  }, [])

  // (1) 최근 리뷰 데이터 가져오기
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true)
        const response = await axios.get("http://localhost:9000/api/visited-place/recent-reviews", {
          params: { size: 4 },
        })
        console.log("최근 리뷰 데이터:", response.data)
        setReviews(response.data)
        setReviewsLoading(false)
      } catch (error) {
        console.error("최근 리뷰 로딩 오류:", error)
        setReviewsLoading(false)
        setReviews([])
      }
    }

    fetchReviews()
  }, [])

  // (2)placeImage 
  useEffect(() => {
    const fetchReviewImages = async () => {
      if (reviews.length > 0) {
        try {
          const updatedReviews = await Promise.all(
            reviews.map(async (review) => {
              try {
                const response = await axios.get(`http://localhost:9000/api/places/${review.placeId}`)
                const placeData = response.data
                return {
                  ...review,
                  placeImage: placeData.placeImage
                    ? placeData.placeImage.startsWith("/")
                      ? `http://localhost:9000${placeData.placeImage}`
                      : `http://localhost:9000/${placeData.placeImage}`
                    : "/placeholder.svg",
                }
              } catch (error) {
                console.error(`장소 ${review.placeId} 이미지 로딩 오류:`, error)
                return {
                  ...review,
                  placeImage: "/placeholder.svg",
                }
              }
            }),
          )

          setReviews(updatedReviews)
        } catch (error) {
          console.error("리뷰 이미지 보완 오류:", error)
        }
      }
    }

    fetchReviewImages()
  }, [reviews.length])


  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="home-page" style={{ backgroundColor: "#fbfbe9" }}>
        <Container className="py-4">
          <div className="rounded-banner">
            <Carousel fade interval={5000} indicators={false} className="banner-carousel">
              <Carousel.Item>
                <div
                  className="banner-image lawon-image"
                  style={{
                    backgroundImage: `url(${process.env.PUBLIC_URL}/images/lawon01.png)`,
                  }}
                >
                  <div className="banner-overlay"></div>
                  <div className="banner-content">
                    <h1 className="fw-bold">이음길</h1>
                    <p className="lead">꼬리를 따라 이어지는 여행길</p>
                  </div>
                  
                  
                  <div className="banner-content-mobile">
                    <h1 className="fw-bold">이음길</h1>
                    <p className="lead">꼬리를 따라 이어지는 여행길</p>
                  </div>
                  
                  <div className="mobile-auth-buttons">
                    {isLoggedIn ? (
                      <Button
                        variant="outline-light"
                        className="mobile-auth-btn"
                        onClick={() => {
                          localStorage.removeItem("token")
                          setIsLoggedIn(false)
                          window.location.href = "/"
                        }}
                      >
                        로그아웃
                      </Button>
                    ) : (
                      <>
                        <Link to="/login" className="btn btn-light mobile-auth-btn">
                          로그인
                        </Link>
                        <Link to="/signup" className="btn btn-outline-light mobile-auth-btn">
                          회원가입
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </Carousel.Item>

              {/* 두 번째 슬라이드 - ddomi 이미지 */}
              <Carousel.Item>
                <div
                  className="banner-image ddomi-image"
                  style={{
                    backgroundImage: `url(${process.env.PUBLIC_URL}/images/ddomi01.jpg)`,
                  }}
                >
                  <div className="banner-overlay"></div>
                  {/* 데스크톱용 배너 콘텐츠 */}
                  <div className="banner-content">
                    <h1 className="fw-bold">이음길</h1>
                    <p className="lead">꼬리를 따라 이어지는 여행길</p>
                  </div>

                  {/* 모바일용 배너 콘텐츠 */}
                  <div className="banner-content-mobile">
                    <h1 className="fw-bold">이음길</h1>
                    <p className="lead">꼬리를 따라 이어지는 여행길</p>
                  </div>

                  {/* 모바일 뷰에서 표시될 로그인/회원가입 버튼 */}
                  <div className="mobile-auth-buttons">
                    {isLoggedIn ? (
                      <Button
                        variant="outline-light"
                        className="mobile-auth-btn"
                        onClick={() => {
                          localStorage.removeItem("token")
                          setIsLoggedIn(false)
                          window.location.href = "/"
                        }}
                      >
                        로그아웃
                      </Button>
                    ) : (
                      <>
                        <Link to="/login" className="btn btn-light mobile-auth-btn">
                          로그인
                        </Link>
                        <Link to="/signup" className="btn btn-outline-light mobile-auth-btn">
                          회원가입
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </Carousel.Item>

              {/* 세 번째 슬라이드 - 새로 추가한 고양이 이미지 */}
              <Carousel.Item>
                <div
                  className="banner-image cat-image"
                  style={{
                    backgroundImage: `url(${process.env.PUBLIC_URL}/images/cat01.jpg)`,
                  }}
                >
                  <div className="banner-overlay"></div>
                  {/* 데스크톱용 배너 콘텐츠 */}
                  <div className="banner-content">
                    <h1 className="fw-bold">이음길</h1>
                    <p className="lead">꼬리를 따라 이어지는 여행길</p>
                  </div>

                  {/* 모바일용 배너 콘텐츠 */}
                  <div className="banner-content-mobile">
                    <h1 className="fw-bold">이음길</h1>
                    <p className="lead">꼬리를 따라 이어지는 여행길</p>
                  </div>

                  {/* 모바일 뷰에서 표시될 로그인/회원가입 버튼 */}
                  <div className="mobile-auth-buttons">
                    {isLoggedIn ? (
                      <Button
                        variant="outline-light"
                        className="mobile-auth-btn"
                        onClick={() => {
                          localStorage.removeItem("token")
                          setIsLoggedIn(false)
                          window.location.href = "/"
                        }}
                      >
                        로그아웃
                      </Button>
                    ) : (
                      <>
                        <Link to="/login" className="btn btn-light mobile-auth-btn">
                          로그인
                        </Link>
                        <Link to="/signup" className="btn btn-outline-light mobile-auth-btn">
                          회원가입
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </Carousel.Item>
            </Carousel>
          </div>
        </Container>

        {/* 지도 검색 섹션 - 커뮤니티 섹션보다 앞으로 이동 */}
        <div className="map-section py-4 mt-3">
          <Container>
            <div className="company-intro text-center mb-5">
              <h2 className="fw-bold section-title mb-3">이음길에 오신 것을 환영합니다</h2>
              <div className="welcome-message bg-white p-4 rounded shadow-sm">
                <i className="bi bi-quote quote-icon quote-left"></i>
                <p className="lead company-description">
                  반려동물의 시간은 우리와 다르기에 더 소중합니다. 이곳은 반려동물과 동반할 수 있는 카페, 여행지,
                  숙박업소 등을 찾을 수 있고 함께한 추억을 기록해서 누군가와 나눠주는 공간입니다. 이음길을 통해
                  반려동물과 함께하는 모든 순간이 특별한 추억으로 남길 바랍니다.
                </p>
                <i className="bi bi-quote quote-icon quote-right"></i>
              </div>
            </div>

            <div className="text-center mb-4">
              <h2 className="fw-bold section-title">지도로 쉽게 찾아보세요</h2>
              <p className="lead text-muted">반려동물과 함께 갈 수 있는 다양한 장소를 지도에서 한눈에 확인하세요</p>
            </div>

            <div className="position-relative">
              <div className="map-image-container mx-auto" style={{ maxWidth: "1200px" }}>
                <KakaoMap
                  readOnly={true}
                  initialLocation={null}
                  markerPositions={places.map((place) => ({
                    id: place.placeId,
                    lat: Number(place.latitude),
                    lng: Number(place.longitude),
                    name: place.placeName,
                    roadAddress: place.roadAddress,
                    category: place.industrySub,
                  }))}
                  height="500px"
                  showSearchBar={false}
                  defaultLevel={6}
                  showRegisteredPlaces={false}
                />
                <div className="position-absolute" style={{ top: "15px", right: "15px", zIndex: 1000 }}>
                  <Link to="/map" className="btn btn-light shadow-sm rounded-circle p-2" title="지도로 확장">
                    <i className="bi bi-arrows-fullscreen fs-4"></i>
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* 커뮤니티 섹션 - 지도 섹션 다음으로 이동 */}
        <div className="community-section py-5">
          <Container>
            <div className="text-center mb-4 d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold section-title">반려동물과의 여행 이야기</h2>
                <p className="lead text-muted mb-0">우리의 반려 이야기, 함께 나눠요.</p>
              </div>
              <Link to="/community" className="plus-btn">
                <i className="bi bi-plus-circle"></i>
              </Link>
            </div>

            {/* 카드 형식의 커뮤니티 게시글 */}
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <Row className="community-cards mb-4">
                {communityPosts.map((post) => (
                  <Col md={6} lg={3} className="mb-5" key={post.id}>
                    <Link to={`/community/post/${post.id}`} className="text-decoration-none">
                      <div className="community-card">
                        <div className="card-body">
                          <h5 className="card-title">{post.title}</h5>
                          <p className="card-text">
                            {post.content &&
                              (post.content.length > 100 ? post.content.slice(0, 100) + "..." : post.content)}
                          </p>
                          <div className="card-meta">
                            <span className="author">
                              <div className="mini-avatar">{post.userName.charAt(0)}</div>
                              <span className="user-name">{post.userName}</span>
                            </span>
                            <span className="date">{post.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Col>
                ))}
              </Row>
            )}
          </Container>
        </div>

        {/* 최근 리뷰 섹션 - 카드 형식으로 변경  */}
        <div className="review-section py-4" style={{ backgroundColor: "#fbfbe9" }}>
          <Container>
            <div className="text-center mb-4 d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold section-title">반려인들의 최신 리뷰 모음</h2>
                <p className="lead text-muted mb-0">반려인들이 남긴 생생한 장소 리뷰를 확인해보세요</p>
              </div>
              <Link to="/places" className="plus-btn">
                <i className="bi bi-search"></i>
              </Link>
            </div>

            {reviewsLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <Row className="review-cards">
                {reviews.length > 0 &&
                  reviews.map((review) => (
                    <Col md={6} lg={3} className="mb-4" key={review.visitId}>
                      <Link to={`/places/place/${review.placeId}`} className="text-decoration-none">
                        <div className={`review-card rating-${Math.round(review.rating || 3)}`}>
                          {/* 장소 이미지 */}
                          <div className="review-image-container">
                            <img
                              src={review.placeImage || "/placeholder.svg"}
                              alt={review.placeName || "장소 이미지"}
                              className="review-image"
                              onError={(e) => {
                                e.target.src = "/placeholder.svg"
                              }}
                            />
                            {/* 별점 뱃지 */}
                            <div className="rating-badge">
                              <i className="bi bi-star-fill"></i>
                              <span>{review.rating?.toFixed(1) || "0.0"}</span>
                            </div>
                            {/* 카테고리 뱃지 */}
                            {review.industrySub && <div className="category-badge">{review.industrySub}</div>}
                          </div>
                          {/* 리뷰 내용 */}
                          <div className="review-content">
                            {/* 장소 이름 */}
                            <h5 className="place-name">
                              <i className="bi bi-geo-alt-fill"></i>
                              {review.placeName}
                            </h5>
                            {/* 리뷰 텍스트 말풍선 */}
                            <div className="review-bubble">
                              {review.note || "이 장소는 반려동물과 함께하기 정말 좋았어요!"}
                            </div>
                            {/* 리뷰 메타 정보 */}
                            <div className="review-meta">
                              <div className="user-profile">
                                <div className="user-avatar">{review.userName?.charAt(0) || "?"}</div>
                                <div className="user-info">
                                  <span className="user-name">{review.userName}</span>
                                </div>
                              </div>
                              <span className="review-date">{review.visitDate?.split("T")[0] || "날짜 없음"}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Col>
                  ))}
              </Row>
            )}
          </Container>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default HomePage
