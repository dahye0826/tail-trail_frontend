"use client"

import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Button, Carousel } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaPaw, FaMapMarkedAlt, FaComments, FaStar, FaSearch, FaStore, FaHotel, FaUmbrellaBeach } from "react-icons/fa"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./HomePage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)

  // 스크롤 위치에 따라 애니메이션 효과를 위한 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="home-page">
        {/* 메인 배너 섹션 */}
        <div
          className="banner-section"
          style={{
            backgroundImage: `url(${process.env.PUBLIC_URL}/images/lawon01.png)`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundSize: "auto", // 이미지 원래 크기로 표시
            height: "600px",
            width: "100%",
            margin: "0 auto",
            borderRadius: "8px", // 모서리 둥글게 유지
          }}
        >
          <div className="banner-overlay" style={{ borderRadius: "8px", background: "none" }}></div>
          <Container>
            <Row className="align-items-start h-100">
              <Col lg={12} className="mb-4 mb-lg-0">
                <div className="logo-container mb-4" style={{ marginTop: "10px" }}>
                  <div className="d-flex align-items-center mb-3">
                    <h1 className="fw-bold animate-text" style={{ color: "white", fontSize: "3.5rem" }}>
                      이음길
                    </h1>
                  </div>
                  <p className="lead mb-4 animate-text-delay" style={{ color: "white", fontSize: "1.5rem" }}>
                    꼬리를 따라 이어지는 여행길
                  </p>
                </div>
              </Col>
              {/* 로그인/회원가입 섹션 제거 */}
            </Row>
          </Container>
        </div>

        {/* 지도 검색 섹션 - 이음길 서비스 섹션 앞으로 이동 및 크기 확대 */}
        <div className="map-section py-5 mt-4">
          <Container>
            <div className="text-center mb-5">
              <h2 className="fw-bold section-title">지도로 쉽게 찾아보세요</h2>
              <p className="lead text-muted">반려동물과 함께 갈 수 있는 다양한 장소를 지도에서 한눈에 확인하세요</p>
            </div>

            <Row className="align-items-center">
              <Col lg={7} className="mb-4 mb-lg-0">
                <div className={`map-image-container ${scrollPosition > 300 ? "animate-slide-in-right" : ""}`}>
                  {/* 지도 크기 확대 */}
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
                    height="500px" // 지도 높이 증가
                    showSearchBar={false}
                    defaultLevel={9}
                    showRegisteredPlaces={false}
                  />
                </div>
              </Col>
              <Col lg={5}>
                <div className={`ps-lg-4 ${scrollPosition > 300 ? "animate-fade-in" : ""}`}>
                  <h3 className="fw-bold mb-4">반려동물과 함께하는 모든 장소</h3>
                  <p className="lead mb-4">
                    반려동물과 함께 갈 수 있는 다양한 장소를 지도에서 한눈에 확인하세요. 카페, 식당, 숙소, 여행지,
                    박물관, 미술관 등 다양한 장소 정보를 제공합니다.
                  </p>
                  <ul className="feature-list">
                    <li>
                      <i className="bi bi-check-circle-fill"></i> 현재 위치 기반 검색
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i> 카테고리별 필터링
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i> 상세 정보 및 리뷰 확인
                    </li>
                  </ul>
                  <Button as={Link} to="/map" className="btn-primary mt-3" size="lg">
                    <FaMapMarkedAlt className="me-2" /> 지도에서 찾기
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </div>

        {/* 주요 기능 소개 섹션 */}
        <Container className="py-5 mt-3">
          <div className="text-center mb-5">
            <h2 className="fw-bold section-title">이음길 서비스</h2>
            <p className="lead text-muted">반려동물과 함께 방문할 수 있는 다양한 장소를 찾고 경험을 공유하세요</p>
          </div>

          <Row className="g-4">
            {/* 지도 검색 기능 */}
            <Col md={3}>
              <Card
                className={`h-100 border-0 shadow-sm text-center service-card ${scrollPosition > 100 ? "animate-card" : ""}`}
              >
                <Card.Body className="p-4">
                  <div className="icon-circle">
                    <FaSearch size={30} />
                  </div>
                  <Card.Title>지도로 검색</Card.Title>
                  <Card.Text>지도에서 반려동물과 함께 갈 수 있는 다양한 장소를 쉽게 찾아보세요.</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            {/* 카페 및 식당 */}
            <Col md={3}>
              <Card
                className={`h-100 border-0 shadow-sm text-center service-card ${scrollPosition > 100 ? "animate-card" : ""}`}
                style={{ animationDelay: "0.2s" }}
              >
                <Card.Body className="p-4">
                  <div className="icon-circle">
                    <FaStore size={30} />
                  </div>
                  <Card.Title>카페 및 식당</Card.Title>
                  <Card.Text>반려동물과 함께 방문할 수 있는 카페와 식당 정보를 확인하세요.</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            {/* 숙박 및 여행지 */}
            <Col md={3}>
              <Card
                className={`h-100 border-0 shadow-sm text-center service-card ${scrollPosition > 100 ? "animate-card" : ""}`}
                style={{ animationDelay: "0.4s" }}
              >
                <Card.Body className="p-4">
                  <div className="icon-circle">
                    <FaHotel size={30} />
                  </div>
                  <Card.Title>숙박 및 여행지</Card.Title>
                  <Card.Text>반려동물 동반 가능한 숙소와 여행지를 찾아 특별한 여행을 계획하세요.</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            {/* 박물관 및 문화시설 */}
            <Col md={3}>
              <Card
                className={`h-100 border-0 shadow-sm text-center service-card ${scrollPosition > 100 ? "animate-card" : ""}`}
                style={{ animationDelay: "0.6s" }}
              >
                <Card.Body className="p-4">
                  <div className="icon-circle">
                    <FaUmbrellaBeach size={30} />
                  </div>
                  <Card.Title>문화 및 레저</Card.Title>
                  <Card.Text>반려동물과 함께 즐길 수 있는 박물관, 미술관, 레저시설을 찾아보세요.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* 커뮤니티 섹션 */}
        <div className="community-section py-5">
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="mb-4 mb-lg-0">
                <div className={`community-image-container ${scrollPosition > 400 ? "animate-slide-in" : ""}`}>
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt="커뮤니티"
                    className="img-fluid rounded shadow-lg"
                  />
                  <div className="floating-paws">
                    <FaPaw className="floating-paw paw-1" />
                    <FaPaw className="floating-paw paw-2" />
                    <FaPaw className="floating-paw paw-3" />
                  </div>
                </div>
              </Col>
              <Col lg={6}>
                <div className={`ps-lg-4 ${scrollPosition > 400 ? "animate-fade-in" : ""}`}>
                  <h2 className="fw-bold section-title mb-4">반려인들과 소통하세요</h2>
                  <p className="lead mb-4">
                    다양한 반려인들과 경험을 공유하고, 유용한 정보를 얻어보세요. 반려동물과의 특별한 순간을 커뮤니티에
                    기록하고 공유할 수 있습니다.
                  </p>
                  <ul className="feature-list">
                    <li>
                      <i className="bi bi-check-circle-fill"></i> 여행 후기 공유
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i> 장소 추천 및 평가
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i> 반려동물 동반 팁
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i> 반려인들과의 소통
                    </li>
                  </ul>
                  <Button as={Link} to="/community" className="btn-primary mt-3" size="lg">
                    <FaComments className="me-2" /> 커뮤니티 방문하기
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </div>

        {/* 최근 리뷰 섹션 - 배경색 흰색으로 변경 */}
        <div className="review-section py-5" style={{ backgroundColor: "white" }}>
          <Container>
            <div className="text-center mb-5">
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
                          <FaStar key={i} />
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
                          <FaStar key={i} />
                        ))}
                        <FaStar key="half-star" className="half-star" />
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
