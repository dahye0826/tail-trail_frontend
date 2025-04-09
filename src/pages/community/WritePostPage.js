"use client"

import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./WritePostPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"

function WritePostPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  const navigate = useNavigate()

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

  // 위치 선택 핸들러
  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
  }

  const handlesubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()

    formData.append("postTitle", title)
    formData.append("postContent", content)
    images.forEach((image) => {
      formData.append("postImages", image)
    })

    // 선택된 위치 정보 추가
    if (selectedLocation) {
      formData.append("locationName", selectedLocation.name || "")
      formData.append("locationAddress", selectedLocation.address || "")
      formData.append("locationLat", selectedLocation.lat || "")
      formData.append("locationLng", selectedLocation.lng || "")
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
                <form onSubmit={handlesubmit}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="posttitle"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="제목을 입력해주세요"
                      required
                    />
                  </div>

                  {/* 장소 선택 영역 */}
                  <div className="mb-3">
                    <label className="form-label">장소 선택 (선택사항)</label>
                    <div className="d-flex justify-content-between mb-2">
                      <button type="button" className="btn btn-outline-primary" onClick={() => setShowMap(!showMap)}>
                        {showMap ? "지도 닫기" : "지도에서 장소 찾기"}
                      </button>
                    </div>

                    {/* 지도 표시 영역 */}
                    {showMap && (
                      <div className="map-container mb-3">
                        <KakaoMap onLocationSelect={handleLocationSelect} height="400px" showSearchBar={true} />
                      </div>
                    )}

                    {/* 선택된 장소 정보 표시 */}
                    {selectedLocation && (
                      <div className="selected-location mb-3">
                        <div className="alert alert-success">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>선택된 장소:</strong> {selectedLocation.name}
                              <div>
                                <small>{selectedLocation.address}</small>
                              </div>
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

                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      id="postContent"
                      rows="10"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="내용을 입력하세요"
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
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
                              style={{ objectFit: "cover", borderRadius: "5px" }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              style={{ padding: "0.1rem 0.3rem", fontSize: "0.7rem" }}
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
