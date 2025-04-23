import { useEffect, useRef } from "react"
import { placeViewAPI } from "../services/api" // 중앙화된 API 사용
import { useAuth } from "../contexts/AuthContext" // AuthContext 사용

export function usePlaceViewTracker({ placeId }) {
  const timeSpent = useRef(0)
  const timerRef = useRef(null)
  const { user, isLoggedIn } = useAuth() // AuthContext에서 가져오기

  useEffect(() => {
    // 로그인한 사용자만 추적
    if (!isLoggedIn || !user?.id) return
    
    timerRef.current = setInterval(() => {
      timeSpent.current += 1
    }, 1000)
  
    return () => {
      clearInterval(timerRef.current)
      
      // 중앙화된 API 사용
      placeViewAPI.trackView(placeId, user.id, timeSpent.current)
        .catch((err) => {
          console.error("장소 조회 추적 실패:", err)
        })
    }
  }, [placeId, isLoggedIn, user]) 
}