import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowRight } from "lucide-react";
import Navbar from "./components/layout/Navbar.jsx";
import EarlyWarningBanner from "./components/alerts/EarlyWarningBanner.jsx";
import ProducerMode from "./components/ProducerMode.jsx";
import TechnicalMode from "./components/TechnicalMode.jsx";
import CochabambaMap from "./components/maps/CochabambaMap.jsx";
import InstitutionalBrandBar from "./components/InstitutionalBrandBar.jsx";
import { FeedbackHost } from "./components/ui/FeedbackSystem.jsx";
import { ZONE_GEO_CATALOG, findNearestZone } from "./utils/geoUtils.js";
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
  const [userPoint, setUserPoint] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [activeProcess, setActiveProcess] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const processTimersRef = useRef([]);
  const calcTimerRef = useRef(null);

  const pushToast = useCallback((title, detail = "", type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-2), { id, title, detail, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const simulateProcess = useCallback((label, durationMs = 500, onDone) => {
    processTimersRef.current.forEach((t) => clearTimeout(t));
    processTimersRef.current = [];
    setActiveProcess({ label, pct: 25 });
    const t1 = setTimeout(() => setActiveProcess({ label, pct: 75 }), Math.round(durationMs * 0.45));
    const t2 = setTimeout(() => setActiveProcess({ label, pct: 100 }), durationMs);
    const t3 = setTimeout(() => {
      setActiveProcess(null);
      if (onDone) onDone();
    }, durationMs + 180);
    processTimersRef.current = [t1, t2, t3];
  }, []);

  const triggerAgronomicCalc = useCallback((label, detail) => {
    if (calcTimerRef.current) clearTimeout(calcTimerRef.current);
    setIsCalculating(true);
    simulateProcess(label, 500, () => {
      pushToast("Cálculo actualizado", detail, "success");
    });
    calcTimerRef.current = setTimeout(() => setIsCalculating(false), 550);
  }, [simulateProcess, pushToast]);

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
    setActiveProcess({ label: "Guardando datos sin internet...", pct: 45 });
    try {
      const res = await downloadZoneBundle(zoneId);
      setActiveProcess({ label: "Guardando datos sin internet...", pct: 100 });
      setTimeout(() => setActiveProcess(null), 220);
      setSyncStatus(`Listo offline (${res.sizeKb} KB)`);
      pushToast("Cartilla guardada", `${currentZone?.name || "Zona"} (${res.sizeKb} KB)`, "success");
    } catch {
      setActiveProcess(null);
      setSyncStatus("Error al guardar");
      pushToast("Error al guardar", "No se pudo descargar sin señal", "warning");
    }
  };

  const handleStopAudio = () => { stopSpeaking(); setIsSpeaking(false); setActiveAudioKey(null); };

  const handleSpeakGuide = () => {
    handleStopAudio();
    setIsSpeaking(true);
    pushToast(`Voz (${voiceLang === "qu" ? "Quechua" : "Español"})`, "Reproduciendo guía de siembra", "info");
    speakStepByStepGuide(currentZone, recData?.strategies || [], voiceLang, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        pushToast("Audio no disponible", "Revisa el volumen o conexión", "warning");
      },
    });
  };

  const handleSpeak = (text, lang, key, clipKey = null) => {
    if (activeAudioKey === key) {
      handleStopAudio();
      pushToast("Audio detenido", "", "info");
      return;
    }
    handleStopAudio();
    setActiveAudioKey(key);
    setIsSpeaking(true);
    pushToast(`Voz (${lang === "qu" ? "Quechua" : "Español"})`, "Reproduciendo aviso", "info");
    const cb = {
      clipKey,
      onEnd: () => { setActiveAudioKey(null); setIsSpeaking(false); },
      onError: () => {
        setActiveAudioKey(null);
        setIsSpeaking(false);
        pushToast("Audio no disponible", "Intenta de nuevo", "warning");
      },
    };
    if (lang === "qu") speakQuechua(text, cb);
    else speakSpanish(text, cb);
  };

  const applyZoneChange = (newZoneId) => {
    setZoneId(newZoneId);
    setCropId(newZoneId === "tapacari_zona_andina" ? "papa_huaycha" : "maiz_valle");
  };

  const handleSelectZone = (newZoneId) => {
    applyZoneChange(newZoneId);
    const geo = ZONE_GEO_CATALOG.find((z) => z.id === newZoneId);
    if (calcTimerRef.current) clearTimeout(calcTimerRef.current);
    setIsCalculating(true);
    simulateProcess("Cargando clima y siembra...", 480, () => {
      pushToast(`Zona: ${geo?.name || newZoneId}`, geo?.sub || "Datos actualizados", "success");
    });
    calcTimerRef.current = setTimeout(() => setIsCalculating(false), 520);
  };

  const handlePickMapPoint = (lat, lon, source = "mapa") => {
    const nearest = findNearestZone(lat, lon);
    setUserPoint({ lat, lon, source });
    applyZoneChange(nearest.zone.id);
    simulateProcess(`Ubicando parcela (${source})...`, 500, () => {
      pushToast(`Zona: ${nearest.zone.name}`, `A ${nearest.distanceKm} km (${source})`, "success");
    });
  };

  const handleDetectGps = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setActiveView("mapa");
      pushToast("Elige en el mapa", "Toca tu comunidad para ubicarte", "warning");
      return;
    }
    setActiveProcess({ label: "Buscando tu GPS...", pct: 35 });
    navigator.geolocation.getCurrentPosition(
      (pos) => handlePickMapPoint(pos.coords.latitude, pos.coords.longitude, "GPS"),
      () => {
        setActiveProcess(null);
        setActiveView("mapa");
        pushToast("GPS no disponible", "Toca tu comunidad en el mapa", "warning");
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
    );
  };

  const handleChangeCrop = (id) => {
    setCropId(id);
    const crop = crops.find((c) => c.crop_id === id);
    triggerAgronomicCalc("Calculando mejor siembra...", crop?.common_name_es || "Cultivo actualizado");
  };

  const handleChangePriorities = (next) => {
    setPriorities(next);
    triggerAgronomicCalc("Recalculando prioridad...", "Prioridades actualizadas");
  };

  const handleChangeIrrigation = (val) => {
    setIrrigation(val);
    triggerAgronomicCalc("Ajustando riego...", "Disponibilidad de agua actualizada");
  };

  const handleChangeEquipment = (val) => {
    setEquipment(val);
    triggerAgronomicCalc("Ajustando herramientas...", "Preparación de suelo actualizada");
  };

  const handleToggleOffline = () => {
    const next = !forceOffline;
    setForceOffline(next);
    simulateProcess(next ? "Activando modo sin internet..." : "Reconectando...", 360, () => {
      pushToast(next ? "Modo sin señal" : "Modo en línea", next ? "Usando datos guardados" : "Conectado al servicio", "info");
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900 font-sans flex flex-col lg:flex-row">
      <Navbar
        activeView={activeView}
        onChangeView={setActiveView}
        zoneId={zoneId}
        onSelectZone={handleSelectZone}
        onDetectGps={handleDetectGps}
        voiceLang={voiceLang}
        onChangeVoiceLang={setVoiceLang}
        isSpeaking={isSpeaking}
        onSpeakGuide={handleSpeakGuide}
        onStopAudio={handleStopAudio}
        isOnline={isOnline}
        forceOffline={forceOffline}
        onToggleOffline={handleToggleOffline}
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
              <EarlyWarningBanner
                bulletin={alertBulletin}
                zoneName={currentZone?.name}
                onSpeak={handleSpeak}
                activeAudioKey={activeAudioKey}
                voiceLang={voiceLang}
                onOpenMap={() => setActiveView("mapa")}
                onDetectGps={handleDetectGps}
              />
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
              onChangeCrop={handleChangeCrop}
              priorities={priorities}
              onChangePriorities={handleChangePriorities}
              irrigation={irrigation}
              onChangeIrrigation={handleChangeIrrigation}
              equipment={equipment}
              onChangeEquipment={handleChangeEquipment}
              strategies={recData?.strategies || []}
              onSpeak={handleSpeak}
              activeAudioKey={activeAudioKey}
              isCalculating={isCalculating}
              onDetectGps={handleDetectGps}
              onOpenMap={() => setActiveView("mapa")}
            />
          ) : activeView === "mapa" ? (
            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0284C7]">Ubicación y suelo</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Mapa de comunidades · {currentZone?.name || ""}</h2>
              </div>
              <CochabambaMap
                zones={zones}
                activeZoneId={zoneId}
                onSelectZone={handleSelectZone}
                userPoint={userPoint}
                onPickMapPoint={handlePickMapPoint}
                onDetectGps={handleDetectGps}
                forceOffline={forceOffline}
                isOnline={isOnline}
                tall={true}
              />
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
      <FeedbackHost
        activeProcess={activeProcess}
        toasts={toasts}
        onDismissToast={(id) => setToasts((p) => p.filter((x) => x.id !== id))}
      />
    </div>
  );
}
