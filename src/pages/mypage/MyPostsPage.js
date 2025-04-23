<<<<<<< HEAD
// MyPostsPage.js 업데이트
"use client"
=======

>>>>>>> 5eb7e8411869dbb9b4a9eaae0b14fff53d8d0835

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./MyPageStyles.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { postAPI } from "../../services/api" // api.js에서 postAPI 가져오기

const MyPostsPage = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  
  const navigate = useNavigate()

  useEffect(() => {
    // 로그인 상태 확인
    const loginStatus = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loginStatus)

    if (!loginStatus) {
      navigate("/login")
      return
    }

    const userId = localStorage.getItem("userId")
    if (!userId) {
      navigate("/login")
      return
    }

    const fetchPosts = async () => {
      try {
        setLoading(true)
        // postAPI를 사용하여 사용자의 게시글 가져오기
        const response = await postAPI.getMyPosts(userId, currentPage, 10)
        
        // 백엔드 응답 구조에 맞게 데이터 처리
        if (response.data) {
          setPosts(response.data.posts || [])
          setTotalPages(response.data.totalPages || 1)
          setTotalItems(response.data.totalItems || 0)
        }
        
        setLoading(false)
      } catch (err) {
        console.error("게시글 불러오기 오류:", err)
        setError("게시글을 불러오는데 실패했습니다.")
        setLoading(false)
        
        // 테스트용 더미 데이터 제공
        provideMockData()
      }
    }
    
    // 테스트용 더미 데이터 함수
    const provideMockData = () => {
      const mockPosts = [
        {
          postId: 1,
          title: "강아지랑 부산여행",
          content: "지난 주말 우리 댕댕이와 함께한 부산 여행 후기입니다.",
          createdAt: "2023-05-15",
          updatedAt: "2023-05-15",
          viewCount: 142,
          commentCount: 3
        },
        {
          postId: 2,
          title: "서울 애견카페 추천",
          content: "서울에서 반려견과 함께 갈 수 있는 애견카페를 소개합니다.",
          createdAt: "2023-04-20",
          updatedAt: "2023-04-20",
          viewCount: 89,
          commentCount: 5
        },
        {
          postId: 3,
          title: "강원도 반려동물 숙소 후기",
          content: "강원도에서 반려견과 함께 묵은 펜션 리뷰입니다.",
          createdAt: "2023-03-10",
          updatedAt: "2023-03-10",
          viewCount: 75,
          commentCount: 2
        }
      ]
      
      setPosts(mockPosts)
      setTotalItems(mockPosts.length)
      setTotalPages(1)
    }
    
    fetchPosts()
  }, [navigate, currentPage])

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
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
                  <li className="sidebar-menu-item active">
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

            <div className="col-lg-9 col-md-8">
              <div className="mypage-content-container">
                <div className="mb-4">
                  <h2 className="mypage-title">내가 쓴 글</h2>
                  <p className="mypage-subtitle">내가 작성한 게시글을 관리하세요.</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: "var(--primary-color)" }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">게시글을 불러오는 중...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="alert alert-info">작성한 게시글이 없습니다. 첫 글을 작성해보세요!</div>
                ) : (
                  <div>
                    <p className="text-end mb-3 text-muted small">총 {totalItems}개의 게시글이 있습니다.</p>

                    {posts.map((post) => (
                      <div key={post.postId} className="post-card mb-3">
                        <div className="card-body">
                          <h5 className="card-title">{post.title}</h5>
                          <div className="post-content">
                            {post.content && (
                              post.content.length > 100 
                                ? post.content.slice(0, 100) + "..." 
                                : post.content
                            )}
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="post-meta">
                              <span className="post-date">
                                <i className="bi bi-calendar3"></i> {post.createdAt}
                              </span>
                            </div>
                            <div className="post-actions">
                              <Link to={`/community/post/${post.postId}`} className="btn btn-sm btn-outline-primary me-2">
                                <i className="bi bi-eye me-1"></i> 보기
                              </Link>
                              <Link to={`/community/edit/${post.postId}`} className="btn btn-sm btn-outline-secondary">
                                <i className="bi bi-pencil me-1"></i> 수정
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                      <nav aria-label="Page navigation" className="mt-4">
                        <ul className="pagination justify-content-center">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(1)}>처음</button>
                          </li>
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>이전</button>
                          </li>
                          
                          {[...Array(totalPages)].map((_, i) => (
                            <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                                {i + 1}
                              </button>
                            </li>
                          ))}
                          
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>다음</button>
                          </li>
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(totalPages)}>마지막</button>
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

      <Footer />
    </>
  )
}

export default MyPostsPage