"use client" // 클라이언트 측에서 실행되는 코드임을 나타냄

import { useState, useEffect, useCallback } from "react" // 리액트와 필요한 기능들을 가져옴
import { Link, useNavigate } from "react-router-dom" // 페이지 이동을 위한 도구를 가져옴
import "bootstrap-icons/font/bootstrap-icons.css" // 예쁜 아이콘들을 사용하기 위한 스타일
import "bootstrap/dist/css/bootstrap.min.css" // 예쁜 디자인을 위한 스타일
import "./MyPageStyles.css" // 내가 만든 디자인 스타일
import Navbar from "../../components/Navbar" // 상단 메뉴바 컴포넌트
import Footer from "../../components/Footer" // 하단 푸터 컴포넌트
import axios from "axios" // 서버와 통신하기 위한 도구

const API_BASE_URL = "http://localhost:9000/api" // 서버 주소

const FavoritesPage = () => {
  // 즐겨찾기 페이지 컴포넌트 시작
  const navigate = useNavigate() // 페이지 이동을 도와주는 도구
  const [isLoggedIn, setIsLoggedIn] = useState(false) // 로그인 했는지 상태
  const [loading, setLoading] = useState(true) // 로딩 중인지 상태
  const [error, setError] = useState(null) // 오류가 있는지 상태
  const [favorites, setFavorites] = useState([]) // 즐겨찾기 목록 저장
  const [currentPage, setCurrentPage] = useState(1) // 현재 페이지 번호
  const [totalPages, setTotalPages] = useState(0) // 전체 페이지 수
  const [totalItems, setTotalItems] = useState(0) // 전체 즐겨찾기 수
  const pageSize = 10 // 한 페이지에 보여줄 항목 수

  // 장소를 클릭했을 때 처리하는 함수
  const handlePlaceClick = useCallback(
    (placeId) => {
      if (placeId) {
        // 장소 아이디가 있으면
        navigate(`/places/place/${placeId}`) // 그 장소의 상세 페이지로 이동
      }
    },
    [navigate],
  )

  // 즐겨찾기 목록을 가져오는 함수
  const loadFavorites = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId") // 로컬 저장소에서 사용자 아이디 가져오기
      if (!userId) {
        // 사용자 아이디가 없으면
        navigate("/login") // 로그인 페이지로 이동
        return
      }

      setLoading(true) // 로딩 시작
      setError(null) // 오류 초기화

      // 1. 즐겨찾기 목록 가져오기
      const favoritesResponse = await axios.get(`${API_BASE_URL}/favorites`, {
        params: {
          // 요청 매개변수들
          userId: Number(userId), // 사용자 아이디
          page: currentPage, // 현재 페이지
          size: pageSize, // 페이지 크기
        },
      })

      if (favoritesResponse.data && favoritesResponse.data.favorites) {
        // 데이터가 있으면
        // 2. 각 즐겨찾기에 대한 장소 정보 가져오기
        const favoritesWithPlaces = await Promise.all(
          favoritesResponse.data.favorites.map(async (favorite) => {
            try {
              const placeResponse = await axios.get(`${API_BASE_URL}/places/${favorite.placeId}`) // 각 장소 정보 요청
              return {
                ...favorite, // 기존 즐겨찾기 정보
                place: placeResponse.data, // 장소 정보 추가
              }
            } catch (error) {
              console.error(`장소 정보 로드 오류 (ID: ${favorite.placeId}):`, error) // 오류 기록
              return favorite // 오류 시 원래 정보만 반환
            }
          }),
        )

        setFavorites(favoritesWithPlaces) // 장소 정보가 추가된 즐겨찾기 저장
        setTotalItems(favoritesResponse.data.totalItems || 0) // 전체 항목 수 저장
        setTotalPages(favoritesResponse.data.totalPages || 0) // 전체 페이지 수 저장
      }
    } catch (error) {
      console.error("즐겨찾기 로드 오류:", error) // 오류 기록
      setError("즐겨찾기를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.") // 오류 메시지 설정
    } finally {
      setLoading(false) // 로딩 종료
    }
  }, [currentPage, navigate]) // currentPage나 navigate가 바뀔 때 함수 새로 만듦

  // 컴포넌트 마운트(화면에 처음 나타날) 때 실행
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn") === "true" // 로그인 상태 확인
    setIsLoggedIn(loginStatus) // 로그인 상태 저장
    if (loginStatus) {
      // 로그인 했으면
      loadFavorites() // 즐겨찾기 로드
    } else {
      // 로그인 안 했으면
      navigate("/login") // 로그인 페이지로 이동
    }
  }, [loadFavorites, navigate]) // loadFavorites나 navigate가 바뀔 때 실행

  // 즐겨찾기 삭제 처리 함수
  const handleRemoveFavorite = useCallback(
    async (placeId) => {
      if (!window.confirm("즐겨찾기를 삭제하시겠습니까?")) {
        // 사용자에게 확인
        return // 취소하면 여기서 종료
      }

      try {
        const userId = localStorage.getItem("userId") // 사용자 아이디 가져오기
        if (!userId) {
          // 사용자 아이디 없으면
          navigate("/login") // 로그인 페이지로 이동
          return
        }

        await axios.post(`${API_BASE_URL}/favorites/toggle`, null, {
          // 즐겨찾기 토글 요청
          params: {
            userId: Number(userId), // 사용자 아이디
            placeId: Number(placeId), // 장소 아이디
          },
        })

        // 삭제 후 현재 페이지 데이터 다시 로드
        loadFavorites() // 즐겨찾기 목록 다시 로드
      } catch (error) {
        console.error("즐겨찾기 삭제 오류:", error) // 오류 기록
        alert("즐겨찾기 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.") // 오류 알림
      }
    },
    [navigate, loadFavorites],
  ) // navigate나 loadFavorites가 바뀔 때 함수 새로 만듦

  // 페이지 변경 처리 함수
  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        // 유효한 페이지 범위면
        setCurrentPage(page) // 현재 페이지 변경
      }
    },
    [totalPages],
  ) // totalPages가 바뀔 때 함수 새로 만듦

  // 이미지 URL 생성 함수
  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return "/assets/default-pet-place.jpg" // 이미지 없으면 기본 이미지
    if (imagePath.startsWith("http")) return imagePath // http로 시작하면 그대로 사용
    // 이미지 경로가 /images로 시작하면 API_BASE_URL과 결합
    if (imagePath.startsWith("/images")) {
      return `${API_BASE_URL}${imagePath}`
    }
    // 이미지 경로가 상대 경로인 경우 /images/places/ 경로 추가
    return `${API_BASE_URL}/images/places/${imagePath}`
  }, []) // 의존성 없음, 항상 같은 함수

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} /> {/* 상단 메뉴바 */}
      <div className="mypage-background">
        {" "}
        {/* 마이페이지 배경 */}
        <div className="container py-5">
          {" "}
          {/* 컨테이너 시작, 위아래 여백 5 */}
          <div className="row">
            {" "}
            {/* 행 시작 */}
            <div className="col-auto mb-4">
              {" "}
              {/* 자동 너비의 왼쪽 열, 아래 여백 4 */}
              <div className="sidebar-container">
                {" "}
                {/* 사이드바 컨테이너 - 이 부분 수정 필요! */}
                <div className="sidebar-header">
                  {" "}
                  {/* 사이드바 헤더 */}
                  <h5 className="sidebar-title">마이페이지</h5> {/* 사이드바 제목 */}
                </div>
                <ul className="sidebar-menu">
                  {" "}
                  {/* 사이드바 메뉴 목록 - 이 부분 수정 필요! */}
                  <li className="sidebar-menu-item">
                    {" "}
                    {/* 사이드바 메뉴 항목 - 이 부분 수정 필요! */}
                    <Link to="/mypage" className="sidebar-menu-link">
                      {" "}
                      {/* 내 정보 링크 - 이 부분 수정 필요! */}
                      <i className="bi bi-person-circle me-2"></i>내 정보 {/* 사용자 아이콘과 텍스트 */}
                    </Link>
                  </li>
                  <li className="sidebar-menu-item">
                    {" "}
                    {/* 사이드바 메뉴 항목 - 이 부분 수정 필요! */}
                    <Link to="/mypage/posts" className="sidebar-menu-link">
                      {" "}
                      {/* 내가 쓴 글 링크 - 이 부분 수정 필요! */}
                      <i className="bi bi-pencil-square me-2"></i>내가 쓴 글 {/* 연필 아이콘과 텍스트 */}
                    </Link>
                  </li>
                  <li className="sidebar-menu-item">
                    {" "}
                    {/* 사이드바 메뉴 항목 - 이 부분 수정 필요! */}
                    <Link to="/mypage/visited" className="sidebar-menu-link">
                      {" "}
                      {/* 방문이력관광지 링크 - 이 부분 수정 필요! */}
                      <i className="bi bi-star me-2"></i>방문이력관광지 {/* 별 아이콘과 텍스트 */}
                    </Link>
                  </li>
                  <li className="sidebar-menu-item active">
                    {" "}
                    {/* 현재 활성화된 메뉴 항목 - 이 부분 수정 필요! */}
                    <Link to="/mypage/favorites" className="sidebar-menu-link">
                      {" "}
                      {/* 즐겨찾기 링크 - 이 부분 수정 필요! */}
                      <i className="bi bi-bookmark-heart me-2"></i>즐겨찾기 {/* 북마크 하트 아이콘과 텍스트 */}
                    </Link>
                  </li>
                  <li className="sidebar-menu-item">
                    {" "}
                    {/* 사이드바 메뉴 항목 - 이 부분 수정 필요! */}
                    <Link to="/mypage/edit-profile" className="sidebar-menu-link">
                      {" "}
                      {/* 개인정보 수정 링크 - 이 부분 수정 필요! */}
                      <i className="bi bi-gear me-2"></i>개인정보 수정 {/* 설정 아이콘과 텍스트 */}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col">
              {" "}
              {/* 오른쪽 열 (남은 공간 전부 차지) */}
              <div className="mypage-content-container">
                {" "}
                {/* 마이페이지 내용 컨테이너 */}
                <div className="mb-4">
                  {" "}
                  {/* 아래 여백 4 */}
                  <h2 className="mypage-title">즐겨찾기</h2> {/* 페이지 제목 */}
                  <p className="mypage-subtitle">내가 즐겨찾기한 장소들을 관리하세요.</p> {/* 페이지 설명 */}
                </div>
                {error && ( // 오류가 있으면
                  <div className="alert alert-danger" role="alert">
                    {" "}
                    {/* 빨간색 경고 표시 */}
                    {error} {/* 오류 메시지 */}
                  </div>
                )}
                {loading ? ( // 로딩 중이면
                  <div className="text-center py-5">
                    {" "}
                    {/* 가운데 정렬, 위아래 여백 5 */}
                    <div className="spinner-border" role="status">
                      {" "}
                      {/* 로딩 스피너 */}
                      <span className="visually-hidden">로딩 중...</span> {/* 화면 낭독기용 텍스트 */}
                    </div>
                    <p className="mt-3">즐겨찾기를 불러오는 중입니다...</p> {/* 로딩 메시지 */}
                  </div> // 로딩 중이 아니면
                ) : (
                  <div>
                    <p className="text-end mb-3 text-muted small">총 {totalItems}개의 즐겨찾기</p>{" "}
                    {/* 전체 항목 수 표시 */}
                    {favorites.length === 0 ? ( // 즐겨찾기가 없으면
                      <div className="text-center py-5">
                        {" "}
                        {/* 가운데 정렬, 위아래 여백 5 */}
                        <i className="bi bi-bookmark-heart display-1 text-muted"></i> {/* 큰 북마크 하트 아이콘 */}
                        <p className="mt-3">즐겨찾기한 장소가 없습니다.</p> {/* 안내 메시지 */}
                        <Link to="/places" className="btn btn-primary mt-2">
                          {" "}
                          {/* 장소 보기 버�� */}
                          장소 둘러보기
                        </Link>
                      </div> // 즐겨찾기가 있으면
                    ) : (
                      <div className="row row-cols-1 g-4">
                        {" "}
                        {/* 한 열에 하나씩, 간격 4 */}
                        {favorites.map(
                          (
                            favorite, // 각 즐겨찾기 항목마다
                          ) => (
                            <div className="col" key={favorite.favoriteId}>
                              {" "}
                              {/* 열 시작, 고유 키 설정 */}
                              <div className="card h-100">
                                {" "}
                                {/* 카드 시작, 높이 100% */}
                                <div className="card-body">
                                  {" "}
                                  {/* 카드 본문 */}
                                  <div className="d-flex justify-content-between align-items-start">
                                    {" "}
                                    {/* 양쪽 정렬, 위쪽 정렬 */}
                                    <div className="place-info">
                                      {" "}
                                      {/* 장소 정보 */}
                                      <div className="location-badge mb-2">
                                        {" "}
                                        {/* 위치 뱃지, 아래 여백 2 */}
                                        {favorite.place?.city} {favorite.place?.district} {/* 도시와 지역 표시 */}
                                      </div>
                                      <h5 className="place-name mb-2">
                                        {" "}
                                        {/* 장소 이름, 아래 여백 2 */}
                                        {favorite.place?.placeName} {/* 장소 이름 */}
                                      </h5>
                                      <p className="place-address mb-2">
                                        {" "}
                                        {/* 장소 주소, 아래 여백 2 */}
                                        {favorite.place?.roadAddress || favorite.place?.landAddress}{" "}
                                        {/* 도로명 주소 또는 지번 주소 */}
                                      </p>
                                      {favorite.place?.petRestrictions && ( // 반려동물 제한 정보가 있으면
                                        <p className="place-restrictions mb-2">
                                          {" "}
                                          {/* 제한 정보, 아래 여백 2 */}
                                          반려동물 제한: {favorite.place?.petRestrictions} {/* 반려동물 제한 정보 */}
                                        </p>
                                      )}
                                      {favorite.place?.openingHours && ( // 영업시간 정보가 있으면
                                        <p className="place-hours mb-2">
                                          {" "}
                                          {/* 영업시간 정보, 아래 여백 2 */}
                                          영업시간: {favorite.place?.openingHours} {/* 영업시간 정보 */}
                                        </p>
                                      )}
                                      {favorite.place?.admissionFee && ( // 입장료 정보가 있으면
                                        <p className="place-price mb-2">
                                          {" "}
                                          {/* 입장료 정보, 아래 여백 2 */}
                                          입장료: {favorite.place?.admissionFee} {/* 입장료 정보 */}
                                        </p>
                                      )}
                                      <p className="place-date mb-0">
                                        {" "}
                                        {/* 즐겨찾기 추가 날짜, 아래 여백 없음 */}
                                        {new Date(favorite.addedDate).toLocaleDateString()} {/* 날짜 형식으로 변환 */}
                                      </p>
                                    </div>
                                    {/* 버튼들 배치 */}
                                    <div className="d-flex">
                                      <button
                                        className="btn btn-outline-primary btn-sm me-2" /* 파란색 테두리 작은 버튼, 오른쪽 여백 2 */
                                        onClick={() =>
                                          handlePlaceClick(favorite.placeId)
                                        } /* 클릭 시 장소 페이지로 이동 */
                                      >
                                        상세보기
                                      </button>
                                      <button
                                        className="btn btn-outline-danger btn-sm" /* 빨간색 테두리 작은 버튼 */
                                        onClick={(e) => {
                                          // 클릭 이벤트 처리
                                          e.stopPropagation() // 이벤트 버블링 중지
                                          handleRemoveFavorite(favorite.placeId) // 즐겨찾기 삭제 함수 호출
                                        }}
                                      >
                                        삭제
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                    {/* 페이지네이션 */}
                    {totalPages > 1 && ( // 전체 페이지가 1보다 크면 (여러 페이지가 있으면)
                      <nav aria-label="Page navigation" className="mt-4">
                        {" "}
                        {/* 페이지 네비게이션, 위 여백 4 */}
                        <ul className="pagination justify-content-center">
                          {" "}
                          {/* 페이지네이션 목록, 가운데 정렬 */}
                          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            {" "}
                            {/* 페이지 항목, 첫 페이지면 비활성화 */}
                            <button
                              className="page-link" /* 페이지 링크 스타일 */
                              onClick={() => handlePageChange(currentPage - 1)} /* 클릭 시 이전 페이지로 */
                              disabled={currentPage === 1} /* 첫 페이지면 비활성화 */
                            >
                              이전
                            </button>
                          </li>
                          {[...Array(totalPages)].map(
                            (
                              _,
                              i, // 전체 페이지 수만큼 반복
                            ) => (
                              <li
                                key={i + 1} /* 고유 키 (페이지 번호) */
                                className={`page-item ${currentPage === i + 1 ? "active" : ""}`} /* 현재 페이지면 활성화 */
                              >
                                <button
                                  className="page-link" /* 페이지 링크 스타일 */
                                  onClick={() => handlePageChange(i + 1)} /* 클릭 시 해당 페이지로 */
                                >
                                  {i + 1} {/* 페이지 번호 */}
                                </button>
                              </li>
                            ),
                          )}
                          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                            {" "}
                            {/* 페이지 항목, 마지막 페이지면 비활성화 */}
                            <button
                              className="page-link" /* 페이지 링크 스타일 */
                              onClick={() => handlePageChange(currentPage + 1)} /* 클릭 시 다음 페이지로 */
                              disabled={currentPage === totalPages} /* 마지막 페이지면 비활성화 */
                            >
                              다음
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer /> {/* 하단 푸터 */}
    </>
  )
}

export default FavoritesPage // 이 컴포넌트를 내보냄
