"use client"

import { useEffect, useRef, useState } from "react"
import "./KakaoMap.css"

// 컴포넌트 props 타입
// readOnly: 지도가 읽기 전용인지 여부 (선택 불가)
// initialLocation: 초기 위치 정보
// onLocationSelect: 위치 선택 시 호출될 콜백 함수
// markerPositions: 표시할 마커 위치들 (배열)
// height: 지도 높이
// showSearchBar: 검색창 표시 여부
// defaultLevel: 지도 초기 줌 레벨

const KakaoMap = ({
  readOnly = false,
  initialLocation = null,
  onLocationSelect = null,
  markerPositions = [],
  height = "400px",
  showSearchBar = true,
  defaultLevel = 3,
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const infoWindowsRef = useRef([])

  const [kakaoMapLoaded, setKakaoMapLoaded] = useState(false)
  const [mapLoadError, setMapLoadError] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const loadKakaoMap = () => {
      // 이미 로드되었는지 확인
      if (window.kakao && window.kakao.maps) {
        setKakaoMapLoaded(true)
        return
      }

      const script = document.createElement("script")
      script.id = "kakao-maps-sdk"
      script.async = true
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=97c75dad0b53b5e0f179e360aea22433&libraries=services&autoload=false"

      script.onload = () => {
        window.kakao.maps.load(() => {
          setKakaoMapLoaded(true)
          setMapLoadError(null)
        })
      }

      script.onerror = (error) => {
        console.error("Error loading Kakao Maps API:", error)
        setMapLoadError("카카오맵 API를 로드하는데 문제가 발생했습니다.")
      }

      document.head.appendChild(script)
    }

    loadKakaoMap()

    // 컴포넌트 언마운트 시 정리
    return () => {
      clearMarkers()
    }
  }, [])

  // 지도 초기화
  useEffect(() => {
    if (kakaoMapLoaded && mapRef.current) {
      initializeMap()
    }
  }, [kakaoMapLoaded])

  // 마커 위치가 변경되면 마커 업데이트
  useEffect(() => {
    if (kakaoMapLoaded && mapInstanceRef.current) {
      updateMarkers()
    }
  }, [markerPositions, kakaoMapLoaded])

  // 초기 위치가 변경되면 지도 중심 이동
  useEffect(() => {
    if (kakaoMapLoaded && mapInstanceRef.current && initialLocation) {
      const position = new window.kakao.maps.LatLng(initialLocation.lat, initialLocation.lng)
      mapInstanceRef.current.setCenter(position)

      // 읽기 전용 모드에서는 초기 위치에 마커 표시
      if (readOnly) {
        clearMarkers()
        addMarker(initialLocation)
      }
    }
  }, [initialLocation, kakaoMapLoaded, readOnly])

  // 지도 초기화 함수
  const initializeMap = () => {
    try {
      // 기본 중심 위치 (서울)
      const defaultCenter = new window.kakao.maps.LatLng(37.5665, 126.978)

      // 초기 위치가 있으면 해당 위치로 설정
      const center = initialLocation
        ? new window.kakao.maps.LatLng(initialLocation.lat, initialLocation.lng)
        : defaultCenter

      const options = {
        center: center,
        level: defaultLevel,
      }

      // 지도 인스턴스 생성
      const mapInstance = new window.kakao.maps.Map(mapRef.current, options)
      mapInstanceRef.current = mapInstance

      // 지도 클릭 이벤트 (읽기 전용이 아닐 때만)
      if (!readOnly) {
        window.kakao.maps.event.addListener(mapInstance, "click", (mouseEvent) => {
          if (onLocationSelect) {
            const latlng = mouseEvent.latLng
            const clickedLocation = {
              lat: latlng.getLat(),
              lng: latlng.getLng(),
              name: "선택한 위치",
              address: "주소 정보 없음",
            }

            // 좌표를 주소로 변환
            const geocoder = new window.kakao.maps.services.Geocoder()
            geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
              if (status === window.kakao.maps.services.Status.OK) {
                const address = result[0].address.address_name || "주소 정보 없음"
                clickedLocation.address = address
                clickedLocation.name = address

                setSelectedLocation(clickedLocation)
                onLocationSelect(clickedLocation)

                clearMarkers()
                addMarker(clickedLocation)
              }
            })
          }
        })
      }

      // 초기 마커 표시
      updateMarkers()

      // 초기 위치에 마커 표시 (읽기 전용 모드에서)
      if (readOnly && initialLocation) {
        addMarker(initialLocation)
      }
    } catch (error) {
      console.error("Error initializing map:", error)
      setMapLoadError("지도를 초기화하는데 문제가 발생했습니다.")
    }
  }

  // 마커 업데이트 함수
  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.kakao) return

    clearMarkers()

    // markerPositions 배열의 위치에 마커 추가
    markerPositions.forEach((location) => {
      addMarker(location)
    })
  }

  // 마커 추가 함수
  const addMarker = (location) => {
    if (!mapInstanceRef.current || !window.kakao) return

    const position = new window.kakao.maps.LatLng(location.lat, location.lng)
    const marker = new window.kakao.maps.Marker({
      position: position,
      map: mapInstanceRef.current,
    })

    // 마커 정보창 생성
    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:5px;font-size:12px;text-align:center;width:150px;white-space:normal;word-break:break-word;">${location.name}</div>`,
    })

    // 마커에 마우스오버 이벤트 추가
    window.kakao.maps.event.addListener(marker, "mouseover", () => {
      infowindow.open(mapInstanceRef.current, marker)
    })

    // 마커에 마우스아웃 이벤트 추가 (읽기 전용 모드에서는 정보창 유지)
    if (!readOnly) {
      window.kakao.maps.event.addListener(marker, "mouseout", () => {
        infowindow.close()
      })
    } else {
      // 읽기 전용 모드에서는 정보창 바로 열기
      infowindow.open(mapInstanceRef.current, marker)
    }

    // 마커 클릭 이벤트 (읽기 전용이 아닐 때만)
    if (!readOnly) {
      window.kakao.maps.event.addListener(marker, "click", () => {
        if (onLocationSelect) {
          setSelectedLocation(location)
          onLocationSelect(location)

          // 다른 마커 제거하고 이 마커만 표시
          clearMarkers()
          addMarker(location)
        }
      })
    }

    // 마커와 정보창 참조 저장
    markersRef.current.push(marker)
    infoWindowsRef.current.push(infowindow)
  }

  // 마커 제거 함수
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => {
      marker.setMap(null)
    })
    infoWindowsRef.current.forEach((infowindow) => {
      infowindow.close()
    })
    markersRef.current = []
    infoWindowsRef.current = []
  }

  // 장소 검색 함수
  const searchPlaces = () => {
    if (!searchKeyword.trim()) return

    if (kakaoMapLoaded && window.kakao && window.kakao.maps) {
      const places = new window.kakao.maps.services.Places()

      places.keywordSearch(searchKeyword, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const locations = result.map((place) => ({
            id: place.id,
            name: place.place_name,
            address: place.address_name,
            lat: Number.parseFloat(place.y),
            lng: Number.parseFloat(place.x),
          }))

          setSearchResults(locations)

          // 검색 결과가 있으면 첫 번째 결과로 지도 중심 이동
          if (locations.length > 0) {
            const position = new window.kakao.maps.LatLng(locations[0].lat, locations[0].lng)
            mapInstanceRef.current.setCenter(position)

            // 검색 결과에 마커 표시
            clearMarkers()
            locations.forEach((loc) => {
              addMarker(loc)
            })
          }
        } else {
          setSearchResults([])
        }
      })
    }
  }

  // 장소 선택 함수
  const selectLocation = (location) => {
    setSelectedLocation(location)

    if (onLocationSelect) {
      onLocationSelect(location)
    }

    // 선택한 위치로 지도 중심 이동
    const position = new window.kakao.maps.LatLng(location.lat, location.lng)
    mapInstanceRef.current.setCenter(position)

    // 마커 업데이트
    clearMarkers()
    addMarker(location)

    // 검색 결과 초기화
    setSearchResults([])
  }

  // 지도 다시 로드 시도
  const handleRetryLoadMap = () => {
    setMapLoadError(null)

    // 스크립트 태그 제거
    const existingScript = document.getElementById("kakao-maps-sdk")
    if (existingScript) {
      existingScript.remove()
    }

    // kakao 객체 초기화
    if (window.kakao) {
      window.kakao = undefined
    }

    // 상태 초기화
    setKakaoMapLoaded(false)

    // 약간의 지연 후 스크립트 다시 로드
    setTimeout(() => {
      const script = document.createElement("script")
      script.id = "kakao-maps-sdk"
      script.async = true
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=97c75dad0b53b5e0f179e360aea22433&libraries=services&autoload=false"

      script.onload = () => {
        window.kakao.maps.load(() => {
          setKakaoMapLoaded(true)
        })
      }

      document.head.appendChild(script)
    }, 500)
  }

  return (
    <div className="kakao-map-container">
      {/* 검색창 */}
      {showSearchBar && !readOnly && (
        <div className="map-search mb-2">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="장소 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  searchPlaces()
                }
              }}
            />
            <button type="button" className="btn btn-primary" onClick={searchPlaces}>
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>
      )}

      {/* 검색 결과 목록 */}
      {searchResults.length > 0 && !readOnly && (
        <div className="search-results mb-3">
          <ul className="list-group">
            {searchResults.map((location) => (
              <li
                key={location.id}
                className="list-group-item list-group-item-action"
                onClick={() => selectLocation(location)}
              >
                <strong>{location.name}</strong>
                <br />
                <small>{location.address}</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 지도 표시 영역 */}
      {mapLoadError ? (
        // 에러 발생 시
        <div className="map-error d-flex justify-content-center align-items-center bg-light" style={{ height: height }}>
          <div className="text-center p-4">
            <div className="text-danger mb-3">
              <i className="bi bi-exclamation-triangle-fill fs-1"></i>
            </div>
            <p className="text-danger">{mapLoadError}</p>
            <button type="button" className="btn btn-outline-primary mt-2" onClick={handleRetryLoadMap}>
              <i className="bi bi-arrow-clockwise me-1"></i> 다시 시도
            </button>
          </div>
        </div>
      ) : !kakaoMapLoaded ? (
        // 로딩 중
        <div
          className="map-loading d-flex justify-content-center align-items-center bg-light"
          style={{ height: height }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>지도를 불러오는 중...</p>
          </div>
        </div>
      ) : (
        // 지도 표시
        <div
          ref={mapRef}
          className="map-view"
          style={{
            width: "100%",
            height: height,
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
          }}
        ></div>
      )}
    </div>
  )
}

export default KakaoMap
