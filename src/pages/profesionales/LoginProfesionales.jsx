import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, Loader2, AlertTriangle, CheckCircle2, ShieldCheck, Zap, Home } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../components/firebase';

export default function LoginProfesionales() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsgLogin, setErrorMsgLogin] = useState('');
  const [successMsgLogin, setSuccessMsgLogin] = useState('');
  const [transicionVisarka, setTransicionVisarka] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombreRegistro, setNombreRegistro] = useState('');
  const [refInvitador, setRefInvitador] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [pais, setPais] = useState('Colombia');
  const [moneda, setMoneda] = useState('COP');
  const [tipoTrabajador, setTipoTrabajador] = useState('establecimiento');
  const [establecimiento, setEstablecimiento] = useState('');
  const [porcentajeEmpleado, setPorcentajeEmpleado] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          if ((await getDoc(doc(db, 'establecimientos', user.uid))).exists()) {
            return window.location.href = '/panelestablecimientos';
          }
          if ((await getDoc(doc(db, 'profesionales', user.uid))).exists()) {
            return window.location.href = '/panelprofesionales';
          }
        } catch (error) {
          console.error("Error al verificar usuario:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('ref')) setRefInvitador(q.get('ref'));
    if (q.get('register') === 'true' || q.get('ref')) setIsRegistering(true);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isRegistering && password !== confirmPassword) return setErrorMsgLogin('Las contraseñas no coinciden.');
    if (isRegistering && password.length < 8) return setErrorMsgLogin('Mínimo 8 caracteres.');
    
    setLoginLoading(true);
    setErrorMsgLogin('');
    
    try {
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const data = tipoTrabajador === 'establecimiento' 
          ? { uid: cred.user.uid, nombre: establecimiento || nombreRegistro || 'Establecimiento', email: cred.user.email, pais, moneda, tipo: 'establecimiento', ref: refInvitador || 'yohaldryquintero1995@gmail.com', createdAt: new Date().toISOString() }
          : { uid: cred.user.uid, nombre: nombreRegistro || 'Socio', email: cred.user.email, pais, moneda, tipoTrabajador, establecimiento: '', porcentaje: Number(porcentajeEmpleado) || 0, ref: refInvitador || 'yohaldryquintero1995@gmail.com', createdAt: new Date().toISOString() };
        
        await setDoc(doc(db, tipoTrabajador === 'establecimiento' ? 'establecimientos' : 'profesionales', cred.user.uid), data);
        setSuccessMsgLogin('¡Registro exitoso!');
        setTransicionVisarka(true);
        setTimeout(() => window.location.href = tipoTrabajador === 'establecimiento' ? '/panelestablecimientos' : '/panelprofesionales', 1500);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const esEstablecimiento = (await getDoc(doc(db, 'establecimientos', cred.user.uid))).exists();
        setSuccessMsgLogin('¡Éxito! Redirigiendo...');
        setTransicionVisarka(true);
        setTimeout(() => window.location.href = esEstablecimiento ? '/panelestablecimientos' : '/panelprofesionales', 1000);
      }
    } catch (err) {
      setErrorMsgLogin(err.message || 'Verifica tus datos.');
      setLoginLoading(false);
      setTransicionVisarka(false);
    } finally {
      if (!isRegistering) setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Botón flotante para ir a inicio */}
      <a 
        href="/" 
        className="absolute top-4 left-4 z-20 bg-white/80 hover:bg-white text-slate-700 hover:text-indigo-600 backdrop-blur-md border border-slate-200 px-3.5 py-2 rounded-2xl shadow-sm text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
      >
        <Home size={15} /> <span>Ir a Inicio</span>
      </a>

      {/* Manchas de colores degradadas y fluidas de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-sky-400/30 to-teal-300/30 rounded-full blur-[90px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-indigo-400/30 to-pink-400/20 rounded-full blur-[90px] pointer-events-none"></div>

      {/* Contenedor principal con efecto glassmorphism claro */}
      <div className={`w-full max-w-4xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden flex flex-col md:flex-row transition-all duration-700 relative z-10 ${isRegistering ? 'md:flex-row-reverse' : ''}`}>
        
        {/* Panel Izquierdo / Branding con logo al lado de Visarka */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-sky-600 via-indigo-600 to-violet-700 p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-6 relative z-10">
            {/* Logo y título alineados lado a lado */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center p-2.5 shadow-sm shrink-0">
                <img src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" alt="Logo" className="w-full h-full object-contain filter drop-shadow" />
              </div>
              <div>
                <span className="text-[8px] font-mono tracking-widest uppercase bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white border border-white/20">
                  Portal Profesional
                </span>
                <h1 className="text-2xl font-black tracking-tight text-white leading-tight">VISARKA</h1>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-sky-100 leading-relaxed font-medium">
                Elevando la gestión, el control financiero y el estilo de los mejores barberos y establecimientos del sector.
              </p>
            </div>
          </div>

          <div className="hidden sm:space-y-3 pt-8 text-xs text-sky-100/90 relative z-10">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 shadow-inner">
              <Zap size={16} className="text-cyan-300 shrink-0" />
              <span className="font-medium">Control dinámico de citas, comisiones y servicios</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 shadow-inner">
              <ShieldCheck size={16} className="text-cyan-300 shrink-0" />
              <span className="font-medium">Plataforma 100% segura y optimizada</span>
            </div>
          </div>
        </div>

        {/* Panel Derecho / Formulario limpio y claro */}
        <div className={`w-full md:w-7/12 p-6 sm:p-10 flex flex-col justify-between ${isRegistering ? 'max-h-[600px] md:max-h-none overflow-y-auto custom-scrollbar' : ''}`}>
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  {isRegistering ? 'Registro de Socio' : 'Iniciar Sesión'}
                </h3>
                <p className="text-[10px] text-slate-500">
                  {isRegistering ? 'Completa tus datos profesionales' : 'Bienvenido de nuevo a tu panel'}
                </p>
              </div>
            </div>

            {errorMsgLogin && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] flex items-center gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsgLogin}</span>
              </div>
            )}

            {successMsgLogin && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-bold">{successMsgLogin}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-3">
              {isRegistering && (
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input type="text" required placeholder="Ej. Carlos Pérez" value={nombreRegistro} onChange={e => setNombreRegistro(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner" />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <input type="email" required placeholder="correo@dominio.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Contraseña</label>
                  {password.length > 0 && <span className={`text-[9px] font-bold ${password.length >= 8 ? 'text-emerald-600' : 'text-amber-600'}`}>{password.length >= 8 ? '✓ Mínimo 8' : `Faltan ${8 - password.length}`}</span>}
                </div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} className={`w-full bg-slate-50 border rounded-xl py-2 pl-3 pr-9 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-inner ${password.length > 0 ? (password.length >= 8 ? 'border-emerald-400 bg-emerald-50/20' : 'border-amber-400 bg-amber-50/20') : 'border-slate-200 focus:border-indigo-500 focus:bg-white'}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
              </div>

              {isRegistering && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-1">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Confirmar Contraseña</label>
                    {confirmPassword.length > 0 && <span className={`text-[9px] font-bold ${password === confirmPassword ? 'text-emerald-600' : 'text-red-600'}`}>{password === confirmPassword ? '✓ Coinciden' : '✕ No coinciden'}</span>}
                  </div>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} required placeholder="Repite tu contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`w-full bg-slate-50 border rounded-xl py-2 pl-3 pr-9 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-inner ${confirmPassword.length > 0 ? (password === confirmPassword ? 'border-emerald-400 bg-emerald-50/20' : 'border-red-400 bg-red-50/20') : 'border-slate-200 focus:border-indigo-500 focus:bg-white'}`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">{showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                  </div>
                </div>
              )}

              {isRegistering && (
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">País y Moneda</label>
                  <select value={pais} onChange={e => { setPais(e.target.value); setMoneda(e.target.value === 'Colombia' ? 'COP' : 'USD'); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white shadow-inner cursor-pointer">
                    <option value="Colombia">Colombia (COP)</option>
                    <option value="Venezuela">Venezuela (USD)</option>
                    <option value="Estados Unidos (EE.UU.)">Estados Unidos (EE.UU.) (USD)</option>
                  </select>
                </div>
              )}

              {isRegistering && (
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tipo de Cuenta</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setTipoTrabajador('establecimiento')} className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${tipoTrabajador === 'establecimiento' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>Establecimiento</button>
                    <button type="button" onClick={() => setTipoTrabajador('empleado')} className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${tipoTrabajador === 'empleado' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>Barbero</button>
                  </div>
                </div>
              )}

              {isRegistering && tipoTrabajador === 'establecimiento' && (
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-indigo-600 uppercase tracking-widest ml-1">Nombre del Establecimiento</label>
                  <input type="text" required placeholder="Ej. Barbería Lords VIP" value={establecimiento} onChange={e => setEstablecimiento(e.target.value)} className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl py-2 px-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-bold focus:border-indigo-500 shadow-inner" />
                </div>
              )}

              {isRegistering && tipoTrabajador === 'empleado' && (
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-indigo-600 uppercase tracking-widest ml-1">Porcentaje de Comisión (%)</label>
                  <input type="number" min="0" max="100" required placeholder="Ej. 50" value={porcentajeEmpleado} onChange={e => setPorcentajeEmpleado(e.target.value)} className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl py-2 px-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-bold focus:border-indigo-500 shadow-inner" />
                </div>
              )}

              {isRegistering && (
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Patrocinador <span className="text-slate-400 font-normal">(Opcional)</span></label>
                  <input type="email" value={refInvitador} onChange={e => setRefInvitador(e.target.value)} placeholder="yohaldryquintero1995@gmail.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-600 outline-none focus:border-indigo-500 focus:bg-white shadow-inner" />
                </div>
              )}

              <button type="submit" disabled={loginLoading} className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-95 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/25 transition-all active:scale-95 mt-3">
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <>{isRegistering ? 'Completar Registro' : 'Iniciar Sesión'} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200/60 text-center">
            <button type="button" onClick={() => { setIsRegistering(!isRegistering); setErrorMsgLogin(''); setSuccessMsgLogin(''); }} className="text-[11px] font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer">
              {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>
        </div>
      </div>

      {transicionVisarka && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-3 mb-4 animate-pulse">
            <img src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" alt="VISARKA" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-white text-xs font-black uppercase tracking-widest">Visarka</h1>
          <p className="text-sky-300 text-[10px] font-mono tracking-wider mt-1">Cargando Sistema...</p>
          <div className="w-32 h-1 bg-white/20 rounded-full mt-6 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-sky-400 to-indigo-500 animate-[indeterminate_1s_infinite_linear]"></div>
          </div>
        </div>
      )}
    </div>
  );
}