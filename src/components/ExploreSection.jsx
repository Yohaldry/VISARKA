import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const cortesMock = [
  { 
    id: 1, 
    title: "Degradado Alto con Rizos", 
    barber: "@juanbarber",
    image: "https://tahecosmetics.com/trends/wp-content/uploads/2023/02/corte-fade-flequillo-largo.jpg",
    tiempo: "45 min"
  },
  { 
    id: 2, 
    title: "Crop Texturizado", 
    barber: "@stylemen",
    image: "https://tahecosmetics.com/trends/wp-content/uploads/2023/02/pompadour-fade.jpg",
    tiempo: "40 min"
  },
  { 
    id: 3, 
    title: "Degradado Medio", 
    barber: "@barberking",
    image: "https://static.wixstatic.com/media/4304a4_d7707815b8d940a0b237a7a0c488e563~mv2.webp/v1/fill/w_568,h_568,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/4304a4_d7707815b8d940a0b237a7a0c488e563~mv2.webp",
    tiempo: "50 min"
  },
  { 
    id: 4, 
    title: "Undercut con Rayas", 
    barber: "@cortespro",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=60",
    tiempo: "45 min"
  },
  { 
    id: 5, 
    title: "French Crop", 
    barber: "@barberzone",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60",
    tiempo: "35 min"
  },
];

export default function ExploreSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <section className="px-3 sm:px-6 py-10 bg-black text-white w-full border-b border-zinc-900 font-mono">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-zinc-900 border border-[#ccff00]/30 px-2.5 py-1 rounded text-[9px] text-[#ccff00] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-ping"></span>
              <span>GALERÍA TÉCNICA // VISAGISMO</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              EXPLORA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-white">TENDENCIAS</span>
            </h2>
          </div>

          <a href="#ver-todos" className="text-xs text-[#ccff00] hover:underline flex items-center gap-1">
            Ver catálogo completo <span>→</span>
          </a>
        </div>

        {/* Pestañas (Tabs) estilizadas */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {['Populares', 'Degradados', 'Rizados', 'Clásicos', 'Modernos', 'Tendencias'].map((tab, idx) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(idx)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap cursor-pointer ${
                activeTab === idx 
                  ? 'bg-[#ccff00] text-black font-extrabold shadow-[0_0_15px_rgba(204,255,0,0.25)]' 
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-[#ccff00]/40 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid ajustado con tarjetas cuadradas en móvil y proporcionales en escritorio */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
          {cortesMock.map((corte) => (
            <div 
              key={corte.id} 
              onClick={() => setSelectedImage(corte)}
              className="group relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 aspect-square flex flex-col justify-between p-2 sm:p-3 transition-all duration-300 hover:border-[#ccff00]/60 hover:shadow-[0_0_20px_rgba(204,255,0,0.15)] cursor-pointer"
            >
              
              {/* Imagen de fondo con zoom al hacer hover */}
              <div className="absolute inset-0">
                <img 
                  src={corte.image} 
                  alt={corte.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-75 group-hover:opacity-90"
                />
              </div>

              {/* Degradado oscuro para legibilidad */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

              {/* Encabezado de la tarjeta */}
              <div className="relative z-10 flex justify-between items-center gap-1">
                <span className="text-[8px] sm:text-[10px] bg-black/80 backdrop-blur-md border border-zinc-800 text-[#ccff00] px-1.5 py-0.5 rounded font-bold truncate max-w-[65%]">
                  {corte.barber}
                </span>
                <span className="text-[7px] sm:text-[9px] text-zinc-400 bg-black/80 backdrop-blur-md px-1 py-0.5 rounded border border-zinc-800 whitespace-nowrap">
                  {corte.tiempo}
                </span>
              </div>

              {/* Contenido inferior de la tarjeta (Título) */}
              <div className="relative z-10">
                <h4 className="text-[9px] sm:text-xs font-bold text-white leading-tight line-clamp-1 sm:line-clamp-2">
                  {corte.title}
                </h4>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* ================= MODAL PARA AMPLIAR IMAGEN ================= */}
      <AnimatePresence>
        {selectedImage && (
          <div 
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-[#ccff00]/40 rounded-2xl overflow-hidden max-w-lg w-full relative shadow-[0_0_50px_rgba(204,255,0,0.2)] font-mono"
            >
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 z-20 text-zinc-400 hover:text-[#ccff00] text-xs font-bold w-7 h-7 rounded-full bg-black/80 border border-zinc-800 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>

              <div className="w-full h-72 sm:h-96 relative bg-black">
                <img 
                  src={selectedImage.image} 
                  alt={selectedImage.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              </div>

              <div className="p-4 bg-zinc-950 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#ccff00] font-bold">{selectedImage.barber}</span>
                  <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400">{selectedImage.tiempo}</span>
                </div>
                <h3 className="text-sm font-black text-white">{selectedImage.title}</h3>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}