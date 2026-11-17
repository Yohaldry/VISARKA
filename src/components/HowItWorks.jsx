import React from 'react';

export default function HowItWorks() {
  return (
    <section className="bg-[#070E18] text-white py-10 px-4 sm:px-8 overflow-hidden w-full">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center text-lg sm:text-xl font-black tracking-wide mb-8 text-white">
          ¿CÓMO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FC] to-[#38BDF8]">FUNCIONA?</span>
        </h2>

        {/* Pasos súper compactos y minimalistas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch mb-10">
          
          <div className="bg-[#0F172A]/70 border border-[#1E3E62]/60 p-3.5 rounded-xl flex flex-col items-center text-center relative backdrop-blur-sm">
            <span className="absolute top-2 right-2.5 text-[#38BDF8] font-mono font-bold text-[10px]">01</span>
            <div className="w-9 h-9 rounded-lg bg-[#1E3E62]/50 border border-[#38BDF8]/30 flex items-center justify-center text-base mb-2.5 shadow-inner">
              ☁️
            </div>
            <h4 className="font-bold text-xs text-white mb-1">Sube 3 fotos</h4>
            <p className="text-[10px] text-gray-400 leading-tight">Frente, perfil y parte trasera ideal.</p>
          </div>

          <div className="bg-[#0F172A]/70 border border-[#1E3E62]/60 p-3.5 rounded-xl flex flex-col items-center text-center relative backdrop-blur-sm">
            <span className="absolute top-2 right-2.5 text-[#38BDF8] font-mono font-bold text-[10px]">02</span>
            <div className="w-9 h-9 rounded-lg bg-[#1E3E62]/50 border border-[#38BDF8]/30 flex items-center justify-center text-base mb-2.5 shadow-inner">
              📋
            </div>
            <h4 className="font-bold text-xs text-white mb-1">Ficha técnica</h4>
            <p className="text-[10px] text-gray-400 leading-tight">Detalles clave para tu barbero.</p>
          </div>

          <div className="bg-[#0F172A]/70 border border-[#1E3E62]/60 p-3.5 rounded-xl flex flex-col items-center text-center relative backdrop-blur-sm">
            <span className="absolute top-2 right-2.5 text-[#38BDF8] font-mono font-bold text-[10px]">03</span>
            <div className="w-9 h-9 rounded-lg bg-[#1E3E62]/50 border border-[#38BDF8]/30 flex items-center justify-center text-base mb-2.5 shadow-inner">
              👁️
            </div>
            <h4 className="font-bold text-xs text-white mb-1">Comparte</h4>
            <p className="text-[10px] text-gray-400 leading-tight">Guárdala o muéstrala al instante.</p>
          </div>

          <div className="bg-[#0F172A]/70 border border-[#1E3E62]/60 p-3.5 rounded-xl flex flex-col items-center text-center relative backdrop-blur-sm">
            <span className="absolute top-2 right-2.5 text-[#38BDF8] font-mono font-bold text-[10px]">04</span>
            <div className="w-9 h-9 rounded-lg bg-[#1E3E62]/50 border border-[#38BDF8]/30 flex items-center justify-center text-base mb-2.5 shadow-inner">
              ✂️
            </div>
            <h4 className="font-bold text-xs text-white mb-1">Corte perfecto</h4>
            <p className="text-[10px] text-gray-400 leading-tight">El resultado exacto que buscas.</p>
          </div>

        </div>
      </div>

      {/* Bloque Inferior - Tarjetas compactas en tonos azul oscuro */}
      <div className="bg-[#0B192C] text-white -mx-4 sm:-mx-8 -mb-10 pt-8 pb-0 px-4 sm:px-8 border-t border-[#1E3E62]/40">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center text-sm sm:text-base font-bold tracking-wider mb-6">
            DISEÑADO PARA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FC] to-[#38BDF8]">CLIENTES Y BARBEROS</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            
            <div className="bg-[#0F172A] border border-[#1E3E62] p-4 sm:p-5 rounded-xl text-center flex flex-col justify-between shadow-lg">
              <div>
                <div className="text-xl mb-1.5">👤</div>
                <h4 className="font-bold text-xs sm:text-sm mb-1 text-white">Para Clientes</h4>
                <p className="text-gray-400 text-[10px] sm:text-[11px] mb-4 leading-relaxed">Encuentra inspiración, guarda tus cortes favoritos y crea tu ficha técnica.</p>
              </div>
              <button className="bg-gradient-to-r from-[#00D2FC] to-[#38BDF8] text-[#0B192C] font-extrabold px-4 py-1.5 rounded-lg text-[10px] hover:opacity-95 transition w-full sm:w-auto mx-auto cursor-pointer shadow-sm">
                CREAR MI FICHA
              </button>
            </div>

            <div className="bg-[#0F172A] border border-[#1E3E62] p-4 sm:p-5 rounded-xl text-center flex flex-col justify-between shadow-lg">
              <div>
                <div className="text-xl mb-1.5">✂️</div>
                <h4 className="font-bold text-xs sm:text-sm mb-1 text-white">Para Barberos</h4>
                <p className="text-gray-400 text-[10px] sm:text-[11px] mb-4 leading-relaxed">Entiende mejor a tus clientes, mejora tu servicio y ofrece resultados precisos.</p>
              </div>
              <button className="border border-[#38BDF8]/40 bg-[#1E3E62]/30 text-[#38BDF8] font-bold px-4 py-1.5 rounded-lg text-[10px] hover:bg-[#1E3E62]/60 transition w-full sm:w-auto mx-auto cursor-pointer">
                MÁS INFORMACIÓN
              </button>
            </div>

          </div>
        </div>

        {/* Estadísticas en barra estilizada azul */}
        <div className="bg-[#050B14] border-t border-[#1E3E62]/50 text-white py-4 px-4 sm:px-8 -mx-4 sm:-mx-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-around text-center md:text-left">
          <div className="max-w-xs mx-auto md:mx-0 flex items-center justify-center md:justify-start gap-2.5">
            <span className="text-xl">👥</span>
            <div>
              <strong className="text-xs sm:text-sm block leading-none mb-0.5 text-[#38BDF8] font-mono">+5,000</strong>
              <p className="text-[10px] m-0 text-gray-400 font-medium">Cortes subidos</p>
            </div>
          </div>
          <div className="max-w-xs mx-auto md:mx-0 flex items-center justify-center gap-2.5">
            <span className="text-xl">❤️</span>
            <div>
              <strong className="text-xs sm:text-sm block leading-none mb-0.5 text-[#38BDF8] font-mono">+20,000</strong>
              <p className="text-[10px] m-0 text-gray-400 font-medium">Usuarios activos</p>
            </div>
          </div>
          <div className="max-w-xs mx-auto md:mx-0 flex items-center justify-center md:justify-end gap-2.5">
            <span className="text-xl">🏆</span>
            <div>
              <strong className="text-xs sm:text-sm block leading-none mb-0.5 text-[#38BDF8] font-mono">Comunidad N°1</strong>
              <p className="text-[10px] m-0 text-gray-400 font-medium">en referencias digitales</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}