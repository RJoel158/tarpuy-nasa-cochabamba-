import WeatherSourcesFooter from "./components/WeatherSourcesFooter.jsx";
import { locateDevice } from "./services/locationService.js";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowRight } from "lucide-react";
import Navbar, { CabeceraNavegacion } from "./components/layout/Navbar.jsx";
import EarlyWarningBanner from "./components/alerts/EarlyWarningBanner.jsx";
import FarmerWaterActionCard from "./components/alerts/FarmerWaterActionCard.jsx";
import MunicipalAlertModal from "./components/alerts/MunicipalAlertModal.jsx";


import ProducerMode from "./components/ProducerMode.jsx";
import TechnicalMode from "./components/TechnicalMode.jsx";
import CochabambaMap from "./components/maps/CochabambaMap.jsx";
import { IlustracionTarpuy } from "./components/illustrations/TarpuyIllustrations.jsx";
import InstitutionalBrandBar from "./components/InstitutionalBrandBar.jsx";
import { BotonGrande } from "./components/ui/TarpuyBaseComponents.jsx";
import IntroInicio from "./components/IntroInicio.jsx";


import { FeedbackHost } from "./components/ui/FeedbackSystem.jsx";
import { ZONE_GEO_CATALOG, findNearestZone, districtToCommunity } from "./utils/geoUtils.js";
import { fetchDistrictAt, fetchGamcDistricts, fetchDrainageAt, fetchPeriurbanAt } from "./services/gamcClient.js";
import {
  buildMunicipalContextPayload,
  chipLabel,
  contextTip,
  resolvePeriurbanProfile,
} from "./services/periurbanProfiles.js";

