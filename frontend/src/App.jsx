import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowRight, LocateFixed } from "lucide-react";
import { locateDevice } from "./services/locationService.js";
import Navbar from "./components/layout/Navbar.jsx";
const LizComparison = React.lazy(() => import("./components/LizComparison.jsx"));
import { IlustracionTarpuy } from "./components/illustrations/TarpuyIllustrations.jsx";
import EarlyWarningBanner from "./components/alerts/EarlyWarningBanner.jsx";
import ProducerMode from "./components/ProducerMode.jsx";
import TechnicalMode from "./components/TechnicalMode.jsx";
import CochabambaMap from "./components/maps/CochabambaMap.jsx";
import InstitutionalBrandBar from "./components/InstitutionalBrandBar.jsx";
import { FeedbackHost, AlertsModal } from "./components/ui/FeedbackSystem.jsx";
import { ZONE_GEO_CATALOG, findNearestZone } from "./utils/geoUtils.js";
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
  const [activeView, setActiveView] = useState("mapa");
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
  const [audioLoading, setAudioLoading] = useState(false);
  const [gpsNotice, setGpsNotice] = useState(null);
  const gpsAttemptRef = useRef(0);
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

  const handleStopAudio = () => { stopSpeaking(); setAudioLoading(false); setIsSpeaking(false); setActiveAudioKey(null); };

  const handleSpeakGuide = () => {
    handleStopAudio();
    if (recData?.zone_id !== zoneId || recData?.current_crop_id !== cropId) {
      pushToast("Guía aún no disponible", "Espera a que se actualice la recomendación de tu cultivo y zona", "info");
      return;
    }
    setIsSpeaking(true);
    speakStepByStepGuide(currentZone, recData?.strategies || [], voiceLang, {
      onLoading: setAudioLoading,
      onStart: () => { setIsSpeaking(true); },
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
    const cb = {
      onLoading: setAudioLoading,
      clipKey,
      onEngine: (engine) => {
        if (engine === "browser_fallback") pushToast("Voz básica del equipo", "La voz natural no está disponible en este momento", "info");
      },
      onEnd: () => { setActiveAudioKey(null); setIsSpeaking(false); },
      onError: () => {
        setActiveAudioKey(null);
        setIsSpeaking(false);
        pushToast("Audio no disponible", lang === "qu" ? "No se pudo cargar una voz quechua. Revisa la conexión con el backend." : "Revisa la conexión con el backend.", "warning");
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
    gpsAttemptRef.current += 1;
    setGpsNotice(null);
    setCommunityName(comm.name);
    setUserPoint({ lat: comm.coords[0], lon: comm.coords[1], source: comm.name });
    applyZoneChange(comm.zoneId);
  };

  const handlePickMapPoint = (lat, lon, source = "mapa", accuracy = null) => {
    gpsAttemptRef.current += 1;
    setGpsNotice(null);
    const nearest = findNearestZone(lat, lon);
    setCommunityName(source.startsWith("Distrito ") ? source.replace(" · centro aproximado", "") : "Punto seleccionado");
    setUserPoint({ lat, lon, source, accuracy });
    applyZoneChange(nearest.zone.id);
    setActiveProcess(null);
  };

  const handleDetectGps = () => {
    const attempt = ++gpsAttemptRef.current;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setActiveView("mapa");
      setGpsNotice({ title: "GPS no disponible", detail: "Puedes tocar tu parcela en el mapa o elegir tu distrito.", loading: false });
      return;
    }
    setGpsNotice({ title: "Buscando tu ubicación", detail: "Permite el acceso a tu ubicación si el navegador te lo pide.", loading: true });
    locateDevice(navigator.geolocation, {
      isCurrent:()=>attempt === gpsAttemptRef.current,
      onRetry:(accuracy)=>setGpsNotice({title:accuracy ? "Mejorando la precisión" : "Reintentando ubicación",detail:accuracy ? `La primera lectura tiene un margen de ±${Math.round(accuracy)} metros. Buscando una mejor.` : "El dispositivo no respondió. Intentando de nuevo sin usar una ubicación antigua.",loading:true}),
    }).then((pos)=>{
      if (!pos || attempt !== gpsAttemptRef.current) return;
      setActiveView("mapa");
      handlePickMapPoint(pos.coords.latitude,pos.coords.longitude,"GPS",pos.coords.accuracy);
      if(pos.coords.accuracy > 200) setGpsNotice({title:"Ubicación aproximada",detail:`El dispositivo informa ±${Math.round(pos.coords.accuracy)} metros de precisión. El círculo azul muestra ese margen. Toca el mapa para marcar tu parcela con más precisión.`,loading:false});
    }).catch((error)=>{
      if(attempt !== gpsAttemptRef.current) return;
      setActiveView("mapa");
      setGpsNotice({title:error.code===1 ? "Activa el permiso de ubicación" : "No pudimos ubicarte",detail:error.code===1 ? "Permite la ubicación en tu navegador o elige tu distrito en el mapa." : "No obtuvimos una ubicación válida. Intenta otra vez o toca tu parcela en el mapa.",loading:false,retry:error.code!==1});
    });
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
    <div className={`tarpuy-shell ${activeView === "mapa" && !isAdvanced ? "flow-map-stage" : ""} min-h-screen bg-[var(--papel)] text-slate-900 flex flex-col lg:flex-row`}>
      {locationConfirmed && (activeView !== "mapa" || isAdvanced) && <Navbar
        compact={!isAdvanced}
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
      />}

      <div className="flex-1 min-w-0 flex flex-col justify-between pb-28 lg:pb-8">
        <main data-producer-mode={!isAdvanced} className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          {!isAdvanced && activeView !== "mapa" && <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-3"><strong className="text-lg">Tarpuy</strong><div className="flex gap-3"><button className="flow-link" onClick={()=>handleChangeVoiceLang(voiceLang === "qu" ? "es" : "qu")}>{voiceLang === "qu" ? "Qhichwa" : "Castellano"}</button>{activeView !== "clima" && <button className="flow-link" onClick={()=>setNotificationsOpen(true)}>Avisos ({alertBulletin?.active_alerts?.length || 0})</button>}</div></div>}
          {loading && !recData ? (
            <p className="py-12 text-center text-stone-500 text-sm">Cargando datos...</p>
          ) : !isAdvanced && ["clima","siembra"].includes(activeView) ? (
            <React.Suspense fallback={<p role="status">Cargando la propuesta de Liz…</p>}>
              <LizComparison screen={activeView}
                weatherProps={{bulletin:alertBulletin?.zone_id === zoneId ? alertBulletin : null,zoneName:communityName,onSpeak:handleSpeak,activeAudioKey,voiceLang,isAdvanced:false,onOpenMap:()=>setActiveView("mapa"),onDetectGps:handleDetectGps}}
                sowingProps={{zone:currentZone,activeZoneId:zoneId,crops,cropId,onChangeCrop:handleChangeCrop,priorities,onChangePriorities:handleChangePriorities,irrigation,onChangeIrrigation:handleChangeIrrigation,equipment,onChangeEquipment:handleChangeEquipment,strategies:recData?.zone_id === zoneId && recData?.current_crop_id === cropId ? recData.strategies || [] : [],onSpeak:handleSpeak,activeAudioKey,isCalculating:isCalculating || loading,isAdvanced:false,lang:voiceLang,onDetectGps:handleDetectGps,onOpenMap:()=>setActiveView("mapa")}}/>
            </React.Suspense>
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
                <button type="button" onClick={() => setActiveView("siembra")} className="w-full sm:w-auto min-h-16 inline-flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-[var(--cielo-oscuro)] hover:bg-[var(--cielo-presionado)] text-white text-sm font-bold cursor-pointer">
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
            <div className="space-y-4">
              {!isAdvanced && <header className="flow-map-search flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0"><IlustracionTarpuy id="mano_siembra" size={36}/><div><h1 className="font-extrabold text-2xl leading-none">Tarpuy</h1><p className="text-xs text-slate-600 mt-1">Tu chacra empieza aquí</p></div></div>
                <button type="button" onClick={handleDetectGps} className="min-h-12 px-3 rounded-2xl bg-[var(--hoja-oscura)] text-white font-bold inline-flex items-center gap-2 shrink-0"><LocateFixed className="w-5 h-5" aria-hidden="true"/>Ubícame</button>
              </header>}
              {isAdvanced &&
              <div className="border-b border-stone-200 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cielo-oscuro)]">{tr(voiceLang, "mapSubtitle")}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">{tr(voiceLang, "mapTitle")} · {communityName || currentZone?.name || ""}</h2>
              </div>}
              <CochabambaMap
                guided={!isAdvanced}
                onDistrictResolved={(district)=>setCommunityName(district ? `Distrito ${district.code.replace(/^D/, "")} · ${district.comuna}` : "Punto seleccionado")}
                onContinue={()=>{processTimersRef.current.forEach(clearTimeout);setActiveProcess(null);setToasts([]);setLocationConfirmed(true);setActiveView("clima");}}
                onChooseDistrict={(district)=>handlePickMapPoint(district.center.lat,district.center.lon,`${district.name} · centro aproximado`)}
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

        <footer className={`${!isAdvanced ? "hidden" : ""} max-w-5xl mx-auto w-full px-4 sm:px-8 pt-4`}>
          <InstitutionalBrandBar variant="footer" />
        </footer>
      </div>
      {audioLoading && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 rounded-xl bg-[var(--tinta)] text-white p-4 shadow-lg flex items-center gap-3">
          <span aria-hidden="true" className="h-5 w-5 shrink-0 rounded-full border-2 border-white/30 border-t-white animate-spin motion-reduce:animate-none" />
          <div role="status" aria-live="polite" className="flex-1 text-sm">
            <p className="font-bold">Preparando audio completo…</p>
            <p className="text-xs text-slate-200">Se reproducirá cuando esté listo. Puede tardar según la conexión.</p>
          </div>
          <button type="button" onClick={handleStopAudio} className="min-h-11 px-3 rounded-lg border border-white/40 text-sm">Cancelar</button>
        </div>
      )}
      {gpsNotice && <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-[var(--tinta)]/25">
        <section role="status" aria-live="polite" className="w-full max-w-md rounded-3xl border-2 border-[var(--tinta)] bg-[var(--tarjeta)] p-6 sm:p-8 shadow-xl text-center space-y-4">
          <LocateFixed className={`w-12 h-12 mx-auto text-[var(--hoja-oscura)] ${gpsNotice.loading ? "animate-pulse motion-reduce:animate-none" : ""}`} aria-hidden="true" />
          <h2 className="text-2xl font-extrabold">{gpsNotice.title}</h2>
          <p className="text-lg text-slate-600">{gpsNotice.detail}</p>
          <>{gpsNotice.retry && <button type="button" className="flow-primary w-full" onClick={handleDetectGps}>Reintentar</button>}<button type="button" className="flow-secondary w-full" onClick={()=>{gpsAttemptRef.current+=1;setGpsNotice(null);}}>{gpsNotice.loading ? "Cancelar" : "Ver en el mapa"}</button></>
        </section>
      </div>}
      {!audioLoading && !gpsNotice && <FeedbackHost
        activeProcess={activeProcess}
        toasts={toasts}
        onDismissToast={(id) => setToasts((p) => p.filter((x) => x.id !== id))}
      />}
      <AlertsModal open={notificationsOpen} onClose={()=>setNotificationsOpen(false)} alerts={alertBulletin?.zone_id === zoneId ? alertBulletin.active_alerts || [] : []} zoneName={communityName} lang={voiceLang}/>
    </div>
  );
}
