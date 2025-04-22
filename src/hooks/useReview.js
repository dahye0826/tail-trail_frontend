import axios from "axios"

export const useReview = () => {
  const submitReview = async ({ userId, placeId, rating, note, visitId }) => {
    const payload = {
      user_id: userId || 1, //테스트용 ID 
      place_id: placeId || 1, // 테스트용 ID
      rating,
      note,
      visit_date: new Date().toISOString().slice(0, 10),
      created_at: new Date().toISOString().slice(0, 10),
    }

    if (visitId) {
      // const res = await axios.put(`http://localhost:9000/api/visited-place/1`, payload)
      const res = await axios.put(`http://localhost:9000/api/visited-place/${visitId}`, payload)
      return res.data
    } else {
      const res = await axios.post("http://localhost:9000/api/visited-place", payload)
      return res.data
    }
  }

  const deleteReview = async (visitId) => {
    // await axios.delete(`http://localhost:9000/api/visited-place/1`)
    await axios.delete(`http://localhost:9000/api/visited-place/${visitId}`)
    
  }

  return { submitReview, deleteReview }
}
