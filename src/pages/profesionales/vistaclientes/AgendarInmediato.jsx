import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { Bot, Scissors, Radar, ArrowRight, ArrowLeft, CheckCircle2, Loader2, RotateCcw, XCircle } from 'lucide-react';
import { db } from '../../../components/firebase';

const VISARKA_LOGO = 'https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png';
const SERVICIOS_DISPONIBLES = ['Corte Clásico', 'Fade / Degradado', 'Perfilado de Barba', 'Barba + Toalla Caliente', 'Corte + Barba', 'Diseño de Cejas', 'Color / Pigmentación', 'Freestyle / Diseño'];
const ZONAS_RAPIDAS = ['Usaquén', 'Suba', 'Chapinero', 'Engativá', 'Kennedy', 'Teusaquillo', 'Barrios Unidos', 'Fontibón', 'Soacha'];
const MOTIVOS_CANCELACION = [
  'Demora del profesional',
  'Cambio de planes',
  'Ya no necesito el servicio',
  'Precio no ajustado',
  'Problema de ubicación o acceso',
  'Emergencia personal',
  'Equivocación en el servicio elegido',
  'Encontré disponibilidad más rápido',
  'No hubo respuesta del profesional',
  'Clima o tráfico',
  'Otro'
];

const normalizarTexto = (t = '') => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const estaEnLocalidad = (prof, loc) => {
  const obj = normalizarTexto(loc);
  if (!obj) return true;
  const zonas = Array.isArray(prof.zonasTrabajo) ? prof.zonasTrabajo : [];
  if (zonas.some((z) => { const zn = normalizarTexto(z); return zn.includes(obj) || obj.includes(zn); })) return true;
  return [prof.localidad, prof.zona, prof.ciudad].filter(Boolean).map(normalizarTexto).some((c) => c.includes(obj) || obj.includes(c));
};

const esProfesionalRealmenteActivo = (data = {}) => {
  if (data.activodomicilios === false || data.activoEnLinea === false || data.activo === false) return false;
  if (typeof data.activodomicilios === 'boolean') return data.activodomicilios;
  if (typeof data.activoEnLinea === 'boolean') return data.activoEnLinea;
  return true;
};

