import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
// import CommentSection from "./CommentSection"
import "./PostDetailPage.css"

function PostDetailPage() {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(true) // 실제 로그인 상태로 변경 필요
  const { id } = useParams()
  const navigate = useNavigate()
  const hasFetched = useRef(false)
  const currentUser = localStorage.getItem("username")

  const handleEditClick = () => {
    navigate(`/community/edit/${id}`)
  }
  const handleDeleteClick = async() =>
    {if (!window.confirm("정말 삭제하시겠습니까?")) return
      try{
        await axios.delete(`http://localhost:9000/api/community/${id}`)
        alert("게시글이 삭제되었습니다.")
        navigate("/community")
      } catch (err) {
        console.error("삭제 오류:", err)
        alert("게시글 삭제 실패")
      }
      }



  }
  return (
    <>
      <Navbar isLoggedIn={isLoggedIn}  />
      <div className="container mt-4 write-post-container">
        <div className="row">
          <div className="col-llg 8 mx-auto">
            <div className="card">
              <div className="card-header bg-white">
                <h2>추억 적기</h2>
              </div>
              <div className="card-body">

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
                  {/* {post?.username === currentUser && ( */}
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleEditClick}
                    >
                      <i className="bi bi-pencil-square me-1"></i>수정
                    </button>
                    <button type="submit" 
                    className="btn btn-outline-danger"
                    onClick={handleDeleteClick}
                    >
                    <i className="bi bi-trash me-1"></i> 삭제
                    </button>
                  </div>

              </div>

            </div>
          </div>
        </div>
      </div>





      <Footer />
    </>
  )
}

export default PostDetailPage
