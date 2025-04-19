import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import "./PostDetailPage.css"

function PostDetailPage() {
  // 상태 정의
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(true) // TODO: 실제 로그인 상태로 연동
  const { id } = useParams()
  const navigate = useNavigate()
  const hasFetched = useRef(false)
  const currentUser = localStorage.getItem("username")

  // 게시글 상세 조회 (최초 1회만 실행)
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        if (hasFetched.current) return
        hasFetched.current = true

        const response = await axios.get(`http://localhost:9000/api/community/${id}`)
        setPost(response.data)
        setLoading(false)
      } catch (error) {
        console.error("게시글 로딩 오류:", error)
        setLoading(false)
      }
    }
    fetchPostDetail()
  }, [id])

  // 뒤로가기
  const handleGoBack = () => {
    navigate("/community")
  }

  // 장소 클릭 → 장소 상세 페이지로 이동
  const handlePlaceClick = () => {
    if (post?.placeid) {
      navigate(`/places/place/${post.placeid}`)
    }
  }

  // 수정 버튼 클릭 → 수정 페이지로 이동
  const handleEditClick = () => {
    navigate(`/community/edit/${id}`)
  }

  // 삭제 버튼 클릭
  const handleDeleteClick = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      await axios.delete(`http://localhost:9000/api/community/${id}`)
      alert("게시글이 삭제되었습니다.")
      navigate("/community")
    } catch (err) {
      console.error("삭제 오류:", err)
      alert("게시글 삭제 실패")
    }
  }

  // 로딩 중이면 스피너 표시
  if (loading) {
    return (
      <>
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="container mt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <div className="container mt-4 mb-5">
        <div className="post-detail-container">
          {/* 헤더 */}
          <div className="post-header">
            <button className="btn btn-sm btn-outline-secondary mb-3" onClick={handleGoBack}>
              <i className="bi bi-arrow-left me-1"></i> 뒤로가기
            </button>
            <h1 className="post-title">{post.title}</h1>

            <div className="post-meta">
              <div className="d-flex align-items-center">
                <div className="author-avatar">
                  <i className="bi bi-person-circle"></i>
                </div>
                <div className="ms-2">
                  <div className="author-name">{post.username}</div>
                  <div className="post-date">
                    {post.createdAt}
                    {/* 수정된 경우 표시 */}
                    {post.updatedAt !== post.createdAt && (
                      <span className="ms-2">(수정됨)</span>
                    )}
                    {/* 장소 정보 */}
                    {post.placeName && (
                      <span
                        className="ms-2 place-badge"
                        onClick={handlePlaceClick}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bi bi-geo-alt-fill me-1"></i>
                        {post.placeName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 게시글 본문 */}
          <div className="post-content mt-4" style={{ fontSize: "18px" }}>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* 이미지 섹션 */}
          {post.imageUrls?.length > 0 && (
            <div className="post-images-section mt-4 mb-4">
              {post.imageUrls.map((image, index) => (
                <div key={index} className="post-image-container mb-3">
                  <img
                    src={image.startsWith("http") ? image : `http://localhost:9000${image}`}
                    alt={`게시글 이미지 ${index + 1}`}
                    className="post-image"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 수정/삭제 버튼 */}
          {/* {post.username === currentUser && ( */}
            <div className="post-actions mt-4 d-flex justify-content-between">
              <div>
                <button
                  className="btn btn-outline-secondary me-2 edit-btn"
                  onClick={handleEditClick}
                >
                  <i className="bi bi-pencil-square me-1"></i> 수정
                </button>
                <button
                  className="btn btn-outline-danger delete-btn"
                  onClick={handleDeleteClick}
                >
                  <i className="bi bi-trash me-1"></i> 삭제
                </button>
              </div>
            </div>
          {/* )} */}

          {/* 댓글 섹션 (향후 확장 가능) */}
          {/* <CommentSection postId={id} isLoggedIn={isLoggedIn} /> */}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default PostDetailPage