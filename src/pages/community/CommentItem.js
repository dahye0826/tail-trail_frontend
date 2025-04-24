// 파일 상단 부분만 수정
import { useState } from "react"
import { commentAPI } from "../../services/api"  // 경로 수정됨
import { useAuth } from '../../contexts/AuthContext'  // AuthContext 경로도 확인
import "./CommentSection.css"

function CommentItem({ comment, onCommentUpdated, onCommentDeleted }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth();

  // 댓글 작성자인지 확인 (userId 또는 id 필드 확인)
  const isAuthor = user && (user.id === comment.userId || user.userId === comment.userId);

  const handleUpdateComment = async() => {
    if (!editedContent.trim()) {
      alert("댓글 내용을 입력해주세요.")
      return
    }
    try {
      const response = await commentAPI.updateComment(comment.commentId, editedContent);
      if (response.data && response.data.success) {
        onCommentUpdated(response.data.data);
        setIsEditing(false);
      } else {
        alert("댓글 수정에 실패했습니다.");
      }
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
      const response = await commentAPI.deleteComment(comment.commentId);
      if (response.data && response.data.success) {
        onCommentDeleted(comment.commentId);
      } else {
        alert("댓글 삭제에 실패했습니다.");
      }
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

export default CommentItem;