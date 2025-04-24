"use client"

import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import CommentItem from "./CommentItem"
import CommentForm from "./CommentForm"
import "./CommentSection.css"

function CommentSection({ postId, isLoggedIn, postAuthor }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentUsers, setCommentUsers] = useState([])
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : {};

  // 댓글 목록 불러오기
  useEffect(() => {
    let isMounted = true
    const fetchComments = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:9000/api/comments/post/${postId}`)

        if (isMounted) {
          setComments(response.data)
          console.log("로딩 시작");

          // 댓글 작성자 목록 추출 (멘션 제안용)
          const uniqueUsers = [...new Set(response.data.map((comment) => comment.userName).filter(Boolean))]

          // 현재 로그인한 사용자와 게시글 작성자 추가
          const allUsers = [...uniqueUsers]

          // 현재 사용자가 있고 목록에 없으면 추가
          if (currentUser && !allUsers.includes(currentUser)) {
            allUsers.push(currentUser)
          }

          // 게시글 작성자가 있고 목록에 없으면 추가
          if (postAuthor && !allUsers.includes(postAuthor)) {
            allUsers.push(postAuthor)
          }

          setCommentUsers(allUsers)
          setError(null)
        }
      } catch (error) {
        console.error("댓글 로딩 오류:", error)
        if (isMounted) {
          // 에러 발생 시에도 기본 사용자 목록 제공
          const allUsers = []
          if (currentUser) {
            allUsers.push(currentUser)
          }
          if (postAuthor) {
            allUsers.push(postAuthor)
          }
          setCommentUsers(allUsers)
          setError(null)
        }
      } finally {
        if (isMounted) {
          console.log("로딩끝");
          setLoading(false)
        }
      }
    }

    fetchComments()

    return () => {
      isMounted = false
    }
  }, [postId])

  // 댓글 추가 처리
  const handleCommentAdded = (newComment) => {
    setComments((prevComments) => [newComment, ...prevComments])

    // 새 사용자 추가 (아직 목록에 없는 경우)
    if (newComment.userName && !commentUsers.includes(newComment.userName)) {
      setCommentUsers((prev) => [...prev, newComment.userName])
    }
  }

  // 댓글 수정 처리
  const handleCommentUpdated = (updatedComment) => {
    setComments((prevComments) =>
      prevComments.map((comment) => (comment.id === updatedComment.id ? updatedComment : comment)),
    )
  }

  // 댓글 삭제 처리
  const handleCommentDeleted = (commentId) => {
    setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId))
  }

  // useMemo를 사용하여 commentUsers 안정화
  const memoizedCommentUsers = useMemo(() => commentUsers, [commentUsers])

  return (
    <div className="comment-section">
      <h4 className="comments-title">
        <i className="bi bi-chat-left-text comments-title-icon"></i>
        댓글 <span className="comment-count">({comments.length})</span>
      </h4>

      <CommentForm
        postId={postId}
        onCommentAdded={handleCommentAdded}
        userId={currentUser.userId}
        isLoggedIn={true}
        commentUsers={memoizedCommentUsers}
      />

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="no-comments">
          <p>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="comments-list mt-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentSection
