import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
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

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    setShowMap(false)
    console.log("선택한 위치:", location)
  }

  //이미지 선택
  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files);
    if (selectedImages.length > 0) {
      setImages((prevImages) => [...prevImages, ...selectedImages])
    }

  }

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index))
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

    for (let i = 0; i < images.length; i++) {
      formData.append("postImages", images[i])
    }
    formData.append("placeName", selectedLocation.placeName);
    formData.append("placeId", selectedLocation?.placeId || null);
    
    try {
      const response = await axios.post('http://localhost:9000/api/community', formData);
      console.log(response.data)
      console.log(images)
      console.log("selectedLocation:", selectedLocation);
      console.log("placeId:", selectedLocation?.placeId);
      navigate("/community")
    } catch (err) {
      console.error("게시물 등록 실패:", err)
      alert("게시물 등록 실패")
    }

  }
  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <div className="container mt-4 write-post-container">
        <div className="row">
          <div className="col-llg 8 mx-auto">
            <div className="card">
              <div className="card-header bg-white">
                <h2>추억 적기</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit} >
                  <div className="mb-3">
                    <input type="text"
                      className="form-control"
                      id="postTitle"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="제목을 입력해주세요"
                      required />
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
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3" >
                    <input
                      type="file"
                      className="form-control"
                      id="postImages"
                      //  모든 이미지
                      accept="image/*"
                      onChange={handleImageChange}
                      multiple
                    />
                    {images.length > 0 && (
                      images.map((image, index) => (
                        <div key={index} className="image-preview-wrapper" >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`이미지:${index}`}
                            width="150"
                            height="150"
                            style={{ objectFit: "cover" }}
                          />
                          <button type="button" className="image-remove-btn"
                            onClick={() => handleRemoveImage(index)}>X</button>
                        </div>
                      ))
                    )}

                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate("/community")}
                    >
                      취소
                    </button>
                    <button type="submit" className="btn btn-primary">
                      게시글 등록
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