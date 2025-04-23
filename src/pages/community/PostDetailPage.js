
import axios from "axios"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import CommentSection from "../../pages/community/CommentSection";

import "./PostDetailPage.css"

function PostDetailPage() {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(true) // 실제 로그인 상태로 변경 필요
  const { id } = useParams()
  const navigate = useNavigate()
  const hasFetched = useRef(false)
  const [currentUser, setCurrentUser] = useState(localStorage.getItem("username"))

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const token = localStorage.getItem("token")
    const username = localStorage.getItem("username")

    if (token || username) {
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
    }
  }, [])

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        if (hasFetched.current) return // 이미 실행했으면 중단
        hasFetched.current = true // 처음 실행일 경우 true로 변경

        const response = await axios.get(`http://localhost:9000/api/community/${id}`)
        console.log("응답 데이터:", response.data)
        console.log("장소 정보:", response.data.place) // 장소 정보 디버깅 로그 추가
        setPost(response.data)
        console.log("현재 목록 아이디:", id)
        console.log("게시글 내용 확인:", response.data.content)

        setLoading(false)
      } catch (error) {
        console.error("게시글 로딩 오류:", error)
        setLoading(false)
      }
    }
    fetchPostDetail()
  }, [id])

  const handleGoBack = () => {
    navigate("/community")
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

  //로딩중이면 스피너만 보여줌
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

  const locationInfo =
    post && post.place
      ? {
          id: post.place.id || post.placeId, // placeId도 체크
          name: post.place.placeName || post.placeName || "이름 없음", // placeName도 체크
          address: post.place.address || post.placeAddress || "주소 없음", // 다양한 필드명 체크
        }
      : null

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <div className="container mt-4 mb-5">
        <div className="post-detail-container">
          <div className="post-header">
            <button className="btn btn-sm btn-outline-primary mb-3" onClick={handleGoBack}>
              <i className="bi bi-arrow-left me-1"></i> 목록으로
            </button>
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              <div className="d-flex align-items-center">
                <div className="author-avatar">
                  <i className="bi bi-person-circle"></i>
                </div>
                <div className="ms-2">
                  <div className="author-name">{post.username}</div>
                  <div className="post-date" style={{ color: "#000000" }}>
                    {post.createdAt}
                    {post.updatedAt !== post.createdAt && <span className="ms-2">(수정됨)</span>}
                    {(post.place?.placeName || post.placeName) && (
                      <span className="place-badge" onClick={handlePlaceClick} style={{ cursor: "pointer" }}>
                        <i className="bi bi-geo-alt-fill me-1"></i>
                        {post.place?.placeName || post.placeName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="post-stats">
                <span className="me-3">
                  <i className="bi bi-eye me-1"></i> {post.viewCount}
                </span>
              </div>
            </div>
          </div>

          {/* 장소 정보 카드 - 있을 경우에만 표시 */}
          {locationInfo && (
            <div className="place-info-card mt-3 mb-4">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="place-name mb-1" onClick={handlePlaceClick} style={{ cursor: "pointer" }}>
                        <i className="bi bi-geo-alt me-2"></i>
                        {locationInfo.name}
                      </h5>
                      <p className="place-address mb-0">{locationInfo.address}</p>
                    </div>
                    <button className="btn btn-sm btn-outline-primary view-place-btn" onClick={handlePlaceClick}>
                      장소 상세보기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 내용 먼저 표시 */}
          <div className="post-content mt-4">
            <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
          </div>

          {/* 이미지를 별도 섹션으로 분리 */}
          {post.imageUrls && post.imageUrls.length > 0 && (
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

          {/* 수정/삭제 버튼은 가장 아래에 배치 */}
          {/* {post?.username === currentUser && ( */}
            <div className="post-actions mt-4 d-flex justify-content-between">
              <div>
                <button className="btn btn-outline-secondary me-2 edit-btn" onClick={handleEditClick}>
                  <i className="bi bi-pencil-square me-1"></i> 수정
                </button>
                <button className="btn btn-outline-danger delete-btn" onClick={handleDeleteClick}>
                  <i className="bi bi-trash me-1"></i> 삭제
                </button>
              </div>
            </div>
          {/* )} */}

          {/* 댓글 섹션 추가 */}
           <CommentSection postId={id} isLoggedIn={isLoggedIn} />
        </div>
      </div>

      <Footer />
    </>
  )
}

export default PostDetailPage
