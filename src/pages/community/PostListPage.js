"use client"

import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./PostListPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import LoadingSpinner from "../../common/LoadingSpinner"

function PostListPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [posts, setPosts] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [issearching, setIsSearching] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    console.log("현재 로그인한 사용자 (이 페이지):", user?.userName || "비로그인 상태")
  }, [])

  const navigate = useNavigate()

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const userName = localStorage.getItem("userName")
    const loggedIn = localStorage.getItem("isLoggedIn") === "true" && !!userId

    setIsLoggedIn(loggedIn)

    console.log("✅ 현재 로그인한 사용자:", userName || "비로그인 상태")
  }, [])

  const handleSearch = async () => {
    console.log("검색 실행됨")
    if (!searchTerm.trim()) return

    try {
      setLoading(true)
      const response = await axios.get("http://localhost:9000/api/community", {
        params: {
          search: searchTerm,
          page: currentPage - 1,
          size: 10,
        },
      })

      const formattedPosts = response.data.content.map((post) => ({
        ...post,
        createdAt: post.createdAt.split("T")[0],
      }))

      setPosts(formattedPosts)
      setCurrentPage(1)
      setTotalPages(response.data.totalPages)
      setIsSearching(true)
      setLoading(false)
    } catch (error) {
      console.error("검색오류:", error)
      setLoading(false)
    }
  }

  //페이지 변경 또는 검색 상태 변경 시 자동으로 API를 요청해서 게시글을 불러오는 역할
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const response = await axios.get("http://localhost:9000/api/community", {
          params: issearching ? { search: searchTerm, page: currentPage, size: 10 } : { page: currentPage, size: 10 },
        })

        const formattedPosts = response.data.content.map((post) => ({
          ...post,
          createdAt: post.createdAt.split("T")[0],
        })) //formattedPosts: 형식을 바꾼 데이터

        setPosts(formattedPosts)
        setTotalPages(response.data.totalPages)
        setLoading(false)
      } catch (error) {
        console.log("게시물 불러오기 오류:", error)
        setLoading(false)
      }
    }
    fetchPosts()
  }, [currentPage, issearching])

  const handleKeyDown = (e) => {
    if (e.key == "Enter") {
      handleSearch()
    }
  }

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      alert("글을 작성하려면 로그인이 필요합니다.")
      return
    }
    navigate("/community/write")
  }

  const handlePostClick = (postId) => {
    navigate(`/community/post/${postId}`)
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 3
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = startPage + maxPagesToShow - 1

    if (endPage > totalPages) {
      endPage = totalPages
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }
    return pageNumbers
  }

  const hanleResetSearch = () => {
    setSearchTerm("")
    setIsSearching(false)
    setCurrentPage(1)
  }

  return (
    <>
      {/*네비게이션 바 컴포넌트*/}
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="container mt-4 post-container">
        <div className="post-header text-center">
          <h2 className="mb-4">우리의 발자국 이야기</h2>
          <p className="post-subtitle mb-5">함께한 발걸음이 추억이 되는 곳</p>
        </div>

        <div className="post-search mb-4">
          <div className="d-flex align-items-center position-relative">
            {/* 글쓰기 버튼 - 왼쪽 고정 */}
            <div className="position-absolute start-0">
              <button className="btn post-btn-primary post-write-btn" onClick={handleWriteClick}>
                <i className="bi bi-pencil-square me-1"></i> 글쓰기
              </button>
            </div>

            {/* 제목 검색 - 가운데 정렬 */}
            <div className="input-group w-50 mx-auto">
              <input
                type="text"
                className="form-control"
                placeholder="제목 검색..."
                aria-label="제목 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="btn post-btn-primary post-search-btn"
                type="button"
                onClick={handleSearch}
                title="검색"
              >
                <i className="bi bi-search"></i>
              </button>
              <button className="post-reset-btn ms-2" type="button" onClick={hanleResetSearch} title="검색 초기화">
                <i className="bi bi-arrow-counterclockwise me-1"></i> 초기화
              </button>
            </div>
          </div>
        </div>

        <div className="post-list">
          {loading ? (
            <LoadingSpinner text="게시글을 불러오는 중입니다..." />
          ) : posts.length > 0 ? (
            posts.map((post, index) => (
              <div
                key={post.postId}
                className={`post-item p-3 border-bottom ${index % 2 === 1 ? "even-row" : ""}`}
                onClick={() => handlePostClick(post.postId)}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="mb-1">{post.title}</h5>
                </div>

                <div className="d-flex justify-content-between text-muted small">
                  <div className="d-flex">
                    <span className="me-2">{post.userName} </span>
                    <span className="me-3">{post.createdAt}</span>
                    <span className="post-comment-count">
                      <i className="bi bi-chat-left-text me-1"></i> {post.commentCount}
                    </span>
                  </div>
                  <div>
                    <span className="post-view-count">
                      <i className="bi bi-eye me-1"></i> {post.viewCount}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-center mt-4">
          <nav aria-label="Page navigation">
            <ul className="pagination post-pagination">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(1)} aria-label="First">
                  <i className="bi bi-chevron-double-left"></i>
                </button>
              </li>
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} aria-label="Previous">
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
                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next">
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(totalPages)} aria-label="Last">
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* 푸터 컴포넌넌트 */}
      <Footer />
    </>
  )
}

export default PostListPage
