import React from "react";
import { CloudSun, Sprout, MapPin, Database, Volume2, Square, Download, Wifi, WifiOff } from "lucide-react";

const NAV_ITEMS = [
  { id: "clima", label: "Clima hoy", Icon: CloudSun },
  { id: "siembra", label: "Qué sembrar", Icon: Sprout },
  { id: "mapa", label: "Mapa", Icon: MapPin },
  { id: "datos", label: "Datos NASA", Icon: Database },
];

const SHORT_ZONES = [
  { id: "punata_valle_alto", label: "Punata · Valle Alto" },
  { id: "tapacari_zona_andina", label: "Tapacarí · Altura" },
  { id: "mizque_cono_sur", label: "Mizque · Cono Sur" },
];

export default function Navbar({
  activeView = "clima",
  onChangeView,
  zoneId = "punata_valle_alto",
  onSelectZone,
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
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-[#13231B] text-stone-100 min-h-screen sticky top-0 max-h-screen justify-between p-5 border-r border-emerald-950">
        <div className="space-y-6">
          {/* Brand & Logos */}
          <div className="space-y-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 w-fit">
              <img src="/logos/nasa-space-apps.png" alt="NASA Space Apps" className="h-6 w-auto object-contain" />
              <img src="/logos/alcaldia-cochabamba-celeste.png" alt="Alcaldía Cochabamba" className="h-6 w-6 object-cover rounded-xs" />
              <img src="/logos/alcaldia-cochabamba-escudo.jpg" alt="Escudo GAMC" className="h-6 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">Tarpuy Cochabamba</h1>
              <p className="text-xs text-emerald-300/80">Guía agrícola por satélite</p>
            </div>
          </div>

          {/* Single Community Switcher */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Comunidad</span>
            <div className="space-y-1">
              {SHORT_ZONES.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => onSelectZone(z.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                    zoneId === z.id
                      ? "bg-emerald-700 text-white font-semibold"
                      : "text-stone-300 hover:bg-white/10"
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Decentralized Screens */}
          <nav className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-1.5">Secciones</span>
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onChangeView(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition cursor-pointer ${
                  activeView === id
                    ? "bg-white text-stone-900 font-bold"
                    : "text-stone-300 hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
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
                  voiceLang === l.id ? "bg-emerald-600 text-white" : "text-stone-300 hover:text-white"
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
              isSpeaking ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-amber-400 hover:bg-amber-300 text-stone-950"
            }`}
          >
            {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? "Detener audio" : "Escuchar guía"}</span>
          </button>

          <div className="flex items-center justify-between gap-2 text-[11px] text-stone-300 pt-1">
            <button type="button" onClick={onToggleOffline} className="inline-flex items-center gap-1 hover:text-white cursor-pointer">
              {onlineActive ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
              <span>{onlineActive ? "Con red" : "Sin red"}</span>
            </button>
            <button type="button" onClick={onDownloadBundle} className="inline-flex items-center gap-1 hover:text-white font-semibold cursor-pointer">
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Guardar ({cachedCount})</span>
            </button>
          </div>
          {syncStatus ? <p className="text-[11px] text-emerald-300 leading-snug">{syncStatus}</p> : null}
        </div>
      </aside>

      {/* Mobile Header + Bottom Tab Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#13231B] text-white px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img src="/logos/nasa-space-apps.png" alt="NASA" className="h-6 w-auto bg-white rounded px-1 py-0.5 shrink-0" />
          <select
            aria-label="Comunidad"
            value={zoneId}
            onChange={(e) => onSelectZone(e.target.value)}
            className="bg-white/10 text-white text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-white/15 truncate"
          >
            {SHORT_ZONES.map((z) => <option key={z.id} value={z.id} className="text-stone-900">{z.label}</option>)}
          </select>
        </div>
        <button
          type="button"
          onClick={isSpeaking ? onStopAudio : onSpeakGuide}
          className="px-3 py-1.5 rounded-lg bg-amber-400 text-stone-950 font-bold text-xs inline-flex items-center gap-1.5 shrink-0"
        >
          {isSpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{voiceLang === "qu" ? "Qhichwa" : "Voz"}</span>
        </button>
      </header>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 grid grid-cols-4 text-[11px]">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChangeView(id)}
            className={`py-2.5 flex flex-col items-center gap-1 ${activeView === id ? "text-emerald-800 font-bold" : "text-stone-500"}`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
