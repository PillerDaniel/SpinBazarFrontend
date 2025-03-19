import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/HomePage';
import Blackjack from './pages/Blackjack';
import { AuthProvider } from './context/AuthContext';
import '../i18n.js';
function App() {
  return (

    <Router>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path='/blackjack' element={<Blackjack />} />
      </Routes>
      </AuthProvider>
    </Router>

  );
}

export default App;
