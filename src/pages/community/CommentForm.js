"use client"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import "./CommentSection.css"

function CommentForm({ postId, onCommentAdded, isLoggedIn, userId, commentUsers = [] }) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMentionList, setShowMentionList] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [filteredUsers, setFilteredUsers] = useState([])
  const [mentionStartPos, setMentionStartPos] = useState(0)
  const textareaRef = useRef(null)
  const mentionListRef = useRef(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mentionListRef.current &&
        !mentionListRef.current.contains(event.target) &&
        textareaRef.current !== event.target
      ) {
        setShowMentionList(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleContentChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)
  

    if (!newContent.startsWith("@")) {
      setShowMentionList(false)
      return
    }
  
    const afterAt = newContent.slice(1).split(" ")[0] 
    setMentionQuery(afterAt)
    setMentionStartPos(0) 
  
    const filtered = commentUsers.filter((user) => {
      const userName = typeof user === "string" ? user : user.userName
      return userName.toLowerCase().includes(afterAt.toLowerCase())
    })
  
    setFilteredUsers(filtered.length > 0 ? filtered : commentUsers)
    setShowMentionList(commentUsers.length > 0)
  }
  

  const handleMentionSelect = (user) => {
    const userName = typeof user === "string" ? user : user.userName

    const beforeMention = content.substring(0, mentionStartPos)
    const afterMention = content.substring(mentionStartPos + mentionQuery.length + 1)
    const newContent = `${beforeMention}@${userName} ${afterMention}`

    setContent(newContent)
    setShowMentionList(false)

    setTimeout(() => {
      if (textareaRef.current) {
        const cursorPosition = mentionStartPos + userName.length + 2
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition)
      }
    }, 0)
  }

  const handleKeyDown = (e) => {
    if (!showMentionList || filteredUsers.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setFocusedIndex((prev) => (prev + 1) % filteredUsers.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setFocusedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      handleMentionSelect(filteredUsers[focusedIndex])
    }
  }

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
      const response = await axios.post("http://localhost:9000/api/comments", {
        postId,
        content,
        userId,
      })
      onCommentAdded(response.data)
      setContent("")
    } catch (error) {
      console.error("댓글 작성 오류:", error)
      alert("댓글 작성에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTextareaClick = () => {
    if (!isLoggedIn) {
      alert("댓글을 작성하려면 로그인이 필요합니다.")
    }
  }

  return (
    <div className="comment-form-container">
      <form onSubmit={handleSubmit}>
        <div className="position-relative">
          <textarea
            ref={textareaRef}
            className="form-control"
            placeholder={
              isLoggedIn
                ? "댓글을 작성해주세요... (@를 입력하여 사용자 언급)"
                : "댓글을 작성하려면 로그인이 필요합니다."
            }
            value={content}
            onChange={handleContentChange}
            onClick={handleTextareaClick}
            onKeyDown={handleKeyDown}
            disabled={!isLoggedIn || isSubmitting}
          ></textarea>

          {showMentionList && filteredUsers.length > 0 && (
            <div ref={mentionListRef} className="mention-dropdown-menu">
              {filteredUsers.map((user, index) => {
                const userName = typeof user === "string" ? user : user.userName
                const userId = typeof user === "string" ? index : user.userId
                const isFocused = index === focusedIndex
                return (
                  <div
                    key={userId}
                    className={`mention-dropdown-item ${isFocused ? "focused" : ""}`}
                    onClick={() => handleMentionSelect(user)}
                  >
                    <div className="d-flex align-items-center">
                      <div className="comment-avatar me-2">{userName.charAt(0)}</div>
                      <div className="fw-bold">{userName}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="d-flex mt-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isLoggedIn || isSubmitting || !content.trim()}
          >
            {isSubmitting ? "등록 중..." : "댓글 등록"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CommentForm
