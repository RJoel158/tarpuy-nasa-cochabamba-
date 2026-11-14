import React from "react";
import { CloudSun, Sprout, MapPin, Database, Volume2, Square, Download, Wifi, WifiOff, LocateFixed } from "lucide-react";

const NAV_ITEMS = [
  { id: "clima", label: "Clima hoy", Icon: CloudSun },
  { id: "siembra", label: "Qué sembrar", Icon: Sprout },
  { id: "mapa", label: "Mapa", Icon: MapPin },
  { id: "datos", label: "Datos NASA", Icon: Database },
];

const SHORT_ZONES = [
  { id: "punata_valle_alto", label: "Punata · Valle Alto", short: "Punata" },
  { id: "tapacari_zona_andina", label: "Tapacarí · Altura", short: "Tapacarí" },
  { id: "mizque_cono_sur", label: "Mizque · Cono Sur", short: "Mizque" },
];

export default function Navbar({
  activeView = "clima",
  onChangeView,
  zoneId = "punata_valle_alto",
  onSelectZone,
  onDetectGps,
  voiceLang = "qu",
  onChangeVoiceLang,
  isSpeaking = false,
  onSpeakGuide,
  onStopAudio,
  isOnline = true,
  forceOffline = false,
  onToggleOffline,
  onDownloadBundle,
  cachedCount = 0,
  syncStatus = "",
}) {
  const onlineActive = !forceOffline && isOnline;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-[#0B2545] text-slate-100 min-h-screen sticky top-0 max-h-screen justify-between p-5 border-r border-[#081B33]">
        <div className="space-y-6">
          {/* Brand & Logos */}
          <div className="space-y-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5 bg-white rounded-lg px-2.5 py-1.5 w-fit shadow-xs">
              <img src="/logos/nasa-space-apps.png" alt="NASA Space Apps" className="h-6 w-auto object-contain" />
              <span className="h-5 w-px bg-slate-200" aria-hidden="true" />
              <img src="/logos/alcaldia-cochabamba-escudo.jpg" alt="Alcaldía de Cochabamba" className="h-7 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">Tarpuy Cochabamba</h1>
              <p className="text-xs text-sky-300/90">Guía agrícola por satélite</p>
            </div>
          </div>

          {/* Single Community Switcher */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Comunidad</span>
            <div className="space-y-1">
              {SHORT_ZONES.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => onSelectZone(z.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                    zoneId === z.id
                      ? "bg-[#009FE3] text-white font-semibold shadow-xs"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onDetectGps}
              className="w-full mt-1.5 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-sky-300 bg-white/5 hover:bg-white/15 border border-white/10 transition cursor-pointer"
            >
              <LocateFixed className="w-3.5 h-3.5 shrink-0" />
              <span>Detectar mi ubicación (GPS)</span>
            </button>
          </div>

          {/* 4 Decentralized Screens */}
          <nav className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Secciones</span>
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onChangeView(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition cursor-pointer ${
                  activeView === id
                    ? "bg-white text-[#0B2545] font-bold shadow-xs"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${activeView === id ? "text-[#009FE3]" : ""}`} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Audio & Offline Controls */}
        <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
          <div className="flex rounded-lg bg-black/25 p-1">
            {[{ id: "qu", label: "Qhichwa" }, { id: "es", label: "Castellano" }].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onChangeVoiceLang(l.id)}
                className={`flex-1 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                  voiceLang === l.id ? "bg-[#009FE3] text-white shadow-xs" : "text-slate-300 hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={isSpeaking ? onStopAudio : onSpeakGuide}
            className={`w-full py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              isSpeaking ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-amber-400 hover:bg-amber-300 text-[#0B2545]"
            }`}
          >
            {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? "Detener audio" : "Escuchar guía"}</span>
          </button>

          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-300 pt-1">
            <button type="button" onClick={onToggleOffline} className="inline-flex items-center gap-1 hover:text-white cursor-pointer">
              {onlineActive ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
              <span>{onlineActive ? "Con red" : "Sin red"}</span>
            </button>
            <button type="button" onClick={onDownloadBundle} className="inline-flex items-center gap-1 hover:text-white font-semibold cursor-pointer">
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Guardar ({cachedCount})</span>
            </button>
          </div>
          {syncStatus ? <p className="text-[11px] text-sky-300 leading-snug">{syncStatus}</p> : null}
        </div>
      </aside>

      {/* Mobile Header + Bottom Tab Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0B2545] text-white px-3 py-2.5 space-y-2 border-b border-[#081B33]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-white rounded px-1.5 py-0.5 flex items-center gap-1.5 shrink-0">
              <img src="/logos/nasa-space-apps.png" alt="NASA" className="h-5 w-auto object-contain" />
              <img src="/logos/alcaldia-cochabamba-escudo.jpg" alt="Alcaldía Cochabamba" className="h-5 w-auto object-contain" />
            </div>
            <span className="font-bold text-sm tracking-tight truncate">Tarpuy</span>
          </div>
          <button
            type="button"
            onClick={isSpeaking ? onStopAudio : onSpeakGuide}
            className="px-3 py-1.5 rounded-lg bg-amber-400 text-[#0B2545] font-bold text-xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {isSpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{voiceLang === "qu" ? "Qhichwa" : "Voz"}</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {SHORT_ZONES.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => onSelectZone(z.id)}
              className={`py-1.5 px-2 rounded-lg text-xs text-center transition cursor-pointer ${
                zoneId === z.id
                  ? "bg-[#009FE3] text-white font-bold shadow-xs"
                  : "bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              {z.short}
            </button>
          ))}
        </div>
      </header>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 grid grid-cols-4 text-[11px]">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChangeView(id)}
            className={`py-2.5 flex flex-col items-center gap-1 ${activeView === id ? "text-[#0284C7] font-bold" : "text-slate-500"}`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
