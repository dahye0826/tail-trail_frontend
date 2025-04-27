"use client"
import axios from "axios"
import { useState, useEffect } from "react"
import "./ReportManagementPage.css"

function ReportManagement() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 모달 관련 상태
  const [showModal, setShowModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [contentLoading, setContentLoading] = useState(false)
  const [contentData, setContentData] = useState(null)

  // 신고 데이터 불러오기
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        // 실제 API 호출로 대체 필요
        const response = await axios.get("http://localhost:9000/api/report")
        setReports(response.data)
        setError(null)
      } catch (err) {
        console.error("신고 데이터 로딩 오류:", err)
        setError("신고 데이터를 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  // 신고된 콘텐츠 상세 정보 가져오기
  const fetchContentDetails = async (report) => {
    setContentLoading(true)
    setContentData(null)

    try {
      let response

      switch (report.targetType) {
        case "POST":
          response = await axios.get(`http://localhost:9000/api/community/${report.targetId}`)
          setContentData({
            title: response.data.title,
            content: response.data.content,
            author: response.data.userName,
            createdAt: response.data.createdAt,
            images: response.data.imageUrls || [],
          })
          break

        case "COMMENT":
          response = await axios.get(`http://localhost:9000/api/comments/${report.targetId}`)
          setContentData({
            content: response.data.content,
            author: response.data.userName,
            createdAt: response.data.createdAt,
          })
          break

        case "REVIEW":
          response = await axios.get(`http://localhost:9000/api/reviews/${report.targetId}`)
          setContentData({
            content: response.data.reviewContent,
            rating: response.data.rating,
            author: response.data.memberName,
            createdAt: response.data.createdAt,
          })
          break

        default:
          setContentData({ content: "지원되지 않는 콘텐츠 유형입니다." })
      }
    } catch (err) {
      console.error("콘텐츠 상세 정보 로딩 오류:", err)
      setContentData({ error: "콘텐츠를 불러오는데 실패했습니다." })
    } finally {
      setContentLoading(false)
    }
  }

  // 상세보기 버튼 클릭 핸들러
  const handleViewDetails = (report) => {
    setSelectedReport(report)
    setShowModal(true)
    fetchContentDetails(report)
  }

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedReport(null)
    setContentData(null)
  }

  // 신고 처리 (승인/거부)
  const handleProcessReport = async (reportId, action, targetType, targetId) => {
    // 확인 대화상자 표시
    let confirmMessage = ""
    if (action === "approve") {
      confirmMessage = "정말로 이 게시물을 삭제하겠습니까?"
    } else {
      confirmMessage = "정말로 이 게시물을 남기겠습니까?"
    }

    // 사용자가 취소하면 함수 종료
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      // 실제 API 호출로 대체 필요
      await axios.put(`http://localhost:9000/api/report/${reportId}`, {
        status: action === "approve" ? "APPROVED" : "REJECTED",
      })

      // 승인 시 해당 콘텐츠 삭제 API 호출
      if (action === "approve") {
        try {
          // 콘텐츠 유형에 따라 다른 API 엔드포인트 호출
          switch (targetType) {
            case "POST":
              await axios.delete(`http://localhost:9000/api/community/${targetId}`)
              break
            case "COMMENT":
              await axios.delete(`http://localhost:9000/api/comments/${targetId}`)
              break
            case "VISTEDPLACE":
              await axios.delete(`http://localhost:9000/api/visited-place/${targetId}`)
              break
            default:
              console.warn("알 수 없는 콘텐츠 유형:", targetType)
          }
        } catch (deleteErr) {
          console.error("콘텐츠 삭제 오류:", deleteErr)
          alert("콘텐츠 삭제 중 오류가 발생했습니다.")
          return // 삭제 실패 시 함수 종료
        }
      }

      // 처리 후 목록에서 제거
      setReports((prevReports) => prevReports.filter((report) => report.reportId !== reportId))

      // 모달이 열려있었다면 닫기
      if (showModal && selectedReport && selectedReport.reportId === reportId) {
        handleCloseModal()
      }

      // 처리 결과 알림
      alert(action === "approve" ? "신고가 승인되어 해당 콘텐츠가 삭제되었습니다." : "신고가 거부되었습니다.")
    } catch (err) {
      console.error("신고 처리 오류:", err)
      alert("신고 처리 중 오류가 발생했습니다.")
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  // 신고 유형 한글 표시
  const getTargetTypeText = (type) => {
    switch (type) {
      case "POST":
        return "게시글"
      case "COMMENT":
        return "댓글"
      case "VISTEDPLACE":
        return "후기"
      default:
        return type
    }
  }

  // 콘텐츠 렌더링 함수
  const renderContentDetails = () => {
    if (contentLoading) {
      return (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">콘텐츠를 불러오는 중...</p>
        </div>
      )
    }

    if (!contentData) {
      return <p>콘텐츠 정보가 없습니다.</p>
    }

    if (contentData.error) {
      return <div className="alert alert-danger">{contentData.error}</div>
    }

    // 콘텐츠 유형에 따라 다른 렌더링
    if (selectedReport.targetType === "POST") {
      return (
        <div className="content-details">
          <h4 className="content-title">{contentData.title}</h4>
          <div className="content-meta">
            <span className="content-author">{contentData.author}</span>
            <span className="content-date">{formatDate(contentData.createdAt)}</span>
          </div>
          <div className="content-body mt-3">
            <p>{contentData.content}</p>
          </div>
          {contentData.images && contentData.images.length > 0 && (
            <div className="content-images mt-3">
              {contentData.images.map((image, index) => (
                <img
                  key={index}
                  src={image.startsWith("http") ? image : `http://localhost:9000${image}`}
                  alt={`게시글 이미지 ${index + 1}`}
                  className="content-image"
                />
              ))}
            </div>
          )}
        </div>
      )
    } else if (selectedReport.targetType === "COMMENT") {
      return (
        <div className="content-details">
          <div className="content-meta">
            <span className="content-author">{contentData.author}</span>
            <span className="content-date">{formatDate(contentData.createdAt)}</span>
          </div>
          <div className="content-body mt-3">
            <p>{contentData.content}</p>
          </div>
        </div>
      )
    } else if (selectedReport.targetType === "VISTEDPLACE") {
      return (
        <div className="content-details">
          <div className="content-meta">
            <span className="content-author">{contentData.author}</span>
            <span className="content-date">{formatDate(contentData.createdAt)}</span>
            <div className="content-rating">
              {[...Array(5)].map((_, i) => (
                <i key={i} className={`bi ${i < contentData.rating ? "bi-star-fill" : "bi-star"} text-warning`}></i>
              ))}
            </div>
          </div>
          <div className="content-body mt-3">
            <p>{contentData.content}</p>
          </div>
        </div>
      )
    }

    return <p>지원되지 않는 콘텐츠 유형입니다.</p>
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>신고 내역 관리</h2>
      </div>

      <div className="admin-section-body">
        {/* 신고 목록 */}
        <div className="report-list-container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">신고 데이터를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : reports.length === 0 ? (
            <div className="no-reports">
              <i className="bi bi-check-circle"></i>
              <p>처리할 신고 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="report-table">
              <table className="table">
                <thead>
                  <tr>
                    <th>유형</th>
                    <th>신고사유</th>
                    <th>신고일</th>
                    <th>상세보기</th>
                    <th>처리</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.reportId}>
                      <td>
                        {getTargetTypeText(report.targetType)} #{report.targetId}
                      </td>
                      <td>
                        <span className="report-reason">{report.reason}</span>
                      </td>
                      <td>{formatDate(report.createdAt)}</td>
                      <td>
                        <button className="btn-view" onClick={() => handleViewDetails(report)} title="상세보기">
                          <i className="bi bi-eye"></i>상세보기
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-approve"
                            onClick={() =>
                              handleProcessReport(report.reportId, "approve", report.targetType, report.targetId)
                            }
                          >
                            승인
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() =>
                              handleProcessReport(report.reportId, "reject", report.targetType, report.targetId)
                            }
                          >
                            거부
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 콘텐츠 상세 모달 */}
      {showModal && selectedReport && (
        <div className="modal-backdrop">
          <div className="content-modal">
            <div className="modal-header">
              <h5 className="modal-title">{getTargetTypeText(selectedReport.targetType)} 상세 내용</h5>
              <button type="button" className="btn-close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body">{renderContentDetails()}</div>
            <div className="modal-footer">
              <div className="action-buttons">
                <button
                  className="btn-approve"
                  onClick={() =>
                    handleProcessReport(
                      selectedReport.reportId,
                      "approve",
                      selectedReport.targetType,
                      selectedReport.targetId,
                    )
                  }
                >
                  승인 (콘텐츠 삭제)
                </button>
                <button
                  className="btn-reject"
                  onClick={() =>
                    handleProcessReport(
                      selectedReport.reportId,
                      "reject",
                      selectedReport.targetType,
                      selectedReport.targetId,
                    )
                  }
                >
                  거부 (콘텐츠 유지)
                </button>
              </div>
              <button className="btn-secondary" onClick={handleCloseModal}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportManagement
