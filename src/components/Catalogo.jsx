import React, { useState } from 'react';
import { 
  Star, 
  ArrowRight,
  X
} from 'lucide-react';

export default function Catalogo({ setCurrentTab }) {
  const [activeCategory, setActiveCategory] = useState('todos'); // 'todos', 'barber', 'estilista', 'visagismo'
  const [selectedCut, setSelectedCut] = useState(null);

  const catalogItems = [
    {
      id: 1,
      title: 'Fade Geométrico & Barba HD',
      category: 'barber',
      badge: 'Master',
      rating: '5.0',
      description: 'Corte estructurado con degradado láser milimétrico y diseño de barba simétrico.',
      image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=400&auto=format&fit=crop',
      tags: ['Fade', 'Barba']
    },
    {
      id: 2,
      title: 'Arquitectura Capilar Ejecutiva',
      category: 'barber',
      badge: 'Alta Gama',
      rating: '4.9',
      description: 'Estilo clásico renovado con laterales pulidos y volumen superior texturizado.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
      tags: ['Ejecutivo', 'Clásico']
    },
    {
      id: 3,
      title: 'Corte Texturizado Moderno',
      category: 'estilista',
      badge: '2026',
      rating: '4.8',
      description: 'Movimiento natural con capas dinámicas optimizadas para rostros angulares.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
      tags: ['Capas', 'Moderno']
    },
    {
      id: 4,
      title: 'Análisis Biométrico & Visagismo',
      category: 'visagismo',
      badge: 'Scan',
      rating: '5.0',
      description: 'Diseño de corte personalizado según la proporción áurea del rostro.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      tags: ['Simetría', 'IA']
    },
    {
      id: 5,
      title: 'Crop Moderno & Fade Bajo',
      category: 'barber',
      badge: 'Urbano',
      rating: '4.9',
      description: 'Flequillo texturizado hacia adelante con desvanecimiento limpio occipital.',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop',
      tags: ['Crop', 'Fade']
    },
    {
      id: 6,
      title: 'Estilismo & Colorimetría Pro',
      category: 'estilista',
      badge: 'Pro',
      rating: '4.9',
      description: 'Técnicas avanzadas de iluminación y matizado capilar sofisticado.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
      tags: ['Color', 'Matiz']
    }
  ];

  const filteredItems = activeCategory === 'todos' 
    ? catalogItems 
    : catalogItems.filter(item => item.category === activeCategory);

  return (
    <div className="mt-8 bg-slate-950 text-white font-sans pb-4 select-none text-[10px] relative overflow-hidden">
      
      {/* Fondo con malla sutil estilo Visarca */}
      <div className="absolute inset-0 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

      <div className="max-w-md mx-auto px-4 pt-1 relative flex flex-col space-y-4 z-10">
        
        {/* ENCABEZADO Y TEXTOS */}
        <header className="space-y-1 pt-1">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-extrabold tracking-tighter text-white">
              Modelos & Tendencias
            </h1>
            <span className="text-xs font-mono bg-cyan-950/80 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-800/50">
              VIP
            </span>
          </div>
          <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
            Explora nuestra selección exclusiva de cortes, validados por visagismo para potenciar tu imagen.
          </p>
        </header>

        {/* FILTROS DE CATEGORÍA */}
        <nav className="grid grid-cols-4 gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          {['todos', 'barber', 'estilista', 'visagismo'].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`py-2 rounded-xl text-xs font-bold transition-all duration-300 capitalize truncate ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              {category === 'todos' ? 'Todo' : category}
            </button>
          ))}
        </nav>

        {/* GALERÍA DE IMÁGENES EN 3 COLUMNAS */}
        <section className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {filteredItems.map((item) => (
              <article 
                key={item.id}
                onClick={() => setSelectedCut(item)}
                className="relative w-full aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/60 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-lg"
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                  loading="lazy"
                />
                
                {/* Etiqueta flotante pequeña con el badge */}
                <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-cyan-300 border border-slate-800 shadow-sm">
                  {item.badge}
                </div>

                {/* Rating flotante */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-amber-300 border border-slate-800 shadow-sm">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{item.rating}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>

      {/* MODAL PARA VER LA IMAGEN EN VERTICAL GRANDE */}
      {selectedCut && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-4 space-y-3 shadow-2xl relative overflow-hidden flex flex-col items-center border border-slate-800">
            
            {/* Botón flotante de cierre */}
            <button 
              onClick={() => setSelectedCut(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 transition-colors z-10 border border-slate-700"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Imagen grande en vertical */}
            <figure className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              <img 
                src={selectedCut.image} 
                alt={selectedCut.title} 
                className="w-full h-full object-cover" 
              />
              <figcaption className="absolute bottom-3 left-3 flex gap-2">
                <span className="bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-cyan-300 border border-slate-800">
                  {selectedCut.badge}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-amber-300 border border-slate-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{selectedCut.rating} Calidad</span>
                </span>
              </figcaption>
            </figure>

            {/* Información y detalles dentro del modal */}
            <div className="space-y-1.5 w-full text-left">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                {selectedCut.title}
              </h2>
              <p className="text-xs text-slate-300 leading-normal">
                {selectedCut.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 w-full">
              {selectedCut.tags.map((tag, idx) => (
                <span key={idx} className="text-xs bg-slate-800/80 text-cyan-300 px-2.5 py-0.5 rounded-full font-medium border border-slate-700/60">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex gap-3 pt-1 w-full">
              <button
                onClick={() => setSelectedCut(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 transition-colors border border-slate-700"
              >
                Volver
              </button>
              <button
                onClick={() => {
                  setSelectedCut(null);
                  setCurrentTab && setCurrentTab('booking');
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2"
              >
                <span>Agendar Cita</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}