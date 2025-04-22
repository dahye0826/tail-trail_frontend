import { BrowserRouter, Routes, Route } from "react-router-dom"
import PostListPage from "./pages/community/PostListPage"
import PostDetailPage from "./pages/community/PostDetailPage"
import EditPostPage from "./pages/community/EditPostPage"
import WritePostPage from "./pages/community/WritePostPage"
import PlaceListPage from "./pages/places/PlaceListPage"
import PlaceDetailPage from "./pages/places/PlaceDetailPage"
import LoginPage from "./pages/auth/LoginPage"
import SignupPage from "./pages/auth/SignupPage"
import MyPage from "./pages/mypage/MyPage"
import MyPostsPage from "./pages/mypage/MyPostsPage"
import ProfileEditPage from "./pages/mypage/ProfileEditPage"
import HomePage from "./pages/home/HomePage"
import MapViewPage from "./pages/map/MapViewPage"
import CommentSection from "./pages/community/CommentSection"
import ReviewModal from "./pages/places/ReviewModal"




function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} /> 
        <Route path="/community" element={<PostListPage />} />
        <Route path="/community/write" element={<WritePostPage />} />
        <Route path="/community/post/:id" element={<PostDetailPage />} />
        <Route path="/community/edit/:id" element={<EditPostPage />} />
        <Route path="/places" element={<PlaceListPage />} />
        <Route path="/places/place/:id" element={<PlaceDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/posts" element={<MyPostsPage />} />
        <Route path="/mypage/edit-profile" element={<ProfileEditPage />} />
        <Route path="/map" element={<MapViewPage />} />
        <Route path="/community/post/:id" element={<CommentSection />} />
        <Route path="/review" element={<ReviewModal />} />
        
        

        
        
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter

