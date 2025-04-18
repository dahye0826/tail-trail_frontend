"use client"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
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
  const [selectedMarker, setSelectedMarker] = useState(null)

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

        // 초기 위치에 마커 표시
        if (initialLocation && initialLocation.lat && initialLocation.lng) {
          const marker = new window.kakao.maps.Marker({
            map: kakaoMap,
            position: new window.kakao.maps.LatLng(initialLocation.lat, initialLocation.lng),
          })

          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;text-align:center;width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${initialLocation.name || "선택한 위치"}</div>`,
          })

          infowindow.open(kakaoMap, marker)
          setSelectedMarker({ marker, infowindow })
        }
        // 여러 마커 표시
        else if (markerPositions && markerPositions.length > 0) {
          markerPositions.forEach((position) => {
            const marker = new window.kakao.maps.Marker({
              map: kakaoMap,
              position: new window.kakao.maps.LatLng(position.lat, position.lng),
            })

            const infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:5px;text-align:center;width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${position.name}</div>`,
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
        }
      })
    }

    script.onerror = () => {
      setError("카카오맵 API 로딩에 실패했습니다")
    }

    return () => {
      // 컴포넌트 언마운트 시 마커와 인포윈도우 제거
      if (selectedMarker) {
        selectedMarker.marker.setMap(null)
        selectedMarker.infowindow.close()
      }
    }
  }, [initialLocation, markerPositions, defaultLevel, onLocationSelect])

  const searchPlaces = (keyword) => {
    if (!keyword.trim()) return

    setLoading(true)
    const places = new window.kakao.maps.services.Places()

    places.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data)
        console.log("검색 결과:", data)

        // 검색 결과가 있으면 첫 번째 결과로 지도 중심 이동
        if (data.length > 0) {
          const bounds = new window.kakao.maps.LatLngBounds()

          data.forEach((place) => {
            bounds.extend(new window.kakao.maps.LatLng(place.y, place.x))
          })

          map.setBounds(bounds)
        }
      } else {
        setError("검색 결과가 없습니다")
        setSearchResults([])
      }
      setLoading(false)
    })
  }

  const handleSearch = () => {
    searchPlaces(searchKeyword)
  }

  // 데이터베이스에서 근처 장소 찾기
  const findNearbyPlaceInDatabase = async (lat, lng) => {
    try {
      setLoading(true)
      // 반경 100m 내의 장소 검색 (필요에 따라 조정 가능)
      const response = await axios.get(`http://localhost:9000/api/places/nearby?lat=${lat}&lng=${lng}&radius=100`)
      setLoading(false)

      if (response.data && response.data.length > 0) {
        // 가장 가까운 장소 반환 (API가 거리순으로 정렬해서 반환)
        return response.data[0]
      }
      return null
    } catch (error) {
      console.error("근처 장소 검색 오류:", error)
      setLoading(false)
      return null
    }
  }

  const handleLocationSelect = async (result) => {
    // 기존 마커가 있으면 제거
    if (selectedMarker) {
      selectedMarker.marker.setMap(null)
      selectedMarker.infowindow.close()
    }

    // 새 마커 생성
    const position = new window.kakao.maps.LatLng(result.y, result.x)
    const marker = new window.kakao.maps.Marker({
      map: map,
      position: position,
    })

    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:5px;text-align:center;width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${result.place_name}</div>`,
    })

    infowindow.open(map, marker)
    setSelectedMarker({ marker, infowindow })

    // 지도 중심 이동
    map.setCenter(position)

    // 데이터베이스에서 근처 장소 찾기
    const nearbyPlace = await findNearbyPlaceInDatabase(result.y, result.x)

    // 선택한 장소 정보 전달
    if (onLocationSelect) {
      if (nearbyPlace) {
        // 데이터베이스에 있는 장소 정보 사용
        console.log("데이터베이스에서 찾은 장소:", nearbyPlace)
        onLocationSelect({
          id: nearbyPlace.placeId,
          name: nearbyPlace.placeName,
          address: nearbyPlace.roadAddress,
          lat: nearbyPlace.latitude,
          lng: nearbyPlace.longitude,
          category: nearbyPlace.industrySub,
        })
      } else {
        // 카카오맵에서 선택한 장소 정보 사용
        console.log("카카오맵에서 선택한 장소:", result)
        // 카카오맵 API 결과를 우리 필드명에 맞게 변환
        onLocationSelect({
          name: result.place_name,
          address: result.road_address_name || result.address_name,
          lat: result.y,
          lng: result.x,
          category: result.category_name || "",
        })
      }
    }

    // 검색 결과 초기화
    setSearchResults([])
  }

  return (
    <div className="kakao-map-container">
      {showSearchBar && (
        <div className="map-search-container">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="장소를 검색하세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="btn btn-primary search-btn" type="button" onClick={handleSearch}>
              <i className="bi bi-search me-1"></i> 검색
            </button>
          </div>

          {loading && (
            <div className="search-loading">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                <span className="visually-hidden">검색 중...</span>
              </div>
              <span>검색 중...</span>
            </div>
          )}

          {error && <div className="search-error alert alert-danger py-2 mt-2">{error}</div>}

          {searchResults.length > 0 && (
            <div className="search-results-container">
              <div className="search-results-header">
                <small className="text-muted">검색 결과 ({searchResults.length})</small>
              </div>
              <ul className="list-group search-results">
                {searchResults.map((result) => (
                  <li
                    key={result.id}
                    className="list-group-item search-result-item"
                    onClick={() => handleLocationSelect(result)}
                  >
                    <div className="search-result-name">{result.place_name}</div>
                    <div className="search-result-address">{result.address_name}</div>
                    {result.category_name && <div className="search-result-category">{result.category_name}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div
        id="kakao-map"
        ref={mapRef}
        style={{
          width: "100%",
          height: height || "400px",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
        }}
        className="map-view"
      ></div>
    </div>
  )
}

export default KakaoMap
