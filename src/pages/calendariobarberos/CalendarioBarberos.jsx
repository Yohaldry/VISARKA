import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Star, 
  MapPin, 
  Scissors, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function CalendarioBarberos() {
  const navigate = useNavigate();

  // Fecha actual (Noviembre 2026)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // Mes 10 = Noviembre
  const [selectedDay, setSelectedDay] = useState(16); // Día seleccionado por defecto
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);

  // Simulación de Barberos y sus días/horas disponibles
  const barberosData = [
    {
      id: 1,
      name: "Andrés Miranda",
      specialty: "Corte VIP & Visagismo",
      rating: 4.9,
      reviews: 128,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
      availableDays: [1, 3, 5, 8, 10, 12, 15, 16, 18, 20, 22, 25, 27, 29],
      hours: ["08:00 AM", "10:30 AM", "02:00 PM", "04:30 PM", "06:00 PM"]
    },
    {
      id: 2,
      name: "Mateo Silva",
      specialty: "Barba & Perfilado Tradicional",
      rating: 4.8,
      reviews: 94,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
      availableDays: [2, 4, 6, 9, 11, 16, 17, 19, 21, 23, 26, 28, 30],
      hours: ["09:00 AM", "11:00 AM", "01:30 PM", "03:00 PM", "05:30 PM"]
    },
    {
      id: 3,
      name: "Daniel Torres",
      specialty: "Fade Moderno & Diseños",
      rating: 5.0,
      reviews: 156,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
      availableDays: [1, 2, 5, 7, 12, 14, 16, 18, 20, 24, 25, 28],
      hours: ["10:00 AM", "12:00 PM", "03:30 PM", "07:00 PM"]
    }
  ];

  // Cálculo de días del mes
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Día de la semana en que inicia el mes
  const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Ajuste para Lunes = 0

  // Obtener barberos disponibles para el día seleccionado
  const availableBarbersForDay = barberosData.filter(barber => 
    barber.availableDays.includes(selectedDay)
  );

  // Verificar si un día tiene barberos disponibles
  const isDayAvailable = (dayNumber) => {
    return barberosData.some(barber => barber.availableDays.includes(dayNumber));
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
    setSelectedTime(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
    setSelectedTime(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans pb-24 sm:pb-12 pt-16 px-3 sm:px-8 selection:bg-[#00E5FF] selection:text-slate-950">
      
      {/* HEADER NAVEGACIÓN */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0284c7] bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all"
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

      {/* TITULO DE LA SECCIÓN */}
      <div className="max-w-6xl mx-auto text-center space-y-1 mb-8">
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-950">
          Calendario de Barberos a Domicilio
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Selecciona un día en verde para ver la disponibilidad de profesionales y horarios.
        </p>
      </div>

      {/* ESTRUCTURA PRINCIPAL DE 2 COLUMNAS */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: CALENDARIO DEL MES */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_rgba(2,132,199,0.06)] p-4 sm:p-6 relative overflow-hidden">
          
          {/* Cabecera del Mes y Botones de Cambio */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base sm:text-lg font-black capitalize text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#0284c7]" />
              {monthName}
            </h2>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handlePrevMonth}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
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

          {/* Cuadrícula de los Días */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Espacios vacíos antes del primer día del mes */}
            {[...Array(adjustedFirstDayIndex)].map((_, index) => (
              <div key={`empty-${index}`} className="h-10 sm:h-12" />
            ))}

            {/* Días del Mes */}
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
                      ? 'bg-slate-950 text-white shadow-lg ring-2 ring-sky-400 scale-[1.03] z-10'
                      : available
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 shadow-sm'
                      : 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-default opacity-60'
                  }`}
                >
                  <span>{dayNumber}</span>
                  
                  {/* Punto o Badge indicador de disponibilidad */}
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
              <span>Con Barberos</span>
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

        {/* COLUMNA DERECHA: BARBEROS Y HORARIOS DISPONIBLES */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_rgba(2,132,199,0.06)] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Barberos el {selectedDay} de {currentDate.toLocaleString('es-ES', { month: 'long' })}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {availableBarbersForDay.length} profesional(es) disponible(s)
                </p>
              </div>
              <span className="bg-sky-50 text-[#0284c7] text-xs font-black px-3 py-1 rounded-full border border-sky-100">
                {availableBarbersForDay.length > 0 ? 'Disponible' : 'Agotado'}
              </span>
            </div>

            {/* LISTA DE BARBEROS */}
            {availableBarbersForDay.length > 0 ? (
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
                      {/* Información del Barbero */}
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

                        {/* Rating */}
                        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-xs font-bold text-amber-700">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{barber.rating}</span>
                          <span className="text-[10px] text-slate-400">({barber.reviews})</span>
                        </div>
                      </div>

                      {/* Horarios del Barbero Seleccionado */}
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
                                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
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
                <p className="text-sm font-bold text-slate-600">No hay barberos agendados para este día.</p>
                <p className="text-xs text-slate-400">Por favor selecciona un día marcado en color verde.</p>
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
              </div>
              <button 
                onClick={() => alert(`¡Reserva confirmada con ${selectedBarber.name} para el día ${selectedDay} a las ${selectedTime}!`)}
                className="w-full bg-[#00E5FF] hover:bg-cyan-300 text-slate-950 font-extrabold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <span>Confirmar Barbero a Domicilio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* FOOTER GARANTÍA */}
      <div className="max-w-6xl mx-auto mt-8 flex justify-center items-center gap-6 text-[11px] font-semibold text-slate-400">
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