"use client"

import { useState } from "react"
import axios from "axios"
import "./CommentSection.css"

function CommentItem({ comment, onCommentUpdated, onCommentDeleted, currentUser }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)
  const [isDeleting, setIsDeleting] = useState(false)
  const [comments, setComments]= useState([])

  // 댓글 작성자인지 확인
  const isAuthor = currentUser?.userId === comment.userId


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
      console.log("commentId 확인:", comment.commentId)

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
    // @userName 패턴을 찾아 하이라이트
    const mentionRegex = /@(\w+)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      // 멘션 앞 텍스트 추가
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }

      // 멘션 부분 추가 (스타일링 적용)
      parts.push(
        <span key={match.index} className="mention-highlight">
          {match[0]}
        </span>,
      )

      lastIndex = match.index + match[0].length
    }

    // 남은 텍스트 추가
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="d-flex align-items-center">
          <div className="comment-avatar">
            <i className="bi bi-person-circle"></i>
          </div>
          <div className="ms-2">
            <div className="comment-author">{comment.userName}</div>
            <div className="comment-date">{formatDate(comment.createdAt)}</div>
          </div>
        </div>
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
        <div className="comment-content mt-2">{formatMentions(comment.content)}</div>
      )}
    </div>
  )
}

export default CommentItem
