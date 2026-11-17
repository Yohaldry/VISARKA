import React, { useState } from 'react';
import { 
  Star, 
  Plus, 
  ChevronRight,
  User,
  Mail,
  Phone,
  Calendar,
  Settings,
  LogOut
} from 'lucide-react';

export default function Perfil({ setCurrentTab, userData }) {
  const [activeCategory, setActiveCategory] = useState('Cortes');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Cortes', 'Barba', 'Visagismo', 'Tratamientos', 'VIP'];

  const services = [
    {
      id: 1,
      title: 'Corte Ejecutivo & Visagismo',
      subtitle: 'Estudio de rostro y perfilado',
      price: '$25.00',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=600&auto=format&fit=crop',
      category: 'Cortes'
    },
    {
      id: 2,
      title: 'Barba Térmica & Definición',
      subtitle: 'Toalla caliente y aceites premium',
      price: '$18.00',
      rating: '4.8',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop',
      category: 'Barba'
    },
    {
      id: 3,
      title: 'Asesoría de Imagen Facial',
      subtitle: 'Escaneo y diagnóstico completo',
      price: '$35.00',
      rating: '5.0',
      image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=600&auto=format&fit=crop',
      category: 'Visagismo'
    },
    {
      id: 4,
      title: 'Pack Completo VISARKA',
      subtitle: 'Corte + Barba + Mascarilla',
      price: '$45.00',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1512861596706-cde78742e235?q=80&w=600&auto=format&fit=crop',
      category: 'VIP'
    }
  ];

  const filteredServices = services.filter(item => 
    item.category === activeCategory && 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-12 select-none">
      
      {/* Contenedor principal tipo App Móvil */}
      <div className="max-w-md mx-auto min-h-screen bg-slate-950 px-5 pt-8 relative flex flex-col space-y-6">
        


        {/* SECCIÓN DE SERVICIOS POPULARES (Requerida) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 tracking-wide uppercase">
              Servicios Populares
            </h2>
            <button 
              onClick={() => setCurrentTab && setCurrentTab('catalog')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-0.5"
            >
              <span>Ver todo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-6">
            {filteredServices.length > 0 ? (
              filteredServices.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setCurrentTab && setCurrentTab('booking')}
                  className="bg-slate-900/80 rounded-3xl p-3 border border-slate-800/80 shadow-xl flex flex-col justify-between group hover:border-cyan-500/50 transition-all cursor-pointer"
                >
                  {/* Imagen y Badge de Rating */}
                  <div className="relative h-32 rounded-2xl overflow-hidden mb-3">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[10px] font-semibold text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  {/* Información del servicio */}
                  <div className="space-y-1 mb-3">
                    <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 line-clamp-1 font-light">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Precio y Botón Agregar / Agendar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-xs font-extrabold text-white">
                      {item.price}
                    </span>
                    <button className="w-7 h-7 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-slate-950 shadow-md hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-10 text-center text-slate-500 text-xs">
                No hay servicios en esta categoría o búsqueda.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}