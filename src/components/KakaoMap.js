"use client"
import { useEffect, useRef, useState } from "react"
import "./KakaoMap.css"

const KakaoMap = ({
  initialLocation,
  markerPositions = [],
  height = "400px",
  showSearchBar = false,
  onLocationSelect,
  defaultLevel = 3,
  readOnly = false,
  showRegisteredPlaces = true,
  selectedPlace,
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

          // 심플한 스타일의 인포윈도우 생성
          const customOverlay = new window.kakao.maps.CustomOverlay({
            position: new window.kakao.maps.LatLng(initialLocation.lat, initialLocation.lng),
            content: `<div style="padding: 8px 12px; background: white; border-radius: 4px; border: 1px solid #ddd; font-size: 14px; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${initialLocation.name || "위치 정보 없음"}</div>`,
            map: kakaoMap,
            yAnchor: 2.5,
          })

          setSelectedMarker({ marker, overlay: customOverlay })
        }
        // 여러 마커 표시
        else if (markerPositions && markerPositions.length > 0) {
          // 모든 마커를 포함하는 영역 계산
          const bounds = new window.kakao.maps.LatLngBounds()
          const markers = []
          const overlays = []

          markerPositions.forEach((position) => {
            const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng)
            bounds.extend(markerPosition)

            const marker = new window.kakao.maps.Marker({
              map: kakaoMap,
              position: markerPosition,
            })

            // 심플한 스타일의 커스텀 오버레이 생성
            const customOverlay = new window.kakao.maps.CustomOverlay({
              position: markerPosition,
              content: `<div style="padding: 8px 12px; background: white; border-radius: 4px; border: 1px solid #ddd; font-size: 14px; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${position.name}</div>`,
              yAnchor: 2.5,
            })

            markers.push(marker)
            overlays.push(customOverlay)

            // 마커에 마우스오버 이벤트 등록
            window.kakao.maps.event.addListener(marker, "mouseover", () => {
              // 다른 모든 오버레이 숨기기
              overlays.forEach((overlay) => overlay.setMap(null))

              // 현재 마커의 오버레이 표시
              customOverlay.setMap(kakaoMap)
            })

            // 마커에 마우스아웃 이벤트 등록
            window.kakao.maps.event.addListener(marker, "mouseout", () => {
              // 마우스아웃 시 오버레이 숨기기
              customOverlay.setMap(null)
            })

            // 마커 클릭 이벤트 등록
            if (onLocationSelect) {
              window.kakao.maps.event.addListener(marker, "click", () => {
                // 모든 오버레이 숨기기
                overlays.forEach((overlay) => overlay.setMap(null))

                // 현재 마커의 오버레이 표시
                customOverlay.setMap(kakaoMap)

                // 선택한 마커 정보 저장
                setSelectedMarker({ marker, overlay: customOverlay })

                // 선택한 장소 정보 전달
                onLocationSelect(position)
              })
            }
          })

          // 모든 마커가 보이도록 지도 영역 설정
          if (markerPositions.length > 1) {
            kakaoMap.setBounds(bounds)
          }
        }
      })
    }

    script.onerror = () => {
      setError("카카오맵 API 로딩에 실패했습니다")
    }

    return () => {
      // 컴포넌트 언마운트 시 마커와 오버레이 제거
      if (selectedMarker) {
        selectedMarker.marker.setMap(null)
        if (selectedMarker.overlay) {
          selectedMarker.overlay.setMap(null)
        }
      }
    }
  }, [initialLocation, markerPositions, defaultLevel, onLocationSelect])

  useEffect(() => {
    if (!map || !selectedPlace) {
      return
    }
    const { lat, lng, name } = selectedPlace

    const position = new window.kakao.maps.LatLng(lat, lng)

    if (selectedMarker) {
      selectedMarker.marker.setMap(null)
      if (selectedMarker.overlay) {
        selectedMarker.overlay.setMap(null)
      }
    }

    const marker = new window.kakao.maps.Marker({
      map,
      position,
    })

    // 심플한 스타일의 커스텀 오버레이 생성
    const customOverlay = new window.kakao.maps.CustomOverlay({
      position: position,
      content: `<div style="padding: 8px 12px; background: white; border-radius: 4px; border: 1px solid #ddd; font-size: 14px; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${name}</div>`,
      map: map,
      yAnchor: 2.5,
    })

    map.setCenter(position)
    setSelectedMarker({ marker, overlay: customOverlay })
  }, [selectedPlace, map])

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

  const handleLocationSelect = async (result) => {
    // 기존 마커가 있으면 제거
    if (selectedMarker) {
      selectedMarker.marker.setMap(null)
      if (selectedMarker.overlay) {
        selectedMarker.overlay.setMap(null)
      }
    }

    // 새 마커 생성
    const position = new window.kakao.maps.LatLng(result.y, result.x)
    const marker = new window.kakao.maps.Marker({
      map: map,
      position: position,
    })

    // 심플한 스타일의 커스텀 오버레이 생성
    const customOverlay = new window.kakao.maps.CustomOverlay({
      position: position,
      content: `<div style="padding: 8px 12px; background: white; border-radius: 4px; border: 1px solid #ddd; font-size: 14px; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${result.place_name}</div>`,
      map: map,
      yAnchor: 2.5,
    })

    setSelectedMarker({ marker, overlay: customOverlay })

    // 지도 중심 이동
    map.setCenter(position)

    // 선택한 장소 정보 전달
    if (onLocationSelect) {
      // 카카오맵에서 선택한 장소 정보를 원하는 필드명으로 변환
      onLocationSelect({
        name: result.place_name,
        placeName: result.place_name,
        address: result.road_address_name || result.address_name,
        roadAddress: result.road_address_name || result.address_name,
        lat: result.y,
        latitude: result.y,
        lng: result.x,
        longitude: result.x,
        category: result.category_group_name || result.category_name || "",
        industrySub: result.category_group_name || result.category_name || "",
      })
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