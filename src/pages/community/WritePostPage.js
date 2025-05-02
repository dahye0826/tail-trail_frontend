"use client"

// 필요한 라이브러리 및 컴포넌트 import
import axios from "axios"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./WritePostPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

function WritePostPage() {
  // 게시글 제목, 내용, 이미지 등 상태 관리
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  // 장소 검색어 관련 상태
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1)

  // 검색 결과 DOM 참조용 ref
  const searchResultsRef = useRef(null)
  const selectedItemRef = useRef(null)

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const userName = localStorage.getItem("userName")

    if (userId && userName) {
      setIsLoggedIn(true)
      console.log("현재 로그인 사용자:", userName)
    } else {
      setIsLoggedIn(false)
      console.log("비로그인 상태")
    }
  }, [])
  const navigate = useNavigate()

  // 선택된 결과 항목이 보이도록 자동 스크롤 처리
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: "smooth", // 부드럽게 이동
        block: "nearest", // 가장 가까운 위치에 맞춰줌
      })
    }
  }, [selectedResultIndex])

  // 이미지 선택 시 상태 업데이트
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length > 0) {
      setImages((prevImages) => [...prevImages, ...selectedFiles])
    }
  }

  // 이미지 제거 함수
  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index))
  }

  
  const searchPlaces = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const response = await axios.get(
        `http://localhost:9000/api/places/search?keyword=${encodeURIComponent(searchTerm)}`,
      )
      setSearchResults(response.data)
      setSelectedResultIndex(-1)
    } catch (error) {
      console.error("장소 검색 실패:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // 입력창 변경 시 검색 자동 수행
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    if (e.target.value.trim()) {
      searchPlaces()
    } else {
      setSearchResults([])
    }
  }

  const handleKeyDown = (e) => {
    if (searchResults.length === 0) return
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedResultIndex((prev) => (prev <= 0 ? searchResults.length - 1 : prev - 1))
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedResultIndex((prev) => (prev >= searchResults.length - 1 ? 0 : prev + 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedResultIndex >= 0 && selectedResultIndex < searchResults.length) {
        handlePlaceSelect(searchResults[selectedResultIndex])
      } else if (searchTerm.trim()) {
        searchPlaces()
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      setSearchResults([])
    }
  }

  const handlePlaceSelect = (place) => {
    setSelectedLocation({
      id: place.placeId,
      name: place.placeName,
      address: place.roadAddress,
    })
    setSearchResults([])
    setSearchTerm("")
    setSelectedResultIndex(-1)
  }

  // 선택된 장소 제거
  const removeSelectedLocation = () => {
    setSelectedLocation(null)
  }

  // 게시글 등록 제출 함수
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용은 필수입니다.")
      return
    }
    const userId = localStorage.getItem("userId")

    const formData = new FormData()
    formData.append("postTitle", title)
    formData.append("postContent", content)
    formData.append("userId", userId)
    images.forEach((image) => {
      formData.append("postImages", image)
    })
    if (selectedLocation && selectedLocation.id) {
      formData.append("placeId", selectedLocation.id)
    }

    try {
      setIsSubmitting(true)
      const response = await axios.post("http://localhost:9000/api/community", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      console.log("글쓰기 성공", response.data)
      navigate("/community")
    } catch (err) {
      console.log("글쓰기 오류", err)
      alert("게시글 등록에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 렌더링 UI
  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="container mt-4 post-write-container">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow-sm post-card">
              <div className="card-header bg-white post-card-header">
                <h2 className="text-center mb-0">추억 적기</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* 제목 입력창 */}
                  <div className="mb-3">
                    <label htmlFor="posttitle" className="form-label post-form-label">
                      제목
                    </label>
                    <input
                      type="text"
                      className="form-control post-form-control"
                      id="posttitle"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="제목을 입력하세요"
                      required
                      style={{ borderColor: "var(--primary-color)" }}
                    />
                  </div>

                  {/* 장소 자동완성 입력 및 선택 */}
                  <div className="mb-4">
                    <label className="form-label post-form-label">장소 (선택사항)</label>

                    {selectedLocation && (
                      <div className="post-location-card mb-2">
                        <div className="card">
                          <div className="card-body py-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1">{selectedLocation.name}</h6>
                                <p className="text-muted small mb-0">{selectedLocation.address}</p>
                              </div>
                              <button
                                type="button"
                                className="btn-close"
                                onClick={removeSelectedLocation}
                                aria-label="장소 선택 취소"
                              ></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control post-form-control"
                        placeholder="장소를 검색하세요"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        style={{ borderColor: "var(--primary-color)" }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={searchPlaces}
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            검색 중...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-search me-1"></i>검색
                          </>
                        )}
                      </button>
                    </div>

                    {/* 검색 결과 리스트 */}
                    {searchResults.length > 0 && (
                      <div className="post-search-results-container mb-3">
                        <div className="post-search-results-header">
                          <small className="text-muted">검색 결과 ({searchResults.length})</small>
                        </div>
                        <div className="list-group post-search-results-scrollable" ref={searchResultsRef}>
                          {searchResults.map((place, index) => (
                            <button
                              key={place.placeId}
                              type="button"
                              className={`list-group-item list-group-item-action ${selectedResultIndex === index ? "active" : ""}`}
                              onClick={() => handlePlaceSelect(place)}
                              onMouseEnter={() => setSelectedResultIndex(index)}
                              ref={selectedResultIndex === index ? selectedItemRef : null}
                            >
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">{place.placeName}</h6>
                              </div>
                              <p className="mb-1 small text-muted">{place.roadAddress}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 내용 입력 */}
                  <div className="mb-3">
                    <label htmlFor="postContent" className="form-label post-form-label">
                      내용
                    </label>
                    <textarea
                      className="form-control post-form-control"
                      id="postContent"
                      rows="15"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="내용을 입력하세요"
                      required
                    ></textarea>
                  </div>

                  {/* 이미지 업로드 */}
                  <div className="mb-3">
                    <label htmlFor="postImages" className="form-label post-form-label">
                      이미지 첨부 (선택사항)
                    </label>
                    <input
                      type="file"
                      className="form-control post-file-input"
                      id="postImages"
                      accept="image/*"
                      onChange={handleImageChange}
                      multiple
                    />
                  </div>

                  {/* 이미지 미리보기 */}
                  
                  {images.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label post-form-label">선택한 이미지</label>
                      <div className="d-flex flex-wrap gap-2">
                        {images.map((image, index) => (
                          <div key={index} className="position-relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`preview-${index}`}
                              width="100"
                              height="100"
                              className="preview-image"
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 remove-image-btn"
                              onClick={() => handleRemoveImage(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 등록 / 취소 버튼 */}
                  <div className="d-flex justify-content-between mt-4 post-button-group">
                    <button
                      type="button"
                      className="btn btn-outline-secondary post-cancel-btn"
                      onClick={() => navigate("/community")}
                    >
                      취소
                    </button>
                    <button type="submit" className="btn btn-primary post-submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          등록 중...
                        </>
                      ) : (
                        "게시글 등록"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default WritePostPage
