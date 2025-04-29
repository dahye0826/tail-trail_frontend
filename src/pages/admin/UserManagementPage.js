"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./UserManagementPage.css"

function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  // 사용자 데이터 불러오기 - 역할 필터링 없이 모든 사용자 표시
  const fetchUsers = async (page = 1, search = searchTerm) => {
    setIsLoading(true)
    try {
      const response = await axios.get("http://localhost:9000/api/users", {
        params: {
          page,
          search,
          // role 매개변수 제거 - 모든 사용자 표시
          size: 10,
        },
      })

      setUsers(response.data.user)
      setCurrentPage(response.data.currentPage)
      setTotalPages(response.data.totalPages)
      setTotalItems(response.data.totalItems)
      setError(null)
    } catch (err) {
      console.error("사용자 목록 로딩 오류:", err)
      setError("사용자 목록을 불러오는 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 페이지 로드 시 바로 모든 사용자 표시
  useEffect(() => {
    fetchUsers()
  }, [])

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchUsers(page)
  }

  // 검색 핸들러
  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers(1, searchTerm)
  }

  // 검색어 초기화
  const handleClearSearch = () => {
    setSearchTerm("")
    fetchUsers(1, "")
  }

  // 삭제 모달 열기
  const openDeleteModal = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  // 삭제 모달 닫기
  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  // 사용자 삭제 핸들러
  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await axios.delete(`http://localhost:9000/api/users/${userToDelete.userId}`)
      // 삭제 후 현재 페이지 다시 로드
      fetchUsers(currentPage, searchTerm)
      closeDeleteModal()
    } catch (err) {
      console.error("사용자 삭제 오류:", err)
      setError("사용자를 삭제하는 중 오류가 발생했습니다.")
      closeDeleteModal()
    }
  }

  // 반려동물 정보 포맷팅 함수 - 줄바꿈 적용
  const formatPetInfo = (user) => {
    if (!user.petName) return <span className="text-muted">정보 없음</span>

    const petInfo = `${user.petName} (${user.type} / ${user.breed})`
    return <span className="pet-info">{petInfo}</span>
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h4>사용자 관리</h4>
        <p>총 {totalItems}명의 사용자가 등록되어 있습니다.</p>
      </div>

      <div className="admin-section-body">
        {/* 검색 폼 - 역할 필터 제거 */}
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch} className="search-form">
              <div className="flex-grow-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="이름 또는 이메일로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-info">
                  <i className="bi bi-search me-1"></i> 검색
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={handleClearSearch}>
                  <i className="bi bi-x-circle me-1"></i> 초기화
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* 사용자 목록 테이블 */}
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive user-table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="col-id">ID</th>
                    <th className="col-profile">프로필</th>
                    <th className="col-name">이름</th>
                    <th className="col-email">이메일</th>
                    <th className="col-phone">연락처</th>
                    <th className="col-pet">반려동물</th>
                    <th className="col-date">가입일</th>
                    <th className="col-role">역할</th>
                    <th className="col-action">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        <div className="spinner-border text-secondary" role="status">
                          <span className="visually-hidden">로딩 중...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.userId}>
                        <td className="col-id">{user.userId}</td>
                        <td className="col-profile profile-cell">
                        <div className="profile-avatar">{user.userName.charAt(0)}</div>
                        </td>
                        <td className="col-name name-cell">{user.userName}</td>
                        <td className="col-email">{user.email}</td>
                        <td className="col-phone">{user.userPhone}</td>
                        <td className="col-pet">{formatPetInfo(user)}</td>
                        <td className="col-date">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="col-role">
                          <span className={`badge ${user.role === "admin" ? "bg-danger" : "badge-member"}`}>
                            {user.role === "admin" ? "관리자" : "일반회원"}
                          </span>
                        </td>
                        <td className="col-action action-cell">
                          <button
                            className="btn btn-sm btn-withdraw"
                            onClick={() => openDeleteModal(user)}
                            disabled={user.role === "admin"}
                            style={{ minWidth: "80px" }}
                          >
                            탈퇴
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <nav aria-label="Page navigation" className="mt-4 mb-2">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  {[...Array(totalPages).keys()].map((page) => (
                    <li key={page + 1} className={`page-item ${currentPage === page + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => handlePageChange(page + 1)}>
                        {page + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* 사용자 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                  사용자 탈퇴 확인
                </h5>
                <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
              </div>
              <div className="modal-body">
                <p style={{ color: "#333333" }}>
                  <strong>{userToDelete?.userName}</strong> 사용자를 탈퇴처리 하시겠습니까?
                </p>
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>이 작업은 되돌릴 수 없으며, 해당 사용자의 모든
                  데이터가 삭제됩니다.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeDeleteModal}
                  style={{ backgroundColor: "#95a1ad", color: "white" }}
                >
                  <i className="bi bi-x-circle me-1"></i> 취소
                </button>
                <button type="button" className="btn btn-withdraw-modal" onClick={handleDeleteUser}>
                  <i className="bi bi-trash me-1"></i> 탈퇴처리
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && <div className="modal-backdrop fade show"></div>}
    </div>
  )
}

export default UserManagementPage
