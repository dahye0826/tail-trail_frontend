"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./MyPageStyles.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"
import { useReview } from "../../hooks/useReview"
import axios from "axios"

const API_BASE_URL = "http://localhost:9000/api" // API 서버 주소

// place 정보를 가져오는 함수 추가
const fetchPlaceInfo = async (placeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/places/${placeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching place info for ID ${placeId}:`, error);
    return null;
  }
};

// 방문 이력 관광지 페이지 컴포넌트 정의
const VisitedPlacesPage = () => {
  const navigate = useNavigate() // 페이지 이동을 위한 함수
  const [isLoggedIn, setIsLoggedIn] = useState(false) // 로그인 상태 저장
  const [loading, setLoading] = useState(true) // 로딩 상태 저장
  const [error, setError] = useState(null) // 오류 상태 저장
  const [visitedPlaces, setVisitedPlaces] = useState([]) // 방문 장소 목록 저장
  const [currentPage, setCurrentPage] = useState(1) // 현재 페이지 번호
  const [totalPages, setTotalPages] = useState(0) // 전체 페이지 수
  const [totalItems, setTotalItems] = useState(0) // 전체 아이템 수
  const [showMap, setShowMap] = useState(false) // 지도 표시 여부
  const [selectedPlace, setSelectedPlace] = useState(null) // 선택된 장소 정보
  const pageSize = 10 // 한 페이지당 보여줄 아이템 수
  const mapContainerRef = useRef(null) // 지도 컨테이너 참조
  const [mapKey, setMapKey] = useState(0) // 지도 컴포넌트 리렌더링을 위한 키

  // 장소 클릭시 해당 장소 상세 페이지로 이동하는 함수
  const handlePlaceClick = useCallback((placeId) => {
    if (placeId) { // placeId가 있으면
      navigate(`/places/place/${placeId}`) // 장소 상세 페이지로 이동
    }
  }, [navigate]) // navigate 함수가 변경될 때만 함수 재생성

  // 방문 이력 데이터를 서버에서 불러오는 함수
  const loadVisitedPlaces = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId") // 로컬 스토리지에서 사용자 ID 가져오기
      if (!userId) { // 사용자 ID가 없으면
        navigate("/login") // 로그인 페이지로 이동
        return
      }

      setLoading(true) // 로딩 상태 시작
      setError(null) // 오류 상태 초기화

      // 서버에 방문 이력 데이터 요청
      const response = await axios.get(`${API_BASE_URL}/visited-place/mypage`, {
        params: {
          userId: Number(userId),
          page: currentPage - 1,
          size: pageSize
        }
      })

      console.log("API 전체 응답:", response.data)
      console.log("첫 번째 방문 데이터:", response.data.content[0])
      console.log("첫 번째 방문의 place 정보:", response.data.content[0].place)
      console.log("place_name 확인:", response.data.content[0].place?.place_name)

      if (response.data && response.data.content) {
        // 모든 place 정보를 한번에 가져오기
        const placePromises = response.data.content.map(visit => fetchPlaceInfo(visit.placeId));
        const places = await Promise.all(placePromises);
        
        // 응답 데이터를 적절한 형태로 변환
        const updatedContent = response.data.content.map((visit, index) => {
          console.log("각 방문 데이터 처리:", visit);
          const placeInfo = places[index];
          console.log("place 정보:", placeInfo);
          
          // 원본 데이터의 visitDate를 유지
          return {
            visitId: visit.visitId,
            userId: visit.userId,
            placeId: visit.placeId,
            visitDate: visit.visitDate,  // 원본 visitDate 유지
            rating: visit.rating,
            note: visit.note,
            place: placeInfo || {}
          };
        });
        
        // 상태 업데이트
        setVisitedPlaces(updatedContent) // 방문 장소 목록 설정
        setTotalItems(response.data.totalElements || 0) // 전체 아이템 수 설정
        setTotalPages(response.data.totalPages || 0) // 전체 페이지 수 설정
      } else { // 데이터가 없으면
        // 빈 상태로 초기화
        setVisitedPlaces([]) // 방문 장소 목록 비우기
        setTotalItems(0) // 전체 아이템 수 0으로 설정
        setTotalPages(0) // 전체 페이지 수 0으로 설정
      }
    } catch (error) { // 오류 발생시
      console.error("방문 이력 로드 오류:", error.response || error) // 오류 로그 출력
      setError("방문 이력을 불러오는데 실패했습니다.") // 오류 메시지 설정
    } finally { // 성공이든 실패든 항상 실행
      setLoading(false) // 로딩 상태 종료
    }
  }, [currentPage, navigate]) // currentPage나 navigate가 변경될 때만 함수 재생성

  // 컴포넌트가 처음 로드될 때 실행되는 효과
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn") === "true" // 로그인 상태 확인
    setIsLoggedIn(loginStatus) // 로그인 상태 설정
    if (loginStatus) { // 로그인 되어 있으면
      loadVisitedPlaces() // 방문 이력 로드
    } else { // 로그인 안되어 있으면
      navigate("/login") // 로그인 페이지로 이동
    }
  }, [loadVisitedPlaces, navigate]) // loadVisitedPlaces나 navigate가 변경될 때 재실행

  // 별점을 별 모양으로 표시하는 함수
  const renderStars = (rating) => {
    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, index) => (
          <span key={`star-${index}-${rating}`} className="star">
            {index + 1 <= Math.floor(rating) ? "★" : "☆"}
          </span>
        ))}
        <span className="ms-2">{rating.toFixed(1)}</span>
      </div>
    )
  }

  // 지역 뱃지를 표시하는 함수
  const renderRegionBadge = (city) => {
    return (
      <span key={`region-${city}`} className="region-badge">
        {city}
      </span>
    )
  }

  // 지도 보기 버튼 클릭 처리 함수
  const handleMapView = (place) => {
    if (!place || !place.latitude || !place.longitude) { // 위치 정보가 없으면
      alert("위치 정보가 없는 장소입니다.") // 알림 표시
      return
    }
    setSelectedPlace(place) // 선택된 장소 설정
    setShowMap(true) // 지도 표시 활성화
    setMapKey(prev => prev + 1) // 지도 컴포넌트 강제 리렌더링을 위한 키 증가
  }

  // 지도 닫기 처리 함수
  const handleCloseMap = () => {
    setShowMap(false) // 지도 표시 비활성화
    setSelectedPlace(null) // 선택된 장소 초기화
  }

  // 장소 이름 표시 함수 수정
  const getPlaceName = useCallback((visit) => {
    if (visit.placeId === 1650) {
      return 'WOOF'
    }
    return visit.place?.placeName || '장소 정보 없음'
  }, [])

  // 컴포넌트 렌더링
  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} /> {/* 상단 네비게이션 바 */}
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

            
            {error && ( // 오류가 있으면
              <div className="alert alert-danger" role="alert">
                {error} {/* 오류 메시지 표시 */}
              </div>
            )}

            {loading ? ( // 로딩 중이면
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">로딩 중...</span> {/* 로딩 스피너 */}
                </div>
              </div>
            ) : visitedPlaces.length === 0 ? ( // 방문 장소가 없으면
              <div className="text-center py-5">
                <i className="bi bi-star display-1 text-muted"></i> {/* 별 아이콘 */}
                <p className="mt-3">방문한 관광지가 없습니다.</p> {/* 안내 메시지 */}
                <Link to="/places" className="btn btn-primary mt-2">
                  장소 둘러보기 {/* 장소 둘러보기 버튼 */}
                </Link>
              </div>
            ) : ( // 방문 장소가 있으면
              <div className="visited-places-list">
                {visitedPlaces.map((visit, idx) => {
                  console.log("방문 데이터:", visit);  // 전체 방문 데이터 로깅
                  console.log("created_at 값:", visit.created_at);  // created_at 값 확인
                  const placeId = visit.placeId || visit.place_id || (visit.place && visit.place.placeId);
                  return (
                    <div key={visit.visitId || visit.visit_id || idx} className="card mb-3">
                      <div className="card-body">
                        <div className="place-info">
                          {visit.place && visit.place.city && (
                            <div className="mb-2" key={`region-${visit.place.city}-${visit.visitId || visit.visit_id || idx}`}>
                              {renderRegionBadge(visit.place.city)}
                            </div>
                          )}
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="place-name mb-0">
                              {getPlaceName(visit)}
                            </h5>
                            <div className="rating-container">
                              {renderStars(visit.rating)}
                            </div>
                          </div>
                          {visit.place && (
                            <p className="place-address mb-2">
                              <i className="bi bi-geo-alt me-2"></i>
                              {visit.place.fullAddress || `${visit.place.city || ''} ${visit.place.district || ''}`}
                            </p>
                          )}
                          {visit.note && (
                            <div className="visit-note mb-3">
                              {visit.note}
                            </div>
                          )}
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="visit-date text-muted">
                              <i className="bi bi-calendar3 me-2"></i>
                              방문일: {visit.visitDate}
                            </div>
                            {placeId && (
                              <Link
                                to={`/places/place/${placeId}#review`}
                                className="view-btn"
                              >
                                보기
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && ( // 페이지가 여러 개면
              <nav className="mt-4" aria-label="방문 이력 페이지네이션">
                <ul className="pagination justify-content-center"> {/* 중앙 정렬된 페이지네이션 */}
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}> {/* 현재 첫 페이지면 비활성화 */}
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)} // 이전 페이지로 이동
                      disabled={currentPage === 1} // 첫 페이지면 비활성화
                    >
                      이전 {/* 이전 버튼 */}
                    </button>
                  </li>
                  {Array.from({ length: totalPages }).map((_, index) => { // 페이지 번호 반복
                    const pageNumber = index + 1;
                    return (
                      <li
                        key={`page-${pageNumber}`}
                        className={`page-item ${currentPage === pageNumber ? 'active' : ''}`} // 현재 페이지면 활성화
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(pageNumber)} // 해당 페이지로 이동
                        >
                          {pageNumber} {/* 페이지 번호 */}
                        </button>
                      </li>
                    );
                  })}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}> {/* 현재 마지막 페이지면 비활성화 */}
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)} // 다음 페이지로 이동
                      disabled={currentPage === totalPages} // 마지막 페이지면 비활성화
                    >
                      다음 {/* 다음 버튼 */}
                    </button>
                  </li>
                </ul>
              </nav>
            )}
              </div> {/* 현수정 */}
            </div>
          </div>
        </div>
      </div>
      

      {/* 지도 모달 */}
      {showMap && selectedPlace && ( // 지도가 보이고 선택된 장소가 있으면
        <div className="modal show d-block" tabIndex="-1"> {/* 모달 표시 */}
          <div className="modal-dialog modal-lg"> {/* 큰 사이즈 모달 */}
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedPlace.placeName || 'WOOF'} 위치</h5> {/* 장소 이름 표시 */}
                <button type="button" className="btn-close" onClick={handleCloseMap}></button> {/* 닫기 버튼 */}
              </div>
              <div className="modal-body" style={{ height: '400px' }}> {/* 고정 높이 지정 */}
                <KakaoMap
                  key={mapKey} // 강제 리렌더링을 위한 키
                  initialLocation={{ // 초기 위치 설정
                    lat: Number(selectedPlace.latitude), // 위도
                    lng: Number(selectedPlace.longitude), // 경도
                    name: selectedPlace.placeName || 'WOOF' // 장소 이름
                  }}
                  height="400px" // 지도 높이
                  defaultLevel={3} // 기본 줌 레벨
                  showInfoCard={false} // 정보 카드 표시 안함
                  readOnly={true} // 읽기 전용
                  useCluster={false} // 클러스터링 사용 안함
                />
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={handleCloseMap}></div> {/* 모달 바깥 영역 클릭시 닫기 */}
        </div>
      )}

      <Footer /> {/* 하단 푸터 */}
    </>
  )
}

export default VisitedPlacesPage // 컴포넌트 내보내기