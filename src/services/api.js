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

// 댓글 관련 API 추가
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

// 플레이스뷰 관련 API 추가
export const placeViewAPI = {
  trackView: (placeId, userId, timeSpent) => api.post('/track/place-view', {
    placeId,
    userId,
    viewedAt: new Date().toISOString(),
    timeSpent
  })
};

// 요청 인터셉터 - 토큰 추가
const addTokenInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

addTokenInterceptor(api);

// 인증 관련 API
export const authAPI = {
  login: async (email, password) => {
    try {
      console.log('로그인 요청:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('로그인 응답:', response.data);
      
      // 로그인 성공 시 로컬 스토리지에 사용자 정보 저장 (일관된 방식으로)
      if (response.data) {
        // 모든 필요한 정보를 동일한 방식으로 저장
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userName', response.data.userName);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isLoggedIn', 'true');
      }
      
      return response;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  },
  
  signup: (userData) => api.post('/auth/signup', userData),
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName'); 
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    return Promise.resolve();
  }
};

// 사용자 관련 API
export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  getUserStats: (userId) => {
    // 여러 API 호출을 통합하여 사용자 통계 가져오기
    const postsPromise = api.get(`/users/${userId}/posts?page=1&size=1`);
    const visitedPromise = api.get(`/visited-places?userId=${userId}&page=1&size=1`);
    const favoritesPromise = api.get(`/favorites?userId=${userId}&page=1&size=1`);
    
    return Promise.all([postsPromise, visitedPromise, favoritesPromise])
      .then(([postsRes, visitedRes, favoritesRes]) => {
        return {
          data: {
            posts: postsRes.data.totalItems || 0,
            visited_places: visitedRes.data.totalItems || 0,
            favorites: favoritesRes.data.totalItems || 0
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
  getPostById: (postId) => api.get(`/community/${postId}`)
};

// 장소 관련 API
export const placeAPI = {
  getPlaces: (page, size, search, industry, city, district) => {
    return api.get(`/places`, {
      params: { page, size, search, industry, city, district }
    });
  },
  getPlaceById: (placeId) => api.get(`/places/${placeId}`)
};

// visitedAPI 확장
export const visitedAPI = {
  getMyVisitedPlaces: async (userId, page = 1, size = 5) => {
    try {
      console.log(`방문 이력 조회 요청 - 사용자 ID: ${userId}, 페이지: ${page}, 크기: ${size}`);
      
      // 요청 확인용 로그
      console.log(`API 요청 URL: ${API_URL}/visited-places?userId=${userId}&page=${page}&size=${size}`);
      
      const response = await api.get(`/visited-places`, {
        params: { userId, page, size }
      });
      
      console.log('방문 이력 API 응답:', response);
      console.log('응답 데이터 구조:', response.data);
      
      // 응답이 비어있는지 확인
      if (!response.data || 
          (response.data.visitedPlaces && response.data.visitedPlaces.length === 0)) {
        console.log('방문 이력이 없습니다.');
      }
      
      return response;
    } catch (error) {
      console.error('방문 이력 가져오기 오류:', error);
      if (error.response) {
        console.error('오류 상태:', error.response.status);
        console.error('오류 데이터:', error.response.data);
      }
      throw error;
    }
  },
  
  addVisitedPlace: async (visitData) => {
    try {
      console.log('방문 이력 추가 요청 데이터:', visitData);
      const response = await api.post(`/visited-places`, visitData);
      console.log('방문 이력 추가 응답:', response);
      return response;
    } catch (error) {
      console.error('방문 이력 추가 오류:', error);
      throw error;
    }
  },
  
  updateVisitedPlace: async (visitId, visitData) => {
    try {
      console.log(`방문 이력 업데이트 요청: visitId=${visitId}`, visitData);
      const response = await api.put(`/visited-places/${visitId}`, visitData);
      console.log('방문 이력 업데이트 응답:', response);
      return response;
    } catch (error) {
      console.error('방문 이력 업데이트 오류:', error);
      throw error;
    }
  },
  
  deleteVisitedPlace: async (visitId) => {
    try {
      console.log(`방문 이력 삭제 요청: visitId=${visitId}`);
      const response = await api.delete(`/visited-places/${visitId}`);
      console.log('방문 이력 삭제 응답:', response);
      return response;
    } catch (error) {
      console.error('방문 이력 삭제 오류:', error);
      throw error;
    }
  }
};

// 즐겨찾기 관련 API
export const favoriteAPI = {
  // 즐겨찾기 목록 가져오기
  getFavorites: async (userId, page = 1, size = 10) => {
    try {
      const response = await api.get(`/favorites`, {
        params: { userId, page, size }
      });
      console.log('즐겨찾기 API 응답:', response);
      return response;
    } catch (error) {
      console.error('즐겨찾기 가져오기 오류:', error);
      throw error;
    }
  },

  // 즐겨찾기 추가
  addFavorite: async (userId, placeId) => {
    try {
      const response = await api.post(`/favorites`, null, {
        params: { userId, placeId }
      });
      return response;
    } catch (error) {
      console.error('즐겨찾기 추가 오류:', error);
      throw error;
    }
  },

  // 즐겨찾기 삭제
  removeFavorite: async (userId, placeId) => {
    try {
      const response = await api.delete(`/favorites`, {
        params: { userId, placeId }
      });
      return response;
    } catch (error) {
      console.error('즐겨찾기 삭제 오류:', error);
      throw error;
    }
  },

  // 즐겨찾기 여부 확인
  checkFavorite: async (userId, placeId) => {
    try {
      const response = await api.get(`/favorites/check`, {
        params: { userId, placeId }
      });
      return response.data;
    } catch (error) {
      console.error('즐겨찾기 확인 오류:', error);
      throw error;
    }
  }


  
};

export default api;