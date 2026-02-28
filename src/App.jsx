import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AccesoRequerido from './components/Auth/AccesoRequerido';

// Importaremos estos después
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/acceso-requerido" element={
            <ProtectedRoute requirePremium={false}>
              <AccesoRequerido />
            </ProtectedRoute>
          } />

          <Route path="/" element={
            <ProtectedRoute requirePremium={true}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
