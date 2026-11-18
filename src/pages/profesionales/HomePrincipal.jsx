import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, MapPin, Star, CheckCircle2, ArrowRight, UserCheck, Home, Zap, ChevronLeft, ChevronRight, User, Calendar, Settings, LogOut, Compass, Clock, Briefcase } from 'lucide-react';

export default function HomePrincipal({ isLoggedIn = false, user = { name: "Usuario", avatar: "" } }) {
  const navigate = useNavigate();
  const [activeExpressIndex, setActiveExpressIndex] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('home');

  const expressServices = [
    { id: 1, title: "Corte + Barba VIP", sub: "Incluye visagismo", price: "$35 USD", time: "30-45 Min", equipment: "Esterilizado UV", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800" },
    { id: 2, title: "Corte Ejecutivo", sub: "Lavado y peinado", price: "$25 USD", time: "20-30 Min", equipment: "Maletín Pro", image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800" },
    { id: 3, title: "Barba & Toalla", sub: "Perfilado navaja", price: "$20 USD", time: "25-35 Min", equipment: "Vaporizador", image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800" }
  ];

  useEffect(() => {
    const timer = setInterval(() => setActiveExpressIndex(p => (p + 1) % expressServices.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans pb-20 sm:pb-0 overflow-x-hidden">
      
      {/* BANNER SUPERIOR TIPO PÓSTER - BARBERO PROFESIONAL */}
      <div 
        onClick={() => navigate('/login')}
        className="bg-gradient-to-r from-slate-950 via-indigo-950 to-[#0284c7] text-white py-2 px-4 text-center text-xs font-bold cursor-pointer hover:opacity-95 transition-all flex items-center justify-center gap-2 fixed top-0 left-0 w-full z-50 shadow-md"
      >
        <Briefcase className="w-3.5 h-3.5 text-[#00E5FF] animate-bounce" />
        <span>¿Eres Barbero Profesional? <span className="text-[#00E5FF] underline ml-1">Ingresa aquí</span></span>
        <ArrowRight className="w-3.5 h-3.5 text-[#00E5FF]" />
      </div>

      {/* NAVBAR FIJA COMPACTA (Bordes con sombras suaves) */}
      <nav className="fixed top-8 left-0 w-full flex items-center justify-between px-3 sm:px-6 py-2 bg-white/90 backdrop-blur-md z-40 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" alt="Logo" className="w-6 h-6 object-contain" />
          <span className="text-base font-black tracking-wider uppercase bg-gradient-to-r from-slate-950 to-[#0284c7] bg-clip-text text-transparent">VISARKA</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
          <a href="#como-funciona" className="hover:text-[#0284c7]">¿Cómo funciona?</a>
          <a href="#barberos" className="hover:text-[#0284c7]">Barberos</a>
          <a href="#servicios" className="hover:text-[#0284c7]">Servicios</a>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/calendariobarberos')} className="bg-gradient-to-r from-[#00E5FF] to-[#0284c7] text-slate-950 font-black px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1 shadow-md hover:shadow-cyan-500/20">
            <Zap className="w-3 h-3 fill-slate-950 animate-pulse" />
            <span>Exprés</span>
          </button>
          {isLoggedIn && (
            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-1 bg-slate-100 rounded-full shadow-inner">
                <User className="w-4 h-4 text-slate-700" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-1 text-xs z-50">
                  <button onClick={() => setIsUserMenuOpen(false)} className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Salir</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/60 via-slate-50 to-white pt-28 sm:pt-36 pb-12 px-4 sm:px-8 min-h-[90vh] flex items-center">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 shadow-[0_2px_10px_rgba(99,102,241,0.08)] text-xs font-semibold text-indigo-700">
              <Home className="w-4 h-4 text-[#0284c7]" /> Barbería a Domicilio VIP
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase text-slate-950 leading-tight">
              Barberos profesionales <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-[#00838f]">a la puerta de tu casa.</span>
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">Solicita cortes y barba a domicilio en minutos con equipamiento profesional.</p>
            <button 
              onClick={() => navigate('/calendariobarberos')} 
              className="bg-slate-950 text-white font-extrabold px-6 py-3.5 rounded-full text-sm flex items-center gap-2 shadow-[0_10px_25px_rgba(15,23,42,0.2)] hover:shadow-[0_15px_30px_rgba(15,23,42,0.3)] transition-all cursor-pointer"
            >
              Solicitar Barbero <ArrowRight className="w-4 h-4 text-[#00E5FF]" />
            </button>
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200/60 text-[10px] sm:text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#0284c7]" /> A tu ubicación</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#0284c7]" /> 100% Esterilizado</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#0284c7]" /> Verificados</span>
            </div>
          </div>

          <div className="lg:col-span-7 relative w-full">
            <div className="flex justify-between items-center mb-3">
              <div className="bg-sky-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1 shadow-md">
                <Zap className="w-3 h-3 fill-white" /> Exprés
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setActiveExpressIndex(p => p === 0 ? expressServices.length - 1 : p - 1)} className="bg-white p-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.06)]"><ChevronLeft className="w-4 h-4 text-slate-700" /></button>
                <button onClick={() => setActiveExpressIndex(p => (p + 1) % expressServices.length)} className="bg-white p-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.06)]"><ChevronRight className="w-4 h-4 text-slate-700" /></button>
              </div>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-3 snap-x scrollbar-none">
              {expressServices.map((service, idx) => (
                <div key={service.id} onClick={() => setActiveExpressIndex(idx)} className={`w-[62%] sm:w-1/3 shrink-0 snap-center cursor-pointer rounded-2xl p-3 transition-all ${activeExpressIndex === idx ? 'bg-white shadow-[0_12px_30px_rgba(2,132,199,0.12)] scale-[1.01] ring-1 ring-sky-200' : 'bg-white/80 shadow-sm opacity-90'}`}>
                  <div className="h-24 sm:h-32 rounded-xl bg-slate-100 mb-2 overflow-hidden relative shadow-inner">
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                    <span className="absolute top-1.5 right-1.5 text-[9px] font-black px-2 py-0.5 rounded bg-slate-950 text-white shadow">{service.price}</span>
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900 truncate">{service.title}</h3>
                  <p className="text-[10px] text-slate-500 mb-2 truncate">{service.sub}</p>
                  <button 
                    onClick={() => navigate('/calendariobarberos')} 
                    className="w-full py-1.5 bg-gradient-to-r from-sky-500 to-[#0284c7] text-white rounded-lg text-[10px] font-black shadow-md hover:shadow-cyan-500/20 cursor-pointer"
                  >
                    Pedir ahora
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-10 px-4 bg-white shadow-[0_-4px_25px_rgba(0,0,0,0.02)]">
        <div className="max-w-6xl mx-auto text-center mb-6">
          <h2 className="text-lg sm:text-2xl font-black uppercase text-slate-950">Pide tu barbero en 3 pasos</h2>
          <p className="text-slate-500 text-xs">Sin filas, todo desde tu teléfono.</p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { step: "01", title: "Selecciona", desc: "Explora perfiles y valoraciones.", icon: <UserCheck className="w-4 h-4 text-sky-600" /> },
            { step: "02", title: "Dirección", desc: "Indica tu ubicación y hora.", icon: <MapPin className="w-4 h-4 text-sky-600" /> },
            { step: "03", title: "Disfruta", desc: "Equipo profesional completo.", icon: <Scissors className="w-4 h-4 text-sky-600" /> }
          ].map((item, idx) => (
            <div key={idx} className="bg-gradient-to-b from-slate-50/50 to-white p-3.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative">
              <span className="text-lg font-black text-slate-200 absolute top-2 right-3">{item.step}</span>
              <div className="mb-2 bg-sky-50 shadow-inner w-7 h-7 rounded-xl flex items-center justify-center">{item.icon}</div>
              <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
              <p className="text-[9px] text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BANNER TIPO PÓSTER GRANDE ABAJO - BARBEROS PROFESIONALES */}
      <section className="py-12 px-4 sm:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-slate-950 via-indigo-950 to-[#0284c7] rounded-3xl p-6 sm:p-10 text-white shadow-[0_20px_50px_rgba(2,132,199,0.2)] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-center sm:text-left relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-[#00E5FF]/20 text-[#00E5FF] px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" /> Únete a la red VISARKA
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
              ¿Eres barbero profesional? <br />
              <span className="text-[#00E5FF]">Postúlate aquí y genera más ingresos</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Lleva tus servicios a domicilio con total flexibilidad de horarios, agenda automatizada y clientes VIP cerca de tu zona.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#00E5FF] hover:bg-cyan-300 text-slate-950 font-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm uppercase tracking-wide shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all transform hover:-translate-y-1 flex items-center gap-2 cursor-pointer"
            >
              <span>Postularme ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* BARRA INFERIOR MÓVIL */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-[0_-6px_25px_rgba(0,0,0,0.06)] z-40 px-2 py-1.5 sm:hidden grid grid-cols-4 gap-1">
        <button onClick={() => navigate('/')} className={`flex flex-col items-center py-1 rounded-xl ${activeBottomTab === 'home' ? 'text-sky-600 bg-sky-50 shadow-inner' : 'text-slate-500'}`}><Home className="w-5 h-5" /><span className="text-[10px]">Inicio</span></button>
        <button onClick={() => navigate('/catalog')} className="flex flex-col items-center py-1 text-slate-500"><Compass className="w-5 h-5" /><span className="text-[10px]">Explorar</span></button>
        <button 
          onClick={() => navigate('/calendariobarberos')} 
          className="flex flex-col items-center py-1 text-slate-500 cursor-pointer"
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">Exprés</span>
        </button>
        <button onClick={() => navigate('/panelprofesionales')} className="flex flex-col items-center py-1 text-slate-500"><User className="w-5 h-5" /><span className="text-[10px]">Barberos</span></button>
      </div>

      <footer className="py-6 text-center text-xs text-slate-500 bg-slate-50 mb-12 sm:mb-0">
        <p>© 2026 VISARKA. Barberos Profesionales a Domicilio.</p>
      </footer>
    </div>
  );
}