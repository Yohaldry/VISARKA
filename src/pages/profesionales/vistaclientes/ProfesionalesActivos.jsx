import React, { useEffect, useState } from 'react';
import AgendarInmediato from './AgendarInmediato';
import CitasAnticipacion from './CitasAnticipacion';

const obtenerModoInicial = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const qModo = params.get('modo');
    if (qModo === 'anticipacion' || qModo === 'inmediato') return qModo;
    if (window.history.state?.usr?.modo) return window.history.state.usr.modo;
    if (window.history.state?.modo) return window.history.state.modo;
    const saved = window.sessionStorage.getItem('visarka_modo_reserva');
    if (saved === 'anticipacion' || saved === 'inmediato') return saved;
  } catch (_) {}
  return 'inmediato';
};

export default function ProfesionalesActivos() {
  const [modo, setModo] = useState(obtenerModoInicial);

  useEffect(() => {
    const syncModo = () => setModo(obtenerModoInicial());
    window.addEventListener('popstate', syncModo);
    return () => window.removeEventListener('popstate', syncModo);
  }, []);

  if (modo === 'anticipacion') {
    return <CitasAnticipacion />;
  }

  return <AgendarInmediato />;
}