import React, { useState, useEffect, useRef } from 'react';

const CATEGORIES = [
  { name: 'Degradados', icon: '⚡' }, { name: 'Clásicos', icon: '✂️' },
  { name: 'Barbas', icon: '🧔' }, { name: 'Color', icon: '🎨' },
  { name: 'Alisado', icon: '✨' }, { name: 'Ondulados', icon: '🌀' },
  { name: 'Freestyles', icon: '🔥' }, { name: 'Facial', icon: '🌿' },
];

const BARBEROS = [
  { id: 1, name: 'Carlos Mendoza', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60' },
  { id: 2, name: 'Andrés Rivas', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60' },
  { id: 3, name: 'Kintero VIP', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60' },
];

const BANNERS = [
  { titulo: 'Portal Exclusivo para Barberos', desc: 'Gestiona finanzas, caja y domicilios en tiempo real con nuestra suite administrativa.', boton: 'Ingresar al Sistema', link: '/login', grad: 'from-slate-900 via-indigo-950 to-slate-900', shadow: 'shadow-indigo-900/20', btn: 'bg-emerald-600 text-white hover:bg-emerald-500', type: 'img', content: 'https://res.cloudinary.com/dtkirmtfq/image/upload/v1795041561/Visarka/mgeksqarheiihdewlpcz.png' },
  { titulo: 'Barbería a Domicilio, Worry Less!', desc: 'Reserva tu corte profesional hoy mismo hasta la puerta de tu hogar en Bogotá.', boton: 'Agendar Ya', grad: 'from-slate-900 via-blue-950 to-indigo-950', shadow: 'shadow-blue-900/20', btn: 'bg-blue-600 text-white hover:bg-blue-500', type: 'emoji', content: '💈' },
  { titulo: 'Establecimientos Cerca de Ti', desc: 'Encuentra locales aliados y barberías profesionales de alta categoría en tu zona.', boton: 'Ver Establecimientos', grad: 'from-slate-900 via-purple-950 to-pink-950', shadow: 'shadow-purple-900/20', btn: 'bg-purple-600 text-white hover:bg-purple-500', type: 'emoji', content: '📍' },
];

export default function HomePrincipal() {
  const [activeCategory, setActiveCategory] = useState('Clásico');
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerActual, setBannerActual] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isPaused = useRef(false);
  const startX = useRef(0);

  useEffect(() => {
    const t = setInterval(() => {
      if (!isPaused.current && !isDragging) setBannerActual((p) => (p === 2 ? 0 : p + 1));
    }, 5000);
    return () => clearInterval(t);
  }, [isDragging]);

  const onStart = (x) => { startX.current = x; setIsDragging(true); isPaused.current = true; };
  const onMove = (x) => { if (isDragging) setDragOffset(x - startX.current); };
  const onEnd = () => {
    if (!isDragging) return;
    setIsDragging(false); isPaused.current = false;
    if (dragOffset < -60) setBannerActual((p) => (p === 2 ? 0 : p + 1));
    else if (dragOffset > 60) setBannerActual((p) => (p === 0 ? 2 : p - 1));
    setDragOffset(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative text-slate-900 flex flex-col justify-between">
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 -left-20 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-8 flex justify-between items-center relative">
          <div className="flex items-center gap-3 cursor-pointer group">
            <img src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" alt="VISARKA Logo" className="h-8 md:h-9 w-auto object-contain group-hover:scale-105 transition duration-200" />
            <span className="text-base md:text-lg font-black tracking-widest text-slate-900 group-hover:text-blue-600 transition">VISARKA</span>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="w-10 h-10 rounded-xl bg-slate-100/80 border border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-700 hover:bg-slate-200 transition shadow-xs cursor-pointer z-50" aria-label="Abrir menú">
            <span className={`w-5 h-0.5 bg-slate-800 rounded-full transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`w-5 h-0.5 bg-slate-800 rounded-full transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-slate-800 rounded-full transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
          {menuOpen && (
            <div className="absolute top-16 right-4 sm:right-8 w-60 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-3 z-50 flex flex-col space-y-1.5 text-white">
              {[['#inicio', '🏠 Inicio'], ['#servicios', '✂️ Servicios y Sedes'], ['#tienda', '🛍️ Tienda Express'], ['#perfil', '👤 Mi Cuenta']].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-bold transition flex items-center gap-2">{label}</a>
              ))}
              <div className="h-px bg-white/10 my-1" />
              <a href="/login" onClick={() => setMenuOpen(false)} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs py-2.5 rounded-xl shadow-md transition text-center block">🔑 Iniciar Sesión</a>
            </div>
          )}
        </div>
      </header>

      <main id="inicio" className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-22 pb-12 space-y-8 z-10 flex-1 overflow-x-hidden">
        <div className="overflow-hidden relative select-none rounded-3xl">
          <div
            onMouseDown={(e) => onStart(e.clientX)} onMouseMove={(e) => onMove(e.clientX)} onMouseUp={onEnd} onMouseLeave={() => isDragging && onEnd()}
            onTouchStart={(e) => onStart(e.touches[0].clientX)} onTouchMove={(e) => onMove(e.touches[0].clientX)} onTouchEnd={onEnd}
            className="flex cursor-grab active:cursor-grabbing touch-pan-y"
            style={{ transform: `translateX(calc(-${bannerActual * 100}% + ${dragOffset}px))`, transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' }}
          >
            {BANNERS.map((item, idx) => (
              <div key={idx} className="w-full shrink-0">
                <div className={`bg-gradient-to-r ${item.grad} rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl ${item.shadow} flex justify-between items-center border border-white/10 min-h-[170px] sm:min-h-[220px]`}>
                  <div className="space-y-3 z-10 max-w-[240px] sm:max-w-md">
                    <h3 className="text-sm sm:text-2xl font-black leading-tight tracking-tight">{item.titulo}</h3>
                    <p className="text-[10px] sm:text-sm text-slate-300 font-medium leading-relaxed">{item.desc}</p>
                    {item.link
                      ? <a href={item.link} className={`inline-block ${item.btn} font-extrabold text-[10px] sm:text-xs px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-md transition cursor-pointer`}>{item.boton}</a>
                      : <button className={`${item.btn} font-extrabold text-[10px] sm:text-xs px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-md transition cursor-pointer`}>{item.boton}</button>}
                  </div>
                  <div className="absolute -right-12 -bottom-4 sm:right-6 sm:bottom-0 w-70 h-50 sm:w-80 sm:h-56 flex items-center justify-center pointer-events-none z-0">
                    {item.type === 'img'
                      ? <img src={item.content} alt="Dashboard Barbero" className="w-full h-full object-contain drop-shadow-2xl opacity-100 scale-125 sm:scale-110" />
                      : <span className="text-6xl sm:text-9xl select-none drop-shadow-lg">{item.content}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center items-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <span key={i} onClick={() => setBannerActual(i)} className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${bannerActual === i ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300'}`} />
            ))}
          </div>
        </div>

        <div id="servicios" className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900">Tenemos Barberos Expertos en:</h4>
            <span className="text-[11px] sm:text-xs text-blue-600 font-bold cursor-pointer hover:underline">Ver todo</span>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 text-center">
            {CATEGORIES.map((cat) => (
              <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition cursor-pointer backdrop-blur-md shadow-xs ${activeCategory === cat.name ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25 scale-105 font-bold border-0' : 'bg-white hover:bg-slate-100/80 text-slate-700 border border-slate-200/80 shadow-2xs'}`}>
                <span className="text-xl sm:text-2xl mb-1.5 drop-shadow-sm">{cat.icon}</span>
                <span className="text-[10px] sm:text-xs font-bold truncate w-full">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 px-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900">Modalidad de Reserva</h4>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="aspect-square sm:aspect-auto sm:min-h-[200px] bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 rounded-3xl p-4 sm:p-7 text-white relative overflow-hidden shadow-xl shadow-emerald-500/10 border border-emerald-400/30 flex flex-col justify-between">
              <div className="absolute -right-8 -top-8 w-28 sm:w-36 h-28 sm:h-36 bg-emerald-400/20 rounded-full blur-2xl animate-pulse pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 w-28 sm:w-36 h-28 sm:h-36 bg-teal-400/15 rounded-full blur-2xl animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-teal-300/10 animate-pulse pointer-events-none" />
              <div className="space-y-1.5 sm:space-y-2 relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-black text-emerald-300 uppercase tracking-wider">
                  <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-ping" />En VIVO · Ya
                </div>
                <h3 className="text-xs sm:text-lg font-black tracking-tight leading-snug">Barbero listo a tu ubicación</h3>
                <p className="text-[9px] sm:text-xs text-emerald-100/80 font-medium leading-tight sm:leading-relaxed">Desplazamiento inmediato hoy.</p>
              </div>
              <div className="relative z-10 space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden">
                    {BARBEROS.map((b) => <img key={b.id} className="inline-block h-6 w-6 sm:h-8 sm:w-8 rounded-full ring-2 ring-slate-900 object-cover" src={b.img} alt={b.name} />)}
                  </div>
                  <span className="text-lg sm:text-2xl drop-shadow-md">🛵</span>
                </div>
                <button
                  type="button"
                  onClick={() => { window.location.assign('/profesionalesactivos'); }}
                  className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-[10px] sm:text-xs py-2 sm:py-3 rounded-xl shadow-lg shadow-emerald-500/30 transition cursor-pointer active:scale-95"
                >
                  Pedir Ya ⚡
                </button>
              </div>
            </div>

            <div className="aspect-square sm:aspect-auto sm:min-h-[200px] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-4 sm:p-7 text-white relative overflow-hidden shadow-xl shadow-blue-900/10 border border-blue-500/30 flex flex-col justify-between">
              <div className="absolute -left-8 -bottom-8 w-28 sm:w-36 h-28 sm:h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-1.5 sm:space-y-2 relative z-10">
                <div className="inline-flex items-center gap-1 bg-blue-500/20 border border-blue-400/40 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-black text-blue-300 uppercase tracking-wider">🕒 Anticipación</div>
                <h3 className="text-xs sm:text-lg font-black tracking-tight leading-snug">Agenda tu cita sin filas</h3>
                <p className="text-[9px] sm:text-xs text-slate-300 font-medium leading-tight sm:leading-relaxed">Elige día, hora y barbero 24/7.</p>
              </div>
              <div className="relative z-10 space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden">
                    {BARBEROS.map((b) => <img key={b.id} className="inline-block h-6 w-6 sm:h-8 sm:w-8 rounded-full ring-2 ring-slate-900 object-cover" src={b.img} alt={b.name} />)}
                  </div>
                  <span className="text-lg sm:text-2xl drop-shadow-md">🗓️</span>
                </div>
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[10px] sm:text-xs py-2 sm:py-3 rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer active:scale-95">Agendar 📅</button>
              </div>
            </div>
          </div>
        </div>

        <div id="tienda" className="space-y-4 pt-2">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900">🛍️ Tienda Express & Kits</h4>
            <a href="/marketplace" className="text-[11px] sm:text-xs text-blue-600 font-bold cursor-pointer hover:underline">Ver catálogo completo</a>
          </div>
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20 flex justify-between items-center border border-white/20">
            <div className="space-y-3 z-10 max-w-sm sm:max-w-xl">
              <span className="bg-white/20 backdrop-blur-md text-white text-[9px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">🚀 Envíos a Domicilio Express</span>
              <h3 className="text-base sm:text-2xl font-black leading-tight tracking-tight">Ceras, lacas, shampoo, máquinas y mucho más</h3>
              <p className="text-[11px] sm:text-sm text-white/90 font-medium leading-relaxed">Consigue todo lo que necesitas para tu cuidado personal o barbería en un solo lugar y recíbelo directo en tu casa.</p>
              <a href="/marketplace" className="inline-block bg-white text-blue-950 hover:bg-blue-50 font-extrabold text-xs sm:text-sm px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-lg transition cursor-pointer active:scale-95">Ir a ver el Marketplace →</a>
            </div>
            <div className="absolute -right-4 -bottom-4 sm:right-8 sm:bottom-0 w-36 h-36 sm:w-52 sm:h-52 flex items-center justify-center pointer-events-none z-0 opacity-80 sm:opacity-100">
              <span className="text-7xl sm:text-9xl select-none drop-shadow-2xl animate-pulse">📦</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-slate-200/80 bg-gradient-to-b from-white/60 to-slate-100/90 py-8 px-4 sm:px-8 mt-10 text-center space-y-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2.5 cursor-pointer group">
            <img src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" alt="VISARKA Logo" className="h-7 w-auto object-contain" />
            <span className="text-base font-black tracking-widest text-slate-900">VISARKA</span>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md mx-auto">La plataforma líder en Bogotá para servicios de barbería profesional a domicilio y establecimientos aliados.</p>
          <div className="flex justify-center gap-6 text-xs font-bold text-blue-600">
            <a href="#terminos" className="hover:underline">Términos</a>
            <a href="#privacidad" className="hover:underline">Privacidad</a>
            <a href="/login" className="hover:underline">Portal Barberos</a>
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-bold pt-3 border-t border-slate-200/60 max-w-lg mx-auto">Visarka Barber Platform &copy; 2026 — Bogotá, Colombia</div>
        </div>
      </footer>
    </div>
  );
}