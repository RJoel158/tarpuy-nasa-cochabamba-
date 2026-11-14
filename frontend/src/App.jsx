import React, { useState, useEffect, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import Navbar from "./components/layout/Navbar.jsx";
import EarlyWarningBanner from "./components/alerts/EarlyWarningBanner.jsx";
import ProducerMode from "./components/ProducerMode.jsx";
import TechnicalMode from "./components/TechnicalMode.jsx";
import CochabambaMap from "./components/maps/CochabambaMap.jsx";
import InstitutionalBrandBar from "./components/InstitutionalBrandBar.jsx";
import { fetchZones, fetchCrops, fetchRecommendations, fetchAlerts, downloadZoneBundle, listCachedZoneIds } from "./services/apiClient.js";
import { speakQuechua, speakSpanish, stopSpeaking, speakStepByStepGuide } from "./services/speechService.js";

export default function App() {
  const [activeView, setActiveView] = useState("clima");
  const [zones, setZones] = useState([]);
  const [crops, setCrops] = useState([]);
  const [zoneId, setZoneId] = useState("punata_valle_alto");
  const [cropId, setCropId] = useState("maiz_valle");
  const [priorities, setPriorities] = useState(["water_conservation", "nitrogen_fixation", "erosion_control"]);
  const [irrigation, setIrrigation] = useState("deficit_auxiliary");
  const [equipment, setEquipment] = useState("manual_yunta");
  const [forceOffline, setForceOffline] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [recData, setRecData] = useState(null);
  const [alertBulletin, setAlertBulletin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [voiceLang, setVoiceLang] = useState("qu");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeAudioKey, setActiveAudioKey] = useState(null);

  useEffect(() => {
    const onOn = () => setIsOnline(true);
    const onOff = () => setIsOnline(false);
    window.addEventListener("online", onOn);
    window.addEventListener("offline", onOff);
    return () => { window.removeEventListener("online", onOn); window.removeEventListener("offline", onOff); };
  }, []);

  useEffect(() => {
    fetchZones(forceOffline).then((zs) => zs?.length && setZones(zs));
    fetchCrops(forceOffline).then((cs) => cs?.length && setCrops(cs));
  }, [forceOffline]);

  useEffect(() => {
    fetchAlerts(zoneId, forceOffline).then((b) => b && setAlertBulletin(b));
  }, [zoneId, forceOffline]);

  const loadRecs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRecommendations(
        { zone_id: zoneId, current_crop_id: cropId, farmer_priorities: priorities, constraints: { irrigation_access: irrigation, equipment_level: equipment, language_preference: "bilingual" } },
        forceOffline
      );
      setRecData(data);
      if (data?.realtime_bulletin) setAlertBulletin(data.realtime_bulletin);
    } catch {} finally { setLoading(false); }
  }, [zoneId, cropId, priorities, irrigation, equipment, forceOffline]);

  useEffect(() => { loadRecs(); }, [loadRecs]);

  const currentZone = zones.find((z) => z.zone_id === zoneId) || zones[0];
  const cachedCount = listCachedZoneIds().length;

  const handleDownloadBundle = async () => {
    setSyncStatus("Guardando...");
    try {
      const res = await downloadZoneBundle(zoneId);
      setSyncStatus(`Listo offline (${res.sizeKb} KB)`);
    } catch { setSyncStatus("Error al guardar"); }
  };

  const handleStopAudio = () => { stopSpeaking(); setIsSpeaking(false); setActiveAudioKey(null); };

  const handleSpeakGuide = () => {
    handleStopAudio();
    setIsSpeaking(true);
    speakStepByStepGuide(currentZone, recData?.strategies || [], voiceLang, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleSpeak = (text, lang, key, clipKey = null) => {
    if (activeAudioKey === key) { handleStopAudio(); return; }
    handleStopAudio();
    setActiveAudioKey(key);
    setIsSpeaking(true);
    const cb = { clipKey, onEnd: () => { setActiveAudioKey(null); setIsSpeaking(false); }, onError: () => { setActiveAudioKey(null); setIsSpeaking(false); } };
    if (lang === "qu") speakQuechua(text, cb);
    else speakSpanish(text, cb);
  };

  const handleSelectZone = (newZoneId) => {
    setZoneId(newZoneId);
    setCropId(newZoneId === "tapacari_zona_andina" ? "papa_huaycha" : "maiz_valle");
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900 font-sans flex flex-col lg:flex-row">
      <Navbar
        activeView={activeView}
        onChangeView={setActiveView}
        zoneId={zoneId}
        onSelectZone={handleSelectZone}
        voiceLang={voiceLang}
        onChangeVoiceLang={setVoiceLang}
        isSpeaking={isSpeaking}
        onSpeakGuide={handleSpeakGuide}
        onStopAudio={handleStopAudio}
        isOnline={isOnline}
        forceOffline={forceOffline}
        onToggleOffline={() => setForceOffline((p) => !p)}
        onDownloadBundle={handleDownloadBundle}
        cachedCount={cachedCount}
        syncStatus={syncStatus}
      />

      <div className="flex-1 min-w-0 flex flex-col justify-between pb-20 lg:pb-8">
        <main className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          {loading && !recData ? (
            <p className="py-12 text-center text-stone-500 text-sm">Cargando datos...</p>
          ) : activeView === "clima" ? (
            <div className="space-y-6">
              <EarlyWarningBanner bulletin={alertBulletin} zoneName={currentZone?.name} onSpeak={handleSpeak} activeAudioKey={activeAudioKey} voiceLang={voiceLang} />
              <div className="flex justify-end">
                <button type="button" onClick={() => setActiveView("siembra")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-bold cursor-pointer">
                  <span>Ver qué sembrar en {currentZone?.name || "tu zona"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : activeView === "siembra" ? (
            <ProducerMode
              zone={currentZone}
              activeZoneId={zoneId}
              crops={crops}
              cropId={cropId}
              onChangeCrop={setCropId}
              priorities={priorities}
              onChangePriorities={setPriorities}
              irrigation={irrigation}
              onChangeIrrigation={setIrrigation}
              equipment={equipment}
              onChangeEquipment={setEquipment}
              strategies={recData?.strategies || []}
              onSpeak={handleSpeak}
              activeAudioKey={activeAudioKey}
            />
          ) : activeView === "mapa" ? (
            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0284C7]">Ubicación y suelo</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Mapa de comunidades · {currentZone?.name || ""}</h2>
              </div>
              <CochabambaMap zones={zones} activeZoneId={zoneId} onSelectZone={handleSelectZone} forceOffline={forceOffline} isOnline={isOnline} tall={true} />
              {currentZone?.soil_context ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 bg-white border border-stone-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-stone-200 text-sm">
                  <div className="p-4"><span className="text-xs text-stone-500 block">Altura</span><strong className="text-stone-900">{currentZone.elevation_msnm} metros</strong></div>
                  <div className="p-4"><span className="text-xs text-stone-500 block">Terreno</span><strong className="text-stone-900">{currentZone.slope_category}</strong></div>
                  <div className="p-4"><span className="text-xs text-stone-500 block">Suelo</span><strong className="text-stone-900">{currentZone.soil_context.texture_class}</strong></div>
                </div>
              ) : null}
            </div>
          ) : (
            <TechnicalMode zone={currentZone} strategies={recData?.strategies || []} provenance={recData?.data_provenance} bulletin={alertBulletin} />
          )}
        </main>

        <footer className="max-w-5xl mx-auto w-full px-4 sm:px-8 pt-4">
          <InstitutionalBrandBar variant="footer" />
        </footer>
      </div>
    </div>
  );
}
