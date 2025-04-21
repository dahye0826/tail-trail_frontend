"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import CommentItem from "./CommentItem"
import CommentForm from "./CommentForm"
import "./CommentSection.css"

function CommentSection({ postId, isLoggedIn }) {
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const currentUser = localStorage.getItem("username") || null

    // 댓글 목록 불러오기
    useEffect(() => {

        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:9000/api/comments/post/${postId}`)
                setLoading(true)
                setComments(response.data)
                console.log(response.data)
                setError(null)

            } catch (err) {
                console.error("댓글 오류", err)
                alert("댓글 불러오기 실패")
            }
            finally {
                setLoading(false)
            }
        }
        fetchComments()

    }, [postId])
    
    
    const handleCommentAdded =(CommentAdded) => {
        setComments((prevComments)=>
            [CommentAdded, ...prevComments])

    }

    const handleCommentUpdated = (updatedComment) => {
        setComments((prevComments) =>
            prevComments.map((comment) => (comment.commentId === updatedComment.commentId ? updatedComment : comment)),
        )
    }
    
    const handleCommentDeleted =  (deletedCommentId) => {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.commentId !== deletedCommentId)
        )
      }


    return (
        <div className="comment-section">
            <h4 className="comments-title">
                댓글 <span className="comment-count">({comments.length})</span>
            </h4>

            <CommentForm postId={postId} onCommentAdded={handleCommentAdded}/>

            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="no-comments">
                    <p className="text-muted text-center my-4">댓글을 불러오지 못했습니다</p>
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
            />
          ))}
                </div>
            )}
        </div>
    )
}

export default CommentSection
