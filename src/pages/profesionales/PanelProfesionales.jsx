import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Sparkles, CheckCircle2, Edit3, Save, RefreshCw, AlertCircle, 
  Plus, Tag, ArrowRight, AlertTriangle, 
  Loader2, Eye, EyeOff, LogOut, X, Share2, Copy, Image as ImageIcon, Trash2, ChevronDown, FileText, Check, Bell, Menu
} from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, collection, setDoc, onSnapshot, addDoc, deleteDoc, query, where, getDocs, getDoc } from 'firebase/firestore';
import { auth, db } from '../../components/firebase';
import Wallet from './Wallet'
import Comunidad from './Comunidad';
import CalendarioProfesionales from './Calendarioprofesionales'

// Horario completo de las 24 horas del día
const horasCalendario = [
  { label: '12:00 a. m.', val24: '00:00' }, { label: '1:00 a. m.', val24: '01:00' },
  { label: '2:00 a. m.', val24: '02:00' }, { label: '3:00 a. m.', val24: '03:00' },
  { label: '4:00 a. m.', val24: '04:00' }, { label: '5:00 a. m.', val24: '05:00' },
  { label: '6:00 a. m.', val24: '06:00' }, { label: '7:00 a. m.', val24: '07:00' },
  { label: '8:00 a. m.', val24: '08:00' }, { label: '9:00 a. m.', val24: '09:00' },
  { label: '10:00 a. m.', val24: '10:00' }, { label: '11:00 a. m.', val24: '11:00' },
  { label: '12:00 p. m.', val24: '12:00' }, { label: '1:00 p. m.', val24: '13:00' },
  { label: '2:00 p. m.', val24: '14:00' }, { label: '3:00 p. m.', val24: '15:00' },
  { label: '4:00 p. m.', val24: '16:00' }, { label: '5:00 p. m.', val24: '17:00' },
  { label: '6:00 p. m.', val24: '18:00' }, { label: '7:00 p. m.', val24: '19:00' },
  { label: '8:00 p. m.', val24: '20:00' }, { label: '9:00 p. m.', val24: '21:00' },
  { label: '10:00 p. m.', val24: '22:00' }, { label: '11:00 p. m.', val24: '23:00' }
];

const zonasBogotaDisponibles = [
  'Chapinero', 'Usaquén', 'Suba', 'Teusaquillo', 'Chicó', 
  'Zona T', 'Rosales', 'Cedritos', 'Unicentro', 'Santa Bárbara'
];

