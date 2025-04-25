"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import "./ReportManagementPage.css"

function ReportManagementPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState("post") // post, comment, review
  const [processingAction, setProcessingAction] = useState(false)
  const [expandedReports, setExpandedReports] = useState({}) // 더보기 상태 관리
  const [isAdmin, setIsAdmin] = useState(true) // 실제 환경에서는 관리자 권한 체크 필요

  const navigate = useNavigate()

  // 신고 데이터 불러오기
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        // 실제 API 호출로 대체 필요
        // const response = await axios.get("http://localhost:9000/api/reports")

        // 임시 데이터
        const mockReports = [
          {
            id: 1,
            targetType: "POST",
            targetId: 101,
            reason: "영리 목적/홍보성",
            reporterId: 501,
            reporterName: "신고자1",
            reportedAt: "2023-11-15T09:30:00",
            status: "PENDING",
            targetContent:
              "강아지 사료 특가 판매합니다! 지금 바로 구매하세요. 프리미엄 사료를 최저가로 제공합니다. 무료 배송, 추가 할인 쿠폰 제공. 지금 바로 주문하세요!",
          },
          {
            id: 2,
            targetType: "COMMENT",
            targetId: 202,
            reason: "욕설/인신공격",
            reporterId: 502,
            reporterName: "신고자2",
            reportedAt: "2023-11-16T14:20:00",
            status: "APPROVED",
            targetContent: "이 글은 정말 ***같네요. 작성자는 ***인가요? 이런 글을 올리는 사람은 정말 양심이 없네요.",
          },
          {
            id: 3,
            targetType: "POST",
            targetId: 103,
            reason: "스팸",
            reporterId: 503,
            reporterName: "신고자3",
            reportedAt: "2023-11-17T11:45:00",
            status: "REJECTED",
            targetContent:
              "강아지 산책 서비스 홍보글입니다. 연락주세요. 저희 서비스는 최고의 전문가들이 제공합니다. 지금 바로 문의하세요!",
          },
          {
            id: 4,
            targetType: "COMMENT",
            targetId: 204,
            reason: "기타",
            reporterId: 504,
            reporterName: "신고자4",
            reportedAt: "2023-11-18T16:10:00",
            status: "PENDING",
            targetContent:
              "여기 좋은 정보가 있어요: http://suspicious-link.com 클릭하시면 좋은 정보를 얻을 수 있습니다!",
          },
          {
            id: 5,
            targetType: "POST",
            targetId: 105,
            reason: "욕설/인신공격",
            reporterId: 505,
            reporterName: "신고자5",
            reportedAt: "2023-11-19T08:50:00",
            status: "PENDING",
            targetContent:
              "특정 브랜드의 사료는 정말 품질이 나쁩니다. 절대 사용하지 마세요. 이 브랜드는 소비자를 속이고 있습니다.",
          },
          {
            id: 6,
            targetType: "REVIEW",
            targetId: 301,
            reason: "욕설/인신공격",
            reporterId: 506,
            reporterName: "신고자6",
            reportedAt: "2023-11-20T10:15:00",
            status: "PENDING",
            targetContent:
              "이 장소는 정말 최악이에요. 직원들이 불친절하고 시설도 더럽습니다. 다시는 가고 싶지 않은 곳입니다.",
          },
          {
            id: 7,
            targetType: "REVIEW",
            targetId: 302,
            reason: "영리 목적/홍보성",
            reporterId: 507,
            reporterName: "신고자7",
            reportedAt: "2023-11-21T13:40:00",
            status: "APPROVED",
            targetContent: "이 병원에서 치료받았는데 전혀 효과가 없었어요. 돈만 버렸습니다. 다른 병원을 추천합니다.",
          },
          // 동일한 게시글에 대한 다른 사유의 신고 추가
          {
            id: 8,
            targetType: "POST",
            targetId: 101, // 이미 ID 1에서 신고된 동일한 게시글
            reason: "스팸", // 다른 사유로 신고됨
            reporterId: 508,
            reporterName: "신고자8",
            reportedAt: "2023-11-15T10:45:00",
            status: "PENDING",
            targetContent:
              "강아지 사료 특가 판매합니다! 지금 바로 구매하세요. 프리미엄 사료를 최저가로 제공합니다. 무료 배송, 추가 할인 쿠폰 제공. 지금 바로 주문하세요!",
          },
          {
            id: 9,
            targetType: "POST",
            targetId: 101, // 동일한 게시글 세 번째 신고
            reason: "기타", // 또 다른 사유
            reporterId: 509,
            reporterName: "신고자9",
            reportedAt: "2023-11-16T08:20:00",
            status: "PENDING",
            targetContent:
              "강아지 사료 특가 판매합니다! 지금 바로 구매하세요. 프리미엄 사료를 최저가로 제공합니다. 무료 배송, 추가 할인 쿠폰 제공. 지금 바로 주문하세요!",
          },
          // 긴 글 예시 추가
          {
            id: 10,
            targetType: "POST",
            targetId: 110,
            reason: "영리 목적/홍보성",
            reporterId: 510,
            reporterName: "신고자10",
            reportedAt: "2023-11-22T11:30:00",
            status: "PENDING",
            targetContent:
              "안녕하세요, 반려동물 용품 전문점 '멍냥이월드'입니다.\n\n저희 매장에서 11월 특별 할인 이벤트를 진행합니다. 모든 상품 20% 할인!\n\n1. 프리미엄 사료 - 국내외 유명 브랜드 사료를 최저가로 제공합니다.\n   - 로얄캐닌, 아카나, 오리젠, 내추럴발란스 등 다양한 브랜드 구비\n   - 연령별, 크기별, 건강 상태별 맞춤형 사료 제공\n   - 대용량 구매 시 추가 5% 할인\n\n2. 애견 의류 및 액세서리 - 겨울맞이 신상품 입고!\n   - 패딩, 코트, 스웨터 등 다양한 겨울 의류\n   - 목줄, 하네스, 리드줄 세트 특가 판매\n   - 귀여운 모자, 스카프, 신발 등 액세서리\n\n3. 장난감 및 훈련용품\n   - 내구성 강한 프리미엄 장난감\n   - 지능 개발 퍼즐 장난감\n   - 훈련용 클리커, 간식 파우치 등\n\n4. 위생용품\n   - 샴푸, 린스, 발톱깎이, 브러쉬 등\n   - 배변패드, 모래 등 생활필수품 대용량 할인\n\n5. 특별 이벤트\n   - 10만원 이상 구매 시 프리미엄 간식 증정\n   - 신규 회원 가입 시 5천원 적립금 제공\n   - 인스타그램 후기 작성 시 다음 구매 10% 추가 할인\n\n매장 위치: 서울시 강남구 반려동물로 123번길 45\n영업시간: 매일 10:00 - 20:00 (연중무휴)\n문의전화: 02-123-4567\n온라인 쇼핑몰: www.멍냥이월드.com\n\n지금 바로 방문하셔서 특별한 혜택을 누려보세요! 사랑하는 반려동물에게 최고의 제품만을 선사하세요. 감사합니다.",
          },
          // 욕설/인신공격 긴 글 예시
          {
            id: 11,
            targetType: "COMMENT",
            targetId: 205,
            reason: "욕설/인신공격",
            reporterId: 511,
            reporterName: "신고자11",
            reportedAt: "2023-11-23T09:15:00",
            status: "PENDING",
            targetContent:
              "이 글을 작성한 사람은 정말 ***이네요. 이런 글을 올리는 사람은 양심이 없는 것 같습니다. 게시판 분위기를 흐리는 행동은 자제해주세요. 관리자는 이런 사람 계정 정지시켜야 합니다. 이런 식으로 계속 글을 올리면 신고를 계속 할 겁니다. 다른 사람들도 이 사람 글은 무시하세요. 정말 보기 불편합니다. 이런 사람들 때문에 커뮤니티가 망가집니다. 제발 글 좀 제대로 쓰세요. 상식이 있으면 이런 글은 안 올립니다. 정말 화가 납니다. 다시는 이런 글 올리지 마세요.",
          },
        ]

        setReports(mockReports)
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

  // 관리자 권한 체크
  useEffect(() => {
    // 실제 환경에서는 관리자 권한 체크 로직 필요
    const checkAdminPermission = () => {
      // const isAdmin = localStorage.getItem("userRole") === "ADMIN"
      const isAdmin = true // 임시로 항상 관리자로 설정

      if (!isAdmin) {
        alert("관리자만 접근할 수 있는 페이지입니다.")
        navigate("/")
      }

      setIsAdmin(isAdmin)
    }

    checkAdminPermission()
  }, [navigate])

  // 필터링된 신고 목록 - 타입만으로 필터링
  const filteredReports = reports.filter((report) => {
    return report.targetType.toLowerCase() === activeFilter.toLowerCase()
  })

  // 대기 중인 신고만 필터링
  const pendingReports = filteredReports.filter((report) => report.status === "PENDING")

  // 신고 유형별, 사유별 개수 계산
  const getReasonCountsByType = () => {
    const counts = {
      post: {},
      comment: {},
      review: {},
    }

    reports.forEach((report) => {
      const type = report.targetType.toLowerCase()
      if (counts[type]) {
        counts[type][report.reason] = (counts[type][report.reason] || 0) + 1
      }
    })

    return counts
  }

  // 특정 사유의 신고 개수 계산
  const getReasonCount = (reason) => {
    return reports.filter(
      (report) =>
        report.targetType.toLowerCase() === activeFilter.toLowerCase() &&
        report.reason === reason &&
        report.status === "PENDING",
    ).length
  }

  const reasonCountsByType = getReasonCountsByType()
  const currentTypeCounts = reasonCountsByType[activeFilter] || {}

  // 더보기/접기 토글
  const toggleExpand = (reportId) => {
    setExpandedReports((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }))
  }

  // 신고 처리 (승인/거부)
  const handleProcessReport = async (reportId, action) => {
    try {
      setProcessingAction(true)

      // 실제 API 호출로 대체 필요
      // await axios.put(`http://localhost:9000/api/reports/${reportId}`, { action })

      // 임시 처리 로직
      setTimeout(() => {
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === reportId ? { ...report, status: action === "approve" ? "APPROVED" : "REJECTED" } : report,
          ),
        )

        setProcessingAction(false)
      }, 500)
    } catch (err) {
      console.error("신고 처리 오류:", err)
      alert("신고 처리 중 오류가 발생했습니다.")
      setProcessingAction(false)
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    const hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const ampm = hours >= 12 ? "오후" : "오전"
    const displayHours = hours % 12 || 12

    return `${year}.${month}.${day}. ${ampm} ${displayHours}:${minutes}`
  }

  // 신고 유형 한글 표시
  const getTargetTypeText = (type) => {
    switch (type.toLowerCase()) {
      case "post":
        return "게시글"
      case "comment":
        return "댓글"
      case "review":
        return "후기"
      default:
        return type
    }
  }

  // 동일한 콘텐츠에 대한 신고 개수 계산
  const getSameContentReportCount = (report) => {
    return reports.filter(
      (r) => r.targetType === report.targetType && r.targetId === report.targetId && r.status === "PENDING",
    ).length
  }

  if (!isAdmin) {
    return null // 관리자가 아닌 경우 렌더링하지 않음
  }

  return (
    <>
      <Navbar isLoggedIn={true} />

      <div className="container mt-4 mb-5">
        <div className="report-management-container">
          <div className="report-header">
            <h2>신고 관리</h2>
            <p className="text-muted">사용자가 신고한 콘텐츠를 관리합니다.</p>
          </div>

          {/* 필터 영역 - 타입 필터만 남김 */}
          <div className="report-filters">
            <div className="filter-group">
              <label>신고 유형:</label>
              <div className="type-filter-buttons">
                <button
                  className={`filter-btn ${activeFilter === "post" ? "active" : ""}`}
                  onClick={() => setActiveFilter("post")}
                >
                  게시글
                </button>
                <button
                  className={`filter-btn ${activeFilter === "comment" ? "active" : ""}`}
                  onClick={() => setActiveFilter("comment")}
                >
                  댓글
                </button>
                <button
                  className={`filter-btn ${activeFilter === "review" ? "active" : ""}`}
                  onClick={() => setActiveFilter("review")}
                >
                  후기
                </button>
              </div>
            </div>
          </div>

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
            ) : pendingReports.length === 0 ? (
              <div className="no-reports">
                <i className="bi bi-exclamation-circle"></i>
                <p>처리할 신고 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="report-cards">
                {pendingReports.map((report) => (
                  <div key={report.id} className="report-card">
                    <div className="report-card-header">
                      <div className="report-reason">
                        <i className="bi bi-flag-fill"></i>
                        <span className="report-type-badge">{getTargetTypeText(report.targetType)}</span>
                      </div>
                      <div className="report-date">{formatDate(report.reportedAt)}</div>
                    </div>

                    <div className="report-card-body">
                      <div className="target-content">
                        <div className="report-reason-badge mb-2">
                          <span className="badge unified-badge">
                            {report.reason}
                            {getSameContentReportCount(report) > 1 && (
                              <span className="count-badge">({getSameContentReportCount(report)})</span>
                            )}
                          </span>
                        </div>
                        {expandedReports[report.id] ? (
                          <p className="full-content">{report.targetContent}</p>
                        ) : (
                          <p className="truncated-content">{report.targetContent}</p>
                        )}
                      </div>
                    </div>

                    <div className="report-card-footer">
                      <button className="btn-toggle-expand" onClick={() => toggleExpand(report.id)}>
                        {expandedReports[report.id] ? (
                          <>
                            <i className="bi bi-chevron-up"></i> 접기
                          </>
                        ) : (
                          <>
                            <i className="bi bi-chevron-down"></i> 더보기
                          </>
                        )}
                      </button>

                      <div className="action-buttons">
                        <button
                          className="btn-approve"
                          onClick={() => handleProcessReport(report.id, "approve")}
                          disabled={processingAction}
                        >
                          승인
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleProcessReport(report.id, "reject")}
                          disabled={processingAction}
                        >
                          거부
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default ReportManagementPage
