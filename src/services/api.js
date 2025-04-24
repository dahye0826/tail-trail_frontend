// src/services/api.js
import axios from 'axios';

// 모든 API 요청을 9000 포트로 통일
const API_URL = 'http://localhost:9000/api';

// 기본 API 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 토큰 처리를 위한 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 응답 형식 확인
api.interceptors.response.use(
  (response) => {
    // BaseResponse 형식인 경우
    if (response.data && response.data.hasOwnProperty('success')) {
      if (!response.data.success) {
        return Promise.reject(new Error(response.data.message || '요청 처리 중 오류가 발생했습니다.'));
      }
      return response;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // 로그인 성공 시 로컬 스토리지에 사용자 정보 저장
      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', userData.userId);
        localStorage.setItem('userName', userData.userName);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userRole', userData.role);
        
        if (userData.profile) {
          localStorage.setItem('userProfile', userData.profile);
        }
      }
      
      return response;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  },
  
  signup: (userData) => api.post('/auth/signup', userData),
  
  logout: () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName'); 
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    return Promise.resolve();
  }
};

// 사용자 관련 API
export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  
  getUserStats: async (userId) => {
    try {
      // 1. 게시글 수 조회
      const postsRes = await api.get(`/users/${userId}/posts?page=1&size=1`);
      
      // 2. 방문 이력 수 조회 - 올바른 엔드포인트 사용
      const visitedRes = await api.get(`/visited-place/mypage?userId=${userId}&page=1&size=1`);
      
      // 3. 즐겨찾기 수 조회
      const favoritesRes = await api.get(`/favorites?userId=${userId}&page=1&size=1`);
      
      // 디버깅을 위한 로깅
      console.log("Posts response:", postsRes.data);
      console.log("Visited response:", visitedRes.data);
      console.log("Favorites response:", favoritesRes.data);
      
      // 백엔드 응답 구조에 맞게 데이터 추출
      return {
        data: {
          postCount: postsRes.data?.totalItems || 0,
          visitedCount: visitedRes.data?.totalItems || 0,
          favoriteCount: favoritesRes.data?.totalItems || 0
        }
      };
    } catch (error) {
      console.error("통계 가져오기 오류:", error);
      // 오류가 발생해도 UI가 깨지지 않도록 기본값 제공
      return {
        data: {
          postCount: 0,
          visitedCount: 0,
          favoriteCount: 0
        }
      };
    }
  },
  
  updateProfile: (userId, userData) => api.put(`/users/${userId}`, userData)
};

// 게시글 관련 API
export const postAPI = {
  getPosts: (page, size, search) => api.get(`/community`, {
    params: { page, size, search }
  }),
  
  getMyPosts: (userId, page, size) => api.get(`/users/${userId}/posts`, {
    params: { page, size }
  }),
  
  createPost: (postData) => api.post('/community', postData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  getPostById: (postId) => api.get(`/community/${postId}`),
  
  updatePost: (postId, postData) => api.post(`/community/${postId}/update`, postData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  deletePost: (postId) => api.delete(`/community/${postId}`)
};

// 장소 관련 API
export const placeAPI = {
  getPlaces: (page, size, search, industry, city, district) => {
    return api.get(`/places`, {
      params: { page, size, search, industry, city, district }
    });
  },
  
  getPlaceById: (placeId) => api.get(`/places/${placeId}`),
  
  searchPlaces: (keyword) => api.get(`/places/search`, {
    params: { keyword }
  }),
  
  getAllCities: () => api.get(`/places/cities`),
  
  getAllCategories: () => api.get(`/places/categories`)
};

// 댓글 관련 API
export const commentAPI = {
  getComments: (postId) => api.get(`/comments/post/${postId}`),
  
  createComment: (postId, content) => api.post('/comments', {
    postId,
    content
  }),
  
  updateComment: (commentId, content) => api.put(`/comments/${commentId}`, {
    content
  }),
  
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`)
};

// 방문 이력 관련 API - 엔드포인트 수정
export const visitedAPI = {
  getMyVisitedPlaces: async (userId, page = 1, size = 5) => {
    try {
      // 'visited-places' -> 'visited-place'로 수정
      const response = await api.get(`/visited-place/mypage`, {
        params: { userId, page, size }
      });
      return response;
    } catch (error) {
      console.error('방문 이력 가져오기 오류:', error);
      throw error;
    }
  },
  
  getPlaceReviews: (placeId) => api.get(`/visited-place/reviews`, {
    params: { placeId }
  }),
  
  addVisitedPlace: (visitData) => api.post(`/visited-place`, visitData),
  
  updateVisitedPlace: (visitId, visitData) => api.put(`/visited-place/${visitId}`, visitData),
  
  deleteVisitedPlace: (visitId) => api.delete(`/visited-place/${visitId}`)
};

// 즐겨찾기 관련 API - 애플리케이션 실제 사용 방식에 맞게 수정
export const favoriteAPI = {
  // 즐겨찾기 목록 가져오기
  getFavorites: (userId, page = 1, size = 10) => api.get(`/favorites`, {
    params: { userId, page, size }
  }),

  // 즐겨찾기 추가 - PlaceListPage.js에서 사용하는 방식과 일치시킴
  addFavorite: (placeId) => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    return api.post(`/user/favorites/${placeId}`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // 즐겨찾기 삭제 - PlaceListPage.js에서 사용하는 방식과 일치시킴
  removeFavorite: (placeId) => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    return api.delete(`/user/favorites/${placeId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // userId 사용 방식 지원
  removeUserFavorite: (userId, placeId) => api.delete(`/favorites/${userId}/${placeId}`),

  // 즐겨찾기 확인
  checkFavorite: (userId, placeId) => api.get(`/favorites/check`, {
    params: { userId, placeId }
  })
};

// 장소 조회 트래킹 API
export const placeViewAPI = {
  trackView: (placeId, userId, timeSpent) => api.post('/track/place-view', {
    placeId,
    userId,
    viewedAt: new Date().toISOString(),
    timeSpent
  })
};

export default api;