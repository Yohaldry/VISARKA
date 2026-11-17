import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Catalogo from './components/Catalogo';
import ExploreSection from './components/ExploreSection';
import HowItWorks from './components/HowItWorks';
import Hero from './components/Hero.jsx';
import BusquedaenVivo from './components/BusquedaenVivo';
import Panelprfesionales from './pages/profesionales/PanelProfesionales.jsx';
import HomePrincipal from './pages/profesionales/HomePrincipal.jsx';
import LoginProfesionales from './pages/profesionales/LoginProfesionales.jsx';
import CalendarioBarberos from './pages/calendariobarberos/CalendarioBarberos.jsx';
import BarberBookingView from './pages/profesionales/BarberBookingView.jsx'

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mapea la ruta actual para saber qué pestaña está activa
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/panelprofesionales') return 'panelprofesionales';
    if (path === '/login') return 'login';
    if (path === '/calendariobarberos') return 'calendariobarberos';
    if (path.startsWith('/reservar/')) return 'reservar';
    return path.replace('/', '');
  };

  // Maneja la navegación al hacer clic en las pestañas
  const handleTabChange = (tabId) => {
    if (tabId === 'home') {
      navigate('/');
    } else if (tabId === 'panelprofesionales') {
      navigate('/panelprofesionales');
    } else if (tabId === 'login') {
      navigate('/login');
    } else if (tabId === 'calendariobarberos') {
      navigate('/calendariobarberos');
    } else {
      navigate(`/${tabId}`);
    }
  };

  // Maneja la selección del menú desplegable del botón de Iniciar Sesión
  const handleRoleSelection = (role) => {
    if (role === 'professional') {
      navigate('/panelprofesionales');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#00E5FF] selection:text-slate-950 m-0 p-0 overflow-x-hidden">
      
      {/* Contenedor principal */}
      <main className="flex-1 w-full m-0 p-0">
        <Routes>
          {/* Ruta de Inicio */}
          <Route path="/" element={<HomePrincipal />} />

          {/* Ruta del Calendario de Barberos */}
          <Route 
            path="/calendariobarberos" 
            element={
             <CalendarioBarberos />
            } 
          />

          {/* Ruta de Reserva Pública para el Cliente (con el ID dinámico del barbero) */}
          <Route 
            path="/reservar/:barberoId" 
            element={<BarberBookingView />} 
          />

          {/* Ruta para Iniciar Sesión / Clientes */}
          <Route 
            path="/login" 
            element={
              <LoginProfesionales 
                onLoginSuccess={() => navigate('/')} 
                onGoBack={() => navigate('/')} 
                onGoToRegister={() => navigate('/login')} 
              />
            } 
          />

          {/* Ruta para el Panel de Profesionales */}
          <Route path="/panelprofesionales" element={<Panelprfesionales />} />

          {/* Otras rutas */}
          <Route path="/catalog" element={<Catalogo />} />
          <Route path="/bookings" element={<div className="text-center py-20">Sección de Reservas</div>} />
          <Route path="/profile" element={<div className="text-center py-20">Sección de Perfil / Cliente</div>} />
          <Route path="/register" element={<div className="text-center py-20">Sección de Registro</div>} />
        </Routes>
      </main>
    </div>
  );
}