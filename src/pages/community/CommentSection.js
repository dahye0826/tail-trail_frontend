"use client"

import { useState, useEffect } from "react"
import { commentAPI } from "../../services/api"
import CommentItem from "./CommentItem"
import CommentForm from "./CommentForm"
import { useAuth } from '../../contexts/AuthContext' // 추가된 부분
import "./CommentSection.css"

function CommentSection({ postId }) {
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { isLoggedIn, user } = useAuth() // AuthContext에서 가져오기

    // 댓글 목록 불러오기
    useEffect(() => {
        const fetchComments = async () => {
            try {
                setLoading(true)
                // 중앙화된 API 사용
                const response = await commentAPI.getComments(postId)
                setComments(response.data)
                setError(null)
            } catch (err) {
                console.error("댓글 오류", err)
                setError("댓글을 불러오는데 실패했습니다")
            } finally {
                setLoading(false)
            }
        }
        fetchComments()
    }, [postId])
    
    const handleCommentAdded = (commentAdded) => {
        setComments((prevComments) => [commentAdded, ...prevComments])
    }

    const handleCommentUpdated = (updatedComment) => {
        setComments((prevComments) =>
            prevComments.map((comment) => (comment.commentId === updatedComment.commentId ? updatedComment : comment)),
        )
    }
    
    const handleCommentDeleted = (deletedCommentId) => {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.commentId !== deletedCommentId)
        )
    }

    return (
        <div className="comment-section">
            <h4 className="comments-title">
                댓글 <span className="comment-count">({comments.length})</span>
            </h4>

            <CommentForm 
              postId={postId} 
              onCommentAdded={handleCommentAdded} 
              isLoggedIn={isLoggedIn}
              currentUser={user}
            />

            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="no-comments">
                    <p className="text-muted text-center my-4">{error}</p>
                </div>
            ) : comments.length === 0 ? (
                <div className="no-comments">
                    <p className="text-muted text-center my-4">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
                </div>
            ) : (
                <div className="comments-list mt-4">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.commentId}
                            comment={comment}
                            onCommentUpdated={handleCommentUpdated}
                            onCommentDeleted={handleCommentDeleted}
                            currentUser={user}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default CommentSection