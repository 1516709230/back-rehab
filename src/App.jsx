import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { initDB } from './db';
import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Progress from './pages/Progress';
import Settings from './pages/Settings';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center text-gray-500">
      <p>初始化中...</p>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 text-center text-red-600">
      <p>{message}</p>
    </div>
  );
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    initDB()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error('DB init failed:', err);
        setDbError('数据库初始化失败');
      });
  }, []);

  if (dbError) return <ErrorScreen message={dbError} />;
  if (!dbReady) return <LoadingScreen />;

  return (
    <HashRouter>
      <div className="mx-auto min-h-screen max-w-md bg-gray-50 pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  );
}
