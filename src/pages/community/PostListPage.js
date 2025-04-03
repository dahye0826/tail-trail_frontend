import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./PostListPage.css"
import { mockPosts } from "./mockData"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

function PostListPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // 로그인 상태 관리
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  // 페이징 관련 상태 추가
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(5) // 테스트용 총 페이지 수

  useEffect(() => {
    // Fetch posts from backend
    const fetchPosts = async () => {
      try {
        setLoading(true)
        // 실제 API 연결 시 아래 주석을 해제하세요
        // const response = await axios.get('/api/posts');
        // setPosts(response.data);

        // 테스트용 목업 데이터
        setTimeout(() => {
          // 날짜 형식 확인 - 시간 제거
          const formattedPosts = mockPosts.map((post) => ({
            ...post,
            createdAt: post.createdAt.split(" ")[0], // 날짜 부분만 사용
          }))
          setPosts(formattedPosts)
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error("Error fetching posts:", error)
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleSearch = () => {
    if (!searchTerm.trim()) return

    // 실제 구현에서는 API 호출로 대체
    setLoading(true)
    setTimeout(() => {
      const filteredPosts = mockPosts
        .filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((post) => ({
          ...post,
          createdAt: post.createdAt.split(" ")[0], // 날짜 부분만 사용
        }))
      setPosts(filteredPosts)
      setLoading(false)
    }, 300)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleWriteClick = () => {
    // 로그인 상태 확인
    if (!isLoggedIn) {
      alert("글을 작성하려면 로그인이 필요합니다.")
      return
    }
    navigate("/community/write")
  }

  const handlePostClick = (postId) => {
    navigate(`/community/post/${postId}`)
  }

  // 페이지 변경 핸들러 추가
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)

    // 실제 구현에서는 여기서 해당 페이지의 데이터를 불러옵니다
    setLoading(true)
    setTimeout(() => {
      // 테스트용 데이터 - 페이지 번호에 따라 다른 데이터를 보여줍니다
      const formattedPosts = mockPosts.map((post) => ({
        ...post,
        id: post.id + (page - 1) * 4, // 페이지별로 다른 ID 부여
        title: `${post.title} - 페이지 ${page}`,
        createdAt: post.createdAt.split(" ")[0],
      }))
      setPosts(formattedPosts)
      setLoading(false)
    }, 500)
  }

  // 페이지네이션 UI를 위한 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // 한 번에 보여줄 페이지 번호 개수

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

  return (
    <>
      {/* 네비게이션 바 컴포넌트 */}
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="container mt-4 custom-table">
        <div className="post-header text-center">
          <h2 className="mb-4">우리의 발자국 이야기</h2>
          <p className="subtitle mb-5">반려동물과 함께 떠난 소중한 시간을 남겨보세요.</p>
        </div>


        <div className="search-container mb-4">
          <div className="d-flex align-items-center position-relative">
            {/* 글쓰기 버튼 - 왼쪽 고정 */}
            <div className="position-absolute start-0">
              <button className="btn btn-primary write-btn" onClick={handleWriteClick}>
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
              <button className="btn btn-primary" type="button" onClick={handleSearch}>
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="post-list-container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.post_id}
                className="post-list-item p-3 border-bottom"
                onClick={() => handlePostClick(post.post_id)}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="mb-1">{post.title}</h5>
                </div>

                <div className="d-flex justify-content-between text-muted small">
                  <div className="d-flex">
                    <span className="me-2">{post.username}</span>
                    <span className="me-3">{post.createdAt}</span>
                    <span>
                      <i className="bi bi-chat-left-text me-1"></i> {post.commentCount}
                    </span>
                  </div>
                  <div>
                    <span>
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
            <ul className="pagination">
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

              {getPageNumbers().map((number) => (
                <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                  <button className="page-link" onClick={() => handlePageChange(number)}>
                    {number}
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

        <div className="text-end mt-3 admin-controls">
          <button className="btn btn-outline-secondary me-2" onClick={() => setIsLoggedIn(!isLoggedIn)}>
            테스트: {isLoggedIn ? "로그아웃 상태로 변경" : "로그인 상태로 변경"}
          </button>
        </div>
      </div>

      {/* 푸터 컴포넌트 */}
      <Footer />
    </>
  )
}

export default PostListPage

