"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./MyPageStyles.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

const MyPostsPage = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(true) // For Navbar

  useEffect(() => {
    const loadPosts = async () => {
      try {
        // 실제 API 호출 대신 목업 데이터 사용
        setTimeout(() => {
          const mockPosts = [
            {
              id: 1,
              title: "강아지랑 부산여행",
              content:
                "지난 주말 우리 댕댕이와 함께한 부산 여행 후기입니다. 해운대에서 아침 일출을 보고, 광안리에서 야경을 즐겼어요.",
              date: "2023-05-15",
            },
            {
              id: 2,
              title: "고양이와 함께하는 캠핑",
              content: "처음으로 냥이와 함께 캠핑을 다녀왔어요. 생각보다 적응을 잘해서 즐거운 시간을 보냈습니다.",
              date: "2023-05-14",
            },
            {
              id: 3,
              title: "반려견 동반 카페 추천",
              content:
                "서울에서 반려견과 함께 갈 수 있는 카페를 소개합니다. 첫번째로 강남의 '멍멍카페'는 넓은 공간과 다양한 간식이 있어요.",
              date: "2023-05-12",
            },
          ]
          setPosts(mockPosts)
          setLoading(false)
        }, 1000)
      } catch (err) {
        setError("게시글을 불러오는데 실패했습니다.")
        console.error(err)
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

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
                    <Link to="/mypage/rated" className="sidebar-menu-link">
                      <i className="bi bi-star me-2"></i>별점 등록한 곳
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
                    <p className="text-end mb-3 text-muted small">총 {posts.length}개의 게시글을 작성했습니다.</p>

                    {posts.map((post) => (
                      <div key={post.id} className="post-card mb-3">
                        <div className="card-body">
                          <h5 className="card-title">{post.title}</h5>
                          <div className="post-content">{post.content}</div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="post-meta">
                              <span className="post-date">
                                <i className="bi bi-calendar3"></i> {post.date}
                              </span>
                            </div>
                            <div className="post-actions">
                              <Link to={`/community/post/${post.id}`} className="btn btn-sm btn-outline-primary me-2">
                                <i className="bi bi-eye me-1"></i> 보기
                              </Link>
                              <Link to={`/community/edit/${post.id}`} className="btn btn-sm btn-outline-secondary">
                                <i className="bi bi-pencil me-1"></i> 수정
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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

