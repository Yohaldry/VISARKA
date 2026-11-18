import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Star, 
  MapPin, 
  Scissors, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { db } from '../../components/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function CalendarioBarberos() {
  const navigate = useNavigate();

  // Estados de Dirección y Google Maps Autocomplete
  const [direccion, setDireccion] = useState('');
  const [direccionConfirmada, setDireccionConfirmada] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const inputRef = React.useRef(null);
  const autocompleteRef = React.useRef(null);

  // Estados de Calendario y Datos de Firestore
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  
  const [calendarioSlots, setCalendarioSlots] = useState([]);
  const [profesionales, setProfesionales] = useState({});
  const [loadingBarberos, setLoadingBarberos] = useState(false);

  // 1. Cargar Google Maps Script para Autocompletar Dirección
  useEffect(() => {
    const googleMapsApiKey = "TU_API_KEY_DE_GOOGLE_MAPS"; // Reemplaza con tu API Key si es necesario
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }
    const existingScript = document.getElementById('google-maps-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Inicializar Autocomplete cuando el input esté listo
  useEffect(() => {
    if (mapLoaded && inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "co" }, // Restringir a Colombia (Bogotá)
        fields: ["formatted_address", "geometry"]
      });
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.formatted_address) {
          setDireccion(place.formatted_address);
        }
      });
    }
  }, [mapLoaded, direccionConfirmada]);

  // 2. Traer todos los slots de disponibilidad y perfiles de profesionales desde Firestore
  useEffect(() => {
    if (!direccionConfirmada) return;
    const fetchData = async () => {
      setLoadingBarberos(true);
      try {
        // Cargar slots de 'calendarioprofesionales' donde no estén ocupados
        const slotsSnap = await getDocs(query(collection(db, 'calendarioprofesionales'), where('ocupado', '==', false)));
        const slotsList = slotsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCalendarioSlots(slotsList);

        // Cargar perfiles de profesionales
        const profSnap = await getDocs(collection(db, 'profesionales'));
        const profMap = {};
        profSnap.forEach(d => {
          profMap[d.id] = { id: d.id, ...d.data() };
        });
        setProfesionales(profMap);
      } catch (error) {
        console.error("Error al cargar disponibilidad:", error);
      } finally {
        setLoadingBarberos(false);
      }
    };
    fetchData();
  }, [direccionConfirmada]);

  // Cálculo de días del mes
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Formatear YYYY-MM-DD para comparar con los slots de Firestore
  const getFechaStr = (dayNum) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
  };

  // Días que tienen al menos un slot disponible en Firestore
  const isDayAvailable = (dayNumber) => {
    const fechaStr = getFechaStr(dayNumber);
    return calendarioSlots.some(slot => slot.fecha === fechaStr);
  };

  // Filtrar y agrupar los barberos y sus horas disponibles según el día seleccionado en el calendario
  const fechaSeleccionadaStr = getFechaStr(selectedDay);
  const slotsDelDia = calendarioSlots.filter(slot => slot.fecha === fechaSeleccionadaStr);

  // Agrupar horas por barbero para el día seleccionado
  const barberosDisponiblesMap = {};
  slotsDelDia.forEach(slot => {
    const prof = profesionales[slot.barberoId] || {
      id: slot.barberoId,
      nombre: "Barbero Profesional",
      descripcion: "Especialista en cortes y barba",
      foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
      rating: 4.9,
      reviewsCount: 120
    };

    if (!barberosDisponiblesMap[slot.barberoId]) {
      barberosDisponiblesMap[slot.barberoId] = {
        id: prof.id,
        name: prof.nombre || prof.name || "Barbero Profesional",
        specialty: prof.descripcion || prof.specialty || "Corte & Estilo",
        rating: prof.rating || 4.9,
        reviews: prof.reviewsCount || 100,
        avatar: prof.foto || prof.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
        hours: []
      };
    }
    if (slot.hora && !barberosDisponiblesMap[slot.barberoId].hours.includes(slot.hora)) {
      barberosDisponiblesMap[slot.barberoId].hours.push(slot.hora);
    }
  });

  const availableBarbersForDay = Object.values(barberosDisponiblesMap);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
    setSelectedTime(null);
    setSelectedBarber(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
    setSelectedTime(null);
    setSelectedBarber(null);
  };

  const handleConfirmarDireccion = (e) => {
    e.preventDefault();
    if (!direccion.trim()) return alert("Por favor ingresa y selecciona una dirección.");
    setDireccionConfirmada(true);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans pb-24 sm:pb-12 pt-16 px-3 sm:px-8 selection:bg-[#00E5FF] selection:text-slate-950">
      
      {/* HEADER NAVEGACIÓN */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0284c7] bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Volver al Inicio
        </button>

        <div className="flex items-center gap-2">
          <img 
            src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
            alt="Visarka Logo" 
            className="w-6 h-6 object-contain drop-shadow"
          />
          <span className="text-sm font-black uppercase tracking-wider bg-gradient-to-r from-slate-950 via-indigo-950 to-[#0284c7] bg-clip-text text-transparent">
            VISARKA AGENDAMIENTO
          </span>
        </div>
      </div>

      {/* PASO 1: CONFIRMAR DIRECCIÓN EN GOOGLE MAPS */}
      {!direccionConfirmada ? (
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 my-12 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-sky-50 text-[#0284c7] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <MapPin className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black uppercase text-slate-950">¿Dónde necesitas el servicio?</h1>
            <p className="text-xs text-slate-500 font-medium">Confirma tu dirección con Google Maps para verificar la disponibilidad real de los barberos en tu zona.</p>
          </div>

          <form onSubmit={handleConfirmarDireccion} className="space-y-4">
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Dirección exacta o barrio *</label>
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input 
                  ref={inputRef}
                  type="text" 
                  required 
                  placeholder="Ej: Calle 100 # 15-20, Bogotá" 
                  value={direccion} 
                  onChange={(e) => setDireccion(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-3.5 py-3.5 rounded-2xl text-[16px] outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-slate-950 via-indigo-950 to-[#0284c7] text-white font-extrabold py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Verificar y Buscar Barberos</span>
              <ArrowRight className="w-4 h-4 text-[#00E5FF]" />
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* TITULO DE LA SECCIÓN */}
          <div className="max-w-6xl mx-auto text-center space-y-1 mb-8">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-extrabold px-3.5 py-1 rounded-full border border-emerald-200 mb-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Domicilio verificado: <span className="underline">{direccion}</span>
              <button onClick={() => setDireccionConfirmada(false)} className="ml-2 text-slate-400 hover:text-slate-700 font-bold cursor-pointer">Cambiar</button>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-950">
              Calendario de Barberos Disponibles
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Selecciona un día en verde para ver los profesionales y sus horarios libres en tiempo real.
            </p>
          </div>

          {/* ESTRUCTURA PRINCIPAL DE 2 COLUMNAS */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* COLUMNA IZQUIERDA: CALENDARIO DEL MES */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_rgba(2,132,199,0.06)] p-4 sm:p-6 relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base sm:text-lg font-black capitalize text-slate-900 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#0284c7]" />
                  {monthName}
                </h2>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    aria-label="Mes anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    aria-label="Mes siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>

              {/* Cuadrícula de los Días (Verde si hay horas disponibles de los barberos) */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {[...Array(adjustedFirstDayIndex)].map((_, index) => (
                  <div key={`empty-${index}`} className="h-10 sm:h-12" />
                ))}

                {[...Array(daysInMonth)].map((_, index) => {
                  const dayNumber = index + 1;
                  const available = isDayAvailable(dayNumber);
                  const isSelected = selectedDay === dayNumber;

                  return (
                    <button
                      key={dayNumber}
                      onClick={() => {
                        setSelectedDay(dayNumber);
                        setSelectedTime(null);
                        setSelectedBarber(null);
                      }}
                      className={`h-10 sm:h-12 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center relative transition-all duration-200 ${
                        isSelected
                          ? 'bg-slate-950 text-white shadow-lg ring-2 ring-sky-400 scale-[1.03] z-10 cursor-pointer'
                          : available
                          ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 shadow-sm cursor-pointer'
                          : 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-default opacity-60'
                      }`}
                    >
                      <span>{dayNumber}</span>
                      
                      {available && (
                        <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                          isSelected ? 'bg-[#00E5FF]' : 'bg-emerald-500 animate-pulse'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Leyenda de colores */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-400 border border-emerald-500 shadow-sm" />
                  <span>Con Horas Libres</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-slate-200 border border-slate-300" />
                  <span>Sin disponibilidad</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-slate-950 shadow-sm" />
                  <span>Seleccionado</span>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: BARBEROS Y SUS HORAS DISPONIBLES EN TIEMPO REAL */}
            <div className="lg:col-span-6 space-y-4">
              
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_rgba(2,132,199,0.06)] p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      Barberos el {selectedDay} de {currentDate.toLocaleString('es-ES', { month: 'long' })}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {availableBarbersForDay.length} profesional(es) con horas disponibles
                    </p>
                  </div>
                  <span className="bg-sky-50 text-[#0284c7] text-xs font-black px-3 py-1 rounded-full border border-sky-100">
                    {availableBarbersForDay.length > 0 ? 'Disponible' : 'Agotado'}
                  </span>
                </div>

                {loadingBarberos ? (
                  <div className="text-center py-10 text-xs text-slate-400 font-mono">Cargando disponibilidad de barberos...</div>
                ) : availableBarbersForDay.length > 0 ? (
                  <div className="space-y-4">
                    {availableBarbersForDay.map((barber) => {
                      const isBarberSelected = selectedBarber?.id === barber.id;

                      return (
                        <div 
                          key={barber.id}
                          onClick={() => {
                            setSelectedBarber(barber);
                            setSelectedTime(null);
                          }}
                          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                            isBarberSelected 
                              ? 'border-sky-400 bg-sky-50/50 shadow-md ring-2 ring-sky-300/40' 
                              : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 shadow-sm'
                          }`}
                        >
                          {/* Info Barbero */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={barber.avatar} 
                                alt={barber.name} 
                                className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow"
                              />
                              <div>
                                <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                                  {barber.name}
                                </h4>
                                <p className="text-xs font-semibold text-slate-500">
                                  {barber.specialty}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-xs font-bold text-amber-700">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{barber.rating}</span>
                              <span className="text-[10px] text-slate-400">({barber.reviews})</span>
                            </div>
                          </div>

                          {/* Horas Disponibles de este Barbero */}
                          <div className="border-t border-slate-200/60 pt-3">
                            <p className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#0284c7]" /> Seleccionar hora disponible:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {barber.hours.map((hour, hIdx) => {
                                const isTimeSelected = isBarberSelected && selectedTime === hour;
                                return (
                                  <button
                                    key={hIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedBarber(barber);
                                      setSelectedTime(hour);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                      isTimeSelected
                                        ? 'bg-gradient-to-r from-slate-950 to-indigo-950 text-white shadow-md scale-105'
                                        : 'bg-white text-slate-800 border border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                                    }`}
                                  >
                                    {hour}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-2">
                    <Scissors className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-600">No hay horarios disponibles para este día.</p>
                    <p className="text-xs text-slate-400">Por favor selecciona otro día marcado en color verde.</p>
                  </div>
                )}
              </div>

              {/* BOTÓN CONFIRMAR RESERVA */}
              {selectedBarber && selectedTime && (
                <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-[#0284c7] text-white p-5 rounded-3xl shadow-xl space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Resumen de solicitud:</span>
                    <span className="bg-[#00E5FF] text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[10px]">
                      {selectedDay} {currentDate.toLocaleString('es-ES', { month: 'short' })} - {selectedTime}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-black">{selectedBarber.name}</p>
                    <p className="text-xs text-slate-300">{selectedBarber.specialty}</p>
                    <p className="text-[11px] text-sky-200 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Domicilio: {direccion}
                    </p>
                  </div>
                  <button 
                    onClick={() => alert(`¡Reserva confirmada con ${selectedBarber.name} para el día ${selectedDay} a las ${selectedTime} en la dirección: ${direccion}!`)}
                    className="w-full bg-[#00E5FF] hover:bg-cyan-300 text-slate-950 font-extrabold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Confirmar Barbero a Domicilio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>

          </div>
        </>
      )}

      {/* FOOTER GARANTÍA */}
      <div className="max-w-6xl mx-auto mt-12 flex justify-center items-center gap-6 text-[11px] font-semibold text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-sky-600" /> Barberos Higienizados y Verificados
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 text-sky-600" /> Servicio 100% Garantizado a Domicilio
        </span>
      </div>
    </div>
  );
}