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
      
      // 2. 방문 이력 수 조회 - 백엔드 엔드포인트와 일치시킴
      const visitedRes = await api.get(`/visited-place/mypage`, {
        params: { userId, page: 1, size: 1 }
      });
      
      // 3. 즐겨찾기 수 조회
      const favoritesRes = await api.get(`/favorites`, {
        params: { userId, page: 1, size: 1 }
      });
      
      // 응답 구조 확인 및 로깅
      console.log("Posts response:", postsRes.data);
      console.log("Visited response:", visitedRes.data);
      console.log("Favorites response:", favoritesRes.data);
      
      // 방문 이력 데이터 추출 - 다양한 응답 구조 지원
      let visitedCount = 0;
      
      if (visitedRes.data) {
        if (visitedRes.data.totalItems !== undefined) {
          visitedCount = visitedRes.data.totalItems;
        } else if (visitedRes.data.totalElements !== undefined) {
          visitedCount = visitedRes.data.totalElements;
        } else if (Array.isArray(visitedRes.data)) {
          visitedCount = visitedRes.data.length;
        } else if (visitedRes.data.data && visitedRes.data.data.totalItems !== undefined) {
          visitedCount = visitedRes.data.data.totalItems;
        } else if (visitedRes.data.visitedPlaces && Array.isArray(visitedRes.data.visitedPlaces)) {
          visitedCount = visitedRes.data.visitedPlaces.length;
        }
      }
      
      // 포스트 및 즐겨찾기 데이터 추출
      let postCount = postsRes.data?.totalItems || 0;
      let favoriteCount = favoritesRes.data?.totalItems || 0;
      
      // 최종 결과 반환
      const result = {
        data: {
          postCount,
          visitedCount,
          favoriteCount
        }
      };
      
      console.log("최종 통계 결과:", result);
      return result;
    } catch (error) {
      console.error("통계 가져오기 오류:", error);
      // 오류 발생시 기본값 제공
      return {
        data: {
          postCount: 0,
          visitedCount: 0,
          favoriteCount: 0
        }
      };
    }
  },
  
  updateProfile: (userId, userData) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  
  getUserStats: async (userId) => {
    try {
      // 1. 게시글 수 조회
      const postsRes = await api.get(`/users/${userId}/posts?page=1&size=1`);
      
      // 2. 방문 이력 수 조회 - 백엔드 엔드포인트와 일치시킴
      const visitedRes = await api.get(`/visited-place/mypage`, {
        params: { userId, page: 1, size: 1 }
      });
      
      // 3. 즐겨찾기 수 조회
      const favoritesRes = await api.get(`/favorites`, {
        params: { userId, page: 1, size: 1 }
      });
      
      // 응답 구조 확인 및 로깅
      console.log("Posts response:", postsRes.data);
      console.log("Visited response:", visitedRes.data);
      console.log("Favorites response:", favoritesRes.data);
      
      // 방문 이력 데이터 추출 - 다양한 응답 구조 지원
      let visitedCount = 0;
      
      if (visitedRes.data) {
        if (visitedRes.data.totalItems !== undefined) {
          visitedCount = visitedRes.data.totalItems;
        } else if (visitedRes.data.totalElements !== undefined) {
          visitedCount = visitedRes.data.totalElements;
        } else if (Array.isArray(visitedRes.data)) {
          visitedCount = visitedRes.data.length;
        } else if (visitedRes.data.data && visitedRes.data.data.totalItems !== undefined) {
          visitedCount = visitedRes.data.data.totalItems;
        } else if (visitedRes.data.visitedPlaces && Array.isArray(visitedRes.data.visitedPlaces)) {
          visitedCount = visitedRes.data.visitedPlaces.length;
        }
      }
      
      // 포스트 및 즐겨찾기 데이터 추출
      let postCount = postsRes.data?.totalItems || 0;
      let favoriteCount = favoritesRes.data?.totalItems || 0;
      
      // 최종 결과 반환
      const result = {
        data: {
          postCount,
          visitedCount,
          favoriteCount
        }
      };
      
      console.log("최종 통계 결과:", result);
      return result;
    } catch (error) {
      console.error("통계 가져오기 오류:", error);
      // 오류 발생시 기본값 제공
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
      
      // 응답 로깅 추가
      console.log("방문 이력 API 응답:", response.data);
      
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

// 즐겨찾기 관련 API - 수정
export const favoriteAPI = {
  getFavorites: (userId, page = 1, size = 10) => api.get(`/favorites`, {
    params: { userId, page, size }
  }),

  // 즐겨찾기 추가 - 백엔드 요구사항에 맞게 수정
  addFavorite: (placeId, userId = null) => {
    // 사용자 ID가 없으면 로컬 스토리지에서 가져오기
    if (!userId) {
      userId = localStorage.getItem("userId");
    }
    
    if (!userId) {
      return Promise.reject(new Error("사용자 ID를 찾을 수 없습니다"));
    }
    
    // 토글 엔드포인트 사용
    return api.post(`/favorites/toggle`, null, {
      params: {
        userId: Number(userId),
        placeId: Number(placeId)
      }
    });
  },

  // 즐겨찾기 삭제 - 백엔드 요구사항에 맞게 수정
  removeFavorite: (placeId, userId = null) => {
    // 사용자 ID가 없으면 로컬 스토리지에서 가져오기
    if (!userId) {
      userId = localStorage.getItem("userId");
    }
    
    if (!userId) {
      return Promise.reject(new Error("사용자 ID를 찾을 수 없습니다"));
    }
    
    // 토글 엔드포인트 사용
    return api.post(`/favorites/toggle`, null, {
      params: {
        userId: Number(userId),
        placeId: Number(placeId)
      }
    });
  },

  // 토글 메서드 추가
  toggleFavorite: (userId, placeId) => {
    return api.post(`/favorites/toggle`, null, {
      params: {
        userId: Number(userId),
        placeId: Number(placeId)
      }
    });
  },

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