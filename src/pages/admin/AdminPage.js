"use client"
import axios from "axios"
import { useState,useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import ReportManagement from "./ReportManagementPage" // 신고내역관리 컴포넌트 import
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
        <div className="admin-page-container">
          {/* 좌측 사이드바 */}
          <div className="admin-sidebar">
            <h3 className="admin-title">관리자 메뉴</h3>
            <div className="admin-menu-list">
              <div
                className={`admin-menu-item ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => handleMenuClick("dashboard")}
              >
                <i className="bi bi-speedometer2"></i>
                <span>대시보드</span>
              </div>
              <div
                className={`admin-menu-item ${activeTab === "reports" ? "active" : ""}`}
                onClick={() => handleMenuClick("reports")}
              >
                <i className="bi bi-shield-exclamation"></i>
                <span>신고내역 관리</span>
              </div>
              <div
                className={`admin-menu-item ${activeTab === "users" ? "active" : ""}`}
                onClick={() => handleMenuClick("users")}
              >
                <i className="bi bi-people"></i>
                <span>사용자 관리</span>
              </div>
            </div>
          </div>

          {/* 우측 콘텐츠 */}
          <div className="admin-content">
            {activeTab === "dashboard" && <AdminDashboard onNavigate={handleMenuClick} />}
            {activeTab === "reports" && <ReportManagement />}
            {activeTab === "users" && <AdminUsers />}
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
 
  useEffect(() => {
    const fetchTotalReports = async () => {
      try {
        const response = await axios.get("http://localhost:9000/api/report/count")
        setTotalReports(response.data)
      } catch (error) {
        console.error("신고 수 로딩 오류:", error)
      }
    }

    fetchTotalReports()
  }, [])



  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>관리자 대시보드</h2>
      </div>

      <div className="admin-section-body">
        <div className="admin-card-grid">
          {/* 신고 관리 카��� */}
          <div className="admin-card" onClick={() => onNavigate("reports")}>
            <div className="admin-card-header">
              <i className="bi bi-shield-exclamation"></i>
              <h3>신고 관리</h3>
            </div>
            <div className="admin-card-body">
              <div className="admin-stat-row">
                <div className="admin-stat">
                  <span className="admin-stat-value">{totalReports}</span>
                  <span className="admin-stat-label">전체 신고</span>
                </div>
              </div>
            </div>
            <div className="admin-card-footer">
              <button className="btn btn-primary btn-sm">바로가기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 사용자 관리 컴포넌트 (임시)
function AdminUsers() {
  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>사용자 관리</h2>
      </div>
      <div className="admin-section-body">
        <div className="admin-placeholder">
          <i className="bi bi-people"></i>
          <p>사용자 관리 기능은 준비 중입니다.</p>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
