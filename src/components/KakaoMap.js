"use client"
import { useEffect, useRef, useState } from "react"
import "./KakaoMap.css"

function KakaoMap ({
  initialLocation,
  markerPositions = [],
  height = "400px",
  showSearchBar = false,
  onLocationSelect,
  defaultLevel = 3,
  readOnly = false,
  showRegisteredPlaces = true,
  selectedPlace,
  showInfoCard = true,
  useCluster = true,
}) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const clustererRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    const script = document.createElement("script")
    script.src =
      "https://dapi.kakao.com/v2/maps/sdk.js?appkey=97c75dad0b53b5e0f179e360aea22433&libraries=services,clusterer,drawing&autoload=false"
    script.async = true
    document.head.appendChild(script) //헤드안에 스크립트 추가

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current

        // 서울 좌표 (기준점)
        const seoulCoords = { lat: 37.5665, lng: 126.978 }

        // 초기 위치 설정 로직
        let initialCoords = { lat: seoulCoords.lat, lng: seoulCoords.lng }

        // markerPositions은 지도안에 마커가 몇 개 있는지 확인하는 용도
        if (markerPositions && markerPositions.length > 0) {
          initialCoords = {
            lat: Number(markerPositions[0].lat),
            lng: Number(markerPositions[0].lng),
          }
        } else if (initialLocation && initialLocation.lat && initialLocation.lng) {
          // initialLocation이 제공된 경우 해당 위치 사용
          initialCoords = { lat: initialLocation.lat, lng: initialLocation.lng }
        }

        if (!container) {
          console.error("지도를 렌더링할 DOM 요소가 없습니다.")
          return
        }

        const options = {
          center: new window.kakao.maps.LatLng(initialCoords.lat, initialCoords.lng),
          level: defaultLevel || 3,
        }

        const kakaoMap = new window.kakao.maps.Map(container, options)
        setMap(kakaoMap)

        // 클러스터러 생성 및 설정
        if (useCluster) {
          const clusterer = new window.kakao.maps.MarkerClusterer({
            map: kakaoMap,
            averageCenter: true,
            minLevel: 5,
            disableClickZoom: true,
            styles: [
              {
                width: "50px",
                height: "50px",
                background: "rgba(78, 205, 196, 0.8)",
                borderRadius: "25px",
                color: "#fff",
                textAlign: "center",
                fontWeight: "bold",
                lineHeight: "50px",
                fontSize: "14px",
              },
              {
                width: "60px",
                height: "60px",
                background: "rgba(42, 157, 143, 0.8)",
                borderRadius: "30px",
                color: "#fff",
                textAlign: "center",
                fontWeight: "bold",
                lineHeight: "60px",
                fontSize: "16px",
              },
            ],
          })

          // 클러스터 클릭 이벤트 처리
          window.kakao.maps.event.addListener(clusterer, "clusterclick", (cluster) => {
            // 클러스터 클릭 시 해당 영역으로 지도 확대
            const level = kakaoMap.getLevel() - 1
            //anchor:클러스터 중심
            kakaoMap.setLevel(level, { anchor: cluster.getCenter() })
          })

          clustererRef.current = clusterer
        }

        // 지도 클릭 시 선택된 장소 정보 초기화
        window.kakao.maps.event.addListener(kakaoMap, "click", () => {
          setSelectedLocation(null)
        })

        // 초기 위치에 마커 표시
        if (initialLocation && initialLocation.lat && initialLocation.lng) {
          const initialMarkerPosition = new window.kakao.maps.LatLng(initialLocation.lat, initialLocation.lng)

          const marker = new window.kakao.maps.Marker({
            position: initialMarkerPosition,
            map: kakaoMap,
          })

          // 마커 클릭 시 선택된 장소 정보 설정
          window.kakao.maps.event.addListener(marker, "click", () => {
            setSelectedLocation(initialLocation)
            setSelectedMarker({ marker })
            kakaoMap.setCenter(initialMarkerPosition)
          })

          // 초기에 선택된 장소 정보 설정
          setSelectedLocation(initialLocation)
          setSelectedMarker({ marker })
        }
      })
    }

    script.onerror = () => {
      setError("카카오맵 API 로딩에 실패했습니다")
    }

    return () => {
      // 컴포넌트 언마운트 시 마커 제거
      if (selectedMarker) {
        selectedMarker.marker.setMap(null)
      }

      // 모든 마커 제거
      markersRef.current.forEach((marker) => {
        if (marker) marker.setMap(null)
      })

      // 클러스터러 제거
      if (clustererRef.current) {
        clustererRef.current.clear()
      }
    }
  }, [initialLocation, defaultLevel, onLocationSelect, useCluster])

  // 마커 생성 및 클러스터러에 추가
  useEffect(() => {
    if (!map || !markerPositions || markerPositions.length === 0) return

    // 기존 마커 모두 제거
    markersRef.current.forEach((marker) => {
      if (marker) marker.setMap(null)
    })
    markersRef.current = []

    // 클러스터러 사용 시 클러스터러 초기화
    if (useCluster && clustererRef.current) {
      clustererRef.current.clear()
    }

    // 새 마커 생성 및 표시
    const markers = markerPositions.map((position) => {
      const markerPosition = new window.kakao.maps.LatLng(Number(position.lat), Number(position.lng))

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        // 지도에 직접 추가하지 않음 (클러스터러가 관리)
      })

      // 마커에 클릭 이벤트 추가
      window.kakao.maps.event.addListener(marker, "click", () => {
        console.log("마커 클릭됨:", position) // 디버깅용 로그 추가

        const locationInfo = {
          id: position.id ,
          name: position.name,
          address: position.address || position.roadAddress,
          category: position.category,
          lat: Number(position.lat),
          lng: Number(position.lng),
        }

        // 선택된 장소 정보 설정
        setSelectedLocation(locationInfo)

        // 선택한 마커 정보 저장
        setSelectedMarker({ marker })

        // 지도 중심을 마커 위치로 이동
        map.setCenter(markerPosition)

        // 선택한 장소 정보 전달
        if (onLocationSelect) {
          onLocationSelect(locationInfo)
        }

        // 선택된 장소 카드가 보이도록 스크롤
        setTimeout(() => {
          const card = document.querySelector(".selected-place-card")
          if (card) {
            card.scrollIntoView({ behavior: "smooth", block: "nearest" })
          }
        }, 100)
      })

      return marker
    })

    // 마커 참조 저장
    markersRef.current = markers

    // 클러스터러에 마커 추가
    if (clustererRef.current) {
      clustererRef.current.addMarkers(markers)
    }
  }, [map, markerPositions, onLocationSelect, useCluster])

  useEffect(() => {
    if (!map || !selectedPlace) {
      return
    }
    const { lat, lng} = selectedPlace

    const position = new window.kakao.maps.LatLng(lat, lng)

    if (selectedMarker) {
      selectedMarker.marker.setMap(null)
    }

    const marker = new window.kakao.maps.Marker({
      map,
      position,
    })

    // 선택된 장소 정보 설정
    setSelectedLocation(selectedPlace)

    map.setCenter(position)
    setSelectedMarker({ marker })
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
    }

    // 새 마커 생성
    const position = new window.kakao.maps.LatLng(result.y, result.x)
    const marker = new window.kakao.maps.Marker({
      map: map,
      position: position,
    })

    // 선택된 장소 정보 설정
    const locationInfo = {
      name: result.place_name,
      address: result.road_address_name || result.address_name,
      lat: result.y,
      lng: result.x,
      category: result.category_group_name || result.category_name || "",
      id: result.id,
    }

    setSelectedLocation(locationInfo)
    setSelectedMarker({ marker })

    // 지도 중심 이동
    map.setCenter(position)

    // 선택한 장소 정보 전달
    if (onLocationSelect) {
      onLocationSelect(locationInfo)
    }

    // 검색 결과 초기화
    setSearchResults([])
  }

  // 장소 정보 카드에서 상세보기 버튼 클릭 시
  const handleDetail = () => {
    const placeId = selectedPlace?.id || selectedLocation?.id
    if (placeId) {
      window.location.href = `/places/place/${placeId}`
    }
  }

  return (
    <div className="kakao-map-container" style={{ position: "relative" }}>
      {/* 지도 */}
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

      {/* 장소 정보 카드 */}
      {showInfoCard && (selectedPlace || selectedLocation) && (
        <div className="place-info-card">
          <div className="place-info-title">
            <i className="bi bi-geo-alt-fill place-info-icon" />
            {(selectedPlace || selectedLocation).name}
          </div>
          <div className="place-info-address">
            <i className="bi bi-geo-alt me-1 place-info-icon" />
            {(selectedPlace || selectedLocation).address}
          </div>
          {(selectedPlace || selectedLocation).category && (
            <div className="place-info-category">{(selectedPlace || selectedLocation).category}</div>
          )}
          <div className="place-info-btns">
            <button className="place-info-btn" onClick={handleDetail}>
              상세보기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default KakaoMap
