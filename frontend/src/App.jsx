import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/layout/Navbar.jsx";
import VoiceAssistantDock from "./components/audio/VoiceAssistantDock.jsx";
import ProducerMode from "./components/ProducerMode.jsx";
import TechnicalMode from "./components/TechnicalMode.jsx";
import InstitutionalBrandBar from "./components/InstitutionalBrandBar.jsx";
import { fetchZones, fetchCrops, fetchRecommendations, fetchAlerts, downloadZoneBundle, listCachedZoneIds } from "./services/apiClient.js";
import { speakQuechua, speakSpanish, stopSpeaking, speakStepByStepGuide } from "./services/speechService.js";

export default function App() {
  const [mode, setMode] = useState("producer");
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
  const [voiceEngine, setVoiceEngine] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [activeAudioKey, setActiveAudioKey] = useState(null);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
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
    } catch (err) { console.warn("Recs load error:", err); } finally { setLoading(false); }
  }, [zoneId, cropId, priorities, irrigation, equipment, forceOffline]);

  useEffect(() => { loadRecs(); }, [loadRecs]);

  const currentZone = zones.find((z) => z.zone_id === zoneId) || zones[0];
  const cachedCount = listCachedZoneIds().length;

  const handleDownloadBundle = async () => {
    setSyncStatus("⏳ Descargando y verificando integridad SHA-256...");
    try {
      const res = await downloadZoneBundle(zoneId);
      const zoneName = currentZone?.name || zoneId;
      setSyncStatus(`✅ Paquete ${zoneName} verificado (${res.sizeKb} KB)`);
    } catch (err) { setSyncStatus(`❌ Error en descarga: ${err.message}`); }
  };

  const handleStopAudio = () => { stopSpeaking(); setIsSpeaking(false); setSubtitle(""); setActiveAudioKey(null); };

  const handleSpeakGuide = () => {
    handleStopAudio();
    setIsSpeaking(true);
    speakStepByStepGuide(currentZone, recData?.strategies || [], voiceLang, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => { setIsSpeaking(false); setSubtitle(""); },
      onError: () => { setIsSpeaking(false); setSubtitle(""); },
      onSubtitle: (text) => setSubtitle(text),
      onEngine: (eng) => setVoiceEngine(eng),
    });
  };

  const handleSpeak = (text, lang, key, clipKey = null) => {
    if (activeAudioKey === key) { handleStopAudio(); return; }
    handleStopAudio();
    setActiveAudioKey(key);
    setIsSpeaking(true);
    setSubtitle(text);
    const cb = {
      clipKey,
      onEnd: () => { setActiveAudioKey(null); setIsSpeaking(false); setSubtitle(""); },
      onError: () => { setActiveAudioKey(null); setIsSpeaking(false); setSubtitle(""); },
      onEngine: (eng) => setVoiceEngine(eng),
    };
    if (lang === "qu") speakQuechua(text, cb);
    else speakSpanish(text, cb);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans pb-12 flex flex-col justify-between">
      <div className="space-y-4">
        <Navbar mode={mode} onChangeMode={setMode} isOnline={isOnline} forceOffline={forceOffline} onToggleOffline={() => setForceOffline((p) => !p)} onDownloadBundle={handleDownloadBundle} cachedCount={cachedCount} syncStatus={syncStatus} />
        <main className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4">
          <VoiceAssistantDock voiceLang={voiceLang} onChangeVoiceLang={setVoiceLang} isSpeaking={isSpeaking} subtitle={subtitle} voiceEngine={voiceEngine} onSpeakGuide={handleSpeakGuide} onStop={handleStopAudio} />
          <section className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <label htmlFor="zone-select" className="font-bold text-stone-700 block mb-1">Elige tu Municipio o Comunidad:</label>
                <select id="zone-select" value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="p-2 border border-stone-300 rounded-xl font-semibold bg-stone-50 text-stone-800">
                  {zones.map((z) => (<option key={z.zone_id} value={z.zone_id}>{z.name} ({z.elevation_msnm} msnm)</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="crop-select" className="font-bold text-stone-700 block mb-1">¿Qué sembraste la última vez en tu chacra?</label>
                <select id="crop-select" value={cropId} onChange={(e) => setCropId(e.target.value)} className="p-2 border border-stone-300 rounded-xl font-semibold bg-stone-50 text-stone-800">
                  {crops.map((c) => (<option key={c.crop_id} value={c.crop_id}>{c.name_es} ({c.name_qu})</option>))}
                </select>
              </div>
            </div>
          </section>
          {loading ? (
            <div className="p-12 text-center text-stone-500 font-medium">Buscando el clima de hoy y mejores siembras para tu tierra...</div>
          ) : mode === "producer" ? (
            <ProducerMode zones={zones} zone={currentZone} activeZoneId={zoneId} onSelectZone={setZoneId} forceOffline={forceOffline} isOnline={isOnline} priorities={priorities} onTogglePriority={(id) => setPriorities((prev) => prev.includes(id) ? (prev.length > 1 ? prev.filter((p) => p !== id) : prev) : [...prev, id])} irrigation={irrigation} onChangeIrrigation={setIrrigation} equipment={equipment} onChangeEquipment={setEquipment} strategies={recData?.strategies || []} bulletin={alertBulletin} voiceLang={voiceLang} onSpeak={handleSpeak} activeAudioKey={activeAudioKey} />
          ) : (
            <TechnicalMode zones={zones} activeZoneId={zoneId} onSelectZone={setZoneId} zone={currentZone} strategies={recData?.strategies || []} provenance={recData?.data_provenance} bulletin={alertBulletin} forceOffline={forceOffline} isOnline={isOnline} />
          )}
        </main>
      </div>
      <footer className="mt-8"><InstitutionalBrandBar variant="footer" /></footer>
    </div>
  );
}
