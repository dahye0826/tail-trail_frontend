import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaPen, FaUser } from "react-icons/fa"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./MyPageStyles.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { userAPI } from "../../services/api"  // api.js에서 userAPI만 가져옵니다
import { visitedAPI } from "../../services/api"  // api.js에서 visitedAPI만 가져옵니다

const MyPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    userName: "",
    email: "",
    userPhone: "",
    userAddress: "",
    birthdate: "",
    profile: "",
    petName: "",
    type: "",
    breed: "",
    petAge: "",
    role: ""
  });

  const [stats, setStats] = useState({
    posts: 0,
    visited_places: 0,
    favorites: 0
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 로컬 스토리지에서 사용자 정보 확인
        const loginStatus = localStorage.getItem("isLoggedIn") === "true";
        setIsLoggedIn(loginStatus);
        
        if (!loginStatus) {
          console.log("로그인 상태 아님, 리다이렉트");
          navigate("/login");
          return;
        }
        
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.log("사용자 ID 없음, 리다이렉트");
          navigate("/login");
          return;
        }
        
        console.log("사용자 데이터 로딩 시작, userId:", userId);
        
        // 사용자 프로필 정보 가져오기
        const profileResponse = await userAPI.getProfile(userId);
        console.log("프로필 응답:", profileResponse);
        
        if (profileResponse.data) {
          setUserData({
            userName: profileResponse.data.userName || "",
            email: profileResponse.data.email || "",
            userPhone: profileResponse.data.userPhone || "",
            userAddress: profileResponse.data.userAddress || "",
            birthdate: profileResponse.data.birthdate || "",
            profile: profileResponse.data.profile || "",
            petName: profileResponse.data.petName || "",
            type: profileResponse.data.type || "",
            breed: profileResponse.data.breed || "",
            petAge: profileResponse.data.petAge || "",
            role: profileResponse.data.role || "user"
          });
        }
        
        // 방문 이력 수 가져오기
        const visitedResponse = await visitedAPI.getMyVisitedPlaces(userId, 1, 1);
        const visitedCount = visitedResponse?.data?.totalElements || 0;
        
        // 기타 통계 데이터 가져오기
        const statsResponse = await userAPI.getUserStats(userId);
        console.log("통계 응답:", statsResponse);
        
        if (statsResponse.data) {
          setStats({
            posts: statsResponse.data.postCount || 0,
            visited_places: visitedCount,
            favorites: statsResponse.data.favoriteCount || 0
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error("데이터 가져오기 오류:", err);
        setError("사용자 데이터를 가져오는데 실패했습니다.");
        setLoading(false);
        
        // 오류 발생 시 기본 데이터로 대체 (테스트용)
        provideMockData();
      }
    };
    
    // 테스트용 더미 데이터 함수
    const provideMockData = () => {
      console.log("더미 데이터 사용");
      setUserData({
        userName: "김반려",
        email: "pet@example.com",
        userPhone: "010-1234-5678",
        userAddress: "서울특별시 강남구",
        birthdate: "1990-01-01",
        profile: "",
        petName: "멍멍이",
        type: "강아지",
        breed: "말티즈",
        petAge: 3,
        role: "user"
      });
      
      setStats({
        posts: 5,
        visited_places: 8,
        favorites: 3
      });
    };

    fetchUserData();
  }, [navigate]);

  // JSX는 변경 없이 동일하게 유지
  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="mypage-background">
        {/* 이하 기존 JSX 코드와 동일 */}
        <div className="container py-5">
          <div className="row">
            <div className="col-auto mb-4">
              <div className="sidebar-container">
                <div className="sidebar-header">
                  <h5 className="sidebar-title">마이페이지</h5>
                </div>

                <ul className="sidebar-menu">
                  <li className="sidebar-menu-item active">
                    <Link to="/mypage" className="sidebar-menu-link">
                      <i className="bi bi-person-circle me-2"></i>내 정보
                    </Link>
                  </li>
                  <li className="sidebar-menu-item">
                    <Link to="/mypage/posts" className="sidebar-menu-link">
                      <i className="bi bi-pencil-square me-2"></i>내가 쓴 글
                    </Link>
                  </li>
                  <li className="sidebar-menu-item">
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

            <div className="col">
              <div className="mypage-content-container">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">사용자 정보를 불러오는 중...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <h2 className="mypage-title">마이페이지</h2>
                      <p className="mypage-subtitle">나의 활동 정보와 즐겨찾기, 방문이력을 관리하세요.</p>
                    </div>

                    <div className="profile-card mb-4">
                      <div className="row">
                        <div className="col-md-3 text-center mb-3 mb-md-0">
                          <div className="profile-avatar">{userData.userName.charAt(0)}</div>
                        </div>

                        <div className="col-md-9">
                          <h4 className="mb-2">{userData.userName}님</h4>
                          <p className="text-muted mb-1">{userData.email}</p>
                          
                          {userData.userPhone && (
                            <p className="text-muted mb-1">
                              <i className="bi bi-telephone me-2"></i>{userData.userPhone}
                            </p>
                          )}
                          
                          {userData.userAddress && (
                            <p className="text-muted mb-1">
                              <i className="bi bi-geo-alt me-2"></i>{userData.userAddress}
                            </p>
                          )}

                          {userData.petName && (
                            <p className="mb-3">
                              <span className="badge bg-light text-dark me-2">
                                반려동물: {userData.petName}
                                {userData.type && ` (${userData.type})`}
                                {userData.breed && ` / ${userData.breed}`}
                                {userData.petAge && ` / ${userData.petAge}살`}
                              </span>
                            </p>
                          )}

                          <Link to="/mypage/edit-profile" className="btn btn-outline-secondary btn-sm">
                            <FaUser className="me-1" /> 프로필 수정
                          </Link>
                        </div>
                      </div>
                    </div>

                    <h5 className="activity-title mb-3">나의 활동</h5>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <Link to="/mypage/posts" className="activity-card">
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="m-0 activity-card-title">내가 쓴 글</h5>
                              <FaPen className="activity-icon" />
                            </div>
                            <h3 className="mb-2">{stats.posts}</h3>
                            <p className="text-muted mb-0">작성한 글</p>
                          </div>
                        </Link>
                      </div>

                      <div className="col-md-4 mb-3">
                        <Link to="/mypage/visited" className="activity-card">
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="m-0 activity-card-title">방문이력관광지</h5>
                              <i className="bi bi-star-fill activity-icon"></i>
                            </div>
                            <h3 className="mb-2">{stats.visited_places}</h3>
                            <p className="text-muted mb-0">방문한 장소</p>
                          </div>
                        </Link>
                      </div>

                      <div className="col-md-4 mb-3">
                        <Link to="/mypage/favorites" className="activity-card">
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="m-0 activity-card-title">즐겨찾기</h5>
                              <i className="bi bi-bookmark-heart-fill activity-icon"></i>
                            </div>
                            <h3 className="mb-2">{stats.favorites}</h3>
                            <p className="text-muted mb-0">저장한 장소</p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    <div className="promo-banner mt-4">
                      <h5 className="promo-title">반려동물과 함께하는 새로운 여행지를 발견해보세요!</h5>
                      <p className="mb-3">전국의 반려동물 친화적인 장소들을 둘러보고 여행 계획을 세워보세요.</p>
                      <Link to="/places" className="btn btn-primary">
                        여행지 둘러보기
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default MyPage;