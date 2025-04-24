// 5. 인증 컨텍스트 연결 (App.js)

// src/App.js
import React from 'react';
import AppRouter from './AppRouter';
import { BrowserRouter } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}

export default App;