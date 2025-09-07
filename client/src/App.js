import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LyfeBoard from './pages/LyfeBoard';
import VybeTree from './pages/VybeTree';
import VybeStrike from './pages/VybeStrike';
import VybeZone from './pages/VybeZone';
import VShop from './pages/VShop';
import MoneyMoves from './pages/MoneyMoves';
import BVyral from './pages/BVyral';
import Skrybe from './pages/Skrybe';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gradient-cyber text-white">
            <Navbar />
            <main className="pt-16">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/lyfeboard" element={
                  <ProtectedRoute>
                    <LyfeBoard />
                  </ProtectedRoute>
                } />
                <Route path="/vybetree" element={
                  <ProtectedRoute>
                    <VybeTree />
                  </ProtectedRoute>
                } />
                <Route path="/vybestrike" element={
                  <ProtectedRoute>
                    <VybeStrike />
                  </ProtectedRoute>
                } />
                <Route path="/vybezone" element={
                  <ProtectedRoute>
                    <VybeZone />
                  </ProtectedRoute>
                } />
                <Route path="/vshop" element={
                  <ProtectedRoute>
                    <VShop />
                  </ProtectedRoute>
                } />
                <Route path="/moneymoves" element={
                  <ProtectedRoute>
                    <MoneyMoves />
                  </ProtectedRoute>
                } />
                <Route path="/bvyral" element={
                  <ProtectedRoute>
                    <BVyral />
                  </ProtectedRoute>
                } />
                <Route path="/skrybe" element={
                  <ProtectedRoute>
                    <Skrybe />
                  </ProtectedRoute>
                } />
                <Route path="/profile/:username" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'font-cyber',
                success: {
                  className: 'toast-success',
                  iconTheme: {
                    primary: '#0a0a0f',
                    secondary: '#00ff41',
                  },
                },
                error: {
                  className: 'toast-error',
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#ff4757',
                  },
                },
                loading: {
                  className: 'toast-loading',
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#8b5cf6',
                  },
                },
              }}
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;