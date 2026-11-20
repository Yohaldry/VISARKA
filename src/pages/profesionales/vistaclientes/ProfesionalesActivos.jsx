import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Bot, Scissors, Radar, ArrowRight, ArrowLeft, CheckCircle2, Loader2, RotateCcw, Users, XCircle } from 'lucide-react';
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

export default function ProfesionalesActivos() {
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
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [motivoSel, setMotivoSel] = useState(MOTIVOS_CANCELACION[0]);
  const [otroMotivo, setOtroMotivo] = useState('');
  const [cancelando, setCancelando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => onSnapshot(collection(db, 'profesionalesactivos'), (s) => setProfesionalesActivos(s.docs.map((d) => ({ id: d.id, ...d.data() })))), []);

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
      const ref = await addDoc(collection(db, 'serviciosenlinea'), {
        clienteNombre: nombreApellido.trim(), clienteTelefono: telefono.trim(), direccion: direccion.trim(),
        zona: zonaCliente.trim() || direccion.trim(), servicios: serviciosSeleccionados, descripcion: descripcionNecesidad.trim(),
        estado: 'pendiente', tipoSolicitud: 'radar_inmediato', creadoEn: serverTimestamp()
      });
      setSolicitudId(ref.id);
      irAPaso(5, 'adelante');
    } catch (err) { console.error(err); setErrorMsg('No se pudo enviar. Intenta de nuevo.'); } finally { setEnviando(false); }
  };

  const handleConfirmarCancelacion = async (e) => {
    e.preventDefault();
    const motivoFinal = motivoSel === 'Otro' ? otroMotivo.trim() : motivoSel;
    if (!motivoFinal) return setErrorMsg('Escribe el motivo de cancelación.');
    setCancelando(true); setErrorMsg('');
    try {
      if (solicitudId) await updateDoc(doc(db, 'serviciosenlinea', solicitudId), { estado: 'cancelada', motivoCancelacion: motivoFinal, canceladoEn: serverTimestamp() });
      setCancelModalOpen(false); setOtroMotivo(''); setMotivoSel(MOTIVOS_CANCELACION[0]); irAPaso(1, 'atras');
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
          <div className="inline-flex items-center gap-2 bg-white/90 border border-sky-200/90 px-3 py-1.5 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><Users className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-black text-slate-800">{profesionalesActivos.length} {profesionalesActivos.length === 1 ? 'profesional activo' : 'profesionales activos'}</span>
          </div>
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
              <div className="relative h-32 rounded-2xl bg-gradient-to-br from-sky-100 via-sky-50 to-cyan-100 border border-sky-200 flex items-center justify-center overflow-hidden">
                <div className="absolute w-20 h-20 rounded-full border border-blue-500/35 animate-ping" style={{ animationDuration: '2.2s' }} />
                <div className="absolute w-32 h-32 rounded-full border border-sky-400/45" />
                <div className="relative z-10 flex flex-col items-center gap-1 text-center px-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-blue-300 text-blue-600 flex items-center justify-center shadow-2xs"><Scissors className="w-5 h-5" /></div>
                  <p className="text-xs font-extrabold text-blue-950">{barberosEnZona.length} barbero(s) activo(s) en {localidadReferencia || 'tu zona'}</p>
                  <p className="text-[11px] text-blue-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Solicitud enviada · Pendiente</p>
                </div>
              </div>

              {profesionalesClasificados.length > 0 && (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {barberosEnZona.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 px-1">Disponibles en {localidadReferencia || 'tu zona'} ({barberosEnZona.length})</p>
                      {barberosEnZona.map((prof) => {
                        const zonasTxt = Array.isArray(prof.zonasTrabajo) && prof.zonasTrabajo.length > 0 ? prof.zonasTrabajo.join(', ') : prof.zona || prof.localidad || 'En zona';
                        return (
                          <div key={prof.id} className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2.5 shadow-2xs">
                            <div className="min-w-0"><p className="text-xs font-black text-slate-900 truncate">{prof.nombre || 'Profesional'}</p><p className="text-[10px] text-slate-600 truncate">{prof.especialidad || 'Barbería'} · {zonasTxt}</p></div>
                            <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-white">Activo</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {barberosFueraZona.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-1">Fuera de {localidadReferencia || 'la localidad'} ({barberosFueraZona.length})</p>
                      {barberosFueraZona.map((prof) => {
                        const zonasTxt = Array.isArray(prof.zonasTrabajo) && prof.zonasTrabajo.length > 0 ? prof.zonasTrabajo.join(', ') : prof.zona || prof.localidad || 'Otra zona';
                        return (
                          <div key={prof.id} aria-disabled="true" className="p-3 rounded-2xl bg-slate-100/90 border border-slate-200 flex items-center justify-between gap-2.5 opacity-60 grayscale select-none pointer-events-none">
                            <div className="min-w-0"><p className="text-xs font-bold text-slate-700 truncate">{prof.nombre || 'Profesional'}</p><p className="text-[10px] text-slate-500 truncate">{prof.especialidad || 'Barbería'} · {zonasTxt}</p></div>
                            <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 border border-slate-300">Fuera de zona</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button type="button" onClick={() => { setErrorMsg(''); setCancelModalOpen(true); }} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition cursor-pointer"><XCircle className="w-3.5 h-3.5" /> Cancelar</button>
                <button type="button" onClick={() => { setDescripcionNecesidad(''); irAPaso(1, 'atras'); }} className="flex-1 bg-sky-100 hover:bg-sky-200 text-blue-900 font-bold text-xs py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /> Nueva solicitud</button>
              </div>
            </div>
          )}
        </div>
      </div>

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