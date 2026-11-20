import React, { useState, useEffect, useRef } from 'react';
import { Plus, Wallet as WalletIcon, Calendar, Eye, Edit3, Trash2, Clock, User, Scissors, CheckCircle2, Percent, Layers, ChevronRight, AlertTriangle, X, Home, Edit2, EyeOff } from 'lucide-react';
import { db, auth } from '../../components/firebase'; 
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, setDoc } from 'firebase/firestore';

const MesCarruselItem = ({ mesData, setQuincenaActivaModal, anioActual, mesActual, diaActual }) => {
  const [verMontoQ1, setVerMontoQ1] = useState(false);
  const [verMontoQ2, setVerMontoQ2] = useState(false);

  const getColorClases = (q) => {
    if (q.enCurso) return 'bg-amber-400/20 border-amber-300 ring-1 ring-amber-400/30';
    if (q.sinMovimiento) return 'bg-rose-500/15 border-rose-300 hover:border-rose-400';
    return 'bg-emerald-500/15 border-emerald-300 hover:border-emerald-400';
  };

  const getTextoColor = (q) => {
    if (q.enCurso) return 'text-amber-900';
    if (q.sinMovimiento) return 'text-rose-900';
    return 'text-emerald-900';
  };

  const getMontoColor = (q) => {
    if (q.enCurso) return 'text-amber-950';
    if (q.sinMovimiento) return 'text-rose-950';
    return 'text-emerald-950';
  };

  return (
    <div 
      key={mesData.mesId}
      id={mesData.esMesActual ? 'mes-actual-carrusel' : undefined}
      dir="ltr"
      className="min-w-[calc(100%-12px)] sm:min-w-[calc(50%-6px)] flex-1 grid grid-cols-2 gap-2 snap-start"
    >
      {/* 1RA QUINCENA (IZQUIERDA) */}
      <div 
        onClick={() => setQuincenaActivaModal({ titulo: mesData.q1.titulo, datos: mesData.q1.datos, total: mesData.q1.total, serv: mesData.q1.serv, grafico: mesData.q1.grafico })}
        className={`p-2.5 rounded-2xl border transition-all relative overflow-hidden cursor-pointer backdrop-blur-md shadow-2xs hover:shadow-xs ${getColorClases(mesData.q1)}`}
      >
        <div className="flex justify-between items-center mb-1 relative z-10">
          <span className={`text-[10px] font-bold tracking-tight uppercase flex items-center gap-1 truncate ${getTextoColor(mesData.q1)}`}>
            <Layers size={11} className={mesData.q1.enCurso ? 'text-amber-600' : mesData.q1.sinMovimiento ? 'text-rose-600' : 'text-emerald-600'} /> {mesData.q1.titulo}
          </span>
          {mesData.q1.enCurso && <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-ping shadow-xs shrink-0"></span>}
        </div>
        
        <div className="h-6 w-full my-1 relative z-10 flex items-center">
          <svg viewBox="0 0 120 26" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${mesData.q1.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={mesData.q1.enCurso ? '#d97706' : mesData.q1.sinMovimiento ? '#e11d48' : '#059669'} stopOpacity="0.4" />
                <stop offset="100%" stopColor={mesData.q1.enCurso ? '#d97706' : mesData.q1.sinMovimiento ? '#e11d48' : '#059669'} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {mesData.q1.grafico?.areaD && <path d={mesData.q1.grafico.areaD} fill={`url(#grad-${mesData.q1.id})`} />}
            {mesData.q1.grafico?.pathD && <path d={mesData.q1.grafico.pathD} fill="none" stroke={mesData.q1.enCurso ? '#d97706' : mesData.q1.sinMovimiento ? '#e11d48' : '#059669'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
            {mesData.q1.grafico?.puntos?.map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r={pt.monto > 0 ? 3 : 1} className={pt.monto > 0 ? (mesData.q1.enCurso ? 'fill-amber-600 ring-1 ring-amber-200' : 'fill-emerald-600 ring-1 ring-emerald-200') : 'fill-slate-400/30'} />
            ))}
          </svg>
        </div>

        <div className="flex items-center justify-between relative z-10 pt-1 border-t border-slate-200/50">
          <span className="text-[9px] text-slate-500 font-semibold">{mesData.q1.serv} serv.</span>
          <div className="flex items-center gap-1">
            <span className={`text-[11px] font-black ${getMontoColor(mesData.q1)}`}>
              {verMontoQ1 ? `$${mesData.q1.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '••••'}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setVerMontoQ1(!verMontoQ1);
              }}
              className={`p-0.5 rounded transition cursor-pointer ${mesData.q1.enCurso ? 'text-amber-700 hover:bg-amber-200/50' : mesData.q1.sinMovimiento ? 'text-rose-700 hover:bg-rose-200/50' : 'text-emerald-700 hover:bg-emerald-200/50'}`}
              title={verMontoQ1 ? "Ocultar monto" : "Ver monto"}
            >
              {verMontoQ1 ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
        </div>
      </div>

      {/* 2DA QUINCENA (DERECHA) */}
      <div 
        onClick={() => setQuincenaActivaModal({ titulo: mesData.q2.titulo, datos: mesData.q2.datos, total: mesData.q2.total, serv: mesData.q2.serv, grafico: mesData.q2.grafico })}
        className={`p-2.5 rounded-2xl border transition-all relative overflow-hidden cursor-pointer backdrop-blur-md shadow-2xs hover:shadow-xs ${getColorClases(mesData.q2)}`}
      >
        <div className="flex justify-between items-center mb-1 relative z-10">
          <span className={`text-[10px] font-bold tracking-tight uppercase flex items-center gap-1 truncate ${getTextoColor(mesData.q2)}`}>
            <Layers size={11} className={mesData.q2.enCurso ? 'text-amber-600' : mesData.q2.sinMovimiento ? 'text-rose-600' : 'text-emerald-600'} /> {mesData.q2.titulo}
          </span>
          {mesData.q2.enCurso && <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-ping shadow-xs shrink-0"></span>}
        </div>
        
        <div className="h-6 w-full my-1 relative z-10 flex items-center">
          <svg viewBox="0 0 120 26" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${mesData.q2.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={mesData.q2.enCurso ? '#d97706' : mesData.q2.sinMovimiento ? '#e11d48' : '#059669'} stopOpacity="0.4" />
                <stop offset="100%" stopColor={mesData.q2.enCurso ? '#d97706' : mesData.q2.sinMovimiento ? '#e11d48' : '#059669'} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {mesData.q2.grafico?.areaD && <path d={mesData.q2.grafico.areaD} fill={`url(#grad-${mesData.q2.id})`} />}
            {mesData.q2.grafico?.pathD && <path d={mesData.q2.grafico.pathD} fill="none" stroke={mesData.q2.enCurso ? '#d97706' : mesData.q2.sinMovimiento ? '#e11d48' : '#059669'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
            {mesData.q2.grafico?.puntos?.map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r={pt.monto > 0 ? 3 : 1} className={pt.monto > 0 ? (mesData.q2.enCurso ? 'fill-amber-600 ring-1 ring-amber-200' : 'fill-emerald-600 ring-1 ring-emerald-200') : 'fill-slate-400/30'} />
            ))}
          </svg>
        </div>

        <div className="flex items-center justify-between relative z-10 pt-1 border-t border-slate-200/50">
          <span className="text-[9px] text-slate-500 font-semibold">{mesData.q2.serv} serv.</span>
          <div className="flex items-center gap-1">
            <span className={`text-[11px] font-black ${getMontoColor(mesData.q2)}`}>
              {verMontoQ2 ? `$${mesData.q2.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '••••'}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setVerMontoQ2(!verMontoQ2);
              }}
              className={`p-0.5 rounded transition cursor-pointer ${mesData.q2.enCurso ? 'text-amber-700 hover:bg-amber-200/50' : mesData.q2.sinMovimiento ? 'text-rose-700 hover:bg-rose-200/50' : 'text-emerald-700 hover:bg-emerald-200/50'}`}
              title={verMontoQ2 ? "Ocultar monto" : "Ver monto"}
            >
              {verMontoQ2 ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Wallet = () => {
  const vistaTab = 'manual';

  const [filtroTiempo, setFiltroTiempo] = useState('dia');
  
  const obtenerFechaLocal = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [activeTab, setActiveTab] = useState('manual');
  const hoyStr = obtenerFechaLocal();
  const [fechaEspecifica, setFechaEspecifica] = useState(hoyStr);
  const [fechaInicio, setFechaInicio] = useState(hoyStr);
  const [fechaFin, setFechaFin] = useState(hoyStr);
  const [quincenaActivaModal, setQuincenaActivaModal] = useState(null);
  const [serviciosFirebase, setServiciosFirebase] = useState([]); // Catálogo de servicios internos
  const [citasFinalizadas, setCitasFinalizadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [isOpenServicios, setIsOpenServicios] = useState(false);
  const [porcentajeBarbero, setPorcentajeBarbero] = useState(35);
  const [alertaExito, setAlertaExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('¡Guardado con éxito!');
  const [diaSeleccionadoModal, setDiaSeleccionadoModal] = useState(null);
  const [modalAgregarOpen, setModalAgregarOpen] = useState(false);
  const [modalVerMasOpen, setModalVerMasOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [mostrarAlertaPerfil, setMostrarAlertaPerfil] = useState(false);
  const [modalDiaOpen, setModalDiaOpen] = useState(false);
  const [diaSeleccionadoDetalle, setDiaSeleccionadoDetalle] = useState(null);
  const [modalServicioInternoOpen, setModalServicioInternoOpen] = useState(false);
  const [nuevoServicioInterno, setNuevoServicioInterno] = useState({ nombre: '', precio: '', color: '#10b981' });
  const [modalCitaDetalleOpen, setModalCitaDetalleOpen] = useState(false);
  const [citaSeleccionadaDetalle, setCitaSeleccionadaDetalle] = useState(null);
  const [exitoModalOpen, setExitoModalOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState(null);
  const [barberData, setBarberData] = useState(null);

  const [modalEgresosAbierto, setModalEgresosAbierto] = useState(false);
  const [modalPropinasAbierto, setModalPropinasAbierto] = useState(false);

  const [servicios, setServicios] = useState([]);
  const [citasEstablecimiento, setCitasEstablecimiento] = useState([]);
  const [listaEgresos, setListaEgresos] = useState([]);
  const [listaPropinas, setListaPropinas] = useState([]);
  const [modalConfirmarEstadoOpen, setModalConfirmarEstadoOpen] = useState(false);
  const [servicioAConfirmar, setServicioAConfirmar] = useState(null);
  const [nuevoEgresoNombre, setNuevoEgresoNombre] = useState('');
  const [nuevoEgresoMonto, setNuevoEgresoMonto] = useState('');
  const [nuevaPropinaNota, setNuevaPropinaNota] = useState('');
  const [nuevaPropinaMonto, setNuevaPropinaMonto] = useState('');
  const [editandoEgresoId, setEditandoEgresoId] = useState(null);
  const [editandoPropinaId, setEditandoPropinaId] = useState(null);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [formEdicion, setFormEdicion] = useState({
    id: '',
    cliente: '',
    servicio: '',
    total: '',
    porcentajeBarberForm: '35',
    fecha: hoyStr,
    hora: ''
  });

  const [nuevoServicio, setNuevoServicio] = useState({
    cliente: '',
    servicio: '',
    total: '',
    porcentajeBarberForm: '',
    fecha: hoyStr,
    hora: new Date().toTimeString().slice(0, 5),
    serviciosSeleccionados: []
  });

  const [mostrarQ1, setMostrarQ1] = useState(false);
  const [mostrarQ2, setMostrarQ2] = useState(false);
  const [timerQ1, setTimerQ1] = useState(null);
  const [timerQ2, setTimerQ2] = useState(null);
  const [domicilioToggleManual, setDomicilioToggleManual] = useState(null);
  const [modalConfirmarDomicilioOpen, setModalConfirmarDomicilioOpen] = useState(false);

  const carruselRef = useRef(null);

  const serviciosEnLinea = domicilioToggleManual !== null
    ? domicilioToggleManual
    : Boolean(barberData?.activodomicilios);

  const actualizarEstadoDomicilioBD = async (nuevoEstado) => {
    const idProf = auth.currentUser?.uid || barberData?.id || barberData?.uid;
    if (idProf) {
      try {
        await updateDoc(doc(db, 'profesionales', idProf), {
          activodomicilios: Boolean(nuevoEstado)
        });

        const activoRef = doc(db, 'profesionalesactivos', idProf);
        if (nuevoEstado) {
          await setDoc(activoRef, {
            ...(barberData || {}),
            profesionalId: idProf,
            activo: true,
            activodomicilios: true,
            actualizadoEn: new Date().toISOString()
          });
        } else {
          await deleteDoc(activoRef);
        }
      } catch (err) {
        console.error("Error al actualizar estado de servicios a domicilio:", err);
      }
    }
  };

  const handleToggleDomicilio = async () => {
    const nuevoEstado = !serviciosEnLinea;
    if (nuevoEstado) {
      setModalConfirmarDomicilioOpen(true);
      return;
    }
    setDomicilioToggleManual(false);
    await actualizarEstadoDomicilioBD(false);
  };

  const confirmarActivacionDomicilio = async () => {
    setModalConfirmarDomicilioOpen(false);
    setDomicilioToggleManual(true);
    await actualizarEstadoDomicilioBD(true);
  };

  const handleToggleQ1 = (e) => {
    e.stopPropagation();
    if (mostrarQ1) {
      setMostrarQ1(false);
      if (timerQ1) clearTimeout(timerQ1);
    } else {
      setMostrarQ1(true);
      if (timerQ1) clearTimeout(timerQ1);
      const id = setTimeout(() => setMostrarQ1(false), 10000);
      setTimerQ1(id);
    }
  };

  const totalEgresosCalculado = (listaEgresos || []).reduce(
    (acc, item) => acc + (Number(item.monto) || 0), 
    0
  );

  const confirmarEstadoCitaFinal = async () => {
    if (!servicioAConfirmar) return;
    try {
      const docRef = doc(db, 'citas', servicioAConfirmar.id);
      await updateDoc(docRef, { estado: 'confirmado' });
      
      setMensajeExito('¡Cita confirmada con éxito!');
      setAlertaExito(true);
      setTimeout(() => setAlertaExito(false), 1500);

      setModalConfirmarEstadoOpen(false);
      setServicioAConfirmar(null);
    } catch (err) {
      console.error("Error al confirmar la cita:", err);
      alert('No se pudo confirmar el estado.');
    }
  };

  const totalPropinasCalculado = (listaPropinas || []).reduce(
    (acc, item) => acc + (Number(item.monto) || 0), 
    0
  );

  const handleToggleQ2 = (e) => {
    e.stopPropagation();
    if (mostrarQ2) {
      setMostrarQ2(false);
      if (timerQ2) clearTimeout(timerQ2);
    } else {
      setMostrarQ2(true);
      if (timerQ2) clearTimeout(timerQ2);
      const id = setTimeout(() => setMostrarQ2(false), 10000);
      setTimerQ2(id);
    }
  };

  const valorTotalNum = parseFloat(nuevoServicio.total) || 0;
  const porcentajeNum = parseFloat(nuevoServicio.porcentajeBarberForm) || 0;
  const gananciaCalculadaEnVivo = (valorTotalNum * porcentajeNum) / 100;

  const valorEditTotalNum = parseFloat(formEdicion.total) || 0;
  const porcentajeEditNum = parseFloat(formEdicion.porcentajeBarberForm) || 0;
  const gananciaEditCalculadaEnVivo = (valorEditTotalNum * porcentajeEditNum) / 100;

  const obtenerServicios = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      const querySnapshot = await getDocs(collection(db, 'wallet'));
      const data = querySnapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));
      
      const serviciosValidos = data.filter(item => {
        const esDelBarbero = user ? (item.barberId === user.uid || item.barberoId === user.uid) : true;
        return esDelBarbero && item.cliente && item.total !== undefined;
      });

      setServicios(serviciosValidos);
    } catch (error) {
      console.error("Error al conectar con la colección wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerServiciosDisponibles = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'servicios'));
      const data = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setServiciosFirebase(data);
    } catch (error) {
      console.error("Error al obtener servicios de Firebase:", error);
    }
  };
  
  const obtenerCitasFinalizadas = async () => {
    try {
      setLoadingCitas(true);
      const user = auth.currentUser;
      const querySnapshot = await getDocs(collection(db, 'citas'));
      const data = querySnapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));

      const citasValidas = data.filter(item => {
        const esDelBarbero = user ? (item.barberoId === user.uid || item.barberId === user.uid || item.barberoid === user.uid) : true;
        const estadoCita = item.estado ? item.estado.toLowerCase().trim() : '';
        return esDelBarbero && (estadoCita === 'finalizado' || estadoCita === 'finalizada');
      });

      setCitasFinalizadas(citasValidas);
    } catch (error) {
      console.error("Error al conectar con la colección citas:", error);
    } finally {
      setLoadingCitas(false);
    }
  };

  useEffect(() => {
    let unsubscribeServicios = null;
    let unsubscribeProfesional = null;
    let unsubscribeEgresos = null;
    let unsubscribePropinas = null;
    let unsubscribeCitasEstablecimiento = null;

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        obtenerServicios();
        obtenerCitasFinalizadas();
        obtenerServiciosDisponibles();

        const qCitas = query(
          collection(db, "citas"), 
          where("barberoId", "==", user.uid)
        );

        unsubscribeCitasEstablecimiento = onSnapshot(qCitas, (snapshot) => {
          const listaCitas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCitasEstablecimiento(listaCitas);
        });

        const qServicios = query(
          collection(db, "servicios"), 
          where("barberoId", "==", user.uid)
        );

        unsubscribeServicios = onSnapshot(qServicios, (snapshot) => {
          const listaServicios = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setServiciosFirebase(listaServicios);
        });

        const qEgresos = query(
          collection(db, "egresos"),
          where("barberoId", "==", user.uid)
        );
        unsubscribeEgresos = onSnapshot(qEgresos, (snapshot) => {
          const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setListaEgresos(lista);
        });

        const qPropinas = query(
          collection(db, "propinas"),
          where("barberoId", "==", user.uid)
        );
        unsubscribePropinas = onSnapshot(qPropinas, (snapshot) => {
          const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setListaPropinas(lista);
        });

        const docRef = doc(db, "profesionales", user.uid);
        unsubscribeProfesional = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            const dataBarbero = docSnap.data();
            let infoBarbero = { ...dataBarbero };
            
            if (dataBarbero.establecimientoId) {
              try {
                const estabDocRef = doc(db, "establecimientos", dataBarbero.establecimientoId);
                const estabSnap = await getDoc(estabDocRef);
                if (estabSnap.exists()) {
                  const estabData = estabSnap.data();
                  infoBarbero.establecimientoNombre = estabData.nombre || estabData.nombreEstablecimiento || "Establecimiento Socio";
                }
              } catch (err) {
                console.error("Error al obtener nombre del establecimiento:", err);
              }
            }
            setBarberData(infoBarbero);
            setDomicilioToggleManual(null);
            
            const porcentajeFirestore = dataBarbero.porcentaje;
            if (porcentajeFirestore !== undefined && porcentajeFirestore !== null) {
              setNuevoServicio(prev => ({
                ...prev,
                porcentajeBarberForm: porcentajeFirestore
              }));
            }
          }
        });

      } else {
        if (unsubscribeServicios) unsubscribeServicios();
        if (unsubscribeProfesional) unsubscribeProfesional();
        if (unsubscribeEgresos) unsubscribeEgresos();
        if (unsubscribePropinas) unsubscribePropinas();
        if (unsubscribeCitasEstablecimiento) unsubscribeCitasEstablecimiento();
        setLoading(false);
        setLoadingCitas(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeServicios) unsubscribeServicios();
      if (unsubscribeProfesional) unsubscribeProfesional();
      if (unsubscribeEgresos) unsubscribeEgresos();
      if (unsubscribePropinas) unsubscribePropinas();
      if (unsubscribeCitasEstablecimiento) unsubscribeCitasEstablecimiento();
    };
  }, []);

  useEffect(() => {
    let tRegreso = null;

    const t1 = setTimeout(() => {
      const elActual = document.getElementById('mes-actual-carrusel');
      const cont = carruselRef.current;
      if (elActual && cont) {
        elActual.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
        const paso = elActual.offsetWidth || 300;
        cont.scrollBy({ left: paso, behavior: 'smooth' });
        tRegreso = setTimeout(() => {
          const actualRef = document.getElementById('mes-actual-carrusel');
          if (actualRef) {
            actualRef.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }, 550);
      }
    }, 120);

    const t2 = setTimeout(() => {
      const elActual = document.getElementById('mes-actual-carrusel');
      if (elActual) {
        elActual.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 950);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (tRegreso) clearTimeout(tRegreso);
    };
  }, []);

  const parsearPrecioCita = (cita) => {
    const valorBruto = cita.precioTotal || cita.precio || cita.total || cita.costo || cita.valor;
    if (typeof valorBruto === 'number') return valorBruto;
    if (!valorBruto) return 0;
    const limpio = String(valorBruto).replace(/[^0-9]/g, '');
    return parseFloat(limpio) || 0;
  };

  const handleGuardarServicio = async (e) => {
    e.preventDefault();
    if (!nuevoServicio.cliente || !nuevoServicio.total) return;

    const user = auth.currentUser;
    if (!user) {
      alert("No hay una sesión activa.");
      return;
    }

    setGuardando(true);
    const totalVal = parseFloat(nuevoServicio.total);
    const porcentajeVal = parseFloat(nuevoServicio.porcentajeBarberForm) || 0;
    const gananciaVal = parseFloat(((totalVal * porcentajeVal) / 100).toFixed(2));

    const itemAEnviar = {
      barberId: user.uid, 
      barberEmail: user.email || '', 
      cliente: nuevoServicio.cliente.trim(),
      servicio: nuevoServicio.servicio.trim() || 'Servicio General',
      total: totalVal,
      ganancias: gananciaVal,
      porcentaje: true,
      porcentajeValor: porcentajeVal,
      fecha: nuevoServicio.fecha,
      hora: nuevoServicio.hora,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'wallet'), itemAEnviar);
      const itemConId = { id: docRef.id, ...itemAEnviar };
      
      setServicios([itemConId, ...servicios]);
      setModalAgregarOpen(false);

      setNuevoServicio({ 
        cliente: '', 
        servicio: '', 
        total: '', 
        porcentajeBarberForm: barberData?.porcentaje || 35,
        fecha: hoyStr, 
        hora: new Date().toTimeString().slice(0, 5),
        serviciosSeleccionados: []
      });

      setMensajeExito('¡Registro Exitoso!');
      setAlertaExito(true);
      setTimeout(() => setAlertaExito(false), 1000);

    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarEliminacion = async () => {
    if (!servicioAEliminar) return;
    try {
      await deleteDoc(doc(db, 'wallet', servicioAEliminar.id));
      setServicios(servicios.filter(item => item.id !== servicioAEliminar.id));
      setModalEliminarOpen(false);
      setServicioAEliminar(null);
      setModalVerMasOpen(false);

      setMensajeExito('¡Registro eliminado!');
      setAlertaExito(true);
      setTimeout(() => setAlertaExito(false), 1000);
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const abrirModalEditar = (item) => {
    setFormEdicion({
      id: item.id,
      cliente: item.cliente || '',
      servicio: item.servicio || '',
      total: item.total ? String(item.total) : '',
      porcentajeBarberForm: item.porcentajeValor ? String(item.porcentajeValor) : '35',
      fecha: item.fecha || hoyStr,
      hora: item.hora || ''
    });
    setModalVerMasOpen(false);
    setModalEditarOpen(true);
  };

  const handleActualizarServicio = async (e) => {
    e.preventDefault();
    if (!formEdicion.cliente || !formEdicion.total) return;

    setGuardando(true);
    const totalVal = parseFloat(formEdicion.total);
    const porcentajeVal = parseFloat(formEdicion.porcentajeBarberForm) || 0;
    const gananciaVal = parseFloat(((totalVal * porcentajeVal) / 100).toFixed(2));

    const datosActualizados = {
      cliente: formEdicion.cliente.trim(),
      servicio: formEdicion.servicio.trim() || 'Servicio General',
      total: totalVal,
      ganancias: gananciaVal,
      porcentajeValor: porcentajeVal,
      fecha: formEdicion.fecha,
      hora: formEdicion.hora
    };

    try {
      const docRef = doc(db, 'wallet', formEdicion.id);
      await updateDoc(docRef, datosActualizados);

      setServicios(servicios.map(s => s.id === formEdicion.id ? { ...s, ...datosActualizados } : s));
      setModalEditarOpen(false);

      setMensajeExito('¡Actualizado con éxito!');
      setAlertaExito(true);
      setTimeout(() => setAlertaExito(false), 1000);
    } catch (error) {
      console.error("Error al actualizar:", error);
    } finally {
      setGuardando(false);
    }
  };

  const hoyObj = new Date();
  const anioActual = hoyObj.getFullYear();
  const mesActual = hoyObj.getMonth();
  const diaActual = hoyObj.getDate();
  const ultimoDiaMes = new Date(anioActual, mesActual + 1, 0).getDate();

  const esPrimeraQuincenaActiva = diaActual <= 15;

  const filtrarServiciosPorTiempo = (lista) => {
    return lista.filter(item => {
      if (!item.fecha) return false;
      const fechaItem = new Date(item.fecha + 'T00:00:00');
      
      if (filtroTiempo === 'dia') return item.fecha === hoyStr;
      if (filtroTiempo === 'especifico') return item.fecha === fechaEspecifica;
      if (filtroTiempo === 'rango') return item.fecha >= fechaInicio && item.fecha <= fechaFin;
      if (filtroTiempo === 'semana') {
        const primerDiaSemana = new Date(hoyObj);
        primerDiaSemana.setDate(hoyObj.getDate() - hoyObj.getDay());
        return fechaItem >= primerDiaSemana && fechaItem <= hoyObj;
      } 
      if (filtroTiempo === 'quincena') {
        const inicio = new Date(anioActual, mesActual, esPrimeraQuincenaActiva ? 1 : 16);
        const fin = new Date(anioActual, mesActual + 1, esPrimeraQuincenaActiva ? 16 : 0);
        return fechaItem >= inicio && fechaItem <= fin;
      } 
      if (filtroTiempo === 'mes') return fechaItem.getMonth() === mesActual && fechaItem.getFullYear() === anioActual;
      if (filtroTiempo === 'anio') return fechaItem.getFullYear() === anioActual;
      return true;
    });
  };

  const citasComoServicios = (citasEstablecimiento || []).map(c => ({
    id: c.id,
    cliente: c.clienteNombre,
    servicio: c.servicio,
    total: c.precioTotal,
    ganancias: c.valorComision,
    porcentajeValor: c.comisionPorcentaje,
    fecha: c.fecha,
    hora: c.hora || '00:00',
    estado: c.estado,
    esDeEstablecimiento: true
  }));

  const todosLosIngresos = [...servicios, ...citasComoServicios];
  const serviciosFiltrados = filtrarServiciosPorTiempo(todosLosIngresos);
  const totalWallet = serviciosFiltrados.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
  
  const gananciaBarbero = serviciosFiltrados.reduce((acc, item) => {
    const gananciaItem = item.ganancias !== undefined ? Number(item.ganancias) : ((Number(item.total) || 0) * (Number(porcentajeBarbero) || 0) / 100);
    return acc + gananciaItem;
  }, 0);

  const citasFiltradas = filtrarServiciosPorTiempo(citasFinalizadas);
  const totalDomicilios100 = citasFiltradas.reduce((acc, item) => acc + parsearPrecioCita(item), 0);

  const obtenerDiasAgrupadosDomicilios = () => {
    const diasMap = {};
    citasFiltradas.forEach(item => {
      const fecha = item.fecha || hoyStr;
      if (!diasMap[fecha]) {
        diasMap[fecha] = { fecha, totalCaja: 0, citas: [] };
      }
      const t = parsearPrecioCita(item);
      diasMap[fecha].totalCaja += t;
      diasMap[fecha].citas.push(item);
    });

    return Object.values(diasMap).sort((a, b) => b.fecha.localeCompare(a.fecha));
  };

  const diasAgrupadosDomicilios = obtenerDiasAgrupadosDomicilios();

  const obtenerTextoFechaRecuadro = () => {
    switch (filtroTiempo) {
      case 'dia': return `Hoy (${hoyStr})`;
      case 'especifico': return `Día: ${fechaEspecifica}`;
      case 'rango': return `Del ${fechaInicio} al ${fechaFin}`;
      case 'semana': return 'Semana actual';
      case 'quincena': return esPrimeraQuincenaActiva ? '1ra Quincena (1 - 15)' : `2da Quincena (16 - ${ultimoDiaMes})`;
      case 'mes': return hoyObj.toLocaleString('es', { month: 'long', year: 'numeric' });
      case 'anio': return `Año ${anioActual}`;
      default: return hoyStr;
    }
  };

  return (
    <div className="p-3 sm:p-5 bg-gradient-to-br from-slate-50 via-sky-50/25 to-indigo-100/30 text-slate-800 min-h-screen max-w-4xl mx-auto relative font-sans overflow-hidden select-none">

      {/* Recuadro de estado de servicios a domicilio con bordes redondeados y botón deslizante */}
      <div
        role="status"
        className={`w-full px-3.5 py-1.5 rounded-full flex items-center justify-between gap-2 text-[9px] font-black uppercase tracking-wider select-none transition-colors shadow-2xs ${
          serviciosEnLinea
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-200 text-slate-700'
        }`}
      >
        <span>{serviciosEnLinea ? 'recibiendo servicios' : 'Fuera de servicios a domicilio'}</span>
        <button
          type="button"
          role="switch"
          aria-checked={serviciosEnLinea}
          aria-label="Encender o apagar servicios a domicilio"
          onClick={handleToggleDomicilio}
          className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 flex items-center cursor-pointer shrink-0 ${
            serviciosEnLinea ? 'bg-emerald-900/40' : 'bg-slate-400/60'
          }`}
        >
          <span
            className={`w-3 h-3 rounded-full bg-white shadow-xs transform transition-transform duration-200 ease-out ${
              serviciosEnLinea ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {modalConfirmarDomicilioOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-emerald-200 rounded-3xl w-full max-w-xs p-6 space-y-4 shadow-2xl text-slate-900 text-center">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-emerald-700 uppercase">Activar servicios a domicilio</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ¿Estás seguro de activarte? Desde ese momento quedarás a disposición de los clientes que necesitan servicios de inmediato.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalConfirmarDomicilioOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarActivacionDomicilio}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-2xl text-xs shadow-md transition cursor-pointer uppercase tracking-wide"
              >
                Activar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Manchas de colores degradadas y fluidas de fondo */}
      <div className="absolute top-[-5%] left-[-5%] w-[45vw] h-[45vw] bg-gradient-to-tr from-sky-400/20 to-teal-300/20 rounded-full blur-[90px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[45vw] h-[45vw] bg-gradient-to-br from-indigo-400/20 to-pink-400/15 rounded-full blur-[90px] pointer-events-none"></div>

      {alertaExito && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-white/90 backdrop-blur-md border border-sky-300 text-slate-800 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs">
            <CheckCircle2 size={18} className="text-sky-600" />
            <p className="font-bold text-sky-900 text-xs">{mensajeExito}</p>
          </div>
        </div>
      )}

      {/* Cabecera Pro corregida contra recortes */}
     <div 
  id="inicio-billetera"
  className="flex flex-row items-center justify-between gap-3 mb-4 px-1 pt-4 sm:pt-6 relative z-10"
>
  <div className="min-w-0 flex-1 ">
    <h1 className="text-base sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2 truncate">
      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-md shadow-sky-500/20 shrink-0">
        <WalletIcon size={18} />
      </div>
      <span className="truncate">Billetera y Gestión</span>
    </h1>
    <p className="text-slate-500 text-[11px] sm:text-xs font-medium ml-1 truncate">Control financiero y comisiones en tiempo real.</p>
  </div>

  {vistaTab === 'manual' && (
    barberData?.establecimientoId ? (
      <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-xs backdrop-blur-xs shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
        <span className="truncate max-w-[140px] sm:max-w-[220px]">
          Admin: <strong className="text-emerald-950">{barberData.establecimientoNombre || 'Establecimiento Socio'}</strong>
        </span>
      </div>
    ) : (
      <button
        onClick={() => {
          setNuevoServicio(prev => ({
            ...prev,
            fecha: hoyStr,
            hora: new Date().toTimeString().slice(0, 5)
          }));
          setModalAgregarOpen(true);
        }}
        className="bg-gradient-to-r from-blue-600 to-sky-600 hover:opacity-95 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-sky-500/25 text-xs cursor-pointer active:scale-95 shrink-0"
      >
        <Plus size={15} /> Registrar
      </button>
    )
  )}
</div>

      {vistaTab === 'manual' && (() => {
        const obtenerDatosDiario = (diaInicio, diaFin) => {
          const dias = [];
          for (let d = diaInicio; d <= diaFin; d++) {
            const serviciosDia = todosLosIngresos.filter(s => {
              const rawFecha = s.fecha || s.date || s.createdAt || s.created_at;
              if (!rawFecha) return false;
              
              let dS = 0, mS = -1, aS = 0;
              if (typeof rawFecha === 'string') {
                const limpia = rawFecha.split('T')[0];
                if (limpia.includes('-')) {
                  const partes = limpia.split('-');
                  aS = parseInt(partes[0], 10);
                  mS = parseInt(partes[1], 10) - 1;
                  dS = parseInt(partes[2], 10);
                }
              }

              if (dS === 0) {
                const fechaObj = new Date(rawFecha);
                if (!isNaN(fechaObj.getTime())) {
                  aS = fechaObj.getFullYear();
                  mS = fechaObj.getMonth();
                  dS = fechaObj.getDate();
                }
              }

              return dS === d && mS === mesActual && aS === anioActual;
            });

            const totalDia = serviciosDia.reduce((acc, curr) => {
              const val = (curr.ganancias !== undefined && !isNaN(Number(curr.ganancias))) 
                ? Number(curr.ganancias) 
                : (Number(curr.total) || Number(curr.precio) || Number(curr.valor) || 0);
              return acc + val;
            }, 0);

            dias.push({ dia: d, monto: totalDia, serviciosCount: serviciosDia.length });
          }
          return dias;
        };

        const datosQ1 = obtenerDatosDiario(1, 15);
        const datosQ2 = obtenerDatosDiario(16, ultimoDiaMes);

        const totalRealQ1 = datosQ1.reduce((acc, curr) => acc + curr.monto, 0);
        const totalServiciosQ1 = datosQ1.reduce((acc, curr) => acc + curr.serviciosCount, 0);

        const totalRealQ2 = datosQ2.reduce((acc, curr) => acc + curr.monto, 0);
        const totalServiciosQ2 = datosQ2.reduce((acc, curr) => acc + curr.serviciosCount, 0);

        const generarPathYCoordenadas = (datos, width = 120, height = 26) => {
          const max = Math.max(...datos.map(d => d.monto), 1);
          
          const puntos = datos.map((item, idx) => {
            const x = datos.length > 1 ? (idx / (datos.length - 1)) * width : width / 2;
            const y = item.monto === 0 ? height - 4 : height - (item.monto / max) * (height - 10) - 5;
            return { x, y, ...item };
          });

          const pathD = puntos.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
          const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
          
          return { puntos, pathD, areaD, max };
        };

        const q1Grafico = generarPathYCoordenadas(datosQ1);
        const q2Grafico = generarPathYCoordenadas(datosQ2);

        return (
          <>
          {/* Sección de Carrusel de Quincenas con dirección hacia la derecha (dir="rtl") */}
<div className="relative mb-4 z-10">
  <div className="flex items-center justify-between mb-1.5 px-1">
    <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 flex items-center gap-1">
      <Layers size={12} className="text-blue-600" /> Historial de Quincenas
    </span>
    
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          const elActual = document.getElementById('mes-actual-carrusel');
          if (elActual) elActual.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }}
        className="text-[9px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-lg border border-blue-200 transition cursor-pointer shadow-xs flex items-center gap-1"
      >
        📅 Mes actual
      </button>
      <span className="text-[9px] text-slate-400 font-medium hidden sm:inline">Desliza hacia la derecha →</span>
    </div>
  </div>

  {/* Contenedor con dir="rtl" para invertir el comportamiento y deslizar hacia la derecha */}
  <div 
    ref={carruselRef}
    dir="rtl"
    className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
  >
    {(() => {
      const listaMeses = [];
      const fechaBase = new Date();

      for (let i = 0; i < 6; i++) {
        const d = new Date(fechaBase.getFullYear(), fechaBase.getMonth() - i, 1);
        const anioQ = d.getFullYear();
        const mesQ = d.getMonth();
        const nombreMes = d.toLocaleString('es', { month: 'long' });
        const nombreMesMayus = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
        const ultimoDia = new Date(anioQ, mesQ + 1, 0).getDate();

        const obtenerDatosQuincenaEspecifica = (diaInicio, diaFin) => {
          const dias = [];
          for (let dia = diaInicio; dia <= diaFin; dia++) {
            const serviciosDia = todosLosIngresos.filter(s => {
              const rawFecha = s.fecha || s.date || s.createdAt || s.created_at;
              if (!rawFecha) return false;
              let dS = 0, mS = -1, aS = 0;
              if (typeof rawFecha === 'string') {
                const limpia = rawFecha.split('T')[0];
                if (limpia.includes('-')) {
                  const partes = limpia.split('-');
                  aS = parseInt(partes[0], 10);
                  mS = parseInt(partes[1], 10) - 1;
                  dS = parseInt(partes[2], 10);
                }
              }
              if (dS === 0) {
                const fechaObj = new Date(rawFecha);
                if (!isNaN(fechaObj.getTime())) {
                  aS = fechaObj.getFullYear();
                  mS = fechaObj.getMonth();
                  dS = fechaObj.getDate();
                }
              }
              return dS === dia && mS === mesQ && aS === anioQ;
            });

            const totalDia = serviciosDia.reduce((acc, curr) => {
              const val = (curr.ganancias !== undefined && !isNaN(Number(curr.ganancias))) 
                ? Number(curr.ganancias) 
                : (Number(curr.total) || Number(curr.precio) || Number(curr.valor) || 0);
              return acc + val;
            }, 0);

            dias.push({ dia, monto: totalDia, serviciosCount: serviciosDia.length });
          }
          return dias;
        };

        const generarGraficoQuincena = (datos) => {
          const max = Math.max(...datos.map(d => d.monto), 1);
          const puntos = datos.map((item, idx) => {
            const x = datos.length > 1 ? (idx / (datos.length - 1)) * 120 : 60;
            const y = item.monto === 0 ? 21 : 26 - (item.monto / max) * 16 - 5;
            return { x, y, ...item };
          });
          const pathD = puntos.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
          const areaD = `${pathD} L 120 26 L 0 26 Z`;
          return { puntos, pathD, areaD };
        };

        // 1ra Quincena (Izquierda)
        const datosQ1Mes = obtenerDatosQuincenaEspecifica(1, 15);
        const totalQ1Mes = datosQ1Mes.reduce((acc, curr) => acc + curr.monto, 0);
        const servQ1Mes = datosQ1Mes.reduce((acc, curr) => acc + curr.serviciosCount, 0);
        const esQ1EnCurso = (anioQ === anioActual && mesQ === mesActual && diaActual <= 15);

        // 2da Quincena (Derecha)
        const datosQ2Mes = obtenerDatosQuincenaEspecifica(16, ultimoDia);
        const totalQ2Mes = datosQ2Mes.reduce((acc, curr) => acc + curr.monto, 0);
        const servQ2Mes = datosQ2Mes.reduce((acc, curr) => acc + curr.serviciosCount, 0);
        const esQ2EnCurso = (anioQ === anioActual && mesQ === mesActual && diaActual > 15);

        listaMeses.push({
          mesId: `mes-${anioQ}-${mesQ}`,
          esMesActual: anioQ === anioActual && mesQ === mesActual,
          q1: {
            id: `q1-${anioQ}-${mesQ}`,
            titulo: `1ra Q • ${nombreMesMayus}`,
            datos: datosQ1Mes,
            total: totalQ1Mes,
            serv: servQ1Mes,
            grafico: generarGraficoQuincena(datosQ1Mes),
            enCurso: esQ1EnCurso,
            sinMovimiento: totalQ1Mes === 0 && !esQ1EnCurso
          },
          q2: {
            id: `q2-${anioQ}-${mesQ}`,
            titulo: `2da Q • ${nombreMesMayus}`,
            datos: datosQ2Mes,
            total: totalQ2Mes,
            serv: servQ2Mes,
            grafico: generarGraficoQuincena(datosQ2Mes),
            enCurso: esQ2EnCurso,
            sinMovimiento: totalQ2Mes === 0 && !esQ2EnCurso
          }
        });
      }

      return listaMeses.map((mesData) => (
        <MesCarruselItem
          key={mesData.mesId}
          mesData={mesData}
          setQuincenaActivaModal={setQuincenaActivaModal}
          anioActual={anioActual}
          mesActual={mesActual}
          diaActual={diaActual}
        />
      ));
    })()}
  </div>
</div>

            {quincenaActivaModal && (() => {
              const modalGrafico = generarPathYCoordenadas(quincenaActivaModal.datos, 300, 100);
              const hoy = new Date();
              const diaActual = hoy.getDate();
              const mesActualSistema = hoy.getMonth();
              const anioActualSistema = hoy.getFullYear();

              const valorMeta = Number(
                typeof metaDiaria !== 'undefined' ? metaDiaria : 
                (typeof barberData !== 'undefined' && barberData?.metaDiaria !== undefined ? barberData.metaDiaria : 0)
              ) || 0;

              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fadeIn">
                  <div className="bg-white/95 backdrop-blur-xl border border-sky-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[90vh]">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50 flex-shrink-0">
                      <div>
                        <span className="text-xs font-bold tracking-wider text-blue-600 uppercase flex items-center gap-1.5">
                          <Layers size={14} /> Análisis de Rendimiento
                        </span>
                        <h3 className="text-lg font-black text-blue-950">{quincenaActivaModal.titulo}</h3>
                      </div>
                      <button 
                        onClick={() => {
                          setQuincenaActivaModal(null);
                          setDiaSeleccionadoModal(null);
                        }}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors font-bold text-sm cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-5 flex-grow">
                      <div className="flex justify-between items-center bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-2xl border border-sky-100 shadow-inner">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Total Producido</p>
                          <p className="text-xl font-extrabold text-blue-600">${quincenaActivaModal.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-medium">Total Servicios</p>
                          <p className="text-lg font-bold text-slate-800">{quincenaActivaModal.serv} serv.</p>
                        </div>
                      </div>

                      {(() => {
                        const diasQuincena = quincenaActivaModal.datos.map(d => d.dia);
                        const egresosQuincena = (listaEgresos || []).filter(e => {
                          const rawFecha = e.fechaHora || e.fecha || e.date || e.createdAt;
                          if (!rawFecha) return false;
                          const fechaObj = new Date(rawFecha);
                          if (isNaN(fechaObj.getTime())) return false;
                          return (
                            diasQuincena.includes(fechaObj.getDate()) &&
                            fechaObj.getMonth() === mesActual &&
                            fechaObj.getFullYear() === anioActual
                          );
                        });

                        const propinasQuincena = (listaPropinas || []).filter(p => {
                          const rawFecha = p.fechaHora || p.fecha || p.date || p.createdAt;
                          if (!rawFecha) return false;
                          const fechaObj = new Date(rawFecha);
                          if (isNaN(fechaObj.getTime())) return false;
                          return (
                            diasQuincena.includes(fechaObj.getDate()) &&
                            fechaObj.getMonth() === mesActual &&
                            fechaObj.getFullYear() === anioActual
                          );
                        });

                        const totalEgresosQ = egresosQuincena.reduce((acc, curr) => acc + (Number(curr.monto || curr.valor || curr.total) || 0), 0);
                        const totalPropinasQ = propinasQuincena.reduce((acc, curr) => acc + (Number(curr.monto || curr.valor || curr.total) || 0), 0);

                        return (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-rose-50/80 border border-rose-200 p-3.5 rounded-2xl shadow-xs">
                              <p className="text-[10px] text-rose-600 font-bold uppercase">Total Egresos</p>
                              <p className="text-base font-black text-rose-900 mt-0.5">${totalEgresosQ.toLocaleString()}</p>
                            </div>
                            <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl shadow-xs">
                              <p className="text-[10px] text-emerald-600 font-bold uppercase">Total Propinas</p>
                              <p className="text-base font-black text-emerald-900 mt-0.5">${totalPropinasQ.toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="h-32 w-full pt-4 relative bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                        {(() => {
                          const tieneMeta = valorMeta > 0;
                          const maxMontoGrafico = Math.max(...modalGrafico.puntos.map(p => p.monto), valorMeta, 10000);
                          const svgHeight = 100;
                          const yMeta = svgHeight - (valorMeta / maxMontoGrafico) * (svgHeight - 15) - 10;

                          return (
                            <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                              <defs>
                                <linearGradient id="modalGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>

                              {tieneMeta && (
                                <g>
                                  <line 
                                    x1="0" 
                                    y1={yMeta} 
                                    x2="300" 
                                    y2={yMeta} 
                                    stroke="#10b981" 
                                    strokeWidth="1.5" 
                                    strokeDasharray="3,3" 
                                  />
                                  <foreignObject x="210" y={yMeta - 40} width="100" height="18" className="overflow-visible">
                                    <div className="bg-black text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-xs text-center border border-emerald-400 whitespace-nowrap">
                                      🎯 Meta: ${valorMeta.toLocaleString()}
                                    </div>
                                  </foreignObject>
                                </g>
                              )}

                              <path d={modalGrafico.areaD} fill="url(#modalGrad)" />
                              <path d={modalGrafico.pathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              
                              {modalGrafico.puntos.map((pt, i) => {
                                const itemDia = quincenaActivaModal.datos[i];
                                const esDiaPasado = itemDia && (
                                  anioActual < anioActualSistema || 
                                  (anioActual === anioActualSistema && mesActual < mesActualSistema) || 
                                  (anioActual === anioActualSistema && mesActual === mesActualSistema && itemDia.dia < diaActual)
                                );
                                const esDescansoPt = itemDia && itemDia.monto === 0 && esDiaPasado;
                                const superaMeta = tieneMeta && itemDia && itemDia.monto >= valorMeta;

                                return (
                                  <g key={i}>
                                    <circle 
                                      cx={pt.x} 
                                      cy={pt.y} 
                                      r={pt.monto > 0 ? 5 : (esDescansoPt ? 4 : 2)} 
                                      className={
                                        superaMeta 
                                          ? 'fill-emerald-500 ring-4 ring-emerald-500/20' 
                                          : pt.monto > 0 
                                            ? 'fill-cyan-400 ring-4 ring-cyan-500/20' 
                                            : esDescansoPt 
                                              ? 'fill-amber-500 ring-4 ring-amber-500/20' 
                                              : 'fill-slate-600'
                                      } 
                                    />
                                  </g>
                                );
                              })}
                            </svg>
                          );
                        })()}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Desglose Día por Día</h4>
                          <span className="text-[10px] text-blue-600 font-medium">Haz clic en un día para ver detalles</span>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {quincenaActivaModal.datos.map((item, idx) => {
                            const esDiaPasado = (
                              anioActual < anioActualSistema || 
                              (anioActual === anioActualSistema && mesActual < mesActualSistema) || 
                              (anioActual === anioActualSistema && mesActual === mesActualSistema && item.dia < diaActual)
                            );
                            const esDescanso = item.monto === 0 && esDiaPasado;
                            const cumpleMeta = valorMeta > 0 && item.monto >= valorMeta;

                            return (
                              <div 
                                key={idx} 
                                onClick={() => setDiaSeleccionadoModal(item.dia)}
                                className={`flex justify-between items-center px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                                  cumpleMeta
                                    ? 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-400 text-slate-900 font-medium shadow-2xs'
                                    : item.monto > 0 
                                      ? 'bg-blue-50/60 border-blue-200 hover:border-blue-400 hover:bg-blue-100/60 text-slate-900 font-medium shadow-2xs' 
                                      : esDescanso
                                        ? 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/80 text-amber-900'
                                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    cumpleMeta
                                      ? 'bg-emerald-500'
                                      : item.monto > 0 
                                        ? 'bg-blue-600' 
                                        : esDescanso 
                                          ? 'bg-amber-500' 
                                          : 'bg-slate-300'
                                  }`}></span>
                                  <span>Día {item.dia}</span>
                                  {cumpleMeta && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded-md">
                                      🌟 ¡Meta cumplida!
                                    </span>
                                  )}
                                </span>
                                <div className="flex items-center gap-3">
                                  {!esDescanso && (
                                    <span className="text-[11px] text-slate-500">{item.serviciosCount} serv.</span>
                                  )}
                                  <span className={`font-bold ${
                                    cumpleMeta
                                      ? 'text-emerald-700'
                                      : item.monto > 0 
                                        ? 'text-blue-600' 
                                        : esDescanso 
                                          ? 'text-amber-600 uppercase tracking-wide text-[10px] bg-amber-100 px-2 py-0.5 rounded-md font-extrabold' 
                                          : 'text-slate-400'
                                  }`}>
                                    {esDescanso ? 'DESCANSO' : `$${item.monto.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-sky-100 bg-sky-50/50 text-right flex-shrink-0">
                      <button 
                        onClick={() => {
                          setQuincenaActivaModal(null);
                          setDiaSeleccionadoModal(null);
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Cerrar Análisis
                      </button>
                    </div>
                  </div>

                  {diaSeleccionadoModal !== null && (() => {
                    const serviciosDelDia = diaSeleccionadoModal !== null ? todosLosIngresos.filter(s => {
                      const rawFecha = s.fecha || s.date || s.createdAt || s.created_at;
                      if (!rawFecha) return false;
                      
                      let dS = 0, mS = -1, aS = 0;
                      if (typeof rawFecha === 'string') {
                        const limpia = rawFecha.split('T')[0];
                        if (limpia.includes('-')) {
                          const partes = limpia.split('-');
                          aS = parseInt(partes[0], 10);
                          mS = parseInt(partes[1], 10) - 1;
                          dS = parseInt(partes[2], 10);
                        }
                      }
                      if (dS === 0) {
                        const fechaObj = new Date(rawFecha);
                        if (!isNaN(fechaObj.getTime())) {
                          aS = fechaObj.getFullYear();
                          mS = fechaObj.getMonth();
                          dS = fechaObj.getDate();
                        }
                      }
                      return dS === diaSeleccionadoModal && mS === mesActual && aS === anioActual;
                    }) : [];

                    const totalGananciasDia = serviciosDelDia.reduce((acc, curr) => {
                      const val = (curr.ganancias !== undefined && !isNaN(Number(curr.ganancias))) 
                        ? Number(curr.ganancias) 
                        : (Number(curr.total) || Number(curr.precio) || Number(curr.valor) || 0);
                      return acc + val;
                    }, 0);

                    return (
                      <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
                        <div className="bg-white border border-sky-300 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[85vh]">
                          <div className="flex justify-between items-center px-6 py-4 border-b border-sky-100 bg-gradient-to-r from-blue-600 to-sky-600 text-white">
                            <div>
                              <span className="text-[10px] font-bold tracking-wider text-sky-100 uppercase">
                                Detalle de Caja
                              </span>
                              <h3 className="text-base font-black text-white">Servicios del Día {diaSeleccionadoModal}</h3>
                            </div>
                            <button 
                              onClick={() => setDiaSeleccionadoModal(null)}
                              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors font-bold text-sm cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="p-6 overflow-y-auto space-y-3 flex-grow">
                            <div className="flex justify-between items-center bg-blue-50 px-4 py-3 rounded-2xl border border-blue-100 text-xs">
                              <span className="text-slate-600">Total servicios: <strong className="text-slate-900">{serviciosDelDia.length}</strong></span>
                              <span className="text-slate-600">Ganancias: <strong className="text-blue-600">${totalGananciasDia.toLocaleString()}</strong></span>
                            </div>

                            {serviciosDelDia.length === 0 ? (
                              <div className="text-center py-10 text-slate-400 text-xs">
                                No hay servicios registrados para este día.
                              </div>
                            ) : (
                              serviciosDelDia.map((srv, i) => {
                                const gananciaServicio = Number(srv.ganancias) || Number(srv.total) || 0;
                                const totalServicio = Number(srv.total) || 0;
                                const esAutomatico = Boolean(srv.esDeEstablecimiento);

                                return (
                                  <div 
                                    key={i} 
                                    className={`border p-3.5 rounded-2xl space-y-2 transition-all ${
                                      esAutomatico 
                                        ? 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-500' 
                                        : 'bg-slate-50 border-slate-200 hover:border-blue-400'       
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                          <span className={`text-xs font-bold block ${esAutomatico ? 'text-emerald-950' : 'text-blue-900'}`}>
                                            {srv.servicio || 'Servicio sin nombre'}
                                          </span>
                                          
                                          {esAutomatico ? (
                                            <span className="bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                                              Automático 🏢
                                            </span>
                                          ) : (
                                            <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                                              Manual ✍️
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-xs text-slate-600 font-medium">Cliente: {srv.cliente || 'General'}</span>
                                      </div>

                                      <div className="text-right">
                                        <span className={`text-xs font-extrabold block ${esAutomatico ? 'text-emerald-700' : 'text-blue-600'}`}>
                                          +${gananciaServicio.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-slate-400">Total: ${totalServicio.toLocaleString()}</span>
                                      </div>
                                    </div>

                                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-200/60 pt-2 font-mono">
                                      <span>Hora: {srv.hora || 'N/A'}</span>
                                      {srv.porcentajeValor && <span>Comisión: {srv.porcentajeValor}%</span>}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
                            <button 
                              onClick={() => setDiaSeleccionadoModal(null)}
                              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                            >
                              Volver al Resumen
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </>
        );
      })()}


      {vistaTab === 'manual' ? (() => {
        const [modalMetaAbierto, setModalMetaAbierto] = React.useState(false);
        const [inputMetaValor, setInputMetaValor] = React.useState('');

        const tieneMetaDefinida = barberData?.metaDiaria !== undefined && barberData?.metaDiaria !== null && barberData?.metaDiaria !== '';
        const metaActual = tieneMetaDefinida ? Number(barberData.metaDiaria) : 150000;

        const gananciaDiaActual = todosLosIngresos
          .filter(s => {
            const rawFecha = s.fecha || s.date || s.createdAt || s.created_at;
            if (!rawFecha) return false;
            return String(rawFecha).split('T')[0] === hoyStr;
          })
          .reduce((acc, item) => {
            const gananciaItem = item.ganancias !== undefined ? Number(item.ganancias) : ((Number(item.total) || 0) * (Number(porcentajeBarbero) || 0) / 100);
            return acc + gananciaItem;
          }, 0);

        const porcentajeProgreso = tieneMetaDefinida ? Math.min(100, Math.max(0, (gananciaDiaActual / metaActual) * 100)) : 0;
        const diferenciaMetaDiaActual = gananciaDiaActual - metaActual;

        const filtrarPorTiempoActual = (lista) => {
          return (lista || []).filter(item => {
            const rawFecha = item.fechaHora || item.fecha || item.date || item.createdAt;
            if (!rawFecha) return false;
            const fechaItemStr = String(rawFecha).split('T')[0];
            const fechaItemObj = new Date(rawFecha);
            if (isNaN(fechaItemObj.getTime())) return false;

            if (filtroTiempo === 'dia') return fechaItemStr === hoyStr;
            if (filtroTiempo === 'especifico') return fechaItemStr === fechaEspecifica;
            if (filtroTiempo === 'rango') return fechaItemStr >= fechaInicio && fechaItemStr <= fechaFin;
            if (filtroTiempo === 'semana') {
              const primerDiaSemana = new Date(hoyObj);
              primerDiaSemana.setDate(hoyObj.getDate() - hoyObj.getDay());
              return fechaItemObj >= primerDiaSemana && fechaItemObj <= hoyObj;
            } 
            if (filtroTiempo === 'quincena') {
              const inicio = new Date(anioActual, mesActual, esPrimeraQuincenaActiva ? 1 : 16);
              const fin = new Date(anioActual, mesActual + 1, esPrimeraQuincenaActiva ? 16 : 0);
              return fechaItemObj >= inicio && fechaItemObj <= fin;
            } 
            if (filtroTiempo === 'mes') return fechaItemObj.getMonth() === mesActual && fechaItemObj.getFullYear() === anioActual;
            if (filtroTiempo === 'anio') return fechaItemObj.getFullYear() === anioActual;
            return true;
          });
        };

        const totalEgresosPeriodo = filtrarPorTiempoActual(listaEgresos).reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
        const totalPropinasPeriodo = filtrarPorTiempoActual(listaPropinas).reduce((acc, item) => acc + (Number(item.monto) || 0), 0);

        const obtenerMensajeDinamico = (porc, definida) => {
          if (!definida) return "⚠️ Establece tu meta";
          if (porc >= 100) return "¡Meta superada! 🚀";
          if (porc >= 75) return "¡Ya casi! 🔥";
          if (porc >= 40) return "¡A mitad de camino! 💪";
          return "¡Vas empezando! ⚡";
        };

        const guardarMetaDiaria = async (e) => {
          e.preventDefault();
          const parsedMeta = parseInt(inputMetaValor.replace(/[^0-9]/g, ''), 10);
          const idProf = barberData?.id || barberData?.uid;

          if (!isNaN(parsedMeta) && parsedMeta > 0 && idProf) {
            try {
              await updateDoc(doc(db, 'profesionales', idProf), { metaDiaria: parsedMeta });
              setModalMetaAbierto(false);
              alert('¡Meta diaria actualizada con éxito!');
            } catch (err) {
              console.error("Error al actualizar la meta:", err);
              alert('Error al guardar la meta en la base de datos.');
            }
          } else {
            alert('Por favor ingresa un monto válido.');
          }
        };

        const radio = 36;
        const circunferencia = 2 * Math.PI * radio;
        const desplazamientoStroke = circunferencia - (porcentajeProgreso / 100) * circunferencia;

        return (
          <>
     <div className="bg-white/90 backdrop-blur-xl border border-white/85 shadow-lg rounded-2xl p-2.5 mb-3 relative z-10 space-y-2">
  
  {/* Cabecera Principal */}
  <div className="flex justify-between items-center gap-2 pb-1.5 border-b border-slate-100">
    <span className="text-slate-500 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 truncate">
      <Calendar size={12} className="text-blue-600 shrink-0" /> Ganancia Manual • <span className="text-slate-900 capitalize truncate">{obtenerTextoFechaRecuadro()}</span>
    </span>
    <button 
      type="button"
      onClick={() => {
        setInputMetaValor(tieneMetaDefinida ? metaActual.toString() : '');
        setModalMetaAbierto(true);
      }}
      className={`text-[8px] px-2 py-0.5 rounded-lg font-bold uppercase transition cursor-pointer shadow-xs flex items-center gap-1 shrink-0 ${
        tieneMetaDefinida ? 'bg-blue-100 hover:bg-blue-200 text-blue-900' : 'bg-amber-100 hover:bg-amber-200 text-amber-900 animate-pulse'
      }`}
    >
      🎯 {tieneMetaDefinida ? `Meta: $${metaActual.toLocaleString()}` : 'Configurar Meta'}
    </button>
  </div>

  {/* Contenido Ultra Compacto (Monto e Indicadores) */}
  <div className="flex items-center justify-between gap-2">
    
    {/* Izquierda: Monto y Estado */}
    <div className="space-y-0.5 flex-1 min-w-0">
      <div className="flex items-baseline gap-1">
        <h2 className="text-lg sm:text-xl font-black text-blue-950 truncate">
          ${gananciaBarbero.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </h2>
        <span className="text-blue-600 font-extrabold text-[9px] shrink-0">COP</span>
      </div>

      <div className="text-[8px] font-bold">
        {!tieneMetaDefinida ? (
          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 inline-block shadow-2xs">
            ⚠️ Sin meta
          </span>
        ) : diferenciaMetaDiaActual >= 0 ? (
          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 inline-block truncate shadow-2xs">
            🎉 +${diferenciaMetaDiaActual.toLocaleString()} sobre meta
          </span>
        ) : (
          <span className="text-blue-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100 inline-block truncate shadow-2xs">
            ⏳ Faltan ${Math.abs(diferenciaMetaDiaActual).toLocaleString()}
          </span>
        )}
      </div>

      <div className="text-[8px] text-slate-500 flex items-center gap-1 font-medium">
        <span>Caja:</span>
        <span className="text-slate-900 font-bold">${totalWallet.toLocaleString()} COP</span>
      </div>
    </div>

    {/* Derecha: Mini Círculos Indicadores */}
    <div className="flex items-center gap-1.5 shrink-0">
      
      {/* Círculo 1: Meta */}
      <div 
        className="flex flex-col items-center cursor-pointer group bg-sky-50 hover:bg-sky-100 px-1.5 py-1 rounded-xl border border-sky-100 transition-all" 
        onClick={() => {
          setInputMetaValor(tieneMetaDefinida ? metaActual.toString() : '');
          setModalMetaAbierto(true);
        }} 
        title="Haz clic para cambiar tu meta diaria"
      >
        <span className={`mb-0.5 text-[6px] font-black px-1 rounded-full shadow-2xs whitespace-nowrap border text-center w-[50px] truncate ${
          !tieneMetaDefinida ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-blue-600 text-white border-sky-300'
        }`}>
          {obtenerMensajeDinamico(porcentajeProgreso, tieneMetaDefinida)}
        </span>

        <div className="relative w-9 h-9 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radio} stroke="currentColor" strokeWidth="6" className="text-blue-200/60" fill="transparent" />
            <circle
              cx="40" cy="40" r={radio}
              stroke="url(#gradientAzul)"
              strokeWidth="6"
              strokeDasharray={circunferencia}
              strokeDashoffset={desplazamientoStroke}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="gradientAzul" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[8px] font-black text-blue-950">{tieneMetaDefinida ? `${Math.round(porcentajeProgreso)}%` : '0%'}</span>
            <span className="text-[5px] font-bold text-slate-400 uppercase tracking-tighter">Meta</span>
          </div>
        </div>
      </div>

      {/* Círculo 2: Egresos */}
      <div 
        className="flex flex-col items-center cursor-pointer group bg-rose-50 hover:bg-rose-100 px-1.5 py-1 rounded-xl border border-rose-100 transition-all" 
        onClick={() => setModalEgresosAbierto(true)}
        title="Gestionar Egresos"
      >
        <span className="mb-0.5 text-[6px] font-black px-1 rounded-full shadow-2xs whitespace-nowrap bg-rose-600 text-white border border-rose-300 text-center w-[50px] truncate">
          💸 Egresos
        </span>

        <div className="relative w-9 h-9 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radio} stroke="currentColor" strokeWidth="6" className="text-rose-200/60" fill="transparent" />
            <circle
              cx="40" cy="40" r={radio}
              stroke="url(#gradientRojo)"
              strokeWidth="6"
              strokeDasharray={circunferencia}
              strokeDashoffset="15"
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out group-hover:scale-105"
            />
            <defs>
              <linearGradient id="gradientRojo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[7px] font-black text-rose-950">-${totalEgresosPeriodo || 0}</span>
            <span className="text-[5px] font-bold text-slate-400 uppercase tracking-tighter">Gastos</span>
          </div>
        </div>
      </div>

      {/* Círculo 3: Propinas */}
      <div 
        className="flex flex-col items-center cursor-pointer group bg-emerald-50 hover:bg-emerald-100 px-1.5 py-1 rounded-xl border border-emerald-100 transition-all" 
        onClick={() => setModalPropinasAbierto(true)}
        title="Gestionar Propinas"
      >
        <span className="mb-0.5 text-[6px] font-black px-1 rounded-full shadow-2xs whitespace-nowrap bg-emerald-600 text-white border border-emerald-300 text-center w-[50px] truncate">
          ✨ Propinas
        </span>

        <div className="relative w-9 h-9 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radio} stroke="currentColor" strokeWidth="6" className="text-emerald-200/60" fill="transparent" />
            <circle
              cx="40" cy="40" r={radio}
              stroke="url(#gradientVerde)"
              strokeWidth="6"
              strokeDasharray={circunferencia}
              strokeDashoffset="15"
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out group-hover:scale-105"
            />
            <defs>
              <linearGradient id="gradientVerde" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[7px] font-black text-emerald-950">+${totalPropinasPeriodo || 0}</span>
            <span className="text-[5px] font-bold text-slate-400 uppercase tracking-tighter">Propinas</span>
          </div>
        </div>
      </div>

    </div>
  </div>

  {/* Selector de Filtros de Tiempo Pro (Integrado) */}
  <div className="flex items-center gap-1 overflow-x-auto pt-1.5 border-t border-slate-100 scrollbar-none">
    {[
      { id: 'dia', label: 'Hoy' },
      { id: 'especifico', label: 'Día' },
      { id: 'rango', label: 'Rango' },
      { id: 'semana', label: 'Semana' },
      { id: 'quincena', label: 'Quincena' },
      { id: 'mes', label: 'Mes' },
      { id: 'anio', label: 'Año' },
    ].map((tab) => (
      <button
        key={tab.id}
        onClick={() => setFiltroTiempo(tab.id)}
        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
          filtroTiempo === tab.id
            ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/20'
            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>

  {/* Inputs Condicionales Compactos */}
  {filtroTiempo === 'especifico' && (
    <div className="flex items-center justify-between gap-2 text-[11px] bg-sky-50/90 p-2 rounded-xl border border-sky-200 text-blue-950">
      <span className="font-semibold flex items-center gap-1">
        <Calendar size={13} className="text-blue-600" /> Día:
      </span>
      <input
        type="date"
        value={fechaEspecifica}
        onChange={(e) => setFechaEspecifica(e.target.value)}
        className="bg-white rounded-lg px-2 py-1 text-slate-800 text-[11px] focus:outline-none font-medium border border-sky-300 shadow-inner"
      />
    </div>
  )}

  {filtroTiempo === 'rango' && (
    <div className="grid grid-cols-2 gap-2 text-[11px] bg-sky-50/90 p-2 rounded-xl border border-sky-200 text-blue-950">
      <div>
        <label className="block font-bold mb-0.5 text-slate-600 text-[9px]">Desde:</label>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="w-full bg-white border border-sky-300 rounded-lg px-2 py-1 text-slate-800 text-[11px] focus:outline-none font-medium shadow-inner"
        />
      </div>
      <div>
        <label className="block font-bold mb-0.5 text-slate-600 text-[9px]">Hasta:</label>
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="w-full bg-white border border-sky-300 rounded-lg px-2 py-1 text-slate-800 text-[11px] focus:outline-none font-medium shadow-inner"
        />
      </div>
    </div>
  )}

</div>
            

            {modalMetaAbierto && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-800 font-sans border border-slate-100">
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-blue-950 uppercase flex items-center gap-2">
                      🎯 Establecer Meta Diaria
                    </h3>
                    <button onClick={() => setModalMetaAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
                  </div>

                  <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl text-xs text-blue-950 space-y-1.5 shadow-inner">
                    <p className="font-black uppercase tracking-wide text-blue-800">💡 Consejo Financiero:</p>
                    <p className="leading-relaxed text-slate-600 text-[11px]">
                      Establecer metas diarias realistas te permite mantener un flujo de caja constante y asegurar la rentabilidad de tus servicios.
                    </p>
                  </div>

                  <form onSubmit={guardarMetaDiaria} className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[10px]">Nuevo Monto Objetivo (COP):</label>
                      <input 
                        type="text" 
                        required
                        value={inputMetaValor}
                        onChange={(e) => setInputMetaValor(e.target.value)}
                        placeholder="Ej: 200000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[16px] text-slate-900 font-bold outline-none focus:border-blue-600 shadow-inner"
                      />
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setModalMetaAbierto(false)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl uppercase transition cursor-pointer text-xs"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-sky-600 hover:opacity-95 text-white font-black py-3 rounded-2xl uppercase shadow-md transition cursor-pointer text-xs"
                      >
                        Guardar Meta
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            )}
          </>
        );
      })() : (
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 border border-blue-800/60 p-5 rounded-3xl mb-4 shadow-xl text-white relative z-10">
          <div className="flex justify-between items-center gap-2 mb-2">
            <span className="text-sky-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Home size={14} className="text-cyan-400" /> Ingresos Domicilios 100% (Finalizados) • <span className="text-white capitalize">{obtenerTextoFechaRecuadro()}</span>
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl sm:text-4xl font-black text-cyan-300">
              ${totalDomicilios100.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h2>
            <span className="text-sky-200 font-bold text-xs">COP</span>
          </div>

          <div className="mt-2 text-xs text-slate-300 flex items-center gap-1.5 font-medium">
            <span>Total servicios a domicilio completados:</span>
            <span className="text-white font-extrabold">{citasFiltradas.length} citas</span>
          </div>
        </div>
      )}

      {/* Historial o Listados */}
      {vistaTab === 'manual' ? (
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-xl text-slate-800 relative z-10">
          <div className="p-4 border-b border-sky-100 flex justify-between items-center bg-gradient-to-r from-sky-50/80 to-blue-50/80">
            <h3 className="text-xs font-black text-blue-950 uppercase flex items-center gap-2">
              <Calendar size={15} className="text-blue-600" /> Historial de Servicios Manuales
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-950 px-3 py-1 rounded-full font-black border border-blue-200 shadow-2xs">
              {serviciosFiltrados.length} servicios registrados
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-blue-500 text-xs font-bold animate-pulse">Cargando datos...</div>
            ) : serviciosFiltrados && serviciosFiltrados.length > 0 ? (
              [...serviciosFiltrados]
                .sort((a, b) => {
                  const fechaA = new Date(`${a.fecha || '1970-01-01'}T${a.hora || '00:00'}`);
                  const fechaB = new Date(`${b.fecha || '1970-01-01'}T${b.hora || '00:00'}`);
                  return fechaB - fechaA;
                })
                .map((srv, index) => {
                  const estadoActual = (srv.estado || srv.estadoPago || 'pagado').toLowerCase().trim();
                  const esPendiente = estadoActual === 'pendiente';
                  const esPagado = estadoActual === 'pagado';
                  const esConfirmado = estadoActual === 'confirmado';

                  const totalServicio = esPendiente ? 0 : (Number(srv.precioTotal) || Number(srv.total) || 0);
                  const gananciaServicio = esPendiente ? 0 : (Number(srv.valorComision) || Number(srv.ganancias) || (totalServicio * Number(srv.porcentajeValor || srv.comisionPorcentaje || 35)) / 100);

                  return (
                    <div 
                      key={srv.id || index}
                      className={`p-3.5 flex items-center justify-between transition-colors group ${
                        esPendiente 
                          ? 'bg-amber-50/60 border-l-4 border-l-amber-400' 
                          : esConfirmado
                            ? 'bg-emerald-50/70 border-l-4 border-l-emerald-500'
                            : esPagado
                              ? 'bg-sky-50/60 border-l-4 border-l-sky-500'
                              : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl flex-shrink-0 border shadow-xs ${
                          esPendiente
                            ? 'bg-amber-100 text-amber-700 border-amber-300'
                            : esConfirmado
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                              : 'bg-sky-100 text-sky-700 border-sky-300'
                        }`}>
                          <Calendar size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-extrabold text-slate-900">{srv.clienteNombre || srv.cliente || 'General'}</p>
                            
                            {esPendiente ? (
                              <span className="bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shadow-2xs">
                                Pendiente 🟡
                              </span>
                            ) : esConfirmado ? (
                              <span className="bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shadow-2xs">
                                Confirmado 🟢
                              </span>
                            ) : (
                              <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shadow-2xs">
                                Pagado 🔵
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-slate-600 font-medium mt-0.5">
                            Servicio: <span className={`font-bold ${esPendiente ? 'text-amber-800' : esConfirmado ? 'text-emerald-800' : 'text-blue-800'}`}>
                              {srv.servicio || 'Servicio sin nombre'}
                            </span>
                          </p>

                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {srv.fecha || 'Fecha N/A'} • {srv.hora || 'Hora N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right flex-shrink-0">
                          <p className={`text-xs font-black ${esPendiente ? 'text-amber-600' : esConfirmado ? 'text-emerald-700' : 'text-blue-700'}`}>
                            {esPendiente ? '$0 COP' : `+${gananciaServicio.toLocaleString()} COP`}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Total: ${totalServicio.toLocaleString()}</p>
                        </div>

                        {esPagado && srv.esDeEstablecimiento && (
                          <button
                            type="button"
                            onClick={() => {
                              setServicioAConfirmar(srv);
                              setModalConfirmarEstadoOpen(true);
                            }}
                            title="Hacer clic para confirmar esta cita"
                            className="w-7 h-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-blue-500/25 transition-all cursor-pointer animate-pulse"
                          >
                            ✓
                          </button>
                        )}

                        {!srv.esDeEstablecimiento && (
                          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                            <button 
                              onClick={() => abrirModalEditar(srv)}
                              title="Editar servicio"
                              className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors border border-sky-200 cursor-pointer shadow-2xs"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              onClick={() => {
                                setServicioAEliminar(srv);
                                setModalEliminarOpen(true);
                              }}
                              title="Eliminar servicio"
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-200 cursor-pointer shadow-2xs"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No hay servicios manuales registrados en este período.
              </div>
            )}
          </div>

          {modalConfirmarEstadoOpen && servicioAConfirmar && (
            <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
              <div className="bg-white border border-blue-200 rounded-3xl w-full max-w-xs p-6 space-y-4 shadow-2xl text-slate-900 text-center">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-inner">
                  ✓
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-blue-950 uppercase">Confirmar Cita</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ¿Estás seguro de que la cita de <strong className="text-slate-800">{servicioAConfirmar.clienteNombre || servicioAConfirmar.cliente}</strong> está correcta para cambiar su estado a <strong className="text-emerald-700">Confirmado</strong>?
                  </p>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setModalConfirmarEstadoOpen(false);
                      setServicioAConfirmar(null);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    onClick={confirmarEstadoCitaFinal}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl text-xs shadow-md transition cursor-pointer uppercase tracking-wide"
                  >
                    Sí, Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-xl relative z-10">
          <div className="p-4 border-b border-sky-100 flex justify-between items-center bg-gradient-to-r from-sky-50/80 to-blue-50/80">
            <h3 className="text-xs font-black text-blue-950 uppercase flex items-center gap-2">
              <Home size={15} className="text-blue-700" /> Domicilios con Estado Finalizado
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-950 px-3 py-1 rounded-full font-black border border-blue-200 shadow-2xs">
              {diasAgrupadosDomicilios.length} días activos
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {loadingCitas ? (
              <div className="py-12 text-center text-blue-400 text-xs font-bold animate-pulse">Buscando citas en la base de datos...</div>
            ) : diasAgrupadosDomicilios.length > 0 ? (
              diasAgrupadosDomicilios.map((grupo) => (
                <div key={grupo.fecha} className="p-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-blue-950 flex items-center gap-2 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 shadow-2xs">
                      <Calendar size={14} className="text-blue-700" /> {grupo.fecha}
                    </span>
                    <span className="text-xs font-black text-blue-900 bg-blue-100/80 px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs">
                      Total 100%: ${grupo.totalCaja.toLocaleString()} COP
                    </span>
                  </div>

                  <div className="space-y-2.5 pl-1">
                    {grupo.citas.map((cita) => (
                      <div key={cita.id} className="bg-white border border-sky-100 p-3.5 rounded-2xl text-xs flex justify-between items-center shadow-sm hover:border-sky-300 transition-all">
                        <div>
                          <p className="font-extrabold text-blue-950 flex items-center gap-1.5 text-sm">
                            <User size={13} className="text-blue-600" /> {cita.clienteNombre || cita.cliente || 'Cliente'}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            <span className="font-bold text-blue-900">{cita.servicio || 'Servicio a Domicilio'}</span> • <span className="text-blue-700 font-semibold">{cita.hora}</span>
                          </p>
                          {cita.direccion && (
                            <p className="text-[11px] text-blue-800 font-medium mt-1">📍 {cita.direccion}</p>
                          )}
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                              <CheckCircle2 size={11} /> Finalizado
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1.5">
                          <p className="text-sm font-black text-blue-950">
                            ${parsearPrecioCita(cita).toLocaleString()} COP
                          </p>
                          <button
                            onClick={() => { setCitaSeleccionadaDetalle(cita); setModalCitaDetalleOpen(true); }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md text-xs flex items-center gap-1 font-bold transition-all cursor-pointer"
                          >
                            <Eye size={13} /> Ver más
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No hay citas con estado <strong className="text-blue-900">finalizado</strong> registradas para este período.
              </div>
            )}
          </div>
        </div>
      )}

      {modalCitaDetalleOpen && citaSeleccionadaDetalle && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex justify-center items-center p-3 z-50">
          <div className="bg-white border border-sky-200 rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-bold text-blue-950 mb-3 flex items-center gap-2">
              <Home size={16} className="text-blue-700" /> Detalle Cita Domicilio (100%)
            </h3>
            <div className="space-y-2 text-xs text-slate-700 mb-4 bg-sky-50/60 p-4 rounded-2xl border border-sky-100">
              <p><strong className="text-blue-900">Cliente:</strong> {citaSeleccionadaDetalle.clienteNombre || citaSeleccionadaDetalle.cliente}</p>
              <p><strong className="text-blue-900">Servicio:</strong> {citaSeleccionadaDetalle.servicio}</p>
              <p><strong className="text-blue-900">Dirección:</strong> {citaSeleccionadaDetalle.direccion || 'No especificada'}</p>
              <p><strong className="text-blue-900">Teléfono:</strong> {citaSeleccionadaDetalle.telefono || 'No especificado'}</p>
              <p><strong className="text-blue-900">Fecha y Hora:</strong> {citaSeleccionadaDetalle.fecha} - {citaSeleccionadaDetalle.hora}</p>
              <p><strong className="text-blue-900">Estado:</strong> <span className="text-emerald-700 font-bold uppercase">{citaSeleccionadaDetalle.estado}</span></p>
              <p className="pt-2 border-t border-sky-200"><strong className="text-blue-950">Valor Total (100%):</strong> <span className="text-blue-900 font-black text-sm">${parsearPrecioCita(citaSeleccionadaDetalle).toLocaleString()} COP</span></p>
            </div>

            <button
              onClick={() => setModalCitaDetalleOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-2xl transition-all text-xs shadow-md cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {modalEliminarOpen && servicioAEliminar && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex justify-center items-center p-3 z-50">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-rose-100 border border-rose-200 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-600 shadow-inner">
              <AlertTriangle size={26} />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">¿Eliminar registro?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Estás a punto de eliminar el servicio de <strong className="text-rose-600">{servicioAEliminar.cliente}</strong> por <strong className="text-rose-600">${Number(servicioAEliminar.total).toLocaleString()}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setModalEliminarOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs border border-slate-200 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminacion}
                className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold py-2.5 rounded-2xl text-xs shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro */}
      {modalAgregarOpen && (
       <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex justify-center items-center p-3 z-50">
          <div className="bg-white border border-sky-200 rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase">Registrar Nuevo Servicio</h3>
              <button onClick={() => setModalAgregarOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleGuardarServicio} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  value={nuevoServicio.cliente}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, cliente: e.target.value })}
                  placeholder="Ej. Carlos Pérez"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-[16px] text-slate-800 focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Servicios Internos</label>
                <div className="relative mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      onClick={() => setIsOpenServicios(!isOpenServicios)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 flex items-center justify-between cursor-pointer hover:border-blue-400 shadow-inner transition-all duration-200"
                    >
                      <span className="text-xs text-slate-600 font-medium">Selecciona un servicio...</span>
                      <svg 
                        className={`w-4 h-4 text-slate-400 transition-transform duration-300 ease-out ${isOpenServicios ? 'rotate-180 text-blue-600' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpenServicios(false);
                        setModalServicioInternoOpen(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer shrink-0 z-20"
                      title="Registrar nuevo servicio interno"
                    >
                      +
                    </button>
                  </div>

                  {isOpenServicios && (
                    <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2 space-y-1.5">
                      {Array.isArray(serviciosFirebase) && serviciosFirebase.length > 0 ? (
                        serviciosFirebase
                          .filter(serv => {
                            const duracion = serv.duracion ? String(serv.duracion).toLowerCase().trim() : '';
                            const esInterno = duracion === 'interno';
                            const idDelBarberoActual = auth.currentUser?.uid; 
                            const esDelBarbero = String(serv.barberoId || serv.barberId || serv.barberoid) === String(idDelBarberoActual);
                            return esInterno && esDelBarbero;
                          })
                          .map(serv => {
                            const colorServicio = serv.color || serv.colorHex || '#3b82f6';
                            return (
                              <div
                                key={serv.id}
                                onClick={() => {
                                  const servicioId = serv.id;
                                  const yaSeleccionado = (nuevoServicio.serviciosSeleccionados || []).some(s => s.id === servicioId);
                                  
                                  if (!yaSeleccionado) {
                                    const nuevosSeleccionados = [...(nuevoServicio.serviciosSeleccionados || []), serv];
                                    const nuevoTotal = nuevosSeleccionados.reduce((acc, curr) => {
                                      const precioLimpiado = parseFloat(String(curr.precio || curr.total || 0).replace(/[^0-9.-]+/g,"")) || 0;
                                      return acc + precioLimpiado;
                                    }, 0);
                                    const nombresConcatenados = nuevosSeleccionados.map(s => s.nombre || s.servicio).join(' + ');

                                    setNuevoServicio({
                                      ...nuevoServicio,
                                      serviciosSeleccionados: nuevosSeleccionados,
                                      servicio: nombresConcatenados,
                                      total: nuevoTotal
                                    });
                                  }
                                  setIsOpenServicios(false);
                                }}
                                style={{ backgroundColor: `${colorServicio}15`, borderColor: `${colorServicio}40` }}
                                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border cursor-pointer active:scale-[0.98] transition-all group shadow-2xs"
                              >
                                <span className="font-bold text-slate-800 text-xs">
                                  {serv.nombre || serv.servicio}
                                </span>
                                <span className="font-extrabold text-xs px-2.5 py-1 rounded-lg text-white shadow-xs" style={{ backgroundColor: colorServicio }}>
                                  ${serv.precio || serv.total}
                                </span>
                              </div>
                            );
                          })
                      ) : (
                        <div className="py-4 text-center text-slate-400 text-xs">
                          No hay servicios internos registrados.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {nuevoServicio.serviciosSeleccionados && nuevoServicio.serviciosSeleccionados.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {nuevoServicio.serviciosSeleccionados.map((s, index) => (
                      <span key={s.id || index} className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-1 rounded-xl font-bold text-[10px]">
                        {s.nombre || s.servicio} (${s.precio || s.total})
                        <button
                          type="button"
                          onClick={() => {
                            const nuevosSeleccionados = nuevoServicio.serviciosSeleccionados.filter((_, i) => i !== index);
                            const nuevoTotal = nuevosSeleccionados.reduce((acc, curr) => {
                              const precioLimpiado = parseFloat(String(curr.precio || curr.total || 0).replace(/[^0-9.-]+/g,"")) || 0;
                              return acc + precioLimpiado;
                            }, 0);
                            const nombresConcatenados = nuevosSeleccionados.map(item => item.nombre || item.servicio).join(' + ');

                            setNuevoServicio({
                              ...nuevoServicio,
                              serviciosSeleccionados: nuevosSeleccionados,
                              servicio: nombresConcatenados,
                              total: nuevoTotal
                            });
                          }}
                          className="hover:text-rose-600 font-bold ml-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Total (COP)</label>
                  <input
                    type="number"
                    required
                    value={nuevoServicio.total}
                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, total: e.target.value })}
                    placeholder="Ej. 45000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-[16px] text-slate-900 focus:outline-none focus:border-blue-500 font-black text-blue-600 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">% Profesional</label>
                  <input
                    type="text"
                    readOnly
                    value={`${nuevoServicio.porcentajeBarberForm || 0}%`}
                    onClick={() => setMostrarAlertaPerfil(true)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-3 py-2 text-[16px] text-slate-600 font-black cursor-pointer select-none shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Ganancias (Calculado)</label>
                <input
                  type="text"
                  disabled
                  value={`$${gananciaCalculadaEnVivo.toLocaleString(undefined, { maximumFractionDigits: 0 })} COP`}
                  className="w-full bg-blue-50 border border-blue-200 rounded-2xl px-3 py-2 text-[16px] text-blue-900 font-black shadow-inner cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Fecha</label>
                  <input
                    type="date"
                    value={nuevoServicio.fecha || hoyStr}
                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, fecha: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-[16px] text-slate-800 focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Hora</label>
                  <input
                    type="time"
                    value={nuevoServicio.hora}
                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, hora: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-[16px] text-slate-800 focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAgregarOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl transition-all border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-sky-600 hover:opacity-95 disabled:bg-blue-300 text-white font-black py-2.5 rounded-2xl transition-all shadow-md shadow-sky-500/25 flex items-center justify-center cursor-pointer"
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalEditarOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex justify-center items-center p-3 z-50">
          <div className="bg-white border border-sky-200 rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-black text-slate-900 mb-3 uppercase">Editar Servicio</h3>
            <form onSubmit={handleActualizarServicio} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  value={formEdicion.cliente}
                  onChange={(e) => setFormEdicion({ ...formEdicion, cliente: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-[16px] text-slate-800 focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Descripción del Servicio</label>
                <input
                  type="text"
                  value={formEdicion.servicio}
                  onChange={(e) => setFormEdicion({ ...formEdicion, servicio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-[16px] text-slate-800 focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Total (COP)</label>
                  <input
                    type="number"
                    required
                    value={formEdicion.total}
                    onChange={(e) => setFormEdicion({ ...formEdicion, total: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-[16px] text-slate-800 focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">% Barbero</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formEdicion.porcentajeBarberForm}
                    onChange={(e) => setFormEdicion({ ...formEdicion, porcentajeBarberForm: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-[16px] text-slate-900 font-bold focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Ganancias (Calculado)</label>
                <input
                  type="text"
                  disabled
                  value={`$${gananciaEditCalculadaEnVivo.toLocaleString(undefined, { maximumFractionDigits: 0 })} COP`}
                  className="w-full bg-blue-50 border border-blue-200 rounded-2xl px-3 py-2 text-[16px] text-blue-900 font-black shadow-inner cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Fecha</label>
                  <input
                    type="date"
                    value={formEdicion.fecha}
                    onChange={(e) => setFormEdicion({ ...formEdicion, fecha: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-[16px] text-slate-800 focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Hora</label>
                  <input
                    type="time"
                    value={formEdicion.hora}
                    onChange={(e) => setFormEdicion({ ...formEdicion, hora: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-[16px] text-slate-800 focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEditarOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl transition-all border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-sky-600 hover:opacity-95 disabled:bg-blue-300 text-white font-black py-2.5 rounded-2xl transition-all shadow-md shadow-sky-500/25 flex items-center justify-center cursor-pointer"
                >
                  {guardando ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalServicioInternoOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[9999] flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white border-t border-sky-100 rounded-t-3xl p-6 w-full max-w-lg mx-auto shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
            
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4"></div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-slate-900">✨ Nuevo Servicio Interno</h3>
              <button 
                type="button"
                onClick={() => setModalServicioInternoOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await addDoc(collection(db, "servicios"), {
                    nombre: nuevoServicioInterno.nombre.toUpperCase(),
                    precio: String(nuevoServicioInterno.precio),
                    color: nuevoServicioInterno.color,
                    duracion: "interno",
                    categoria: "servicio",
                    barberoId: auth.currentUser?.uid || ""
                  });

                  setModalServicioInternoOpen(false);
                  setNuevoServicioInterno({ nombre: '', precio: '', color: '#3a87fe' });
                } catch (error) {
                  console.error("Error al guardar el servicio interno en Firebase:", error);
                }
              }} 
              className="space-y-3.5 text-xs pb-4"
            >
              <div>
                <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Nombre del Servicio</label>
                <input
                  type="text"
                  required
                  value={nuevoServicioInterno.nombre}
                  onChange={(e) => setNuevoServicioInterno({ ...nuevoServicioInterno, nombre: e.target.value })}
                  placeholder="Ej. Corte Especial / Mantenimiento"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 text-xs font-bold shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Precio (COP)</label>
                  <input
                    type="number"
                    required
                    value={nuevoServicioInterno.precio}
                    onChange={(e) => setNuevoServicioInterno({ ...nuevoServicioInterno, precio: e.target.value })}
                    placeholder="Ej. 20000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-black text-emerald-600 text-xs shadow-inner"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 uppercase text-[10px]">Color Distintivo</label>
                  <input
                    type="color"
                    value={nuevoServicioInterno.color}
                    onChange={(e) => setNuevoServicioInterno({ ...nuevoServicioInterno, color: e.target.value })}
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-2xl px-1.5 py-1 cursor-pointer shadow-inner"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setModalServicioInternoOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition-all border border-slate-200 cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl transition-all shadow-md shadow-emerald-500/25 cursor-pointer text-xs uppercase"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Egresos */}
      {modalEgresosAbierto && (
       <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-rose-600 uppercase flex items-center gap-2">
                💸 Gestión de Egresos
              </h3>
              <button 
                onClick={() => {
                  setModalEgresosAbierto(false);
                  setEditandoEgresoId(null);
                  setNuevoEgresoNombre('');
                  setNuevoEgresoMonto('');
                }} 
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 p-3.5 rounded-2xl space-y-2.5">
              <h4 className="text-[10px] font-black text-rose-900 uppercase">
                {editandoEgresoId ? '✏️ Editar Egreso' : 'Registrar Nuevo Egreso'}
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <input 
                  type="text" 
                  placeholder="Concepto (Ej: Insumos)" 
                  value={nuevoEgresoNombre || ''} 
                  onChange={e => setNuevoEgresoNombre(e.target.value)}
                  className="bg-white border border-rose-200 rounded-xl p-2.5 text-[16px] text-slate-900 outline-none font-medium shadow-inner"
                />
                <input 
                  type="number" 
                  placeholder="Monto COP" 
                  value={nuevoEgresoMonto || ''} 
                  onChange={e => setNuevoEgresoMonto(e.target.value)}
                  className="bg-white border border-rose-200 rounded-xl p-2.5 text-[16px] text-slate-900 outline-none font-bold text-rose-600 shadow-inner"
                />
              </div>
              <div className="flex gap-2 pt-1">
                {editandoEgresoId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoEgresoId(null);
                      setNuevoEgresoNombre('');
                      setNuevoEgresoMonto('');
                    }}
                    className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl text-[10px] uppercase transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    if (!nuevoEgresoNombre || !nuevoEgresoMonto) {
                      alert('Ingresa el concepto y el monto del egreso.');
                      return;
                    }
                    try {
                      if (editandoEgresoId) {
                        await updateDoc(doc(db, 'egresos', editandoEgresoId), {
                          nombre: nuevoEgresoNombre,
                          monto: Number(nuevoEgresoMonto)
                        });
                        alert('¡Egreso actualizado con éxito!');
                        setEditandoEgresoId(null);
                      } else {
                        const currentUser = auth.currentUser;
                        if (!currentUser) {
                          alert('No hay una sesión activa.');
                          return;
                        }
                        await addDoc(collection(db, 'egresos'), {
                          barberoId: currentUser.uid,
                          nombre: nuevoEgresoNombre,
                          monto: Number(nuevoEgresoMonto),
                          fechaHora: new Date().toISOString()
                        });
                        alert('¡Egreso guardado con éxito!');
                      }
                      setNuevoEgresoNombre('');
                      setNuevoEgresoMonto('');
                    } catch (err) {
                      console.error(err);
                      alert('Error al guardar el egreso.');
                    }
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase shadow-md shadow-rose-500/20 transition cursor-pointer"
                >
                  {editandoEgresoId ? 'Actualizar' : 'Guardar Egreso'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-700 uppercase">Historial de Egresos</h4>
              <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-2xl shadow-inner">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0 text-[10px]">
                    <tr>
                      <th className="p-2.5">Concepto</th>
                      <th className="p-2.5">Monto</th>
                      <th className="p-2.5">Fecha / Hora</th>
                      <th className="p-2.5 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {listaEgresos && listaEgresos.length > 0 ? (
                      listaEgresos.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{item.nombre}</td>
                          <td className="p-2.5 text-rose-600 font-black">-${Number(item.monto || 0).toLocaleString()}</td>
                          <td className="p-2.5 text-slate-400 text-[9px]">{item.fechaHora ? new Date(item.fechaHora).toLocaleString() : 'N/A'}</td>
                          <td className="p-2.5 flex items-center justify-center gap-1.5">
                            <button 
                              type="button"
                              onClick={() => {
                                setEditandoEgresoId(item.id);
                                setNuevoEgresoNombre(item.nombre);
                                setNuevoEgresoMonto(item.monto);
                              }}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded-xl font-bold cursor-pointer text-[10px]"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button 
                              type="button"
                              onClick={async () => {
                                if (window.confirm('¿Estás seguro de eliminar este egreso?')) {
                                  try {
                                    await deleteDoc(doc(db, 'egresos', item.id));
                                    alert('Egreso eliminado');
                                  } catch (err) {
                                    console.error(err);
                                    alert('Error al eliminar');
                                  }
                                }
                              }}
                              className="bg-rose-100 hover:bg-rose-200 text-rose-900 px-2.5 py-1 rounded-xl font-bold cursor-pointer text-[10px]"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-6 text-center text-slate-400 italic text-[11px]">No hay egresos registrados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Propinas */}
      {modalPropinasAbierto && (
       <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-emerald-600 uppercase flex items-center gap-2">
                ✨ Gestión de Propinas
              </h3>
              <button 
                onClick={() => {
                  setModalPropinasAbierto(false);
                  setEditandoPropinaId(null);
                  setNuevaPropinaNota('');
                  setNuevaPropinaMonto('');
                }} 
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-3">
              <h4 className="text-[11px] font-black text-emerald-900 uppercase">
                {editandoPropinaId ? '✏️ Editar Propina' : 'Registrar Nueva Propina'}
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <input 
                  type="text" 
                  placeholder="Cliente / Nota (Opcional)" 
                  value={nuevaPropinaNota || ''} 
                  onChange={e => setNuevaPropinaNota(e.target.value)}
                  className="bg-white border border-emerald-200 rounded-xl p-2.5 text-[16px] text-slate-900 outline-none font-medium shadow-inner"
                />
                <input 
                  type="number" 
                  placeholder="Monto COP" 
                  value={nuevaPropinaMonto || ''} 
                  onChange={e => setNuevaPropinaMonto(e.target.value)}
                  className="bg-white border border-emerald-200 rounded-xl p-2.5 text-[16px] text-slate-900 outline-none font-bold text-emerald-600 shadow-inner"
                />
              </div>
              <div className="flex gap-2 pt-1">
                {editandoPropinaId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoPropinaId(null);
                      setNuevaPropinaNota('');
                      setNuevaPropinaMonto('');
                    }}
                    className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl text-xs uppercase transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    if (!nuevaPropinaMonto) {
                      alert('Ingresa el monto de la propina.');
                      return;
                    }
                    try {
                      if (editandoPropinaId) {
                        await updateDoc(doc(db, 'propinas', editandoPropinaId), {
                          nota: nuevaPropinaNota || 'Propina general',
                          monto: Number(nuevaPropinaMonto)
                        });
                        alert('¡Propina actualizada con éxito!');
                        setEditandoPropinaId(null);
                      } else {
                        const currentUser = auth.currentUser;
                        if (!currentUser) {
                          alert('No hay una sesión activa.');
                          return;
                        }
                        await addDoc(collection(db, 'propinas'), {
                          barberoId: currentUser.uid,
                          nota: nuevaPropinaNota || 'Propina general',
                          monto: Number(nuevaPropinaMonto),
                          fechaHora: new Date().toISOString()
                        });
                        alert('¡Propina guardada con éxito!');
                      }
                      setNuevaPropinaNota('');
                      setNuevaPropinaMonto('');
                    } catch (err) {
                      console.error(err);
                      alert('Error al guardar la propina.');
                    }
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  {editandoPropinaId ? 'Actualizar Propina' : 'Guardar Propina'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-slate-700 uppercase">Historial de Propinas</h4>
              <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-2xl shadow-inner">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0">
                    <tr>
                      <th className="p-2.5">Nota / Cliente</th>
                      <th className="p-2.5">Monto</th>
                      <th className="p-2.5">Fecha / Hora</th>
                      <th className="p-2.5 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {listaPropinas && listaPropinas.length > 0 ? (
                      listaPropinas.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{item.nota}</td>
                          <td className="p-2.5 text-emerald-600 font-black">+${Number(item.monto || 0).toLocaleString()}</td>
                          <td className="p-2.5 text-slate-400 text-[10px]">{item.fechaHora ? new Date(item.fechaHora).toLocaleString() : 'N/A'}</td>
                          <td className="p-2.5 flex items-center justify-center gap-1.5">
                            <button 
                              type="button"
                              onClick={() => {
                                setEditandoPropinaId(item.id);
                                setNuevaPropinaNota(item.nota);
                                setNuevaPropinaMonto(item.monto);
                              }}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded-xl font-bold cursor-pointer text-xs"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button 
                              type="button"
                              onClick={async () => {
                                if (window.confirm('¿Estás seguro de eliminar esta propina?')) {
                                  try {
                                    await deleteDoc(doc(db, 'propinas', item.id));
                                    alert('Propina eliminada');
                                  } catch (err) {
                                    console.error(err);
                                    alert('Error al eliminar');
                                  }
                                }
                              }}
                              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-xl font-bold cursor-pointer text-xs"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-6 text-center text-slate-400 italic">No hay propinas registradas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerta flotante perfil */}
      {mostrarAlertaPerfil && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 z-50">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <p className="text-xs font-medium">
              Para editar el porcentaje, dirígete a la sección de <strong className="text-blue-400">Perfil</strong>.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setMostrarAlertaPerfil(false)}
            className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
};

export default Wallet;