import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import './App.css'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost'
import Register from './pages/Register'
import UserPosts from './pages/UserPosts'
import Messages from './pages/Messages'
import Navbar from './components/Navbar'
import Profile from './pages/Profile'
import AIchat from './pages/AIchat'
function App() {
  // Layout wrapper function
  const WithNavbar = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token'); // Replace with your auth check

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return (
      <>
        <Navbar />
        {children}
      </>
    );
  };

  return (
    <Router>
<div className="min-h-screen bg-slate-50 overflow-hidden">
  <main>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes with Navbar */}
            <Route
              path="/"
              element={
                <WithNavbar>
                  <Home />
                </WithNavbar>
              }
            />
            <Route
              path="/ai-chat"
              element={
                <WithNavbar>
                  <AIchat />
                </WithNavbar>
              }
            />
            <Route
              path="/profile"
              element={
                <WithNavbar>
                  <Profile />
                </WithNavbar>
              }
            />
            <Route
              path="/home"
              element={
                <WithNavbar>
                  <Home />
                </WithNavbar>
              }
            />
            <Route
              path="/create-post"
              element={
                <WithNavbar>
                  <CreatePost />
                </WithNavbar>
              }
            />
            <Route
              path="/user-posts/:userId"
              element={
                <WithNavbar>
                  <UserPosts />
                </WithNavbar>
              }
            />
            <Route
              path="/messages"
              element={
                <WithNavbar>
                  <Messages />
                </WithNavbar>
              }
            />
          </Routes>
        </main>
        {/* Footer could go here */}
      </div>
    </Router>
  )
}

export default App