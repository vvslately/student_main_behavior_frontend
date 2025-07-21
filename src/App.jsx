import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Login from './pages/login'
import Register from './pages/register'
import Home from './pages/home'
import Behaviors from './pages/behaviors'
import Cases from './pages/cases'
import Students from './pages/students'
import Admins from './pages/admins'
import Menu from './components/menu'
import LoginLogs from './pages/logs'

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
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
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/behaviors" element={<Behaviors />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/students" element={<Students />} />
          <Route path="/admins" element={<Admins />} />
          <Route path="/logs" element={<LoginLogs />}/>
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
