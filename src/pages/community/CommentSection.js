import { useState, useEffect } from "react"
import axios from "axios"
import CommentItem from "./CommentItem"
import CommentForm from "./CommentForm"
import "./CommentSection.css"
import { preconnect } from "react-dom"

function CommentSection({ postId, isLoggedIn }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const currentUser = localStorage.getItem("username") || null

 
  useEffect(()=>{
    const  fetchComments = async() =>{
    try{
      setLoading(true)
      const response = await axios.get(`/api/comments/post/${postId}`)
      setComments(response.data)
      setError(null)
  }catch(err){
    console.error("댓글 불러오지 못함:" ,err)
    setError(err)
  }finally{
    setLoading(false)
  }
}
fetchComments()
  },[postId])

//댓글 추가 처리
const handleCommentAdded =  (newComment) =>{
setComments((prevComments)=>[newComment, ...prevComments])
}

//댓글 수정 처리
const handleCommentUpdated = (updatedComment) => {
  setComments((prevComments)=>prevComments.map((comment)=>(comment.id===updatedComment.id?updatedComment:comment))
 )
}

//댓글 삭제 처리
const handleCommentDeleted = (commentId) => {
  setComments((prevComments)=> prevComments.filter((comment)=>comment.id!==commentId))
}

  return (
    <div className="comment-section">
      <h4 className="comments-title">
        댓글 <span className="comment-count">({comments.length})</span>
      </h4>

      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} isLoggedIn={isLoggedIn} />

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="no-comments">
          <p className="text-center text-danger">댓글을 불러오지 못했습니다.</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="no-comments">
          <p className="text-muted text-center my-4">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="comments-list mt-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
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
