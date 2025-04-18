"use client"

import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { useEffect, useState } from "react"
import axios from "axios"

function EditPostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState([])
  const [existingImages, setExistingImages] = useState([]) // 빈 배열로 초기화
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [allPlaces, setAllPlaces] = useState([])

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:9000/api/community/${id}`)
        console.log("Fetched post data:", response.data) // 디버깅용 로그 추가

        setTitle(response.data.title || "")
        setContent(response.data.content || "")

        // 이미지 URL 처리 - API 응답 구조에 따라 조정
        const imageUrls = response.data.imageUrls || []
        setExistingImages(imageUrls)

        // 장소 정보 처리
        if (response.data.place) {
          setSelectedLocation({
            id: response.data.place.placeId,
            name: response.data.place.placeName,
            address: response.data.place.roadAddress,
          })
        }

        // 모든 장소 데이터 가져오기
        const placesResponse = await axios.get("http://localhost:9000/api/places")
        setAllPlaces(placesResponse.data)

        setLoading(false)
      } catch (err) {
        console.error("데이터 불러오기 실패", err)
        alert("데이터를 불러오는데 실패했어요.")
        navigate("/community")
      }
    }
    fetchPost()
  }, [id, navigate])

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용은 필수입니다.")
      return
    }

    const formData = new FormData()
    formData.append("postTitle", title)
    formData.append("postContent", content)

    // 선택된 위치 정보 추가 - 간소화된 버전
    if (selectedLocation && selectedLocation.id) {
      formData.append("placeId", selectedLocation.id)
    }

    // existingImages가 배열인지 확인 후 처리
    const remainingImages = Array.isArray(existingImages) ? existingImages : []
    formData.append("remainImages", JSON.stringify(remainingImages))

    images.forEach((image) => {
      formData.append("postImages", image)
    })

    try {
      const response = await axios.put(`http://localhost:9000/api/community/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      alert("수정 완료")
      navigate(`/community/post/${id}`)
    } catch (err) {
      alert("에러발생")
      console.log("에러 발생:", err)
    }
  }

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

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

  // 선택한 장소 제거
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
                <h2 className="text-center mb-0">게시글 수정</h2>
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
                      <label className="form-label">기존 이미지</label>
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
                      <label className="form-label">새로 추가한 이미지</label>
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
