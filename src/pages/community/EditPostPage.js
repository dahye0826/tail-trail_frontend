"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./WritePostPage.css" // 같은 스타일 사용
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import KakaoMap from "../../components/KakaoMap"

function EditPostPage() {
  const { id } = useParams()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [loading, setLoading] = useState(true)
  const [existingImages, setExistingImages] = useState([])
  const navigate = useNavigate()

  console.log("EditPostPage rendered with id:", id) // 디버깅용

  // 게시글 데이터 불러오기
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        console.log("Fetching post data for editing, id:", id) // 디버깅용
        setLoading(true)

        // 실제 구현에서는 API 호출로 대체
        setTimeout(() => {
          // 테스트용 목 데이터
          const mockPostData = {
            id: Number.parseInt(id),
            title: "강아지랑 부산여행",
            content: `지난 주말 우리 댕댕이와 함께한 부산 여행 후기입니다.
해운대에서 아침 일출을 보고, 광안리에서 야경을 즐겼어요. 생각보다 많은 장소가 반려견 동반이 가능해서 좋았습니다.
특히 해운대 해변은 이른 아침과 저녁에는 반려견과 함께 산책할 수 있어요. 모래사장을 뛰어다니는 우리 강아지의 모습이 정말 행복해 보였습니다.
숙소는 '멍멍 펜션'이라는 곳을 이용했는데, 반려견 전용 놀이터와 샤워 시설이 있어서 편리했어요.`,
            author: "멍멍맘",
            createdAt: "2023-05-15",
            // 등록된 장소(Places 엔티티) 정보
            place: {
              id: 1,
              name: "해운대 반려견 비치파크",
              address: "부산광역시 해운대구 우동",
              region: "부산",
              category: "여행지",
              description: "반려견과 함께 해변을 즐길 수 있는 특별한 공간입니다.",
              rating: 4.5,
              amenities: ["반려견 전용 공간", "물놀이 시설", "샤워 시설"],
              lat: 35.1586,
              lng: 129.1603,
            },
            images: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
          }

          console.log("Setting post data for editing:", mockPostData) // 디버깅용
          setTitle(mockPostData.title)
          setContent(mockPostData.content)

          if (mockPostData.place) {
            const placeInfo = {
              id: mockPostData.place.id,
              name: mockPostData.place.name,
              address: mockPostData.place.address,
              lat: mockPostData.place.lat,
              lng: mockPostData.place.lng,
              isRegisteredPlace: true,
              category: mockPostData.place.category,
              rating: mockPostData.place.rating,
            }
            setSelectedLocation(placeInfo)
          }

          if (mockPostData.images && mockPostData.images.length > 0) {
            setExistingImages(mockPostData.images)
          }

          setLoading(false)
        }, 800)
      } catch (error) {
        console.error("게시글 데이터 로딩 오류:", error)
        alert("게시글 데이터를 불러오는데 실패했습니다.")
        navigate("/community")
      }
    }

    fetchPostData()
  }, [id, navigate])

  // 위치 선택 핸들러
  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    console.log("Selected location:", location)
  }

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      // 실제 구현에서는 API 호출로 대체
      const formData = new FormData()
      formData.append("postId", id)
      formData.append("title", title)
      formData.append("content", content)

      // 선택된 위치 정보 추가
      if (selectedLocation) {
        // 등록된 장소인 경우 (Places 엔티티 ID가 있는 경우)
        formData.append("placeId", selectedLocation.id)
      }

      console.log("수정된 데이터:", {
        id,
        title,
        content,
        selectedLocation,
        existingImages,
      })

      // 성공 시 게시글 상세 페이지로 이동
      setTimeout(() => {
        alert("게시글이 수정되었습니다.")
        navigate(`/community/post/${id}`)
      }, 1000)
    } catch (error) {
      console.error("게시글 수정 오류:", error)
      alert("게시글 수정에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 기존 이미지 삭제
  const handleRemoveImage = (index) => {
    const newImages = [...existingImages]
    newImages.splice(index, 1)
    setExistingImages(newImages)
  }

  console.log("Loading state in EditPostPage:", loading) // 디버깅용

  if (loading) {
    return (
      <>
        <Navbar isLoggedIn={isLoggedIn} />
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
      <Navbar isLoggedIn={isLoggedIn} />

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

                  {/* 장소 선택 영역 */}
                  <div className="mb-3">
                    <label htmlFor="postLocation" className="form-label">
                      관련 장소 (선택사항)
                    </label>
                    <div className="d-flex justify-content-between mb-2">
                      <button type="button" className="btn btn-outline-primary" onClick={() => setShowMap(!showMap)}>
                        {showMap ? "지도 닫기" : "지도에서 장소 찾기"}
                      </button>
                    </div>

                    {/* 지도 표시 영역 */}
                    {showMap && (
                      <div className="map-container mb-3">
                        <KakaoMap
                          readOnly={false}
                          initialLocation={selectedLocation}
                          onLocationSelect={handleLocationSelect}
                          height="400px"
                          showSearchBar={true}
                        />
                      </div>
                    )}

                    {/* 선택된 장소 정보 표시 */}
                    {selectedLocation && (
                      <div className="selected-location mb-3">
                        <div className="alert alert-primary mb-0">
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
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
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
                      rows="10"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="내용을 입력하세요"
                      required
                    ></textarea>
                  </div>

                  {/* 기존 이미지 표시 */}
                  {existingImages.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">기존 이미지</label>
                      <div className="row">
                        {existingImages.map((image, index) => (
                          <div key={index} className="col-md-4 mb-2">
                            <div className="position-relative">
                              <img
                                src={image || "/placeholder.svg"}
                                alt={`이미지 ${index + 1}`}
                                className="img-thumbnail"
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="postImage" className="form-label">
                      이미지 추가 (선택사항)
                    </label>
                    <input type="file" className="form-control" id="postImage" accept="image/*" multiple />
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/community/post/${id}`)}
                    >
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
                          수정 중...
                        </>
                      ) : (
                        "게시글 수정"
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

export default EditPostPage
