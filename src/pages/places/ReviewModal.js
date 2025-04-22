import { useState, useEffect } from "react"
import { useReview } from "../../hooks/useReview.js"
import "./ReviewModal.css"

function ReviewModal({ isOpen, onClose, onSubmit, userId, placeId, editingReview }) {
  const { submitReview } = useReview()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating || 0)
      setComment(editingReview.note || "")
    } else {
      setRating(0)
      setComment("")
    }
  }, [editingReview, isOpen])

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!comment.trim() || rating === 0) return
    try {
      setLoading(true)
      const updated = await submitReview({
        userId,
        placeId,
        rating,
        note: comment,
        visitId: editingReview?.visit_id,
      })
      onSubmit(updated)
      onClose()
    } catch (err) {
      console.error("후기 저장 실패:", err)
      alert("저장에 실패했어요.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
        <h5 className="modal-title mb-3">{editingReview ? "후기 수정" : "리뷰 등록"}</h5>

        <div className="stars mb-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <i
              key={n}
              className={`bi ${rating >= n ? "bi-star-fill" : "bi-star"} fs-4 text-warning`}
              onClick={() => setRating(n)}
              style={{ cursor: "pointer" }}
            ></i>
          ))}
        </div>

        <textarea
          className="form-control mb-3"
          rows="4"
          placeholder="후기를 남겨주세요."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          className="btn btn-primary w-100 mt-3"
          disabled={loading || !comment.trim() || rating === 0}
          onClick={handleSubmit}
        >
          {loading ? "저장 중..." : editingReview ? "수정 완료" : "등록하기"}
        </button>
      </div>
    </div>
  )
}

export default ReviewModal
