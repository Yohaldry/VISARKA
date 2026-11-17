import React, { useState } from 'react';
import { 
  Radar, 
  MapPin, 
  Star, 
  ChevronRight, 
  Sparkles,
  Clock,
  Search,
  Scissors,
  UserCheck,
  Calendar
} from 'lucide-react';

export default function BusquedaenVivo({ setCurrentTab, userLocation }) {
  const [selectedRole, setSelectedRole] = useState('barbero'); // 'barbero' o 'estilista'
  const [isScanning, setIsScanning] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);

  const allProfessionals = [
    {
      id: 1,
      name: 'Carlos Mendoza',
      specialty: 'Master Barber',
      type: 'barbero',
      distance: '0.8 km',
      eta: '8 min',
      rating: '4.9',
      price: '$35',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      coords: { top: '35%', left: '45%' }
    },
    {
      id: 2,
      name: 'Alejandro Ruiz',
      specialty: 'Cortes Ejecutivos',
      type: 'barbero',
      distance: '1.4 km',
      eta: '14 min',
      rating: '4.8',
      price: '$30',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
      coords: { top: '60%', left: '30%' }
    },
    {
      id: 3,
      name: 'Julian Smith',
      specialty: 'Fade & Barba',
      type: 'barbero',
      distance: '1.9 km',
      eta: '16 min',
      rating: '4.9',
      price: '$32',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
      coords: { top: '70%', left: '60%' }
    },
    {
      id: 4,
      name: 'Mateo Stilist',
      specialty: 'Visagismo',
      type: 'estilista',
      distance: '2.1 km',
      eta: '19 min',
      rating: '5.0',
      price: '$40',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop',
      coords: { top: '25%', left: '70%' }
    },
    {
      id: 5,
      name: 'Valeria Sofía',
      specialty: 'Estilista & Color',
      type: 'estilista',
      distance: '1.7 km',
      eta: '12 min',
      rating: '4.9',
      price: '$45',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
      coords: { top: '55%', left: '75%' }
    },
    {
      id: 6,
      name: 'Camila Torres',
      specialty: 'Estilismo Moderno',
      type: 'estilista',
      distance: '2.5 km',
      eta: '22 min',
      rating: '4.7',
      price: '$38',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
      coords: { top: '20%', left: '30%' }
    }
  ];

  const handleStartSearch = () => {
    setIsScanning(true);
    setHasSearched(true);
    setSelectedBarber(null);
    setTimeout(() => {
      setIsScanning(false);
    }, 1800);
  };

  const filteredProfessionals = allProfessionals.filter(p => p.type === selectedRole);

  return (
    <div className="mt-13 bg-slate-50 text-black font-sans pb-3 select-none text-[10px] relative overflow-hidden">
      
      {/* Fondo con malla azul celeste suave y degradado superior */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-100/50 via-sky-50/20 to-transparent pointer-events-none"></div>

      <div className="max-w-md mx-auto px-3 pt-2 relative flex flex-col space-y-2 z-10">
        
        {/* ENCABEZADO Y BIENVENIDA */}
        <div className="space-y-1.5">
          
       
          {/* Bienvenida y descripción con efecto glassmorphism */}
          <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl border border-blue-200/60 shadow-sm shadow-blue-500/5 space-y-0.5">
            <h1 className="text-xs font-extrabold tracking-tight bg-gradient-to-r from-[#0047AB] via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              ¡Hola! Profesionales cerca de ti 
            </h1>
            <p className="text-[9px] text-black leading-tight">
              Encuentra y solicita expertos en barbería o estilismo directamente a domicilio en <span className="font-bold text-[#0047AB]">{userLocation || 'Bogotá'}</span> al instante.
            </p>
          </div>

          {/* SELECTOR DE TIPO (Barbero / Estilista) */}
          <div className="grid grid-cols-2 gap-1 bg-white/80 backdrop-blur-md p-1 rounded-xl border border-blue-200/60 shadow-sm shadow-blue-500/5">
            <button
              onClick={() => setSelectedRole('barbero')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                selectedRole === 'barbero'
                  ? 'bg-gradient-to-r from-[#0047AB] to-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-black hover:text-[#0047AB]'
              }`}
            >
              <Scissors className="w-3 h-3" />
              <span>Barberos</span>
            </button>
            <button
              onClick={() => setSelectedRole('estilista')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                selectedRole === 'estilista'
                  ? 'bg-gradient-to-r from-[#0047AB] to-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-black hover:text-[#0047AB]'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Estilistas</span>
            </button>
          </div>

          {/* MAPA RADAR ULTRA COMPACTO */}
          <div className="relative w-full h-28 rounded-xl bg-white/90 backdrop-blur-md border border-blue-200/80 overflow-hidden shadow-md shadow-blue-500/5 flex items-center justify-center">
            
            <div className="absolute inset-0 bg-[radial-gradient(#bae6fd_1.2px,transparent_1.2px)] [background-size:14px_14px] opacity-70"></div>
            
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-28 h-28 rounded-full border-2 border-blue-400/40 animate-ping absolute"></div>
                <div className="w-14 h-14 rounded-full border-2 border-[#0047AB]/60 animate-pulse absolute"></div>
              </div>
            )}

            {(!hasSearched || isScanning) && (
              <div className="absolute z-20 flex flex-col items-center">
                <button
                  onClick={handleStartSearch}
                  disabled={isScanning}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0047AB] via-blue-600 to-cyan-500 text-white text-[10px] font-bold shadow-lg shadow-blue-600/25 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Search className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Buscando...' : `Buscar ${selectedRole}s`}</span>
                </button>
                <span className="text-[7px] font-medium text-black mt-0.5">
                  Toca para escanear zona
                </span>
              </div>
            )}

            {hasSearched && !isScanning && (
              <div className="absolute z-10 flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#0047AB] to-cyan-400 shadow-[0_0_8px_#0047AB] flex items-center justify-center ring-2 ring-white">
                  <div className="w-1 h-1 rounded-full bg-white"></div>
                </div>
                <span className="text-[7px] font-bold bg-gradient-to-r from-[#0047AB] to-blue-600 bg-clip-text text-transparent bg-white/95 px-1.5 py-0.2 rounded-full mt-0.5 border border-blue-200 shadow-xs">
                  Tú
                </span>
              </div>
            )}

            {hasSearched && !isScanning && filteredProfessionals.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedBarber(item)}
                style={{ top: item.coords.top, left: item.coords.left }}
                className="absolute z-20 group transform -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-5 h-5 rounded-full bg-blue-400/30 animate-ping"></div>
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#0047AB] to-cyan-400 p-[1.5px] shadow-md group-hover:scale-110 transition-transform">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover rounded-[6px]"
                    />
                  </div>
                </div>
              </button>
            ))}

            <div className="absolute bottom-1 left-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-blue-100 flex items-center justify-between text-[8px] shadow-xs">
              <span className="text-black flex items-center gap-1 font-semibold">
                <Sparkles className="w-2.5 h-2.5 text-[#0047AB]" />
                {isScanning ? 'Rastreando...' : hasSearched ? `${filteredProfessionals.length} activos` : 'Listo'}
              </span>
              <button 
                onClick={handleStartSearch}
                className="bg-gradient-to-r from-[#0047AB] to-blue-600 bg-clip-text text-transparent font-bold uppercase tracking-wider hover:underline text-[7px]"
              >
                {hasSearched ? 'Re-escanear' : 'Iniciar'}
              </button>
            </div>
          </div>

        </div>

        {/* LISTA DE RESULTADOS EN 3 COLUMNAS */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[10px] font-extrabold bg-gradient-to-r from-[#0047AB] to-blue-600 bg-clip-text text-transparent tracking-wide uppercase">
              {selectedRole === 'barbero' ? 'Barberos' : 'Estilistas'} (3 Col)
            </h2>
            <span className="text-[9px] font-bold bg-blue-50 px-2 py-0.5 rounded-full text-[#0047AB] border border-blue-200/60 shadow-2xs">
              {hasSearched ? filteredProfessionals.length : 0} disp.
            </span>
          </div>

          {!hasSearched ? (
            <div className="py-4 text-center bg-white/60 backdrop-blur-sm rounded-xl border border-dashed border-blue-200 shadow-xs">
              <p className="text-[9px] text-black">Presiona <span className="font-bold bg-gradient-to-r from-[#0047AB] to-blue-600 bg-clip-text text-transparent">"Buscar"</span> en el radar.</p>
            </div>
          ) : filteredProfessionals.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5">
              {filteredProfessionals.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedBarber(item)}
                  className={`bg-white/90 backdrop-blur-md rounded-xl p-1.5 border transition-all cursor-pointer flex flex-col justify-between shadow-sm ${
                    selectedBarber?.id === item.id 
                      ? 'border-[#0047AB] ring-2 ring-[#0047AB]/20 shadow-md shadow-blue-600/10' 
                      : 'border-blue-100 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {/* Foto y Rating */}
                  <div className="relative w-full h-14 rounded-lg overflow-hidden mb-1 shadow-xs">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-white/95 px-1.5 py-0.3 rounded-full text-[7px] font-bold text-amber-600 shadow-2xs">
                      <Star className="w-2 h-2 fill-amber-500 text-amber-500" />
                      <span>{item.rating}</span>
                    </div>
                    <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white shadow-2xs"></div>
                  </div>

                  {/* Texto */}
                  <div className="space-y-0.5 mb-1 text-center">
                    <h3 className="text-[9px] font-extrabold bg-gradient-to-r from-[#0047AB] to-blue-600 bg-clip-text text-transparent truncate leading-tight">
                      {item.name.split(' ')[0]}
                    </h3>
                    <div className="flex items-center justify-center gap-1 text-[7px] text-black">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2 h-2 text-[#0047AB]" />
                        {item.distance}
                      </span>
                    </div>
                  </div>

                  {/* Precio y Botón */}
                  <div className="flex items-center justify-between pt-1 border-t border-blue-50">
                    <span className="text-[9px] font-extrabold bg-gradient-to-r from-[#0047AB] to-cyan-500 bg-clip-text text-transparent">
                      {item.price}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentTab && setCurrentTab('booking');
                      }}
                      className="px-2 py-0.5 rounded-md bg-gradient-to-r from-[#0047AB] to-blue-600 text-white text-[8px] font-bold shadow-xs shadow-blue-600/20 hover:scale-105 transition-transform"
                    >
                      Pedir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center bg-white/60 backdrop-blur-sm rounded-xl border border-blue-200 shadow-xs">
              <p className="text-[9px] text-black">No hay profesionales disponibles.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}