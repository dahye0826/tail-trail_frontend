"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./WritePostPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

function WritePostPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [allPlaces, setAllPlaces] = useState([])
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  // 컴포넌트 마운트 시 모든 장소 데이터 가져오기
  useEffect(() => {
    const fetchAllPlaces = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:9000/api/places")
        setAllPlaces(response.data)
        setLoading(false)
      } catch (error) {
        console.error("장소 데이터 불러오기 오류:", error)
        setLoading(false)
      }
    }

    fetchAllPlaces()
  }, [])

  //이미지 선택
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length > 0) {
      setImages((prevImages) => [...prevImages, ...selectedFiles])
    }
  }

  // 이미지 제거 함수 수정
  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index))
  }

  // 장소 검색 함수
  const searchPlaces = () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    // 데이터베이스에서 가져온 장소 중 검색어와 일치하는 장소 필터링
    const filteredPlaces = allPlaces.filter(
      (place) =>
        place.placeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (place.roadAddress && place.roadAddress.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    setSearchResults(filteredPlaces)
    setIsSearching(false)
  }

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    // 검색어가 변경될 때마다 검색 실행
    if (e.target.value.trim()) {
      searchPlaces()
    } else {
      setSearchResults([])
    }
  }

  // 엔터키 검색 핸들러
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      searchPlaces()
    }
  }

  // 장소 선택 핸들러
  const handlePlaceSelect = (place) => {
    setSelectedLocation({
      id: place.placeId,
      name: place.placeName,
      address: place.roadAddress,
    })
    setSearchResults([])
    setSearchTerm("")
  }

  // 선택한 장소 제거
  const removeSelectedLocation = () => {
    setSelectedLocation(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      //앞뒤 공백 제거했을때 없으면 alert
      alert("제목과 내용은 필수입니다.")
      return
    }

    const formData = new FormData()

    formData.append("postTitle", title)
    formData.append("postContent", content)
    images.forEach((image) => {
      formData.append("postImages", image)
    })

    // 선택된 위치 정보 추가 - 간소화된 버전
    if (selectedLocation && selectedLocation.id) {
      formData.append("placeId", selectedLocation.id)
    }

    for (const pair of formData.entries()) {
      console.log("[FormData]", pair[0], pair[1])
    }

    try {
      setIsSubmitting(true)
      const response = await axios.post("http://localhost:9000/api/community", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      console.log("글쓰기 보내기 완료", response.data)
      navigate("/community")
    } catch (err) {
      console.log("오류", err)
      alert("게시글 등록에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="container mt-4 write-post-container">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h2 className="text-center mb-0">추억 적기</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="posttitle" className="form-label">
                      제목
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="posttitle"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="제목을 입력하세요"
                      required
                    />
                  </div>

                  {/* 장소 선택 영역 - DB 검색 방식으로 변경 */}
                  <div className="mb-4">
                    <label className="form-label">장소 (선택사항)</label>

                    {/* 선택된 장소가 있으면 표시 */}
                    {selectedLocation && (
                      <div className="selected-location-card mb-2">
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

                    {/* 장소 검색 입력창 */}
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="장소 이름으로 검색..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
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
                            <i className="bi bi-search me-1"></i>
                            검색
                          </>
                        )}
                      </button>
                    </div>

                    {/* 검색 결과 표시 */}
                    {searchResults.length > 0 && (
                      <div className="search-results-container mb-3">
                        <div className="list-group">
                          {searchResults.map((place) => (
                            <button
                              key={place.placeId}
                              type="button"
                              className="list-group-item list-group-item-action"
                              onClick={() => handlePlaceSelect(place)}
                            >
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">{place.placeName}</h6>
                                {place.industrySub && <small className="text-muted">{place.industrySub}</small>}
                              </div>
                              <p className="mb-1 small">{place.roadAddress}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="postContent" className="form-label">
                      내용
                    </label>
                    <textarea
                      className="form-control"
                      id="postContent"
                      rows="15"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="내용을 입력하세요"
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="postImages" className="form-label">
                      이미지 첨부 (선택사항)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="postImages"
                      accept="image/*"
                      onChange={handleImageChange}
                      multiple
                    />
                  </div>

                  {images.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">선택된 이미지</label>
                      <div className="d-flex flex-wrap gap-2">
                        {images.map((image, index) => (
                          <div key={index} className="position-relative">
                            <img
                              src={URL.createObjectURL(image) || "/placeholder.svg"}
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

                  <div className="d-flex justify-content-between mt-4">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/community")}>
                      취소
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
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
