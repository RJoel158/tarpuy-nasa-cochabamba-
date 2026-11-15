import MamaTomasaBrand from "../MamaTomasaBrand.jsx";
import InstallPwa from "../InstallPwa.jsx";
import React, { useState } from "react";
import CommunitySearchCombobox from "../ui/CommunitySearchCombobox.jsx";
import { BotonAltavoz } from "../ui/TarpuyBaseComponents.jsx";
import InstitutionalBrandBar from "../InstitutionalBrandBar.jsx";
import { IlustracionTarpuy } from "../illustrations/TarpuyIllustrations.jsx";
import { tr } from "../../utils/quechuaI18n.js";

/**
 * TARPUY NASA COCHABAMBA — NAVEGACIÓN PRINCIPAL Y CABECERA (FASE 2 · DESATURADA)
 * ==============================================================================
 * - 4 Pestañas grandes con dibujo + UNA palabra completa (sin cortarse y sin
 *   botones/flechas extra dentro del botón del menú).
 * - Botón de Inicio reducido a una casita simple y clara.
 * - Al presionar cualquier sección del menú, lleva directamente al contenido
 *   principal de la sección seleccionada.
 * - Cabecera superior compacta y tranquila (sin 4 cajas gigantes que empujen
 *   la pantalla hacia abajo), manteniendo todos los controles y props intactos.
 */

const NAV_ITEMS = [
  {
    id: "clima",
    key: "navWeather",
    ilustracionId: "nube_con_sol",
    palabraEs: "Clima",
    palabraQu: "Pacha",
  },
  {
    id: "siembra",
    key: "navPlant",
    ilustracionId: "mano_siembra",
    palabraEs: "Siembra",
    palabraQu: "Tarpuy",
  },
  {
    id: "mapa",
    key: "navMap",
    ilustracionId: "mapa_chacra",
    palabraEs: "Mapa",
    palabraQu: "Saywiti",
  },
  {
    id: "datos",
    key: "navNasa",
    ilustracionId: "cartilla_grafico",
    palabraEs: "Datos",
    palabraQu: "Willay",
  },
];

