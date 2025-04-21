
import { useEffect, useRef } from "react"
import axios from "axios"

export function usePlaceViewTracker({ placeId, userId }) {
  const timeSpent = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!userId) return
    timerRef.current = setInterval(() => {
      timeSpent.current += 1
    }, 1000)
  
    return () => {
      clearInterval(timerRef.current)
  
      axios.post("http://localhost:9000/api/track/place-view", {
        placeId: placeId,
        userId: userId,
        viewedAt: new Date().toISOString(),
        timeSpent: timeSpent.current
      }).catch((err) => {
        console.error("place-view 전송 실패:", err)
      })
    }
  }, [placeId, userId]) 
}  
