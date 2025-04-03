// 이 파일은 백엔드 연결 전 테스트용으로 사용할 수 있습니다
export const mockPlaces = [
  {
    id: 1,
    name: "해운대 반려견 비치파크",
    address: "부산광역시 해운대구 우동",
    region: "부산",
    category: "여행지",
    description: "반려견과 함께 해변을 즐길 수 있는 특별한 공간입니다.",
    rating: 4.5,
    amenities: ["반려견 전용 공간", "물놀이 시설", "샤워 시설"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    name: "멍멍 애견카페",
    address: "서울시 강남구 테헤란로 123",
    region: "서울",
    category: "카페",
    description: "다양한 견종들과 놀 수 있는 애견 카페입니다.",
    rating: 4.2,
    amenities: ["실내 놀이터", "간식 제공", "미용 서비스"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "펫 프렌들리 호텔",
    address: "제주시 애월읍 해안로 123",
    region: "제주",
    category: "숙박업소",
    description: "반려동물과 함께 제주도를 즐길 수 있는 호텔입니다.",
    rating: 4.8,
    amenities: ["반려견 용품 제공", "야외 정원", "반려견 메뉴"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    name: "가평 글램핑장",
    address: "경기도 가평군 청평면",
    region: "경기",
    category: "여행지",
    description: "반려견과 함께 자연을 즐길 수 있는 글램핑장입니다.",
    rating: 4.0,
    amenities: ["바베큐 시설", "반려견 놀이터", "산책로"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    name: "동물병원 24시",
    address: "서울시 송파구 올림픽로 89",
    region: "서울",
    category: "의료시설",
    description: "24시간 운영되는 반려동물 전문 병원입니다.",
    rating: 4.7,
    amenities: ["24시간 진료", "전문의 상주", "응급 처치"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 6,
    name: "경주 반려견 놀이터",
    address: "경상북도 경주시 보문로 123",
    region: "경주",
    category: "여행지",
    description: "넓은 공간에서 반려견과 함께 뛰어놀 수 있는 놀이터입니다.",
    rating: 4.3,
    amenities: ["넓은 운동장", "장애물 코스", "휴식 공간"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 7,
    name: "강아지 수영장",
    address: "부산광역시 기장군 해운대로 456",
    region: "부산",
    category: "여행지",
    description: "반려견 전용 수영장으로 물놀이를 즐길 수 있습니다.",
    rating: 4.6,
    amenities: ["온수 풀", "안전 장비 대여", "전문 트레이너"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 8,
    name: "반려동물 동반 식당",
    address: "서울시 마포구 홍대로 123",
    region: "서울",
    category: "식당",
    description: "반려동물과 함께 식사를 즐길 수 있는 레스토랑입니다.",
    rating: 4.1,
    amenities: ["반려견 메뉴", "야외 테라스", "반려견 용품"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 9,
    name: "강원도 반려견 펜션",
    address: "강원도 평창군 대관령면",
    region: "강원",
    category: "숙박업소",
    description: "반려견과 함께 산속에서 휴식을 취할 수 있는 펜션입니다.",
    rating: 4.4,
    amenities: ["마당", "바베큐", "산책로"],
    image: "/placeholder.svg?height=200&width=300",
  },
]

// API 모듈 모의 구현
export const placesAPI = {
  getAllPlaces: async (useMock = false) => {
    if (useMock) {
      return {
        data: mockPlaces,
        error: false,
        message: "",
      }
    }

    // 실제 API 호출 구현
    try {
      // const response = await fetch('/api/places');
      // const data = await response.json();
      // return { data, error: false, message: "" };
      return {
        data: mockPlaces,
        error: false,
        message: "",
      }
    } catch (error) {
      return {
        data: [],
        error: true,
        message: "데이터를 불러오는데 실패했습니다.",
      }
    }
  },

  getFilteredPlaces: async (filters, useMock = false) => {
    if (useMock) {
      const { region, category, searchKeyword } = filters

      const filtered = mockPlaces.filter((place) => {
        const matchesRegion = region ? place.region === region : true
        const matchesCategory = category ? place.category === category : true
        const matchesKeyword = searchKeyword
          ? place.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            place.description.toLowerCase().includes(searchKeyword.toLowerCase())
          : true

        return matchesRegion && matchesCategory && matchesKeyword
      })

      return {
        data: filtered,
        error: false,
        message: "",
      }
    }

    // 실제 API 호출 구현
    try {
      // const response = await fetch(`/api/places/filter?${new URLSearchParams(filters)}`);
      // const data = await response.json();
      // return { data, error: false, message: "" };
      return {
        data: [],
        error: false,
        message: "",
      }
    } catch (error) {
      return {
        data: [],
        error: true,
        message: "필터링에 실패했습니다.",
      }
    }
  },

  searchPlaces: async (keyword, useMock = false) => {
    if (useMock) {
      const filtered = mockPlaces.filter(
        (place) =>
          place.name.toLowerCase().includes(keyword.toLowerCase()) ||
          place.description.toLowerCase().includes(keyword.toLowerCase()),
      )

      return {
        data: filtered,
        error: false,
        message: "",
      }
    }

    // 실제 API 호출 구현
    try {
      // const response = await fetch(`/api/places/search?q=${encodeURIComponent(keyword)}`);
      // const data = await response.json();
      // return { data, error: false, message: "" };
      return {
        data: [],
        error: false,
        message: "",
      }
    } catch (error) {
      return {
        data: [],
        error: true,
        message: "검색에 실패했습니다.",
      }
    }
  },
}

// 페이지네이션 유틸리티
export const paginationUtil = {
  getTotalPages: (totalItems, itemsPerPage) => {
    return Math.ceil(totalItems / itemsPerPage)
  },

  getPaginatedData: (data, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  },
}

