import React, { useEffect, useState } from 'react';
import api from '../services/api';

const VisitedPlacesPage = () => {
  const [visitedPlaces, setVisitedPlaces] = useState([]);

  useEffect(() => {
    const fetchVisitedPlaces = async () => {
      try {
        const response = await api.get('/api/visited');
        console.log('API 전체 응답:', response);
        
        if (response.data && Array.isArray(response.data)) {
          const processedData = response.data.map(visit => ({
            ...visit,
            place: visit.place || {},
            created_at: visit.created_at || new Date().toISOString()
          }));
          setVisitedPlaces(processedData);
        }
      } catch (error) {
        console.error('방문 데이터 로딩 오류:', error);
      }
    };

    fetchVisitedPlaces();
  }, []);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default VisitedPlacesPage; 