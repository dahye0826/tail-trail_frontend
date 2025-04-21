import { useState } from "react"
import axios from "axios"
import "./CommentSection.css"

function CommentForm({ postId, onCommentAdded, isLoggedIn }) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 댓글 작성 처리
  const handleSubmit = async (e) => {
    e.preventDefault()

    // if (!isLoggedIn) {
    //   alert("댓글을 작성하려면 로그인이 필요합니다.")
    //   return
    // }

    if (!content.trim()) {
      alert("댓글 내용을 입력해주세요.")
      return
    }
    try {
        console.log("📤 보내는 요청 데이터:", { postId, content });
        setIsSubmitting(true)
        const response = await axios.post("http://localhost:9000/api/comments", {
        postId,
        content,
        // username 
      })
      onCommentAdded(response.data)
      setContent("")

        
    } catch (err) {
        console.error("댓글 작성 오류:",err)
        alert("댓글 작성에 실패했습니다")

        
    }finally{
        setIsSubmitting(false)
    }


  }

  return (
    <div className="comment-form-container">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            className="form-control"
            placeholder={isLoggedIn ? "댓글을 작성해주세요..." : "댓글을 작성하려면 로그인이 필요합니다."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            // disabled={!isLoggedIn || isSubmitting}
          ></textarea>
        </div>
        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary" /*disabled={!isLoggedIn || isSubmitting || !content.trim()*/>
            {isSubmitting ? "등록 중..." : "댓글 등록"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CommentForm
