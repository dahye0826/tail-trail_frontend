import { useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:9000/api';

/**
 * 장소 조회 추적을 위한 훅
 * 사용자가 특정 장소를 조회할 때마다 서버에 기록하여 추천 알고리즘에 활용
 * 
 * @param {Object} params
 * @param {number} params.placeId - 조회 중인 장소 ID
 * @param {number} params.userId - 현재 로그인한 사용자 ID (선택적)
 */
export const usePlaceViewTracker = ({ placeId, userId }) => {
  useEffect(() => {
    if (!placeId || isNaN(placeId)) return;
    if (!userId || isNaN(userId)) return;
  
    const startTime = Date.now();
  
    // cleanup 함수 - 페이지 이탈 시 기록
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // 초 단위로 변환
      
      if (timeSpent > 5) {
        const requestData = {
          placeId,
          userId,
          timeSpent,
          viewedAt: new Date().toISOString()
        };
        
        console.log('Sending tracking data:', requestData);
        
        (async () => {
          try {
            const response = await axios.post(`${API_BASE_URL}/track/place-views`, requestData);
            console.log('Tracking response:', response.data);
          } catch (error) {
            console.error('장소 이탈 추적 실패:', error);
            if (error.response) {
              console.error('Error response:', error.response.data);
            }
          }
        })();
      }
    };
  }, [placeId, userId]);
  
  return null;
};