"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Carousel } from "react-bootstrap"
import { Link } from "react-router-dom"
import axios from "axios"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./HomePage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [communityPosts, setCommunityPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // 커뮤니티 게시글 가져오기
  useEffect(() => {
    const fetchCommunityPosts = async () => {
      try {
        setLoading(true)

        const response = await axios.get("http://localhost:9000/api/community", {
          params: {
            page: 0,
            size: 4, // 최신 게시글 4개만 가져오기
          },
        })

        // 응답 데이터 형식에 맞게 처리
        const formattedPosts = response.data.content.map((post) => ({
          id: post.postId,
          title: post.title,
          content: post.content,
          username: post.username,
          createdAt: post.createdAt.split("T")[0],
        }))

        setCommunityPosts(formattedPosts)
        setLoading(false)
      } catch (error) {
        console.error("커뮤니티 게시글 로딩 오류:", error)
        setLoading(false) // 로딩만 false로 전환
      }
    }

    fetchCommunityPosts()
  }, [])

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="home-page">
        {/* 메인 배너 섹션 - 둥근 모서리 스타일로 변경 */}
        <Container className="py-4">
          <div className="rounded-banner">
            <Carousel fade interval={5000} indicators={false} className="banner-carousel">
              {/* 첫 번째 슬라이드 - lawon 이미지 (메인) */}
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
                  <div className="banner-content">
                    <h1 className="fw-bold">이음길</h1>
                    <p className="lead">꼬리를 따라 이어지는 여행길</p>
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
                  <div className="banner-content">
                    <h1 className="fw-bold">이음길</h1>
                    <p className="lead">꼬리를 따라 이어지는 여행길</p>
                  </div>
                </div>
              </Carousel.Item>
            </Carousel>
          </div>
        </Container>

        {/* 지도 검색 섹션 - 커뮤니티 섹션보다 앞으로 이동 */}
        <div className="map-section py-4 mt-3">
          <Container>
            <div className="text-center mb-4">
              <h2 className="fw-bold section-title">지도로 쉽게 찾아보세요</h2>
              <p className="lead text-muted">반려동물과 함께 갈 수 있는 다양한 장소를 지도에서 한눈에 확인하세요</p>
            </div>

            <div className="position-relative">
              <div className="map-image-container mx-auto" style={{ maxWidth: "900px" }}>
                <KakaoMap
                  readOnly={true}
                  initialLocation={{
                    name: "서울 시청",
                    address: "서울특별시 중구 세종대로 110",
                    lat: 37.5666805,
                    lng: 126.9784147,
                  }}
                  markerPositions={[
                    {
                      name: "서울 시청",
                      address: "서울특별시 중구 세종대로 110",
                      lat: 37.5666805,
                      lng: 126.9784147,
                    },
                    {
                      name: "경복궁",
                      address: "서울특별시 종로구 사직로 161",
                      lat: 37.579617,
                      lng: 126.977041,
                    },
                    {
                      name: "남산타워",
                      address: "서울특별시 용산구 남산공원길 105",
                      lat: 37.551348,
                      lng: 126.988123,
                    },
                  ]}
                  height="500px"
                  showSearchBar={false}
                  defaultLevel={9}
                  showRegisteredPlaces={false}
                />
                <div className="position-absolute" style={{ top: "20px", right: "20px", zIndex: 1000 }}>
                  <Link to="/map" className="simple-icon-link">
                    <i className="bi bi-map" style={{ fontSize: "2rem", color: "#2c3e50" }}></i>
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
                <h2 className="fw-bold section-title">커뮤니티</h2>
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
                  <Col md={6} lg={3} className="mb-4" key={post.id}>
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
                              <i className="bi bi-person-circle me-1"></i> {post.username}
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

        {/* 최근 리뷰 섹션 */}
        <div className="review-section py-4" style={{ backgroundColor: "white" }}>
          <Container>
            <div className="text-center mb-4">
              <h2 className="fw-bold section-title">최근 리뷰</h2>
              <p className="lead text-muted">반려인들이 남긴 생생한 장소 리뷰를 확인해보세요</p>
            </div>

            <Carousel variant="dark" className="review-carousel">
              {/* 첫 번째 리뷰 슬라이드 */}
              <Carousel.Item>
                <div className="carousel-review p-4">
                  <Row className="align-items-center">
                    <Col md={4} className="mb-3 mb-md-0">
                      <img
                        src="/placeholder.svg?height=200&width=300"
                        alt="멍멍 애견카페"
                        className="img-fluid rounded shadow-sm"
                      />
                    </Col>
                    <Col md={8}>
                      <div className="mb-2 rating">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className="bi bi-star-fill text-warning"></i>
                        ))}
                      </div>
                      <h4 className="review-title">멍멍 애견카페</h4>
                      <p className="review-location mb-3">서울시 강남구 테헤란로 123</p>
                      <p className="review-text">
                        "친절한 직원분들과 깨끗한 환경이 인상적이었습니다. 다양한 간식도 맛있어요. 반려견을 위한 공간이
                        잘 마련되어 있어 편안하게 시간을 보낼 수 있었습니다."
                      </p>
                      <div className="user-info">
                        <p className="mb-0 review-author">김철수 - 2023.04.15</p>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Carousel.Item>

              {/* 두 번째 리뷰 슬라이드 */}
              <Carousel.Item>
                <div className="carousel-review p-4">
                  <Row className="align-items-center">
                    <Col md={4} className="mb-3 mb-md-0">
                      <img
                        src="/placeholder.svg?height=200&width=300"
                        alt="해운대 반려견 비치파크"
                        className="img-fluid rounded shadow-sm"
                      />
                    </Col>
                    <Col md={8}>
                      <div className="mb-2 rating">
                        {[...Array(4)].map((_, i) => (
                          <i key={i} className="bi bi-star-fill text-warning"></i>
                        ))}
                        <i className="bi bi-star-half text-warning"></i>
                      </div>
                      <h4 className="review-title">해운대 반려견 비치파크</h4>
                      <p className="review-location mb-3">부산광역시 해운대구 우동</p>
                      <p className="review-text">
                        "넓은 공간에서 반려견과 함께 즐길 수 있어 좋았습니다. 다양한 시설도 잘 갖춰져 있어요. 바다를
                        배경으로 반려견과 함께 사진을 찍을 수 있는 포토존도 있어요!"
                      </p>
                      <div className="user-info">
                        <p className="mb-0 review-author">박영희 - 2023.05.10</p>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Carousel.Item>
            </Carousel>
          </Container>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default HomePage
