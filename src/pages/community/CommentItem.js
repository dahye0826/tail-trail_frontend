import { useState } from "react"
import { commentAPI } from "../../services/api" // 중앙화된 API 사용
import "./CommentSection.css"

function CommentItem({ comment, onCommentUpdated, onCommentDeleted, currentUser }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)
  const [isDeleting, setIsDeleting] = useState(false)

  // 댓글 작성자인지 확인
  const isAuthor = currentUser && currentUser.id === comment.userId

  const handleUpdateComment = async() => {
    if (!editedContent.trim()) {
      alert("댓글 내용을 입력해주세요.")
      return
    }
    try {
      // 중앙화된 API 사용
      const response = await commentAPI.updateComment(comment.commentId, editedContent)
      onCommentUpdated(response.data)
      setIsEditing(false)
    } catch (err) {
      console.error("댓글 수정 실패:", err)
      alert("댓글 수정에 실패했습니다.")
    }
  }
  
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(comment.content)
  }

  const handleDeleteComment = async() => {
    if(!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) {
      return
    }
    
    try {
      setIsDeleting(true)
      // 중앙화된 API 사용
      await commentAPI.deleteComment(comment.commentId)
      onCommentDeleted(comment.commentId)
    } catch (err) {
      console.error("댓글 삭제 오류:", err)
      alert("댓글 삭제에 실패했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }
  
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

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="d-flex align-items-center">
          <div className="comment-avatar">
            <i className="bi bi-person-circle"></i>
          </div>
          <div className="ms-2">
            <div className="comment-author">{comment.username}</div>
            <div className="comment-date">{formatDate(comment.createdAt)}</div>
          </div>
        </div>
        {/* 권한 확인 로직 활성화 */}
        {isAuthor && !isEditing && (
          <div className="comment-actions">
            <button className="btn btn-sm btn-link" onClick={() => setIsEditing(true)}>
              수정
            </button>
            <button className="btn btn-sm btn-link text-danger" onClick={handleDeleteComment} disabled={isDeleting}>
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        )}
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
        <div className="comment-content mt-2">{comment.content}</div>
     )} 
    </div>
  )
}

export default CommentItem