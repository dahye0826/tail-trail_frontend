"use client"

import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { useEffect, useState } from "react"
import axios from "axios"
import KakaoMap from "../../components/KakaoMap"

function EditPostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/api/community/${id}`)
        console.log("백엔드 응답 데이터:", response.data)
        setTitle(response.data.title)
        setContent(response.data.content)
        setExistingImages(response.data.imageUrls || [])
        if (response.data.place) {
          setSelectedLocation({
            id: response.data.place.id,
            name: response.data.place.name,
            address: response.data.place.address,
          })
        }
      } catch (err) {
        console.error("데이터 불러오기 실패", err)
        alert("데이터를 불러오는데 실패했어요.")
        navigate("/community")
      }
    }
    fetchPost()
  }, [id, navigate])

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
    if (selectedLocation) {
      formData.append("placeId", selectedLocation.id)
    }
    formData.append("remainImages", JSON.stringify(existingImages))
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
      console.log("서버 응답:", response.data)
      navigate(`/community/post/${id}`)
    } catch (err) {
      alert("에러발생")
      console.log("에러 발생:", err)
    }
  }

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index))
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
                <form onSubmit={handleSubmit}
                 onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                    e.preventDefault()}}}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="postTitle"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="제목을 입력하세요"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="장소를 선택하세요(선택사항)"
                        // 삼항연산자
                        value={selectedLocation?.name ?? ""}
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        // true/false를 토글(toggle
                        onClick={() => setShowMap((prev) => !prev)}
                      >
                        <i className="bi bi-geo-alt me-1"></i>
                      </button>
                    </div>

                    {/* 지도와 선택된 장소 정보를 하나의 컨테이너로 묶음 */}
                    {showMap && (
                      <div className="location-wrapper mb-3">
                        <div className="map-container">
                          <KakaoMap
                            onLocationSelect={(location) => {
                              setSelectedLocation(location)
                              setShowMap(false)
                            }}
                            height="400px"
                            showSearchBar={true}
                          />
                        </div>

                        {selectedLocation && (
                          <div className="selected-location">
                            <div className="alert alert-primary">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <div>
                                    <strong>{selectedLocation.name}</strong>
                                  </div>
                                  <div>
                                    <small>{selectedLocation.address}</small>
                                  </div>
                                  {selectedLocation.category && (
                                    <div className="mt-1">
                                      <span className="badge bg-secondary me-1">{selectedLocation.category}</span>
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => {
                                    setSelectedLocation(null)
                                  }}
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      id="postContent"
                      rows="15"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="내용을 입력하세요"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <input
                      type="file"
                      className="form-control"
                      id="postImages"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                  </div>
                  {existingImages && existingImages.length > 0 && (
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