export default function AgendarInmediato() {
  const [paso, setPaso] = useState(1);
  const [direccionAnim, setDireccionAnim] = useState('adelante');
  const [animKey, setAnimKey] = useState(0);
  const [nombreApellido, setNombreApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [zonaCliente, setZonaCliente] = useState('');
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState(['Corte + Barba']);
  const [descripcionNecesidad, setDescripcionNecesidad] = useState('');
  const [profesionalesActivos, setProfesionalesActivos] = useState([]);
  const [solicitudId, setSolicitudId] = useState(null);
  const [profesionalAsignadoId, setProfesionalAsignadoId] = useState(null);
  const [profesionalAsignadoNombre, setProfesionalAsignadoNombre] = useState('');
  const [solicitudAceptada, setSolicitudAceptada] = useState(false);
  const [enviandoAProfesionalId, setEnviandoAProfesionalId] = useState(null);
  const [modalServiciosProf, setModalServiciosProf] = useState(null);
  const [serviciosExternosProf, setServiciosExternosProf] = useState([]);
  const [cargandoServiciosProf, setCargandoServiciosProf] = useState(false);
  const [serviciosElegidosModal, setServiciosElegidosModal] = useState([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [motivoSel, setMotivoSel] = useState(MOTIVOS_CANCELACION[0]);
  const [otroMotivo, setOtroMotivo] = useState('');
  const [cancelando, setCancelando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let activosDocs = [];
    let profsDocs = [];

    const combinarActivos = () => {
      const mapa = new Map();

      profsDocs.forEach((p) => {
        if (p.activodomicilios === true || p.activoEnLinea === true) {
          const clave = String(p.barberoId || p.uid || p.id);
          mapa.set(clave, { ...p, id: p.id || clave });
        }
      });

      activosDocs.forEach((a) => {
        const clave = String(a.barberoId || a.uid || a.id);
        if (esProfesionalRealmenteActivo(a)) {
          const previo = mapa.get(clave) || {};
          mapa.set(clave, { ...previo, ...a, id: a.id || previo.id || clave });
        } else {
          mapa.delete(clave);
        }
      });

      setProfesionalesActivos(Array.from(mapa.values()));
    };

    const unsubActivos = onSnapshot(collection(db, 'profesionalesactivos'), (s) => {
      activosDocs = s.docs.map((d) => ({ id: d.id, ...d.data() }));
      combinarActivos();
    });

    const unsubProfs = onSnapshot(collection(db, 'profesionales'), (s) => {
      profsDocs = s.docs.map((d) => ({ id: d.id, ...d.data() }));
      combinarActivos();
    });

    return () => {
      unsubActivos();
      unsubProfs();
    };
  }, []);

  useEffect(() => {
    if (!solicitudId) return;
    const unsub = onSnapshot(doc(db, 'serviciosenlinea', solicitudId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (String(data.estado || '').toLowerCase() === 'aceptada') {
        setSolicitudAceptada(true);
      }
    });
    return () => unsub();
  }, [solicitudId]);

  const irAPaso = (n, s = 'adelante') => { setErrorMsg(''); setDireccionAnim(s); setAnimKey((k) => k + 1); setPaso(n); };
  const localidadReferencia = zonaCliente.trim() || direccion.trim();
  const profesionalesClasificados = useMemo(() => profesionalesActivos.map((p) => ({ ...p, enLocalidad: estaEnLocalidad(p, localidadReferencia) })), [profesionalesActivos, localidadReferencia]);
  const barberosEnZona = useMemo(() => profesionalesClasificados.filter((p) => p.enLocalidad), [profesionalesClasificados]);
  const barberosFueraZona = useMemo(() => profesionalesClasificados.filter((p) => !p.enLocalidad), [profesionalesClasificados]);
  const toggleServicio = (n) => { setErrorMsg(''); setServiciosSeleccionados((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n])); };

  const handlePaso1 = (e) => { e.preventDefault(); if (!nombreApellido.trim()) return setErrorMsg('Escribe tu nombre y apellido para continuar.'); irAPaso(2, 'adelante'); };
  const handlePaso2 = (e) => { e.preventDefault(); if (!telefono.trim()) return setErrorMsg('Escribe tu número de teléfono para coordinar contigo.'); irAPaso(3, 'adelante'); };
  const handlePaso3 = (e) => { e.preventDefault(); if (!direccion.trim() && !zonaCliente.trim()) return setErrorMsg('Indica tu dirección o zona.'); irAPaso(4, 'adelante'); };

  const handleActivarRadar = async (e) => {
    e.preventDefault();
    if (!serviciosSeleccionados.length) return setErrorMsg('Elige al menos un servicio.');
    setEnviando(true); setErrorMsg('');
    try {
      setSolicitudId(null);
      setProfesionalAsignadoId(null);
      setProfesionalAsignadoNombre('');
      setSolicitudAceptada(false);
      irAPaso(5, 'adelante');
    } catch (err) { console.error(err); setErrorMsg('No se pudo continuar. Intenta de nuevo.'); } finally { setEnviando(false); }
  };

  const abrirModalServiciosProfesional = async (prof) => {
    const pid = prof.barberoId || prof.id;
    setModalServiciosProf(prof);
    setServiciosExternosProf([]);
    setServiciosElegidosModal([]);
    setCargandoServiciosProf(true);
    try {
      const snap = await getDocs(query(collection(db, 'servicios'), where('barberoId', '==', pid)));
      const lista = [];
      snap.forEach((d) => {
        const s = d.data();
        if (!String(s.duracion || s.categoria || s.nombre || '').toLowerCase().includes('interno')) {
          const p = Number(s.precioNum || s.precio || 35000);
          lista.push({
            id: d.id,
            nombre: s.nombre || s.name || 'Servicio',
            precioNum: p,
            precioFormatted: s.precioText || `$${p.toLocaleString('es-CO')} COP`
          });
        }
      });
      setServiciosExternosProf(lista);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudieron cargar los servicios del profesional.');
    } finally {
      setCargandoServiciosProf(false);
    }
  };

  const toggleServicioModal = (srv) => {
    setServiciosElegidosModal((prev) =>
      prev.some((item) => item.nombre === srv.nombre)
        ? prev.filter((item) => item.nombre !== srv.nombre)
        : [...prev, srv]
    );
  };

  const handleConfirmarSolicitudProfesional = async () => {
    if (!modalServiciosProf) return;
    const prof = modalServiciosProf;
    const pid = prof.barberoId || prof.id;
    const pNombre = prof.nombre || [prof.nombres, prof.apellidos].filter(Boolean).join(' ') || 'Profesional';
    const listaFinal = serviciosElegidosModal.length
      ? serviciosElegidosModal.map((s) => s.nombre)
      : serviciosSeleccionados;

    setEnviandoAProfesionalId(prof.id);
    setErrorMsg('');
    try {
      if (solicitudId) {
        await deleteDoc(doc(db, 'serviciosenlinea', solicitudId));
      }
      const ref = await addDoc(collection(db, 'serviciosenlinea'), {
        clienteNombre: nombreApellido.trim(),
        clienteTelefono: telefono.trim(),
        direccion: direccion.trim(),
        zona: zonaCliente.trim() || direccion.trim(),
        servicios: listaFinal,
        descripcion: descripcionNecesidad.trim(),
        profesionalId: pid,
        profesionalDestinoId: pid,
        profesionalNombre: pNombre,
        soloProfesional: true,
        estado: 'pendiente',
        tipoSolicitud: 'seleccion_profesional',
        creadoEn: serverTimestamp()
      });
      setSolicitudId(ref.id);
      setProfesionalAsignadoId(pid);
      setProfesionalAsignadoNombre(pNombre);
      setSolicitudAceptada(false);
      setModalServiciosProf(null);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo enviar la solicitud al profesional.');
    } finally {
      setEnviandoAProfesionalId(null);
    }
  };

  const handleConfirmarCancelacion = async (e) => {
    e.preventDefault();
    const motivoFinal = motivoSel === 'Otro' ? otroMotivo.trim() : motivoSel;
    if (!motivoFinal) return setErrorMsg('Escribe el motivo de cancelación.');
    setCancelando(true); setErrorMsg('');
    try {
      if (solicitudId) await updateDoc(doc(db, 'serviciosenlinea', solicitudId), { estado: 'cancelada', motivoCancelacion: motivoFinal, canceladoEn: serverTimestamp() });
      setCancelModalOpen(false); setOtroMotivo(''); setMotivoSel(MOTIVOS_CANCELACION[0]); setSolicitudId(null); setProfesionalAsignadoId(null); setProfesionalAsignadoNombre(''); setSolicitudAceptada(false); irAPaso(1, 'atras');
    } catch (err) { console.error(err); setErrorMsg('No se pudo cancelar.'); } finally { setCancelando(false); }
  };

  const preguntaActual = useMemo(() => (
    paso === 1 ? '¿Cuál es tu nombre y apellido?'
      : paso === 2 ? `¿Cuál es tu número de teléfono, ${nombreApellido.trim()}?`
      : paso === 3 ? '¿Cuál es tu dirección y en qué zona estás?'
      : paso === 4 ? '¿Qué servicio deseas y qué necesitas hacerte?'
      : `Buscando barberos en ${localidadReferencia || 'tu zona'}...`
  ), [paso, nombreApellido, localidadReferencia]);

  const animClass = direccionAnim === 'adelante' ? 'animate-[slideInRight_0.35s_cubic-bezier(0.22,1,0.36,1)]' : 'animate-[slideInLeft_0.35s_cubic-bezier(0.22,1,0.36,1)]';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-50 to-cyan-100 text-slate-900 flex flex-col items-center justify-center p-4">
      <style>{`@keyframes slideInRight{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}@keyframes slideInLeft{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}`}</style>

      <div className="w-full max-w-md sm:max-w-lg space-y-4">
        <div className="flex items-center justify-between gap-2.5 px-1">
          <div className="flex items-center gap-2"><img src={VISARKA_LOGO} alt="VISARKA Logo" className="h-7 w-auto object-contain" /><span className="text-sm sm:text-base font-black tracking-widest text-slate-900">VISARKA</span></div>
        </div>

        <div className="flex items-center gap-1.5 px-1">
          {[1, 2, 3, 4, 5].map((n) => <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-500 ${n <= paso ? 'bg-gradient-to-r from-sky-400 to-blue-600' : 'bg-sky-200/80'}`} />)}
        </div>

        <div key={animKey} className={`${animClass} bg-white/90 backdrop-blur-md border border-sky-200/90 rounded-3xl p-5 sm:p-7 shadow-lg shadow-sky-900/5 space-y-5`}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5"><Bot className="w-4 h-4" /></div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 leading-snug pt-1">{preguntaActual}</h1>
          </div>

          {paso === 1 && (
            <form onSubmit={handlePaso1} className="space-y-4">
              <input type="text" value={nombreApellido} onChange={(e) => { setNombreApellido(e.target.value); setErrorMsg(''); }} placeholder="Nombre y apellido" autoFocus className="w-full bg-sky-50/70 border border-sky-200 focus:border-blue-600 focus:bg-white rounded-2xl px-4 py-3 text-[16px] text-slate-900 outline-none transition" />
              {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}
              <button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm py-3 rounded-2xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]">Siguiente <ArrowRight className="w-4 h-4" /></button>
            </form>
          )}

          {paso === 2 && (
            <form onSubmit={handlePaso2} className="space-y-4">
              <input type="tel" value={telefono} onChange={(e) => { setTelefono(e.target.value); setErrorMsg(''); }} placeholder="Ej: +57 300 000 0000" autoFocus className="w-full bg-sky-50/70 border border-sky-200 focus:border-blue-600 focus:bg-white rounded-2xl px-4 py-3 text-[16px] text-slate-900 outline-none transition" />
              {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => irAPaso(1, 'atras')} className="px-4 py-3 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer"><ArrowLeft className="w-4 h-4" /> Atrás</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm py-3 rounded-2xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]">Siguiente <ArrowRight className="w-4 h-4" /></button>
              </div>
            </form>
          )}

          {paso === 3 && (
            <form onSubmit={handlePaso3} className="space-y-3.5">
              <input type="text" value={direccion} onChange={(e) => { setDireccion(e.target.value); setErrorMsg(''); }} placeholder="Dirección o punto de referencia" autoFocus className="w-full bg-sky-50/70 border border-sky-200 focus:border-blue-600 focus:bg-white rounded-2xl px-4 py-3 text-[16px] text-slate-900 outline-none transition" />
              <input type="text" value={zonaCliente} onChange={(e) => setZonaCliente(e.target.value)} placeholder="Localidad, barrio o sector" className="w-full bg-sky-50/70 border border-sky-200 focus:border-blue-600 focus:bg-white rounded-2xl px-4 py-2.5 text-[16px] text-slate-900 outline-none transition" />
              <div className="flex flex-wrap gap-1.5">
                {ZONAS_RAPIDAS.map((z) => <button key={z} type="button" onClick={() => setZonaCliente(z)} className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${zonaCliente.toLowerCase() === z.toLowerCase() ? 'bg-blue-600 text-white border-blue-600' : 'bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100'}`}>{z}</button>)}
              </div>
              {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => irAPaso(2, 'atras')} className="px-4 py-3 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer"><ArrowLeft className="w-4 h-4" /> Atrás</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm py-3 rounded-2xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]">Siguiente <ArrowRight className="w-4 h-4" /></button>
              </div>
            </form>
          )}

          {paso === 4 && (
            <form onSubmit={handleActivarRadar} className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {SERVICIOS_DISPONIBLES.map((srv) => <button key={srv} type="button" onClick={() => toggleServicio(srv)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${serviciosSeleccionados.includes(srv) ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-blue-600 shadow-xs' : 'bg-sky-50/80 text-slate-700 border-sky-200 hover:bg-sky-100'}`}>{srv}</button>)}
              </div>
              <textarea rows="3" value={descripcionNecesidad} onChange={(e) => setDescripcionNecesidad(e.target.value)} placeholder="Describe qué necesitas hacerte..." className="w-full bg-sky-50/70 border border-sky-200 focus:border-blue-600 focus:bg-white rounded-2xl px-4 py-3 text-[16px] text-slate-900 outline-none transition resize-none" />
              {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => irAPaso(3, 'atras')} className="px-4 py-3 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer"><ArrowLeft className="w-4 h-4" /> Atrás</button>
                <button type="submit" disabled={enviando} className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-60 text-white font-black text-sm py-3 rounded-2xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]">
                  {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Activando...</> : <><Radar className="w-4 h-4" /> Buscar en Radar</>}
                </button>
              </div>
            </form>
          )}

          {paso === 5 && (
            <div className="space-y-4">
              {solicitudAceptada && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-black flex items-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>cita agendada para dentro de 30 min estara el profesional de barberia en tu domicilio</span>
                </div>
              )}

              <div className="relative h-32 rounded-2xl bg-gradient-to-br from-sky-100 via-sky-50 to-cyan-100 border border-sky-200 flex items-center justify-center overflow-hidden">
                <div className="absolute w-20 h-20 rounded-full border border-blue-500/35 animate-ping" style={{ animationDuration: '2.2s' }} />
                <div className="absolute w-32 h-32 rounded-full border border-sky-400/45" />
                <div className="relative z-10 flex flex-col items-center gap-1 text-center px-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-blue-300 text-blue-600 flex items-center justify-center shadow-2xs"><Scissors className="w-5 h-5" /></div>
                  <p className="text-xs font-extrabold text-blue-950">{barberosEnZona.length} barbero(s) activo(s) en {localidadReferencia || 'tu zona'}</p>
                  <p className="text-[11px] text-blue-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {solicitudAceptada
                      ? 'Cita confirmada por el profesional'
                      : profesionalAsignadoId
                        ? `Solicitud enviada exclusivamente a ${profesionalAsignadoNombre} · A la espera de respuesta`
                        : 'Elige un profesional para enviarle tu solicitud'}
                  </p>
                </div>
              </div>

              {profesionalesClasificados.length > 0 && (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {barberosEnZona.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 px-1">Disponibles en {localidadReferencia || 'tu zona'} ({barberosEnZona.length})</p>
                      {barberosEnZona.map((prof) => {
                        const nombreCompleto = prof.nombre || [prof.nombres, prof.apellidos].filter(Boolean).join(' ') || 'Profesional';
                        const fotoUrl = prof.foto || prof.fotoUrl || prof.avatar || prof.imagen || VISARKA_LOGO;
                        const pid = prof.barberoId || prof.id;
                        const esEste = profesionalAsignadoId === pid;
                        return (
                          <div key={prof.id} className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2.5 shadow-2xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={fotoUrl} alt={nombreCompleto} className="w-10 h-10 rounded-full object-cover border border-emerald-300 shrink-0 bg-white" />
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900 truncate">{nombreCompleto}</p>
                                <p className="text-[10px] text-slate-600 truncate">{esEste ? 'A la espera de respuesta...' : 'Disponible'}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={enviandoAProfesionalId === prof.id}
                              onClick={() => abrirModalServiciosProfesional(prof)}
                              className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black transition cursor-pointer ${esEste ? 'bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                            >
                              {enviandoAProfesionalId === prof.id ? 'Enviando...' : esEste ? 'En espera' : 'Elegir servicio'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {barberosFueraZona.length > 0 && (
                    <div className="px-1">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-600 border border-slate-300">
                        {barberosFueraZona.length} {barberosFueraZona.length === 1 ? 'barbero fuera de zona' : 'barberos fuera de zona'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}

              <div className="flex gap-2">
                <button type="button" onClick={() => { setErrorMsg(''); setCancelModalOpen(true); }} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition cursor-pointer"><XCircle className="w-3.5 h-3.5" /> Cancelar</button>
                <button type="button" onClick={() => { setDescripcionNecesidad(''); setSolicitudId(null); setProfesionalAsignadoId(null); setProfesionalAsignadoNombre(''); setSolicitudAceptada(false); irAPaso(1, 'atras'); }} className="flex-1 bg-sky-100 hover:bg-sky-200 text-blue-900 font-bold text-xs py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /> Nueva solicitud</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalServiciosProf && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-sky-200 rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <img src={VISARKA_LOGO} alt="VISARKA" className="w-5 h-5 object-contain bg-white/90 rounded-md p-0.5" />
                <span className="text-[10px] font-black tracking-widest uppercase">VISARKA · Servicios del profesional</span>
              </div>
              <button type="button" onClick={() => setModalServiciosProf(null)} className="text-white/80 hover:text-white font-bold text-xs cursor-pointer">✕</button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <p className="font-black text-sm text-slate-900">
                {modalServiciosProf.nombre || [modalServiciosProf.nombres, modalServiciosProf.apellidos].filter(Boolean).join(' ') || 'Profesional'}
              </p>
              {cargandoServiciosProf ? (
                <div className="py-6 flex items-center justify-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Cargando servicios externos...</span>
                </div>
              ) : serviciosExternosProf.length === 0 ? (
                <p className="text-slate-500 py-4 text-center">Este profesional no tiene servicios externos registrados.</p>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {serviciosExternosProf.map((srv) => {
                    const sel = serviciosElegidosModal.some((item) => item.nombre === srv.nombre);
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => toggleServicioModal(srv)}
                        className={`w-full p-2.5 rounded-2xl border flex items-center justify-between text-left transition cursor-pointer ${sel ? 'bg-blue-50 border-blue-500 font-black text-slate-900' : 'bg-sky-50/60 border-sky-200 text-slate-700 hover:bg-sky-100/70'}`}
                      >
                        <span className="truncate">{srv.nombre}</span>
                        <span className="text-blue-600 font-bold shrink-0 ml-2">{srv.precioFormatted}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalServiciosProf(null)} className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl cursor-pointer">Cancelar</button>
                <button type="button" onClick={handleConfirmarSolicitudProfesional} className="w-1/2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black py-2.5 rounded-2xl cursor-pointer">Enviar solicitud</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleConfirmarCancelacion} className="bg-white border border-sky-200 rounded-3xl p-5 w-full max-w-sm space-y-3.5 shadow-2xl">
            <h2 className="text-sm font-black text-slate-900">¿Por qué deseas cancelar la solicitud?</h2>
            <select value={motivoSel} onChange={(e) => { setMotivoSel(e.target.value); setErrorMsg(''); }} className="w-full bg-sky-50/70 border border-sky-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none">
              {MOTIVOS_CANCELACION.map((m, i) => <option key={m} value={m}>{i + 1}. {m}</option>)}
            </select>
            {motivoSel === 'Otro' && (
              <textarea rows="2" value={otroMotivo} onChange={(e) => { setOtroMotivo(e.target.value); setErrorMsg(''); }} placeholder="Escribe el motivo..." autoFocus className="w-full bg-sky-50/70 border border-sky-200 focus:border-blue-600 rounded-2xl px-3 py-2 text-xs text-slate-900 outline-none resize-none" />
            )}
            {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setCancelModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-2xl cursor-pointer">Volver</button>
              <button type="submit" disabled={cancelando} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-2.5 rounded-2xl flex items-center justify-center gap-1 cursor-pointer">{cancelando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirmar'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}