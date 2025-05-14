import axios from "axios"
import { useState, useEffect } from "react"
import "./ReportManagementPage.css"


function ReportManagement() {

  const [reports, setReports] = useState([]) // 전체 신고 데이터
  const [loading, setLoading] = useState(true) // 로딩 상태
  const [error, setError] = useState(null) // 에러 상태
  const [groupedReports, setGroupedReports] = useState([]) // 그룹화된 신고 데이터

  // 모달 관련 상태
  const [showModal, setShowModal] = useState(false) // 모달 표시 여부
  const [selectedReport, setSelectedReport] = useState(null) // 선택된 신고
  const [contentLoading, setContentLoading] = useState(false) // 콘텐츠 로딩 상태
  const [contentData, setContentData] = useState(null) // 상세 콘텐츠 데이터

  // 컴포넌트 마운트 시 신고 데이터 로드
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:9000/api/report")
        setReports(response.data)

        const grouped = groupReportsByContent(response.data)
        setGroupedReports(grouped)

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

  // 신고 데이터를 콘텐츠별로 그룹화하는 함수
  const groupReportsByContent = (reports) => {
    const groupedMap = {}

    reports.forEach((report) => {
      const contentKey = `${report.targetType}-${report.targetId}`

      if (!groupedMap[contentKey]) {
        groupedMap[contentKey] = {
          targetType: report.targetType,
          targetId: report.targetId,
          reports: [],
          reasonCounts: {}, 
          createdAt: report.createdAt, 
        }
      }
      groupedMap[contentKey].reports.push(report)

      const reason = report.reason
      if (!groupedMap[contentKey].reasonCounts) {
        groupedMap[contentKey].reasonCounts = {}
      }
      groupedMap[contentKey].reasonCounts[reason] = (groupedMap[contentKey].reasonCounts[reason] || 0) + 1

      if (new Date(report.createdAt) > new Date(groupedMap[contentKey].createdAt)) {
        groupedMap[contentKey].createdAt = report.createdAt
      }
    })

    return Object.values(groupedMap)
  }

  // 신고된 콘텐츠의 상세 정보를 가져오는 함수
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

        case "VISITEDPLACE":
          response = await axios.get(`http://localhost:9000/api/visited-place/${report.targetId}`)
          setContentData({
            note: response.data.note,
            rating: response.data.rating,
            author: response.data.userName,
            createdAt: response.data.createdAt,
            visitDate: response.data.visitDate,
          })
          break

        default:
          setContentData({ note: "지원되지 않는 콘텐츠 유형입니다." })
      }
    } catch (err) {
      console.error("콘텐츠 상세 정보 로딩 오류:", err)

      if (report.targetType === "COMMENT") {
        // 댓글이 없으면 별도 메시지 표시
        setContentData({
          error: "이미 삭제된 댓글입니다.",
        })
      } else if (report.targetType === "POST") {
        setContentData({
          error: "이미 삭제된 게시글입니다.",
        })
      } else if (report.targetType === "VISITEDPLACE") {
        setContentData({
          error: "이미 삭제된 방문 기록입니다.",
        })
      } else {
        setContentData({
          error: "콘텐츠를 불러오는데 실패했습니다.",
        })
      }
    } finally {
      setContentLoading(false)
    }
  }

  // 신고 상세보기 모달을 여는 핸들러
  const handleViewDetails = (groupedReport) => {
    setSelectedReport(groupedReport.reports[0])
    setShowModal(true)
    fetchContentDetails(groupedReport.reports[0])
  }

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedReport(null)
    setContentData(null)
  }

  // 신고 처리 (승인/거부) 핸들러
  const handleProcessReport = async (groupedReport, action) => {
    const targetType = groupedReport.targetType
    const targetId = groupedReport.targetId
    const typeText = getTargetTypeText(targetType)

    // 확인 대화상자 표시
    let confirmMessage = ""
    if (action === "approve") {
      confirmMessage = ` 이 ${typeText}을 삭제하겠습니까?`
    } else {
      // 삭제된 콘텐츠인 경우 메시지 다르게
      if (contentData?.error) {
        confirmMessage = `콘텐츠는 이미 삭제되었습니다. 신고만 목록에서 제거하시겠습니까?`
      } else {
        confirmMessage = `이 ${typeText}을 남기겠습니까?`
      }
    }

    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      if (action === "approve") {
        // 승인일 때 → 원본 콘텐츠 삭제
        try {
          switch (targetType) {
            case "POST":
              await axios.delete(`http://localhost:9000/api/community/${targetId}`)
              break
            case "COMMENT":
              await axios.delete(`http://localhost:9000/api/comments/${targetId}`)
              break
            case "VISITEDPLACE":
              await axios.delete(`http://localhost:9000/api/visited-place/${targetId}`)
              break
            default:
              console.warn("알 수 없는 콘텐츠 유형:", targetType)
          }
        } catch (deleteErr) {
          console.error("콘텐츠 삭제 오류:", deleteErr)
          alert("콘텐츠 삭제 중 오류가 발생했습니다. 이미 삭제된 콘텐츠일 수도 있습니다.")
          return
        }
      }

      const deletePromises = groupedReport.reports.map((report) =>
        axios.delete(`http://localhost:9000/api/report/${report.reportId}`),
      )

      await Promise.all(deletePromises)

      // 처리 후 목록에서 제거
      setGroupedReports((prevGrouped) =>
        prevGrouped.filter((group) => !(group.targetType === targetType && group.targetId === targetId)),
      )

      // 모달 닫기
      if (showModal) {
        handleCloseModal()
      }

      // 처리 결과 알림
      alert(action === "approve" ? "신고가 승인되어 해당 콘텐츠가 삭제되었습니다." : "신고가 거부되었습니다.")
    } catch (err) {
      console.error("신고 처리 오류:", err)
      alert("신고 처리 중 오류가 발생했습니다.")
    }
  }

  // 날짜 포맷팅 헬퍼 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  // 신고 유형을 한글로 변환하는 헬퍼 함수
  const getTargetTypeText = (type) => {
    switch (type) {
      case "POST":
        return "게시글"
      case "COMMENT":
        return "댓글"
      case "VISITEDPLACE":
        return "후기"
      default:
        return type
    }
  }

  // 콘텐츠 상세 정보를 렌더링하는 함수
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
            <span className="content-author">작성자: {contentData.author}</span>
            <span className="content-date">작성일: {formatDate(contentData.createdAt)}</span>
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
            <span className="content-author">작성자: {contentData.author}</span>
            <span className="content-date">작성일: {formatDate(contentData.createdAt)}</span>
          </div>
          <div className="content-body mt-3">
            <p>{contentData.content}</p>
          </div>
        </div>
      )
    } else if (selectedReport.targetType === "VISITEDPLACE") {
      return (
        <div className="content-details">
          <div className="content-meta">
            <div className="content-meta-item">
              <span className="content-author">작성자: {contentData.author}</span>
            </div>
            <div className="content-meta-item">
              <span className="content-date">작성일: {formatDate(contentData.createdAt)}</span>
            </div>
            <div className="content-meta-item">
              <span className="content-date">방문일: {formatDate(contentData.visitDate)}</span>
            </div>
            <div className="content-meta-item content-rating">
              <span>평점: </span>
              {[...Array(5)].map((_, i) => (
                <i key={i} className={`bi ${i < contentData.rating ? "bi-star-fill" : "bi-star"} text-warning`}></i>
              ))}
            </div>
          </div>
          <div className="content-body mt-3">
            <p>{contentData.note}</p>
          </div>
        </div>
      )
    }

    return <p>지원되지 않는 콘텐츠 유형입니다.</p>
  }

  // 인라인 스타일 정의
  const styles = {
    reasonItem: {
      display: "block",
      marginBottom: "4px",
      color: "#495057",
      fontSize: "14px",
    },
    reasonCount: {
      display: "inline-block",
      marginLeft: "5px",
      color: "#6c757d",
      fontWeight: "500",
    },
    totalReports: {
      display: "block",
      marginTop: "8px",
      fontSize: "13px",
      color: "#6c757d",
      fontStyle: "italic",
    },
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h4>신고 내역 관리</h4>
        <p>사용자가 신고한 콘텐츠를 검토하고 처리하세요</p>
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
          ) : groupedReports.length === 0 ? (
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
                  {groupedReports.map((groupedReport) => (
                    <tr key={`${groupedReport.targetType}-${groupedReport.targetId}`}>
                      <td>
                        <span className="badge bg-info">
                          {getTargetTypeText(groupedReport.targetType)} #{groupedReport.targetId}
                        </span>
                      </td>
                      <td>
                        {groupedReport.reasonCounts &&
                          Object.entries(groupedReport.reasonCounts).map(([reason, count], index) => (
                            <span key={index} style={styles.reasonItem}>
                              {reason}
                              <span style={styles.reasonCount}>({count})</span>
                            </span>
                          ))}
                        <span style={styles.totalReports}>총 {groupedReport.reports.length}건의 신고</span>
                      </td>
                      <td>{formatDate(groupedReport.createdAt)}</td>
                      <td>
                        <button className="report-btn-view" onClick={() => handleViewDetails(groupedReport)}>
                          <i className="bi bi-eye"></i>상세보기
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="report-btn-approve"
                            onClick={() => handleProcessReport(groupedReport, "approve")}
                          >
                            승인
                          </button>
                          <button
                            className="report-btn-reject"
                            onClick={() => handleProcessReport(groupedReport, "reject")}
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
        <div className="report-modal-backdrop">
          <div className="report-content-modal">
            <div className="report-modal-header">
              <h5 className="report-modal-title">
                <i className="bi bi-exclamation-triangle-fill me-2 text-warning"></i>
                {getTargetTypeText(selectedReport.targetType)} 상세 내용
              </h5>
              <button type="button" className="report-btn-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="report-modal-body">{renderContentDetails()}</div>
            <div className="report-modal-footer">
              <div className="report-action-buttons">
                <button
                  className="report-modal-btn-approve"
                  onClick={() => {
                    // 현재 보고 있는 콘텐츠의 그룹을 찾아서 처리
                    const currentGroup = groupedReports.find(
                      (group) =>
                        group.targetType === selectedReport.targetType && group.targetId === selectedReport.targetId,
                    )
                    if (currentGroup) {
                      handleProcessReport(currentGroup, "approve")
                    }
                  }}
                  disabled={!!contentData?.error} // 에러가 있으면 비활성화
                  style={
                    contentData?.error ? { backgroundColor: "#ccc", borderColor: "#ccc", cursor: "not-allowed" } : {}
                  }
                >
                  <i className="bi bi-check-circle-fill"></i>
                  승인 (콘텐츠 삭제)
                </button>

                <button
                  className="report-modal-btn-reject"
                  onClick={() => {
                    // 현재 보고 있는 콘텐츠의 그룹을 찾아서 처리
                    const currentGroup = groupedReports.find(
                      (group) =>
                        group.targetType === selectedReport.targetType && group.targetId === selectedReport.targetId,
                    )
                    if (currentGroup) {
                      handleProcessReport(currentGroup, "reject")
                    }
                  }}
                >
                  <i className="bi bi-x-circle-fill"></i>
                  {contentData?.error ? "목록에서 신고 제거" : "거부 (콘텐츠 유지)"}
                </button>
              </div>

              <button className="report-btn-secondary" onClick={handleCloseModal}>
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