function CheckSimple({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" fill="var(--hoja-oscura)" />
      <path
        d="M7.5 12.5L10.5 15.5L16.5 9"
        stroke="var(--tarjeta)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function irDirectoASeccion(onChangeView, id) {
  onChangeView?.(id);
  if (typeof window !== "undefined") {
    requestAnimationFrame(() => {
      const mainEl = document.getElementById("tarpuy-main-view");
      if (mainEl) {
        mainEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }
}

function Preferencias({ voiceLang, onChangeVoiceLang, appMode, onChangeAppMode }) {
  const qu = voiceLang === "qu";
  return <div className="tarpuy-preferences">
    <label>
      <span>{qu ? "Simi · Idioma" : "Idioma"}</span>
      <select value={voiceLang} onChange={(e) => onChangeVoiceLang?.(e.target.value)}>
        <option value="es">Castellano</option>
        <option value="qu">Runasimi (Quechua)</option>
      </select>
    </label>
    <label>
      <span>{qu ? "Qhaway · Vista" : "Vista"}</span>
      <select value={appMode} onChange={(e) => onChangeAppMode?.(e.target.value)}>
        <option value="facil">{qu ? "Llampu (Fácil)" : "Fácil"}</option>
        <option value="avanzado">{qu ? "Sut'i (Avanzado)" : "Avanzada"}</option>
      </select>
    </label>
    <InstallPwa />
  </div>;
}

export function MobileBottomNav({
  activeView = "clima",
  onChangeView,
  appMode = "facil",
  voiceLang = "es",
  className = "",
  style = {},
  zIndex = "z-40",
}) {
  const esQuechua = voiceLang === "qu";
  const visibleNavItems =
    appMode === "avanzado" ? NAV_ITEMS : NAV_ITEMS.filter((i) => i.id !== "datos");

  return (
    <nav
      aria-label="Navegación inferior móvil"
      className={`lg:hidden fixed bottom-0 inset-x-0 ${zIndex} grid ${
        visibleNavItems.length === 3 ? "grid-cols-3" : "grid-cols-4"
      } gap-1.5 sm:gap-3 px-2 sm:px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] ${className}`}
      style={{
        backgroundColor: "var(--tinta)",
        borderTop: "2px solid var(--tinta-suave)",
        ...style,
      }}
    >
      {visibleNavItems.map(({ id, ilustracionId, palabraEs, palabraQu }) => {
        const activa = activeView === id;
        const palabra = esQuechua ? palabraQu : palabraEs;

        return (
          <button
            key={id}
            type="button"
            onClick={() => irDirectoASeccion(onChangeView, id)}
            aria-current={activa ? "page" : undefined}
            className="flex flex-col items-center justify-center gap-1 px-1 py-1.5 cursor-pointer transition-all"
            style={{
              minHeight: "64px",
              backgroundColor: activa ? "var(--dorado)" : "transparent",
              color: activa ? "var(--tinta)" : "var(--tarjeta)",
              border: activa ? "2px solid var(--tarjeta)" : "2px solid transparent",
              borderRadius: "var(--radius-btn)",
            }}
          >
            <span className="flex items-center justify-center shrink-0">
              <IlustracionTarpuy id={ilustracionId} size={activa ? 32 : 28} />
            </span>
            <span
              className={activa ? "font-bold leading-tight" : "font-medium leading-tight"}
              style={{
                fontSize: "clamp(0.875rem, 3.6vw, 1.05rem)",
                whiteSpace: "nowrap",
              }}
            >
              {palabra}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default function Navbar({
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
  const esQuechua = voiceLang === "qu";

  /* En Modo Fácil ocultamos la pestaña técnica "Datos"; solo se muestra en Modo Avanzado */
  const visibleNavItems =
    appMode === "avanzado" ? NAV_ITEMS : NAV_ITEMS.filter((i) => i.id !== "datos");

  return (
    <>
      {/* =====================================================================
       * 1. BARRA LATERAL EN PANTALLA GRANDE (Fondo en --tinta, limpia y directa)
       * ===================================================================== */}
      <aside
        aria-label="Navegación principal"
        className="tarpuy-sidebar hidden lg:flex lg:flex-col lg:w-68 xl:w-72 lg:shrink-0 sticky top-0 justify-between p-5 select-none"
        style={{
          backgroundColor: "var(--tinta)",
          color: "var(--tarjeta)",
        }}
      >
        <div className="space-y-6">
          {/* Logos en su etiqueta crema + título y casita simple */}
          <div
            className="space-y-3.5 pb-4"
            style={{ borderBottom: "1px solid var(--tinta-suave)" }}
          >
            <MamaTomasaBrand />
            <InstitutionalBrandBar variant="inline" size="sm" />
          </div>

          {/* Las pestañas grandes: Dibujo + UNA palabra completa, sin botones interiores ni cortes */}
          <nav aria-label={tr(voiceLang, "sections")} className="space-y-3">
            {visibleNavItems.map(({ id, ilustracionId, palabraEs, palabraQu }) => {
              const activa = activeView === id;
              const palabra = esQuechua ? palabraQu : palabraEs;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => irDirectoASeccion(onChangeView, id)}
                  aria-current={activa ? "page" : undefined}
                  className="w-full flex items-center gap-4 px-4 py-3 cursor-pointer transition-all"
                  style={{
                    minHeight: activa ? "76px" : "68px",
                    backgroundColor: activa ? "var(--dorado)" : "var(--tinta-suave)",
                    color: activa ? "var(--tinta)" : "var(--tarjeta)",
                    border: activa
                      ? "2px solid var(--tarjeta)"
                      : "1px solid transparent",
                    borderRadius: "var(--radius-btn)",
                    boxShadow: activa ? "0 3px 0 var(--tarjeta)" : "none",
                  }}
                >
                  <span className="flex items-center justify-center shrink-0">
                    <IlustracionTarpuy
                      id={ilustracionId}
                      size={activa ? 42 : 36}
                    />
                  </span>
                  <span
                    className={activa ? "font-bold" : "font-medium"}
                    style={{
                      fontSize: activa ? "1.4rem" : "1.25rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {palabra}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Botón grande de Altavoz al pie de la barra lateral */}
        <div
          className="tarpuy-sidebar-audio pt-4 mt-4 flex flex-col items-center"
          style={{ borderTop: "1px solid var(--tinta-suave)" }}
        >
          <Preferencias voiceLang={voiceLang} onChangeVoiceLang={onChangeVoiceLang}
            appMode={appMode} onChangeAppMode={onChangeAppMode} />
        </div>
      </aside>

      {/* =====================================================================
       * 2. BARRA INFERIOR FIJA EN CELULAR (Las 4 pestañas en la zona del pulgar,
       *    respetando safe-area-inset y >= 64 px de altura, apta desde 320 px)
       * ===================================================================== */}
      <MobileBottomNav
        activeView={activeView}
        onChangeView={onChangeView}
        appMode={appMode}
        voiceLang={voiceLang}
        zIndex="z-40"
      />
    </>
  );
}

/**
 * CABECERA SUPERIOR TRANQUILA Y COMPACTA:
 * Mantiene los 4 controles en orden fijo:
 * (a) Comunidad y GPS, (b) Idioma, (c) Modo, (d) Estado sin internet,
 * pero en una sola franja limpia para que la pantalla elegida ("Clima",
 * "Siembra", "Mapa", "Datos") sea inmediatamente protagonista arriba.
 */
export function CabeceraNavegacion({
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
  usingSavedWeather = false,
}) {
  const [mostrarBuscador, setMostrarBuscador] = useState(false);
  const [mostrarPanelOffline, setMostrarPanelOffline] = useState(false);
  const onlineActive = !forceOffline && isOnline;
  const esQuechua = voiceLang === "qu";

  return (
    <header
      data-zona={zoneId}
      className="no-print relative w-full px-4 sm:px-8 pt-3 pb-2 max-w-5xl mx-auto space-y-3"
    >
      {/* FILA 1 EN MÓVIL: Los 2 logos juntos en su etiqueta crema + Comunidad actual + Estado sin internet */}
      <div className="lg:hidden flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-col gap-2 min-w-0">
          <MamaTomasaBrand compact />
          <InstitutionalBrandBar variant="inline" size="sm" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Comunidad actual (toca para cambiar o usar GPS) */}
          <button
            type="button"
            onClick={() => setMostrarBuscador((v) => !v)}
            className="tarpuy-btn-physical tarpuy-btn-physical--secondary inline-flex items-center gap-2 px-3 py-1.5 cursor-pointer"
            style={{
              minHeight: "56px",
              backgroundColor: "var(--acento-zona-suave)",
            }}
          >
            <IlustracionTarpuy id="pin_ubicacion" size={24} />
            <span className="font-bold text-base leading-tight">
              {selectedCommunityName}
            </span>
          </button>

          {/* Estado sin internet */}
          <span role="status" className="sync-indicator">{usingSavedWeather ? "Copia guardada · actualización pendiente" : onlineActive ? "Actualización automática" : `Sin conexión · ${dbStats?.updatedAt ? new Date(dbStats.updatedAt).toLocaleDateString("es-BO") : "sin copia guardada"}`}</span>
        </div>
      </div>

      <div className="lg:hidden">
        <Preferencias voiceLang={voiceLang} onChangeVoiceLang={onChangeVoiceLang}
          appMode={appMode} onChangeAppMode={onChangeAppMode} />
      </div>

      {/* EN ESCRITORIO: Cabecera con Comunidad, GPS, Copia guardada y los 4 botones */}
      <div
        className="hidden lg:block rounded-3xl p-4 space-y-3"
        style={{
          backgroundColor: "var(--tarjeta)",
          border: "1px solid color-mix(in srgb, var(--piedra) 35%, transparent)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setMostrarBuscador((v) => !v)}
              className="tarpuy-btn-physical tarpuy-btn-physical--secondary inline-flex items-center gap-2.5 px-4 py-2 cursor-pointer"
              style={{
                minHeight: "64px",
                backgroundColor: "var(--acento-zona-suave)",
              }}
            >
              <IlustracionTarpuy id="pin_ubicacion" size={30} />
              <div className="text-left leading-tight">
                <span className="block text-sm font-normal" style={{ color: "var(--tinta-suave)" }}>
                  {esQuechua ? "Llaqtayki" : "Estás en"}
                </span>
                <strong className="font-bold text-lg" style={{ color: "var(--tinta)" }}>
                  {selectedCommunityName}
                </strong>
              </div>
            </button>

            <button
              type="button"
              onClick={onDetectGps}
              className="tarpuy-btn-physical tarpuy-btn-physical--secondary inline-flex items-center gap-2 px-4 py-2 cursor-pointer"
              style={{ minHeight: "64px" }}
              title={tr(voiceLang, "detectGps")}
            >
              <IlustracionTarpuy id="mapa_chacra" size={28} />
              <span className="font-bold text-base">
                {esQuechua ? "GPS tariy" : "Mi GPS"}
              </span>
            </button>
          </div>

          <span role="status" className="sync-indicator">{usingSavedWeather ? "Copia guardada · actualización pendiente" : onlineActive ? "Actualización automática" : `Sin conexión · ${dbStats?.updatedAt ? new Date(dbStats.updatedAt).toLocaleDateString("es-BO") : "sin copia guardada"}`}</span>
        </div>

      </div>

      {/* Panel desplegable para buscar otra comunidad o usar GPS cuando se toca el botón de comunidad */}
      {mostrarBuscador && (
        <div
          className="rounded-3xl p-4 space-y-3"
          style={{
            backgroundColor: "var(--tarjeta)",
            border: "1.5px solid var(--tinta)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-lg" style={{ color: "var(--tinta)" }}>
              {esQuechua ? "Aylluykita maskhay:" : "Busca tu comunidad o usa el GPS:"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onDetectGps?.();
                  setMostrarBuscador(false);
                }}
                className="tarpuy-btn-physical tarpuy-btn-physical--secondary inline-flex items-center gap-2 px-3.5 py-2 text-base font-bold cursor-pointer"
                style={{ minHeight: "56px" }}
              >
                <IlustracionTarpuy id="pin_ubicacion" size={24} />
                <span>{esQuechua ? "GPS tariy" : "Mi GPS"}</span>
              </button>
              <button
                type="button"
                onClick={() => setMostrarBuscador(false)}
                className="min-h-[56px] px-3.5 py-2 rounded-2xl text-base font-bold underline cursor-pointer"
                style={{ color: "var(--tinta)" }}
              >
                {esQuechua ? "Wichq'ay" : "Cerrar"}
              </button>
            </div>
          </div>
          <CommunitySearchCombobox
            selectedCommunityName={selectedCommunityName}
            activeZoneId={zoneId}
            onSelectCommunity={(item) => {
              onSelectCommunity?.(item);
              setMostrarBuscador(false);
            }}
          />
        </div>
      )}

      {/* Panel desplegable de sincronización sin internet cuando se toca el indicador */}

    </header>
  );
}
