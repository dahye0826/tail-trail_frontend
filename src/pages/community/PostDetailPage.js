import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
// import CommentSection from "./CommentSection"
import "./PostDetailPage.css"

function PostDetailPage() {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(true) // 실제 로그인 상태로 변경 필요
  const { id } = useParams()
  const navigate = useNavigate()
  const hasFetched = useRef(false)
  const currentUser = localStorage.getItem("username")

  useEffect(() => {
    const fetchPostDetail = async () => {

      try {
        const response = await axios.get(`http://localhost:9000/api/community/${id}`)
        console.log(response.data)
        setPost(response.data)
      } catch (err) {
        console.error("게시물 로딩 오류:", err)
      }
    }
    fetchPostDetail()
  }, [id])

  const handleGoBack = () => {
    navigate('/community')
  }

  
  const handlePlaceClick = () => {
    if (post?.place?.id) {
      navigate(`/places/place/${post.place.id}`)
    }
  }


  const handleEditClick = () => {
    navigate(`/community/edit/${id}`)
  }

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
  const locationInfo =
  post && post.place
    ? {
        id: post.place.id,
        name: post.place.placeName || "이름 없음",
        address: post.place.address || "주소 없음",
        lat: post.place.lat,
        lng: post.place.lng,
        isRegisteredPlace: true,
      }
    : null






  return (
    <>
    <Navbar isLoggedIn={isLoggedIn} />
  
    <div className="container mt-4 detail-post-container">
      {/* 뒤로가기 버튼 */}
      <div className="post-header">
        <button
          className="btn btn-sm mb-3 custom-back-btn"
          onClick={handleGoBack}
          style={{ marginTop: '10px' }}
        >
          <i className="bi bi-arrow-left me-1"></i> 목록으로
        </button>
      </div>
  
      {/* 제목 */}
      <h1 className="post-title mt-3">{post?.title}</h1>
  
      {/* 작성자 + 날짜 */}
      <div className="post-meta">
        <span className="user-name">{post?.username}</span>
        <span className="post-date ms-2">
          {post?.createdAt}
          {post?.updatedAt !== post?.createdAt && <span className="ms-2">(수정됨)</span>}
        </span>
      </div>
  
      {/* 내용 */}
      <div className="post-content mt-4">
        <div dangerouslySetInnerHTML={{ __html: post?.content }}></div>
      </div>
  
      {/* 이미지 */}
      {post?.imageUrls && post.imageUrls.length > 0 && (
        <div className="post-images-section mt-4 mb-4">
          {post.imageUrls.map((image, index) => (
            <div key={index} className="post-image-container mb-3">
              <img
                src={image.startsWith('http') ? image : `http://localhost:9000${image}`}
                alt={`게시글 이미지 ${index + 1}`}
                className="post-image"
              />
            </div>
          ))}
        </div>
      )}
  
      {/* 장소 정보 */}
      {locationInfo && (
        <div className="location-name" onClick={handlePlaceClick} style={{ cursor: 'pointer' }}>
          <div>{locationInfo.name || '이름 없음'}</div>
          <div className="text-muted" style={{ fontSize: '0.9rem' }}>
            {locationInfo.address || '장소 없음'}
          </div>
        </div>
      )}
  
      {/* 수정/삭제 버튼 */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-outline-secondary" onClick={handleEditClick}>
          <i className="bi bi-pencil-square me-1"></i>수정
        </button>
        <button type="submit" className="btn btn-outline-danger" onClick={handleDeleteClick}>
          <i className="bi bi-trash me-1"></i> 삭제
        </button>
      </div>
    </div>
  
    <Footer />
  </>
  )
}

export default PostDetailPage