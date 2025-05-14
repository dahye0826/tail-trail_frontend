import { useState, useEffect } from "react"
import axios from "axios"
import "./CommentSection.css"

function CommentItem({ comment, onCommentUpdated, onCommentDeleted, currentUser }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showReportDropdown, setShowReportDropdown] = useState(false)
  const [isReported, setIsReported] = useState(false)

  // 댓글 작성자인지 확인
  const isAuthor = currentUser?.userId === comment.userId

  useEffect(() => {
    const checkReportStatus = async () => {
      if (!currentUser) return

      try {
        const response = await axios.get("http://localhost:9000/api/report", {
          params: {
            userId: currentUser.userId,
            targetId: comment.commentId,
            targetType: "COMMENT",
          },
        })

        setIsReported(response.data.isReported)
      } catch (error) {
        console.error("신고 상태 확인 오류:", error)
      }
    }

    checkReportStatus()
  }, [comment.commentId, currentUser])

  // 댓글 수정 처리
  const handleUpdateComment = async () => {
    if (!editedContent.trim()) {
      alert("댓글 내용을 입력해주세요.")
      return
    }

    try {
      const response = await axios.put(`http://localhost:9000/api/comments/${comment.commentId}`, {
        content: editedContent,
        userId: currentUser?.userId,
      })

      onCommentUpdated(response.data)
      setIsEditing(false)
    } catch (error) {
      console.error("댓글 수정 오류:", error)
      alert("댓글 수정에 실패했습니다.")
    }
  }

  // 댓글 삭제 처리
  const handleDeleteComment = async () => {
    if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return

    try {
      setIsDeleting(true)

      // 서버에서 댓글 삭제
      await axios.delete(`http://localhost:9000/api/comments/${comment.commentId}`)

      // UI에서 상태 제거 (부모에서 props로 받은 함수 호출)
      onCommentDeleted(comment.commentId)
    } catch (error) {
      console.error("댓글 삭제 오류:", error)
      alert("댓글 삭제에 실패했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }

  // 수정 취소
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(comment.content)
  }

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // 멘션 형식 처리 (@userName)
  const formatMentions = (text) => {
    const mentionRegex = /^@([\uAC00-\uD7A3\w]+)\s+/ // 맨 앞에 @username + 공백까지

    const match = text.match(mentionRegex)

    if (match) {
      const mention = match[0] // "@userName "
      const remainingText = text.slice(mention.length) // 나머지 텍스트만 남김

      return [
        <span key="mention" className="mention-highlight">
          {mention.trim()}
        </span>,
        " ",
        remainingText,
      ]
    }

    // 멘션이 없으면 원래 텍스트 그대로 리턴
    return text
  }

  // 신고 처리
  const handleReport = async (reason) => {
    if (isReported) {
      alert("이미 신고하셨습니다.")
      setShowReportDropdown(false)
      return
    }

    if (!window.confirm(`이 댓글을 '${reason}' 사유로 신고하시겠습니까?`)) return

    try {
      await axios.post("http://localhost:9000/api/report", {
        targetId: comment.commentId, 
        targetType: "COMMENT",
        reason: reason, 
        reporterId: currentUser?.userId,
      })

      alert(`댓글이 '${reason}' 사유로 신고되었습니다.`)
      setIsReported(true)
    } catch (error) {
      console.error("댓글 신고 오류:", error)
      alert("댓글 신고에 실패했습니다.")
    } finally {
      setShowReportDropdown(false)
    }
  }

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="d-flex align-items-center">
          <div className="comment-avatar">{comment.userName ? comment.userName.charAt(0) : "?"}</div>
          <div className="ms-2">
            <div className="comment-author">{comment.userName}</div>
            <div className="comment-date">{formatDate(comment.createdAt)}</div>
          </div>
        </div>
        <div className="comment-actions">
          {isAuthor && !isEditing && (
            <>
              <button className="btn btn-sm btn-link" onClick={() => setIsEditing(true)}>
                수정
              </button>
              <button className="btn btn-sm btn-link text-danger" onClick={handleDeleteComment} disabled={isDeleting}>
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </>
          )}
          {!isAuthor && currentUser && (
            <div className="report-dropdown-container">
              {isReported ? (
                <span className="text-muted small" style={{ fontSize: "0.8rem" }}>
                  <i className="bi bi-flag-fill"></i> 신고됨
                </span>
              ) : (
                <>
                  <button
                    className="btn btn-sm btn-link text-secondary report-btn"
                    onClick={() => setShowReportDropdown(!showReportDropdown)}
                    title="댓글 신고하기"
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

      {isEditing ? (
        <div className="comment-edit-form mt-2">
          <textarea
            className="form-control"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
          ></textarea>
          <div className="d-flex justify-content-end mt-2">
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleCancelEdit}>
              취소
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleUpdateComment}>
              저장
            </button>
          </div>
        </div>
      ) : (
        <div className="comment-content mt-2">{formatMentions(comment.content)}</div>
      )}
    </div>
  )
}

export default CommentItem
