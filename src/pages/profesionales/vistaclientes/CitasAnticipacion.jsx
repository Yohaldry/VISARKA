import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { Calendar, Clock, Scissors, CheckCircle2, Loader2, RotateCcw, Sparkles, MapPin, X } from 'lucide-react';
import { db } from '../../../components/firebase';

const VISARKA_LOGO = 'https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png';

const parsePrecioNumero = (val) => {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (!val) return null;
  const digits = String(val).replace(/[^\d]/g, '');
  if (!digits) return null;
  const num = Number(digits);
  return Number.isNaN(num) ? null : num;
};

const hoyLocalStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const esServicioExterno = (srv = {}) =>
  !String(srv.duracion || srv.categoria || srv.nombre || '').toLowerCase().includes('interno');

const tieneServiciosEnLineaActivos = (prof = {}) => {
  const flags = [
    prof.serviciosEnLinea,
    prof.servicioEnLinea,
    prof.enLinea,
    prof.online,
    prof.serviciosOnline,
    prof.servicioOnline,
    prof.disponibleEnLinea
  ];
  return flags.some((val) => val === true);
};

const obtenerNombreCompletoProfesional = (prof = {}) => {
  const combinado = [prof.nombres, prof.apellidos].filter(Boolean).join(' ').trim();
  return combinado || prof.nombreCompleto || prof.nombre || 'Profesional';
};

const obtenerZonasProfesional = (prof = {}) => {
  if (Array.isArray(prof.zonasTrabajo) && prof.zonasTrabajo.length) {
    return prof.zonasTrabajo.filter(Boolean);
  }
  if (Array.isArray(prof.zonas) && prof.zonas.length) {
    return prof.zonas.filter(Boolean);
  }
  return [prof.localidad, prof.zona, prof.ciudad].filter(Boolean);
};

const normalizarTexto = (t = '') =>
  String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

const coincideConZona = (prof, filtroZona) => {
  const obj = normalizarTexto(filtroZona);
  if (!obj) return true;
  const zonas = obtenerZonasProfesional(prof);
  return zonas.some((z) => {
    const zn = normalizarTexto(z);
    return zn.includes(obj) || obj.includes(zn);
  });
};

