import React from "react";
import { Sprout, Satellite, Wifi, WifiOff, Download } from "lucide-react";

export default function Navbar({
  mode,
  onChangeMode,
  isOnline,
  forceOffline,
  onToggleOffline,
  onDownloadBundle,
  cachedCount = 0,
  syncStatus = "",
}) {
  const onlineActive = !forceOffline && isOnline;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Official Logos and App Identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-stone-50 p-1 rounded-xl border border-stone-200">
            <img
              src="/logos/nasa-space-apps.png"
              alt="NASA Space Apps Challenge"
              className="h-7 sm:h-8 w-auto object-contain"
            />
            <div className="h-5 w-px bg-stone-200" aria-hidden="true" />
            <img
              src="/logos/alcaldia-cochabamba-celeste.png"
              alt="Alcaldía de Cochabamba"
              className="h-7 sm:h-8 w-7 sm:w-8 object-cover rounded-md"
            />
            <img
              src="/logos/alcaldia-cochabamba-escudo.jpg"
              alt="GAMC Escudo"
              className="h-7 sm:h-8 w-auto object-contain rounded-xs"
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-stone-900 leading-tight">
              Tarpuy Cochabamba
            </h1>
            <p className="text-[10px] sm:text-[11px] font-medium text-emerald-700">
              NASA Earth Data • GAMC
            </p>
          </div>
        </div>

        {/* Center: Segmented Switcher */}
        <nav className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => onChangeMode("producer")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === "producer"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Guía del Productor</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeMode("technical")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === "technical"
                ? "bg-[#0B3D91] text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Satellite className="w-4 h-4" />
            <span>Panel Científico NASA</span>
          </button>
        </nav>

        {/* Right: Connectivity & Offline Cache Controls */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              onlineActive
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {onlineActive ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span className="hidden sm:inline">
              {onlineActive ? "En línea" : "Modo Campo"}
            </span>
          </span>

          <button
            type="button"
            onClick={onToggleOffline}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition"
          >
            {forceOffline ? "Reconectar Red" : "Modo Campo (Sin Red)"}
          </button>

          <button
            type="button"
            onClick={onDownloadBundle}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Guardar Offline ({cachedCount})</span>
          </button>
        </div>
      </div>

      {syncStatus ? (
        <div className="bg-emerald-50 border-t border-emerald-200 px-3 sm:px-6 py-1 text-[11px] font-medium text-emerald-900 text-center">
          {syncStatus}
        </div>
      ) : null}
    </header>
  );
}
