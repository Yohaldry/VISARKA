import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiMapPin, FiCalendar, FiArrowRight, FiX, FiCheck } from 'react-icons/fi';
import { db } from '../../components/firebase';
import { doc, getDoc, collection, addDoc, onSnapshot, query, where, getDocs, updateDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

export default function BarberBookingView({ onBookingComplete }) {
  const { barberoId } = useParams();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const todayStr = new Date().toISOString().split('T')[0];
  const [showBio, setShowBio] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [dispDias, setDispDias] = useState({});
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [detalleCita, setDetalleCita] = useState(null);
  const [currDate, setCurrDate] = useState(new Date());
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', direccion: '', referencia: '', torreApto: '', parqueaderoMoto: false });

  useEffect(() => {
    if (!barberoId) return;
    Promise.all([
      getDoc(doc(db, "profesionales", barberoId)),
      getDocs(query(collection(db, "servicios"), where("barberoId", "==", barberoId))),
      getDocs(query(collection(db, "calendarioprofesionales"), where("barberoId", "==", barberoId)))
    ]).then(([docSnap, servSnap, dispSnap]) => {
      if (!docSnap.exists()) return setError("No se encontró el perfil.");
      const data = docSnap.data(), listaServicios = [], diasMap = {};
      servSnap.forEach(s => {
        const sD = s.data();
        if (!String(sD.duracion || '').toLowerCase().includes('interno')) {
          const precioNum = Number(sD.precioNum || sD.precio || 35000) || 35000;
          listaServicios.push({ id: s.id, name: sD.nombre || sD.name || 'Servicio', descripcion: sD.descripcion || '', priceNum: precioNum, priceFormatted: sD.precioText || `$${precioNum.toLocaleString('es-CO')} COP`, categoria: sD.categoria || 'servicio', color: sD.color || '#3b82f6' });
        }
      });
      dispSnap.forEach(d => { 
        const dD = d.data(); 
        if (dD.fecha && !dD.ocupado) {
          (diasMap[dD.fecha] = diasMap[dD.fecha] || []).push(dD.hora); 
        }
      });
      setDispDias(diasMap);
      setBarber({ id: docSnap.id, name: data.nombre || "Profesional", email: data.email || "", location: data.ciudad || "Bogotá D.C.", rating: "4.9", reviewsCount: 231, image: data.foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop", bio: data.descripcion || "Especialista en visagismo y cortes de alta precisión.", services: listaServicios });
      setLoading(false);
    }).catch(() => { setError("Error al conectar con la base de datos."); setLoading(false); });
  }, [barberoId]);

  useEffect(() => {
    if (!barberoId || !selectedDate) return;
    return onSnapshot(query(collection(db, "citas"), where("barberoId", "==", barberoId)), (snap) => {
      const booked = new Set();
      snap.forEach(d => { const c = d.data(); if (c.fecha === selectedDate && c.estado !== 'cancelada' && c.hora) booked.add(c.hora.toLowerCase()); });
      setHorasOcupadas(Array.from(booked));
    });
  }, [barberoId, selectedDate]);

  const toggleSrv = (s) => setSelectedServices(prev => prev.some(item => item.id === s.id) ? prev.filter(item => item.id !== s.id) : [...prev, s]);
  const totalPrecio = selectedServices.reduce((acc, curr) => acc + curr.priceNum, 0);
  const formatCOP = (num) => `$${num.toLocaleString('es-CO')} COP`;

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedServices.length || !form.nombre || !form.email || !form.telefono || !form.direccion) return alert("Completa los campos obligatorios.");
    try {
      const clienteNombreCompleto = `${form.nombre} ${form.apellido}`;
      const bookingData = { 
        barberoId, barberoName: barber.name, fecha: selectedDate, hora: selectedTime, 
        servicios: selectedServices.map(s => ({ nombre: s.name, precio: s.priceFormatted, precioNum: s.priceNum })), 
        precioTotal: formatCOP(totalPrecio), clienteNombre: clienteNombreCompleto, ...form, estado: 'confirmada', createdAt: new Date().toISOString() 
      };
      await addDoc(collection(db, "citas"), bookingData);
      try {
        await updateDoc(doc(db, "calendarioprofesionales", `${barberoId}_${selectedDate}_${selectedTime.replace(/\s+/g, '_')}`), { ocupado: true, clienteNombre: clienteNombreCompleto, clienteEmail: form.email, clienteTelefono: form.telefono });
      } catch (err) { console.warn(err); }
      const srvTxt = selectedServices.map(s => s.name).join(', ');
      await Promise.all([
        emailjs.send("service_z91pc3e", 'template_qqht1ab', { to_name: clienteNombreCompleto, to_email: form.email, barbero_nombre: barber.name, fecha_cita: selectedDate, hora_cita: selectedTime, servicios: srvTxt, total: bookingData.precioTotal }, "JkBxr3kN07cKntGLN"),
        emailjs.send("service_z91pc3e", 'template_reteht9', { to_name: barber.name, to_email: barber.email || "yohaldryquintero1995@gmail.com", cliente_nombre: clienteNombreCompleto, cliente_telefono: form.telefono, fecha_cita: selectedDate, hora_cita: selectedTime, direccion: form.direccion, servicios: srvTxt, total: bookingData.precioTotal }, "JkBxr3kN07cKntGLN")
      ]);
      setDetalleCita(bookingData); setModalType('success');
      if (onBookingComplete) onBookingComplete(bookingData);
    } catch (err) { alert("Error al procesar el agendamiento."); }
  };

  const daysInMonth = () => {
    const y = currDate.getFullYear(), m = currDate.getMonth(), first = new Date(y, m, 1).getDay() - 1, total = new Date(y, m + 1, 0).getDate();
    let res = Array(first < 0 ? 6 : first).fill({ vacio: true });
    for (let i = 1; i <= total; i++) res.push({ fechaStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`, diaMes: i, vacio: false });
    return res;
  };

  if (loading) return <div className="w-full h-screen max-w-md mx-auto flex items-center justify-center text-xs text-slate-600 bg-slate-50 font-['Arial']">Cargando experiencia Visarka...</div>;
  if (error || !barber) return <div className="w-full h-screen max-w-md mx-auto flex items-center justify-center p-6 text-xs text-rose-500 bg-slate-50 font-['Arial']">{error}</div>;

  const srvs = barber.services.filter(s => s.categoria !== 'paquete'), pkgs = barber.services.filter(s => s.categoria === 'paquete');

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-gradient-to-b from-slate-50 via-sky-50/50 to-indigo-50/60 text-slate-900 flex flex-col justify-between overflow-y-auto shadow-2xl rounded-3xl border border-indigo-100 font-['Arial']">
      
      {/* Cabecera con Degradado Colorido Claro */}
      <div className="relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 pt-5 pb-16 px-5 rounded-b-[3rem] shadow-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/30 shadow-inner">
            <img src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" className="w-7 h-7 object-contain bg-white/90 rounded-lg p-0.5" alt="Logo" />
            <span className="text-[11px] font-black tracking-widest text-white">VISARKA</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-amber-200 text-xs font-black border border-white/30 shadow-inner">
            <FiStar className="fill-amber-300 text-amber-300" /><span>{barber.rating}</span>
          </div>
        </div>
      </div>

      {/* Imagen Grande Sin Bordes sobre fondo claro */}
      <div className="px-5 relative -mt-10 pb-3 bg-transparent text-center">
        <div className="flex justify-center mb-2">
          <div className="w-28 h-28 rounded-full overflow-hidden shadow-2xl ring-4 ring-white">
            <img src={barber.image} className="w-full h-full object-cover" alt={barber.name} />
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-indigo-100 space-y-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-100">Barbero Profesional VIP</span>
          <h1 className="text-base font-black uppercase text-slate-900 mt-1">{barber.name}</h1>
          <p className="text-slate-500 text-[10px] flex items-center justify-center font-bold">
            <FiMapPin className="text-indigo-500 mr-1" />{barber.location}
          </p>
          <p className={`text-slate-600 text-[10px] bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100 leading-relaxed ${showBio ? '' : 'line-clamp-2'}`}>{barber.bio}</p>
          {barber.bio?.length > 80 && <button onClick={() => setShowBio(!showBio)} className="text-[10px] font-bold text-indigo-600 hover:underline">{showBio ? 'Ver menos' : 'Ver más...'}</button>}
        </div>
      </div>

      {/* Contenido Central: Calendario */}
      <div className="px-5 py-2 space-y-3.5 flex-1">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-indigo-100 shadow-md space-y-2.5">
          <div className="flex justify-between items-center text-[11px] font-black text-slate-800">
            <span className="flex items-center"><FiCalendar className="mr-1.5 text-indigo-600" />{currDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setCurrDate(new Date(currDate.setMonth(currDate.getMonth() - 1)))} className="px-2 py-0.5 text-xs font-bold hover:bg-white rounded-lg text-slate-700 shadow-2xs">&lt;</button>
              <button onClick={() => setCurrDate(new Date(currDate.setMonth(currDate.getMonth() + 1)))} className="px-2 py-0.5 text-xs font-bold hover:bg-white rounded-lg text-slate-700 shadow-2xs">&gt;</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-slate-400">{['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'].map(d => <span key={d}>{d}</span>)}</div>
          <div className="grid grid-cols-7 gap-1.5">
            {daysInMonth().map((i, idx) => {
              if (i.vacio) return <div key={idx} />;
              const has = dispDias[i.fechaStr]?.length > 0, sel = selectedDate === i.fechaStr;
              return (
                <button key={i.fechaStr} type="button" onClick={() => has ? (setSelectedDate(i.fechaStr), setSelectedTime(null), setModalType('calendario_horas')) : alert("Este día no cuenta con disponibilidad.")} className={`h-10 rounded-2xl flex flex-col items-center justify-center border text-xs transition-all ${sel ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md scale-105' : has ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold hover:bg-emerald-100 shadow-2xs' : 'bg-slate-100 text-slate-300 border-slate-200 opacity-40 cursor-not-allowed'}`}>
                  <span className="text-[11px]">{i.diaMes}</span>
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${sel ? 'bg-white' : has ? 'bg-emerald-500' : 'bg-transparent'}`} />
                </button>
              );
            })}
          </div>
          {selectedTime && (
            <div className="text-[10px] text-indigo-900 font-bold bg-indigo-50/80 border border-indigo-100 p-2.5 rounded-2xl flex justify-between items-center shadow-2xs">
              <span>📅 {selectedDate} a las {selectedTime}</span>
              <button onClick={() => setModalType('calendario_horas')} className="text-indigo-600 underline font-black">Cambiar hora</button>
            </div>
          )}
        </div>
      </div>

      {/* Sección en la Mitad: Servicios Seleccionados y Botón de Continuar */}
      <div className="px-5 py-3 space-y-2 bg-gradient-to-t from-indigo-50/80 to-transparent border-t border-indigo-100/60">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Servicios Seleccionados:</span>
          <div className="flex gap-1.5">
            <button onClick={() => setModalType('servicios')} className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-1 rounded-xl font-bold shadow-sm">+ Servicios</button>
            <button onClick={() => setModalType('paquetes')} className="text-[10px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-2.5 py-1 rounded-xl font-bold shadow-sm">+ Paquetes</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 p-2.5 bg-white/90 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-sm min-h-[42px] items-center">
          {selectedServices.length ? selectedServices.map(s => (
            <span key={s.id} className="inline-flex items-center text-[10px] px-2.5 py-1 rounded-xl border font-bold bg-indigo-50/60 border-indigo-200 text-slate-800 shadow-2xs">
              {s.name} <span className="text-indigo-600 ml-1">({s.priceFormatted})</span> 
              <button onClick={(e) => { e.stopPropagation(); toggleSrv(s); }} className="ml-1.5 text-rose-500 font-bold hover:text-rose-700">×</button>
            </span>
          )) : <span className="text-[10px] text-slate-400 italic">Selecciona hora primero, luego añade servicios.</span>}
        </div>

        <motion.button whileTap={{ scale: 0.98 }} disabled={!selectedTime || !selectedServices.length} onClick={() => setModalType('form')} className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 disabled:opacity-40 text-white font-black py-3 px-4 rounded-2xl flex items-center justify-between shadow-lg shadow-indigo-500/25 transition-all mt-2">
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-wider text-sky-100 font-bold">{selectedServices.length} {selectedServices.length === 1 ? 'servicio' : 'servicios'}</span>
            <span className="text-sm font-black">{formatCOP(totalPrecio)}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white/20 px-3.5 py-2 rounded-xl text-xs font-black shadow-inner">
            <span className="uppercase">Continuar</span><FiArrowRight />
          </div>
        </motion.button>
      </div>

      {/* Modales Interactivos */}
      <AnimatePresence>
        {modalType && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-sm p-0 sm:p-4">
            <motion.div initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 300, opacity: 0 }} className="w-full max-h-[85vh] bg-white text-slate-900 rounded-t-[2.5rem] sm:rounded-3xl p-6 flex flex-col overflow-y-auto shadow-2xl border border-indigo-100">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600">
                  {modalType === 'calendario_horas' ? `Horas Disponibles (${selectedDate})` : modalType.replace('_', ' ')}
                </h3>
                <button onClick={() => setModalType(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"><FiX size={16} /></button>
              </div>
              
              {modalType === 'calendario_horas' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {dispDias[selectedDate]?.map(h => {
                      const occ = horasOcupadas.includes(h.toLowerCase()), sel = selectedTime === h;
                      return occ ? (
                        <div key={h} className="bg-rose-50 border border-rose-200 text-rose-400 py-2.5 rounded-2xl text-[10px] text-center line-through font-bold">{h}</div>
                      ) : (
                        <button key={h} onClick={() => { setSelectedTime(h); setModalType('servicios'); }} className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${sel ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50'}`}>{h}</button>
                      );
                    })}
                  </div>
                  <button onClick={() => setModalType(null)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl text-xs font-bold">Cerrar</button>
                </div>
              )}

              {(modalType === 'servicios' || modalType === 'paquetes') && (
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => setModalType('servicios')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${modalType === 'servicios' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Servicios</button>
                    <button onClick={() => setModalType('paquetes')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${modalType === 'paquetes' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Paquetes</button>
                  </div>
                  {(modalType === 'servicios' ? srvs : pkgs).map(s => {
                    const sel = selectedServices.some(item => item.id === s.id);
                    return (
                      <div key={s.id} onClick={() => toggleSrv(s)} className={`p-3.5 rounded-2xl border cursor-pointer flex justify-between items-center transition-all shadow-2xs ${sel ? 'bg-indigo-50/80 border-indigo-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{s.name}</h4>
                          <p className="text-[10px] text-indigo-600 font-bold mt-0.5">{s.priceFormatted}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${sel ? 'bg-blue-600 text-white border-blue-500 shadow-sm' : 'border-slate-300 bg-slate-50'}`}>{sel && <FiCheck size={12} />}</div>
                      </div>
                    );
                  })}
                  <button onClick={() => setModalType(null)} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider mt-3 shadow-md">Confirmar Servicios</button>
                </div>
              )}

              {modalType === 'form' && (
                <form onSubmit={handleBooking} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input required placeholder="Nombre *" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none focus:border-indigo-500 text-slate-900" />
                    <input required placeholder="Apellido *" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none focus:border-indigo-500 text-slate-900" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input required type="email" placeholder="Correo *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none focus:border-indigo-500 text-slate-900" />
                    <input required type="tel" placeholder="Teléfono *" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none focus:border-indigo-500 text-slate-900" />
                  </div>
                  <input required placeholder="Dirección del domicilio *" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none focus:border-indigo-500 text-slate-900" />
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Torre / Apto" value={form.torreApto} onChange={e => setForm({...form, torreApto: e.target.value})} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none focus:border-indigo-500 text-slate-900" />
                    <input placeholder="Referencia" value={form.referencia} onChange={e => setForm({...form, referencia: e.target.value})} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none focus:border-indigo-500 text-slate-900" />
                  </div>
                  <label className="flex items-center gap-2.5 pt-1 font-bold text-[11px] text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <input type="checkbox" checked={form.parqueaderoMoto} onChange={e => setForm({...form, parqueaderoMoto: e.target.checked})} className="w-4 h-4 accent-indigo-600 rounded" /> 
                    ¿Hay parqueadero para la moto?
                  </label>
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black py-3.5 rounded-2xl uppercase tracking-wider shadow-lg shadow-indigo-500/25 mt-2">Confirmar Cita</button>
                </form>
              )}

              {modalType === 'success' && detalleCita && (
                <div className="text-center space-y-3.5 py-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">✓</div>
                  <h3 className="text-sm font-black uppercase text-slate-900">¡Cita Agendada con Éxito!</h3>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs text-slate-700">
                    <p><strong>Cliente:</strong> {detalleCita.clienteNombre}</p>
                    <p><strong>Fecha:</strong> {detalleCita.fecha} a las {detalleCita.hora}</p>
                    <p><strong>Dirección:</strong> {detalleCita.direccion}</p>
                    <p className="text-indigo-600 font-bold"><strong>Total:</strong> {detalleCita.precioTotal}</p>
                  </div>
                  <button onClick={() => window.location.reload()} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md">Finalizar</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}