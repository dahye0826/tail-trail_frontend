// 게시글 수정 페이지
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { useEffect, useState, useRef } from "react"
import axios from "axios"


function EditPostPage() {
  const { id } = useParams() // URL 파라미터에서 게시글 ID 추출
  const navigate = useNavigate()

  // 게시글 상태 값들
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState([]) // 새로 추가된 이미지
  const [existingImages, setExistingImages] = useState([]) // 기존 이미지
  const [selectedLocation, setSelectedLocation] = useState(null) // 선택된 장소 정보
  const [loading, setLoading] = useState(true) // 로딩 상태
  const [searchTerm, setSearchTerm] = useState("") // 장소 검색어
  const [searchResults, setSearchResults] = useState([]) // 검색 결과 리스트
  const [isSearching, setIsSearching] = useState(false) // 검색 중 상태

  const [selectedResultIndex, setSelectedResultIndex] = useState(-1) // 키보드로 선택된 항목 인덱스

  // 검색 결과 리스트 DOM 참조용
  const searchResultsRef = useRef(null)
  const selectedItemRef = useRef(null)

  // 게시글 데이터 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:9000/api/community/${id}`)
        console.log("포스트 가져오기:", response.data)
        setTitle(response.data.title || "")
        setContent(response.data.content || "")
        setExistingImages(response.data.imageUrls || [])

        if (response.data.placeId && response.data.placeName) {
          setSelectedLocation({ id: response.data.placeId, name: response.data.placeName })
        }
        setLoading(false)
      } catch (err) {
        console.error("데이터 로딩 실패:", err)
        alert("게시글 데이터를 불러오는 데 실패했습니다.")
        navigate("/community")
      }
    }
    fetchPost()
  }, [id, navigate])

  // 선택된 결과가 키보드로 이동 시 화면에 보이도록 조정
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: "smooth", // 부드럽게 이동
        block: "nearest",   // 가장 가까운 위치에 맞춰줌
      })
    }
  }, [selectedResultIndex])

  // 장소 검색 요청
  const searchPlaces = async () => {
    if (!searchTerm.trim()) return setSearchResults([])
    setIsSearching(true)
    try {
      const response = await axios.get(`http://localhost:9000/api/places/search?keyword=${encodeURIComponent(searchTerm)}`)
      setSearchResults(response.data)
      setSelectedResultIndex(-1)
    } catch (error) {
      console.error("장소 검색 실패:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // 검색어 입력 처리
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    if (e.target.value.trim()) searchPlaces()
    else setSearchResults([])
  }

  // 키보드 입력 이벤트 (↑ ↓ Enter ESC)
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

  // 장소 선택 시 실행
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

  // 게시글 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용은 필수입니다.")
      return
    }

    const formData = new FormData()
    formData.append("postTitle", title)
    formData.append("postContent", content)
    if (selectedLocation && selectedLocation.id) {
      formData.append("placeId", selectedLocation.id)
    }
    formData.append("remainImages", JSON.stringify(Array.isArray(existingImages) ? existingImages : []))
    images.forEach((image) => formData.append("postImages", image))

    try {
      const { data } = await axios.post(`http://localhost:9000/api/community/${id}/update`, formData)
      console.log(data)
      alert("수정 완료")
      navigate(`/community/post/${id}`)
    } catch (err) {
      alert("에러발생")
      console.log("에러 발생:", err)
    }
  }

  // 기존 이미지 삭제
  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  // 새 이미지 추가
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length > 0) {
      setImages((prevImages) => [...prevImages, ...selectedFiles])
    }
  }

  // 새 이미지 삭제
  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index))
  }

  // 장소 선택 제거
  const removeSelectedLocation = () => {
    setSelectedLocation(null)
  }

  if (loading) {
    return (
      <>
        <Navbar isLoggedIn={true} />
        <div className="container mt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar isLoggedIn={true} />

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
                    <label htmlFor="postTitle" className="form-label">
                      제목
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="postTitle"
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
                        placeholder="장소를 검색하세요"
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

                    {/* 검색 결과 표시 - 스크롤 가능한 컨테이너로 변경 */}
                    {searchResults.length > 0 && (
                      <div className="search-results-container mb-3">
                        <div className="search-results-header">
                          <small className="text-muted">검색 결과 ({searchResults.length})</small>
                        </div>
                        <div className="list-group search-results-scrollable" ref={searchResultsRef}>
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
                      이미지 추가 (선택사항)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="postImages"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                  </div>

                  {/* 기존 이미지 표시 - 배열 체크 추가 */}
                  {Array.isArray(existingImages) && existingImages.length > 0 && (
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-2">
                        {existingImages.map((imageUrl, index) => (
                          <div key={index} className="position-relative">
                            <img
                              src={imageUrl.startsWith("http") ? imageUrl : `http://localhost:9000${imageUrl}`}
                              alt={`기존 이미지 ${index}`}
                              width="100"
                              height="100"
                              className="preview-image"
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 remove-image-btn"
                              onClick={() => handleRemoveExistingImage(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 새로 추가한 이미지 표시 */}
                  {images.length > 0 && (
                    <div className="mb-3">
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
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/community/post/${id}`)}
                    >
                      취소
                    </button>
                    <button type="submit" className="btn btn-primary">
                      게시글 수정
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

export default EditPostPage
