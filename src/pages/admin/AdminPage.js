"use client"
import axios from "axios"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import ReportManagement from "./ReportManagementPage" // 신고내역관리 컴포넌트 import
import UserManagementPage from "./UserManagementPage" // 사용자 관리 컴포넌트 import
import "./AdminPage.css"

function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("dashboard")

  const isAdmin = true 

  const handleMenuClick = (tab) => {
    setActiveTab(tab)
  }

  return (
    <>
      <Navbar isLoggedIn={true} />
      <div className="container mt-4 mb-5">
        <div className="row">
          <div className="col-md-3">
            <div className="list-group mb-4">
              <div className="list-group-item active">관리자 메뉴</div>
              <Link 
                to="#" 
                className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === "dashboard" ? "active" : ""}`} 
                onClick={() => handleMenuClick("dashboard")}
              >
                <i className="bi bi-speedometer2 me-2"></i>대시보드
              </Link>
              <Link 
                to="#" 
                className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === "reports" ? "active" : ""}`} 
                onClick={() => handleMenuClick("reports")}
              >
                <i className="bi bi-shield-exclamation me-2"></i>신고내역 관리
              </Link>
              <Link 
                to="#" 
                className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === "users" ? "active" : ""}`} 
                onClick={() => handleMenuClick("users")}
              >
                <i className="bi bi-people me-2"></i>사용자 관리
              </Link>
            </div>
          </div>
          
          <div className="col-md-9">
            {activeTab === "dashboard" && <AdminDashboard onNavigate={handleMenuClick} />}
            {activeTab === "reports" && <ReportManagement />}
            {activeTab === "users" && <UserManagementPage />}
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
          params: { page: 1, size: 1 }
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
      <h4 className="mb-4">관리자 대시보드</h4>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-shield-exclamation text-warning me-2"></i>
                신고 관리
              </h5>
              <p className="card-text">
                <span className="h3">{totalReports}</span>건의 신고
              </p>
              <button 
                className="btn btn-info btn-sm"
                onClick={() => onNavigate("reports")}
              >
                바로가기
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-people text-primary me-2"></i>
                사용자 관리
              </h5>
              <p className="card-text">
                <span className="h3">{totalUsers}</span>명의 사용자
              </p>
              <button 
                className="btn btn-info btn-sm"
                onClick={() => onNavigate("users")}
              >
                바로가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage