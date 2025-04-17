
import axios from "axios";
import { useEffect, useRef, useState } from "react"
import "./KakaoMap.css"

const KakaoMap = ({
  initialLocation,
  markerPositions,
  height,
  showSearchBar,
  onLocationSelect,
  defaultLevel,
  readOnly,
  showRegisteredPlaces,
}) => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const script = document.createElement("script")
    script.src =
      "https://dapi.kakao.com/v2/maps/sdk.js?appkey=97c75dad0b53b5e0f179e360aea22433&libraries=services,clusterer,drawing&autoload=false"
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current
        const options = {
          center: new window.kakao.maps.LatLng(initialLocation?.lat || 37.5665, initialLocation?.lng || 126.978),
          level: defaultLevel || 3,
        }

        const kakaoMap = new window.kakao.maps.Map(container, options)
        setMap(kakaoMap)

        if (markerPositions && markerPositions.length > 0) {
          markerPositions.forEach((position) => {
            const marker = new window.kakao.maps.Marker({
              map: kakaoMap,
              position: new window.kakao.maps.LatLng(position.lat, position.lng),
            })

            const infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:5px;text-align:center;">${position.name}</div>`,
            })

            window.kakao.maps.event.addListener(marker, "mouseover", () => {
              infowindow.open(kakaoMap, marker)
            })

            window.kakao.maps.event.addListener(marker, "mouseout", () => {
              infowindow.close()
            })

            if (onLocationSelect) {
              window.kakao.maps.event.addListener(marker, "click", () => {
                onLocationSelect(position)
              })
            }
          })
        } else {
          const marker = new window.kakao.maps.Marker({
            map: kakaoMap,
            position: new window.kakao.maps.LatLng(initialLocation?.lat || 37.5665, initialLocation?.lng || 126.978),
          })
          marker.setMap(kakaoMap)
        }
      })
    }

    script.onerror = () => {
      setError("Failed to load Kakao Maps API")
    }
  }, [initialLocation, markerPositions, defaultLevel, onLocationSelect])

  const searchPlaces = (keyword) => {
    if (!keyword.trim()) return

    setLoading(true)
    const places = new window.kakao.maps.services.Places()

    places.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data)
        console.log(data)
      } else {
        setError("No places found for the given keyword.")
        setSearchResults([])
      }
      setLoading(false)
    })
  }

  const handleSearch = () => {
    searchPlaces(searchKeyword)
  }

  const handleLocationSelect = async (result) => {
    const location = {
      placeName: result.place_name,
      roadAddress: result.road_address_name || result.address_name,
      latitude: result.y,
      longitude: result.x,
    }
  
    try {
      const response = await axios.get(`http://localhost:9000/api/places/find?placeName=${location.placeName}`);
      // 🔹 등록된 장소면 placeId 추가
      const selectedLocation = {
        ...location,
        placeId: response.data.placeId
      };
      console.log(selectedLocation)
      onLocationSelect(selectedLocation);
    } catch (err) {
      console.warn("⚠ 등록된 장소는 아니지만 선택 허용됨");
  
      //등록되지 않은 장소도 선택 허용 (placeId는 없음)
      onLocationSelect({
        ...location,
        placeId: null,
      });
    }
  
    setSearchResults([]);
    setSearchKeyword("");
  }

  return (
    <div className="kakao-map-container" style={{ marginBottom: 0, paddingBottom: 0 }}>
      {showSearchBar && (
        <div className="map-search">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="장소를 검색하세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="btn btn-primary" type="button" onClick={handleSearch}>
              검색
            </button>
          </div>
          {loading && <div className="map-loading">Loading...</div>}
          {error && <div className="map-error">{error}</div>}
          {searchResults.length > 0 && (
            <ul className="list-group search-results">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  className={`list-group-item ${result.isRegisteredPlace ? "registered-place" : ""}`}
                  onClick={() => handleLocationSelect(result)}
                  style={{ cursor: "pointer" }}
                >
                  <strong>{result.place_name}</strong>
                  <br />
                  <small>{result.address_name}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div
        id="kakao-map"
        ref={mapRef}
        style={{
          width: "100%",
          height: height || "400px",
          marginBottom: 0,
          paddingBottom: 0,
          border: "1px solid #dee2e6",
          borderRadius: "4px",
        }}
        className="map-view"
      ></div>
    </div>
  )
}

export default KakaoMap
