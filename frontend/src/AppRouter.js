import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MyPage from './pages/MyPage';
import MyPageMain from './pages/MyPageMain';
import VisitedPlacesPage from './pages/VisitedPlacesPage';
import FavoritePlacesPage from './pages/FavoritePlacesPage';
import UserPostsPage from './pages/UserPostsPage';
import UserSettingsPage from './pages/UserSettingsPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/mypage" element={<MyPage />}>
        <Route index element={<MyPageMain />} />
        <Route path="visited" element={<VisitedPlacesPage />} />
        <Route path="favorites" element={<FavoritePlacesPage />} />
        <Route path="posts" element={<UserPostsPage />} />
        <Route path="settings" element={<UserSettingsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter; 