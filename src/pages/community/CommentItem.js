"use client"

import { useState } from "react"
import axios from "axios"
import "./CommentSection.css"

function CommentItem({ comment, onCommentUpdated, onCommentDeleted, currentUser }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)
  const [isDeleting, setIsDeleting] = useState(false)

  // 댓글 작성자인지 확인
  const isAuthor = currentUser === comment.username

  // 댓글 수정 처리
  const handleUpdateComment = async () => {
    if (!editedContent.trim()) {
      alert("댓글 내용을 입력해주세요.")
      return
    }

    try {
      const response = await axios.put(`http://localhost:9000/api/comments/${comment.id}`, {
        content: editedContent,
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
    if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) {
      return
    }

    try {
      setIsDeleting(true)
      await axios.delete(`http://localhost:9000/api/comments/${comment.id}`)
      onCommentDeleted(comment.id)
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
        {/* {isAuthor && !isEditing && ( */}
          <div className="comment-actions">
            <button className="btn btn-sm btn-link" onClick={() => setIsEditing(true)}>
              수정
            </button>
            <button className="btn btn-sm btn-link text-danger" onClick={handleDeleteComment} disabled={isDeleting}>
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        {/* )} */}
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
