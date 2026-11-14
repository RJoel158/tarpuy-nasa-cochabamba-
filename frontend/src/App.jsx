import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowRight } from "lucide-react";
import Navbar from "./components/layout/Navbar.jsx";
import EarlyWarningBanner from "./components/alerts/EarlyWarningBanner.jsx";
import FarmerOverview from "./features/producer/FarmerOverview.jsx";
import ProducerMode from "./components/ProducerMode.jsx";
import TechnicalMode from "./components/TechnicalMode.jsx";
import CochabambaMap from "./components/maps/CochabambaMap.jsx";
import InstitutionalBrandBar from "./components/InstitutionalBrandBar.jsx";
import { FeedbackHost } from "./components/ui/FeedbackSystem.jsx";
import { ZONE_GEO_CATALOG, findNearestZone, districtToCommunity } from "./utils/geoUtils.js";
import { fetchDistrictAt, fetchGamcDistricts } from "./services/gamcClient.js";
import {
  fetchZones,
  fetchCrops,
  fetchRecommendations,
  fetchAlerts,
  autoSyncZoneSnapshot,
  listCachedZoneIds,
} from "./services/apiClient.js";
import { loadDeviceSnapshotSync, getDeviceDbStats } from "./services/embeddedDb.js";
import { speakQuechua, speakSpanish, stopSpeaking, speakStepByStepGuide } from "./services/speechService.js";
import { tr } from "./utils/quechuaI18n.js";

