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

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        mentionListRef.current &&
        !mentionListRef.current.contains(event.target) &&
        textareaRef.current !== event.target
      ) {
        setShowMentionList(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // 텍스트 변경 감지 및 @ 처리
  const handleContentChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)

    // @ 문자 감지 및 멘션 처리
    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = newContent.substring(0, cursorPosition)
    const atIndex = textBeforeCursor.lastIndexOf("@")

    if (atIndex !== -1) {
      const lastSpaceBeforeAt = textBeforeCursor.substring(0, atIndex).lastIndexOf(" ")
      const isAtStartOrAfterSpace =
        atIndex === 0 || lastSpaceBeforeAt === atIndex - 1 || textBeforeCursor[atIndex - 1] === "\n"

      if (isAtStartOrAfterSpace) {
        const query = textBeforeCursor.substring(atIndex + 1)

        if (query.includes(" ") || query.includes("\n")) {
          setShowMentionList(false)
        } else {
          setMentionQuery(query)
          setMentionStartPos(atIndex)

          // 사용자 필터링 (commentUsers prop 사용)
          let filtered = []
          if (query) {
            filtered = commentUsers.filter((user) => {
              const userName = typeof user === "string" ? user : user.userName
              return userName.toLowerCase().includes(query.toLowerCase())
            })
          } else {
            filtered = commentUsers
          }

          setFilteredUsers(filtered.length > 0 ? filtered : commentUsers)
          setShowMentionList(commentUsers.length > 0)
        }
      } else {
        setShowMentionList(false)
      }
    } else {
      setShowMentionList(false)
    }
  }

  // 멘션 선택 처리
  const handleMentionSelect = (user) => {
    // user가 객체인지 문자열인지 확인
    const userName = typeof user === "string" ? user : user.userName

    const beforeMention = content.substring(0, mentionStartPos)
    const afterMention = content.substring(mentionStartPos + mentionQuery.length + 1)
    const newContent = `${beforeMention}@${userName} ${afterMention}`
    setContent(newContent)
    setShowMentionList(false)

    // 커서 위치 조정
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const cursorPosition = mentionStartPos + userName.length + 2 // @ + userName + space
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition)
      }
    }, 0)
  }
  const handleKeyDown = (e) => {
    if (showMentionList && filteredUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setFocusedIndex((prev) => (prev + 1) % filteredUsers.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setFocusedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length)
      } else if (e.key === "Enter") {
        const selectedUser = filteredUsers[focusedIndex]
        handleMentionSelect(selectedUser)
        e.preventDefault() // Enter로 줄 바꿈 방지
      }
    }
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

  // 텍스트 영역 클릭 처리
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
                // user가 객체인지 문자열인지 확인
                const userName = typeof user === "string" ? user : user.userName
                const userId = typeof user === "string" ? index : user.userId
                const isFocused = index === focusedIndex
                return (
                  <div key={userId}  className={`mention-dropdown-item ${isFocused ? "focused" : ""}`} onClick={() => handleMentionSelect(user)}>
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
          <button type="submit" className="btn btn-primary" disabled={!isLoggedIn || isSubmitting || !content.trim()}>
            {isSubmitting ? "등록 중..." : "댓글 등록"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CommentForm
