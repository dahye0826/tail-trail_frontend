import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { useEffect, useState } from "react"
import axios from "axios"
import KakaoMap from "../../components/KakaoMap"
import "./WritePostPage.css"

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
        console.log(response.data)
        setTitle(response.data.title)
        setContent(response.data.content)
        setExistingImages(response.data.imageUrls || [])

      } catch (err) {
        console.error("데이터 불러오기 실패", err)
        alert("데이터를 불러오는데 실패했어요.")
        navigate("/community")

      }
    }
    fetchPost()
  }, [id], navigate)

  //이미지 선택
  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files);
    if (selectedImages.length > 0) {
      setImages((prevImages) => [...prevImages, ...selectedImages])
    }

  }
//이미지 제거거
  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index))
  }
  const handleRemoveExistingImage = (index) => {
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index))
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
    formData.append("remainImages", JSON.stringify(existingImages))

    for (let i = 0; i < images.length; i++) {
      formData.append("postImages", images[i])
    }

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
      console.error("게시물 수정 실패:", err)
      alert("게시물 수정 실패")
    }

  }
  return (
    <>
      <Navbar isLoggedIn={true} />
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
                    {existingImages && existingImages.length > 0 && (
                      existingImages.map((imageUrl, index)  => (
                        <div key={index} className="image-preview-wrapper" >
                          <img
                            src={imageUrl.startsWith("http") ? imageUrl : `http://localhost:9000${imageUrl}`}
                            alt={`이미지:${index}`}
                            width="150"
                            height="150"
                            style={{ objectFit: "cover" }}
                          />
                          <button type="button" className="image-remove-btn"
                            onClick={() => handleRemoveExistingImage(index)}
                          >X</button>
                        </div>
                      ))
                    )}
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
