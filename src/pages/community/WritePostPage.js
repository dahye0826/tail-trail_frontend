import axios from "axios"
import { useState,  useEffect, useRef  } from "react"
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
  const [kakaoMapLoaded,setKakaoMapLoaded] = useState(false)
  const [mapLoadError, setMapLoadError] = useState(false)
  const [locationOptions, setLocationOptions] = useState([])
  const [showMap, setShowMap] = useState(false)
  const[images,setImages]=useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  
  const navigate = useNavigate()


  //이미지 선택
  const handleImageChange = (e) =>{
    const selectedFiles = Array.from(e.target.files)//Array.from() fileList를 바꿔줌
    setImages(selectedFiles)
  }

  
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([]) // 마커 저장용

  //카카오 지도 sdk 불러오기
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=97c75dad0b53b5e0f179e360aea22433&libraries=services&autoload=false"
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
  },[kakaoMapLoaded, showMap, selectedLocation])

    //장소 검색(kakao)
    const searchLocations = (query) => {
      const places = new window.kakao.maps.services.Places()
      places.keywordSearch(query, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const locations = result.map((place) => ({
            name: place.place_name,
            address: place.address_name,
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
          }))
    
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

  const infowindow = new window.kakao.maps.InfoWindow({
    content: `<div style="padding:5px;">${location.name}</div>`,
  })
  infowindow.open(mapInstanceRef.current, marker)

  markersRef.current.push(marker)
}

const clearMarkers = () => {
  markersRef.current.forEach((marker) => marker.setMap(null))
  markersRef.current = []
}
 

  const handlesubmit = async(e)=>{
    e.preventDefault()

  const formData = new FormData() //FormData는 클래스

  formData.append("postTitle",title)
  formData.append("postContent",content)
  formData.append("postLocation",location)
  images.forEach(image => {
    formData.append("postImages",image)
    })
  formData.append("locationName", selectedLocation?.name || "")
  formData.append("locationAddress", selectedLocation?.address || "")
  formData.append("locationLat", selectedLocation?.lat || "")
  formData.append("locationLng", selectedLocation?.lng || "")  
 

    try{
      const response= await axios.post("http://localhost:9000/api/community", formData, {
        headers: {
          "Content-Type": "multipart/form-data" //데이터 형식(header)
        }
      })
      console.log("글쓰기 보내기 완료", response.data)
    }catch(err){
     console.log("오류",err)
  
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
                    <label htmlFor="postTitle" className="form-label">제목</label>
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
                  <div className="map-search mb-2">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="장소 검색..."
                        value={location}
                        onChange={handleLocationChange}
                      />
                       <button
      type="button"
      className="btn btn-primary"
      onClick={() => {
        setShowMap(true)
        searchLocations(location)
      }}
    >
      <i className="bi bi-search"></i>
    </button>
  </div>
  </div>
             {/* 지도 표시 영역 */}
{showMap && (
  <>
    {!kakaoMapLoaded ? (
      <div className="map-loading">지도를 불러오는 중...</div>
    ) : (
      <div
        id="map-container"
        ref={mapRef}
        style={{
          width: "100%",
          height: "400px",
          border: "1px solid #ccc",
          marginBottom: "10px",
        }}
      ></div>
    )}
  </>
)}

{/* 선택된 장소 정보 */}
{selectedLocation && (
  <div className="selected-location mb-2">
    <div><strong>선택된 장소:</strong> {selectedLocation.name}</div>
    <div>{selectedLocation.address}</div>
    <button
      type="button"
      className="btn btn-sm btn-outline-danger mt-2"
      onClick={() => {
        setSelectedLocation(null)
        setLocation("")
        setShowMap(false)
      }}
    >
      선택 취소
    </button>
  </div>
)}

                  <div className="mb-3">
                    <label htmlFor="postContent" className="form-label">내용</label>
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
                    <label htmlFor="postImages" className="form-label">이미지 첨부 (선택사항)</label>
                    <input type="file" className="form-control" id="postImages" accept="image/*" onChange={handleImageChange} multiple />
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/community")}>
                      취소
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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