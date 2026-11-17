import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Menu, 
  X, 
  UserCheck, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  FileText 
} from 'lucide-react';

export default function Navbar({ onOpenFichaModal }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detectar scroll para ajustar la sombra e intensidad del fondo
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md shadow-sky-500/5 py-3 border-b border-sky-100' 
          : 'bg-white/70 backdrop-blur-sm py-4 border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* LOGO */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 p-0.5 shadow-md shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                ARKANA<span className="text-sky-500 font-bold">VISION</span>
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600 -mt-1">
                Visagismo & IA
              </span>
            </div>
          </a>

          {/* MENÚ DE NAVEGACIÓN DESKTOP */}
          <nav className="hidden md:flex items-center gap-1 bg-sky-50/60 border border-sky-100 p-1.5 rounded-full shadow-inner">
            <a 
              href="#caracteristicas" 
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-white transition-all"
            >
              Beneficios
            </a>
            <a 
              href="#visagismo" 
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-white transition-all"
            >
              Escáner IA
            </a>
            <a 
              href="#ficha-tecnica" 
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-white transition-all flex items-center gap-1.5"
            >
              <span>Ficha Técnica</span>
              <span className="bg-sky-100 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-sky-200">
                PRO
              </span>
            </a>
            <a 
              href="#testimonios" 
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-white transition-all"
            >
              Barberos
            </a>
          </nav>

          {/* BOTONES DE ACCIÓN DESKTOP */}
          <div className="hidden md:flex items-center gap-3">
            <a 
              href="/panelprofesionales" 
              className="text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-sky-500" />
              <span>Soy Barbero</span>
            </a>

            {/* BOTÓN PRINCIPAL: CREAR FICHA TÉCNICA GRATIS */}
            <button
              onClick={onOpenFichaModal}
              className="relative group overflow-hidden rounded-xl p-[2px] cursor-pointer active:scale-95 transition-transform"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-400 rounded-xl group-hover:opacity-90 transition-opacity"></span>
              <div className="relative px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 rounded-[10px] flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-sky-500/25">
                <FileText className="w-4 h-4 text-sky-200 group-hover:scale-110 transition-transform" />
                <span>Crear Ficha Gratis</span>
                <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded font-black tracking-normal ml-0.5">
                  100% GRATIS
                </span>
              </div>
            </button>
          </div>

          {/* BOTÓN MENÚ MÓVIL */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenFichaModal}
              className="bg-gradient-to-r from-blue-600 to-sky-500 text-white p-2 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm shadow-sky-500/30 active:scale-95 transition-transform"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>Ficha Gratis</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-sky-50 text-blue-600 hover:bg-sky-100 transition-colors border border-sky-100"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-sky-100 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          <nav className="flex flex-col space-y-1">
            <a 
              href="#caracteristicas" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-blue-600 transition-all flex items-center justify-between"
            >
              <span>Beneficios</span>
              <ChevronRight className="w-4 h-4 text-sky-400" />
            </a>
            <a 
              href="#visagismo" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-blue-600 transition-all flex items-center justify-between"
            >
              <span>Escáner IA</span>
              <ChevronRight className="w-4 h-4 text-sky-400" />
            </a>
            <a 
              href="#ficha-tecnica" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-blue-600 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>Ficha Técnica de Visagismo</span>
                <span className="bg-sky-100 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-sky-200">
                  NUEVO
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-400" />
            </a>
            <a 
              href="#testimonios" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-blue-600 transition-all flex items-center justify-between"
            >
              <span>Opiniones de Barberos</span>
              <ChevronRight className="w-4 h-4 text-sky-400" />
            </a>
            <a 
              href="/panelprofesionales" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-blue-600 bg-sky-50 border border-sky-100 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-500" />
                Acceso Barberos
              </span>
              <ChevronRight className="w-4 h-4 text-sky-400" />
            </a>
          </nav>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenFichaModal) onOpenFichaModal();
              }}
              className="w-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-transform"
            >
              <FileText className="w-4 h-4" />
              <span>Crear Mi Ficha Técnica Gratis</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sin registros extensos ni tarjetas de crédito</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}