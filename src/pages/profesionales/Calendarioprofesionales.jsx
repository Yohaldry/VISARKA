import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  setDoc 
} from 'firebase/firestore';
import { db } from '../../components/firebase';

export default function Calendarioprofesionales({ barberoId }) {
  const [activeTab, setActiveTab] = useState('calendario');
  const [selectedDates, setSelectedDates] = useState([]);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('18:00');
  const [loading, setLoading] = useState(false);

  const [disponibilidades, setDisponibilidades] = useState([]);
  const [citasClientes, setCitasClientes] = useState([]);
  const [selectedSlotsToDelete, setSelectedSlotsToDelete] = useState([]);

  // Mes y año actual para la visualización del calendario
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (barberoId) {
      fetchData();
    }
  }, [barberoId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dispRef = collection(db, 'calendarioprofesionales');
      const qDisp = query(dispRef, where('barberoId', '==', barberoId));
      const querySnapshotDisp = await getDocs(qDisp);
      
      const dispList = [];
      querySnapshotDisp.forEach((docSnap) => {
        dispList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setDisponibilidades(dispList);

      const citasRef = collection(db, 'citas');
      const qCitas = query(citasRef, where('barberoId', '==', barberoId), where('estado', '==', 'pendiente'));
      const querySnapshotCitas = await getDocs(qCitas);
      
      const citasList = [];
      querySnapshotCitas.forEach((docSnap) => {
        citasList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setCitasClientes(citasList);

    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarDisponibilidad = async (e) => {
    e.preventDefault();
    if (selectedDates.length === 0) {
      alert('Por favor selecciona al menos un día en el calendario.');
      return;
    }

    try {
      setLoading(true);
      for (const fecha of selectedDates) {
        const docId = `${barberoId}_${fecha}`;
        const slotRef = doc(db, 'calendarioprofesionales', docId);
        
        await setDoc(slotRef, {
          barberoId,
          fecha,
          horaInicio,
          horaFin,
          ocupado: false,
          actualizadoEn: new Date()
        }, { merge: true });
      }

      alert('¡Horas disponibles guardadas con éxito!');
      setSelectedDates([]);
      fetchData();
    } catch (error) {
      console.error("Error al guardar disponibilidad:", error);
      alert('Hubo un error al guardar las horas.');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarSeleccionadas = async () => {
    if (selectedSlotsToDelete.length === 0) {
      alert('Selecciona al menos un horario para eliminar.');
      return;
    }

    if (!window.confirm('¿Estás seguro de eliminar las horas seleccionadas?')) return;

    try {
      setLoading(true);
      for (const id of selectedSlotsToDelete) {
        await deleteDoc(doc(db, 'calendarioprofesionales', id));
      }
      alert('Horarios eliminados correctamente.');
      setSelectedSlotsToDelete([]);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generar días del mes actual estilo cuadrícula limpia
  const generarDiasDelMes = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const primerDiaMes = new Date(year, month, 1);
    const ultimoDiaMes = new Date(year, month + 1, 0);
    
    let primerDiaSemana = primerDiaMes.getDay() - 1; // Ajustar Lunes = 0
    if (primerDiaSemana === -1) primerDiaSemana = 6; // Domingo

    const dias = [];
    
    // Días vacíos del mes anterior
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push({ vacio: true, id: `vacio-${i}` });
    }

    // Días del mes
    for (let i = 1; i <= ultimoDiaMes.getDate(); i++) {
      const mesStr = String(month + 1).padStart(2, '0');
      const diaStr = String(i).padStart(2, '0');
      const fechaStr = `${year}-${mesStr}-${diaStr}`;
      dias.push({ fechaStr, diaMes: i, vacio: false });
    }

    return dias;
  };

  const cambiarMes = (direccion) => {
    const nuevoMes = new Date(currentDate);
    nuevoMes.setMonth(currentDate.getMonth() + direccion);
    setCurrentDate(nuevoMes);
  };

  const toggleSelectDate = (fechaStr) => {
    if (selectedDates.includes(fechaStr)) {
      setSelectedDates(selectedDates.filter(d => d !== fechaStr));
    } else {
      setSelectedDates([...selectedDates, fechaStr]);
    }
  };

  const nombreMesAnio = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-slate-50 text-slate-800 rounded-2xl shadow-xl border border-slate-200">
      
      {/* Encabezado */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">CALENDARIO DE PROFESIONAL</h2>
        <p className="text-sm text-slate-500 mt-1">Selecciona los días para habilitar tus horarios a domicilio.</p>
      </div>

      {/* Pestañas de Navegación Estilo Claro */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('calendario')}
          className={`py-2 px-4 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${
            activeTab === 'calendario' ? 'border-blue-600 text-blue-600 bg-white shadow-xs' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          📅 Calendario
        </button>
        <button
          onClick={() => setActiveTab('agendados')}
          className={`py-2 px-4 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${
            activeTab === 'agendados' ? 'border-blue-600 text-blue-600 bg-white shadow-xs' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          📋 Citas Pendientes ({citasClientes.length})
        </button>
        <button
          onClick={() => setActiveTab('gestion')}
          className={`py-2 px-4 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${
            activeTab === 'gestion' ? 'border-blue-600 text-blue-600 bg-white shadow-xs' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          ⚙️ Gestionar Horas
        </button>
      </div>

      {/* PESTAÑA 1: CALENDARIO */}
      {activeTab === 'calendario' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
            
            {/* Cabecera del Mes con Flechas */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 capitalize text-lg flex items-center gap-2">
                📅 {nombreMesAnio}
              </h3>
              <div className="flex gap-1">
                <button onClick={() => cambiarMes(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 font-bold">&lt;</button>
                <button onClick={() => cambiarMes(1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 font-bold">&gt;</button>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
              <span>LUN</span><span>MAR</span><span>MIÉ</span><span>JUE</span><span>VIE</span><span>SÁB</span><span>DOM</span>
            </div>

            {/* Cuadrícula de días */}
            <div className="grid grid-cols-7 gap-1.5">
              {generarDiasDelMes().map((item) => {
                if (item.vacio) {
                  return <div key={item.id} className="h-12"></div>;
                }

                const isSelected = selectedDates.includes(item.fechaStr);
                const tieneCita = citasClientes.some(c => c.fecha === item.fechaStr);
                const tieneDisp = disponibilidades.some(d => d.fecha === item.fechaStr);

                // Estilos según estado
                let estilosBoton = "bg-slate-100 text-slate-400 border-slate-200"; // Gris por defecto
                let puntoColor = "bg-slate-300";

                if (tieneCita) {
                  estilosBoton = "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold"; // Verde si hay cita
                  puntoColor = "bg-emerald-500";
                } else if (tieneDisp) {
                  estilosBoton = "bg-amber-50 text-amber-800 border-amber-300 font-semibold"; // Amarillo claro si hay horas disponibles
                  puntoColor = "bg-amber-400";
                }

                if (isSelected) {
                  estilosBoton = "bg-slate-900 text-white border-slate-900 font-bold shadow-md scale-105"; // Seleccionado oscuro estilo imagen
                  puntoColor = "bg-cyan-400";
                }

                return (
                  <button
                    key={item.fechaStr}
                    type="button"
                    onClick={() => toggleSelectDate(item.fechaStr)}
                    className={`h-12 rounded-xl flex flex-col items-center justify-center transition-all border text-sm relative ${estilosBoton}`}
                  >
                    <span>{item.diaMes}</span>
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 ${puntoColor}`}></span>
                  </button>
                );
              })}
            </div>

            {/* Leyenda inferior */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-slate-600 pt-4 border-t border-slate-100">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span> Disponible</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Ocupado (Cita)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-900 rounded-full"></span> Seleccionado</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-200 rounded-full"></span> Sin disponibilidad</span>
            </div>
          </div>

          {/* Formulario para asignar horas */}
          <form onSubmit={handleGuardarDisponibilidad} className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Definir horario para los días seleccionados</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Hora Inicio</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 text-sm focus:outline-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Hora Fin</label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 text-sm focus:outline-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || selectedDates.length === 0}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-50 shadow-md"
            >
              {loading ? 'Guardando...' : `Guardar disponibilidad (${selectedDates.length} días)`}
            </button>
          </form>
        </div>
      )}

      {/* PESTAÑA 2: CITAS PENDIENTES */}
      {activeTab === 'agendados' && (
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Servicios agendados por clientes</h3>
          {citasClientes.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">No tienes citas pendientes en este momento.</p>
          ) : (
            <div className="space-y-3">
              {citasClientes.map((cita) => (
                <div key={cita.id} className="bg-slate-50 p-4 rounded-xl border border-emerald-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-emerald-700 text-sm">Cliente: {cita.nombreCliente || 'Sin nombre'}</p>
                    <p className="text-xs text-slate-600 mt-0.5">📅 Fecha: {cita.fecha} | ⏰ Hora: {cita.hora}</p>
                    <p className="text-xs text-slate-500 mt-0.5">📍 Dirección: {cita.direccion || 'No especificada'}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
                    Pendiente
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: GESTIÓN DE HORAS */}
      {activeTab === 'gestion' && (
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Horarios configurados</h3>
            {selectedSlotsToDelete.length > 0 && (
              <button
                onClick={handleEliminarSeleccionadas}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Eliminar ({selectedSlotsToDelete.length})
              </button>
            )}
          </div>

          {disponibilidades.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">No hay horarios guardados en la base de datos.</p>
          ) : (
            <div className="space-y-2">
              {disponibilidades.map((item) => {
                const isChecked = selectedSlotsToDelete.includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                      isChecked ? 'bg-blue-50 border-blue-400' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedSlotsToDelete(selectedSlotsToDelete.filter(id => id !== item.id));
                          } else {
                            setSelectedSlotsToDelete([...selectedSlotsToDelete, item.id]);
                          }
                        }}
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-slate-800 text-sm">📅 {item.fecha}</p>
                        <p className="text-xs text-slate-500">De {item.horaInicio} a {item.horaFin}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}