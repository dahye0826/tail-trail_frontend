import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./AdminPage.css";

const API_BASE_URL = "http://localhost:9000/api";

function PlacesManagementPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [industry, setIndustry] = useState("");
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "ADMIN") {
      navigate("/");
      return;
    }
    setIsAdmin(true);
    
    fetchCategories();
    fetchPlaces(currentPage);
  }, [currentPage, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/places/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPlaces = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/places`, {
        params: {
          page,
          search: searchTerm,
          industry,
          size: 10,
        },
      });
      setPlaces(response.data.places);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching places:", error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPlaces(1);
  };

  const handleDeletePlace = async (placeId) => {
    if (!window.confirm("이 장소를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/places/${placeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      // Refresh the list
      fetchPlaces(currentPage);
      alert("장소가 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting place:", error);
      alert("장소 삭제 중 오류가 발생했습니다.");
    }
  };

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Render pagination controls
  const renderPagination = () => {
    const pageNumbers = [];
    const maxPageDisplay = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPageDisplay / 2));
    let endPage = Math.min(totalPages, startPage + maxPageDisplay - 1);
    
    if (endPage - startPage + 1 < maxPageDisplay) {
      startPage = Math.max(1, endPage - maxPageDisplay + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination justify-content-center mt-4">
        <button 
          className="btn btn-sm btn-outline-secondary me-1" 
          onClick={() => changePage(1)}
          disabled={currentPage === 1}
        >
          <i className="bi bi-chevron-double-left"></i>
        </button>
        <button 
          className="btn btn-sm btn-outline-secondary me-1" 
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        
        {pageNumbers.map(number => (
          <button
            key={number}
            className={`btn btn-sm ${currentPage === number ? 'btn-primary' : 'btn-outline-secondary'} me-1`}
            onClick={() => changePage(number)}
          >
            {number}
          </button>
        ))}
        
        <button 
          className="btn btn-sm btn-outline-secondary me-1" 
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
        <button 
          className="btn btn-sm btn-outline-secondary" 
          onClick={() => changePage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <i className="bi bi-chevron-double-right"></i>
        </button>
      </div>
    );
  };

  return (
    <>
      <Navbar isLoggedIn={true} />
      <div className="container mt-4 mb-5">
        <div className="admin-page-container">
          <div className="admin-sidebar">
            <h3 className="admin-title">관리자 메뉴</h3>
            <div className="admin-menu-list">
              <div
                className="admin-menu-item"
                onClick={() => navigate("/admin")}
              >
                <i className="bi bi-speedometer2"></i>
                <span>대시보드</span>
              </div>
              <div
                className="admin-menu-item active"
              >
                <i className="bi bi-geo-alt"></i>
                <span>장소 관리</span>
              </div>
              <div
                className="admin-menu-item"
                onClick={() => navigate("/admin/users")}
              >
                <i className="bi bi-people"></i>
                <span>사용자 관리</span>
              </div>
            </div>
          </div>

          <div className="admin-content">
            <div className="admin-section">
              <div className="admin-section-header d-flex justify-content-between">
                <h2>장소 관리</h2>
                <Link to="/admin/places/add" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-1"></i> 새 장소 추가
                </Link>
              </div>

              <div className="admin-section-body">
                <div className="card mb-4">
                  <div className="card-body">
                    <form onSubmit={handleSearch} className="row g-3">
                      <div className="col-md-5">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="장소명 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <select
                          className="form-select"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                        >
                          <option value="">모든 카테고리</option>
                          {categories.map((category, index) => (
                            <option key={index} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <button type="submit" className="btn btn-primary w-100">
                          <i className="bi bi-search me-1"></i> 검색
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>ID</th>
                            <th>이미지</th>
                            <th>장소명</th>
                            <th>카테고리</th>
                            <th>주소</th>
                            <th>관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {places.length > 0 ? (
                            places.map((place) => (
                              <tr key={place.placeId}>
                                <td>{place.placeId}</td>
                                <td>
                                  <img
                                    src={place.placeImage ? `http://localhost:9000${place.placeImage}` : "/placeholder.svg"}
                                    alt={place.placeName}
                                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                    className="rounded"
                                  />
                                </td>
                                <td>{place.placeName}</td>
                                <td>{place.industryMain}</td>
                                <td>{place.fullAddress || `${place.city} ${place.district}`}</td>
                                <td>
                                  <div className="btn-group">
                                    <Link
                                      to={`/places/place/${place.placeId}`}
                                      className="btn btn-sm btn-outline-primary"
                                      title="보기"
                                    >
                                      <i className="bi bi-eye"></i>
                                    </Link>
                                    <Link
                                      to={`/admin/places/edit/${place.placeId}`}
                                      className="btn btn-sm btn-outline-success"
                                      title="수정"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </Link>
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleDeletePlace(place.placeId)}
                                      title="삭제"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center py-4">
                                장소가 없습니다.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {renderPagination()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PlacesManagementPage;