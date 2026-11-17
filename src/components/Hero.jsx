import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Scan, 
  FileText, 
  UserCheck, 
  Zap, 
  Star, 
  ChevronRight, 
  X, 
  Sliders, 
  Camera 
} from 'lucide-react';

export default function Hero({ onOpenFichaModal }) {
  const [modalMiniScanOpen, setModalMiniScanOpen] = useState(false);
  const [pasoMiniScan, setPasoMiniScan] = useState(1);
  const [tipoRostroSeleccionado, setTipoRostroSeleccionado] = useState('Ovalado');

  const metricasRapidas = [
    { valor: '+15k', label: 'Fichas Generadas' },
    { valor: '99.2%', label: 'Precisión IA' },
    { valor: '4.9★', label: 'Valoración Barberos' }
  ];

  return (
    <section className="relative pt-20 pb-8 px-3 sm:px-6 bg-gradient-to-b from-sky-50/80 via-white to-blue-50/40 font-sans text-slate-800 overflow-hidden select-none">
      
      {/* FONDO TÉCNICO Y DEGRADADOS CELESTES SUTILES */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-200/40 via-blue-100/20 to-transparent pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        
        {/* BADGE COMPACTO SUPERIOR */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-1.5 bg-white border border-sky-200 shadow-sm px-2.5 py-1 rounded-full animate-bounce-short">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
              Ficha Técnica de Visagismo IA
            </span>
            <span className="bg-amber-300 text-amber-950 font-black text-[9px] px-1.5 py-0.2 rounded-md uppercase">
              Gratis
            </span>
          </div>
        </div>

        {/* REJILLA PRINCIPAL EN 2 COLUMNAS COMPACTAS */}
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          
          {/* COLUMNA IZQUIERDA: CONTENIDO Y LLAMADO A LA ACCIÓN */}
          <div className="lg:col-span-7 space-y-3 text-center lg:text-left">
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Diseña tu corte ideal con <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 bg-clip-text text-transparent">
                Visagismo Biométrico
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Crea tu <strong className="text-blue-700 font-bold">Ficha Técnica digital en 1 minuto</strong>. Analizamos la estructura de tu rostro y tipo de cabello para recomendarte el estilo perfecto antes de cortarte.
            </p>

            {/* CAJA DE ACCIÓN PRINCIPAL Y BOTONES COMPACTOS */}
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5">
              <button
                onClick={onOpenFichaModal}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 hover:from-blue-700 hover:to-sky-600 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-sky-400/30"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>Crear Ficha Técnica Gratis</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>

              <button
                onClick={() => setModalMiniScanOpen(true)}
                className="w-full sm:w-auto bg-white hover:bg-sky-50 text-blue-700 font-bold px-4 py-2.5 rounded-xl text-xs border border-sky-200 shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Scan className="w-3.5 h-3.5 text-sky-500" />
                <span>Probar Escáner IA</span>
              </button>
            </div>

            {/* BENEFICIOS RÁPIDOS */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1 pt-1 text-[10px] font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-amber-500" />
                100% Gratuito
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                Llévala a tu barbería
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-600" />
                Análisis simétrico IA
              </span>
            </div>

            {/* MÉTRICAS COMPACTAS */}
            <div className="pt-2 grid grid-cols-3 gap-2 border-t border-sky-100/80 max-w-md mx-auto lg:mx-0">
              {metricasRapidas.map((item, idx) => (
                <div key={idx} className="bg-white/80 border border-sky-100 rounded-lg p-1.5 text-center shadow-xs">
                  <span className="block text-xs sm:text-sm font-black text-blue-700 leading-none">
                    {item.valor}
                  </span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* COLUMNA DERECHA: TARJETA INTERACTIVA COMPACTA DE LA FICHA TÉCNICA */}
          <div className="lg:col-span-5 relative">
            
            {/* RESPLANDOR AMARILLO Y AZUL DE FONDO */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 rounded-2xl blur-md opacity-40 pointer-events-none" />

            {/* TARJETA SIMULADORA DE FICHA TÉCNICA */}
            <div className="relative bg-white border border-sky-200 rounded-2xl p-3.5 shadow-xl space-y-2.5">
              
              {/* ENCABEZADO FICHA */}
              <div className="flex items-center justify-between pb-2 border-b border-sky-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[10px] shadow-sm">
                    AV
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase text-slate-900 tracking-wider">
                      Ficha Biométrica #8492
                    </h3>
                    <p className="text-[8px] font-bold text-sky-600">Diagnóstico de Visagismo Digital</p>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">
                  Simetría 98.4%
                </span>
              </div>

              {/* DETALLES TÉCNICOS VISUALES COMPACTOS */}
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div className="bg-sky-50/70 border border-sky-100 p-2 rounded-xl">
                  <span className="text-slate-500 font-bold block uppercase text-[7px]">Tipo de Rostro</span>
                  <span className="font-black text-blue-900 text-[10px]">Diamante / Angular</span>
                </div>
                <div className="bg-sky-50/70 border border-sky-100 p-2 rounded-xl">
                  <span className="text-slate-500 font-bold block uppercase text-[7px]">Densidad Capilar</span>
                  <span className="font-black text-blue-900 text-[10px]">Media - Alta (Crespo/Liso)</span>
                </div>
              </div>

              {/* RECOMENDACIÓN IA Y CORTE SUGERIDO */}
              <div className="bg-gradient-to-r from-blue-900 to-sky-900 text-white p-2.5 rounded-xl space-y-1 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Corte Recomendado IA
                  </span>
                  <span className="text-[8px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                    TOP 1
                  </span>
                </div>
                <p className="text-[10px] font-black text-white">
                  Mid Fade Texturizado + Barba Perfilada HD
                </p>
                <p className="text-[8px] text-sky-200 leading-tight">
                  Suaviza pómulos marcados y compensa el volumen superior.
                </p>
              </div>

              {/* NOTAS TÉCNICAS PARA EL BARBERO */}
              <div className="border border-slate-200 rounded-xl p-2 bg-slate-50/80 text-[8px] space-y-1">
                <span className="font-bold text-slate-700 uppercase block">Indicaciones para Barbero:</span>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5 font-medium">
                  <li>Guía #1.5 a lados con degradado progresivo.</li>
                  <li>Texturizar zona superior con tijera de pulir al 30%.</li>
                </ul>
              </div>

              {/* BOTÓN INFERIOR DE ACCIÓN RÁPIDA */}
              <button
                onClick={onOpenFichaModal}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Generar Mi Ficha Técnica Gratis</span>
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* MODAL SIMULADOR RÁPIDO DE ESCÁNER IA */}
      {modalMiniScanOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white border border-sky-200 rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-2xl relative text-slate-800">
            
            <button 
              onClick={() => { setModalMiniScanOpen(false); setPasoMiniScan(1); }}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                IA
              </div>
              <h3 className="text-xs font-black uppercase text-slate-900">
                Simulador de Escáner de Visagismo
              </h3>
            </div>

            {pasoMiniScan === 1 && (
              <div className="space-y-2 text-[10px]">
                <p className="font-medium text-slate-600">
                  Selecciona la forma aproximada de tu rostro para previsualizar tu Ficha Técnica:
                </p>
                
                <div className="grid grid-cols-2 gap-1.5">
                  {['Ovalado', 'Cuadrado', 'Diamante', 'Redondo'].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setTipoRostroSeleccionado(tipo)}
                      className={`p-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        tipoRostroSeleccionado === tipo 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-sky-50 text-slate-700 border-sky-100 hover:bg-sky-100'
                      }`}
                    >
                      Rostro {tipo}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPasoMiniScan(2)}
                  className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                >
                  <span>Siguiente: Analizar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {pasoMiniScan === 2 && (
              <div className="space-y-2 text-[10px] text-center">
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-1">
                  <Sparkles className="w-5 h-5 text-amber-500 mx-auto animate-spin" />
                  <p className="font-black text-blue-900">Analizando proporciones para rostro {tipoRostroSeleccionado}</p>
                  <p className="text-slate-500 text-[9px]">Calculando volumen ideal y simetría de barba...</p>
                </div>

                <button
                  onClick={() => {
                    setModalMiniScanOpen(false);
                    setPasoMiniScan(1);
                    if (onOpenFichaModal) onOpenFichaModal();
                  }}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ver Ficha Técnica Completa</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </section>
  );
}