export default function App() {
  const initialSnapRef = useRef(loadDeviceSnapshotSync());
  const initialSnap = initialSnapRef.current;
  const [activeView, setActiveView] = useState("clima");
  const [appMode, setAppMode] = useState("facil");
  const isAdvanced = appMode === "avanzado";
  const [zones, setZones] = useState([]);
  const [crops, setCrops] = useState([]);
  const [zoneId, setZoneId] = useState(initialSnap?.zoneId || "punata_valle_alto");
  const [communityName, setCommunityName] = useState(initialSnap?.communityName || "Punata");
  const [cropId, setCropId] = useState(initialSnap?.cropId || "maiz_valle");
  const [priorities, setPriorities] = useState(["water_conservation", "nitrogen_fixation", "erosion_control"]);
  const [irrigation, setIrrigation] = useState(initialSnap?.irrigation || "deficit_auxiliary");
  const [equipment, setEquipment] = useState("manual_yunta");
  const [forceOffline, setForceOffline] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [recData, setRecData] = useState(null);
  const [alertBulletin, setAlertBulletin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dbStats, setDbStats] = useState(() => getDeviceDbStats());
  const [syncStatus, setSyncStatus] = useState(
    initialSnap?.sizeKb ? `Base local (${initialSnap.sizeKb} KB)` : "Sincronizando base local..."
  );
  const [voiceLang, setVoiceLang] = useState("es");
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

  useEffect(() => {
    let cancelled = false;
    if (!forceOffline && isOnline) {
      autoSyncZoneSnapshot(zoneId, { communityName, cropId, irrigation })
        .then((res) => {
          if (cancelled) return;
          setDbStats(getDeviceDbStats());
          setSyncStatus(`Autoguardado local (${res.sizeKb} KB · sobreescrito)`);
        })
        .catch(() => {
          if (cancelled) return;
          const stats = getDeviceDbStats();
          if (stats.sizeKb > 0) setSyncStatus(`Base local (${stats.sizeKb} KB)`);
        });
    } else {
      const stats = getDeviceDbStats();
      setDbStats(stats);
      setSyncStatus(stats.sizeKb > 0 ? `Leído de base local (${stats.sizeKb} KB)` : "Sin copia local aún");
    }
    return () => { cancelled = true; };
  }, [zoneId, communityName, cropId, irrigation, forceOffline, isOnline]);

  const currentZone = zones.find((z) => z.zone_id === zoneId) || zones[0];
  const cachedCount = listCachedZoneIds().length;

  const handleDownloadBundle = async () => {
    setSyncStatus("Actualizando base local...");
    setActiveProcess({ label: "Guardando copia única en el dispositivo...", pct: 45 });
    try {
      const res = await autoSyncZoneSnapshot(zoneId, { communityName, cropId, irrigation });
      setActiveProcess({ label: "Guardando copia única en el dispositivo...", pct: 100 });
      setTimeout(() => setActiveProcess(null), 220);
      setDbStats(getDeviceDbStats());
      setSyncStatus(`Autoguardado local (${res.sizeKb} KB · sobreescrito)`);
      pushToast("Base local actualizada", `${communityName || currentZone?.name || "Zona"} (${res.sizeKb} KB)`, "success");
    } catch {
      setActiveProcess(null);
      setSyncStatus("Usando copia anterior");
      pushToast("Sin señal", "Se mantiene la copia local anterior", "warning");
    }
  };

  const handleStopAudio = () => { stopSpeaking(); setIsSpeaking(false); setActiveAudioKey(null); };

  const handleSpeakGuide = () => {
    handleStopAudio();
    if (recData?.zone_id !== zoneId || recData?.current_crop_id !== cropId) {
      pushToast("Guía aún no disponible", "Espera a que se actualice la recomendación de tu cultivo y zona", "info");
      return;
    }
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
    handleStopAudio();
    setZoneId(newZoneId);
    setCropId(newZoneId === "tapacari_zona_andina" ? "papa_huaycha" : "maiz_valle");
  };

  const handleSelectZone = (newZoneId) => {
    applyZoneChange(newZoneId);
    const geo = ZONE_GEO_CATALOG.find((z) => z.id === newZoneId);
    if (geo?.name) setCommunityName(geo.name);
    if (calcTimerRef.current) clearTimeout(calcTimerRef.current);
    setIsCalculating(true);
    simulateProcess("Cargando clima y siembra...", 480, () => {
      pushToast(`Zona: ${geo?.name || newZoneId}`, geo?.sub || "Datos actualizados", "success");
    });
    calcTimerRef.current = setTimeout(() => setIsCalculating(false), 520);
  };

  const handleSelectCommunity = (comm) => {
    setCommunityName(comm.name);
    setUserPoint({ lat: comm.coords[0], lon: comm.coords[1], source: comm.name, bounds: comm.bounds });
    applyZoneChange(comm.zoneId);
    simulateProcess(`Ubicando comunidad: ${comm.name}...`, 460, () => {
      pushToast(`${comm.isDistrict ? "Distrito" : "Comunidad"}: ${comm.name}`, `${comm.region} · ${comm.alt}`, "success");
    });
  };

  // Municipal district (GAMC "Límite Distritos") that contains a point, or null.
  const findDistrictAt = async (lat, lon) => {
    if (forceOffline || !isOnline) return null;
    try {
      const hit = await fetchDistrictAt(lat, lon);
      if (!hit) return null;
      const catalog = await fetchGamcDistricts();
      return catalog.find((d) => d.code === hit.code) || null;
    } catch {
      return null;
    }
  };

  const handlePickMapPoint = async (lat, lon, source = "mapa") => {
    const district = await findDistrictAt(lat, lon);
    if (district) {
      const comm = districtToCommunity(district);
      const label = `${comm.name} · ${comm.comuna}`;
      setCommunityName(comm.name);
      setUserPoint({ lat, lon, source, district: label, bounds: source === "GPS" ? comm.bounds : undefined });
      applyZoneChange(comm.zoneId);
      simulateProcess(`Ubicando parcela (${source})...`, 500, () => {
        pushToast(label, `Detectado por ${source}`, "success");
      });
      return;
    }
    const nearest = findNearestZone(lat, lon);
    setCommunityName(nearest.zone.name);
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

  const handleChangeAppMode = (nextMode) => {
    if (nextMode === appMode) return;
    setAppMode(nextMode);
    if (nextMode === "facil" && activeView === "datos") setActiveView("clima");
    simulateProcess(
      nextMode === "facil" ? "Activando Modo Fácil..." : "Activando Modo Avanzado...",
      380,
      () => pushToast(
        nextMode === "facil" ? "Modo Fácil activo" : "Modo Avanzado activo",
        nextMode === "facil" ? "Vista simple con dibujos" : "Datos técnicos y satélite NASA",
        "info"
      )
    );
  };

  const handleChangeVoiceLang = (nextLang) => {
    if (nextLang === voiceLang) return;
    handleStopAudio();
    setVoiceLang(nextLang);
    pushToast(
      nextLang === "qu" ? "Simi: Qhichwa (Cochabamba)" : "Idioma: Castellano",
      nextLang === "qu" ? "Qillqakuna, uyarinapas qhichwapi" : "Textos y voz en castellano",
      "info"
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900 font-sans flex flex-col lg:flex-row">
      <Navbar
        activeView={activeView}
        onChangeView={setActiveView}
        appMode={appMode}
        onChangeAppMode={handleChangeAppMode}
        zoneId={zoneId}
        onSelectZone={handleSelectZone}
        selectedCommunityName={communityName}
        onSelectCommunity={handleSelectCommunity}
        onDetectGps={handleDetectGps}
        voiceLang={voiceLang}
        onChangeVoiceLang={handleChangeVoiceLang}
        isSpeaking={isSpeaking}
        onSpeakGuide={handleSpeakGuide}
        onStopAudio={handleStopAudio}
        isOnline={isOnline}
        forceOffline={forceOffline}
        onToggleOffline={handleToggleOffline}
        onDownloadBundle={handleDownloadBundle}
        cachedCount={cachedCount}
        dbStats={dbStats}
        syncStatus={syncStatus}
      />

      <div className="flex-1 min-w-0 flex flex-col justify-between pb-28 lg:pb-8">
        <main data-producer-mode={!isAdvanced} className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          {!isAdvanced && activeView === "clima" && <FarmerOverview
            community={communityName} zone={currentZone}
            crop={crops.find((crop) => crop.crop_id === cropId)} cropId={cropId}
            lang={voiceLang} offline={forceOffline || !isOnline} saved={dbStats}
            onPlant={() => setActiveView("siembra")} onMap={() => setActiveView("mapa")}
            speaking={isSpeaking} onSave={handleDownloadBundle} onListen={isSpeaking ? handleStopAudio : handleSpeakGuide}
          />}
          {loading && !recData ? (
            <p className="py-12 text-center text-stone-500 text-sm">Cargando datos...</p>
          ) : activeView === "clima" ? (
            <div className="space-y-6">
              <EarlyWarningBanner
                bulletin={alertBulletin?.zone_id === zoneId ? alertBulletin : null}
                zoneName={communityName || currentZone?.name}
                onSpeak={handleSpeak}
                activeAudioKey={activeAudioKey}
                voiceLang={voiceLang}
                isAdvanced={isAdvanced}
                onOpenMap={() => setActiveView("mapa")}
                onDetectGps={handleDetectGps}
              />
              <div className="flex justify-end">
                <button type="button" onClick={() => setActiveView("siembra")} className="w-full sm:w-auto min-h-16 inline-flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-bold cursor-pointer">
                  <span>{tr(voiceLang, "seeWhatToPlantIn")} {communityName || currentZone?.name || ""}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : activeView === "siembra" ? (
            <ProducerMode key={zoneId}
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
              strategies={recData?.zone_id === zoneId && recData?.current_crop_id === cropId ? recData.strategies || [] : []}
              onSpeak={handleSpeak}
              activeAudioKey={activeAudioKey}
              isCalculating={isCalculating}
              isAdvanced={isAdvanced}
              lang={voiceLang}
              onDetectGps={handleDetectGps}
              onOpenMap={() => setActiveView("mapa")}
            />
          ) : activeView === "mapa" ? (
            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0284C7]">{tr(voiceLang, "mapSubtitle")}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">{tr(voiceLang, "mapTitle")} · {communityName || currentZone?.name || ""}</h2>
              </div>
              <CochabambaMap
                zones={zones}
                activeZoneId={zoneId}
                onSelectZone={handleSelectZone}
                selectedCommunityName={communityName}
                onSelectCommunity={handleSelectCommunity}
                userPoint={userPoint}
                onPickMapPoint={handlePickMapPoint}
                onDetectGps={handleDetectGps}
                forceOffline={forceOffline}
                isOnline={isOnline}
                tall={true}
                isAdvanced={isAdvanced}
              />
              {isAdvanced && currentZone?.soil_context ? (
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
