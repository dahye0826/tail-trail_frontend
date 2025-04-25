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

const API_BASE_URL = "http://localhost:9000/api"

const VisitedPlacesPage = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visitedPlaces, setVisitedPlaces] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const pageSize = 10
  const { submitReview } = useReview()
  const mapContainerRef = useRef(null)
  const [editingVisit, setEditingVisit] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editRating, setEditRating] = useState(0)
  const [editNote, setEditNote] = useState("")
  const [mapKey, setMapKey] = useState(0)

  // 장소 클릭 처리
  const handlePlaceClick = useCallback((placeId) => {
    if (placeId) {
      navigate(`/places/place/${placeId}`)
    }
  }, [navigate])

  // 방문 이력 로드
  const loadVisitedPlaces = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        navigate("/login")
        return
      }

      setLoading(true)
      setError(null)

      const response = await axios.get(`${API_BASE_URL}/visited-place/mypage`, {
        params: {
          userId: Number(userId),
          page: currentPage - 1,
          size: pageSize
        }
      })

      console.log("API 응답:", response.data)

      if (response.data && response.data.content) {
        const updatedContent = response.data.content.map(visit => {
          // visit 객체의 기본 구조 확인
          const visitData = {
            visitId: visit.visit_id,
            userId: visit.user_id,
            placeId: visit.place_id,
            visitDate: visit.visit_date,
            rating: visit.rating,
            note: visit.note,
            createdAt: visit.created_at,
            place: visit.place
          }

          // placeId가 1650인 경우 특별 처리
          if (visitData.placeId === 1650) {
            return {
              ...visitData,
              place: {
                ...visitData.place,
                placeId: 1650,
                placeName: 'WOOF'
              }
            }
          }

          return visitData
        })
        
        setVisitedPlaces(updatedContent)
        setTotalItems(response.data.totalElements || 0)
        setTotalPages(response.data.totalPages || 0)
      } else {
        setVisitedPlaces([])
        setTotalItems(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error("방문 이력 로드 오류:", error.response || error)
      setError("방문 이력을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }, [currentPage, navigate])

  // 컴포넌트 마운트 시 방문 이력 로드
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loginStatus)
    if (loginStatus) {
      loadVisitedPlaces()
    } else {
      navigate("/login")
    }
  }, [loadVisitedPlaces, navigate])

  // 별점 렌더링
  const renderStars = (rating) => {
    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, index) => (
          <span key={index} className="star">
            {index + 1 <= Math.floor(rating) ? "★" : "☆"}
          </span>
        ))}
        <span className="ms-2">{rating.toFixed(1)}</span>
      </div>
    )
  }

  // 지역 뱃지 렌더링
  const renderRegionBadge = (city) => {
    return (
      <span className="region-badge">
        {city}
      </span>
    )
  }

  // 지도 보기 버튼 처리
  const handleMapView = (place) => {
    if (!place || !place.latitude || !place.longitude) {
      alert("위치 정보가 없는 장소입니다.")
      return
    }
    setSelectedPlace(place)
    setShowMap(true)
    setMapKey(prev => prev + 1)
  }

  // 지도 닫기 처리
  const handleCloseMap = () => {
    setShowMap(false)
    setSelectedPlace(null)
  }

  // 방문 기록 수정
  const handleEditClick = (visit) => {
    setEditingVisit(visit)
    setEditRating(visit.rating)
    setEditNote(visit.note || "")
    setShowEditModal(true)
  }

  // 방문 기록 수정 저장
  const handleSaveEdit = async () => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        navigate("/login")
        return
      }

      const response = await axios.put(`${API_BASE_URL}/visited-place/${editingVisit.visitId}`, {
        visit_id: editingVisit.visitId,
        user_id: Number(userId),
        place_id: editingVisit.placeId,
        visit_date: editingVisit.visitDate,
        rating: editRating,
        note: editNote
      })

      if (response.status === 200) {
        const updatedVisitedPlaces = visitedPlaces.map(visit =>
          visit.visitId === editingVisit.visitId
            ? { 
                ...visit, 
                rating: editRating, 
                note: editNote,
                place: visit.placeId === 1650 
                  ? { ...visit.place, placeName: 'WOOF' }
                  : visit.place
              }
            : visit
        )
        setVisitedPlaces(updatedVisitedPlaces)
        setShowEditModal(false)
        setEditingVisit(null)
        alert("방문 기록이 수정되었습니다.")
      }
    } catch (error) {
      console.error("방문 기록 수정 실패:", error)
      alert("방문 기록 수정에 실패했습니다. 다시 시도해주세요.")
    }
  }

  // 방문 기록 삭제
  const handleDelete = async (visitId) => {
    if (window.confirm("방문 기록을 삭제하시겠습니까?")) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/visited-place/${visitId}`)
        if (response.status === 200) {
          // 삭제된 항목 제거
          const updatedVisitedPlaces = visitedPlaces.filter(visit => visit.visitId !== visitId)
          setVisitedPlaces(updatedVisitedPlaces)
        }
      } catch (error) {
        console.error("방문 기록 삭제 실패:", error)
        alert("방문 기록 삭제에 실패했습니다.")
      }
    }
  }

  // 장소 이름 표시 함수
  const getPlaceName = useCallback((visit) => {
    if (visit.placeId === 1650) {
      return 'WOOF'
    }
    return visit.place?.placeName || '장소 정보 없음'
  }, [])

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <div className="container py-5">
        <div className="row">
          {/* 사이드바 */}
          <div className="col-lg-3 mb-4">
            <div className="list-group">
              <Link to="/mypage" className="list-group-item list-group-item-action">
                <i className="bi bi-person-circle me-2"></i>내 정보
              </Link>
              <Link to="/mypage/posts" className="list-group-item list-group-item-action">
                <i className="bi bi-pencil-square me-2"></i>내가 쓴 글
              </Link>
              <Link to="/mypage/visited" className="list-group-item list-group-item-action active">
                <i className="bi bi-star me-2"></i>방문이력관광지
              </Link>
              <Link to="/mypage/favorites" className="list-group-item list-group-item-action">
                <i className="bi bi-heart me-2"></i>즐겨찾기
              </Link>
            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="col-lg-9">
            <h2 className="mb-4">방문이력관광지</h2>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">로딩 중...</span>
                </div>
              </div>
            ) : visitedPlaces.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-star display-1 text-muted"></i>
                <p className="mt-3">방문한 관광지가 없습니다.</p>
                <Link to="/places" className="btn btn-primary mt-2">
                  장소 둘러보기
                </Link>
              </div>
            ) : (
              <div className="visited-places-list">
                {visitedPlaces.map((visit) => (
                  <div key={visit.visitId} className="card mb-3">
                    <div className="card-body">
                      <div className="place-info">
                        {visit.place && visit.place.city && (
                          <div className="mb-2">
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
                            방문일: {new Date(visit.visitDate).toLocaleDateString()}
                          </div>
                          <div className="btn-group">
                            {visit.place && (visit.place.latitude || visit.place.longitude) && (
                              <button
                                className="btn btn-outline-secondary btn-sm me-2"
                                onClick={() => handleMapView(visit.place)}
                              >
                                <i className="bi bi-map me-1"></i>위치보기
                              </button>
                            )}
                            <button
                              className="btn btn-outline-primary btn-sm me-2"
                              onClick={() => handleEditClick(visit)}
                            >
                              <i className="bi bi-pencil me-1"></i>수정
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(visit.visitId)}
                            >
                              <i className="bi bi-trash me-1"></i>삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <nav className="mt-4" aria-label="방문 이력 페이지네이션">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      이전
                    </button>
                  </li>
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <li
                        key={`page-${pageNumber}`}
                        className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  })}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      다음
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* 수정 모달 */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">방문 기록 수정</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">별점</label>
                  <select
                    className="form-select"
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                  >
                    <option value="1">1점</option>
                    <option value="2">2점</option>
                    <option value="3">3점</option>
                    <option value="4">4점</option>
                    <option value="5">5점</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">방문 노트</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={() => setShowEditModal(false)}></div>
        </div>
      )}

      {/* 지도 모달 */}
      {showMap && selectedPlace && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedPlace.placeName || 'WOOF'} 위치</h5>
                <button type="button" className="btn-close" onClick={handleCloseMap}></button>
              </div>
              <div className="modal-body" style={{ height: '400px' }}>
                <KakaoMap
                  key={mapKey}
                  initialLocation={{
                    lat: Number(selectedPlace.latitude),
                    lng: Number(selectedPlace.longitude),
                    name: selectedPlace.placeName || 'WOOF'
                  }}
                  height="400px"
                  defaultLevel={3}
                  showInfoCard={false}
                  readOnly={true}
                  useCluster={false}
                />
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={handleCloseMap}></div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default VisitedPlacesPage