import {
  fetchZones,
  fetchCrops,
  fetchRecommendations,
  fetchAlerts,
  autoSyncZoneSnapshot,
  listCachedZoneIds,
} from "./services/apiClient.js";
import { loadDeviceSnapshotSync, getDeviceDbStats } from "./services/embeddedDb.js";
import { speakQuechua, speakSpanish, stopSpeaking } from "./services/speechService.js";
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
  const [cropId, setCropId] = useState(initialSnap?.cropId || "cereales");
  const [priorities, setPriorities] = useState(["water_conservation", "nitrogen_fixation", "erosion_control"]);
  const [irrigation, setIrrigation] = useState(initialSnap?.irrigation || "deficit_auxiliary");
  const [equipment, setEquipment] = useState("manual_yunta");
  const forceOffline = false;
  const [refreshTick, setRefreshTick] = useState(0);
  const [weatherTick, setWeatherTick] = useState(0);
  const recommendationRequest = useRef(0);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [recData, setRecData] = useState(null);
  const [alertBulletin, setAlertBulletin] = useState(null);
  const [municipalModalOpen, setMunicipalModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbStats, setDbStats] = useState(() => getDeviceDbStats());
  const [syncStatus, setSyncStatus] = useState(
    initialSnap?.sizeKb ? `Base local (${initialSnap.sizeKb} KB)` : "Sincronizando base local..."
  );
  const [voiceLang, setVoiceLang] = useState(() => {
    try { return localStorage.getItem("tarpuy_language_v1") === "qu" ? "qu" : "es"; }
    catch { return "es"; }
  });
  useEffect(() => {
    document.documentElement.lang = voiceLang === "qu" ? "quh-BO" : "es-BO";
    try { localStorage.setItem("tarpuy_language_v1", voiceLang); } catch { /* Storage may be unavailable. */ }
  }, [voiceLang]);
  const gpsAttemptRef = useRef(0);
  const [gpsNotice, setGpsNotice] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [activeAudioKey, setActiveAudioKey] = useState(null);
  const [userPoint, setUserPoint] = useState(initialSnap?.userPoint || null);
  const [drainage, setDrainage] = useState(null);
  const [periurban, setPeriurban] = useState(null);
  const [districtMeta, setDistrictMeta] = useState(initialSnap?.districtMeta || null);
  useEffect(() => {
    let cancelled = false;
    setDrainage(null);
    setPeriurban(null);
    if (userPoint && !forceOffline && isOnline) {
      fetchDrainageAt(userPoint.lat, userPoint.lon)
        .then((value) => { if (!cancelled) setDrainage(value); })
        .catch(() => { if (!cancelled) setDrainage(null); });
      fetchPeriurbanAt(userPoint.lat, userPoint.lon)
        .then((value) => { if (!cancelled) setPeriurban(value); })
        .catch(() => { if (!cancelled) setPeriurban(null); });
    }
    return () => { cancelled = true; };
  }, [userPoint, forceOffline, isOnline, refreshTick]);

  const municipalProfile = resolvePeriurbanProfile(districtMeta?.code);
  const municipalChip = chipLabel(municipalProfile, voiceLang) || userPoint?.district || null;
  const municipalTip = contextTip(municipalProfile, drainage, voiceLang);
  const [toasts, setToasts] = useState([]);
  const [activeProcess, setActiveProcess] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const processTimersRef = useRef([]);
  const calcTimerRef = useRef(null);
  const alertBulletinRef = useRef(alertBulletin);
  alertBulletinRef.current = alertBulletin;

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
    const onOn = () => { setIsOnline(true); setRefreshTick(t => t + 1); };
    const onOff = () => setIsOnline(false);
    window.addEventListener("online", onOn);
    window.addEventListener("offline", onOff);
    return () => { window.removeEventListener("online", onOn); window.removeEventListener("offline", onOff); };
  }, []);

  useEffect(() => {
    const refresh = () => { if (navigator.onLine && document.visibilityState === "visible") setRefreshTick(t => t + 1); };
    const timer = setInterval(refresh, 300000);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (navigator.onLine && document.visibilityState === "visible") setWeatherTick(t => t + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchZones(!isOnline).then((zs) => zs?.length && setZones(zs));
    fetchCrops(!isOnline).then((cs) => cs?.length && setCrops(cs));
  }, [isOnline, refreshTick]);

  useEffect(() => {
    let cancelled = false;
    fetchAlerts(zoneId, !isOnline, {
      lat: userPoint?.lat, lon: userPoint?.lon,
      districtCode: districtMeta?.code,
      comuna: districtMeta?.comuna,
      drainage,
    }).then((b) => { if (!cancelled) setAlertBulletin(b); });
    return () => { cancelled = true; };
  }, [zoneId, isOnline, refreshTick, weatherTick, districtMeta, drainage, userPoint]);

  const loadRecs = useCallback(async () => {
    const request = ++recommendationRequest.current;
    setLoading(true);
    try {
      const municipal_context = districtMeta?.code
        ? buildMunicipalContextPayload({
            districtCode: districtMeta.code,
            comuna: districtMeta.comuna,
            periurban,
            drainage,
            bulletin: alertBulletinRef.current,
          })
        : undefined;
      const data = await fetchRecommendations(
        {
          zone_id: zoneId,
          current_crop_id: cropId,
          farmer_priorities: priorities,
          constraints: {
            irrigation_access: irrigation,
            equipment_level: equipment,
            language_preference: "bilingual",
          },
          ...(municipal_context ? { municipal_context } : {}),
        },
        !isOnline
      );
      if (request !== recommendationRequest.current) return;
      setRecData(data);
      // Weather is refreshed independently; zonal recommendations must not overwrite it.
    } catch {} finally { if (request === recommendationRequest.current) setLoading(false); }
  }, [zoneId, cropId, priorities, irrigation, equipment, isOnline, refreshTick, districtMeta, periurban, drainage, userPoint]);


  useEffect(() => { loadRecs(); }, [loadRecs]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    if (!forceOffline && isOnline) {
      autoSyncZoneSnapshot(zoneId, { communityName, cropId, irrigation, userPoint, districtMeta }, { signal: controller.signal })
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
    return () => { cancelled = true; controller.abort(); };
  }, [zoneId, communityName, cropId, irrigation, isOnline, refreshTick, userPoint, districtMeta]);

  const currentZone = zones.find((z) => z.zone_id === zoneId) || zones[0];
  const cachedCount = listCachedZoneIds().length;

  const handleDownloadBundle = async () => {
    setSyncStatus("Actualizando base local...");
    setActiveProcess({ label: "Guardando copia única en el dispositivo...", pct: 45 });
    try {
      const res = await autoSyncZoneSnapshot(zoneId, { communityName, cropId, irrigation, userPoint, districtMeta });
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

  const handleStopAudio = () => { setAudioLoading(false); stopSpeaking(); setIsSpeaking(false); setActiveAudioKey(null); };

  const handleSpeak = (text, lang, key, clipKey = null) => {
    if (activeAudioKey === key) {
      handleStopAudio();
      pushToast("Audio detenido", "", "info");
      return;
    }
    handleStopAudio();
    setActiveAudioKey(key);
    setIsSpeaking(true);
    setAudioLoading(true);
    const cb = {
      onLoading: setAudioLoading,
      clipKey,
      neuralOnly: key.startsWith("water_"),
      onEngine: (engine) => {
        if (engine === "browser_fallback") pushToast("Voz básica del equipo", "La voz natural no está disponible en este momento", "info");
      },

      onEnd: () => { setAudioLoading(false); setActiveAudioKey(null); setIsSpeaking(false); },
      onError: () => {
        setAudioLoading(false);
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
    setUserPoint(null);
    setDistrictMeta(null);
    setDrainage(null);
    setPeriurban(null);
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
    setDistrictMeta(comm.isDistrict ? { code: comm.code, comuna: comm.comuna } : null);
    setUserPoint({ lat: comm.coords[0], lon: comm.coords[1], source: comm.name, bounds: comm.bounds, district: comm.name });
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

  const handlePickMapPoint = async (lat, lon, source = "mapa", accuracy = null) => {
    const attempt = ++gpsAttemptRef.current;
    setGpsNotice(null);
    const district = await findDistrictAt(lat, lon);
    if (attempt !== gpsAttemptRef.current) return;
    if (district) {
      const comm = districtToCommunity(district);
      const profile = resolvePeriurbanProfile(district.code);
      const label = profile?.label_es || `${comm.name} · ${comm.comuna}`;
      setCommunityName(label);
      setDistrictMeta({ code: district.code, comuna: district.comuna || comm.comuna });
      setUserPoint({
        lat,
        lon,
        source,
        accuracy,
        district: label,
        bounds: undefined,
      });
      applyZoneChange(profile?.zone_id || comm.zoneId);
      simulateProcess(`Ubicando parcela (${source})...`, 500, () => {
        pushToast(label, `Detectado por ${source}`, "success");
      });
      return;
    }
    const nearest = findNearestZone(lat, lon);
    setCommunityName(source.startsWith("Distrito ") ? source.replace(" · centro aproximado", "") : nearest.zone.name);
    setDistrictMeta(null);
    setUserPoint({ lat, lon, source, accuracy });
    applyZoneChange(nearest.zone.id);
    simulateProcess(`Ubicando parcela (${source})...`, 500, () => {
      pushToast(
        `Zona: ${nearest.zone.name}`,
        `Fuera de distritos municipales · a ${nearest.distanceKm} km (${source})`,
        "info"
      );

    });
  };

  const handleDetectGps = async () => {
    const attempt = ++gpsAttemptRef.current;
    setActiveView("mapa");
    setGpsNotice("Buscando tu ubicación. Permite el acceso si el navegador lo solicita.");
    try {
      if (!navigator.geolocation) throw new Error("GPS unavailable");
      const pos = await locateDevice(navigator.geolocation, {
        isCurrent: () => attempt === gpsAttemptRef.current,
        onRetry: () => {},
        onPosition: (pos) => {
          if (attempt !== gpsAttemptRef.current) return;
          setDistrictMeta(null);
          setUserPoint({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: "GPS", accuracy: pos.coords.accuracy });
          setGpsNotice(`Ubicación aproximada: ±${Math.round(pos.coords.accuracy)} m. Mejorando precisión…`);
        },
      });
      if (!pos || attempt !== gpsAttemptRef.current) return;
      await handlePickMapPoint(pos.coords.latitude, pos.coords.longitude, "GPS", pos.coords.accuracy);
      if (attempt + 1 !== gpsAttemptRef.current) return;
      setGpsNotice(`Precisión del dispositivo: ±${Math.round(pos.coords.accuracy)} m. Toca el mapa para corregir tu parcela si hace falta.`);
    } catch (error) {
      if (attempt !== gpsAttemptRef.current) return;
      setGpsNotice(error.code === 1 ? "Permite la ubicación en tu navegador o elige tu distrito." : "No pudimos ubicarte. Intenta otra vez o toca tu parcela en el mapa.");
    }
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

  const handleToggleOffline = () => {};

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
      nextLang === "qu" ? "Quechua seleccionado; algunas interpretaciones siguen en castellano y pendientes de revisión local." : "Textos y voz en castellano",
      "info"
    );
  };


  if (activeView === "mapa") {
    return <main className="tarpuy-map-screen" aria-label="Elige tu ubicación">
      <CochabambaMap
        guided
        onContinue={() => { setActiveProcess(null); setToasts([]); setActiveView("clima"); }}
        activeZoneId={zoneId} onSelectZone={handleSelectZone}
        selectedCommunityName={communityName} onSelectCommunity={handleSelectCommunity}
        onChooseDistrict={(district) => handleSelectCommunity(districtToCommunity(district))}
        userPoint={userPoint} onPickMapPoint={handlePickMapPoint}
        onDetectGps={handleDetectGps} forceOffline={forceOffline} isOnline={isOnline}
        geoStatus={gpsNotice || ""}
        onBack={() => setActiveView("clima")}
        onNavigate={setActiveView}
        isAdvanced={isAdvanced}
        lang={voiceLang}
      />
    </main>;
  }

  return (
    <div className="tarpuy-app-layout min-h-screen tarpuy-page-surface flex flex-col lg:flex-row">
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
        onStopAudio={handleStopAudio}
        isOnline={isOnline}
        forceOffline={forceOffline}
        onToggleOffline={handleToggleOffline}
        onDownloadBundle={handleDownloadBundle}
        cachedCount={cachedCount}
        dbStats={dbStats}
        syncStatus={syncStatus}
      />

      <div className="tarpuy-main-content flex-1 min-w-0 flex flex-col justify-between pb-48 lg:pb-8">
          <div>
            <CabeceraNavegacion
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
              onStopAudio={handleStopAudio}
              isOnline={isOnline}
              forceOffline={forceOffline}
              onToggleOffline={handleToggleOffline}
              onDownloadBundle={handleDownloadBundle}
              cachedCount={cachedCount}
              dbStats={dbStats}
              syncStatus={syncStatus}
            usingSavedWeather={Boolean(alertBulletin?.offline_copy)}
            />
            <main
              id="tarpuy-main-view"
              data-producer-mode={!isAdvanced}
              className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-4 sm:py-6 space-y-8"
            >
              {activeView === "siembra" && recData?.data_provenance?.etl_status === "offline_reference_only" && <p role="status" lang="es-BO" className="rounded-2xl bg-[var(--arena)] p-4">Estas son opciones de referencia guardadas. Sin conexión al servidor no se recalcula su ajuste a los cambios del formulario; vuelve a consultar al recuperar la conexión.</p>}
              {loading && !recData ? (
                <p className="py-12 text-center font-extrabold" style={{ color: "var(--tinta-suave)" }}>
                  Cargando datos...
                </p>
              ) : activeView === "clima" ? (
                <div className="space-y-8">
                  {/* 1. EL MENSAJE DEL DÍA + PAISAJE + 2. HOY + 3. LA SEMANA + 6. DETALLE PLEGADO */}
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

                  <FarmerWaterActionCard
                    bulletin={alertBulletin?.zone_id === zoneId ? alertBulletin : null}
                    drainage={drainage} district={municipalChip} tip={municipalTip}
                    lang={voiceLang} onSpeak={handleSpeak} activeAudioKey={activeAudioKey}
                    onPlant={() => setActiveView("siembra")} advanced={isAdvanced}
                    crop={crops.find((c) => c.crop_id === cropId) || { crop_id: cropId, name_es: cropId === "cereales" ? "Cereales y Granos" : cropId === "tuberculos" ? "Tubérculos" : cropId === "hortalizas" ? "Hortalizas" : cropId === "frutales" ? "Frutales" : cropId, name_qu: cropId }}
                    onOpenMunicipalAlert={() => setMunicipalModalOpen(true)}
                  />
                </div>
              ) : activeView === "siembra" ? (
                <ProducerMode key={zoneId}
                  onStopAudio={handleStopAudio} audioLoading={audioLoading}
                  municipalContext={recData?.municipal_context || null}
                  municipalChip={municipalChip} municipalTip={municipalTip}
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
                <div className="space-y-8">
                  <div className="px-1">
                    <span
                      className="inline-block text-sm font-medium mb-1"
                      style={{ color: "var(--tinta-suave)" }}
                    >
                      {tr(voiceLang, "mapSubtitle")}
                    </span>
                    <h2
                      className="font-bold tracking-tight"
                      style={{
                        fontFamily: "var(--tarpuy-font-display)",
                        fontSize: "var(--tarpuy-text-title)",
                        lineHeight: "var(--tarpuy-line-title)",
                        color: "var(--tinta)",
                      }}
                    >
                      {tr(voiceLang, "mapTitle")} · {communityName || currentZone?.name || ""}
                    </h2>
                  </div>
                  {gpsNotice && <p role="status" className="rounded-2xl border border-[var(--tinta)] bg-[var(--tarjeta)] p-4 font-bold">{gpsNotice}</p>}
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
                    lang={voiceLang}
                    isAdvanced={isAdvanced}
                    onSpeak={handleSpeak}
                    activeAudioKey={activeAudioKey}
                  />
                </div>
              ) : (
                <TechnicalMode
                  zone={currentZone}
                  strategies={recData?.strategies || []}
                  provenance={recData?.data_provenance}
                  bulletin={alertBulletin}
                  isAdvanced={isAdvanced}
                  lang={voiceLang}
                />
              )}
            </main>
          </div>

          <footer className="max-w-5xl mx-auto w-full px-4 sm:px-8 pt-4 space-y-3">
            <WeatherSourcesFooter bulletin={alertBulletin?.zone_id === zoneId ? alertBulletin : null} />
            <InstitutionalBrandBar variant="footer" />

          </footer>
        </div>
        <MunicipalAlertModal open={municipalModalOpen}
          onClose={() => setMunicipalModalOpen(false)}
          alert={alertBulletin?.zone_id === zoneId ? alertBulletin.municipal_alert : null}
          lang={voiceLang} />
        <FeedbackHost
          activeProcess={activeProcess}
          toasts={toasts}
          onDismissToast={(id) => setToasts((p) => p.filter((x) => x.id !== id))}
        />
        <IntroInicio
          voiceLang={voiceLang}
          isAppReady={!loading || Boolean(recData || alertBulletin)}
        />
      </div>
      );

}
