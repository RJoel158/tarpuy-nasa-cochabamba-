import React, { useState, useEffect, useCallback } from "react";
import ProducerMode from "./components/ProducerMode.jsx";
import TechnicalMode from "./components/TechnicalMode.jsx";
import InstitutionalBrandBar from "./components/InstitutionalBrandBar.jsx";
import { fetchZones, fetchCrops, fetchRecommendations, downloadZoneBundle, listCachedZoneIds } from "./services/apiClient.js";
import { speakQuechua, speakSpanish, stopSpeaking } from "./services/speechService.js";

export default function App() {
  const [mode, setMode] = useState("producer");
  const [zones, setZones] = useState([]);
  const [crops, setCrops] = useState([]);
  const [zoneId, setZoneId] = useState("punata_valle_alto");
  const [currentCropId, setCurrentCropId] = useState("maiz_valle");
  const [priorities, setPriorities] = useState(["water_conservation", "nitrogen_fixation", "erosion_control"]);
  const [irrigation, setIrrigation] = useState("deficit_auxiliary");
  const [equipment, setEquipment] = useState("manual_yunta");
  const [forceOffline, setForceOffline] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [recData, setRecData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [activeAudioKey, setActiveAudioKey] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    fetchZones(forceOffline).then((zs) => zs?.length && setZones(zs));
    fetchCrops(forceOffline).then((cs) => cs?.length && setCrops(cs));
  }, [forceOffline]);

  const loadRecs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRecommendations({ zone_id: zoneId, current_crop_id: currentCropId, farmer_priorities: priorities, constraints: { irrigation_access: irrigation, equipment_level: equipment, language_preference: "bilingual" } }, forceOffline);
      setRecData(data);
    } catch (err) {
      console.warn("Recs error:", err);
    } finally {
      setLoading(false);
    }
  }, [zoneId, currentCropId, priorities, irrigation, equipment, forceOffline]);

  useEffect(() => { loadRecs(); }, [loadRecs]);

  const handleDownloadBundle = async () => {
    setSyncStatus("⏳ Descargando y verificando SHA-256...");
    try {
      const res = await downloadZoneBundle(zoneId);
      setSyncStatus(`✅ Paquete ${zoneId.slice(0, 7)} verificado (${res.sizeKb} KB)`);
    } catch (err) {
      setSyncStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleSpeak = (text, lang, key) => {
    if (activeAudioKey === key) { stopSpeaking(); setActiveAudioKey(null); return; }
    setActiveAudioKey(key);
    const callbacks = { onEnd: () => setActiveAudioKey(null), onError: () => setActiveAudioKey(null) };
    if (lang === "qu") speakQuechua(text, callbacks);
    else speakSpanish(text, callbacks);
  };

  const currentZone = zones.find((z) => z.zone_id === zoneId) || zones[0];
  const cachedCount = listCachedZoneIds().length;

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-4 font-sans">
      <header className="bg-emerald-950 text-white p-4 rounded-3xl shadow flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <InstitutionalBrandBar variant="header" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Tarpuy NASA Cochabamba</h1>
            </div>
            <p className="text-xs text-emerald-300 font-medium">Rotación Agrícola Multimodal y Resiliente • NASA Space Apps 2026</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${!forceOffline && isOnline ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"}`}>
            <span className={`w-2 h-2 rounded-full ${!forceOffline && isOnline ? "bg-emerald-400" : "bg-amber-400"}`}></span>
            {!forceOffline && isOnline ? "Online" : "Offline (Campo)"}
          </span>
          <button type="button" onClick={() => setForceOffline((prev) => !prev)} className="px-3 py-1 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 rounded-lg border border-emerald-700 font-semibold">
            {forceOffline ? "🌐 Conectar Red" : "📴 Modo Campo (Sin Red)"}
          </button>
          <button type="button" onClick={handleDownloadBundle} className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold">
            📥 Descargar Paquete ({cachedCount} guardados)
          </button>
        </div>
      </header>

      {syncStatus && <div className="text-xs p-2 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl font-medium">{syncStatus}</div>}

      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Zona Piloto:</label>
            <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="p-2 border border-slate-300 rounded-lg font-semibold bg-slate-50 text-slate-800">
              {zones.map((z) => (<option key={z.zone_id} value={z.zone_id}>{z.name} ({z.elevation_msnm} m)</option>))}
            </select>
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Cultivo Precedente:</label>
            <select value={currentCropId} onChange={(e) => setCurrentCropId(e.target.value)} className="p-2 border border-slate-300 rounded-lg font-semibold bg-slate-50 text-slate-800">
              {crops.map((c) => (<option key={c.crop_id} value={c.crop_id}>{c.name_es} ({c.name_qu})</option>))}
            </select>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button type="button" onClick={() => setMode("producer")} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${mode === "producer" ? "bg-emerald-700 text-white shadow" : "text-slate-600 hover:text-slate-900"}`}>
            🌾 Modo Productor
          </button>
          <button type="button" onClick={() => setMode("technical")} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${mode === "technical" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:text-slate-900"}`}>
            🛰️ Jurado NASA / Técnico
          </button>
        </div>
      </div>

      <main>
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Cargando recomendaciones satelitales...</div>
        ) : mode === "producer" ? (
          <ProducerMode zone={currentZone} priorities={priorities} onTogglePriority={(id) => setPriorities((prev) => prev.includes(id) ? (prev.length > 1 ? prev.filter((p) => p !== id) : prev) : [...prev, id])} irrigation={irrigation} onChangeIrrigation={setIrrigation} equipment={equipment} onChangeEquipment={setEquipment} strategies={recData?.strategies || []} onSpeak={handleSpeak} activeAudioKey={activeAudioKey} />
        ) : (
          <TechnicalMode activeZoneId={zoneId} onSelectZone={setZoneId} zone={currentZone} strategies={recData?.strategies || []} provenance={recData?.data_provenance} />
        )}
      </main>

      <InstitutionalBrandBar variant="footer" />
    </div>
  );
}
