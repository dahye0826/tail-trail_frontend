"use client"

import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./WritePostPage.css"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

function WritePostPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [location, setLocation] = useState("") //장소 검색
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [kakaoMapLoaded, setKakaoMapLoaded] = useState(false)
  const [mapLoadError, setMapLoadError] = useState(false)
  const [locationOptions, setLocationOptions] = useState([])
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

  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([]) // 마커 저장용

  //카카오 지도 sdk 불러오기
  useEffect(() => {
    const script = document.createElement("script")
    script.src =
      "https://dapi.kakao.com/v2/maps/sdk.js?appkey=97c75dad0b53b5e0f179e360aea22433&libraries=services&autoload=false"
    script.async = true
    document.head.appendChild(script) //JavaScript로 <script> 태그를 직접 만드는 코드

    script.onload = () => {
      window.kakao.maps.load(() => {
        setKakaoMapLoaded(true)
      })
    }

    script.onerror = () => {
      setMapLoadError("카카오 맵 로딩 실패")
    }
  }, [])

  //지도 객체 생성 목적: 지도 그리기(div에 지도 객체 넣기)
  useEffect(() => {
    if (kakaoMapLoaded && showMap && mapRef.current) {
      const center = new window.kakao.maps.LatLng(37.5665, 126.978)
      const options = { center, level: 3 }

      const map = new window.kakao.maps.Map(mapRef.current, options)
      mapInstanceRef.current = map
    }
  }, [kakaoMapLoaded, showMap])

  //장소 검색(kakao)
  const searchLocations = (query) => {
    const places = new window.kakao.maps.services.Places()
    places.keywordSearch(query, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const locations = result.map((place) => ({
          name: place.place_name,
          address: place.address_name,
          lat: Number.parseFloat(place.y),
          lng: Number.parseFloat(place.x),
        }))

        setLocationOptions(locations)

        const first = locations[0]
        setSelectedLocation(first)

        const center = new window.kakao.maps.LatLng(first.lat, first.lng)
        mapInstanceRef.current.setCenter(center)

        clearMarkers()
        addMarker(first)
      }
    })
  }

  const addMarker = (location) => {
    if (!window.kakao || !mapInstanceRef.current) return

    const position = new window.kakao.maps.LatLng(location.lat, location.lng)
    const marker = new window.kakao.maps.Marker({
      map: mapInstanceRef.current,
      position,
    })

    console.log("마커 추가됨:", marker)

    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="text-align: center; 
      width: 160px; 
      white-space: normal;
       word-break: break-word;">${location.name}</div>
      
       `
      
    })
    infowindow.open(mapInstanceRef.current, marker)

    markersRef.current.push(marker)
  }

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []
  }

  const handlesubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData() //FormData는 클래스

    formData.append("postTitle", title)
    formData.append("postContent", content)
    formData.append("postLocation", location)
    images.forEach((image) => {
      formData.append("postImages", image)
    })
    formData.append("locationName", selectedLocation?.name || "")
    formData.append("locationAddress", selectedLocation?.address || "")
    formData.append("locationLat", selectedLocation?.lat || "")
    formData.append("locationLng", selectedLocation?.lng || "")

    for (let pair of formData.entries()) {
      console.log("[FormData]", pair[0], pair[1])
    }

    try {
      const response = await axios.post("http://localhost:9000/api/community", formData, {
        headers: {
          "Content-Type": "multipart/form-data", //데이터 형식(header)
        },
      })
      console.log("글쓰기 보내기 완료", response.data)

      navigate("/community");
    } catch (err) {
      console.log("오류", err)
    }
  }
  const handleLocationChange = (e) => {
    setLocation(e.target.value)
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

                  {/* 장소 검색 영역 */}
                  <div className="mb-3 position-relative">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="장소 검색..."
                        value={location}
                        onChange={handleLocationChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            setShowMap(true)
                            searchLocations(location)
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          setShowMap(true)
                          searchLocations(location)
                        }}
                      >
                        <i className="bi bi-map me-1"></i> 지도로 보기
                      </button>
                    </div>
                  </div>

                  {/* 지도 표시 영역 수정 */}
                  {showMap && (
                    <div className="map-container mb-3">
                      <div className="map-header d-flex justify-content-between align-items-center p-2 bg-light">
                      <div></div>
                        <button type="button" className="btn-close" onClick={() => setShowMap(false)}></button>
                      </div>

                      {/* 장소 검색 결과 목록 */}
                      {locationOptions.length > 0 && (
                        <div className="location-results mt-2 mx-2">
                          <ul className="list-group">
                            {locationOptions.map((loc, index) => (
                              <li
                                key={index}
                                className="list-group-item list-group-item-action"
                                onClick={() => {
                                  setSelectedLocation(loc)
                                  mapInstanceRef.current.setCenter(new window.kakao.maps.LatLng(loc.lat, loc.lng))
                                  clearMarkers()
                                  addMarker(loc)
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                <strong>{loc.name}</strong>
                                <br />
                                <small>{loc.address}</small>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {!kakaoMapLoaded ? (
                        <div className="map-loading p-5 text-center">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">지도를 불러오는 중...</span>
                          </div>
                          <p className="mt-2">지도를 불러오는 중...</p>
                        </div>
                      ) : (
                        <div
                          id="map-container"
                          ref={mapRef}
                          style={{
                            width: "100%",
                            height: "400px",
                            border: "1px solid #ccc",
                          }}
                        ></div>
                      )}
                    </div>
                  )}

                  {/* 선택된 장소 정보 표시 개선 */}
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
                              setLocation("")
                              setShowMap(false)
                            }}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

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