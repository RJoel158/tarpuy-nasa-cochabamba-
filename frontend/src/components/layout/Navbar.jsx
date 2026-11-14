import React from "react";
import { CloudSun, Sprout, MapPin, Database, BarChart3, Volume2, Square, Download, Wifi, WifiOff, LocateFixed } from "lucide-react";
import CommunitySearchCombobox from "../ui/CommunitySearchCombobox.jsx";
import { tr } from "../../utils/quechuaI18n.js";
import { IlustracionTarpuy } from "../illustrations/TarpuyIllustrations.jsx";

const NAV_ITEMS = [
  { id: "clima", key: "navWeather", Icon: CloudSun },
  { id: "siembra", key: "navPlant", Icon: Sprout },
  { id: "mapa", key: "navMap", Icon: MapPin },
  { id: "datos", key: "navNasa", Icon: Database },
];

const MODE_OPTIONS = [
  { id: "facil", key: "easyMode", shortKey: "easyShort", Icon: Sprout, activeCls: "bg-emerald-600 text-white shadow-xs" },
  { id: "avanzado", key: "advMode", shortKey: "advShort", Icon: BarChart3, activeCls: "bg-[var(--hoja-oscura)] text-white shadow-xs" },
];

export default function Navbar({
  compact = false,
  activeView = "clima",
  onChangeView,
  appMode = "facil",
  onChangeAppMode,
  zoneId = "punata_valle_alto",
  selectedCommunityName = "Punata",
  onSelectCommunity,
  onDetectGps,
  voiceLang = "es",
  onChangeVoiceLang,
  isSpeaking = false,
  onSpeakGuide,
  onStopAudio,
  isOnline = true,
  forceOffline = false,
  onToggleOffline,
  onDownloadBundle,
  cachedCount = 0,
  dbStats = null,
  syncStatus = "",
}) {
  const onlineActive = !forceOffline && isOnline;
  const visibleNavItems = appMode === "avanzado" ? NAV_ITEMS : NAV_ITEMS.filter((i) => i.id !== "datos");

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 shrink-0 h-screen sticky top-0 overflow-y-auto bg-[var(--tarjeta)] text-[var(--tinta)] border-r border-slate-200 p-5 gap-7">
        <div className="flex items-center gap-3 py-2">
          <Sprout className="w-8 h-8 text-[var(--hoja-oscura)]" aria-hidden="true" />
          <div><h1 className="text-xl font-extrabold">Tarpuy</h1><p className="text-xs text-slate-600">Cochabamba</p></div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">{tr(voiceLang, "community")}</p>
          <CommunitySearchCombobox variant="light" selectedZoneId={zoneId} selectedCommunityName={selectedCommunityName} onSelectCommunity={onSelectCommunity} />
        </div>
        <nav aria-label="Secciones" className="space-y-2">
          {visibleNavItems.map(({ id, key, Icon }) => (
            <button key={id} type="button" onClick={() => onChangeView(id)} aria-current={activeView === id ? "page" : undefined}
              className={`w-full min-h-12 flex items-center gap-3 px-3 rounded-xl text-sm cursor-pointer ${activeView === id ? "bg-[var(--hoja-suave)] text-[var(--hoja-oscura)] font-bold" : "text-slate-600 hover:bg-[var(--arena)]"}`}>
              <IlustracionTarpuy id={id === "clima" ? "sol" : id === "siembra" ? "mano_siembra" : id === "mapa" ? "mapa_chacra" : "datos"} size={30} /><span>{tr(voiceLang, key)}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-4 border-t border-slate-200 pt-5">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--arena)] p-1">
            {[{ id: "es", label: "Castellano" }, { id: "qu", label: "Qhichwa" }].map((l) => (
              <button key={l.id} type="button" onClick={() => onChangeVoiceLang(l.id)} aria-pressed={voiceLang === l.id}
                className={`min-h-11 rounded-lg text-xs font-bold cursor-pointer ${voiceLang === l.id ? "bg-[var(--tarjeta)] text-[var(--hoja-oscura)] shadow-sm" : "text-slate-600"}`}>{l.label}</button>
            ))}
          </div>
          <button type="button" onClick={isSpeaking ? onStopAudio : onSpeakGuide}
            className={`w-full min-h-12 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer ${isSpeaking ? "bg-[var(--alerta-critico)] text-white" : "bg-[var(--hoja-oscura)] text-white hover:bg-[var(--hoja)]"}`}>
            {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
            <span>{tr(voiceLang, isSpeaking ? "stopAudio" : "listenGuide")}</span>
          </button>
          <details className="text-xs text-slate-600">
            <summary className="min-h-11 flex items-center cursor-pointer font-semibold">{voiceLang === "qu" ? "Astawan" : "Más opciones"}</summary>
            <div className="space-y-3 pt-2 pb-3">
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-[var(--arena)] p-1">
                {MODE_OPTIONS.map((m) => <button key={m.id} type="button" onClick={() => onChangeAppMode?.(m.id)} aria-pressed={appMode === m.id}
                  className={`min-h-11 rounded-md font-bold ${appMode === m.id ? "bg-[var(--hoja-oscura)] text-white" : "text-slate-600"}`}>{tr(voiceLang, m.shortKey)}</button>)}
              </div>
              <button type="button" onClick={onDetectGps} className="min-h-11 flex gap-2 items-center"><LocateFixed className="w-4 h-4" />{tr(voiceLang, "detectGps")}</button>
              <button type="button" onClick={onToggleOffline} className="min-h-11 flex gap-2 items-center">{onlineActive ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}{tr(voiceLang, onlineActive ? "online" : "offline")}</button>
              <button type="button" onClick={onDownloadBundle} className="min-h-11 flex gap-2 items-center"><Download className="w-4 h-4" />{tr(voiceLang, "refreshCopy")} ({dbStats?.sizeKb ? `${dbStats.sizeKb} KB` : cachedCount})</button>
              <p className="leading-relaxed break-words">{syncStatus || tr(voiceLang, "autoSaveDefault")}</p>
            </div>
          </details>
          <p className="flex items-center gap-2 text-xs text-slate-600"><span aria-hidden="true" className={`w-2 h-2 rounded-full ${onlineActive ? "bg-[var(--hoja)]" : "bg-[var(--alerta-cuidado)]"}`} />{tr(voiceLang, onlineActive ? "online" : "offline")}</p>
        </div>
      </aside>

      {/* Mobile Header + Bottom Tab Bar */}
      <header className={`${compact ? "hidden" : "lg:hidden"} producer-header relative z-40 bg-[var(--tarjeta)] text-[var(--tinta)] px-3 py-2.5 space-y-2 border-b border-[var(--tinta)]`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="bg-white rounded px-1.5 py-0.5 flex items-center gap-1 shrink-0">
              <img src="/logos/nasa-space-apps.png" alt="NASA" className="h-5 w-auto object-contain" />
              <img src="/logos/alcaldia-cochabamba-escudo.jpg" alt="Alcaldía Cochabamba" className="h-5 w-auto object-contain" />
            </div>
            <span className="font-bold text-sm tracking-tight truncate">Tarpuy</span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="inline-flex rounded-lg bg-[var(--arena)] p-0.5 text-[11px]">
              {MODE_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChangeAppMode?.(m.id)}
                  aria-label={tr(voiceLang, m.key)}
                  aria-pressed={appMode === m.id}
                  className={`min-h-12 px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                    appMode === m.id ? m.activeCls : "text-slate-600"
                  }`}
                >
                  {tr(voiceLang, m.shortKey)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onChangeVoiceLang(voiceLang === "qu" ? "es" : "qu")}
              aria-label="Cambiar idioma Castellano o Qhichwa"
              className="min-h-12 px-3 rounded-xl bg-[var(--arena)] text-[var(--tinta)] font-bold text-sm cursor-pointer"
            >
              {voiceLang === "qu" ? "Qhichwa" : "Castellano"}
            </button>
            <button
              type="button"
              onClick={isSpeaking ? onStopAudio : onSpeakGuide}
              className="min-h-12 px-4 rounded-xl bg-amber-400 text-[var(--tinta)] font-bold text-base inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{tr(voiceLang, isSpeaking ? "stopAudio" : "listenGuide")}</span>
            </button>
          </div>
        </div>

        <CommunitySearchCombobox
          selectedZoneId={zoneId}
          selectedCommunityName={selectedCommunityName}
          onSelectCommunity={onSelectCommunity}
          variant="light"
        />

        <button type="button" onClick={onDetectGps}
          className="w-full min-h-12 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-[var(--arena)] px-3 py-3 text-sm font-semibold text-[var(--tinta)]">
          <LocateFixed className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>{tr(voiceLang, "detectGps")}</span>
        </button>
      </header>

      <nav className={`lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 grid text-sm pb-[env(safe-area-inset-bottom)] ${visibleNavItems.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
        {visibleNavItems.map(({ id, key, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChangeView(id)}
            aria-current={activeView === id ? "page" : undefined}
            className={`min-h-20 py-3 flex flex-col items-center justify-center gap-1.5 ${activeView === id ? "text-[var(--cielo-oscuro)] font-bold" : "text-slate-500"}`}
          >
            <Icon className="w-7 h-7" aria-hidden="true" />
            <span>{tr(voiceLang, key)}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
