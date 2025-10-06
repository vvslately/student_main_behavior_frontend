import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Login from './pages/login'
import Register from './pages/register'
import Home from './pages/home'
import Behaviors from './pages/behaviors'
import Cases from './pages/cases'
import Students from './pages/students'
import Admins from './pages/admins'
import Menu from './components/menu'
import LoginLogs from './pages/logs_page'

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

// Component สำหรับตรวจสอบการล็อกอิน
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppContent() {
  const location = useLocation();
  const hideMenu = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';
  
  return (
    <>
      {!hideMenu && <Menu />}
      <main
        style={{
          minHeight: '100vh',
          padding: 0,
          margin: 0,
          paddingLeft: !hideMenu ? 320 : 0,
          transition: 'padding-left 0.3s',
        }}
        className="main-content"
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/behaviors" element={
            <ProtectedRoute>
              <Behaviors />
            </ProtectedRoute>
          } />
          <Route path="/cases" element={
            <ProtectedRoute>
              <Cases />
            </ProtectedRoute>
          } />
          <Route path="/students" element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          } />
          <Route path="/admins" element={
            <ProtectedRoute>
              <Admins />
            </ProtectedRoute>
          } />
          <Route path="/logs" element={
            <ProtectedRoute>
              <LoginLogs />
            </ProtectedRoute>
          }/>
        </Routes>
      </main>
      <style>{`
        @media (max-width: 700px) {
          .main-content {
            padding-left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}

export default App