export default function PanelProfesionales() {
  const [authUser, setAuthUser] = useState(auth.currentUser || null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [perfilCargando, setPerfilCargando] = useState(true);
  const [dragOverInfo, setDragOverInfo] = useState({ diaStr: null, horaTexto: null, x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('facturacion');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [vistaCalendario, setVistaCalendario] = useState('semanal');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(0);

  const primerCargaRef = useRef(true);
  const fileInputRef = useRef(null);

  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
// 1. Pon este estado ARRIBA, dentro de tu componente PanelProfesionales:
const [busquedaLocalidad, setBusquedaLocalidad] = useState('');
  const [nuevaFechaCita, setNuevaFechaCita] = useState('');
  const [nuevaHoraCita, setNuevaHoraCita] = useState('');
  const [nuevaHoraFinCita, setNuevaHoraFinCita] = useState('1:00 a. m.');
  const [nuevoMotivoBloqueo, setNuevoMotivoBloqueo] = useState('');
  const [nuevoServicioCita, setNuevoServicioCita] = useState('');
  const [pestanaActiva, setPestanaActiva] = useState('externos');
  const [menuAgendaAbierto, setMenuAgendaAbierto] = useState(false);
  const [menuHamburguesaAbierto, setMenuHamburguesaAbierto] = useState(false);
  const [modalBloqueoAbierto, setModalBloqueoAbierto] = useState(false);
  const [modalNuevaCitaAbierto, setModalNuevaCitaAbierto] = useState(false);
  const [datosBloqueo, setDatosBloqueo] = useState({ 
    fechaStr: new Date().toISOString().split('T')[0], 
    horaInicio: '12:00 a. m.', 
    horaFin: '7:00 a. m.', 
    motivo: 'No disponible' 
  });

  const [porcentaje, setPorcentaje] = useState('');
  const [datosNuevaCita, setDatosNuevaCita] = useState({
    clienteNombre: '',
    telefono: '',
    servicio: '',
    fechaStr: new Date().toISOString().split('T')[0],
    hora: '12:00 a. m.'
  });

  const actualizarBloqueoArrastrado = async (bloqueo, nuevaFechaStr, nuevaHoraInicio, nuevaHoraFin) => {
    try {
      const bloqueoId = bloqueo.id || bloqueo.uid;
      if (!bloqueoId) return;

      const minInicio = convertirHoraAMinutos(nuevaHoraInicio, true);
      const minFin = convertirHoraAMinutos(nuevaHoraFin, true);
      let duracionTotal = minFin - minInicio;
      if (duracionTotal <= 0) duracionTotal += 1440;

      const bloqueoRef = doc(db, "bloqueos", bloqueoId);
      
      const datosActualizados = {
        fechaStr: nuevaFechaStr,
        fecha: nuevaFechaStr,
        horaInicio: nuevaHoraInicio,
        hora: nuevaHoraInicio,
        horaFin: nuevaHoraFin,
        duracionTotal: duracionTotal
      };

      await updateDoc(bloqueoRef, datosActualizados);

      setCitasFirestore(prev => 
        prev.map(c => ((c.id || c.uid) === bloqueoId ? { ...c, ...datosActualizados } : c))
      );
    } catch (error) {
      console.error("Error al actualizar el bloqueo arrastrado:", error);
      alert("Hubo un error al mover el bloqueo. Inténtalo de nuevo.");
    }
  };

  const handleCerrarSesion = () => {
    if (document.getElementById('modal-salir-arkana')) return;

    const overlay = document.createElement('div');
    overlay.id = 'modal-salir-arkana';
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200';
    
    overlay.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-5 text-slate-100 space-y-4 scale-100 animate-in zoom-in-95 duration-150">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 text-lg shadow-inner">
            🚪
          </div>
          <div>
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-200">Cerrar Sesión</h3>
            <p class="text-[10px] text-slate-400">¿Estás seguro de que deseas salir del sistema?</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
          <button
            id="btn-cancelar-salir"
            type="button"
            class="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer active:scale-95"
          >
            Cancelar
          </button>
          <button
            id="btn-confirmar-salir"
            type="button"
            class="bg-red-600 hover:bg-red-500 text-white border border-red-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all duration-200 cursor-pointer shadow-lg shadow-red-900/30 active:scale-95"
          >
            Sí, Salir
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('btn-cancelar-salir').onclick = () => {
      overlay.remove();
    };

    document.getElementById('btn-confirmar-salir').onclick = async () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        await signOut(auth);
        window.location.href = '/login';
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        overlay.remove();
      }
    };
  };

  const [serviciosFirebase, setServiciosFirebase] = useState([]);
  const [showServicioModal, setShowServicioModal] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [formServicio, setFormServicio] = useState({ nombre: '', descripcion: '', precio: '', duracion: '45 min', categoria: 'servicio' });

  const [barberData, setBarberData] = useState(null);
  
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correoPerfil, setCorreoPerfil] = useState('');
  const [zonasTrabajo, setZonasTrabajo] = useState([]);
  const [experiencia, setExperiencia] = useState('1 a 3 años');
  const [ciudad, setCiudad] = useState('Bogotá D.C.');
  const [especialidad, setEspecialidad] = useState('Fade & Visagismo');
  const [citasFirestore, setCitasFirestore] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  const [notificaciones, setNotificaciones] = useState([]);
  const [nuevaFechaFinCita, setNuevaFechaFinCita] = useState('');
  const [esRangoBloqueo, setEsRangoBloqueo] = useState(false);

  const [modalHorarioSemanalAbierto, setModalHorarioSemanalAbierto] = useState(false);
  const [horarioSemanal, setHorarioSemanal] = useState({
    lunes: { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' },
    martes: { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' },
    miercoles: { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' },
    jueves: { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' },
    viernes: { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' },
    sabado: { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' },
    domingo: { abierto: false, apertura: '8:00 a. m.', cierre: '7:00 p. m.' }
  });

  const [horaInicioLaboral, setHoraInicioLaboral] = useState('8:00 a. m.');
  const [horaFinLaboral, setHoraFinLaboral] = useState('7:00 p. m.');

  const idEstablecimientoVinculado = barberData?.establecimientoId || barberData?.establecimiento || null;

const serviciosDisponiblesParaElegir = serviciosFirebase.filter(s => {
  if (!idEstablecimientoVinculado) {
    return String(s.barberoId || '') === String(authUser?.uid);
  }
  
  const idBarberoServ = String(s.barberoId || '');
  const idEstServ = String(s.establecimientoId || s.idEstablecimiento || s.uid || '');
  const idEstVinculadoStr = String(idEstablecimientoVinculado);
  const idAuthUserStr = String(authUser?.uid || '');

  return idBarberoServ === idAuthUserStr || 
         idBarberoServ === idEstVinculadoStr || 
         idEstServ === idEstVinculadoStr;
});

  const fechaActualEval = fechaSeleccionada || new Date(); 
  const objetoFecha = typeof fechaActualEval === 'string' 
    ? new Date(fechaActualEval + 'T00:00:00') 
    : (fechaActualEval instanceof Date ? fechaActualEval : new Date());

  const horaAMinutos = (horaStr) => {
    if (!horaStr) return 0;
    const limpio = horaStr.trim().toUpperCase().replace(/\./g, '');
    const partesHora = limpio.split(':');
    const h = parseInt(partesHora[0], 10) || 0;
    const m = parseInt(partesHora[1], 10) || 0;
    
    const esPM = limpio.includes('P');
    const esAM = limpio.includes('A');

    let realH = h;
    if (esPM && realH < 12) realH += 12;
    if (esAM && realH === 12) realH = 0;
    return realH * 60 + m;
  };

  const abrirModalEdicionBloqueo = (itemCita) => {
    setCitaSeleccionada(itemCita);
    setNuevoMotivoBloqueo(itemCita.motivo || 'No disponible');
    setNuevaFechaCita(itemCita.fechaStr || itemCita.fecha || new Date().toISOString().split('T')[0]);
    setNuevaHoraCita(itemCita.horaInicio || itemCita.hora || '12:00 a. m.');
    setNuevaHoraFinCita(itemCita.horaFin || '1:00 a. m.');
    setModalBloqueoAbierto(true);
  };

  const renderFieldView = (label, value) => {
    if (perfilCargando && !barberData) {
      return (
        <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 animate-pulse space-y-1.5">
          <div className="h-2.5 w-20 bg-slate-200 rounded" />
          <div className="h-3.5 w-36 bg-slate-200 rounded" />
        </div>
      );
    }
    const isEmpty = !value || (Array.isArray(value) && value.length === 0) || String(value).trim() === '';
    return (
      <div className={`p-2.5 rounded-xl border transition-all ${isEmpty ? 'bg-red-50 border-red-300 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
        <div className="flex items-center justify-between mb-0.5">
          <span className={`font-bold uppercase text-[9px] ${isEmpty ? 'text-red-600' : 'text-slate-500'}`}>{label}</span>
          {isEmpty && <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />}
        </div>
        <div className="text-[12px] font-medium truncate">
          {isEmpty ? <span className="text-red-500 italic text-[10px]">⚠️ Campo obligatorio sin llenar</span> : Array.isArray(value) ? value.join(', ') : value}
        </div>
      </div>
    );
  };

  const reproducirSonidoAlerta = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator(); 
      const gain = audioCtx.createGain();
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      osc.connect(gain); 
      gain.connect(audioCtx.destination);
      osc.start(); 
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  };

  const y = fechaSeleccionada.getFullYear();
  const m = fechaSeleccionada.getMonth();
  const diasDelMes = Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => {
    const d = new Date(y, m, i + 1);
    return { fechaObj: d, num: i + 1, nombre: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][d.getDay()] };
  });

  const getDiasVisibles = () => {
    const idx = Math.max(0, diasDelMes.findIndex(d => d.fechaObj.toDateString() === fechaSeleccionada.toDateString()));
    if (vistaCalendario === 'diario') return [diasDelMes[idx] || diasDelMes[0]];
    if (vistaCalendario === '3dias') return diasDelMes.slice(Math.max(0, idx - 1), Math.min(diasDelMes.length, Math.max(0, idx - 1) + 3));
    return diasDelMes.slice(Math.max(0, Math.min(idx - 3, diasDelMes.length - 7)), Math.max(0, Math.min(idx - 3, diasDelMes.length - 7)) + 7);
  };

  const aceptarVinculacion = async () => {
    try {
      const profRef = doc(db, 'profesionales', authUser.uid);
      await updateDoc(profRef, {
        estadoVinculacion: 'aceptado'
      });
      setSuccessMsg('¡Te has vinculado exitosamente al establecimiento!');
    } catch (err) {
      console.error("Error al aceptar:", err);
    }
  };

  const rechazarVinculacion = async () => {
    try {
      const profRef = doc(db, 'profesionales', authUser.uid);
      await updateDoc(profRef, {
        establecimientoId: '',
        establecimientoNombre: '',
        estadoVinculacion: 'rechazado'
      });
    } catch (err) {
      console.error("Error al rechazar:", err);
    }
  };

  // EFECTO PRINCIPAL
  useEffect(() => {
    let unsubFirestoreStatus = () => {};
    let unsubServicios = () => {};
    let unsubCitas = () => {};
    let unsubBloqueos = () => {};
    let isFirstAuthEvent = true;

    const calcTime = () => {
      const now = new Date();
      setCurrentTimeMinutes(Math.max(0, Math.min(100, ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100)));
    };
    calcTime();
    const t = setInterval(calcTime, 30000);

    const unsubAuth = onAuthStateChanged(auth, async (userAuth) => {
      if (!isFirstAuthEvent && userAuth && authUser?.uid !== userAuth.uid) {
        setIsLoggingIn(true);
      }
      isFirstAuthEvent = false;

      if (userAuth) {
        setAuthUser(userAuth);
        setPerfilCargando(true);
        const currentUserId = userAuth.uid;

unsubFirestoreStatus = onSnapshot(doc(db, 'profesionales', currentUserId), async (docSnap) => {
  if (docSnap.exists()) {
    const d = docSnap.data();
    setBarberData({ id: docSnap.id, ...d });
    setNombre(d.nombre || 'Profesional'); 
    setCiudad(d.ciudad || 'Bogotá D.C.');
    setExperiencia(d.experiencia || '1 a 3 años'); 
    setEspecialidad(d.especialidad || 'Fade & Visagismo');
    setDescripcion(d.descripcion || '');
    setFoto(d.foto || '');
    setTelefono(d.telefono || '');
    setCorreoPerfil(d.correo || userAuth.email || '');
    setPorcentaje(d.porcentaje !== undefined && d.porcentaje !== null ? d.porcentaje : '');
    setZonasTrabajo(d.zonasTrabajo || []);

    const establecimientoVinculadoId = d.establecimientoId || d.establecimiento;

    if (establecimientoVinculadoId) {
      try {
        const estRef = doc(db, 'establecimientos', establecimientoVinculadoId);
        const estSnap = await getDoc(estRef);

        if (estSnap.exists()) {
          const estData = estSnap.data();
          const serviciosEstablecimiento = estData.servicios || [];
          
          console.log("Servicios obtenidos directamente del documento del establecimiento:", serviciosEstablecimiento);

          const serviciosFormateados = serviciosEstablecimiento.map((serv, index) => ({
            id: serv.id || `est_serv_${index}`,
            nombre: serv.nombre || serv.name || 'Servicio Establecimiento',
            precio: serv.precio || (serv.precioNum ? `$${serv.precioNum}` : '$0'),
            precioNum: serv.precioNum || parseInt(String(serv.precio || '').replace(/[^0-9]/g, ''), 10) || 0,
            duracion: serv.duracion || '45 min',
            color: serv.color || '#8b5cf6',
            barberoId: establecimientoVinculadoId,
            esDelEstablecimiento: true
          }));

          setServiciosFirebase(prev => {
            const locales = prev.filter(s => !s.esDelEstablecimiento);
            return [...locales, ...serviciosFormateados];
          });
        }
      } catch (errEst) {
        console.error("Error al obtener documento del establecimiento:", errEst);
      }
    }
  } else {
    setCorreoPerfil(userAuth.email || '');
  }
  setPerfilCargando(false);
  setIsLoggingIn(false);
}, (error) => {
  console.error("Error al verificar estado del profesional:", error);
  setPerfilCargando(false);
  setIsLoggingIn(false);
});

        const qServicios = query(collection(db, 'servicios'), where('barberoId', '==', currentUserId));
        unsubServicios = onSnapshot(qServicios, (servSnap) => {
          const listaServicios = [];
          servSnap.forEach(docServ => {
            listaServicios.push({ id: docServ.id, ...docServ.data() });
          });
          setServiciosFirebase(listaServicios);
        });

        let citasTemp = [];
        let bloqueosTemp = [];

        const actualizarEstadoGlobal = () => {
          setCitasFirestore([...citasTemp, ...bloqueosTemp]);
        };

        unsubCitas = onSnapshot(collection(db, 'citas'), (snapshot) => {
          citasTemp = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const idBarberoCita = String(data.barberoId || '').trim();
            const idUserActual = String(currentUserId).trim();
            
            const coincideId = idBarberoCita === idUserActual;
            const coincideNombre = data.barberoName && nombre && (
              data.barberoName.toLowerCase().includes(nombre.toLowerCase().trim()) ||
              nombre.toLowerCase().includes(data.barberoName.toLowerCase().trim())
            );
            const perteneceEstablecimiento = data.establecimientoId && String(data.establecimientoId) === idUserActual;

            if (!coincideId && !coincideNombre && !perteneceEstablecimiento) return;

            let horaBD = (data.hora || '').trim();
            if (horaBD.includes(':') && !horaBD.toLowerCase().includes('m') && !horaBD.toLowerCase().includes('a')) {
              const partes = horaBD.split(':');
              let hNum = parseInt(partes[0], 10);
              const mNum = partes[1] || '00';
              if (!isNaN(hNum)) {
                const ampm = hNum >= 12 ? 'p. m.' : 'a. m.';
                const h12 = hNum % 12 || 12;
                horaBD = `${h12}:${mNum.substring(0, 2)} ${ampm}`;
              }
            }

            const matchHora = horasCalendario.find(h => 
              h.val24 === data.hora || 
              h.label.toLowerCase() === horaBD.toLowerCase() ||
              horaBD.toLowerCase().includes(h.val24)
            );

            const horaNormalizada = matchHora ? matchHora.label : (horaBD || '12:00 a. m.');
            const estado = (data.estado || 'pendiente').toLowerCase();

            citasTemp.push({
              ...data,
              id: docSnap.id,
              cliente: data.clienteNombre || data.cliente || 'CLIENTE',
              servicio: data.servicio || 'Servicio General',
              hora: horaNormalizada,
              fechaStr: data.fecha || data.fechaStr || '',
              estado,
              esBloqueo: false,
              motivo: data.motivo || ''
            });
          });
          actualizarEstadoGlobal();
        });

        const qBloqueos = query(collection(db, 'bloqueos'), where('barberoId', '==', currentUserId));
        unsubBloqueos = onSnapshot(qBloqueos, (snapBloq) => {
          bloqueosTemp = [];
          snapBloq.forEach(docBloq => {
            const bData = docBloq.data();
            bloqueosTemp.push({
              id: docBloq.id,
              ...bData,
              cliente: 'BLOQUEADO',
              clienteNombre: 'BLOQUEADO',
              servicio: 'Bloqueo de Horario',
              estado: 'bloqueado',
              esBloqueo: true,
              fechaStr: bData.fechaStr || bData.fecha,
              hora: bData.horaInicio || bData.hora,
              color: 'bg-slate-100/90 border-slate-300 text-slate-700 font-medium select-none cursor-pointer backdrop-blur-xs hover:bg-slate-200/90'
            });
          });

          const listaNotif = bloqueosTemp.map(b => ({
            id: b.id,
            texto: `Horario bloqueado: ${b.motivo || 'No disponible'} (${b.fechaStr})`,
            icono: '🚫',
            fecha: b.fechaStr || 'Hoy'
          }));
          setNotificaciones(listaNotif.reverse());
          actualizarEstadoGlobal();
          primerCargaRef.current = false;
        });

      } else { 
        setAuthUser(null); 
        setCitasFirestore([]); 
        setServiciosFirebase([]);
        setNotificaciones([]);
        setPerfilCargando(false);
        setIsLoggingIn(false);
        window.location.href = '/loginprofesionales';
      }
    });

    const safety = setTimeout(() => { setPerfilCargando(false); setIsLoggingIn(false); }, 2500);
    return () => { 
      unsubAuth(); 
      clearTimeout(safety); 
      clearInterval(t); 
      unsubFirestoreStatus();
      unsubServicios();
      unsubCitas();
      unsubBloqueos();
    };
  }, []);

  const [serviciosModalCita, setServiciosModalCita] = useState([]);
  const bloqueosDelBarbero = citasFirestore.filter(c => c.esBloqueo && c.barberoId === authUser?.uid);

const abrirModalCita = (cita) => {
  setCitaSeleccionada(cita);
  setNuevaFechaCita(cita.fechaStr || cita.fecha || '');
  setNuevaHoraCita(cita.hora || '');
  setNuevaHoraFinCita(cita.horaFin || 'No disponible');
  setNuevoMotivoBloqueo(cita.motivo || 'No disponible');
  
  if (cita.serviciosArray && Array.isArray(cita.serviciosArray) && cita.serviciosArray.length > 0) {
    setServiciosModalCita(cita.serviciosArray);
  } else if (cita.servicios && Array.isArray(cita.servicios) && cita.servicios.length > 0) {
    setServiciosModalCita(cita.servicios);
  } else if (cita.servicio) {
    setServiciosModalCita([{ nombre: cita.servicio, precio: cita.monto || cita.precioTotal || '$0' }]);
  } else {
    setServiciosModalCita([]);
  }
};

  const actualizarCitaArrastrada = async (cita, nuevaFechaStr, nuevaHoraExacta) => {
    try {
      const citaId = cita.id || cita.uid;
      if (!citaId) return;

      const citaRef = doc(db, "citas", citaId);
      const datosActualizados = {
        fecha: nuevaFechaStr,
        hora: nuevaHoraExacta,
      };

      await updateDoc(citaRef, datosActualizados);

      setCitasFirestore(prevCitas => 
        prevCitas.map(c => (c.id || c.uid) === citaId ? { ...c, ...datosActualizados } : c)
      );
    } catch (error) {
      console.error("Error al actualizar la cita arrastrada:", error);
      alert("Hubo un error al mover la cita. Inténtalo de nuevo.");
    }
  };

  const actualizarCitaFirestore = async (nuevoEstado) => {
    if (!citaSeleccionada) return;
    setModalLoading(true);
    try {
      const citaRef = doc(db, 'citas', citaSeleccionada.id);
      let datosActualizacion = {
        fecha: nuevaFechaCita,
        hora: nuevaHoraCita
      };

      if (citaSeleccionada.esBloqueo) {
        const minInicio = horaAMinutos(nuevaHoraCita);
        const minFin = horaAMinutos(nuevaHoraFinCita);
        if (minFin <= minInicio) {
          alert('La hora fin debe ser posterior a la hora de inicio.');
          setModalLoading(false);
          return;
        }
        datosActualizacion.horaFin = nuevaHoraFinCita;
        datosActualizacion.duracionTotal = minFin - minInicio;
        datosActualizacion.motivo = nuevoMotivoBloqueo;
      } else {
        datosActualizacion.estado = nuevoEstado;
        if (nuevoServicioCita) {
          datosActualizacion.servicio = nuevoServicioCita;
        }
      }

      await updateDoc(citaRef, datosActualizacion);
      setSuccessMsg(citaSeleccionada.esBloqueo ? 'Bloqueo actualizado correctamente' : `Cita actualizada a: ${nuevoEstado}`);
      setCitaSeleccionada(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Error al actualizar el elemento');
      setTimeout(() => setErrorMsg(''), 3000);
    }
    setModalLoading(false);
  };

  const handleGuardarServicio = async (e) => {
    e.preventDefault();
    if (!formServicio.nombre || !formServicio.precio) return alert('Nombre y precio son obligatorios');

    try {
      const colorSeleccionado = formServicio.color || (formServicio.categoria === 'paquete' ? '#3b82f6' : '#eab308');

      if (servicioEditando) {
        await updateDoc(doc(db, 'servicios', servicioEditando.id), {
          nombre: formServicio.nombre,
          descripcion: formServicio.descripcion,
          precio: formServicio.precio,
          duracion: formServicio.duracion,
          categoria: formServicio.categoria || 'servicio',
          color: colorSeleccionado
        });
        setSuccessMsg('Elemento actualizado con éxito');
      } else {
        await addDoc(collection(db, 'servicios'), {
          barberoId: authUser.uid,
          nombre: formServicio.nombre,
          descripcion: formServicio.descripcion,
          precio: formServicio.precio,
          duracion: formServicio.duracion,
          categoria: formServicio.categoria || 'servicio',
          color: colorSeleccionado
        });
        setSuccessMsg('Elemento agregado con éxito');
      }
      setShowServicioModal(false);
      setServicioEditando(null);
      setFormServicio({ nombre: '', descripcion: '', precio: '', duracion: '45 min', categoria: 'servicio', color: '#eab308' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Error al guardar el elemento');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const eliminarServicioFirestore = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        await deleteDoc(doc(db, 'servicios', id));
        setSuccessMsg('Servicio eliminado');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch {
        setErrorMsg('Error al eliminar');
      }
    }
  };

  const toggleZona = (zona) => {
    if (zonasTrabajo.includes(zona)) {
      setZonasTrabajo(zonasTrabajo.filter(z => z !== zona));
    } else {
      setZonasTrabajo([...zonasTrabajo, zona]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (isLoggingIn) return (
    <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 select-none">
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-blue-200 shadow-xl flex items-center justify-center p-2.5 mb-4 animate-pulse">
        <img 
          src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
          alt="VISARKA" 
          className="w-full h-full object-contain"
        />
      </div>
      <h1 className="text-slate-900 text-xs font-black uppercase tracking-widest">VISARKA</h1>
      <p className="text-blue-600 text-[10px] font-mono tracking-wider mt-1">Cargando Portal Profesional...</p>
      <div className="w-32 h-1 bg-blue-100 rounded-full mt-6 overflow-hidden">
        <div className="w-full h-full bg-blue-600 animate-[indeterminate_1s_infinite_linear]"></div>
      </div>
    </div>
  );

  const diasVisibles = getDiasVisibles();
  const linkReserva = `${window.location.origin}/reservar/${authUser?.uid}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-mono flex flex-col justify-between pb-36 relative select-none">
      <header className="fixed top-0 left-0 right-0 w-full bg-white border-b border-slate-200 px-3 py-2.5 flex items-center justify-between z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-blue-200 flex items-center justify-center shadow-sm p-1">
            <img 
              src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
              alt="Logo ARKANAVISION" 
              className="w-full h-full object-contain"
            />
          </div>
          {perfilCargando && !barberData ? (
            <div className="flex flex-col gap-1 animate-pulse">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-2 w-28 bg-slate-100 rounded" />
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase text-slate-900">Hola, {nombre.split(' ')[0]}</span>
              <span className="text-[8px] text-slate-400 font-bold">VISARKA • {ciudad} • {especialidad}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button 
              onClick={() => {
                setNotificacionesAbiertas(!notificacionesAbiertas);
                setMenuHamburguesaAbierto(false);
              }}
              className="p-2 rounded-xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-600 cursor-pointer relative transition-all shadow-2xs flex items-center justify-center active:scale-95"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {notificaciones.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full text-[8px] font-black flex items-center justify-center shadow-xs animate-pulse">
                  {notificaciones.length}
                </span>
              )}
            </button>

            {notificacionesAbiertas && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-900">Notificaciones de Actividad</span>
                  <button 
                    onClick={() => setNotificacionesAbiertas(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5">
                  {barberData?.establecimientoId && barberData?.estadoVinculacion === 'pendiente' && (
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 flex items-center justify-between gap-2 text-[10px] shadow-2xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs p-1 bg-white rounded-lg border border-blue-100 shadow-2xs shrink-0">🏢</span>
                        <div className="truncate">
                          <p className="font-black text-blue-950 leading-tight">Solicitud de Vinculación</p>
                          <p className="text-slate-600 truncate mt-0.5">
                            <strong className="text-slate-900">{barberData.establecimientoNombre || 'Establecimiento'}</strong> te invitó.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={aceptarVinculacion}
                          className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 text-xs"
                          title="Aceptar"
                        >
                          ✓
                        </button>
                        <button 
                          onClick={rechazarVinculacion}
                          className="w-6 h-6 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-600 border border-rose-200 font-black flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 text-xs"
                          title="Rechazar"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {notificaciones.length === 0 && (!barberData?.establecimientoId || barberData?.estadoVinculacion !== 'pendiente') ? (
                    <div className="py-6 text-center text-slate-400 text-[10px] italic">
                      No hay notificaciones recientes.
                    </div>
                  ) : (
                    notificaciones.map((notif) => (
                      <div 
                        key={notif.id} 
                        className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50/50 transition flex items-start gap-2 text-[10px]"
                      >
                        <span className="text-sm shrink-0">{notif.icono}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 leading-tight">{notif.texto}</p>
                          <span className="text-[8px] text-slate-400 mt-0.5 block">{notif.fecha}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenuHamburguesaAbierto(!menuHamburguesaAbierto);
                setNotificacionesAbiertas(false);
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 cursor-pointer transition-all shadow-2xs flex items-center justify-center active:scale-95"
              title="Menú"
            >
              <Menu className="w-4 h-4" />
            </button>

            {menuHamburguesaAbierto && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('perfil');
                    setMenuHamburguesaAbierto(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Perfil</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('comunidad');
                    setMenuHamburguesaAbierto(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Comunidad</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('servicios');
                    setMenuHamburguesaAbierto(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Servicios</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuHamburguesaAbierto(false);
                    alert('Próximamente');
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Wallet</span>
                </button>

                <div className="border-t border-slate-100 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuHamburguesaAbierto(false);
                    handleCerrarSesion();
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-red-600 font-black cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-2 w-full max-w-lg mx-auto overflow-x-hidden">
        {successMsg && <div className="mb-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{successMsg}</div>}
        {errorMsg && <div className="mb-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[10px] flex gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-red-600" />{errorMsg}</div>}

        {activeTab === 'agenda' && (
        <CalendarioProfesionales />
        )}

        {modalBloqueoAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase flex items-center gap-1">
                    🚫 {citaSeleccionada?.id ? 'GESTIONAR BLOQUEO DE HORARIO' : 'NUEVO BLOQUEO DE HORARIO'}
                  </h3>
                  <p className="text-[10px] text-indigo-600 font-bold">{nuevoMotivoBloqueo || 'No disponible'}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setModalBloqueoAbierto(false);
                    setCitaSeleccionada(null);
                  }} 
                  className="text-slate-400 font-bold cursor-pointer hover:text-slate-600 transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-[10px]">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[9px]">MOTIVO DEL BLOQUEO:</label>
                  <input 
                    type="text" 
                    value={nuevoMotivoBloqueo} 
                    onChange={(e) => setNuevoMotivoBloqueo(e.target.value)} 
                    placeholder="Ej: Almuerzo, Diligencia personal..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-800 outline-none focus:border-indigo-600"
                  />
                </div>

                {!citaSeleccionada?.id && (
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2 rounded-xl">
                    <span className="font-bold text-slate-700 uppercase text-[9px]">¿Aplicar a varios días?</span>
                    <input 
                      type="checkbox" 
                      checked={esRangoBloqueo} 
                      onChange={(e) => setEsRangoBloqueo(e.target.checked)}
                      className="rounded text-indigo-600 cursor-pointer w-4 h-4"
                    />
                  </div>
                )}

                {!citaSeleccionada?.id && esRangoBloqueo ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">DESDE LA FECHA:</label>
                      <input 
                        type="date" 
                        value={nuevaFechaCita} 
                        onChange={(e) => setNuevaFechaCita(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10px] text-slate-800 outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">HASTA LA FECHA:</label>
                      <input 
                        type="date" 
                        value={nuevaFechaFinCita} 
                        onChange={(e) => setNuevaFechaFinCita(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10px] text-slate-800 outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[9px]">FECHA DEL BLOQUEO:</label>
                    <input 
                      type="date" 
                      value={nuevaFechaCita} 
                      onChange={(e) => setNuevaFechaCita(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-800 outline-none focus:border-indigo-600"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[9px]">HORA INICIO:</label>
                    <select 
                      value={nuevaHoraCita} 
                      onChange={(e) => setNuevaHoraCita(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10px] text-slate-800 outline-none focus:border-indigo-600 font-medium"
                    >
                      {horasCalendario.map((h, i) => (
                        <option key={i} value={h.label}>{h.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[9px]">HORA FIN:</label>
                    <select 
                      value={nuevaHoraFinCita} 
                      onChange={(e) => setNuevaHoraFinCita(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10px] text-slate-800 outline-none focus:border-indigo-600 font-medium"
                    >
                      {horasCalendario.map((h, i) => (
                        <option key={i} value={h.label}>{h.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {citaSeleccionada?.id && (
                  <button 
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        setLoading(true);
                        await deleteDoc(doc(db, "bloqueos", citaSeleccionada.id));
                        setModalBloqueoAbierto(false);
                        setCitaSeleccionada(null);
                        setSuccessMsg('¡Bloqueo eliminado!');
                        setTimeout(() => setSuccessMsg(''), 3000);
                      } catch (error) {
                        console.error("Error al eliminar el bloqueo:", error);
                        setErrorMsg("No se pudo eliminar el bloqueo.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2.5 rounded-xl text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer transition"
                  >
                    🗑️ Eliminar
                  </button>
                )}

                <button 
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      setLoading(true);

                      const minInicio = horaAMinutos(nuevaHoraCita);
                      const minFin = horaAMinutos(nuevaHoraFinCita);
                      let duracionTotal = minFin - minInicio;
                      if (duracionTotal <= 0) duracionTotal += 1440;

                      const payloadBase = {
                        barberoId: authUser.uid,
                        motivo: nuevoMotivoBloqueo || 'No disponible',
                        horaInicio: nuevaHoraCita,
                        hora: nuevaHoraCita,
                        horaFin: nuevaHoraFinCita,
                        duracionTotal,
                        esBloqueo: true,
                        creadoEn: new Date().toISOString()
                      };

                      if (citaSeleccionada?.id) {
                        const payloadEditar = {
                          ...payloadBase,
                          fechaStr: nuevaFechaCita,
                          fecha: nuevaFechaCita
                        };
                        await updateDoc(doc(db, "bloqueos", citaSeleccionada.id), payloadEditar);
                        setSuccessMsg('¡Bloqueo actualizado con éxito!');
                      } else if (esRangoBloqueo) {
                        const fechaInicioObj = new Date(nuevaFechaCita + 'T00:00:00');
                        const fechaFinObj = new Date((nuevaFechaFinCita || nuevaFechaCita) + 'T00:00:00');

                        if (fechaFinObj < fechaInicioObj) {
                          setErrorMsg('La fecha de fin no puede ser anterior a la fecha de inicio.');
                          setLoading(false);
                          return;
                        }

                        let fechaActualObj = new Date(fechaInicioObj);
                        while (fechaActualObj <= fechaFinObj) {
                          const fechaStrActual = fechaActualObj.toISOString().split('T')[0];
                          const payloadRango = {
                            ...payloadBase,
                            fechaStr: fechaStrActual,
                            fecha: fechaStrActual
                          };
                          await addDoc(collection(db, "bloqueos"), payloadRango);
                          fechaActualObj.setDate(fechaActualObj.getDate() + 1);
                        }
                        setSuccessMsg('¡Bloqueos en rango guardados con éxito!');
                      } else {
                        const payloadUnico = {
                          ...payloadBase,
                          fechaStr: nuevaFechaCita,
                          fecha: nuevaFechaCita
                        };
                        await addDoc(collection(db, "bloqueos"), payloadUnico);
                        setSuccessMsg('¡Bloqueo guardado con éxito!');
                      }

                      setModalBloqueoAbierto(false);
                      setCitaSeleccionada(null);
                      setEsRangoBloqueo(false);
                      setTimeout(() => setSuccessMsg(''), 3000);
                    } catch (error) {
                      console.error("Error al guardar el bloqueo:", error);
                      setErrorMsg('Ocurrió un error al guardar el bloqueo.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase shadow-xs flex items-center justify-center gap-1 cursor-pointer transition"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    citaSeleccionada?.id ? '✓ GUARDAR CAMBIOS' : '✓ GUARDAR'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      {modalNuevaCitaAbierto && (
  <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
          ✨ Registrar Cita Nueva
        </h3>
        <button onClick={() => setModalNuevaCitaAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
      </div>

      <div className="space-y-3 text-[11px]">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Nombre:</label>
            <input 
              type="text" 
              value={datosNuevaCita.clienteNombre || ''} 
              onChange={(e) => setDatosNuevaCita({...datosNuevaCita, clienteNombre: e.target.value})}
              placeholder="Ej: Carlos"
              className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Apellido:</label>
            <input 
              type="text" 
              value={datosNuevaCita.clienteApellido || ''} 
              onChange={(e) => setDatosNuevaCita({...datosNuevaCita, clienteApellido: e.target.value})}
              placeholder="Ej: Pérez"
              className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Teléfono:</label>
          <input 
            type="tel" 
            value={datosNuevaCita.telefono || ''} 
            onChange={(e) => setDatosNuevaCita({...datosNuevaCita, telefono: e.target.value})}
            placeholder="+57 300 0000000"
            className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Correo Electrónico:</label>
          <input 
            type="email" 
            value={datosNuevaCita.correo || ''} 
            onChange={(e) => setDatosNuevaCita({...datosNuevaCita, correo: e.target.value})}
            placeholder="cliente@email.com"
            className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
          />
        </div>

        <div className="space-y-2 pt-1 border-t border-slate-100">
          <label className="font-bold text-slate-700 uppercase text-[9px] block">Servicios Seleccionados:</label>
          
          <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
            {(!datosNuevaCita.serviciosArray || datosNuevaCita.serviciosArray.length === 0) ? (
              <span className="text-slate-400 italic text-[10px]">No hay servicios seleccionados.</span>
            ) : (
              datosNuevaCita.serviciosArray.map((s, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-950 px-2 py-1 rounded-lg font-bold text-[9px] shadow-xs">
                  <span>{s.nombre}</span>
                  <span className="text-indigo-600 font-normal">({s.precio})</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      const nuevosServicios = datosNuevaCita.serviciosArray.filter((_, i) => i !== idx);
                      setDatosNuevaCita({...datosNuevaCita, serviciosArray: nuevosServicios});
                    }}
                    className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <select 
              id="select-nuevo-servicio-cita"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium text-[10px]"
            >
              <option value="">-- Seleccionar servicio --</option>
              {serviciosDisponiblesParaElegir.map((serv) => (
                <option key={serv.id} value={serv.id}>{serv.nombre} - {serv.precio}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                const selectEl = document.getElementById('select-nuevo-servicio-cita');
                const servId = selectEl.value;
                if (!servId) return;
                const servEncontrado = serviciosDisponiblesParaElegir.find(s => s.id === servId);
                if (servEncontrado) {
                  const actualServicios = datosNuevaCita.serviciosArray || [];
                  setDatosNuevaCita({
                    ...datosNuevaCita, 
                    serviciosArray: [...actualServicios, {
                      nombre: servEncontrado.nombre,
                      precio: servEncontrado.precio,
                      precioNum: servEncontrado.precioNum || parseInt(String(servEncontrado.precio || '').replace(/[^0-9]/g, ''), 10) || 0,
                      duracion: servEncontrado.duracion || 30,
                      color: servEncontrado.color || '#2563eb'
                    }]
                  });
                  selectEl.value = '';
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl text-[10px] uppercase cursor-pointer shadow-xs transition"
            >
              Añadir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Fecha:</label>
            <input 
              type="date" 
              value={datosNuevaCita.fechaStr} 
              onChange={(e) => setDatosNuevaCita({...datosNuevaCita, fechaStr: e.target.value})}
              className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Hora:</label>
            <select 
              value={datosNuevaCita.hora} 
              onChange={(e) => setDatosNuevaCita({...datosNuevaCita, hora: e.target.value})}
              className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50 text-[10px]"
            >
              {horasCalendario.map((h, i) => (
                <option key={i} value={h.label}>{h.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button 
          onClick={() => setModalNuevaCitaAbierto(false)}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl transition text-[10px] cursor-pointer"
        >
          Cancelar
        </button>
        <button 
          onClick={async () => {
            const nombreCompleto = `${datosNuevaCita.clienteNombre || ''} ${datosNuevaCita.clienteApellido || ''}`.trim();
            const listaServicios = datosNuevaCita.serviciosArray || [];

            if (!nombreCompleto || listaServicios.length === 0) {
              alert('Debes ingresar el nombre del cliente y al menos un servicio.');
              return;
            }

            const nombresServiciosStr = listaServicios.map(s => s.nombre).join(', ');
            
            const sumaTotal = listaServicios.reduce((acc, s) => acc + (s.precioNum || 0), 0);
            const totalFormateado = sumaTotal > 0 ? `$${sumaTotal.toLocaleString('es-CO')} COP` : '$0 COP';

            const estVinculadoId = barberData?.establecimientoId || barberData?.establecimiento || null;

            const nuevaCitaDoc = {
              barberoId: authUser.uid,
              barberoName: nombre,
              establecimientoId: estVinculadoId || authUser.uid,
              clienteNombre: nombreCompleto,
              telefono: datosNuevaCita.telefono || '',
              correo: datosNuevaCita.correo || '',
              servicio: nombresServiciosStr,
              servicios: listaServicios,
              serviciosArray: listaServicios,
              precioTotal: totalFormateado,
              monto: totalFormateado,
              fecha: datosNuevaCita.fechaStr,
              fechaStr: datosNuevaCita.fechaStr,
              hora: datosNuevaCita.hora,
              duracionTotal: listaServicios.reduce((acc, s) => acc + (Number(s.duracion) || 30), 0),
              estado: 'confirmada',
              creadoEn: new Date().toISOString()
            };

            try {
              await addDoc(collection(db, 'citas'), nuevaCitaDoc);
              setSuccessMsg('¡Cita creada correctamente!');
              setModalNuevaCitaAbierto(false);
              setDatosNuevaCita({ 
                clienteNombre: '', 
                clienteApellido: '', 
                telefono: '', 
                correo: '', 
                serviciosArray: [], 
                fechaStr: new Date().toISOString().split('T')[0], 
                hora: '12:00 a. m.' 
              });
              setTimeout(() => setSuccessMsg(''), 3000);
            } catch (err) {
              console.error("Error al registrar la cita:", err);
              setErrorMsg('Error al registrar la cita.');
              setTimeout(() => setErrorMsg(''), 3000);
            }
          }}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition text-[10px] shadow-sm cursor-pointer uppercase"
        >
          Crear Cita
        </button>
      </div>
    </div>
  </div>
)}

        {activeTab === 'servicios' && (
          <div className="space-y-3 bg-white p-4 rounded-2xl shadow-sm text-slate-800">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900">Mis Servicios y Paquetes</h3>
                <p className="text-[9px] text-slate-500">Configura los servicios y paquetes que ofreces a tus clientes</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  type="button"
                  onClick={() => {
                    setServicioEditando(null);
                    setFormServicio({ 
                      nombre: '', 
                      descripcion: '', 
                      precio: '', 
                      duracion: pestanaActiva === 'internos' ? 'interno' : '45 min', 
                      categoria: 'servicio', 
                      color: pestanaActiva === 'internos' ? '#10b981' : '#0ea5e9' 
                    });
                    setShowServicioModal(true);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition shadow-sm ${
                    pestanaActiva === 'internos'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border border-emerald-600/30 shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white border border-sky-600/30 shadow-sky-500/20'
                  }`}
                >
                  <Plus className="w-3 h-3 text-white" /> Servicio
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setServicioEditando(null);
                    setFormServicio({ 
                      nombre: '', 
                      descripcion: '', 
                      precio: '', 
                      duracion: pestanaActiva === 'internos' ? 'interno' : '60 min', 
                      categoria: 'paquete', 
                      color: pestanaActiva === 'internos' ? '#059669' : '#3b82f6' 
                    });
                    setShowServicioModal(true);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition"
                >
                  <Plus className="w-3 h-3 text-slate-600" /> Paquete
                </button>
              </div>
            </div>

            <div className="flex border-b border-slate-200 gap-4">
              <button
                type="button"
                onClick={() => setPestanaActiva('externos')}
                className={`pb-2 text-[10px] font-bold uppercase border-b-2 cursor-pointer transition-colors ${
                  pestanaActiva === 'externos' 
                    ? 'border-sky-500 text-sky-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Servicios Externos
              </button>
              <button
                type="button"
                onClick={() => setPestanaActiva('internos')}
                className={`pb-2 text-[10px] font-bold uppercase border-b-2 cursor-pointer transition-colors ${
                  pestanaActiva === 'internos' 
                    ? 'border-emerald-500 text-emerald-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Servicios Internos
              </button>
            </div>

            <div className="space-y-2">
              {serviciosFirebase.filter(serv => pestanaActiva === 'internos' ? serv.duracion === 'interno' : serv.duracion !== 'interno').length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center text-slate-500 text-[10px]">
                  {pestanaActiva === 'internos' 
                    ? 'No tienes servicios internos creados.' 
                    : 'No tienes servicios externos creados.'}
                </div>
              ) : (
                serviciosFirebase
                  .filter(serv => pestanaActiva === 'internos' ? serv.duracion === 'interno' : serv.duracion !== 'interno')
                  .map(serv => {
                    const esPaquete = serv.categoria === 'paquete';
                    const esInterno = pestanaActiva === 'internos';
                    const colorServicio = serv.color || (esPaquete ? (esInterno ? '#059669' : '#3b82f6') : (esInterno ? '#10b981' : '#0ea5e9'));

                    return (
                      <div key={serv.id} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex justify-between items-start shadow-xs gap-3 relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${esInterno ? 'bg-gradient-to-b from-emerald-400 to-teal-600' : 'bg-gradient-to-b from-sky-400 to-blue-600'}`} />
                        
                        <div className="flex items-start gap-2.5 pl-1">
                          <div 
                            className="w-3 h-3 rounded-full mt-1 shrink-0 border border-slate-300 shadow-xs" 
                            style={{ backgroundColor: colorServicio }} 
                            title={`Color: ${colorServicio}`}
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[8px] px-2 py-0.5 rounded-lg font-bold uppercase border ${
                                esInterno 
                                  ? (esPaquete ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
                                  : (esPaquete ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-sky-50 border-sky-200 text-sky-600')
                              }`}>
                                {esPaquete ? 'Paquete' : 'Servicio'}
                              </span>
                              <p className="text-[11px] font-bold text-slate-800">{serv.nombre}</p>
                              {pestanaActiva !== 'internos' && (
                                <span className="text-[8px] bg-slate-200/70 border border-slate-300 text-slate-600 px-2 py-0.5 rounded-lg font-bold">Duración: {serv.duracion}</span>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-500 leading-snug">{serv.descripcion || 'Sin descripción detallada.'}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 shrink-0">
                          <p className={`text-[11px] font-bold bg-gradient-to-r bg-clip-text text-transparent ${esInterno ? 'from-emerald-600 to-teal-600' : 'from-sky-600 to-blue-600'}`}>{serv.precio}</p>
                          <div className="flex items-center gap-1">
                            <button 
                              type="button"
                              onClick={() => {
                                setServicioEditando(serv);
                                setFormServicio({ 
                                  nombre: serv.nombre, 
                                  descripcion: serv.descripcion || '', 
                                  precio: serv.precio, 
                                  duracion: pestanaActiva === 'internos' ? 'interno' : (serv.duracion || '45 min'),
                                  categoria: serv.categoria || 'servicio',
                                  color: serv.color || (serv.categoria === 'paquete' ? (esInterno ? '#059669' : '#3b82f6') : (esInterno ? '#10b981' : '#0ea5e9'))
                                });
                                setShowServicioModal(true);
                              }}
                              className={`p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 cursor-pointer transition-colors shadow-xs ${
                                esInterno ? 'hover:bg-emerald-50 hover:text-emerald-600' : 'hover:bg-sky-50 hover:text-sky-600'
                              }`}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => eliminarServicioFirestore(serv.id)}
                              className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 cursor-pointer transition-colors shadow-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {showServicioModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full inline-block ${pestanaActiva === 'internos' ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
                      {servicioEditando ? '✏️ EDITAR SERVICIO / PAQUETE' : '✨ NUEVO SERVICIO O PAQUETE'}
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setShowServicioModal(false)} 
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 cursor-pointer transition"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={(e) => {
                    if (pestanaActiva === 'internos') {
                      e.preventDefault();
                    }
                    handleGuardarServicio(e);
                  }} className="space-y-3 text-[10px]">
                    
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">Tipo</label>
                      <select 
                        value={formServicio.categoria} 
                        onChange={e => setFormServicio({...formServicio, categoria: e.target.value})}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 outline-none font-medium uppercase ${
                          pestanaActiva === 'internos' ? 'focus:border-emerald-500' : 'focus:border-sky-500'
                        }`}
                      >
                        <option value="servicio">SERVICIO</option>
                        <option value="paquete">PAQUETE</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">Nombre del Servicio / Paquete *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="EJ: CORTE FADE + BARBA VIP" 
                        value={formServicio.nombre} 
                        onChange={e => setFormServicio({...formServicio, nombre: e.target.value.toUpperCase()})}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[11px] text-slate-800 outline-none uppercase ${
                          pestanaActiva === 'internos' ? 'focus:border-emerald-500' : 'focus:border-sky-500'
                        }`} 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">Descripción</label>
                      <textarea 
                        rows="2" 
                        placeholder="DETALLES DE LO QUE INCLUYE..." 
                        value={formServicio.descripcion} 
                        onChange={e => setFormServicio({...formServicio, descripcion: e.target.value.toUpperCase()})}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[11px] text-slate-800 outline-none resize-none uppercase ${
                          pestanaActiva === 'internos' ? 'focus:border-emerald-500' : 'focus:border-sky-500'
                        }`} 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">Color del Servicio</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                          <input 
                            type="color" 
                            value={formServicio.color || (pestanaActiva === 'internos' ? '#10b981' : '#0ea5e9')} 
                            onChange={e => setFormServicio({...formServicio, color: e.target.value})}
                            className="w-7 h-6 rounded border-0 bg-transparent cursor-pointer outline-none"
                          />
                          <span className="ml-2 text-xs font-mono uppercase text-slate-600">
                            {formServicio.color || (pestanaActiva === 'internos' ? '#10b981' : '#0ea5e9')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        {(pestanaActiva === 'internos' 
                          ? ['#10b981', '#34d399', '#059669', '#0d9488', '#14b8a6', '#22c55e', '#84cc16', '#6366f1', '#ec4899', '#64748b']
                          : ['#0ea5e9', '#38bdf8', '#3b82f6', '#6366f1', '#06b6d4', '#10b981', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b']
                        ).map((colorHex) => (
                          <button
                            key={colorHex}
                            type="button"
                            onClick={() => setFormServicio({ ...formServicio, color: colorHex })}
                            className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform cursor-pointer shadow-xs"
                            style={{ backgroundColor: colorHex }}
                            title={colorHex}
                          />
                        ))}
                      </div>
                    </div>

                    <div className={pestanaActiva === 'internos' ? "space-y-1" : "grid grid-cols-2 gap-2"}>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[9px]">Precio *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="EJ: $45.000" 
                          value={formServicio.precio} 
                          onChange={e => setFormServicio({...formServicio, precio: e.target.value})}
                          className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[11px] text-slate-800 outline-none ${
                            pestanaActiva === 'internos' ? 'focus:border-emerald-500' : 'focus:border-sky-500'
                          }`} 
                        />
                      </div>
                      {pestanaActiva !== 'internos' && (
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 uppercase text-[9px]">Duración</label>
                          <input 
                            type="text" 
                            placeholder="EJ: 45 MIN" 
                            value={formServicio.duracion} 
                            onChange={e => setFormServicio({...formServicio, duracion: e.target.value.toUpperCase()})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[11px] text-slate-800 outline-none focus:border-sky-500 uppercase" 
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => setShowServicioModal(false)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-[10px] transition-colors cursor-pointer border border-slate-200 uppercase"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        onClick={() => {
                          if (pestanaActiva === 'internos') {
                            setFormServicio(prev => ({ ...prev, duracion: 'interno' }));
                          }
                        }}
                        className={`flex-1 font-black py-2 rounded-xl text-[10px] uppercase transition-all cursor-pointer shadow-md ${
                          pestanaActiva === 'internos'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-sky-500/20'
                        }`}
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comunidad' && (
          <Comunidad />
        )}

        {activeTab === 'facturacion' && (
          <Wallet setPestanaActiva={setPestanaActiva} setActiveTab={setActiveTab}/>
        )}

        {activeTab === 'estadisticas' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs"><p className="text-[9px] font-bold text-slate-400 uppercase">Calificación</p><p className="text-2xl font-black text-indigo-600 mt-1">4.9 ★</p></div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs"><p className="text-[9px] font-bold text-slate-400 uppercase">Ingresos Semana</p><p className="text-xl font-black text-fuchsia-600 mt-1">$680.000</p></div>
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="space-y-3">
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-2 shadow-xs">
              <h3 className="text-[11px] font-black uppercase text-indigo-950 flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5 text-indigo-600" /> Link de Reserva para Clientes</h3>
              <p className="text-[9px] text-indigo-800">Comparte este enlace para que tus clientes reserven directamente contigo:</p>
              <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-xl p-2">
                <input type="text" readOnly value={linkReserva} className="w-full bg-transparent text-[10px] text-slate-700 outline-none truncate" />
                <button onClick={() => { navigator.clipboard.writeText(linkReserva); setSuccessMsg('¡Enlace copiado al portapapeles!'); setTimeout(() => setSuccessMsg(''), 3000); }} className="bg-indigo-600 text-white p-2 rounded-lg cursor-pointer hover:bg-indigo-700 shrink-0"><Copy className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-[11px] font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Perfil Profesional
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => setModalHorarioSemanalAbierto(true)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1.5 cursor-pointer transition">
                    🕒 Horarios
                  </button>
                  <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1.5 cursor-pointer transition">
                    <Edit3 className="w-3 h-3" /> Editar
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-[10px]">
                {renderFieldView("Nombre Completo", nombre)}
                {renderFieldView("Descripción / Biografía", descripcion)}
                <div className="grid grid-cols-2 gap-2">
                  {renderFieldView("Teléfono / WhatsApp", telefono)}
                  {renderFieldView("Correo Electrónico", correoPerfil)}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {renderFieldView("Ciudad", ciudad)}
                  {renderFieldView("Experiencia", experiencia)}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {renderFieldView("Especialidad", especialidad)}
                  {renderFieldView("Porcentaje (%)", porcentaje !== undefined && porcentaje !== null && porcentaje !== '' ? `${porcentaje}%` : '0%')}
                </div>

                {perfilCargando && !barberData ? (
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 animate-pulse space-y-1.5">
                    <div className="h-2.5 w-32 bg-slate-200 rounded" />
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                  </div>
                ) : (
                  <div className={`p-2.5 rounded-xl border transition-all ${!zonasTrabajo || zonasTrabajo.length === 0 ? 'bg-red-50 border-red-300 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold uppercase text-[9px] ${!zonasTrabajo || zonasTrabajo.length === 0 ? 'text-red-600' : 'text-slate-500'}`}>Zonas de Bogotá donde trabajas</span>
                      {(!zonasTrabajo || zonasTrabajo.length === 0) && <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />}
                    </div>
                    {(!zonasTrabajo || zonasTrabajo.length === 0) ? (
                      <span className="text-red-500 italic text-[10px]">⚠️ Debes seleccionar al menos una zona</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {zonasTrabajo.map(z => (
                          <span key={z} className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-bold text-[9px]">{z}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {modalHorarioSemanalAbierto && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                <div className="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase">🕒 Horario Semanal</h3>
                    <button onClick={() => setModalHorarioSemanalAbierto(false)} className="text-slate-400 font-bold cursor-pointer">✕</button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-[10px]">
                    {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((diaKey) => {
                      const configDia = horarioSemanal[diaKey] || { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' };
                      return (
                        <div key={diaKey} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 gap-2">
                          <div className="flex items-center gap-2 shrink-0 w-24">
                            <input 
                              type="checkbox" 
                              checked={configDia.abierto} 
                              onChange={(e) => setHorarioSemanal({ ...horarioSemanal, [diaKey]: { ...configDia, abierto: e.target.checked } })}
                              className="rounded text-indigo-600 cursor-pointer"
                            />
                            <span className="capitalize font-bold text-slate-700">{diaKey}</span>
                          </div>

                          {configDia.abierto ? (
                            <div className="flex items-center gap-1 flex-1 justify-end">
                              <select 
                                value={configDia.apertura}
                                onChange={(e) => setHorarioSemanal({ ...horarioSemanal, [diaKey]: { ...configDia, apertura: e.target.value } })}
                                className="bg-white border border-slate-200 rounded-lg p-1 text-[9px] font-medium text-slate-800"
                              >
                                {horasCalendario.map((h, i) => <option key={i} value={h.label}>{h.label}</option>)}
                              </select>
                              <span className="text-slate-400">a</span>
                              <select 
                                value={configDia.cierre}
                                onChange={(e) => setHorarioSemanal({ ...horarioSemanal, [diaKey]: { ...configDia, cierre: e.target.value } })}
                                className="bg-white border border-slate-200 rounded-lg p-1 text-[9px] font-medium text-slate-800"
                              >
                                {horasCalendario.map((h, i) => <option key={i} value={h.label}>{h.label}</option>)}
                              </select>
                            </div>
                          ) : (
                            <span className="text-red-500 font-bold italic pr-2">Cerrado</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setModalHorarioSemanalAbierto(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-xl text-[10px]">Cancelar</button>
                    <button 
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, 'profesionales', authUser.uid), { horarioSemanal });
                          setSuccessMsg('¡Horario semanal actualizado correctamente!');
                          setModalHorarioSemanalAbierto(false);
                          setTimeout(() => setSuccessMsg(''), 3000);
                        } catch (err) {
                          setErrorMsg('Error al guardar el horario.');
                        }
                      }}
                      className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-xl text-[10px] uppercase shadow-xs"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
  <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
      <h3 className="text-[11px] font-black uppercase text-slate-900 flex items-center gap-1.5">
        <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Editar Perfil Profesional
      </h3>
      <button
        type="button"
        onClick={() => setIsModalOpen(false)}
        className="bg-slate-200/80 hover:bg-slate-300 p-1 rounded-full text-slate-700 cursor-pointer transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>

    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!authUser?.uid) return;
        setLoading(true);
        try {
          await updateDoc(doc(db, 'profesionales', authUser.uid), {
            nombre: nombre ?? '',
            descripcion: descripcion ?? '',
            foto: foto ?? '',
            telefono: telefono ?? '',
            correo: correoPerfil ?? '',
            zonasTrabajo: Array.isArray(zonasTrabajo) ? zonasTrabajo : [],
            experiencia: experiencia ?? '',
            ciudad: ciudad ?? '',
            especialidad: especialidad ?? '',
            porcentaje: porcentaje !== '' && porcentaje !== undefined ? Number(porcentaje) : 0
          });
          setSuccessMsg('¡Perfil actualizado con éxito!');
          setIsModalOpen(false);
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
          console.error('Error al actualizar perfil:', err);
        } finally {
          setLoading(false);
        }
      }}
      className="p-3.5 sm:p-4 space-y-2.5 overflow-y-auto text-[10px]"
    >
      {/* Fila 1: Foto + Nombre lado a lado */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-2.5 items-center bg-slate-50/70 p-2 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 hover:border-indigo-400 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer transition"
            title="Cambiar foto de perfil"
          >
            {foto ? (
              <img src={foto} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="sm:hidden bg-white border border-slate-200 text-slate-700 py-1 px-2.5 rounded-lg text-[10px] font-bold cursor-pointer"
          >
            Cambiar foto
          </button>
        </div>

        <div className="space-y-0.5">
          <label className="font-bold text-slate-500 uppercase text-[8px]">Nombre Completo</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-[16px] leading-tight text-slate-900 outline-none focus:border-indigo-600"
            required
          />
        </div>
      </div>

      {/* Fila 2: Biografía a la izquierda + Teléfono y Correo a la derecha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-0.5 flex flex-col">
          <label className="font-bold text-slate-500 uppercase text-[8px]">Descripción / Biografía</label>
          <textarea
            rows="3"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Cuéntale a tus clientes sobre tu experiencia y estilo..."
            className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-[16px] leading-tight text-slate-900 outline-none focus:border-indigo-600 resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <div className="space-y-0.5">
            <label className="font-bold text-slate-500 uppercase text-[8px]">Teléfono / WhatsApp</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+57 300 0000000"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-[16px] leading-tight text-slate-900 outline-none focus:border-indigo-600"
            />
          </div>
          <div className="space-y-0.5">
            <label className="font-bold text-slate-500 uppercase text-[8px]">Correo (No editable)</label>
            <input
              type="email"
              value={correoPerfil}
              disabled
              className="w-full bg-slate-100 border border-slate-200 rounded-lg py-1 px-2.5 text-[16px] leading-tight text-slate-500 cursor-not-allowed shadow-none outline-none select-none"
            />
          </div>
        </div>
      </div>

      {/* Fila 3: Ciudad, Experiencia, Especialidad y % lado a lado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="space-y-0.5">
          <label className="font-bold text-slate-500 uppercase text-[8px]">Ciudad</label>
          <input
            type="text"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-[16px] leading-tight text-slate-900 outline-none focus:border-indigo-600"
          />
        </div>
        <div className="space-y-0.5">
          <label className="font-bold text-slate-500 uppercase text-[8px]">Experiencia</label>
          <input
            type="text"
            value={experiencia}
            onChange={(e) => setExperiencia(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-[16px] leading-tight text-slate-900 outline-none focus:border-indigo-600"
          />
        </div>
        <div className="space-y-0.5">
          <label className="font-bold text-slate-500 uppercase text-[8px]">Especialidad</label>
          <input
            type="text"
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-[16px] leading-tight text-slate-900 outline-none focus:border-indigo-600"
          />
        </div>
        <div className="space-y-0.5">
          <label className="font-bold text-slate-500 uppercase text-[8px]">Porcentaje (%)</label>
          <input
            type="number"
            value={porcentaje}
            onChange={(e) => setPorcentaje(e.target.value)}
            placeholder="0"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-[16px] leading-tight text-slate-900 outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Mapa Realista de Bogotá D.C. y Soacha con Buscador, Localidades, Barrios/Sectores y Avenidas */}
      <div className="space-y-1 pt-0.5">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-500 uppercase text-[8px]">
            Zonas de Bogotá y Soacha ({zonasTrabajo?.length || 0} seleccionadas)
          </label>
          {zonasTrabajo?.length > 0 && (
            <button
              type="button"
              onClick={() => setZonasTrabajo([])}
              className="text-[8px] font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Limpiar selección
            </button>
          )}
        </div>

        {(() => {
          const zonasBogotaYSoacha = [
            { nombre: 'Suba', grupo: 'Bogotá', sectores: ['Colina Campestre', 'Niza', 'Tibabuyes'], d: 'M 146 22 Q 178 16 212 34 L 234 62 Q 228 88 218 106 L 188 122 L 144 114 Q 124 98 112 82 Q 114 54 126 36 Z', lx: 174, ly: 72 },
            { nombre: 'Usaquén', grupo: 'Bogotá', sectores: ['Cedritos', 'Unicentro', 'Santa Bárbara'], d: 'M 212 34 Q 256 44 294 74 Q 308 94 296 114 L 256 118 L 218 106 Q 228 88 234 62 Z', lx: 260, ly: 82 },
            { nombre: 'Engativá', grupo: 'Bogotá', sectores: ['Normandía', 'Quirigua', 'Álamos'], d: 'M 112 114 L 144 114 L 188 122 L 184 154 L 134 154 Q 116 146 102 138 Z', lx: 146, ly: 136 },
            { nombre: 'Barrios Unidos', grupo: 'Bogotá', sectores: ['Doce de Octubre', 'Metrópolis', 'La Castellana'], d: 'M 188 122 L 234 118 L 232 148 L 184 154 Z', lx: 210, ly: 137 },
            { nombre: 'Chapinero', grupo: 'Bogotá', sectores: ['Chicó', 'Zona T', 'Rosales', 'Quinta Camacho'], d: 'M 234 118 L 296 114 Q 316 130 322 148 L 310 168 L 250 164 L 232 148 Z', lx: 276, ly: 142 },
            { nombre: 'Fontibón', grupo: 'Bogotá', sectores: ['Modelia', 'Hayuelos', 'Aeropuerto'], d: 'M 62 146 Q 82 140 102 138 L 134 154 L 130 184 L 74 184 Q 56 174 48 160 Z', lx: 92, ly: 164 },
            { nombre: 'Teusaquillo', grupo: 'Bogotá', sectores: ['Galerías', 'Park Way', 'Salitre'], d: 'M 184 154 L 232 148 L 250 164 L 242 188 L 184 186 Z', lx: 214, ly: 169 },
            { nombre: 'Santa Fe', grupo: 'Bogotá', sectores: ['La Macarena', 'Las Nieves', 'Centro Internacional'], d: 'M 250 164 L 310 168 Q 328 180 334 196 L 314 214 L 270 202 L 242 188 Z', lx: 288, ly: 186 },
            { nombre: 'Los Mártires', grupo: 'Bogotá', sectores: ['Ricaurte', 'Paloquemao', 'San Victorino'], d: 'M 232 186 L 260 188 L 258 208 L 230 208 Z', lx: 245, ly: 198 },
            { nombre: 'La Candelaria', grupo: 'Bogotá', sectores: ['Centro Histórico', 'Egipto'], d: 'M 260 188 L 282 194 L 280 212 L 258 208 Z', lx: 270, ly: 201 },
            { nombre: 'Puente Aranda', grupo: 'Bogotá', sectores: ['Galán', 'Muzu', 'Alquería'], d: 'M 184 186 L 232 186 L 230 222 L 180 220 Z', lx: 206, ly: 204 },
            { nombre: 'Antonio Nariño', grupo: 'Bogotá', sectores: ['Restrepo', 'Ciudad Jardín'], d: 'M 230 208 L 260 208 L 258 230 L 228 228 Z', lx: 244, ly: 219 },
            { nombre: 'Kennedy', grupo: 'Bogotá', sectores: ['Tintal', 'Castilla', 'Timiza'], d: 'M 74 184 L 130 184 L 180 186 L 180 234 L 114 238 Q 84 228 62 214 Z', lx: 124, ly: 212 },
            { nombre: 'Bosa', grupo: 'Bogotá', sectores: ['Bosa Centro', 'Porvenir'], d: 'M 38 220 Q 50 216 62 214 L 114 238 L 108 270 L 48 266 Q 34 252 30 236 Z', lx: 72, ly: 246 },
            { nombre: 'Tunjuelito', grupo: 'Bogotá', sectores: ['Venecia', 'San Carlos'], d: 'M 172 234 L 208 234 L 206 262 L 170 260 Z', lx: 189, ly: 248 },
            { nombre: 'Rafael Uribe Uribe', grupo: 'Bogotá', sectores: ['Quiroga', 'Olaya', 'Marco Fidel Suárez'], d: 'M 208 222 L 258 230 L 254 268 L 206 262 Z', lx: 232, ly: 246 },
            { nombre: 'San Cristóbal', grupo: 'Bogotá', sectores: ['20 de Julio', 'Velódromo'], d: 'M 258 208 L 314 214 Q 332 228 338 246 L 320 274 L 254 268 Z', lx: 296, ly: 242 },
            { nombre: 'Ciudad Bolívar', grupo: 'Bogotá', sectores: ['Lucero', 'El Mochuelo'], d: 'M 108 270 L 170 260 L 206 262 L 194 332 L 134 326 Q 114 310 102 292 Z', lx: 152, ly: 298 },
            { nombre: 'Usme', grupo: 'Bogotá', sectores: ['Usme Centro', 'Yomasa'], d: 'M 206 262 L 254 268 L 320 274 Q 334 296 330 318 L 284 356 L 194 332 Z', lx: 262, ly: 312 },
            { nombre: 'Sumapaz', grupo: 'Bogotá', sectores: ['Nazareth', 'San Juan'], d: 'M 134 326 L 194 332 L 284 356 L 272 442 Q 248 468 218 476 Q 182 472 160 458 L 132 396 Z', lx: 212, ly: 404 },
            { nombre: 'Comuna 3 La Despensa', grupo: 'Soacha', sectores: ['Terreros', 'León XIII'], d: 'M 48 266 L 108 270 L 104 294 L 46 290 Z', lx: 76, ly: 280 },
            { nombre: 'Comuna 2 Soacha Central', grupo: 'Soacha', sectores: ['Centro Soacha', 'El Silo'], d: 'M 46 290 L 104 294 L 102 318 L 44 314 Z', lx: 73, ly: 306 },
            { nombre: 'Comuna 1 Compartir', grupo: 'Soacha', sectores: ['Compartir', 'Indumil'], d: 'M 26 286 L 46 290 L 44 326 L 22 322 Z', lx: 34, ly: 306 },
            { nombre: 'Comuna 6 San Humberto', grupo: 'Soacha', sectores: ['San Humberto', 'Bosques de Soacha'], d: 'M 44 314 L 102 318 L 106 340 L 46 336 Z', lx: 75, ly: 328 },
            { nombre: 'Comuna 5 San Mateo', grupo: 'Soacha', sectores: ['San Mateo', 'Ciudad Verde'], d: 'M 22 322 L 44 326 L 46 352 L 20 348 Z', lx: 33, ly: 338 },
            { nombre: 'Comuna 4 Cazucá', grupo: 'Soacha', sectores: ['Cazucá', 'Ciudadela Sucre'], d: 'M 102 294 L 134 326 L 106 340 L 102 318 Z', lx: 115, ly: 318 },
            { nombre: 'Correg. 1 Soacha', grupo: 'Soacha', sectores: ['Bosatama', 'Cascajal'], d: 'M 16 264 L 48 266 L 46 290 L 18 286 Z', lx: 32, ly: 277 },
            { nombre: 'Correg. 2 Soacha', grupo: 'Soacha', sectores: ['Charquira', 'Romeral'], d: 'M 46 336 L 106 340 L 132 384 L 54 374 Z', lx: 88, ly: 358 }
          ];

          const avenidasPrincipales = [
            { nombre: 'Autopista Norte', d: 'M 230 38 L 234 118', x: 239, y: 74, rot: -82 },
            { nombre: 'Av. Caracas', d: 'M 234 118 L 244 186 L 236 254', x: 243, y: 152, rot: -80 },
            { nombre: 'Av. Suba', d: 'M 140 48 L 206 114', x: 160, y: 72, rot: 45 },
            { nombre: 'Av. Boyacá', d: 'M 176 26 L 164 154 L 152 270', x: 166, y: 108, rot: -86 },
            { nombre: 'Av. NQS', d: 'M 216 120 L 202 222', x: 202, y: 180, rot: -82 },
            { nombre: 'Av. El Dorado (Cll 26)', d: 'M 68 170 L 264 180', x: 108, y: 169, rot: 3 },
            { nombre: 'Av. Calle 80', d: 'M 100 138 L 234 132', x: 124, y: 132, rot: -2 },
            { nombre: 'Av. 1º de Mayo', d: 'M 84 220 L 246 234', x: 110, y: 219, rot: 5 },
            { nombre: 'Autopista Sur / Soacha', d: 'M 56 242 L 176 258 L 96 312 L 32 316', x: 74, y: 274, rot: -24 },
            { nombre: 'Av. Terreros', d: 'M 48 286 L 104 290', x: 56, y: 285, rot: 3 }
          ];

          const termino = (busquedaLocalidad || '').trim().toLowerCase();
          const zonasFiltradas = termino
            ? zonasBogotaYSoacha.filter(
                (z) =>
                  z.nombre.toLowerCase().includes(termino) ||
                  z.grupo.toLowerCase().includes(termino) ||
                  z.sectores.some((s) => s.toLowerCase().includes(termino))
              )
            : zonasBogotaYSoacha;

          const sectoresCoincidentes = termino
            ? zonasBogotaYSoacha.flatMap((z) =>
                z.sectores
                  .filter((s) => s.toLowerCase().includes(termino))
                  .map((s) => ({ sector: s, localidad: z.nombre }))
              )
            : [];

          return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={busquedaLocalidad}
                  onChange={(e) => setBusquedaLocalidad(e.target.value)}
                  placeholder="Buscar localidad, comuna o sector (ej: Cedritos, Suba, Soacha)..."
                  className="w-full bg-white border border-slate-200 focus:border-indigo-600 rounded-lg py-1 pl-2.5 pr-7 text-[16px] leading-tight text-slate-800 outline-none transition"
                />
                {busquedaLocalidad && (
                  <button
                    type="button"
                    onClick={() => setBusquedaLocalidad('')}
                    className="absolute right-2 text-slate-400 hover:text-slate-700 font-bold text-[10px] cursor-pointer"
                    title="Borrar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>

              {sectoresCoincidentes.length > 0 && (
                <div className="flex flex-wrap gap-1 bg-indigo-50/70 border border-indigo-200/80 p-1.5 rounded-lg">
                  <span className="w-full text-[8px] font-bold text-indigo-800 uppercase">
                    Sectores encontrados:
                  </span>
                  {sectoresCoincidentes.map(({ sector, localidad }) => {
                    const activa = zonasTrabajo?.includes(localidad);
                    return (
                      <button
                        key={`${sector}-${localidad}`}
                        type="button"
                        onClick={() => toggleZona(localidad)}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold cursor-pointer transition ${
                          activa
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                        }`}
                      >
                        {sector} <span className="opacity-75 font-normal">({localidad})</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between text-[8px] text-slate-500 px-0.5">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-indigo-600 inline-block" /> Seleccionada
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-white border border-slate-300 inline-block" /> Bogotá
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-emerald-50/90 border border-emerald-300 inline-block" /> Soacha
                  </span>
                </div>
                <span className="font-bold text-amber-700">━ Vías</span>
              </div>

              <div className="relative w-full bg-sky-50/40 border border-slate-200 rounded-lg overflow-hidden">
                <svg
                  viewBox="10 12 336 472"
                  className="w-full h-72 sm:h-80 select-none"
                  role="img"
                  aria-label="Mapa realista de Bogotá D.C. y Soacha con localidades, comunas y avenidas principales"
                >
                  <defs>
                    <pattern id="tramaUrbana" width="12" height="12" patternUnits="userSpaceOnUse">
                      <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#cbd5e1" strokeWidth="0.35" opacity="0.45" />
                    </pattern>
                    <linearGradient id="cerrosOrientales" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#dcfce7" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#86efac" stopOpacity="0.55" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M 112 18 Q 92 84 68 146 Q 42 208 24 272 Q 16 324 38 378"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                  <text x="20" y="195" fill="#0284c7" fontSize="5.2" fontWeight="700" transform="rotate(-74, 20, 195)" opacity="0.8">
                    Río Bogotá
                  </text>

                  {zonasBogotaYSoacha.map((zona) => {
                    const seleccionada = zonasTrabajo?.includes(zona.nombre);
                    const coincideBusqueda = !termino || zonasFiltradas.some((z) => z.nombre === zona.nombre);
                    const baseFill = zona.grupo === 'Soacha' ? '#ecfdf5' : '#ffffff';
                    const baseStroke = seleccionada
                      ? '#312e81'
                      : termino && coincideBusqueda
                        ? '#4f46e5'
                        : zona.grupo === 'Soacha'
                          ? '#6ee7b7'
                          : '#94a3b8';

                    return (
                      <g
                        key={zona.nombre}
                        onClick={() => toggleZona(zona.nombre)}
                        className={`cursor-pointer transition-opacity ${
                          termino && !coincideBusqueda && !seleccionada ? 'opacity-35' : 'opacity-100'
                        }`}
                      >
                        <path
                          d={zona.d}
                          fill={seleccionada ? '#4f46e5' : termino && coincideBusqueda ? '#eef2ff' : baseFill}
                          stroke={baseStroke}
                          strokeWidth={termino && coincideBusqueda ? '2.1' : zona.grupo === 'Soacha' ? '1.25' : '1.5'}
                          strokeLinejoin="round"
                          className="transition-colors duration-150"
                        />
                        {!seleccionada && (
                          <path
                            d={zona.d}
                            fill="url(#tramaUrbana)"
                            className="pointer-events-none"
                          />
                        )}
                      </g>
                    );
                  })}

                  <path
                    d="M 294 74 Q 318 112 332 164 Q 342 212 336 266 Q 326 306 304 338 L 288 326 Q 316 284 320 226 Q 318 158 286 92 Z"
                    fill="url(#cerrosOrientales)"
                    className="pointer-events-none"
                  />

                  <g className="pointer-events-none">
                    {avenidasPrincipales.map((av) => (
                      <g key={av.nombre}>
                        <path
                          d={av.d}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.9"
                        />
                        <path
                          d={av.d}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.92"
                        />
                        <text
                          x={av.x}
                          y={av.y}
                          fill="#b45309"
                          fontSize="5.2"
                          fontWeight="800"
                          transform={`rotate(${av.rot}, ${av.x}, ${av.y})`}
                        >
                          {av.nombre}
                        </text>
                      </g>
                    ))}
                  </g>

                  {zonasBogotaYSoacha.map((zona) => {
                    const seleccionada = zonasTrabajo?.includes(zona.nombre);
                    const coincideBusqueda = !termino || zonasFiltradas.some((z) => z.nombre === zona.nombre);
                    const anchoEtiqueta = Math.max(26, zona.nombre.length * 3.8);

                    return (
                      <g
                        key={`label-${zona.nombre}`}
                        onClick={() => toggleZona(zona.nombre)}
                        className={`cursor-pointer transition-opacity ${
                          termino && !coincideBusqueda && !seleccionada ? 'opacity-40' : 'opacity-100'
                        }`}
                      >
                        <rect
                          x={zona.lx - anchoEtiqueta / 2}
                          y={zona.ly - 4.4}
                          width={anchoEtiqueta}
                          height="8.8"
                          rx="2.5"
                          fill={seleccionada ? '#312e81' : termino && coincideBusqueda ? '#e0e7ff' : 'rgba(255,255,255,0.92)'}
                          stroke={seleccionada ? '#a5b4fc' : termino && coincideBusqueda ? '#4f46e5' : zona.grupo === 'Soacha' ? '#34d399' : '#cbd5e1'}
                          strokeWidth={termino && coincideBusqueda ? '0.9' : '0.55'}
                        />
                        <text
                          x={zona.lx}
                          y={zona.ly + 0.3}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={seleccionada ? '#ffffff' : termino && coincideBusqueda ? '#312e81' : '#0f172a'}
                          fontSize="5.4"
                          fontWeight="800"
                        >
                          {zona.nombre}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                {zonasFiltradas.length === 0 ? (
                  <p className="w-full text-center text-slate-400 italic py-1.5 text-[9px]">
                    No se encontraron zonas con "{busquedaLocalidad}".
                  </p>
                ) : (
                  zonasFiltradas.map((zona) => {
                    const seleccionada = zonasTrabajo?.includes(zona.nombre);
                    return (
                      <button
                        key={zona.nombre}
                        type="button"
                        onClick={() => toggleZona(zona.nombre)}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold cursor-pointer transition ${
                          seleccionada
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : zona.grupo === 'Soacha'
                              ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {zona.nombre}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white font-bold py-2 rounded-xl text-[11px] uppercase flex items-center justify-center gap-1.5 cursor-pointer hover:bg-indigo-700 transition mt-2"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Guardar Cambios</>}
      </button>
    </form>
  </div>
</div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-1 flex items-center justify-around z-40 shadow-lg">
        <button 
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${activeTab === 'agenda' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Calendar className="w-4 h-4 mb-1" />
          <span className="text-[9px] uppercase">Agenda</span>
        </button>

        <button 
          onClick={() => setActiveTab('facturacion')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${activeTab === 'facturacion' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <FileText className="w-4 h-4 mb-1" />
          <span className="text-[9px] uppercase">Finanzas</span>
        </button>
      </nav>

      {citaSeleccionada && (() => {
        const estadoActual = (citaSeleccionada.estado || '').toLowerCase();
        const esFinalizada = estadoActual === 'finalizada' || estadoActual === 'finalizado';
        const esCancelada = estadoActual === 'cancelada' || estadoActual === 'cancelado';

       const idEstablecimientoVinculado = barberData?.establecimientoId || barberData?.establecimiento || null;

const serviciosDisponiblesParaElegir = serviciosFirebase.filter(s => {
  if (idEstablecimientoVinculado) {
    return String(s.barberoId || '') === String(idEstablecimientoVinculado) || 
           String(s.establecimientoId || '') === String(idEstablecimientoVinculado) ||
           String(s.uid || '') === String(idEstablecimientoVinculado);
  }
  return authUser ? String(s.barberoId || '') === String(authUser.uid) : false;
});

        const calcularTotalDinamico = () => {
          let suma = 0;
          serviciosModalCita.forEach(s => {
            if (s.precioNum) {
              suma += Number(s.precioNum);
            } else if (s.precio) {
              const num = parseInt(s.precio.toString().replace(/[^0-9]/g, ''), 10);
              if (!isNaN(num)) suma += num;
            }
          });
          return suma > 0 ? `$${suma.toLocaleString('es-CO')} COP` : (citaSeleccionada.precioTotal || '$0');
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
  <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div>
        <h3 className="text-xs font-black uppercase text-slate-900">
          {citaSeleccionada.esBloqueo ? '🚫 Gestionar Horario No Disponible' : esFinalizada ? '📋 Detalle de Cita Finalizada' : esCancelada ? '❌ Detalle de Cita Cancelada' : 'Gestionar Cita / Servicio'}
        </h3>
        <p className="text-[9px] text-indigo-600 font-bold">{citaSeleccionada.esBloqueo ? citaSeleccionada.motivo : 'Actualización de servicios y agenda'}</p>
      </div>
      <button onClick={() => setCitaSeleccionada(null)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer">✕</button>
    </div>

    <div className="space-y-3 text-[10px]">
      {citaSeleccionada.esBloqueo ? (
        <div className="space-y-2.5 pt-1">
          <div>
            <label className="font-bold text-slate-700 uppercase text-[9px] block mb-1">Motivo del Bloqueo:</label>
            <input 
              type="text" 
              value={nuevoMotivoBloqueo} 
              onChange={e => setNuevoMotivoBloqueo(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium" 
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 uppercase text-[9px] block mb-1">Fecha del Bloqueo:</label>
            <input 
              type="date" 
              value={nuevaFechaCita} 
              onChange={e => setNuevaFechaCita(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium" 
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 uppercase text-[9px] block mb-1">Hora Inicio:</label>
              <select 
                value={nuevaHoraCita} 
                onChange={e => setNuevaHoraCita(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium text-[10px]"
              >
                {horasCalendario.map((h, i) => (
                  <option key={i} value={h.label}>{h.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase text-[9px] block mb-1">Hora Fin:</label>
              <select 
                value={nuevaHoraFinCita} 
                onChange={e => setNuevaHoraFinCita(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium text-[10px]"
              >
                {horasCalendario.map((h, i) => (
                  <option key={i} value={h.label}>{h.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <p><strong className="text-slate-500">Cliente:</strong> <span className="text-slate-900 font-bold">{citaSeleccionada.clienteNombre || citaSeleccionada.cliente}</span></p>
            {citaSeleccionada.clienteTelefono && <p><strong className="text-slate-500">Teléfono:</strong> <span className="text-slate-900">{citaSeleccionada.clienteTelefono}</span></p>}
            <p><strong className="text-slate-500">Dirección:</strong> <span className="text-slate-900">{citaSeleccionada.direccion || 'No especificada'}</span></p>
            <p><strong className="text-slate-500">Estado:</strong> <span className={`uppercase font-bold ${esCancelada ? 'text-rose-600' : esFinalizada ? 'text-slate-500' : 'text-emerald-600'}`}>{citaSeleccionada.estado}</span></p>
          </div>

          {!esFinalizada && !esCancelada && (
            <div className="space-y-2.5 pt-1 border-t border-slate-100">
              <label className="font-bold text-slate-700 uppercase text-[9px] block">Servicios Seleccionados:</label>
              
              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {serviciosModalCita.length === 0 ? (
                  <span className="text-slate-400 italic">No hay servicios seleccionados.</span>
                ) : (
                  serviciosModalCita.map((s, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-950 px-2 py-1 rounded-lg font-bold text-[9px] shadow-xs">
                      <span>{s.nombre || s.name}</span>
                      <span className="text-indigo-600 font-normal">({s.precio})</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setServiciosModalCita(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <select 
                  id="select-agregar-servicio"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium text-[10px]"
                >
                  <option value="">-- Añadir otro servicio --</option>
                  {serviciosDisponiblesParaElegir.map((serv) => (
                    <option key={serv.id} value={serv.id}>{serv.nombre} - {serv.precio}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const selectEl = document.getElementById('select-agregar-servicio');
                    const servId = selectEl.value;
                    if (!servId) return;
                    const servEncontrado = serviciosDisponiblesParaElegir.find(s => s.id === servId);
                    if (servEncontrado) {
                      setServiciosModalCita(prev => [...prev, {
                        nombre: servEncontrado.nombre,
                        precio: servEncontrado.precio,
                        precioNum: servEncontrado.precioNum || parseInt((servEncontrado.precio || '').replace(/[^0-9]/g, ''), 10) || 0
                      }]);
                      selectEl.value = '';
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl text-[10px] uppercase cursor-pointer shadow-xs transition"
                >
                  Añadir
                </button>
              </div>

              <div className="flex justify-between items-center bg-indigo-50/60 border border-indigo-100 p-2.5 rounded-xl font-bold">
                <span className="text-slate-600 uppercase text-[9px]">Total Actualizado:</span>
                <span className="text-indigo-600 text-[11px]">{calcularTotalDinamico()}</span>
              </div>
            </div>
          )}

          {!esFinalizada && !esCancelada && (
            <div className="space-y-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[9px] block mb-1">Reprogramar Fecha:</label>
                <input 
                  type="date" 
                  value={nuevaFechaCita} 
                  onChange={e => setNuevaFechaCita(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium" 
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase text-[9px] block mb-1">Reprogramar Hora:</label>
                <select 
                  value={nuevaHoraCita} 
                  onChange={e => setNuevaHoraCita(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium text-[10px]"
                >
                  <option value={nuevaHoraCita}>{nuevaHoraCita} (Actual)</option>
                  {horasCalendario.map((h, i) => (
                    <option key={i} value={h.label}>{h.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </>
      )}
    </div>

    <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-slate-100">
      {citaSeleccionada.esBloqueo ? (
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('¿Estás seguro de eliminar este bloqueo?')) {
                try {
                  await deleteDoc(doc(db, 'bloqueos', citaSeleccionada.id));
                  setSuccessMsg('Bloqueo eliminado correctamente');
                  setCitaSeleccionada(null);
                  setTimeout(() => setSuccessMsg(''), 3000);
                } catch (err) {
                  console.error(err);
                  setErrorMsg('Error al eliminar el bloqueo');
                  setTimeout(() => setErrorMsg(''), 3000);
                }
              }
            }}
            className="flex-1 px-3 py-2 rounded-xl text-[10px] font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1"
          >
            🗑️ Eliminar
          </button>
          <button 
            type="button"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                setLoading(true);

                const minInicio = horaAMinutos(nuevaHoraCita);
                const minFin = horaAMinutos(nuevaHoraFinCita);
                let duracionTotal = minFin - minInicio;
                if (duracionTotal <= 0) duracionTotal += 1440;

                const payloadBloqueo = {
                  barberoId: authUser.uid,
                  motivo: nuevoMotivoBloqueo || 'No disponible',
                  fechaStr: nuevaFechaCita,
                  fecha: nuevaFechaCita,
                  horaInicio: nuevaHoraCita,
                  hora: nuevaHoraCita,
                  horaFin: nuevaHoraFinCita,
                  duracionTotal,
                  esBloqueo: true,
                  creadoEn: new Date().toISOString()
                };

                if (citaSeleccionada?.id) {
                  await updateDoc(doc(db, "bloqueos", citaSeleccionada.id), payloadBloqueo);
                  setSuccessMsg('¡Bloqueo actualizado con éxito!');
                } else {
                  await addDoc(collection(db, "bloqueos"), payloadBloqueo);
                  setSuccessMsg('¡Bloqueo guardado con éxito!');
                }

                setModalBloqueoAbierto(false);
                setCitaSeleccionada(null);
                setTimeout(() => setSuccessMsg(''), 3000);
              } catch (error) {
                console.error("Error al guardar el bloqueo:", error);
                setErrorMsg('Ocurrió un error al guardar el bloqueo.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase shadow-xs flex items-center justify-center gap-1 cursor-pointer transition"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (citaSeleccionada?.id ? '✓ GUARDAR CAMBIOS' : '✓ GUARDAR')}
          </button>
        </div>
      ) : esFinalizada ? (
        <button
          type="button"
          onClick={() => setCitaSeleccionada(null)}
          className="w-full px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-slate-800 text-white hover:bg-slate-900 border border-slate-700 transition-all cursor-pointer shadow-md active:scale-95"
        >
          Cerrar Detalle
        </button>
      ) : esCancelada ? (
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={() => setCitaSeleccionada(null)}
            className="flex-1 px-3 py-2 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => actualizarCitaFirestore('confirmada')}
            disabled={modalLoading}
            className="flex-1 px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-800 transition-all cursor-pointer shadow-md flex items-center justify-center gap-1"
          >
            {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>✨ Activar Cita</>}
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => actualizarCitaFirestore('cancelada')}
            disabled={modalLoading}
            className="px-3 py-2 rounded-xl text-[10px] font-bold bg-rose-600 text-white hover:bg-rose-700 border border-rose-800 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
          >
            ❌ Cancelar
          </button>

          <button
            type="button"
            onClick={() => actualizarCitaFirestore('finalizada')}
            disabled={modalLoading}
            className="px-3 py-2 rounded-xl text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-800 transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1"
          >
            ✅ Finalizar
          </button>

        <button
  type="button"
  onClick={async () => {
    if (!citaSeleccionada) return;
    setModalLoading(true);
    try {
      const citaRef = doc(db, 'citas', citaSeleccionada.id);
      const nombresServicios = serviciosModalCita.map(s => s.nombre || s.name).join(', ');
      const totalCalculado = calcularTotalDinamico();
      
      const payloadCitaActualizada = {
        fecha: nuevaFechaCita,
        fechaStr: nuevaFechaCita,
        hora: nuevaHoraCita,
        servicios: serviciosModalCita,
        serviciosArray: serviciosModalCita,
        servicio: nombresServicios || 'Servicio General',
        precioTotal: totalCalculado,
        monto: totalCalculado
      };

      await updateDoc(citaRef, payloadCitaActualizada);
      
      setCitasFirestore(prev => 
        prev.map(c => ((c.id || c.uid) === citaSeleccionada.id ? { ...c, ...payloadCitaActualizada } : c))
      );

      setSuccessMsg('Cita actualizada correctamente');
      setCitaSeleccionada(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al actualizar la cita');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setModalLoading(false);
    }
  }}
  disabled={modalLoading}
  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-blue-600 text-white hover:bg-blue-700 border border-blue-800 transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1"
>
  {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3.5 h-3.5" /> Guardar</>}
</button>
        </>
      )}
    </div>
  </div>
</div>
        );
      })()}
    </div>
  );
}