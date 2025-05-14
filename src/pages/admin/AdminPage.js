import axios from "axios"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { useAuth } from "../../contexts/AuthContext" 
import ReportManagement from "./ReportManagementPage"
import UserManagementPage from "./UserManagementPage" 
import "./AdminPage.css"

function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("dashboard")
  const { user, loading } = useAuth() 
 
  useEffect(() => {
    if (loading) return
    if (!user || user.role?.toLowerCase() !== "admin") {
      navigate("/") 
    }
  }, [user, loading, navigate])

  if (loading) return <div>로딩 중...</div>

  const handleMenuClick = (tab) => {
    setActiveTab(tab)
  }

  return (
    <>
      <Navbar isLoggedIn={true} />
      <div className="admin-container py-4">
        <div className="container mt-4 mb-5">
          <div className="row">
            <div className="col-md-3">
              <div className="admin-sidebar mb-4">
                <div className="list-group-item">관리자 메뉴</div>
                <Link
                  to="#"
                  className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === "dashboard" ? "active" : ""}`}
                  onClick={() => handleMenuClick("dashboard")}
                >
                  <i className="bi bi-speedometer2"></i>대시보드
                </Link>
                <Link
                  to="#"
                  className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === "reports" ? "active" : ""}`}
                  onClick={() => handleMenuClick("reports")}
                >
                  <i className="bi bi-shield-exclamation"></i>신고내역 관리
                </Link>
                <Link
                  to="#"
                  className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === "users" ? "active" : ""}`}
                  onClick={() => handleMenuClick("users")}
                >
                  <i className="bi bi-people"></i>사용자 관리
                </Link>
              </div>
            </div>

            <div className="col-md-9">
              <div className="card">
                <div className="card-body">
                  {activeTab === "dashboard" && <AdminDashboard onNavigate={handleMenuClick} />}
                  {activeTab === "reports" && <ReportManagement />}
                  {activeTab === "users" && <UserManagementPage />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

// 대시보드 컴포넌트
function AdminDashboard({ onNavigate }) {
  const [totalReports, setTotalReports] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    const fetchTotalReports = async () => {
      try {
        const response = await axios.get("http://localhost:9000/api/report/count")
        setTotalReports(response.data)
      } catch (error) {
        console.error("신고 수 로딩 오류:", error)
      }
    }

    const fetchTotalUsers = async () => {
      try {
        const response = await axios.get("http://localhost:9000/api/users", {
          params: { page: 1, size: 1 },
        })
        setTotalUsers(response.data.totalItems)
      } catch (error) {
        console.error("사용자 수 로딩 오류:", error)
      }
    }

    fetchTotalReports()
    fetchTotalUsers()
  }, [])

  return (
    <div>
      <div className="admin-section-header">
        <h4>관리자 대시보드</h4>
        <p>시스템 현황 및 주요 지표를 확인하세요</p>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-shield-exclamation text-warning"></i>
                신고 관리
              </h5>
              <p className="card-text">
                <span className="h3">{totalReports}</span>
                <span>건의 신고가 접수되었습니다</span>
              </p>
              <button className="btn btn-info" onClick={() => onNavigate("reports")}>
                <i className="bi bi-arrow-right me-1"></i> 바로가기
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-people text-primary"></i>
                사용자 관리
              </h5>
              <p className="card-text">
                <span className="h3">{totalUsers}</span>
                <span>명의 사용자가 등록되어 있습니다</span>
              </p>
              <button className="btn btn-info" onClick={() => onNavigate("users")}>
                <i className="bi bi-arrow-right me-1"></i> 바로가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage