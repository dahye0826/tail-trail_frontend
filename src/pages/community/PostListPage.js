import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./PostListPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

function PostListPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const[loading,setLoading]= useState(true)
  const[currentPage,setCurrentPage]= useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const[posts,setPosts] = useState([])


  const navigate = useNavigate()

  const handleSearch = async()=>{
    
    console.log("검색 실행됨");
    if(!searchTerm.trim()) return

    try{
      setLoading(true)
      const response = await axios.get("http://localhost:9000/api/community",{
        params:{
          search:searchTerm,
          page:1,
          size:10,
        },
      })
     


      const formattedPosts = response.data.content.map((post)=>({
        ...post,
        createdAt:post.createdAt.split("T")[0],
      }))

      setPosts(formattedPosts)
      setCurrentPage(1)
      //setTotalPages(response.data.totalPages)
      setLoading(false)
    }catch(error){ 
    console.error("검색오류:",error)}
    setLoading(false)
    
  }

  const handleKeyDown = (e)=>{
    if (e.key=="Enter"){
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

    
  return (
   
    <>
    {/*네비게이션 바 컴포넌트*/}
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
          key={post.postId}
          className="post-list-item p-3 border-bottom"
          onClick={() => handlePostClick(post.postId)}
          style={{ cursor: "pointer" }}
        >
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="mb-1">{post.title}</h5>
          </div>

          <div className="d-flex justify-content-between text-muted small">
            <div className="d-flex">
              <span className="me-2">{post.name}</span>
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

</div>

{/* 푸터 컴포넌트 */}
<Footer />
      
    </>
  )
}

export default PostListPage

