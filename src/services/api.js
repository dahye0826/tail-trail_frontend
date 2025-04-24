// 1. API 호출 중앙화 - api.js

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

// 요청 인터셉터 - 응답 형식 확인
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
    return Promise.resolve();
  }
};

// 사용자 관련 API
export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  
  getUserStats: (userId) => {
    // 여러 API 호출을 통합하여 사용자 통계 가져오기
    const postsPromise = api.get(`/users/${userId}/posts?page=1&size=1`);
    const visitedPromise = api.get(`/users/${userId}/visited-places?page=1&size=1`);
    const favoritesPromise = api.get(`/favorites?userId=${userId}&page=1&size=1`);
    
    return Promise.all([postsPromise, visitedPromise, favoritesPromise])
      .then(([postsRes, visitedRes, favoritesRes]) => {
        return {
          data: {
            posts: postsRes.data.data?.totalElements || 0,
            visited_places: visitedRes.data.data?.totalElements || 0,
            favorites: favoritesRes.data.data?.totalElements || 0
          }
        };
      });
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

// 방문 이력 관련 API
export const visitedAPI = {
  getMyVisitedPlaces: async (userId, page = 1, size = 5) => {
    try {
      const response = await api.get(`/visited-places/mypage`, {
        params: { userId, page, size }
      });
      return response;
    } catch (error) {
      console.error('방문 이력 가져오기 오류:', error);
      throw error;
    }
  },
  
  getPlaceReviews: (placeId) => api.get(`/visited-places/reviews`, {
    params: { placeId }
  }),
  
  addVisitedPlace: (visitData) => api.post(`/visited-places`, visitData),
  
  updateVisitedPlace: (visitId, visitData) => api.put(`/visited-places/${visitId}`, visitData),
  
  deleteVisitedPlace: (visitId) => api.delete(`/visited-places/${visitId}`)
};

// 즐겨찾기 관련 API
export const favoriteAPI = {
  getFavorites: (userId, page = 1, size = 10) => api.get(`/favorites`, {
    params: { userId, page, size }
  }),

  addFavorite: (userId, placeId) => api.post(`/favorites`, null, {
    params: { userId, placeId }
  }),

  removeFavorite: (userId, placeId) => api.delete(`/favorites`, {
    params: { userId, placeId }
  }),

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