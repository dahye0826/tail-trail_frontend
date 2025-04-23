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
// AppRouter.js에 경로 추가
import FavoritesPage from "./pages/mypage/FavoritesPage";
import VisitedPlacesPage from "./pages/mypage/VisitedPlacesPage"; // 방문 이력 페이지 import



function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
        
        

        {/* // 기존 라우트 사이에 추가 */}
        <Route path="/mypage/favorites" element={<FavoritesPage /> } />
        <Route path="/mypage/visited" element={<VisitedPlacesPage /> } />     
        
        
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default AppRouter

