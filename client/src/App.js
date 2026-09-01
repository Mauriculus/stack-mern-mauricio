import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Search from './pages/Search';
import CreateClass from './pages/CreateClass';
import ClassView from './pages/ClassView';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import PlaylistView from './pages/PlaylistView.js';


import EditClass from './pages/EditClass';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (novoToken) => {
    localStorage.setItem('token', novoToken);
    setToken(novoToken);
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail onLogin={handleLogin} />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/pesquisar" element={<Search />} />
          <Route path="/criar-aula" element={token ? <CreateClass /> : <Navigate to="/login" replace />} />
          <Route path="/aula/:classId" element={<ClassView />} />
          <Route path="/playlist/:playlistId" element={<PlaylistView />} />
          <Route path="/editar-aula/:classId" element={token ? <EditClass /> : <Navigate to="/login" replace />} />
          <Route path="/perfil" element={token ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="/perfil/:userId" element={token ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={token ? <Admin /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}