export default function CitasAnticipacion() {
  const [profesionales, setProfesionales] = useState([]);
  const [todosLosServicios, setTodosLosServicios] = useState([]);
  const [todosLosSlots, setTodosLosSlots] = useState([]);
  const [todasLasCitas, setTodasLasCitas] = useState([]);
  const [cargandoDisponibilidadGeneral, setCargandoDisponibilidadGeneral] = useState(true);

  const [mesSeleccionadoKey, setMesSeleccionadoKey] = useState(() => {
    const ahora = new Date();
    return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  });

  const [profesionalSel, setProfesionalSel] = useState(null);
  const [modalAgendarAbierto, setModalAgendarAbierto] = useState(false);

  const [serviciosProf, setServiciosProf] = useState([]);
  const [serviciosElegidos, setServiciosElegidos] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(false);

  const [slotsDisp, setSlotsDisp] = useState([]);
  const [citasProf, setCitasProf] = useState([]);
  const [cargandoAgenda, setCargandoAgenda] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(() => {
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  });
  const [fechaSel, setFechaSel] = useState('');
  const [horaSel, setHoraSel] = useState('');

  const [nombreCliente, setNombreCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [zona, setZona] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [agendando, setAgendando] = useState(false);
  const [citaAgendada, setCitaAgendada] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'profesionales'), (snap) => {
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProfesionales(lista);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let srvListos = false;
    let slotsListos = false;
    let citasListas = false;

    const revisarListos = () => {
      if (srvListos && slotsListos && citasListas) {
        setCargandoDisponibilidadGeneral(false);
      }
    };

    const unsubSrv = onSnapshot(collection(db, 'servicios'), (snap) => {
      setTodosLosServicios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      srvListos = true;
      revisarListos();
    });

    const unsubSlots = onSnapshot(collection(db, 'calendarioprofesionales'), (snap) => {
      setTodosLosSlots(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      slotsListos = true;
      revisarListos();
    });

    const unsubCitas = onSnapshot(collection(db, 'citas'), (snap) => {
      setTodasLasCitas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      citasListas = true;
      revisarListos();
    });

    return () => {
      unsubSrv();
      unsubSlots();
      unsubCitas();
    };
  }, []);

  const opcionesMeses = useMemo(() => {
    const hoy = hoyLocalStr();
    const mesesSet = new Set();

    const ahora = new Date();
    const mesActualKey = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
    mesesSet.add(mesActualKey);

    todosLosSlots.forEach((sl) => {
      if (!sl.fecha || sl.fecha < hoy || sl.ocupado) return;
      const ocupada = todasLasCitas.some(
        (c) =>
          c.fecha === sl.fecha &&
          String(c.hora || '').toLowerCase() === String(sl.hora || '').toLowerCase() &&
          String(c.estado || '').toLowerCase() !== 'cancelada'
      );
      if (!ocupada) {
        mesesSet.add(sl.fecha.slice(0, 7));
      }
    });

    return Array.from(mesesSet)
      .sort()
      .map((key) => {
        const [y, m] = key.split('-').map(Number);
        const fechaObj = new Date(y, m - 1, 1);
        const label = fechaObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        return { key, label: label.charAt(0).toUpperCase() + label.slice(1) };
      });
  }, [todosLosSlots, todasLasCitas]);

  useEffect(() => {
    if (opcionesMeses.length && !opcionesMeses.some((o) => o.key === mesSeleccionadoKey)) {
      setMesSeleccionadoKey(opcionesMeses[0].key);
    }
  }, [opcionesMeses, mesSeleccionadoKey]);

  const zonaFiltro = zona.trim() || direccion.trim();

  const profesionalesConHorasEnMes = useMemo(() => {
    const hoy = hoyLocalStr();

    const conHoras = profesionales.filter((prof) => {
      if (tieneServiciosEnLineaActivos(prof)) return false;

      const pid = String(prof.barberoId || prof.id);
      const tieneExternos = todosLosServicios.some(
        (s) => String(s.barberoId || s.profesionalId || '') === pid && esServicioExterno(s)
      );
      if (!tieneExternos) return false;

      return todosLosSlots.some((sl) => {
        if (!sl.fecha || sl.fecha < hoy || sl.ocupado) return false;
        const slotPid = String(sl.barberoId || sl.profesionalId || '');
        if (slotPid !== pid) return false;
        if (mesSeleccionadoKey && !sl.fecha.startsWith(mesSeleccionadoKey)) return false;

        const ocupada = todasLasCitas.some(
          (c) =>
            c.fecha === sl.fecha &&
            String(c.hora || '').toLowerCase() === String(sl.hora || '').toLowerCase() &&
            String(c.estado || '').toLowerCase() !== 'cancelada' &&
            String(c.barberoId || c.profesionalId || '') === pid
        );
        return !ocupada;
      });
    });

    if (!zonaFiltro) return conHoras;
    const enZona = conHoras.filter((p) => coincideConZona(p, zonaFiltro));
    return enZona.length ? enZona : conHoras;
  }, [profesionales, todosLosServicios, todosLosSlots, todasLasCitas, mesSeleccionadoKey, zonaFiltro]);

  const abrirModalProfesional = async (prof) => {
    const pid = prof.barberoId || prof.id;
    setProfesionalSel(prof);
    setModalAgendarAbierto(true);
    setFechaSel('');
    setHoraSel('');
    setServiciosElegidos([]);
    setCitaAgendada(null);
    setErrorMsg('');
    setCargandoServicios(true);
    setCargandoAgenda(true);

    const [yMes, mMes] = mesSeleccionadoKey.split('-').map(Number);
    setMesCalendario(new Date(yMes, mMes - 1, 1));

    try {
      const [srvSnap, dispSnap, citasSnap] = await Promise.all([
        getDocs(query(collection(db, 'servicios'), where('barberoId', '==', pid))),
        getDocs(query(collection(db, 'calendarioprofesionales'), where('barberoId', '==', pid))),
        getDocs(query(collection(db, 'citas'), where('barberoId', '==', pid)))
      ]);

      const listaSrv = [];
      srvSnap.forEach((d) => {
        const s = d.data();
        if (esServicioExterno(s)) {
          const p = parsePrecioNumero(s.precioNum ?? s.precio ?? s.precioText ?? s.valor) ?? 35000;
          listaSrv.push({
            id: d.id,
            nombre: s.nombre || s.name || 'Servicio',
            precioNum: p,
            precio: s.precioText || `$${p.toLocaleString('es-CO')} COP`
          });
        }
      });
      setServiciosProf(listaSrv);
      if (listaSrv.length > 0) setServiciosElegidos([listaSrv[0]]);

      const slots = dispSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const citas = citasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSlotsDisp(slots);
      setCitasProf(citas);

      const hoy = hoyLocalStr();
      const fechasDisponibles = Array.from(
        new Set(
          slots
            .filter((sl) => sl.fecha >= hoy && !sl.ocupado)
            .filter(
              (sl) =>
                !citas.some(
                  (c) =>
                    c.fecha === sl.fecha &&
                    String(c.hora || '').toLowerCase() === String(sl.hora || '').toLowerCase() &&
                    String(c.estado || '').toLowerCase() !== 'cancelada'
                )
            )
            .map((sl) => sl.fecha)
        )
      ).sort();

      const enMesElegido = fechasDisponibles.filter((f) => f.startsWith(mesSeleccionadoKey));
      const primeraFecha = enMesElegido[0] || fechasDisponibles[0];

      if (primeraFecha) {
        setFechaSel(primeraFecha);
        const [y, m] = primeraFecha.split('-').map(Number);
        setMesCalendario(new Date(y, m - 1, 1));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo cargar la agenda y servicios del profesional.');
    } finally {
      setCargandoServicios(false);
      setCargandoAgenda(false);
    }
  };

  const fechasConDisponibilidadSet = useMemo(() => {
    const hoy = hoyLocalStr();
    const setFechas = new Set();
    slotsDisp.forEach((sl) => {
      if (!sl.fecha || sl.fecha < hoy || sl.ocupado) return;
      const ocupada = citasProf.some(
        (c) =>
          c.fecha === sl.fecha &&
          String(c.hora || '').toLowerCase() === String(sl.hora || '').toLowerCase() &&
          String(c.estado || '').toLowerCase() !== 'cancelada'
      );
      if (!ocupada) setFechas.add(sl.fecha);
    });
    return setFechas;
  }, [slotsDisp, citasProf]);

  const diasCalendarioMes = useMemo(() => {
    const y = mesCalendario.getFullYear();
    const m = mesCalendario.getMonth();
    const firstDay = new Date(y, m, 1).getDay() - 1;
    const totalDays = new Date(y, m + 1, 0).getDate();
    const celdas = Array(firstDay < 0 ? 6 : firstDay).fill({ vacio: true });
    for (let i = 1; i <= totalDays; i++) {
      const fechaStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      celdas.push({
        vacio: false,
        diaMes: i,
        fechaStr,
        disponible: fechasConDisponibilidadSet.has(fechaStr)
      });
    }
    return celdas;
  }, [mesCalendario, fechasConDisponibilidadSet]);

  const horasDisponiblesEnFecha = useMemo(() => {
    const hoy = hoyLocalStr();
    if (!fechaSel || fechaSel < hoy) return [];
    return slotsDisp
      .filter((sl) => sl.fecha === fechaSel && !sl.ocupado)
      .filter(
        (sl) =>
          !citasProf.some(
            (c) =>
              c.fecha === fechaSel &&
              String(c.hora || '').toLowerCase() === String(sl.hora || '').toLowerCase() &&
              String(c.estado || '').toLowerCase() !== 'cancelada'
          )
      );
  }, [slotsDisp, citasProf, fechaSel]);

  const toggleServicio = (srv) => {
    setErrorMsg('');
    setServiciosElegidos((prev) =>
      prev.some((item) => item.nombre === srv.nombre)
        ? prev.filter((item) => item.nombre !== srv.nombre)
        : [...prev, srv]
    );
  };

  const totalServiciosNum = useMemo(
    () => serviciosElegidos.reduce((acc, s) => acc + (parsePrecioNumero(s.precioNum ?? s.precio) ?? 35000), 0),
    [serviciosElegidos]
  );

  const handleAgendarCita = async (e) => {
    e.preventDefault();
    if (!profesionalSel) return setErrorMsg('Selecciona un profesional.');
    if (!serviciosElegidos.length) return setErrorMsg('Elige al menos un servicio.');
    if (!fechaSel || fechaSel < hoyLocalStr()) return setErrorMsg('Selecciona un día disponible en verde.');
    if (!horaSel) return setErrorMsg('Selecciona una hora disponible.');
    if (!nombreCliente.trim()) return setErrorMsg('Escribe tu nombre y apellido.');
    if (!telefono.trim()) return setErrorMsg('Escribe tu teléfono.');

    setAgendando(true);
    setErrorMsg('');

    try {
      const pid = profesionalSel.barberoId || profesionalSel.id;
      const pNombre = obtenerNombreCompletoProfesional(profesionalSel);

      const serviciosLimpios = serviciosElegidos.map((s) => {
        const precioNum = parsePrecioNumero(s.precioNum ?? s.precio) ?? 35000;
        return {
          nombre: s.nombre,
          precioNum,
          precio: s.precio || `$${precioNum.toLocaleString('es-CO')} COP`
        };
      });

      const precioTotal = `$${totalServiciosNum.toLocaleString('es-CO')} COP`;

      const citaPayload = {
        barberoId: pid,
        profesionalId: pid,
        profesionalNombre: pNombre,
        nombreCliente: nombreCliente.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        zona: zona.trim() || direccion.trim(),
        servicios: serviciosLimpios,
        precioTotal,
        descripcion: descripcion.trim(),
        fecha: fechaSel,
        hora: horaSel,
        estado: 'confirmada',
        tipoReserva: 'anticipacion',
        creadoEn: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'citas'), citaPayload);

      const slotDocId = `${pid}_${fechaSel}_${horaSel.replace(/\s+/g, '_')}`;
      try {
        await updateDoc(doc(db, 'calendarioprofesionales', slotDocId), { ocupado: true });
      } catch (_) {}

      setCitaAgendada({ id: docRef.id, ...citaPayload });
      setCitasProf((prev) => [...prev, { id: docRef.id, ...citaPayload }]);
      setHoraSel('');
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo agendar la cita. Intenta nuevamente.');
    } finally {
      setAgendando(false);
    }
  };

  const cerrarModal = () => {
    setModalAgendarAbierto(false);
    setCitaAgendada(null);
    setHoraSel('');
    setErrorMsg('');
  };

  const resetearTodo = () => {
    setCitaAgendada(null);
    setHoraSel('');
    setDescripcion('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-slate-900 flex flex-col relative overflow-x-hidden">
      <div className="fixed top-0 left-1/4 w-[520px] h-[520px] bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[520px] h-[520px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <header className="w-full border-b border-white/10 bg-slate-950/75 backdrop-blur-xl sticky top-0 z-20">
        <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={VISARKA_LOGO} alt="VISARKA Logo" className="h-8 w-auto object-contain" />
            <span className="text-sm sm:text-base font-black tracking-widest text-white">VISARKA</span>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-200 border border-blue-400/35 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Citas con anticipación
          </span>
        </div>
      </header>

      <main className="w-full flex-1 px-4 sm:px-8 py-6 sm:py-8 relative z-10">
        <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-slate-950/30 space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-300">
                  Agenda Visarka
                </span>
              </div>
              <h1 className="text-sm sm:text-lg font-black tracking-tight">
                Estos son los profesionales con días disponibles
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold">
                <Calendar className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <select
                  value={mesSeleccionadoKey}
                  onChange={(e) => setMesSeleccionadoKey(e.target.value)}
                  className="bg-transparent text-white font-black outline-none cursor-pointer capitalize"
                >
                  {opcionesMeses.map((op) => (
                    <option key={op.key} value={op.key} className="bg-slate-900 text-white">
                      {op.label}
                    </option>
                  ))}
                </select>
              </label>

              <span className="text-[10px] sm:text-xs font-bold bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl">
                {zonaFiltro ? `Zona: ${zonaFiltro}` : 'Todas las zonas'}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-blue-600" /> Profesionales con horas disponibles
            </label>

            {cargandoDisponibilidadGeneral ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-6 justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Consultando disponibilidad...
              </div>
            ) : profesionalesConHorasEnMes.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
                No hay profesionales con horas disponibles para el mes seleccionado.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {profesionalesConHorasEnMes.map((prof) => {
                  const nombreCompleto = obtenerNombreCompletoProfesional(prof);
                  const foto = prof.foto || prof.fotoUrl || prof.avatar || prof.imagen || VISARKA_LOGO;
                  const zonasCubre = obtenerZonasProfesional(prof);

                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => abrirModalProfesional(prof)}
                      className="w-full p-3.5 sm:p-4 rounded-2xl border text-left flex flex-col sm:flex-row sm:items-center gap-3 transition cursor-pointer bg-white hover:bg-blue-50/40 text-slate-900 border-slate-200 hover:border-blue-500 shadow-2xs hover:shadow-md"
                    >
                      <img
                        src={foto}
                        alt={nombreCompleto}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-blue-400/30 bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="text-xs sm:text-sm font-black truncate text-slate-900">
                            {nombreCompleto}
                          </p>
                          <span className="text-[9px] sm:text-[10px] font-black bg-emerald-500/15 text-emerald-700 border border-emerald-400/40 px-2 py-0.5 rounded-full shrink-0">
                            Disponible
                          </span>
                        </div>
                        <div className="flex items-start gap-1 text-[10px] sm:text-xs text-slate-600">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-600" />
                          <span className="line-clamp-2">
                            {zonasCubre.length > 0 ? `Cubre: ${zonasCubre.join(', ')}` : 'Zonas por confirmar'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {modalAgendarAbierto && profesionalSel && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-5 py-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={profesionalSel.foto || profesionalSel.fotoUrl || profesionalSel.avatar || profesionalSel.imagen || VISARKA_LOGO}
                  alt={obtenerNombreCompletoProfesional(profesionalSel)}
                  className="w-10 h-10 rounded-xl object-cover border border-white/20 bg-white shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">Agendar cita</p>
                  <h2 className="text-sm sm:text-base font-black truncate">
                    {obtenerNombreCompletoProfesional(profesionalSel)}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={cerrarModal}
                aria-label="Cerrar modal"
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {citaAgendada ? (
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900">¡Cita agendada con éxito!</h3>
                    <p className="text-xs text-slate-600">
                      Ya quedó registrada en el calendario de <strong className="text-slate-900">{citaAgendada.profesionalNombre}</strong>.
                    </p>
                  </div>
                  <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-left text-xs space-y-1.5 text-slate-700">
                    <p><strong>Cliente:</strong> {citaAgendada.nombreCliente}</p>
                    <p><strong>Fecha:</strong> {citaAgendada.fecha}</p>
                    <p><strong>Hora:</strong> {citaAgendada.hora}</p>
                    <p><strong>Servicios:</strong> {citaAgendada.servicios.map((s) => s.nombre).join(', ')}</p>
                    <p className="font-black text-blue-700 pt-1">Total: {citaAgendada.precioTotal}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={resetearTodo}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs py-3 rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Agendar otra cita
                    </button>
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs py-3 rounded-2xl cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAgendarCita} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                      1. Elige los servicios
                    </label>
                    {cargandoServicios ? (
                      <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Cargando servicios...
                      </div>
                    ) : serviciosProf.length === 0 ? (
                      <p className="text-xs text-slate-400">Sin servicios registrados para este profesional.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {serviciosProf.map((srv) => {
                          const sel = serviciosElegidos.some((item) => item.nombre === srv.nombre);
                          return (
                            <button
                              key={srv.id}
                              type="button"
                              onClick={() => toggleServicio(srv)}
                              className={`p-2.5 rounded-2xl border text-left text-xs flex items-center justify-between transition cursor-pointer ${
                                sel
                                  ? 'bg-blue-50 border-blue-600 font-black text-blue-950'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="truncate">{srv.nombre}</span>
                              <span className="text-blue-600 font-bold ml-2 shrink-0">{srv.precio}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {serviciosElegidos.length > 0 && (
                      <p className="text-xs font-black text-right text-blue-700">
                        Total estimado: ${totalServiciosNum.toLocaleString('es-CO')} COP
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" /> 2. Calendario de disponibilidad
                      </label>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Días disponibles
                      </span>
                    </div>

                    {cargandoAgenda ? (
                      <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Consultando calendario...
                      </div>
                    ) : (
                      <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs sm:text-sm font-black text-slate-800 capitalize">
                            {mesCalendario.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setMesCalendario(new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() - 1, 1))}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-black cursor-pointer"
                            >
                              &lt;
                            </button>
                            <button
                              type="button"
                              onClick={() => setMesCalendario(new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() + 1, 1))}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-black cursor-pointer"
                            >
                              &gt;
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400">
                          {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((d) => (
                            <span key={d}>{d}</span>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1.5">
                          {diasCalendarioMes.map((celda, idx) => {
                            if (celda.vacio) return <div key={idx} className="h-10" />;
                            const isSel = fechaSel === celda.fechaStr;
                            return (
                              <button
                                key={celda.fechaStr}
                                type="button"
                                disabled={!celda.disponible}
                                onClick={() => {
                                  setFechaSel(celda.fechaStr);
                                  setHoraSel('');
                                  setErrorMsg('');
                                }}
                                className={`h-10 rounded-xl flex flex-col items-center justify-center border text-xs transition-all ${
                                  isSel
                                    ? 'bg-slate-900 text-white border-slate-900 font-black shadow-md scale-105 cursor-pointer'
                                    : celda.disponible
                                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 font-black shadow-2xs cursor-pointer'
                                      : 'bg-white text-slate-300 border-slate-200/70 cursor-not-allowed'
                                }`}
                              >
                                <span>{celda.diaMes}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {fechaSel && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" /> 3. Horas disponibles para {fechaSel}
                      </label>
                      {horasDisponiblesEnFecha.length === 0 ? (
                        <p className="text-xs text-slate-400">No quedan horas libres en esta fecha.</p>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {horasDisponiblesEnFecha.map((sl) => (
                            <button
                              key={sl.id}
                              type="button"
                              onClick={() => {
                                setHoraSel(sl.hora);
                                setErrorMsg('');
                              }}
                              className={`py-2 px-2.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                                horaSel === sl.hora
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-emerald-50'
                              }`}
                            >
                              {sl.hora}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2.5 pt-1 border-t border-slate-100">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                      4. Tus datos para confirmar la cita
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={nombreCliente}
                        onChange={(e) => setNombreCliente(e.target.value)}
                        placeholder="Nombre y apellido"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl px-4 py-2.5 text-sm outline-none"
                      />
                      <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="Teléfono (Ej: +57 300 000 0000)"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl px-4 py-2.5 text-sm outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        placeholder="Dirección"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl px-3.5 py-2.5 text-sm outline-none"
                      />
                      <input
                        type="text"
                        value={zona}
                        onChange={(e) => setZona(e.target.value)}
                        placeholder="Zona o localidad"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl px-3.5 py-2.5 text-sm outline-none"
                      />
                    </div>
                    <textarea
                      rows="2"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Notas adicionales para el profesional (opcional)"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl px-3.5 py-2 text-xs outline-none resize-none"
                    />
                  </div>

                  {errorMsg && <p className="text-xs text-rose-600 font-bold">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={agendando}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm py-3 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {agendando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Agendando cita...
                      </>
                    ) : (
                      'Confirmar cita con anticipación'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}