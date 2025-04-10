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
        setTitle(response.data.postTitle)
        setContent(response.data.postContent)
        setExistingImages(response.data.postImageUrls)
        if (response.data.place) {
          setSelectedLocation({
            id: response.data.place.id,
            name: response.data.place.name,
            address: response.data.place.address,
            category: response.data.place.category,
          })
        }
      }
      catch (err) {
        console.error("데이터 불러오기 실패", err)
        alert("데이터를 불러오는데 실패했어요.")
        navigate("/community")
      }

    }
    fetchPost()
  }, [id, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()


    if (!title.trim() || !content.trim()) { //앞뒤 공백 제거했을때 없으면 alert
      alert("제목과 내용은 필수입니다.")
      return
    }

    const formData = new FormData();
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

    } catch (err) {
      alert("에러발생")
      console.log("에러 발생:", err)



    }

  }

  const handleRemoveExistingImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index))
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
                <h2 className="text-center mb-0">게시글 수정</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
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
                        placeholder="지도에서 장소 찾기 버튼 클릭"
                        // 삼항연산자
                        value={selectedLocation ? selectedLocation.name : ""} 
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        // true/false를 토글(toggle
                        onClick={() => setShowMap((prev) => !prev)}
                      >
                        지도에서 장소 찾기
                      </button>
                    </div>

                    {showMap&&(
                      <div className="mb-3">
                        <KakaoMap
                        onLocationSelect={(location)=>{
                          setSelectedLocation(location)
                          setShowMap(false)
                        }}
                        height="400px"
                        // 장소검색 입력창
                        showSearchBar={true}
                        />
                      </div>
                    )}

                    {selectedLocation &&(
                        <div className="alert alert-primary d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{selectedLocation.name}</strong><br />
                          <small>{selectedLocation.address}</small>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setSelectedLocation(null)}
                        >
                          ✕
                        </button>
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
                  {existingImages.length > 0 && (
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-2">
                        {existingImages.map((imageUrl, index) => (
                          <div key={index} className="position-relative">
                            <img
                              src={imageUrl}
                              alt={`기존 이미지 ${index}`}
                              width="100"
                              height="100"
                              style={{ objectFit: "cover", borderRadius: "5px" }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              style={{ padding: "0.1rem 0.3rem", fontSize: "0.7rem" }}
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
                      <label className="form-label">선택된 이미지</label>
                      <div className="d-flex flex-wrap gap-2">
                        {images.map((image, index) => (
                          <div key={index} className="position-relative">
                            <img
                              src={URL.createObjectURL(image)}
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
