import React, { useState } from 'react';

export default function HomePrincipal() {
  const [activeCategory, setActiveCategory] = useState('Clásico');

  const categories = [
    { name: 'Degradados', icon: '⚡' },
    { name: 'Clásicos', icon: '✂️' },
    { name: 'Barbas', icon: '🧔' },
    { name: 'Color', icon: '🎨' },
    { name: 'Alisado', icon: '✨' },
    { name: 'Ondulados', icon: '🌀' },
    { name: 'Freestyles', icon: '🔥' },
    { name: 'Facial', icon: '🌿' },
  ];

  const barberosDestacados = [
    { 
      id: 1, 
      name: 'Carlos Mendoza', 
      category: 'Clásico & Fade', 
      price: 45000, 
      rating: 4.8, 
      img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60' 
    },
    { 
      id: 2, 
      name: 'Andrés Rivas', 
      category: 'Moderno', 
      price: 55000, 
      rating: 4.7, 
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60' 
    },
    { 
      id: 3, 
      name: 'Kintero VIP', 
      category: 'Visagismo', 
      price: 80000, 
      rating: 4.9, 
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60' 
    },
  ];

  const productosTienda = [
    {
      id: 1,
      name: 'Cera Mate Pro',
      precio: 35000,
      rating: 4.9,
      img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&auto=format&fit=crop&q=60',
      tag: 'Más Vendido'
    },
    {
      id: 2,
      name: 'Aceite Orgánico Barba',
      precio: 42000,
      rating: 4.8,
      img: 'https://images.unsplash.com/photo-1626516059049-bb2303565e23?w=500&auto=format&fit=crop&q=60',
      tag: '100% Natural'
    },
    {
      id: 3,
      name: 'Tónico Anticaída',
      precio: 65000,
      rating: 5.0,
      img: 'https://images.unsplash.com/photo-1608248597359-9d562c64cb25?w=500&auto=format&fit=crop&q=60',
      tag: 'Especial'
    },
    {
      id: 4,
      name: 'Kit Minitijeras Pro',
      precio: 85000,
      rating: 4.7,
      img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=60',
      tag: 'Profesional'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      
      <div className="w-full flex-1 bg-slate-950 sm:bg-slate-900 flex flex-col sm:flex-row shadow-2xl overflow-hidden">
        
        {/* ================= VISTA MÓVIL ================= */}
        <div className="w-full sm:w-[450px] h-screen sm:h-auto bg-slate-50 relative overflow-hidden flex flex-col sm:border-r border-slate-200">
          
          {/* Manchas de luz y sombra difuminadas en el fondo */}
          <div className="absolute top-10 -left-20 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-20 -right-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* NAVBAR FIJO CON MENÚ HAMBURGUESA */}
          <div className="relative">
            <header className="absolute top-0 left-0 right-0 z-50 h-16 px-6 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex justify-between items-center shadow-xs">
              <div className="flex items-center gap-2.5 cursor-pointer group">
                <img 
                  src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
                  alt="VISARKA Logo" 
                  className="h-8 w-auto object-contain group-hover:scale-105 transition duration-200" 
                />
                <span className="text-base font-black tracking-widest text-slate-900 group-hover:text-blue-600 transition">
                  VISARKA
                </span>
              </div>

              {/* Menú Hamburguesa */}
              {(() => {
                const [menuOpen, setMenuOpen] = React.useState(false);

                return (
                  <>
                    <button 
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="w-10 h-10 rounded-xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-1 text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer z-50"
                      aria-label="Abrir menú"
                    >
                      <span className={`w-5 h-0.5 bg-slate-800 rounded-full transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                      <span className={`w-5 h-0.5 bg-slate-800 rounded-full transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                      <span className={`w-5 h-0.5 bg-slate-800 rounded-full transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                    </button>

                    {menuOpen && (
                      <div className="absolute top-16 right-4 w-56 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-3 z-40 flex flex-col space-y-1.5 text-white animate-in fade-in zoom-in-95 duration-200">
                        <a href="#inicio" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-bold transition flex items-center gap-2">
                          🏠 Inicio
                        </a>
                        <a href="#servicios" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-bold transition flex items-center gap-2">
                          ✂️ Servicios y Sedes
                        </a>
                        <a href="#tienda" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-bold transition flex items-center gap-2">
                          🛍️ Tienda Express
                        </a>
                        <a href="#perfil" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-bold transition flex items-center gap-2">
                          👤 Mi Cuenta
                        </a>
                        <div className="h-px bg-white/10 my-1" />
                        <a 
                          href="/login"
                          onClick={() => setMenuOpen(false)}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs py-2.5 rounded-xl shadow-md transition text-center block"
                        >
                          🔑 Iniciar Sesión
                        </a>
                      </div>
                    )}
                  </>
                );
              })()}
            </header>
          </div>

          {/* ÁREA DE CONTENIDO INTEGRADA */}
          <main className="flex-1 overflow-y-auto pt-20 pb-12 space-y-6 px-5 scrollbar-none z-10">

            {/* SECCIÓN 1: CARRUSEL DE BANNERS (Con imagen de teléfonos grande y llamativa) */}
            <div className="relative">
              {(() => {
                const [bannerActual, setBannerActual] = React.useState(0);
                const [dragOffset, setDragOffset] = React.useState(0);
                const [isDragging, setIsDragging] = React.useState(false);
                const isPaused = React.useRef(false);
                const startX = React.useRef(0);

                React.useEffect(() => {
                  const timer = setInterval(() => {
                    if (!isPaused.current && !isDragging) {
                      setBannerActual((prev) => (prev === 2 ? 0 : prev + 1));
                    }
                  }, 5000);
                  return () => clearInterval(timer);
                }, [isDragging]);

                const handleStart = (clientX) => {
                  startX.current = clientX;
                  setIsDragging(true);
                  isPaused.current = true;
                };

                const handleMove = (clientX) => {
                  if (!isDragging) return;
                  const diff = clientX - startX.current;
                  setDragOffset(diff);
                };

                const handleEnd = () => {
                  if (!isDragging) return;
                  setIsDragging(false);
                  isPaused.current = false;

                  const threshold = 60;
                  if (dragOffset < -threshold) {
                    setBannerActual((prev) => (prev === 2 ? 0 : prev + 1));
                  } else if (dragOffset > threshold) {
                    setBannerActual((prev) => (prev === 0 ? 2 : prev - 1));
                  }
                  setDragOffset(0);
                };

                const banners = [
                  {
                    titulo: "Portal Exclusivo para Barberos",
                    desc: "Gestiona finanzas, caja y domicilios en tiempo real.",
                    boton: "Ingresar al Sistema",
                    link: "/login",
                    gradient: "from-slate-900 via-indigo-950 to-slate-900",
                    shadowColor: "shadow-indigo-900/30",
                    btnBg: "bg-emerald-600 text-white hover:bg-emerald-500",
                    type: "image",
                    content: "https://res.cloudinary.com/dtkirmtfq/image/upload/v1795041561/Visarka/mgeksqarheiihdewlpcz.png"
                  },
                  {
                    titulo: "Barbería a Domicilio, Worry Less!",
                    desc: "Reserva tu corte profesional hoy mismo hasta la puerta de tu hogar.",
                    boton: "Agendar Ya",
                    gradient: "from-slate-900 via-blue-950 to-indigo-950",
                    shadowColor: "shadow-blue-900/30",
                    btnBg: "bg-blue-600 text-white hover:bg-blue-500",
                    type: "emoji",
                    content: "💈"
                  },
                  {
                    titulo: "Establecimientos Cerca de Ti",
                    desc: "Encuentra locales aliados y barberías profesionales en tu zona.",
                    boton: "Ver Establecimientos",
                    gradient: "from-slate-900 via-purple-950 to-pink-950",
                    shadowColor: "shadow-purple-900/30",
                    btnBg: "bg-purple-600 text-white hover:bg-purple-500",
                    type: "emoji",
                    content: "📍"
                  }
                ];

                return (
                  <div className="overflow-hidden relative select-none">
                    <div 
                      onMouseDown={(e) => handleStart(e.clientX)}
                      onMouseMove={(e) => handleMove(e.clientX)}
                      onMouseUp={handleEnd}
                      onMouseLeave={() => { if (isDragging) handleEnd(); }}
                      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
                      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                      onTouchEnd={handleEnd}
                      className="flex cursor-grab active:cursor-grabbing touch-pan-y"
                      style={{
                        transform: `translateX(calc(-${bannerActual * 100}% + ${dragOffset}px))`,
                        transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
                      }}
                    >
                      {banners.map((item, idx) => (
                        <div key={idx} className="w-full shrink-0 pr-0.5">
                          <div className={`bg-gradient-to-r ${item.gradient} rounded-3xl p-5 text-white relative overflow-hidden shadow-xl ${item.shadowColor} flex justify-between items-center border border-white/10 min-h-[150px]`}>
                            <div className="space-y-2 z-10 max-w-[155px]">
                              <h3 className="text-xs font-black leading-tight tracking-tight">{item.titulo}</h3>
                              <p className="text-[9px] text-slate-300 font-medium leading-relaxed">{item.desc}</p>
                              {item.link ? (
                                <a href={item.link} className={`inline-block ${item.btnBg} font-extrabold text-[9px] px-3.5 py-2 rounded-xl shadow-md transition cursor-pointer`}>
                                  {item.boton}
                                </a>
                              ) : (
                                <button className={`${item.btnBg} font-extrabold text-[9px] px-3.5 py-2 rounded-xl shadow-md transition cursor-pointer`}>
                                  {item.boton}
                                </button>
                              )}
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-80 h-48 flex items-center justify-center pointer-events-none z-0">
                              {item.type === 'image' ? (
                                <img src={item.content} alt="Dashboard Barbero" className="w-full h-full object-contain drop-shadow-2xl opacity-100 scale-125 translate-x-2 translate-y-2" />
                              ) : (
                                <span className="text-6xl select-none drop-shadow-lg">{item.content}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center items-center gap-1.5 mt-3">
                      {[0, 1, 2].map((i) => (
                        <span 
                          key={i}
                          onClick={() => setBannerActual(i)} 
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${bannerActual === i ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* SECCIÓN 2: ESPECIALIDADES */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
                  Tenemos Barberos Expertos en:
                </h4>
                <span className="text-[11px] text-blue-600 font-bold cursor-pointer hover:underline">Ver todo</span>
              </div>
              
              <div className="grid grid-cols-4 gap-2.5 text-center">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition cursor-pointer backdrop-blur-md shadow-xs ${
                      activeCategory === cat.name 
                        ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25 scale-105 font-bold border-0' 
                        : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/60 shadow-2xs'
                    }`}
                  >
                    <span className="text-lg mb-1 drop-shadow-sm">{cat.icon}</span>
                    <span className="text-[9px] font-bold truncate w-full">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

          <div className="space-y-3 pt-2">
  <div className="flex justify-between items-center px-1">
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
        Modalidad de Reserva
      </h4>
    </div>
  </div>

  <div className="grid grid-cols-2 gap-3">
    {/* BANNER 1: BARBEROS EN VIVO (Intermitente con destellos suaves y difuminados) */}
    <div className="aspect-square bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 rounded-3xl p-4 text-white relative overflow-hidden shadow-xl shadow-emerald-500/20 border border-emerald-400/30 flex flex-col justify-between">
      {/* Destellos suaves y difuminados intermitentes */}
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-400/25 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
      <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-teal-400/20 rounded-full blur-2xl animate-ping pointer-events-none" style={{ animationDuration: '3s' }}></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-teal-300/10 animate-pulse pointer-events-none"></div>

      <div className="space-y-1.5 relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 rounded-full text-[8px] font-black text-emerald-300 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          En VIVO · Ya
        </div>
        <h3 className="text-xs font-black tracking-tight leading-snug">
          Barbero listo a tu ubicación
        </h3>
        <p className="text-[9px] text-emerald-100/80 font-medium leading-tight">
          Desplazamiento inmediato hoy.
        </p>
      </div>

      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2 overflow-hidden">
            {barberosDestacados.slice(0, 3).map((b, idx) => (
              <img key={idx} className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover" src={b.img} alt={b.name} />
            ))}
          </div>
          <span className="text-lg drop-shadow-md">🛵</span>
        </div>

        <button className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-[10px] py-2 rounded-xl shadow-lg shadow-emerald-500/30 transition cursor-pointer active:scale-95">
          Pedir Ya ⚡
        </button>
      </div>
    </div>

    {/* BANNER 2: CITAS PROGRAMADAS CON ANTICIPACIÓN */}
    <div className="aspect-square bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-4 text-white relative overflow-hidden shadow-xl shadow-blue-900/20 border border-blue-500/30 flex flex-col justify-between">
      <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="space-y-1.5 relative z-10">
        <div className="inline-flex items-center gap-1 bg-blue-500/20 border border-blue-400/40 px-2 py-0.5 rounded-full text-[8px] font-black text-blue-300 uppercase tracking-wider">
          <span>🕒 Anticipación</span>
        </div>
        <h3 className="text-xs font-black tracking-tight leading-snug">
          Agenda tu cita sin filas
        </h3>
        <p className="text-[9px] text-slate-300 font-medium leading-tight">
          Elige día, hora y barbero 24/7.
        </p>
      </div>

      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2 overflow-hidden">
            {barberosDestacados.slice(0, 3).map((b, idx) => (
              <img key={idx} className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover" src={b.img} alt={b.name} />
            ))}
          </div>
          <span className="text-lg drop-shadow-md">🗓️</span>
        </div>

        <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[10px] py-2 rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer active:scale-95">
          Agendar 📅
        </button>
      </div>
    </div>
  </div>
</div>

        {/* SECCIÓN 3: TIENDA EXPRESS & KITS */}
<div className="space-y-3 pt-2">
  <div className="flex justify-between items-center px-1">
    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
      🛍️ Tienda Express & Kits
    </h4>
    <a href="/marketplace" className="text-[11px] text-blue-600 font-bold cursor-pointer hover:underline">Ver catálogo</a>
  </div>

  {/* Banner Publicitario de Ventas a Domicilio */}
  <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 rounded-3xl p-5 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20 flex justify-between items-center border border-white/20">
    <div className="space-y-2 z-10 max-w-[205px]">
      <span className="bg-white/20 backdrop-blur-md text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
        🚀 Envíos a Domicilio
      </span>
      <h3 className="text-sm font-black leading-tight tracking-tight">Ceras, lacas, shampoo, máquinas y mucho más</h3>
      <p className="text-[10px] text-white/90 font-medium leading-snug">
        Consigue de todo en un solo lugar y recíbelo directo en tu casa con entrega express.
      </p>
      <a href="/marketplace" className="inline-block bg-white text-blue-950 hover:bg-blue-50 font-extrabold text-[10px] px-4 py-2 rounded-xl shadow-lg transition cursor-pointer active:scale-95">
        Ir a ver el Marketplace →
      </a>
    </div>
    <div className="absolute -right-4 -bottom-4 w-36 h-36 flex items-center justify-center pointer-events-none z-0">
      <span className="text-7xl select-none drop-shadow-2xl animate-pulse">📦</span>
    </div>
  </div>
</div>

            {/* FOOTER MÓVIL CON EL MISMO DISEÑO Y DEGRADADOS */}
            <footer className="mt-8 pt-6 pb-8 border-t border-slate-200/80 bg-gradient-to-b from-transparent via-slate-100/50 to-slate-200/60 rounded-3xl px-5 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 cursor-pointer group">
                <img 
                  src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
                  alt="VISARKA Logo" 
                  className="h-6 w-auto object-contain" 
                />
                <span className="text-sm font-black tracking-widest text-slate-900">
                  VISARKA
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                La plataforma líder en Bogotá para servicios de barbería profesional a domicilio y establecimientos aliados.
              </p>
              <div className="flex justify-center gap-4 text-xs font-bold text-blue-600">
                <a href="#terminos" className="hover:underline">Términos</a>
                <a href="#privacidad" className="hover:underline">Privacidad</a>
                <a href="/login" className="hover:underline">Portal Barberos</a>
              </div>
              <div className="text-[9px] text-slate-400 font-bold pt-2 border-t border-slate-200">
                Visarka Barber Platform &copy; 2026 — Bogotá, Colombia
              </div>
            </footer>

          </main>

        </div>

        {/* ================= PANEL PRINCIPAL PARA PC ================= */}
        <div className="hidden sm:flex flex-1 flex-col justify-between p-10 bg-slate-900 text-white overflow-y-auto">
          <div className="space-y-8 max-w-6xl mx-auto w-full">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-2xl font-black text-white">Visarka Barber Executive Suite ✂️</h1>
                <p className="text-xs text-slate-400 mt-1">Panel administrativo central para barberos profesionales y servicios a domicilio en Bogotá.</p>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg border border-white/10">
                Sistema Operativo Activo
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 shadow-lg space-y-3 hover:border-blue-500/50 transition backdrop-blur-md">
                <span className="text-3xl">📅</span>
                <h4 className="font-extrabold text-base text-white">Gestión de Citas y Horarios</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Organiza tu disponibilidad horaria, filtra días ocupados y atiende a tus clientes con absoluta precisión y control operativo.</p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 shadow-lg space-y-3 hover:border-blue-500/50 transition backdrop-blur-md">
                <span className="text-3xl">💰</span>
                <h4 className="font-extrabold text-base text-white">Control Financiero & Propinas</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Lleva el registro exacto de ingresos, egresos, metas diarias y ganancias calculadas en tiempo real para maximizar tus ingresos.</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center space-y-4 shadow-2xl border border-white/10">
              <h3 className="text-lg font-black">Lleva tu talento al siguiente nivel</h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">Combina herramientas de visagismo por escaneo facial, reservas móviles optimizadas y atención directa a domicilio sin comisiones excesivas ni intermediarios.</p>
              <div>
                <a href="/login" className="inline-block bg-blue-600 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md hover:bg-blue-500 transition cursor-pointer">
                  Acceder al Panel Profesional
                </a>
              </div>
            </div>

          </div>

          <div className="text-center text-[11px] text-slate-500 pt-8 border-t border-slate-800 max-w-6xl mx-auto w-full mt-6">
            Visarka Barber Platform &copy; 2026 — Diseñado a ancho completo para estaciones de trabajo profesionales.
          </div>
        </div>

      </div>
    </div>
  );
}