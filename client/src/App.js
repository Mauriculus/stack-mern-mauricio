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
import CreateClass from './pages/CreateClass'


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
          <Route path="/" element={token ? <Home /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail onLogin={handleLogin} />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/pesquisar" element={token ? <Search /> : <Navigate to="/login" replace />} />
          <Route path="/criar-aula" element={token ? <CreateClass /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}