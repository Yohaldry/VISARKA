import React, { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, query, where, deleteDoc, doc, setDoc, updateDoc, onSnapshot, addDoc } from 'firebase/firestore';
import { auth, db } from '../../components/firebase';

const HORAS = ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'];
const ZONAS_BOGOTA_MAPA = [
  { claves: ['usaquen', 'cedritos', 'santa barbara', 'tobarin', 'contador'], coords: { lat: 4.695, lon: -74.031 }, pin: { top: '24%', left: '65%' } },
  { claves: ['chapinero alto', 'chapinero', 'quinta camacho', 'la cabrera', 'rosales'], coords: { lat: 4.652, lon: -74.058 }, pin: { top: '36%', left: '57%' } },
  { claves: ['teusaquillo', 'palermo', 'soledad', 'galerias', 'esmeralda'], coords: { lat: 4.638, lon: -74.084 }, pin: { top: '54%', left: '44%' } },
  { claves: ['suba', 'niza', 'colina campestre', 'mazuren'], coords: { lat: 4.742, lon: -74.078 }, pin: { top: '18%', left: '46%' } },
  { claves: ['engativa', 'alamos', 'normandia', 'boyaca'], coords: { lat: 4.698, lon: -74.118 }, pin: { top: '32%', left: '31%' } },
  { claves: ['fontibon', 'modelia', 'hayuelos', 'salitre'], coords: { lat: 4.672, lon: -74.132 }, pin: { top: '46%', left: '28%' } },
  { claves: ['kennedy', 'tintal', 'castilla', 'americas'], coords: { lat: 4.628, lon: -74.152 }, pin: { top: '66%', left: '24%' } },
  { claves: ['barrios unidos', '7 de agosto', 'polo'], coords: { lat: 4.674, lon: -74.076 }, pin: { top: '38%', left: '48%' } },
  { claves: ['santa fe', 'centro', 'candelaria', 'macarena'], coords: { lat: 4.609, lon: -74.072 }, pin: { top: '62%', left: '53%' } },
  { claves: ['rafael uribe', 'quiroga', 'restrepo', 'antonio narino'], coords: { lat: 4.582, lon: -74.098 }, pin: { top: '76%', left: '42%' } },
];
const norm = (t = '') => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const parsePrecioNumero = (val) => {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (!val) return null;
  const digits = String(val).replace(/[^\d]/g, '');
  if (!digits) return null;
  const num = Number(digits);
  return Number.isNaN(num) ? null : num;
};
const ubicarSolicitudEnMapa = (sol) => {
  if (typeof sol?.lat === 'number' && typeof sol?.lon === 'number') {
    const topPct = Math.min(82, Math.max(18, Number((50 - (sol.lat - 4.665) * 420).toFixed(1))));
    const leftPct = Math.min(82, Math.max(18, Number((50 + (sol.lon + 74.08) * 420).toFixed(1))));
    return { coords: { lat: sol.lat, lon: sol.lon }, pin: { top: `${topPct}%`, left: `${leftPct}%` } };
  }
  const textoDir = norm(`${sol?.direccion || ''} ${sol?.zona || ''}`);
  const match = ZONAS_BOGOTA_MAPA.find(z => z.claves.some(k => textoDir.includes(k)));
  if (match) return { coords: match.coords, pin: match.pin };
  const hash = Array.from(textoDir || sol?.id || 'sol').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const offsetLat = (((hash % 17) - 8) * 0.004);
  const offsetLon = ((((hash >> 3) % 17) - 8) * 0.005);
  const lat = Number((4.665 + offsetLat).toFixed(5));
  const lon = Number((-74.08 + offsetLon).toFixed(5));
  return {
    coords: { lat, lon },
    pin: { top: `${50 - offsetLat * 420}%`, left: `${50 + offsetLon * 420}%` }
  };
};
const fechaLocal = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function Calendarioprofesionales({ barberoId: propId }) {
  const [barberoId, setBarberoId] = useState(propId || '');
  const [authUid, setAuthUid] = useState(auth.currentUser?.uid || '');
  const [tab, setTab] = useState('en_linea');
  const [subTabCitas, setSubTabCitas] = useState('pendientes');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modoRango, setModoRango] = useState(false);
  const [citaModal, setCitaModal] = useState(null);
  const [editarHoraModal, setEditarHoraModal] = useState(null);
  const [nuevaHoraEdit, setNuevaHoraEdit] = useState('');
  const [editandoServicios, setEditandoServicios] = useState(false);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [serviciosSeleccionadosCita, setServiciosSeleccionadosCita] = useState([]);
  const [filtroDiaSemana, setFiltroDiaSemana] = useState('');
  const [enLinea, setEnLinea] = useState(false);
  const [modalConfirmarEncendido, setModalConfirmarEncendido] = useState(false);
  const [pedidoEntrante, setPedidoEntrante] = useState(null);
  const [solicitudesEnLinea, setSolicitudesEnLinea] = useState([]);
  const [detalleSolicitudModal, setDetalleSolicitudModal] = useState(null);
  const [confirmarSolicitudModal, setConfirmarSolicitudModal] = useState(null);
  const [serviciosAceptarSel, setServiciosAceptarSel] = useState([]);
  const [zonasProfesional, setZonasProfesional] = useState([]);
  const [zoom, setZoom] = useState(0.9);
  const [sliderVal, setSliderVal] = useState(0);
  const [confirmarFinalizar, setConfirmarFinalizar] = useState(false);
  const [modalIni, setModalIni] = useState('');
  const [modalFin, setModalFin] = useState('');
  const [horasModal, setHorasModal] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [fUnica, setFUnica] = useState('');
  const [fIni, setFIni] = useState('');
  const [fFin, setFFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [disp, setDisp] = useState([]);
  const [citas, setCitas] = useState([]);
  const [toDelete, setToDelete] = useState([]);
  const [currDate, setCurrDate] = useState(new Date());
  const [mapaFull, setMapaFull] = useState(false);
  const [mapPan, setMapPan] = useState({ lat: 4.665, lon: -74.08 });
  const [gestionModalOpen, setGestionModalOpen] = useState(false);
  const horariosBoxRef = React.useRef(null);
  const switchDragRef = React.useRef({ startX: 0, moved: false, pointerId: null });
  const [filtroFechaGestion, setFiltroFechaGestion] = useState('');

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      const uid = u?.uid || '';
      setAuthUid(uid);
      if (propId) setBarberoId(propId);
      else if (uid) setBarberoId(uid);
    });
    return () => unsub();
  }, [propId]);

  useEffect(() => { if (barberoId) { fetchData(); fetchServicios(); fetchEstadoDomicilios(); } }, [barberoId]);

  useEffect(() => {
    const uidActual = barberoId || authUid || '';
    const unsub = onSnapshot(collection(db, 'serviciosenlinea'), (snap) => {
      const lista = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(s => (s.estado || 'pendiente').toLowerCase() === 'pendiente')
        .filter(s => {
          const destino = s.profesionalId || s.profesionalDestinoId || s.barberoId || s.profesionalUid || s.idProfesional || '';
          if (!destino) return !s.soloProfesional;
          if (!uidActual) return true;
          return String(destino) === String(uidActual);
        });
      setSolicitudesEnLinea(lista);
    });
    return () => unsub();
  }, [barberoId, authUid]);

  const estaEnMiZona = (sol) => {
    const obj = norm(sol.zona || sol.direccion || '');
    if (!obj || !zonasProfesional.length) return true;
    return zonasProfesional.some(z => { const zn = norm(z); return zn && (zn.includes(obj) || obj.includes(zn)); });
  };

  const resolverServiciosCliente = (sol) => {
    const raw = Array.isArray(sol?.servicios) ? sol.servicios : [];
    const preciosDetalle = Array.isArray(sol?.serviciosDetalle) ? sol.serviciosDetalle : [];

    return raw.map((item) => {
      if (typeof item === 'object' && item !== null) {
        const nombre = item.nombre || item.name || item.servicio || 'Servicio';
        const matchDetalle = preciosDetalle.find(
          (pd) => norm(pd?.nombre || pd?.name || '') === norm(nombre)
        );
        const matchDisp = serviciosDisponibles.find(
          (sd) => norm(sd.nombre) === norm(nombre) || norm(sd.nombre).includes(norm(nombre)) || norm(nombre).includes(norm(sd.nombre))
        );
        const rawPrecio =
          item.precioNum ??
          item.precio ??
          item.precioFormatted ??
          item.valor ??
          item.price ??
          matchDetalle?.precioNum ??
          matchDetalle?.precio ??
          matchDetalle?.precioFormatted ??
          matchDisp?.precioNum ??
          matchDisp?.precioFormatted ??
          35000;
        const precioNum = parsePrecioNumero(rawPrecio) ?? 35000;
        const precioTexto =
          (typeof item.precioFormatted === 'string' && item.precioFormatted.trim()) ||
          (typeof item.precio === 'string' && item.precio.trim()) ||
          (typeof matchDetalle?.precioFormatted === 'string' && matchDetalle.precioFormatted.trim()) ||
          (typeof matchDetalle?.precio === 'string' && matchDetalle.precio.trim()) ||
          matchDisp?.precioFormatted ||
          `$${precioNum.toLocaleString('es-CO')} COP`;
        return { nombre, precioNum, precio: precioTexto };
      }

      const nombreStr = String(item);
      const matchDetalle = preciosDetalle.find(
        (pd) => norm(pd?.nombre || pd?.name || '') === norm(nombreStr)
      );
      const matchDisp = serviciosDisponibles.find(
        (sd) => norm(sd.nombre) === norm(nombreStr) || norm(sd.nombre).includes(norm(nombreStr)) || norm(nombreStr).includes(norm(sd.nombre))
      );

      const rawPrecio =
        matchDetalle?.precioNum ??
        matchDetalle?.precio ??
        matchDetalle?.precioFormatted ??
        matchDisp?.precioNum ??
        matchDisp?.precioFormatted ??
        35000;
      const precioNum = parsePrecioNumero(rawPrecio) ?? 35000;
      const precioTexto =
        (typeof matchDetalle?.precioFormatted === 'string' && matchDetalle.precioFormatted.trim()) ||
        (typeof matchDetalle?.precio === 'string' && matchDetalle.precio.trim()) ||
        matchDisp?.precioFormatted ||
        `$${precioNum.toLocaleString('es-CO')} COP`;

      return {
        nombre: matchDisp?.nombre || nombreStr,
        precioNum,
        precio: precioTexto
      };
    });
  };

  const abrirDetalleSolicitud = (sol) => {
    setDetalleSolicitudModal({
      ...sol,
      serviciosResueltos: resolverServiciosCliente(sol)
    });
  };

  const abrirConfirmarSolicitud = (sol) => {
    if (!barberoId) return alert('Inicia sesión para aceptar.');
    setServiciosAceptarSel(resolverServiciosCliente(sol));
    setConfirmarSolicitudModal(sol);
  };

  const handleEliminarSolicitudLista = async (solId) => {
    try {
      await deleteDoc(doc(db, 'serviciosenlinea', solId));
      if (confirmarSolicitudModal?.id === solId) setConfirmarSolicitudModal(null);
      if (detalleSolicitudModal?.id === solId) setDetalleSolicitudModal(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar la solicitud');
    }
  };

  const confirmarAceptarSolicitud = async () => {
    const sol = confirmarSolicitudModal;
    if (!sol || !barberoId) return;
    try {
      const ahora = new Date();
      const llegada = new Date(ahora.getTime() + 30 * 60000);
      const fecha = fechaLocal(llegada);
      const hora = llegada.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const serviciosLimpios = serviciosAceptarSel.map(s => {
        const precioNum = parsePrecioNumero(s.precioNum ?? s.precio ?? s.precioFormatted) ?? 35000;
        const precioTexto =
          (typeof s.precioFormatted === 'string' && s.precioFormatted.trim()) ||
          (typeof s.precio === 'string' && s.precio.trim()) ||
          `$${precioNum.toLocaleString('es-CO')} COP`;
        return { nombre: s.nombre || s.name || 'Servicio', precioNum, precio: precioTexto };
      });
      const precioTotal = serviciosLimpios.length
        ? `$${serviciosLimpios.reduce((a, s) => a + s.precioNum, 0).toLocaleString('es-CO')} COP`
        : 'N/A';

      await addDoc(collection(db, 'citas'), {
        barberoId,
        nombreCliente: sol.clienteNombre || 'Cliente',
        telefono: sol.clienteTelefono || '',
        email: sol.email || '',
        direccion: sol.direccion || '',
        zona: sol.zona || '',
        torreApto: sol.torreApto || '',
        referencia: sol.referencia || '',
        parqueaderoMoto: Boolean(sol.parqueaderoMoto),
        servicios: serviciosLimpios,
        precioTotal,
        descripcion: sol.descripcion || '',
        fecha,
        hora,
        estado: 'confirmada',
        origen: 'serviciosenlinea'
      });

      await updateDoc(doc(db, 'serviciosenlinea', sol.id), {
        estado: 'aceptada',
        aceptadaEn: new Date().toISOString(),
        barberoId
      });

      setConfirmarSolicitudModal(null);
      setDetalleSolicitudModal(null);
      fetchData();
      alert(`Cita agendada para ${sol.clienteNombre || 'Cliente'} · Total: ${precioTotal} · Llegada en 30 min (${fecha} · ${hora})`);
    } catch (e) { console.error(e); alert('Error al aceptar'); }
  };

  const fetchEstadoDomicilios = async () => {
    try {
      const snap = await getDoc(doc(db, 'profesionales', barberoId));
      if (snap.exists()) {
        const d = snap.data();
        if (typeof d?.activodomicilios === 'boolean') setEnLinea(d.activodomicilios);
        const zonas = Array.isArray(d?.zonasTrabajo) ? d.zonasTrabajo : [d?.localidad, d?.zona].filter(Boolean);
        setZonasProfesional(zonas);
      }
    } catch (e) { console.error(e); }
  };

  const guardarEstadoDomicilios = async (estado) => {
    if (!barberoId) return;
    try {
      const encendido = Boolean(estado);
      await setDoc(doc(db, 'profesionales', barberoId), { activodomicilios: encendido }, { merge: true });
      if (encendido) {
        const profSnap = await getDoc(doc(db, 'profesionales', barberoId));
        const profData = profSnap.exists() ? profSnap.data() : {};
        await setDoc(doc(db, 'profesionalesactivos', barberoId), {
          ...profData,
          barberoId,
          activodomicilios: true,
          activoEnLinea: true,
          actualizadoEn: new Date().toISOString()
        }, { merge: true });
      } else {
        await deleteDoc(doc(db, 'profesionalesactivos', barberoId));
      }
    } catch (e) { console.error(e); }
  };

  const solicitarCambioEstado = (objetivoEncendido) => {
    if (objetivoEncendido) {
      if (!enLinea) setModalConfirmarEncendido(true);
    } else {
      setEnLinea(false);
      guardarEstadoDomicilios(false);
    }
  };

  const confirmarEncendidoDomicilios = async () => {
    setModalConfirmarEncendido(false);
    setEnLinea(true);
    await guardarEstadoDomicilios(true);
  };

  useEffect(() => {
    if (!enLinea || !solicitudesEnLinea.length) {
      setPedidoEntrante(null);
      return;
    }
    const sol = solicitudesEnLinea[0];
    const ubic = ubicarSolicitudEnMapa(sol);
    const serviciosRes = resolverServiciosCliente(sol);
    const srvTxt = serviciosRes.length
      ? serviciosRes.map(s => s.nombre).join(', ')
      : 'Servicio';
    const totalNum = serviciosRes.reduce((acc, s) => acc + s.precioNum, 0);
    setPedidoEntrante({
      ...sol,
      cliente: sol.clienteNombre || 'Cliente',
      servicio: srvTxt,
      zona: sol.direccion || sol.zona || 'Bogotá',
      valor: sol.precioTotal || (serviciosRes.length ? `$${totalNum.toLocaleString('es-CO')} COP` : 'N/A'),
      coords: ubic.coords,
      pin: ubic.pin
    });
  }, [enLinea, solicitudesEnLinea, serviciosDisponibles]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dSnap, cSnap] = await Promise.all([
        getDocs(query(collection(db, 'calendarioprofesionales'), where('barberoId', '==', barberoId))),
        getDocs(query(collection(db, 'citas'), where('barberoId', '==', barberoId)))
      ]);
      setDisp(dSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCitas(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchServicios = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'servicios'), where('barberoId', '==', barberoId)));
      const lista = [];
      snap.forEach(d => {
        const s = d.data();
        if (!String(s.duracion || s.categoria || s.nombre || '').toLowerCase().includes('interno')) {
          const p = parsePrecioNumero(s.precioNum ?? s.precio ?? s.precioText ?? s.valor) ?? 35000;
          lista.push({ id: d.id, nombre: s.nombre || s.name || 'Servicio', precioNum: p, precioFormatted: s.precioText || `$${p.toLocaleString('es-CO')} COP` });
        }
      });
      setServiciosDisponibles(lista);
    } catch (e) { console.error(e); }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!modalIni || !horasModal.length) return alert('Completa los campos.');
    setLoading(true);
    try {
      let start = new Date(modalIni), end = modoRango && modalFin ? new Date(modalFin) : new Date(modalIni);
      while (start <= end) {
        const fStr = start.toISOString().split('T')[0];
        for (const h of horasModal) await setDoc(doc(db, 'calendarioprofesionales', `${barberoId}_${fStr}_${h.replace(/\s+/g, '_')}`), { barberoId, fecha: fStr, hora: h, ocupado: false }, { merge: true });
        start.setDate(start.getDate() + 1);
      }
      setIsModalOpen(false); setHorasModal([]); fetchData();
    } catch (e) { alert('Error al guardar'); } finally { setLoading(false); }
  };

  const handleUpdateHora = async (e) => {
    e.preventDefault();
    if (!nuevaHoraEdit) return;
    try {
      await deleteDoc(doc(db, 'calendarioprofesionales', editarHoraModal.id));
      await setDoc(doc(db, 'calendarioprofesionales', `${barberoId}_${editarHoraModal.fecha}_${nuevaHoraEdit.replace(/\s+/g, '_')}`), { barberoId, fecha: editarHoraModal.fecha, hora: nuevaHoraEdit, ocupado: false });
      setEditarHoraModal(null); setNuevaHoraEdit(''); fetchData();
    } catch (e) { alert('Error'); }
  };

  const handleDeleteCita = async (citaId, fechaCita, horaCita) => {
    if (!window.confirm('¿Estás seguro de eliminar y cancelar esta cita?')) return;
    try {
      await deleteDoc(doc(db, 'citas', citaId));
      try { await updateDoc(doc(db, 'calendarioprofesionales', `${barberoId}_${fechaCita}_${horaCita.replace(/\s+/g, '_')}`), { ocupado: false }); } catch (e) {}
      setCitaModal(null); setEditandoServicios(false); setSliderVal(0); setConfirmarFinalizar(false); fetchData();
    } catch (e) { alert('Error'); }
  };

  const handleFinalizarCita = async (citaId, fechaCita, horaCita) => {
    try {
      await updateDoc(doc(db, 'citas', citaId), { estado: 'finalizada' });
      try { await updateDoc(doc(db, 'calendarioprofesionales', `${barberoId}_${fechaCita}_${horaCita.replace(/\s+/g, '_')}`), { ocupado: false }); } catch (e) {}
      setCitaModal(null); setEditandoServicios(false); setSliderVal(0); setConfirmarFinalizar(false); fetchData();
    } catch (e) { alert('Error al finalizar'); }
  };

  const handleGuardarServicios = async () => {
    if (!serviciosSeleccionadosCita.length) return alert('Selecciona al menos un servicio.');
    const serviciosLimpios = serviciosSeleccionadosCita.map(s => {
      const precioNum = parsePrecioNumero(s.precioNum ?? s.precio ?? s.precioFormatted) ?? 35000;
      const precioTexto =
        (typeof s.precioFormatted === 'string' && s.precioFormatted.trim()) ||
        (typeof s.precio === 'string' && s.precio.trim()) ||
        `$${precioNum.toLocaleString('es-CO')} COP`;
      return { nombre: s.nombre || s.name || 'Servicio', precioNum, precio: precioTexto };
    });
    const totalF = `$${serviciosLimpios.reduce((a, s) => a + s.precioNum, 0).toLocaleString('es-CO')} COP`;
    try {
      await updateDoc(doc(db, 'citas', citaModal.id), { servicios: serviciosLimpios, precioTotal: totalF });
      setCitaModal(prev => ({ ...prev, servicios: serviciosLimpios, precioTotal: totalF }));
      setEditandoServicios(false); fetchData(); alert('¡Servicios actualizados con éxito!');
    } catch (e) { console.error("Error al actualizar:", e); alert(`Error al guardar: ${e.message}`); }
  };

  const handleDelete = async (id) => {
    const ids = id ? [id] : toDelete;
    if (!ids.length || !window.confirm('¿Eliminar?')) return;
    setLoading(true);
    try { for (const i of ids) await deleteDoc(doc(db, 'calendarioprofesionales', i)); setToDelete([]); fetchData(); } finally { setLoading(false); }
  };

  const daysInMonth = () => {
    const y = currDate.getFullYear(), m = currDate.getMonth(), first = new Date(y, m, 1).getDay() - 1, total = new Date(y, m + 1, 0).getDate();
    let res = Array(first < 0 ? 6 : first).fill({ vacio: true });
    for (let i = 1; i <= total; i++) res.push({ fechaStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`, diaMes: i, vacio: false });
    return res;
  };

  const citasFiltradas = citas.filter(c => {
    const estado = (c.estado || 'pendiente').toLowerCase();
    if (estado === 'cancelada') return false;
    if (subTabCitas === 'pendientes' && estado === 'finalizada') return false;
    if (subTabCitas === 'finalizadas' && estado !== 'finalizada') return false;
    if (filtroTipo === 'dia') return fUnica ? c.fecha === fUnica : true;
    if (filtroTipo === 'rango') return (!fIni || !fFin) || (c.fecha >= fIni && c.fecha <= fFin);
    return true;
  });

  const dispFiltrados = disp.filter(item => {
    if (!filtroDiaSemana && filtroDiaSemana !== 0 && filtroDiaSemana !== '0') return true;
    const [y, m, d] = item.fecha.split('-').map(Number);
    return new Date(y, m - 1, d).getDay() === Number(filtroDiaSemana);
  });

  const hoyStr = fechaLocal();
  const openCita = (c) => { setCitaModal(c); setEditandoServicios(false); setSliderVal(0); setConfirmarFinalizar(false); setServiciosSeleccionadosCita(c.servicios || []); };

  const totalAceptarModal = serviciosAceptarSel.reduce((acc, s) => acc + (parsePrecioNumero(s.precioNum ?? s.precio ?? s.precioFormatted) ?? 35000), 0);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-slate-50 text-slate-800 rounded-3xl shadow-2xl border border-slate-200 font-mono">
      <div className="text-center mb-6"><h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Panel de Disponibilidad y Citas</h2></div>

      <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 gap-1.5 border border-slate-200/80 shadow-inner">
        {[['en_linea', '🛵', 'Servicios en línea'], ['calendario', '📅', 'Calendario'], ['agendados', '📋', `Citas (${citas.filter(c => (c.estado || '').toLowerCase() !== 'cancelada').length})`]].map(([t, ico, lbl]) => {
          const isActive = tab === t;
          return (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 px-2.5 text-[11px] font-extrabold tracking-tight transition-all duration-300 ease-out rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transform active:scale-95 ${isActive ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md shadow-slate-900/10 ring-1 ring-slate-900/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}>
              <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-70'}`}>{ico}</span>
              <span className="truncate">{lbl}</span>
            </button>
          );
        })}
      </div>

     {tab === 'calendario' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 capitalize text-sm">{currDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGestionModalOpen(true)}
                  aria-label="Gestionar horarios"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded-xl font-bold text-[11px] border border-blue-700 shadow-md transition-all cursor-pointer flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-white"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
                <button type="button" onClick={() => setCurrDate(new Date(currDate.setMonth(currDate.getMonth() - 1)))} className="p-1.5 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer">&lt;</button>
                <button type="button" onClick={() => setCurrDate(new Date(currDate.setMonth(currDate.getMonth() + 1)))} className="p-1.5 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer">&gt;</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 mb-2">
              {['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {daysInMonth().map((item, idx) => {
                if (item.vacio) return <div key={idx} />;
                const hasHoraVerde = citas.some(c => c.fecha === item.fechaStr && (c.estado || '').toLowerCase() !== 'cancelada' && (c.estado || '').toLowerCase() !== 'finalizada');
                const hasCitaPendiente = hasHoraVerde;
                const hasCitaFinalizada = citas.some(c => c.fecha === item.fechaStr && (c.estado || '').toLowerCase() === 'finalizada');
                const hasCita = hasCitaPendiente || hasCitaFinalizada;
                const hasDisp = disp.some(d => d.fecha === item.fechaStr);
                const isSel = selectedDate === item.fechaStr;
                const isToday = item.fechaStr === hoyStr;
                return (
                  <button
                    key={item.fechaStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(item.fechaStr);
                      setTimeout(() => horariosBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
                    }}
                    className={`h-12 rounded-xl flex flex-col items-center justify-center border text-xs transition-all cursor-pointer relative ${isSel ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' : hasCitaPendiente ? 'bg-emerald-500 text-white border-emerald-600 font-black shadow-sm' : hasCitaFinalizada ? 'bg-slate-700 text-white border-slate-800 font-black shadow-sm' : hasDisp ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'} ${isToday && !hasCita ? 'ring-2 ring-blue-500 ring-offset-2 animate-pulse font-black' : ''}`}
                  >
                    <span className="flex items-center gap-0.5">{item.diaMes}{hasCitaFinalizada && !hasCitaPendiente && <span className="text-[10px] text-slate-300">✓</span>}</span>
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSel ? 'bg-cyan-400' : hasCitaPendiente ? 'bg-white' : hasCitaFinalizada ? 'bg-slate-400' : hasDisp ? 'bg-amber-400' : 'bg-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div ref={horariosBoxRef} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700">Horarios para: <span className="text-blue-600">{selectedDate}</span></span>
                <button type="button" onClick={() => { setModalIni(selectedDate); setHorasModal([]); setIsModalOpen(true); }} className="text-blue-600 hover:underline cursor-pointer">+ Agregar hora</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {disp.filter(d => d.fecha === selectedDate && !citas.some(c => c.fecha === selectedDate && c.hora?.toLowerCase() === d.hora?.toLowerCase() && (c.estado || '').toLowerCase() !== 'cancelada')).map(slot => (
                  <div key={slot.id} onClick={() => setEditarHoraModal(slot)} className="bg-amber-100/90 border border-amber-300 text-amber-900 p-3 rounded-2xl text-xs flex flex-col justify-between shadow-2xs cursor-pointer hover:bg-amber-200 transition-all">
                    <div className="flex justify-between items-center"><span className="font-black">⏰ {slot.hora}</span><span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">Libre</span></div>
                    <span className="text-[9px] text-amber-700 mt-1 italic">Toca para editar</span>
                  </div>
                ))}
                {citas.filter(c => c.fecha === selectedDate && (c.estado || '').toLowerCase() !== 'cancelada').map(cita => {
                  const esFinalizada = (cita.estado || '').toLowerCase() === 'finalizada';
                  return (
                    <div key={cita.id} onClick={() => openCita(cita)} className={`${esFinalizada ? 'bg-slate-700 border-slate-800' : 'bg-emerald-500 border-emerald-600'} text-white p-3 rounded-2xl text-xs flex flex-col justify-between shadow-sm cursor-pointer hover:opacity-95 transition-all`}>
                      <div className="flex justify-between items-center"><span className="font-black">⏰ {cita.hora}</span><span className={`text-[9px] ${esFinalizada ? 'bg-slate-900 text-slate-200' : 'bg-emerald-700'} px-1.5 py-0.5 rounded font-black flex items-center gap-0.5`}>{esFinalizada ? <>Finalizada <span className="text-[10px]">✓</span></> : 'Ocupada'}</span></div>
                      <span className="font-bold truncate mt-1 text-[11px]">{cita.nombreCliente || cita.clienteNombre || 'Cliente'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {gestionModalOpen && (() => {
        const listaGestion = dispFiltrados.filter(item => !filtroFechaGestion || item.fecha === filtroFechaGestion);
        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-black text-xs uppercase text-slate-800">Gestionar horarios configurados</h3>
                <button type="button" onClick={() => setGestionModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer">✕</button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center pb-3 border-b border-slate-100">
                <p className="text-xs text-slate-500">Selecciona los horarios configurados que desees eliminar:</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    type="date"
                    value={filtroFechaGestion}
                    onChange={e => setFiltroFechaGestion(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-bold outline-none cursor-pointer"
                  />
                  <select
                    value={filtroDiaSemana || ''}
                    onChange={e => setFiltroDiaSemana(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-bold outline-none cursor-pointer"
                  >
                    <option value="">Filtrar por día (Todos)</option><option value="1">Lunes</option><option value="2">Martes</option><option value="3">Miércoles</option><option value="4">Jueves</option><option value="5">Viernes</option><option value="6">Sábado</option><option value="0">Domingo</option>
                  </select>
                  {(filtroFechaGestion || filtroDiaSemana) && (
                    <button
                      type="button"
                      onClick={() => { setFiltroFechaGestion(''); setFiltroDiaSemana(''); }}
                      className="text-[10px] font-bold text-blue-600 hover:underline px-1 cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
              {listaGestion.length === 0 ? <p className="text-xs text-slate-400 text-center py-6">Sin horas configuradas para este filtro.</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {listaGestion.map(item => (
                    <div key={item.id} className={`p-2.5 border rounded-2xl flex items-center justify-between text-xs transition-all ${toDelete.includes(item.id) ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200'}`}>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={toDelete.includes(item.id)} onChange={() => setToDelete(toDelete.includes(item.id) ? toDelete.filter(i => i !== item.id) : [...toDelete, item.id])} className="accent-blue-600 rounded" /><div><p className="font-bold text-slate-800 text-[10px]">📅 {item.fecha}</p><p className="text-slate-900 font-bold text-xs">⏰ {item.hora}</p></div></label>
                      <button type="button" onClick={() => handleDelete(item.id)} className="text-red-600 font-bold cursor-pointer">✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {toDelete.length > 0 && <button type="button" onClick={() => handleDelete()} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 text-xs font-bold rounded-xl cursor-pointer transition">Eliminar ({toDelete.length})</button>}
                <button type="button" onClick={() => setGestionModalOpen(false)} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 text-xs font-bold rounded-xl cursor-pointer transition">Cerrar</button>
              </div>
            </div>
          </div>
        );
      })()}
        </div>
      )}

      {tab === 'agendados' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-3">
            <button onClick={() => setSubTabCitas('pendientes')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${subTabCitas === 'pendientes' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>🟢 Citas Pendientes</button>
            <button onClick={() => setSubTabCitas('finalizadas')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${subTabCitas === 'finalizadas' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>⚪ Citas Finalizadas</button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex gap-1.5 w-full sm:w-auto">
              {['todos', 'dia', 'rango'].map(t => <button key={t} onClick={() => setFiltroTipo(t)} className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${filtroTipo === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{t}</button>)}
            </div>
            {filtroTipo === 'dia' && <input type="date" value={fUnica} onChange={e => setFUnica(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs w-full sm:w-auto" />}
            {filtroTipo === 'rango' && <div className="flex gap-2 w-full sm:w-auto"><input type="date" value={fIni} onChange={e => setFIni(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs" /><input type="date" value={fFin} onChange={e => setFFin(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs" /></div>}
          </div>
          {citasFiltradas.length === 0 ? <p className="text-xs text-slate-400 text-center py-6">No hay citas agendadas bajo esta categoría.</p> : (
            <div className="space-y-3">
              {citasFiltradas.map(c => {
                const esFinalizada = (c.estado || '').toLowerCase() === 'finalizada';
                return (
                  <div key={c.id} onClick={() => openCita(c)} className={`p-4 rounded-2xl flex justify-between items-center text-xs cursor-pointer transition-all shadow-2xs ${esFinalizada ? 'bg-slate-100 border border-slate-300 hover:bg-slate-200' : 'bg-emerald-50/80 border border-emerald-300 hover:bg-emerald-100'}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`${esFinalizada ? 'bg-slate-700 text-white' : 'bg-emerald-600 text-white'} px-2 py-0.5 rounded-md font-black text-[9px] flex items-center gap-0.5`}>{esFinalizada ? <>CITA FINALIZADA <span className="text-[10px]">✓</span></> : 'CITA CONFIRMADA'}</span>
                        <span className={`font-black text-sm ${esFinalizada ? 'text-slate-800' : 'text-emerald-900'}`}>{c.nombreCliente || c.clienteNombre || 'Sin nombre'}</span>
                      </div>
                      <p className="text-slate-600 font-medium">📅 {c.fecha} | ⏰ {c.hora}</p>
                      <p className="text-slate-500 text-[10px]">📍 {c.direccion || 'Sin dirección'}</p>
                    </div>
                    <span className={`font-bold text-xs px-3 py-1.5 rounded-xl ${esFinalizada ? 'text-slate-700 bg-slate-200' : 'text-emerald-700 bg-emerald-200/60'}`}>Gestionar &rarr;</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'en_linea' && (() => {
        const focusPedido = (u, zoomNivel = 4.5) => {
          setPedidoEntrante(u);
          if (u?.coords) setMapPan(u.coords);
          setZoom(zoomNivel);
        };
        const solicitudesConMapa = solicitudesEnLinea.map((sol) => {
          const ubic = ubicarSolicitudEnMapa(sol);
          const serviciosRes = resolverServiciosCliente(sol);
          const srvTxt = serviciosRes.length
            ? serviciosRes.map(s => s.nombre).join(', ')
            : 'Servicio';
          const totalNum = serviciosRes.reduce((acc, s) => acc + s.precioNum, 0);
          return {
            ...sol,
            cliente: sol.clienteNombre || 'Cliente',
            servicio: srvTxt,
            serviciosResueltos: serviciosRes,
            zona: sol.direccion || sol.zona || 'Bogotá',
            valor: sol.precioTotal || (serviciosRes.length ? `$${totalNum.toLocaleString('es-CO')} COP` : 'N/A'),
            coords: ubic.coords,
            pin: ubic.pin
          };
        });
        const onTouchStart = (e) => {
          const el = e.currentTarget;
          if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            el.dataset.pinchDist = Math.hypot(dx, dy);
            el.dataset.startZoom = el.dataset.liveZoom || zoom;
            delete el.dataset.lastX;
          } else if (e.touches.length === 1) {
            el.dataset.lastX = e.touches[0].clientX;
            el.dataset.lastY = e.touches[0].clientY;
            el.dataset.dx = el.dataset.dx || 0;
            el.dataset.dy = el.dataset.dy || 0;
          }
        };
        const onTouchMove = (e) => {
          const el = e.currentTarget;
          const stage = el.querySelector('[data-map-stage]');
          if (!stage) return;
          if (e.touches.length === 2 && el.dataset.pinchDist) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.hypot(dx, dy);
            const startDist = Number(el.dataset.pinchDist);
            const startZoom = Number(el.dataset.startZoom || zoom);
            const nextZ = Math.min(12, Math.max(0.6, Number((startZoom * (dist / startDist)).toFixed(2))));
            el.dataset.liveZoom = nextZ;
            stage.style.transform = `translate3d(${el.dataset.dx || 0}px, ${el.dataset.dy || 0}px, 0) scale(${nextZ / zoom})`;
          } else if (e.touches.length === 1 && el.dataset.lastX !== undefined) {
            const mx = e.touches[0].clientX - Number(el.dataset.lastX);
            const my = e.touches[0].clientY - Number(el.dataset.lastY);
            el.dataset.lastX = e.touches[0].clientX;
            el.dataset.lastY = e.touches[0].clientY;
            const dx = Number(el.dataset.dx || 0) + mx;
            const dy = Number(el.dataset.dy || 0) + my;
            el.dataset.dx = dx;
            el.dataset.dy = dy;
            const curZ = Number(el.dataset.liveZoom || zoom);
            stage.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${curZ / zoom})`;
          }
        };
        const onTouchEnd = (e) => {
          const el = e.currentTarget;
          const stage = el.querySelector('[data-map-stage]');
          if (e.touches.length < 2) delete el.dataset.pinchDist;
          if (e.touches.length === 0) {
            const dx = Number(el.dataset.dx || 0);
            const dy = Number(el.dataset.dy || 0);
            const liveZ = Number(el.dataset.liveZoom || zoom);
            if (stage) stage.style.transform = 'translate3d(0,0,0) scale(1)';
            delete el.dataset.lastX; delete el.dataset.lastY; delete el.dataset.dx; delete el.dataset.dy; delete el.dataset.liveZoom;
            const spanNow = 0.065 / liveZ;
            const stepLat = (spanNow * 2) / (el.clientHeight || 288);
            const stepLon = (spanNow * 2.4) / (el.clientWidth || 400);
            setMapPan(p => ({ lat: Math.min(4.82, Math.max(4.52, Number((p.lat + dy * stepLat).toFixed(5)))), lon: Math.min(-73.98, Math.max(-74.20, Number((p.lon - dx * stepLon).toFixed(5)))) }));
            setZoom(liveZ);
          }
        };
        const span = 0.065 / zoom;
        const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${(mapPan.lon - span * 1.2).toFixed(5)}%2C${(mapPan.lat - span).toFixed(5)}%2C${(mapPan.lon + span * 1.2).toFixed(5)}%2C${(mapPan.lat + span).toFixed(5)}&layer=mapnik`;

        return (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${enLinea ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                <span className={`text-xs font-black uppercase tracking-wide ${enLinea ? 'text-emerald-700 animate-pulse' : 'text-slate-500'}`}>{enLinea ? 'Buscando servicios' : 'Desconectado'}</span>
              </div>
              <div className="flex items-center gap-2 select-none">
                <span className={`text-[10px] font-black uppercase ${enLinea ? 'text-emerald-700' : 'text-slate-500'}`}>{enLinea ? 'Encendido' : 'Apagado'}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enLinea}
                  onPointerDown={(e) => {
                    switchDragRef.current = { startX: e.clientX, moved: false, pointerId: e.pointerId };
                    e.currentTarget.setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={(e) => {
                    if (switchDragRef.current.pointerId !== e.pointerId) return;
                    const deltaX = e.clientX - switchDragRef.current.startX;
                    if (Math.abs(deltaX) > 10) {
                      switchDragRef.current.moved = true;
                      solicitarCambioEstado(deltaX > 10);
                      switchDragRef.current.pointerId = null;
                    }
                  }}
                  onPointerUp={(e) => {
                    const wasMoved = switchDragRef.current.moved;
                    switchDragRef.current.pointerId = null;
                    if (!wasMoved) solicitarCambioEstado(!enLinea);
                  }}
                  className={`w-14 h-7 rounded-full p-1 transition-all duration-300 cursor-pointer flex items-center touch-none shadow-inner ${enLinea ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'}`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300" />
                </button>
              </div>
            </div>

            {modalConfirmarEncendido && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl border border-emerald-200">
                  <div className="pb-2 border-b border-slate-100">
                    <h3 className="font-black text-xs uppercase text-emerald-700">Activar servicios en línea</h3>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    ¿Estás seguro de activarte? Desde ese momento quedarás a disposición de los clientes que necesitan servicios de inmediato.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setModalConfirmarEncendido(false)} className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition">Cancelar</button>
                    <button type="button" onClick={confirmarEncendidoDomicilios} className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition">Activar</button>
                  </div>
                </div>
              </div>
            )}

            <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} className={`${mapaFull ? 'fixed inset-0 z-50 h-screen w-screen rounded-none' : 'relative h-72 rounded-2xl'} overflow-hidden border transition-colors duration-200 select-none touch-none ${enLinea ? 'border-sky-200 bg-sky-50 shadow-md' : 'border-slate-300 bg-slate-200 grayscale opacity-75'}`}>
              <div data-map-stage className="w-full h-full origin-center will-change-transform">
                <iframe title="Mapa de Bogotá" src={mapSrc} className="w-full h-full border-0 pointer-events-none" style={enLinea ? { filter: 'hue-rotate(185deg) saturate(1.25) brightness(1.03)' } : undefined} />

                {enLinea && (
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    {solicitudesConMapa.map((sol) => (
                      <button
                        key={sol.id}
                        type="button"
                        onClick={() => {
                          focusPedido(sol, 4.5);
                          abrirDetalleSolicitud(sol);
                        }}
                        style={{ top: sol.pin.top, left: sol.pin.left }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer pointer-events-auto animate-bounce"
                      >
                        <span className="bg-emerald-700 text-white text-[8px] font-black px-2 py-0.5 rounded-md shadow-md border border-white whitespace-nowrap max-w-[140px] truncate">
                          📍 {sol.cliente} · {sol.zona}
                        </span>
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white mt-0.5 shadow-md" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shadow-lg border-2 border-white ${enLinea ? 'bg-blue-700 text-white' : 'bg-slate-500 text-slate-200'}`}>✂️</div>
                  <span className={`mt-1 px-2 py-0.5 rounded-full text-[9px] font-black shadow-xs ${enLinea ? 'bg-blue-700 text-white' : 'bg-slate-600 text-slate-200'}`}>Tú</span>
                </div>
              </div>

              <div className="absolute top-3 left-3 z-30">
                <button type="button" onClick={() => setMapaFull(!mapaFull)} className="bg-white/95 hover:bg-sky-50 text-blue-900 border border-sky-200 px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm cursor-pointer transition">
                  {mapaFull ? 'Cerrar mapa' : 'Abrir mapa'}
                </button>
              </div>

              <div className="absolute top-3 right-3 z-30 flex flex-col gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-sky-200 shadow-sm">
                <button type="button" onClick={() => setZoom(z => Math.min(12, Number((z * 1.45).toFixed(2))))} className="w-7 h-7 rounded-lg hover:bg-sky-100 text-blue-900 font-black text-xs cursor-pointer transition">+</button>
                <button type="button" onClick={() => setZoom(z => Math.max(0.6, Number((z / 1.45).toFixed(2))))} className="w-7 h-7 rounded-lg hover:bg-sky-100 text-blue-900 font-black text-xs cursor-pointer transition">−</button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 z-30">
                {enLinea ? (
                  pedidoEntrante ? (
                    <div className="bg-white/95 backdrop-blur-md border border-sky-200 rounded-2xl p-3 shadow-xl">
                      <p className="text-xs font-black text-slate-900 truncate">{pedidoEntrante.cliente} · <span className="text-blue-600">{pedidoEntrante.valor}</span></p>
                      <p className="text-[10px] text-slate-600 truncate">{pedidoEntrante.servicio} — {pedidoEntrante.zona}</p>
                    </div>
                  ) : (
                    <div className="bg-white/90 text-slate-600 rounded-2xl p-3 text-center text-[11px] font-bold border border-sky-200">Sin solicitudes activas en el mapa</div>
                  )
                ) : <div className="bg-slate-800/90 text-slate-200 rounded-2xl p-3 text-center text-[11px] font-bold">Enciende tu estado para recibir pedidos en el mapa</div>}
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Usuarios pidiendo servicio</p>
                <span className="text-[10px] font-bold text-slate-500">{enLinea ? solicitudesEnLinea.length : 0} activos</span>
              </div>
              {!enLinea ? (
                <p className="text-xs text-slate-400 text-center py-4">Enciende el estado para ver los usuarios solicitando servicio.</p>
              ) : solicitudesEnLinea.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No hay solicitudes pendientes dirigidas a ti.</p>
              ) : (
                <div className="space-y-2">
                  {solicitudesConMapa.map((sol) => {
                    const srvTxt = sol.serviciosResueltos.length
                      ? sol.serviciosResueltos.map(s => `${s.nombre} (${s.precio})`).join(', ')
                      : 'Servicio';
                    const enZona = estaEnMiZona(sol);
                    return (
                      <div key={sol.id} onClick={() => { focusPedido(sol, 4.5); abrirDetalleSolicitud(sol); }} className="p-3 rounded-2xl border bg-slate-50 border-slate-200 hover:bg-slate-100/70 flex items-center justify-between gap-3 transition cursor-pointer">
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-900 truncate">{sol.clienteNombre || 'Cliente'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${enZona ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{enZona ? 'en tu Zona' : 'fuera de zona'}</span>
                            {sol.clienteTelefono && <span className="text-[10px] font-bold text-blue-600">{sol.clienteTelefono}</span>}
                            <span className="text-[10px] font-black text-emerald-700">{sol.valor}</span>
                          </div>
                          <p className="text-[11px] text-slate-700 font-medium truncate">✂️ {srvTxt}</p>
                          <p className="text-[10px] text-slate-500 truncate">📍 {sol.zona || sol.direccion || 'Sin zona'}{sol.descripcion ? ` · ${sol.descripcion}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button type="button" onClick={() => abrirConfirmarSolicitud(sol)} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-3 py-2 rounded-xl cursor-pointer transition">
                            Aceptar
                          </button>
                          <button type="button" onClick={() => handleEliminarSolicitudLista(sol.id)} className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-black px-2.5 py-2 rounded-xl cursor-pointer transition">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {detalleSolicitudModal && (() => {
        const serviciosDet = detalleSolicitudModal.serviciosResueltos || resolverServiciosCliente(detalleSolicitudModal);
        const totalDet = serviciosDet.reduce((acc, s) => acc + s.precioNum, 0);
        return (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-sky-200">
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 flex items-center justify-between text-white">
                <h3 className="font-black text-xs uppercase tracking-wider">📄 Detalles de la Solicitud</h3>
                <button type="button" onClick={() => setDetalleSolicitudModal(null)} className="text-white/80 hover:text-white font-bold cursor-pointer">✕</button>
              </div>
              <div className="p-5 space-y-2.5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
                <p><strong>Cliente:</strong> {detalleSolicitudModal.clienteNombre || detalleSolicitudModal.nombreCliente || 'No especificado'}</p>
                <p><strong>Teléfono:</strong> {detalleSolicitudModal.clienteTelefono || detalleSolicitudModal.telefono || 'No especificado'}</p>
                <p><strong>Correo:</strong> {detalleSolicitudModal.email || 'No especificado'}</p>
                <p><strong>Zona:</strong> {detalleSolicitudModal.zona || 'No especificada'}</p>
                <p><strong>Dirección:</strong> {detalleSolicitudModal.direccion || 'No especificada'}</p>
                <p><strong>Torre / Apto:</strong> {detalleSolicitudModal.torreApto || 'N/A'}</p>
                <p><strong>Referencia:</strong> {detalleSolicitudModal.referencia || 'N/A'}</p>
                <p><strong>Parqueadero Moto:</strong> {detalleSolicitudModal.parqueaderoMoto ? 'Sí' : 'No'}</p>
                <p><strong>Estado:</strong> <span className="uppercase font-bold">{detalleSolicitudModal.estado || 'pendiente'}</span></p>
                {detalleSolicitudModal.descripcion && (
                  <p><strong>Descripción:</strong> {detalleSolicitudModal.descripcion}</p>
                )}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <p className="font-bold text-slate-900">Servicios solicitados:</p>
                  {serviciosDet.length > 0 ? serviciosDet.map((s, i) => (
                    <div key={i} className="flex justify-between items-center bg-sky-50/70 px-3 py-1.5 rounded-xl border border-sky-100">
                      <span className="font-bold text-slate-800">{s.nombre}</span>
                      <span className="font-black text-blue-600">{s.precio}</span>
                    </div>
                  )) : <p className="text-slate-500 italic">Servicio estándar</p>}
                  <p className="font-black text-right text-sm text-emerald-700 pt-1">
                    Total: {detalleSolicitudModal.precioTotal || (serviciosDet.length ? `$${totalDet.toLocaleString('es-CO')} COP` : 'N/A')}
                  </p>
                </div>
                <div className="flex gap-2 pt-3">
                  <button type="button" onClick={() => setDetalleSolicitudModal(null)} className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-2xl text-xs font-bold cursor-pointer">Cerrar</button>
                  <button type="button" onClick={() => { const solActual = detalleSolicitudModal; setDetalleSolicitudModal(null); abrirConfirmarSolicitud(solActual); }} className="w-1/2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white py-2.5 rounded-2xl text-xs font-black cursor-pointer">Aceptar solicitud</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {confirmarSolicitudModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-sky-200">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-2xl border border-white/30">
                <img src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" className="w-5 h-5 object-contain bg-white/90 rounded-md p-0.5" alt="Visarka" />
                <span className="text-[10px] font-black tracking-widest uppercase">VISARKA</span>
              </div>
              <button type="button" onClick={() => setConfirmarSolicitudModal(null)} className="text-white/80 hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <div className="p-5 space-y-3.5 text-xs text-slate-700">
              <p className="font-black text-sm text-slate-900">¿Estás seguro de aceptar esta cita?</p>
              <p className="text-[11px] text-slate-600">
                Cliente: <strong className="text-slate-900">{confirmarSolicitudModal.clienteNombre || 'Cliente'}</strong> · Llegada en 30 min
              </p>
              <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-3 space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">Servicios elegidos por el cliente:</p>
                {serviciosAceptarSel.length > 0 ? (
                  serviciosAceptarSel.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white/90 px-2.5 py-1.5 rounded-xl border border-sky-100">
                      <span className="font-bold text-slate-800">{s.nombre}</span>
                      <span className="font-black text-blue-600">{s.precio}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">Servicio estándar</p>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-sky-200/80 text-xs font-black text-slate-900">
                  <span>Total a cobrar:</span>
                  <span className="text-blue-700 text-sm">
                    {serviciosAceptarSel.length > 0 ? `$${totalAceptarModal.toLocaleString('es-CO')} COP` : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setConfirmarSolicitudModal(null)} className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-2xl text-xs font-bold cursor-pointer transition">No, cancelar</button>
                <button type="button" onClick={confirmarAceptarSolicitud} className="w-1/2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white py-2.5 rounded-2xl text-xs font-black shadow-md shadow-blue-600/20 cursor-pointer transition">Sí, agendar cita</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editarHoraModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdateHora} className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl border border-amber-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100"><h3 className="font-black text-xs uppercase text-amber-800">Editar Horario Disponible</h3><button type="button" onClick={() => setEditarHoraModal(null)} className="text-slate-400 font-bold">✕</button></div>
            <div className="space-y-3 text-xs"><p><strong>Fecha:</strong> {editarHoraModal.fecha}</p><p><strong>Hora actual:</strong> {editarHoraModal.hora}</p><select value={nuevaHoraEdit} onChange={e => setNuevaHoraEdit(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl" required><option value="">Selecciona la nueva hora</option>{HORAS.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => handleDelete(editarHoraModal.id).then(() => setEditarHoraModal(null))} className="w-1/2 bg-red-100 text-red-700 py-2.5 rounded-xl text-xs font-bold">Eliminar</button><button type="submit" className="w-1/2 bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold">Guardar</button></div>
          </form>
        </div>
      )}

      {citaModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl border border-emerald-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100"><h3 className="font-black text-xs uppercase tracking-wider text-emerald-700">📋 Detalle Completo de la Cita</h3><button onClick={() => { setCitaModal(null); setEditandoServicios(false); setSliderVal(0); setConfirmarFinalizar(false); }} className="text-slate-400 font-bold">✕</button></div>
            <div className="space-y-2 text-xs text-slate-700 max-h-[60vh] overflow-y-auto pr-1">
              <p><strong>Cliente:</strong> {citaModal.nombreCliente || citaModal.clienteNombre || 'No especificado'}</p>
              <p><strong>Correo:</strong> {citaModal.email || 'No especificado'}</p>
              <p><strong>Teléfono:</strong> {citaModal.telefono || 'No especificado'}</p>
              <p><strong>Fecha y Hora:</strong> {citaModal.fecha} a las {citaModal.hora}</p>
              <p><strong>Dirección:</strong> {citaModal.direccion || 'No especificada'}</p>
              <p><strong>Torre / Apto:</strong> {citaModal.torreApto || 'N/A'}</p>
              <p><strong>Referencia:</strong> {citaModal.referencia || 'N/A'}</p>
              <p><strong>Parqueadero Moto:</strong> {citaModal.parqueaderoMoto ? 'Sí' : 'No'}</p>
              <p><strong>Estado:</strong> <span className="uppercase font-bold">{citaModal.estado || 'pendiente'}</span></p>
              {!editandoServicios && !confirmarFinalizar ? (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-1"><p className="font-bold text-slate-900">Servicios asignados:</p>{(citaModal.estado || '').toLowerCase() !== 'finalizada' && <button onClick={() => setEditandoServicios(true)} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold hover:bg-blue-100 cursor-pointer">✏️ Cambiar servicio</button>}</div>
                  {citaModal.servicios && Array.isArray(citaModal.servicios) ? citaModal.servicios.map((s, i) => <div key={i} className="flex justify-between bg-slate-50 p-1.5 rounded-lg mb-1"><span>{s.nombre}</span><span className="font-bold text-blue-600">{s.precio}</span></div>) : <p>Servicio estándar</p>}
                  <p className="font-black text-right mt-2 text-sm text-emerald-700">Total: {citaModal.precioTotal || 'N/A'}</p>
                </div>
              ) : editandoServicios ? (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <p className="font-bold text-blue-600">Selecciona los nuevos servicios externos:</p>
                  {serviciosDisponibles.map(s => {
                    const sel = serviciosSeleccionadosCita.some(item => item.nombre === s.nombre);
                    return <div key={s.id} onClick={() => setServiciosSeleccionadosCita(sel ? serviciosSeleccionadosCita.filter(item => item.nombre !== s.nombre) : [...serviciosSeleccionadosCita, { nombre: s.nombre, precio: s.precioFormatted, precioNum: s.precioNum }])} className={`p-2 rounded-xl border cursor-pointer flex justify-between items-center ${sel ? 'bg-blue-50 border-blue-500 font-bold' : 'bg-slate-50 border-slate-200'}`}><span>{s.nombre}</span><span className="text-blue-600">{s.precioFormatted}</span></div>;
                  })}
                  <div className="flex gap-2 pt-2"><button onClick={() => setEditandoServicios(false)} className="w-1/2 bg-slate-100 py-2 rounded-xl font-bold">Cancelar</button><button onClick={handleGuardarServicios} className="w-1/2 bg-blue-600 text-white py-2 rounded-xl font-bold">Guardar cambios</button></div>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 text-center space-y-2">
                  <p className="font-bold text-emerald-700">¿Confirmar que deseas finalizar esta cita?</p>
                  <div className="flex gap-2"><button onClick={() => { setConfirmarFinalizar(false); setSliderVal(0); }} className="w-1/2 bg-slate-100 py-2 rounded-xl font-bold">No</button><button onClick={() => handleFinalizarCita(citaModal.id, citaModal.fecha, citaModal.hora)} className="w-1/2 bg-emerald-600 text-white py-2 rounded-xl font-bold">Sí, Finalizar</button></div>
                </div>
              )}
            </div>
            {!editandoServicios && !confirmarFinalizar && (
              <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                {(citaModal.estado || '').toLowerCase() !== 'finalizada' && (
                  <div className="space-y-2">
                    <div className="relative bg-emerald-100 rounded-2xl p-1 overflow-hidden flex items-center border border-emerald-300 shadow-inner">
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-emerald-800 uppercase tracking-widest pointer-events-none z-0">Desliza para finalizar &rarr;</span>
                      <input type="range" min="0" max="100" value={sliderVal} onChange={e => { const val = Number(e.target.value); setSliderVal(val); if (val > 90) setConfirmarFinalizar(true); }} className="w-full opacity-0 cursor-pointer relative z-20 py-2" />
                      <div className="absolute left-1 top-1 bottom-1 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xs font-bold pointer-events-none transition-all z-10 shadow-md" style={{ transform: `translateX(${sliderVal * 2.2}px)` }}>✓</div>
                    </div>
                    <button onClick={() => handleDeleteCita(citaModal.id, citaModal.fecha, citaModal.hora)} className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all">🗑️ Eliminar Cita</button>
                  </div>
                )}
                <button onClick={() => { setCitaModal(null); setSliderVal(0); setConfirmarFinalizar(false); }} className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveModal} className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100"><h3 className="font-black text-xs uppercase text-slate-800">Agregar Horas Disponibles</h3><button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold">✕</button></div>
            <div className="flex gap-2"><button type="button" onClick={() => setModoRango(false)} className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${!modoRango ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Día único</button><button type="button" onClick={() => setModoRango(true)} className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${modoRango ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Rango de días</button></div>
            <div className="space-y-3 text-xs">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">{modoRango ? 'Fecha Desde' : 'Fecha'}</label><input type="date" value={modalIni} onChange={e => setModalIni(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1" required /></div>
              {modoRango && <div><label className="text-[10px] font-bold text-slate-500 uppercase">Fecha Hasta</label><input type="date" value={modalFin} onChange={e => setModalFin(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1" required /></div>}
              <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Selecciona las horas disponibles</label><div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1">{HORAS.map(h => <button key={h} type="button" onClick={() => setHorasModal(horasModal.includes(h) ? horasModal.filter(i => i !== h) : [...horasModal, h])} className={`py-2 rounded-xl text-xs font-bold border ${horasModal.includes(h) ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>{h}</button>)}</div></div>
            </div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 bg-slate-100 py-2.5 rounded-xl text-xs font-bold text-slate-600">Cancelar</button><button type="submit" disabled={loading} className="w-1/2 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md">{loading ? 'Guardando...' : `Guardar (${horasModal.length})`}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}