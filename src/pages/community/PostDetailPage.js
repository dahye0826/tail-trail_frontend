
import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import CommentSection from "../../pages/community/CommentSection"
import LoadingSpinner from "../../common/LoadingSpinner"
import "./PostDetailPage.css"

function PostDetailPage() {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showReportDropdown, setShowReportDropdown] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation() // 현재 위치 정보 가져오기
  const hasFetched = useRef(false)
  const [currentUser, setCurrentUser] = useState(null)
  const reportDropdownRef = useRef(null)
  
  const isMyPost = currentUser && post && Number(currentUser.userId) === post.userId

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const userName = localStorage.getItem("userName")
    const userEmail = localStorage.getItem("userEmail")

    if (userId && userName) {
      const userData = {
        userId: Number(userId),
        userName,
        email: userEmail,
      }
      setCurrentUser(userData)
      setIsLoggedIn(true)
    } else {
      setCurrentUser(null)
      setIsLoggedIn(false)
    }
  }, [location])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (reportDropdownRef.current && !reportDropdownRef.current.contains(event.target)) {
        setShowReportDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        if (hasFetched.current) return
        hasFetched.current = true

        const response = await axios.get(`http://localhost:9000/api/community/${id}`)
        console.log("응답 데이터:", response.data)

        // 로그인한 사용자가 이 게시물을 신고했는지 확인
        let isReported = false
        const userId = localStorage.getItem("userId")

        if (userId && isLoggedIn) {
          try {
            const reportCheck = await axios.get(`http://localhost:9000/api/report`, {
              params: {
                userId: Number(userId),
                targetId: response.data.postId,
                targetType: "POST",
              },
            })
            isReported = reportCheck.data.isReported
          } catch (error) {
            console.error("신고 상태 확인 오류:", error)
          }
        }

        setPost({ ...response.data, isReported })
        console.log("현재 목록 아이디:", id)

        setLoading(false)
      } catch (error) {
        console.error("게시글 로딩 오류:", error)
        setLoading(false)
      }
    }
    fetchPostDetail()
  }, [id, isLoggedIn])

  const handlePlaceClick = () => {
    if (post?.placeId) {
      navigate(`/places/place/${post.placeId}`)
    }
  }

  const handleEditClick = () => {
    navigate(`/community/edit/${id}`)
  }

  const handleGoBack = () => {
    navigate("/community")
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

  const handleReport = async (reason) => {
    if (post.isReported) {
      alert("이미 신고하셨습니다!")
      setShowReportDropdown(false)
      return
    }

    const confirmReport = window.confirm(`이 게시물을 "${reason}" 사유로 신고하시겠습니까?`)
    if (!confirmReport) {
      return 
    }

    try {
      const response = await axios.post("http://localhost:9000/api/report", {
        targetId: post.postId,
        targetType: "POST",
        userId: currentUser.userId,
        reason: reason,
      })

      alert(`게시글이 '${reason}' 사유로 신고되었습니다.`)
      setShowReportDropdown(false)

      // 신고 완료 후 post 상태에 표시해두기
      setPost((prevPost) => ({ ...prevPost, isReported: true }))
    } catch (err) {
      console.log("신고 오류", err)
      alert("신고 처리 중 오류가 발생하였습니다")
    }
  }

  //로딩중이면 스피너만 보여줌
  if (loading || !post) {
    return (
      <>
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="container mt-5">
          <LoadingSpinner text="게시글을 불러오는 중입니다..." />
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
          <div className="post-header">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button className="btn back-button" onClick={handleGoBack}>
                <i className="bi bi-arrow-left me-2"></i> 목록으로
              </button>
            </div>

            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              <div className="d-flex align-items-center">
                <div className="user-initial-avatar">{post.userName.charAt(0)}</div>
                <div className="ms-2">
                  <div className="author-name">{post.userName}</div>
                  <div className="post-date">
                    {post.createdAt}
                    {post.updatedAt !== post.createdAt && <span className="ms-2">(수정됨)</span>}
                    {/* 장소 태그를 날짜 옆으로 이동 */}
                    {post.placeName && (
                      <span className="place-badge ms-2" onClick={handlePlaceClick} style={{ cursor: "pointer" }}>
                        <i className="bi bi-geo-alt-fill me-1"></i>
                        {post.placeName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center">
                {/* 작성자가 아니고 로그인한 경우에만 신고 버튼 표시 */}
                {!isMyPost && isLoggedIn && (
                  <div className="report-dropdown-container" ref={reportDropdownRef}>
                    {post.isReported ? (
                      <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                        <i className="bi bi-flag-fill"></i> 신고됨
                      </span>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-link text-secondary report-btn"
                          onClick={() => setShowReportDropdown(!showReportDropdown)}
                          title="게시글 신고"
                        >
                          <i className="bi bi-flag"></i>
                        </button>
                        {showReportDropdown && (
                          <div className="report-dropdown">
                            <div className="report-dropdown-header">신고 사유 선택</div>
                            <div className="report-dropdown-item" onClick={() => handleReport("영리 목적/홍보성")}>
                              영리 목적/홍보성
                            </div>
                            <div className="report-dropdown-item" onClick={() => handleReport("욕설/인신공격")}>
                              욕설/인신공격
                            </div>
                            <div className="report-dropdown-item" onClick={() => handleReport("스팸")}>
                              스팸
                            </div>
                            <div className="report-dropdown-item" onClick={() => handleReport("기타")}>
                              기타
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 본문 내용 표시 - 처리 없이 그대로 표시 */}
          <div className="post-contentdetail">
            <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
          </div>

          {/* 첨부 이미지 표시 */}
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="post-images-section mt-4">
              {post.imageUrls.map((image, index) => (
                <div key={index} className="mb-5">
                  <img
                    src={image.startsWith("http") ? image : `http://localhost:9000${image}`}
                    alt={`게시글 이미지 ${index + 1}`}
                    className="post-image"
                  />
                </div>
              ))}
            </div>
          )}

          {isMyPost && (
            <div className="post-actions mt-4 d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary" onClick={handleEditClick}>
                <i className="bi bi-pencil-square me-1" /> 수정
              </button>
              <button className="btn btn-outline-danger" onClick={handleDeleteClick}>
                <i className="bi bi-trash me-1" /> 삭제
              </button>
            </div>
          )}

          {/* 댓글 섹션 추가 */}
          <CommentSection postId={id} isLoggedIn={isLoggedIn} />
        </div>
      </div>

      <Footer />
    </>
  )
}

export default PostDetailPage


