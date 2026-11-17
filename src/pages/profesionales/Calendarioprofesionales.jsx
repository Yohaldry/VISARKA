import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../components/firebase';

export default function Calendarioprofesionales({ barberoId: propId }) {
  const [barberoId, setBarberoId] = useState(propId || '');
  const [tab, setTab] = useState('calendario');
  const [subTabCitas, setSubTabCitas] = useState('pendientes');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modoRango, setModoRango] = useState(false);
  const [citaModal, setCitaModal] = useState(null);
  const [editarHoraModal, setEditarHoraModal] = useState(null);
  const [nuevaHoraEdit, setNuevaHoraEdit] = useState('');
  const [editandoServicios, setEditandoServicios] = useState(false);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [serviciosSeleccionadosCita, setServiciosSeleccionadosCita] = useState([]);
  const [filtroDiaSemana, setFiltroDiaSemana] = useState('');
  
  const [sliderVal, setSliderVal] = useState(0);
  const [confirmarFinalizar, setConfirmarFinalizar] = useState(false);

  const horasPreset = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', 
  '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'
];
  const [modalIni, setModalIni] = useState('');
  const [modalFin, setModalFin] = useState('');
  const [horasModal, setHorasModal] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [fUnica, setFUnica] = useState('');
  const [fIni, setFIni] = useState('');
  const [fFin, setFFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [disp, setDisp] = useState([]);
  const [citas, setCitas] = useState([]);
  const [toDelete, setToDelete] = useState([]);
  const [currDate, setCurrDate] = useState(new Date());

  useEffect(() => {
    if (propId) setBarberoId(propId);
    else if (auth.currentUser) setBarberoId(auth.currentUser.uid);
    else { const unsub = auth.onAuthStateChanged(u => u && setBarberoId(u.uid)); return () => unsub(); }
  }, [propId]);

  useEffect(() => { if (barberoId) { fetchData(); fetchServicios(); } }, [barberoId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dSnap, cSnap] = await Promise.all([
        getDocs(query(collection(db, 'calendarioprofesionales'), where('barberoId', '==', barberoId))),
        getDocs(query(collection(db, 'citas'), where('barberoId', '==', barberoId)))
      ]);
      setDisp(dSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCitas(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchServicios = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'servicios'), where('barberoId', '==', barberoId)));
      const lista = [];
      snap.forEach(d => {
        const s = d.data();
        const textoControl = String(s.duracion || s.categoria || s.nombre || '').toLowerCase();
        if (!textoControl.includes('interno')) {
          const p = Number(s.precioNum || s.precio || 35000);
          lista.push({
            id: d.id,
            nombre: s.nombre || s.name || 'Servicio',
            precioNum: p,
            precioFormatted: s.precioText || `$${p.toLocaleString('es-CO')} COP`
          });
        }
      });
      setServiciosDisponibles(lista);
    } catch (e) { console.error(e); }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!modalIni || !horasModal.length) return alert('Completa los campos.');
    setLoading(true);
    try {
      let start = new Date(modalIni), end = modoRango && modalFin ? new Date(modalFin) : new Date(modalIni);
      while (start <= end) {
        const fStr = start.toISOString().split('T')[0];
        for (const h of horasModal) {
          await setDoc(doc(db, 'calendarioprofesionales', `${barberoId}_${fStr}_${h.replace(/\s+/g, '_')}`), { barberoId, fecha: fStr, hora: h, ocupado: false }, { merge: true });
        }
        start.setDate(start.getDate() + 1);
      }
      setIsModalOpen(false); setHorasModal([]); fetchData();
    } catch (e) { alert('Error al guardar'); } finally { setLoading(false); }
  };

  const handleUpdateHora = async (e) => {
    e.preventDefault();
    if (!nuevaHoraEdit) return;
    try {
      await deleteDoc(doc(db, 'calendarioprofesionales', editarHoraModal.id));
      await setDoc(doc(db, 'calendarioprofesionales', `${barberoId}_${editarHoraModal.fecha}_${nuevaHoraEdit.replace(/\s+/g, '_')}`), { barberoId, fecha: editarHoraModal.fecha, hora: nuevaHoraEdit, ocupado: false });
      setEditarHoraModal(null); setNuevaHoraEdit(''); fetchData();
    } catch (e) { alert('Error'); }
  };

  const handleDeleteCita = async (citaId, fechaCita, horaCita) => {
    if (!window.confirm('¿Estás seguro de eliminar y cancelar esta cita?')) return;
    try {
      await deleteDoc(doc(db, 'citas', citaId));
      try { 
        await updateDoc(doc(db, 'calendarioprofesionales', `${barberoId}_${fechaCita}_${horaCita.replace(/\s+/g, '_')}`), { ocupado: false }); 
      } catch(e){}
      setCitaModal(null); setEditandoServicios(false); setSliderVal(0); setConfirmarFinalizar(false); fetchData();
    } catch (e) { alert('Error'); }
  };

  const handleFinalizarCita = async (citaId, fechaCita, horaCita) => {
    try {
      await updateDoc(doc(db, 'citas', citaId), { estado: 'finalizada' });
      try { 
        await updateDoc(doc(db, 'calendarioprofesionales', `${barberoId}_${fechaCita}_${horaCita.replace(/\s+/g, '_')}`), { ocupado: false }); 
      } catch(e){}
      setCitaModal(null); setEditandoServicios(false); setSliderVal(0); setConfirmarFinalizar(false); fetchData();
    } catch (e) { alert('Error al finalizar'); }
  };

  const handleGuardarServicios = async () => {
    if (!serviciosSeleccionadosCita.length) return alert('Selecciona al menos un servicio.');
    
    const serviciosLimpios = serviciosSeleccionadosCita.map(s => {
      const precioNum = Number(s.precioNum || s.precio || 35000);
      return {
        nombre: s.nombre || s.name || 'Servicio',
        precioNum: precioNum,
        precio: s.precioFormatted || s.precio || `$${precioNum.toLocaleString('es-CO')} COP`
      };
    });

    const total = serviciosLimpios.reduce((a, s) => a + s.precioNum, 0);
    const totalF = `$${total.toLocaleString('es-CO')} COP`;

    try {
      await updateDoc(doc(db, 'citas', citaModal.id), { 
        servicios: serviciosLimpios, 
        precioTotal: totalF 
      });
      setCitaModal(prev => ({ ...prev, servicios: serviciosLimpios, precioTotal: totalF }));
      setEditandoServicios(false); 
      fetchData();
      alert('¡Servicios actualizados con éxito!');
    } catch (e) { 
      console.error("Error al actualizar:", e);
      alert(`Error al guardar: ${e.message}`); 
    }
  };

  const handleDelete = async (id) => {
    const ids = id ? [id] : toDelete;
    if (!ids.length || !window.confirm('¿Eliminar?')) return;
    setLoading(true);
    try {
      for (const i of ids) await deleteDoc(doc(db, 'calendarioprofesionales', i));
      setToDelete([]); fetchData();
    } finally { setLoading(false); }
  };

  const daysInMonth = () => {
    const y = currDate.getFullYear(), m = currDate.getMonth(), first = new Date(y, m, 1).getDay() - 1, total = new Date(y, m + 1, 0).getDate();
    let res = Array(first < 0 ? 6 : first).fill({ vacio: true });
    for (let i = 1; i <= total; i++) res.push({ fechaStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`, diaMes: i, vacio: false });
    return res;
  };

  const citasFiltradas = citas.filter(c => {
    const estado = (c.estado || 'pendiente').toLowerCase();
    if (estado === 'cancelada') return false;
    
    if (subTabCitas === 'pendientes' && estado === 'finalizada') return false;
    if (subTabCitas === 'finalizadas' && estado !== 'finalizada') return false;

    if (filtroTipo === 'dia') return fUnica ? c.fecha === fUnica : true;
    if (filtroTipo === 'rango') return (!fIni || !fFin) || (c.fecha >= fIni && c.fecha <= fFin);
    return true;
  });

  const hoyStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-slate-50 text-slate-800 rounded-3xl shadow-2xl border border-slate-200 font-mono">
      <div className="text-center mb-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Panel de Disponibilidad y Citas</h2>
      </div>

     <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 gap-1.5 border border-slate-200/80 shadow-inner">
        {['calendario', 'agendados', 'gestion'].map((t) => {
          const isActive = tab === t;
          return (
            <button 
              key={t} 
              onClick={() => setTab(t)} 
              className={`flex-1 py-2 px-3 text-[11px] font-extrabold tracking-tight transition-all duration-300 ease-out rounded-xl capitalize cursor-pointer flex items-center justify-center gap-1.5 transform active:scale-95 ${
                isActive 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md shadow-slate-900/10 ring-1 ring-slate-900/10' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-70'}`}>
                {t === 'calendario' ? '📅' : t === 'agendados' ? '📋' : '⚙️'}
              </span>
              <span>
                {t === 'calendario' ? 'Calendario' : t === 'agendados' ? `Citas (${citas.filter(c => (c.estado || '').toLowerCase() !== 'cancelada').length})` : 'Gestionar'}
              </span>
            </button>
          );
        })}
      </div>

      {tab === 'calendario' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 capitalize text-sm">{currDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => { setModalIni(selectedDate || new Date().toISOString().split('T')[0]); setHorasModal([]); setIsModalOpen(true); }} className="bg-blue-600 text-white w-8 h-8 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all cursor-pointer">+</button>
                <button onClick={() => setCurrDate(new Date(currDate.setMonth(currDate.getMonth() - 1)))} className="p-1.5 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer">&lt;</button>
                <button onClick={() => setCurrDate(new Date(currDate.setMonth(currDate.getMonth() + 1)))} className="p-1.5 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer">&gt;</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 mb-2">
              {['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {daysInMonth().map((item, idx) => {
                if (item.vacio) return <div key={idx} />;
                const hasCitaPendiente = citas.some(c => c.fecha === item.fechaStr && (c.estado || 'pendiente').toLowerCase() === 'pendiente');
                const hasCitaFinalizada = citas.some(c => c.fecha === item.fechaStr && (c.estado || '').toLowerCase() === 'finalizada');
                const hasCita = hasCitaPendiente || hasCitaFinalizada;
                const hasDisp = disp.some(d => d.fecha === item.fechaStr);
                const isSel = selectedDate === item.fechaStr;
                const isToday = item.fechaStr === hoyStr;

                return (
                  <button 
                    key={item.fechaStr} 
                    onClick={() => setSelectedDate(item.fechaStr)} 
                    className={`h-12 rounded-xl flex flex-col items-center justify-center border text-xs transition-all cursor-pointer relative ${
                      isSel ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' : 
                      hasCitaPendiente ? 'bg-emerald-500 text-white border-emerald-600 font-black shadow-sm' : 
                      hasCitaFinalizada ? 'bg-slate-700 text-white border-slate-800 font-black shadow-sm' : 
                      hasDisp ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold' : 
                      'bg-slate-50 text-slate-400 border-slate-200'
                    } ${isToday && !hasCita ? 'ring-2 ring-blue-500 ring-offset-2 animate-pulse font-black' : ''}`}
                  >
                    <span className="flex items-center gap-0.5">
                      {item.diaMes}
                      {hasCitaFinalizada && !hasCitaPendiente && <span className="text-[10px] text-slate-300">✓</span>}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSel ? 'bg-cyan-400' : hasCitaPendiente ? 'bg-white' : hasCitaFinalizada ? 'bg-slate-400' : hasDisp ? 'bg-amber-400' : 'bg-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700">Horarios para: <span className="text-blue-600">{selectedDate}</span></span>
                <button onClick={() => { setModalIni(selectedDate); setHorasModal([]); setIsModalOpen(true); }} className="text-blue-600 hover:underline cursor-pointer">+ Agregar hora</button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {disp.filter(d => d.fecha === selectedDate).map(slot => {
                  const cita = citas.find(c => c.fecha === selectedDate && c.hora?.toLowerCase() === slot.hora?.toLowerCase() && (c.estado || '').toLowerCase() !== 'cancelada');
                  if (cita) return null;
                  return (
                    <div key={slot.id} onClick={() => setEditarHoraModal(slot)} className="bg-amber-100/90 border border-amber-300 text-amber-900 p-3 rounded-2xl text-xs flex flex-col justify-between shadow-2xs cursor-pointer hover:bg-amber-200 transition-all">
                      <div className="flex justify-between items-center"><span className="font-black">⏰ {slot.hora}</span><span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">Libre</span></div>
                      <span className="text-[9px] text-amber-700 mt-1 italic">Toca para editar</span>
                    </div>
                  );
                })}
                {citas.filter(c => c.fecha === selectedDate && (c.estado || '').toLowerCase() !== 'cancelada').map(cita => {
                  const esFinalizada = (cita.estado || '').toLowerCase() === 'finalizada';
                  return (
                    <div key={cita.id} onClick={() => { setCitaModal(cita); setEditandoServicios(false); setSliderVal(0); setConfirmarFinalizar(false); setServiciosSeleccionadosCita(cita.servicios || []); }} className={`${esFinalizada ? 'bg-slate-700 border-slate-800' : 'bg-emerald-500 border-emerald-600'} text-white p-3 rounded-2xl text-xs flex flex-col justify-between shadow-sm cursor-pointer hover:opacity-95 transition-all`}>
                      <div className="flex justify-between items-center"><span className="font-black">⏰ {cita.hora}</span><span className={`text-[9px] ${esFinalizada ? 'bg-slate-900 text-slate-200' : 'bg-emerald-700'} px-1.5 py-0.5 rounded font-black flex items-center gap-0.5`}>{esFinalizada ? <>Finalizada <span className="text-[10px]">✓</span></> : 'Ocupada'}</span></div>
                      <span className="font-bold truncate mt-1 text-[11px]">{cita.nombreCliente || cita.clienteNombre || 'Cliente'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'agendados' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-3">
            <button 
              onClick={() => setSubTabCitas('pendientes')} 
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${subTabCitas === 'pendientes' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              🟢 Citas Pendientes
            </button>
            <button 
              onClick={() => setSubTabCitas('finalizadas')} 
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${subTabCitas === 'finalizadas' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              ⚪ Citas Finalizadas
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex gap-1.5 w-full sm:w-auto">
              {['todos', 'dia', 'rango'].map(t => <button key={t} onClick={() => setFiltroTipo(t)} className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${filtroTipo === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{t}</button>)}
            </div>
            {filtroTipo === 'dia' && <input type="date" value={fUnica} onChange={e => setFUnica(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs w-full sm:w-auto" />}
            {filtroTipo === 'rango' && (
              <div className="flex gap-2 w-full sm:w-auto">
                <input type="date" value={fIni} onChange={e => setFIni(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs" />
                <input type="date" value={fFin} onChange={e => setFFin(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs" />
              </div>
            )}
          </div>
          {citasFiltradas.length === 0 ? <p className="text-xs text-slate-400 text-center py-6">No hay citas agendadas bajo esta categoría.</p> :
            <div className="space-y-3">
              {citasFiltradas.map(c => {
                const esFinalizada = (c.estado || '').toLowerCase() === 'finalizada';
                return (
                  <div key={c.id} onClick={() => { setCitaModal(c); setEditandoServicios(false); setSliderVal(0); setConfirmarFinalizar(false); setServiciosSeleccionadosCita(c.servicios || []); }} className={`p-4 rounded-2xl flex justify-between items-center text-xs cursor-pointer transition-all shadow-2xs ${esFinalizada ? 'bg-slate-100 border border-slate-300 hover:bg-slate-200' : 'bg-emerald-50/80 border border-emerald-300 hover:bg-emerald-100'}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`${esFinalizada ? 'bg-slate-700 text-white' : 'bg-emerald-600 text-white'} px-2 py-0.5 rounded-md font-black text-[9px] flex items-center gap-0.5`}>
                          {esFinalizada ? <>CITA FINALIZADA <span className="text-[10px]">✓</span></> : 'CITA CONFIRMADA'}
                        </span>
                        <span className={`font-black text-sm ${esFinalizada ? 'text-slate-800' : 'text-emerald-900'}`}>{c.nombreCliente || c.clienteNombre || 'Sin nombre'}</span>
                      </div>
                      <p className="text-slate-600 font-medium">📅 {c.fecha} | ⏰ {c.hora}</p>
                      <p className="text-slate-500 text-[10px]">📍 {c.direccion || 'Sin dirección'}</p>
                    </div>
                    <span className={`font-bold text-xs px-3 py-1.5 rounded-xl ${esFinalizada ? 'text-slate-700 bg-slate-200' : 'text-emerald-700 bg-emerald-200/60'}`}>Gestionar &rarr;</span>
                  </div>
                );
              })}
            </div>
          }
        </div>
      )}

      {tab === 'gestion' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pb-3 border-b border-slate-100">
            <p className="text-xs text-slate-500">Selecciona los horarios configurados que desees eliminar:</p>
            <select 
              value={filtroDiaSemana || ''} 
              onChange={e => setFiltroDiaSemana(e.target.value)} 
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-bold outline-none cursor-pointer"
            >
              <option value="">Filtrar por día (Todos)</option>
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miércoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
              <option value="6">Sábado</option>
              <option value="0">Domingo</option>
            </select>
          </div>

          {disp.filter(item => {
            if (!filtroDiaSemana && filtroDiaSemana !== 0 && filtroDiaSemana !== '0') return true;
            const [y, m, d] = item.fecha.split('-').map(Number);
            const diaIndex = new Date(y, m - 1, d).getDay();
            return diaIndex === Number(filtroDiaSemana);
          }).length === 0 ? <p className="text-xs text-slate-400 text-center py-6">Sin horas configuradas para este día.</p> :
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {disp.filter(item => {
                if (!filtroDiaSemana && filtroDiaSemana !== 0 && filtroDiaSemana !== '0') return true;
                const [y, m, d] = item.fecha.split('-').map(Number);
                const diaIndex = new Date(y, m - 1, d).getDay();
                return diaIndex === Number(filtroDiaSemana);
              }).map(item => (
                <div key={item.id} className={`p-2.5 border rounded-2xl flex items-center justify-between text-xs transition-all ${toDelete.includes(item.id) ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200'}`}>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={toDelete.includes(item.id)} onChange={() => setToDelete(toDelete.includes(item.id) ? toDelete.filter(i => i !== item.id) : [...toDelete, item.id])} className="accent-blue-600 rounded" /><div><p className="font-bold text-slate-800 text-[10px]">📅 {item.fecha}</p><p className="text-slate-900 font-bold text-xs">⏰ {item.hora}</p></div></label>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 font-bold cursor-pointer">✕</button>
                </div>
              ))}
            </div>
          }
          {toDelete.length > 0 && <button onClick={() => handleDelete()} className="w-full bg-red-600 text-white py-2 text-xs font-bold rounded-xl cursor-pointer">Eliminar ({toDelete.length})</button>}
        </div>
      )}

      {/* MODAL EDITAR HORA LIBRE */}
      {editarHoraModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdateHora} className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl border border-amber-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100"><h3 className="font-black text-xs uppercase text-amber-800">Editar Horario Disponible</h3><button type="button" onClick={() => setEditarHoraModal(null)} className="text-slate-400 font-bold">✕</button></div>
            <div className="space-y-3 text-xs"><p><strong>Fecha:</strong> {editarHoraModal.fecha}</p><p><strong>Hora actual:</strong> {editarHoraModal.hora}</p><select value={nuevaHoraEdit} onChange={e => setNuevaHoraEdit(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl" required><option value="">Selecciona la nueva hora</option>{horasPreset.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => handleDelete(editarHoraModal.id).then(() => setEditarHoraModal(null))} className="w-1/2 bg-red-100 text-red-700 py-2.5 rounded-xl text-xs font-bold">Eliminar</button><button type="submit" className="w-1/2 bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold">Guardar</button></div>
          </form>
        </div>
      )}

      {/* MODAL GESTIÓN CITA OCUPADA (DETALLE COMPLETO Y SERVICIOS EXTERNOS) */}
      {citaModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl border border-emerald-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100"><h3 className="font-black text-xs uppercase tracking-wider text-emerald-700">📋 Detalle Completo de la Cita</h3><button onClick={() => { setCitaModal(null); setEditandoServicios(false); setSliderVal(0); setConfirmarFinalizar(false); }} className="text-slate-400 font-bold">✕</button></div>
            
            <div className="space-y-2 text-xs text-slate-700 max-h-[60vh] overflow-y-auto pr-1">
              <p><strong>Cliente:</strong> {citaModal.nombreCliente || citaModal.clienteNombre || 'No especificado'}</p>
              <p><strong>Correo:</strong> {citaModal.email || 'No especificado'}</p>
              <p><strong>Teléfono:</strong> {citaModal.telefono || 'No especificado'}</p>
              <p><strong>Fecha y Hora:</strong> {citaModal.fecha} a las {citaModal.hora}</p>
              <p><strong>Dirección:</strong> {citaModal.direccion || 'No especificada'}</p>
              <p><strong>Torre / Apto:</strong> {citaModal.torreApto || 'N/A'}</p>
              <p><strong>Referencia:</strong> {citaModal.referencia || 'N/A'}</p>
              <p><strong>Parqueadero Moto:</strong> {citaModal.parqueaderoMoto ? 'Sí' : 'No'}</p>
              <p><strong>Estado:</strong> <span className="uppercase font-bold">{citaModal.estado || 'pendiente'}</span></p>

              {!editandoServicios && !confirmarFinalizar ? (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-1"><p className="font-bold text-slate-900">Servicios asignados:</p>{(citaModal.estado || '').toLowerCase() !== 'finalizada' && <button onClick={() => setEditandoServicios(true)} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold hover:bg-blue-100 cursor-pointer">✏️ Cambiar servicio</button>}</div>
                  {citaModal.servicios && Array.isArray(citaModal.servicios) ? (
                    citaModal.servicios.map((s, i) => (
                      <div key={i} className="flex justify-between bg-slate-50 p-1.5 rounded-lg mb-1"><span>{s.nombre}</span><span className="font-bold text-blue-600">{s.precio}</span></div>
                    ))
                  ) : <p>Servicio estándar</p>}
                  <p className="font-black text-right mt-2 text-sm text-emerald-700">Total: {citaModal.precioTotal || 'N/A'}</p>
                </div>
              ) : editandoServicios ? (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <p className="font-bold text-blue-600">Selecciona los nuevos servicios externos:</p>
                  {serviciosDisponibles.map(s => {
                    const sel = serviciosSeleccionadosCita.some(item => item.nombre === s.nombre);
                    return (
                      <div key={s.id} onClick={() => setServiciosSeleccionadosCita(sel ? serviciosSeleccionadosCita.filter(item => item.nombre !== s.nombre) : [...serviciosSeleccionadosCita, { nombre: s.nombre, precio: s.precioFormatted, precioNum: s.precioNum }])} className={`p-2 rounded-xl border cursor-pointer flex justify-between items-center ${sel ? 'bg-blue-50 border-blue-500 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                        <span>{s.nombre}</span><span className="text-blue-600">{s.precioFormatted}</span>
                      </div>
                    );
                  })}
                  <div className="flex gap-2 pt-2"><button onClick={() => setEditandoServicios(false)} className="w-1/2 bg-slate-100 py-2 rounded-xl font-bold">Cancelar</button><button onClick={handleGuardarServicios} className="w-1/2 bg-blue-600 text-white py-2 rounded-xl font-bold">Guardar cambios</button></div>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 text-center space-y-2">
                  <p className="font-bold text-emerald-700">¿Confirmar que deseas finalizar esta cita?</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setConfirmarFinalizar(false); setSliderVal(0); }} className="w-1/2 bg-slate-100 py-2 rounded-xl font-bold">No</button>
                    <button onClick={() => handleFinalizarCita(citaModal.id, citaModal.fecha, citaModal.hora)} className="w-1/2 bg-emerald-600 text-white py-2 rounded-xl font-bold">Sí, Finalizar</button>
                  </div>
                </div>
              )}
            </div>

            {!editandoServicios && !confirmarFinalizar && (
              <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                {(citaModal.estado || '').toLowerCase() !== 'finalizada' && (
                  <div className="space-y-2">
                    <div className="relative bg-emerald-100 rounded-2xl p-1 overflow-hidden flex items-center border border-emerald-300 shadow-inner">
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-emerald-800 uppercase tracking-widest pointer-events-none z-0">Desliza para finalizar &rarr;</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={sliderVal} 
                        onChange={e => {
                          const val = Number(e.target.value);
                          setSliderVal(val);
                          if (val > 90) setConfirmarFinalizar(true);
                        }} 
                        className="w-full opacity-0 cursor-pointer relative z-20 py-2"
                      />
                      <div className="absolute left-1 top-1 bottom-1 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xs font-bold pointer-events-none transition-all z-10 shadow-md" style={{ transform: `translateX(${sliderVal * 2.2}px)` }}>✓</div>
                    </div>
                    <button onClick={() => handleDeleteCita(citaModal.id, citaModal.fecha, citaModal.hora)} className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all">🗑️ Eliminar Cita</button>
                  </div>
                )}
                <button onClick={() => { setCitaModal(null); setSliderVal(0); setConfirmarFinalizar(false); }} className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL AGREGAR HORA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveModal} className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100"><h3 className="font-black text-xs uppercase text-slate-800">Agregar Horas Disponibles</h3><button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold">✕</button></div>
            <div className="flex gap-2"><button type="button" onClick={() => setModoRango(false)} className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${!modoRango ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Día único</button><button type="button" onClick={() => setModoRango(true)} className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${modoRango ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Rango de días</button></div>
            <div className="space-y-3 text-xs"><div><label className="text-[10px] font-bold text-slate-500 uppercase">{modoRango ? 'Fecha Desde' : 'Fecha'}</label><input type="date" value={modalIni} onChange={e => setModalIni(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1" required /></div>{modoRango && <div><label className="text-[10px] font-bold text-slate-500 uppercase">Fecha Hasta</label><input type="date" value={modalFin} onChange={e => setModalFin(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1" required /></div>}<div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Selecciona las horas disponibles</label><div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1">{horasPreset.map(h => <button key={h} type="button" onClick={() => setHorasModal(horasModal.includes(h) ? horasModal.filter(i => i !== h) : [...horasModal, h])} className={`py-2 rounded-xl text-xs font-bold border ${horasModal.includes(h) ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>{h}</button>)}</div></div></div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 bg-slate-100 py-2.5 rounded-xl text-xs font-bold text-slate-600">Cancelar</button><button type="submit" disabled={loading} className="w-1/2 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md">{loading ? 'Guardando...' : `Guardar (${horasModal.length})`}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}