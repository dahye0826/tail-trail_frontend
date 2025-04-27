"use client"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import "./CommentSection.css"

function CommentForm({ postId, onCommentAdded, isLoggedIn, userId,commentUsers = [] }) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMentionOpen, setIsMentionOpen] = useState(false)
  const textareaRef = useRef(null)
  const dropdownRef = useRef(null)

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMentionOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // 멘션 토글 버튼 클릭 처리
  const toggleMentionDropdown = () => {
    setIsMentionOpen(!isMentionOpen)
  }

  // 멘션 선택 처리
  const handleMentionSelect = (userName) => {

    const mention = `@${userName} `;
    const contentWithoutOldMention = content.replace(/^@([\uAC00-\uD7A3\w]+)\s+/, "");

    const newContent = mention + contentWithoutOldMention;
    setContent(newContent);
  
    setTimeout(()=>{
      if(textareaRef.current){
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          mention.length,
          mention.length
        )
      }
    },0);
    

    // 멘션 선택 후 드롭다운 닫기
    setIsMentionOpen(false)
  }

  // 댓글 작성 처리
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isLoggedIn) {
      alert("댓글을 작성하려면 로그인이 필요합니다.")
      return
    }

    if (!content.trim()) {
      alert("댓글 내용을 입력해주세요.")
      return
    }

    try {
      setIsSubmitting(true)
      console.log({ postId, content, userId })
      const response = await axios.post("http://localhost:9000/api/comments", {
        postId,
        content,
        userId
      })
      onCommentAdded(response.data);
      setContent("")
    } catch (error) {
      console.error("댓글 작성 오류:", error)
      alert("댓글 작성에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 텍스트 영역 클릭 처리
  const handleTextareaClick = () => {
    if (!isLoggedIn) {
      alert("댓글을 작성하려면 로그인이 필요합니다.")
    }
  }

  return (
    <div className="comment-form-container">
      {/* 멘션 드롭다운 영역 */}
      <div className="mention-dropdown-container" ref={dropdownRef}>
        <button
          type="button"
          className="btn btn-outline-secondary mention-dropdown-toggle"
          onClick={toggleMentionDropdown}
          disabled={!isLoggedIn}
        >
          @언급하기{isMentionOpen ? "▲" : "▼"}
        </button>

        {isMentionOpen && commentUsers.length > 0 && (
          <div className="mention-dropdown-menu">
            {commentUsers.map((user, index) => (
              <div key={index} className="mention-dropdown-item" onClick={() => handleMentionSelect(user.userName || user)}>
                @{user.userName || user}
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="form-control"
          placeholder={isLoggedIn ? "댓글을 작성해주세요..." : "댓글을 작성하려면 로그인이 필요합니다."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onClick={handleTextareaClick}
          disabled={!isLoggedIn || isSubmitting}
        ></textarea>

        <div className="d-flex">
          <button type="submit" className="btn btn-primary" disabled={!isLoggedIn || isSubmitting || !content.trim()}>
            {isSubmitting ? "등록 중..." : "댓글 등록"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CommentForm
