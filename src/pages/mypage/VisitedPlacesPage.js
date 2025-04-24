"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./MyPageStyles.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"
import { visitedAPI, placeAPI } from "../../services/api"

// 인라인 스타일 추가
const styles = {
  ratedPlaceCard: {
    border: "1px solid #dee2e6",
    borderRadius: "5px",
    overflow: "hidden",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
    maxHeight: "180px" // 카드 최대 높이 설정
  },
  cardBody: {
    padding: "12px 15px",
    fontSize: "0.9rem"
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "5px"
  },
  mapButton: {
    padding: "2px 8px",
    fontSize: "0.75rem"
  }
};

const VisitedPlacesPage = () => {
  const navigate = useNavigate();
  const [visitedPlaces, setVisitedPlaces] = useState([])
  const [placeDetails, setPlaceDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const pageSize = 5 // 한 페이지에 표시할 방문 장소 수

  useEffect(() => {
    loadVisitedPlaces();
  }, [currentPage]);

  // VisitedPlacesPage.js의 loadVisitedPlaces 함수 수정
const loadVisitedPlaces = async () => {
  try {
    // 로컬 스토리지에서 사용자 ID 직접 가져오기
    const userId = localStorage.getItem("userId");
    const loginStatus = localStorage.getItem("isLoggedIn") === "true";
    
    console.log("로그인 상태:", loginStatus, "사용자 ID:", userId);
    
    if (!loginStatus || !userId) {
      setError("로그인이 필요합니다");
      navigate("/login");
      return;
    }
    
    setIsLoggedIn(true);
    setLoading(true);
    
    // userId로 직접 API 호출
    console.log(`API 호출 시작: userId=${userId}, page=${currentPage}, size=${pageSize}`);
    const response = await visitedAPI.getMyVisitedPlaces(userId, currentPage, pageSize);
    console.log("방문 이력 API 응답:", response);
    
    // 백엔드 응답 구조 확인 및 데이터 추출
    if (response && response.data) {
      // 응답 구조 전체 로깅 (디버깅용)
      console.log("방문 이력 응답 구조:", response.data);
      
      // 응답 데이터에서 visitedPlaces 배열 추출 (다양한 API 응답 구조 지원)
      let visitedData = [];
      
      if (Array.isArray(response.data)) {
        // 데이터가 바로 배열인 경우
        visitedData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // BaseResponse 구조에서 data 필드에 배열이 있는 경우
        visitedData = response.data.data;
      } else if (response.data.visitedPlaces && Array.isArray(response.data.visitedPlaces)) {
        // visitedPlaces 필드에 배열이 있는 경우
        visitedData = response.data.visitedPlaces;
      } else if (response.data.content && Array.isArray(response.data.content)) {
        // Spring Data 페이징 응답 구조인 경우
        visitedData = response.data.content;
      }
      
      console.log("추출된 방문 이력 데이터:", visitedData);
      
      if (visitedData.length > 0) {
        setVisitedPlaces(visitedData);
        
        // 페이징 정보 설정 (다양한 API 응답 구조 지원)
        let totalPagesValue = 1;
        let totalItemsValue = visitedData.length;
        
        if (response.data.totalPages) {
          totalPagesValue = response.data.totalPages;
        } else if (response.data.data && response.data.data.totalPages) {
          totalPagesValue = response.data.data.totalPages;
        }
        
        if (response.data.totalItems) {
          totalItemsValue = response.data.totalItems;
        } else if (response.data.data && response.data.data.totalItems) {
          totalItemsValue = response.data.data.totalItems;
        } else if (response.data.totalElements) {
          totalItemsValue = response.data.totalElements;
        }
        
        setTotalPages(totalPagesValue);
        setTotalItems(totalItemsValue);
        
        // 이미 장소 정보가 포함되어 있는 경우
        const placeDetailsMap = {};
        visitedData.forEach(visit => {
          if (visit.placeId) {
            placeDetailsMap[visit.placeId] = {
              placeId: visit.placeId,
              placeName: visit.placeName || "장소명 없음",
              placeImage: visit.placeImage || null,
              city: visit.city || "",
              district: visit.district || "",
              roadAddress: visit.address || visit.roadAddress || "",
              petRestrictions: visit.petRestrictions || "",
              description: visit.description || "",
              latitude: visit.latitude || 37.5665,
              longitude: visit.longitude || 126.978
            };
          }
        });
        
        setPlaceDetails(placeDetailsMap);
      } else {
        console.log("방문 이력 데이터가 없습니다");
        setVisitedPlaces([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } else {
      console.log("응답에 데이터가 없습니다");
      setVisitedPlaces([]);
      setTotalPages(0);
      setTotalItems(0);
    }
    
    setLoading(false);
  } catch (err) {
    console.error("방문 이력 로딩 오류:", err);
    if (err.response) {
      console.error("오류 상태:", err.response.status);
      console.error("오류 데이터:", err.response.data);
    }
    setError("방문 이력을 불러오는데 실패했습니다.");
    setLoading(false);
    
    
      // 테스트용 더미 데이터
      const mockVisitedPlaces = [
        {
          visitId: 1,
          placeId: 1,
          visitDate: "2023-05-15",
          rating: 4.5,
          note: "강아지랑 함께 가기 좋은 곳이었어요."
        },
        {
          visitId: 2,
          placeId: 2,
          visitDate: "2023-04-20",
          rating: 5.0,
          note: "친절한 직원들과 반려동물 시설이 좋았습니다."
        },
        {
          visitId: 3,
          placeId: 3,
          visitDate: "2023-03-10",
          rating: 3.5,
          note: "야외 공간은 좋았지만 실내는 조금 좁았어요."
        }
      ];
      
      const mockPlaceDetails = {
        1: {
          placeId: 1,
          placeName: "소노펫 비발디파크",
          placeImage: "/images/place1.jpg",
          city: "강원도",
          district: "홍천군",
          roadAddress: "강원도 홍천군 서면 한치골길 262",
          petRestrictions: "제한사항 없음",
          description: "반려동물과 함께 즐길 수 있는 리조트",
          latitude: 37.5665,
          longitude: 126.978
        },
        2: {
          placeId: 2,
          placeName: "강아지 놀이터 카페",
          placeImage: "/images/place2.jpg",
          city: "서울",
          district: "강남구",
          roadAddress: "서울 강남구 테헤란로 123",
          petRestrictions: "제한사항 없음",
          description: "강아지들이 자유롭게 뛰어놀 수 있는 실내 카페",
          latitude: 37.5776,
          longitude: 126.9766
        },
        3: {
          placeId: 3,
          placeName: "펫프렌들리 호텔",
          placeImage: "/images/place3.jpg",
          city: "부산",
          district: "해운대구",
          roadAddress: "부산 해운대구 해운대해변로 123",
          petRestrictions: "10kg 이하",
          description: "반려동물 동반 가능한 호텔",
          latitude: 35.1586,
          longitude: 129.1603
        }
      };
      
      setVisitedPlaces(mockVisitedPlaces);
      setPlaceDetails(mockPlaceDetails);
      setTotalItems(mockVisitedPlaces.length);
      setTotalPages(1);
    }
  };

  // 페이지 변경 처리
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  // 지도 보기 버튼 처리
  const handleMapView = (placeId) => {
    setSelectedPlace(placeDetails[placeId]);
    setShowMap(true);
  }

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPages = Math.min(totalPages, 5); // 최대 5개 페이지 표시
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = startPage + maxPages - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="mypage-background">
        <div className="container py-5">
          <div className="row">
            <div className="col-lg-3 col-md-4 mb-4">
              <div className="sidebar-container">
                <div className="sidebar-header">
                  <h5 className="sidebar-title">마이페이지</h5>
                </div>
                <ul className="sidebar-menu">
                  <li className="sidebar-menu-item">
                    <Link to="/mypage" className="sidebar-menu-link">
                      <i className="bi bi-person-circle me-2"></i>내 정보
                    </Link>
                  </li>
                  <li className="sidebar-menu-item">
                    <Link to="/mypage/posts" className="sidebar-menu-link">
                      <i className="bi bi-pencil-square me-2"></i>내가 쓴 글
                    </Link>
                  </li>
                  <li className="sidebar-menu-item active">
                    <Link to="/mypage/visited" className="sidebar-menu-link">
                      <i className="bi bi-star me-2"></i>방문이력관광지
                    </Link>
                  </li>
                  <li className="sidebar-menu-item">
                    <Link to="/mypage/favorites" className="sidebar-menu-link">
                      <i className="bi bi-bookmark-heart me-2"></i>즐겨찾기
                    </Link>
                  </li>
                  <li className="sidebar-menu-item">
                    <Link to="/mypage/edit-profile" className="sidebar-menu-link">
                      <i className="bi bi-gear me-2"></i>개인정보 수정
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-9 col-md-8">
              <div className="mypage-content-container">
                <div className="mb-4">
                  <h2 className="mypage-title">방문이력관광지</h2>
                  <p className="mypage-subtitle">내가 방문한 반려동물 동반 관광지를 확인하세요.</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: "var(--primary-color)" }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">방문 이력을 불러오는 중...</p>
                  </div>
                ) : visitedPlaces.length === 0 ? (
                  <div className="alert alert-info">방문 이력이 없습니다. 반려동물과 함께 여행을 떠나보세요!</div>
                ) : (
                  <div className="row">
                    <div className={`${showMap ? 'col-md-6' : 'col-md-12'}`}>
                      <p className="text-end mb-3 text-muted small">총 {totalItems}개의 방문 이력이 있습니다.</p>
                      
                      <div className="mb-3">
                        <button 
                          className={`btn ${showMap ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => setShowMap(!showMap)}
                        >
                          <i className={`bi ${showMap ? 'bi-list' : 'bi-map'} me-2`}></i>
                          {showMap ? '목록만 보기' : '지도로 보기'}
                        </button>
                      </div>

                      {visitedPlaces.map((visit) => {
                        const place = placeDetails[visit.placeId];
                        return place ? (
                          <div key={visit.visitId} className="rated-place-card mb-2" style={styles.ratedPlaceCard}>
                            <div className="row g-0">
                              <div className="col-md-4">
                                <div className="ratio ratio-4x3">
                                  <img
                                    src={place.placeImage || `/api/placeholder/300/200`}
                                    className="rated-place-image"
                                    alt={place.placeName}
                                    style={{ objectFit: "cover", borderRadius: "4px 0 0 4px" }}
                                  />
                                </div>
                              </div>
                              <div className="col-md-8">
                                <div className="card-body py-2 px-3" style={styles.cardBody}>
                                  <span className="badge bg-primary mb-1">{place.city} {place.district}</span>
                                  <h6 className="card-title mb-1" style={styles.cardTitle}>{place.placeName}</h6>
                                  <p className="card-text mb-1">
                                    <small>
                                      <i className="bi bi-geo-alt me-1"></i>
                                      {place.roadAddress}
                                    </small>
                                  </p>
                                  
                                  <div className="d-flex align-items-center mb-1">
                                    <div className="rating-stars me-1 small">
                                      {'★'.repeat(Math.floor(visit.rating))}
                                      {visit.rating % 1 !== 0 && '☆'}
                                    </div>
                                    <span className="rating-value small">{visit.rating}</span>
                                  </div>
                                  
                                  {visit.note && (
                                    <div className="comment-text small mb-1">
                                      <i className="bi bi-chat-left-quote me-1"></i>
                                      {visit.note.length > 40 ? visit.note.substring(0, 40) + '...' : visit.note}
                                    </div>
                                  )}
                                  
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="rating-date small text-muted">
                                      <i className="bi bi-calendar3"></i> {visit.visitDate}
                                    </span>
                                    
                                    <button 
                                      className="btn btn-sm btn-outline-primary"
                                      style={styles.mapButton}
                                      onClick={() => handleMapView(visit.placeId)}
                                    >
                                      <i className="bi bi-map me-1"></i> 지도
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })}

                      {/* 페이지네이션 */}
                      {totalPages > 1 && (
                        <nav aria-label="Page navigation" className="mt-4">
                          <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(1)}
                              >
                                <i className="bi bi-chevron-double-left"></i>
                              </button>
                            </li>
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage - 1)}
                              >
                                <i className="bi bi-chevron-left"></i>
                              </button>
                            </li>
                            
                            {getPageNumbers().map((page) => (
                              <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                                <button className="page-link" onClick={() => handlePageChange(page)}>
                                  {page}
                                </button>
                              </li>
                            ))}
                            
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage + 1)}
                              >
                                <i className="bi bi-chevron-right"></i>
                              </button>
                            </li>
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(totalPages)}
                              >
                                <i className="bi bi-chevron-double-right"></i>
                              </button>
                            </li>
                          </ul>
                        </nav>
                      )}
                    </div>
                    
                    {/* 지도 영역 */}
                    {showMap && (
                      <div className="col-md-6">
                        <div className="map-container bg-light rounded p-3" style={{ height: '500px' }}>
                          <h5 className="mb-3">
                            {selectedPlace ? selectedPlace.placeName : '지도에서 보기'}
                          </h5>
                          
                          {selectedPlace ? (
                            <>
                              <div className="map-info mb-3">
                                <p><i className="bi bi-geo-alt-fill me-2 text-danger"></i>{selectedPlace.roadAddress}</p>
                                <p><i className="bi bi-info-circle me-2"></i>{selectedPlace.description}</p>
                                <p><i className="bi bi-exclamation-triangle me-2"></i>반려동물 제한: {selectedPlace.petRestrictions || '제한사항 없음'}</p>
                              </div>
                              
                              {/* KakaoMap 컴포넌트 사용 */}
                              <KakaoMap
                                readOnly={true}
                                initialLocation={{
                                  name: selectedPlace.placeName,
                                  address: selectedPlace.roadAddress,
                                  lat: selectedPlace.latitude || 35.1586, // 기본값 제공
                                  lng: selectedPlace.longitude || 129.1603, // 기본값 제공
                                }}
                                height="300px"
                                showSearchBar={false}
                                defaultLevel={3}
                              />
                            </>
                          ) : (
                            <p className="text-center text-muted my-5">
                              왼쪽 목록에서 장소를 선택하면 지도에 표시됩니다.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default VisitedPlacesPage;