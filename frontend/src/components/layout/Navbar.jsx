import React, { useState } from "react";
import CommunitySearchCombobox from "../ui/CommunitySearchCombobox.jsx";
import { EtiquetaLogo, BotonAltavoz } from "../ui/TarpuyBaseComponents.jsx";
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
        className="hidden lg:flex lg:flex-col lg:w-68 xl:w-72 lg:shrink-0 min-h-screen sticky top-0 max-h-screen justify-between p-5 select-none overflow-y-auto"
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
            <EtiquetaLogo className="w-full justify-center">
              <img
                src="/logos/nasa-space-apps.png"
                alt="NASA International Space Apps Challenge"
                className="h-10 w-auto object-contain"
              />
              <span
                className="h-7 w-px"
                style={{ backgroundColor: "var(--piedra)" }}
                aria-hidden="true"
              />
              <img
                src="/logos/alcaldia-cochabamba-escudo.jpg"
                alt="Alcaldía de Cochabamba"
                className="h-10 w-auto object-contain"
              />
            </EtiquetaLogo>

            {/* Título + solo una casita para volver al inicio */}
            <div className="flex items-center justify-between gap-2 px-1 pt-1">
              <div>
                <h1
                  className="font-bold tracking-tight leading-tight"
                  style={{ color: "var(--tarjeta)", fontSize: "1.25rem" }}
                >
                  Tarpuy Cochabamba
                </h1>
                <p className="text-sm font-normal" style={{ color: "var(--arena)" }}>
                  {tr(voiceLang, "subtitle")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => irDirectoASeccion(onChangeView, "clima")}
                aria-label={esQuechua ? "Qallariyman kutiy" : "Ir al inicio"}
                title={esQuechua ? "Qallariyman kutiy" : "Ir al inicio"}
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer transition-transform active:translate-y-0.5"
                style={{
                  backgroundColor: "var(--tarjeta)",
                  border: "2px solid var(--piedra)",
                }}
              >
                <IlustracionTarpuy id="casa" size={34} />
              </button>
            </div>
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
          className="pt-4 mt-4 flex flex-col items-center"
          style={{ borderTop: "1px solid var(--tinta-suave)" }}
        >
          <BotonAltavoz
            sonando={isSpeaking}
            mostrarTexto={true}
            etiqueta={esQuechua ? "Yanapayta uyariy" : "Escuchar guía"}
            onClick={isSpeaking ? onStopAudio : onSpeakGuide}
            className="w-full"
          />
        </div>
      </aside>

      {/* =====================================================================
       * 2. BARRA INFERIOR FIJA EN CELULAR (Las 4 pestañas en la zona del pulgar,
       *    respetando safe-area-inset y >= 64 px de altura, apta desde 320 px)
       * ===================================================================== */}
      <nav
        aria-label="Navegación inferior móvil"
        className={`lg:hidden fixed bottom-0 inset-x-0 z-40 grid ${
          visibleNavItems.length === 3 ? "grid-cols-3" : "grid-cols-4"
        } gap-1.5 sm:gap-3 px-2 sm:px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]`}
        style={{
          backgroundColor: "var(--tinta)",
          borderTop: "2px solid var(--tinta-suave)",
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
        <EtiquetaLogo className="py-1.5 px-3">
          <img
            src="/logos/nasa-space-apps.png"
            alt="NASA International Space Apps Challenge"
            className="h-7 sm:h-8 w-auto object-contain"
          />
          <span
            className="h-5 w-px"
            style={{ backgroundColor: "var(--piedra)" }}
            aria-hidden="true"
          />
          <img
            src="/logos/alcaldia-cochabamba-escudo.jpg"
            alt="Alcaldía de Cochabamba"
            className="h-7 sm:h-8 w-auto object-contain"
          />
        </EtiquetaLogo>

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
          <button
            type="button"
            onClick={() => setMostrarPanelOffline((v) => !v)}
            className="min-h-[56px] px-3 py-1.5 rounded-2xl inline-flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: "var(--cielo-suave)",
              color: "var(--tinta)",
              border: "1.5px solid var(--tinta)",
            }}
            title="Estado de conexión y copia local"
          >
            <IlustracionTarpuy id="antena_ondas" size={22} />
            <span className="text-sm font-bold leading-tight">
              {onlineActive
                ? esQuechua
                  ? "Waqaychasqa"
                  : "Guardado"
                : esQuechua
                ? "Mana internet"
                : "Sin internet"}
            </span>
          </button>
        </div>
      </div>

      {/* EN MÓVIL: 2 combos limpios (Idioma + Modo) para que no estén los 4 botones juntos */}
      <div className="lg:hidden grid grid-cols-2 gap-2.5">
        {/* Combo 1: Idioma (Castellano / Runasimi) */}
        <label
          className="relative min-h-[58px] px-3 py-1.5 rounded-2xl flex items-center gap-2 cursor-pointer"
          style={{
            backgroundColor: "var(--dorado-suave)",
            color: "var(--tinta)",
            border: "2px solid var(--tinta)",
            boxShadow: "0 2px 0 var(--tinta)",
          }}
        >
          <span className="shrink-0 pointer-events-none">
            <IlustracionTarpuy id="altavoz" size={22} />
          </span>
          <select
            aria-label={esQuechua ? "Rimay akllay" : "Seleccionar idioma"}
            value={voiceLang}
            onChange={(e) => onChangeVoiceLang?.(e.target.value)}
            className="w-full bg-transparent font-bold pr-5 py-1 appearance-none cursor-pointer focus:outline-none"
            style={{
              color: "var(--tinta)",
              fontSize: "clamp(0.95rem, 3.8vw, 1.05rem)",
            }}
          >
            <option value="es">Castellano</option>
            <option value="qu">Runasimi</option>
          </select>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="absolute right-2.5 pointer-events-none shrink-0"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="var(--tinta)"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </label>

        {/* Combo 2: Modo (Modo Fácil / Avanzado) */}
        <label
          className="relative min-h-[58px] px-3 py-1.5 rounded-2xl flex items-center gap-2 cursor-pointer"
          style={{
            backgroundColor: "var(--hoja-suave)",
            color: "var(--tinta)",
            border: "2px solid var(--tinta)",
            boxShadow: "0 2px 0 var(--tinta)",
          }}
        >
          <span className="shrink-0 pointer-events-none">
            <IlustracionTarpuy
              id={appMode === "avanzado" ? "lupa" : "mano_toca"}
              size={22}
            />
          </span>
          <select
            aria-label={esQuechua ? "Qhaway akllay" : "Seleccionar modo de pantalla"}
            value={appMode}
            onChange={(e) => onChangeAppMode?.(e.target.value)}
            className="w-full bg-transparent font-bold pr-5 py-1 appearance-none cursor-pointer focus:outline-none"
            style={{
              color: "var(--tinta)",
              fontSize: "clamp(0.95rem, 3.8vw, 1.05rem)",
            }}
          >
            <option value="facil">
              {esQuechua ? "Llampu (Fácil)" : "Modo Fácil"}
            </option>
            <option value="avanzado">
              {esQuechua ? "Sut'i (Avanzado)" : "Avanzado"}
            </option>
          </select>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="absolute right-2.5 pointer-events-none shrink-0"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="var(--tinta)"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </label>
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

          <button
            type="button"
            onClick={() => setMostrarPanelOffline((v) => !v)}
            className="min-h-[64px] px-4 py-2 rounded-2xl inline-flex items-center gap-2 cursor-pointer transition-all"
            style={{
              backgroundColor: "var(--cielo-suave)",
              color: "var(--tinta)",
              border: "1.5px solid var(--tinta)",
            }}
            title="Estado de conexión y copia local"
          >
            <IlustracionTarpuy id="antena_ondas" size={26} />
            <span className="text-base font-bold">
              {onlineActive
                ? esQuechua
                  ? "Waqaychasqa"
                  : "Copia guardada"
                : esQuechua
                ? "Mana internetwan llamk'achkan"
                : "Sin internet · activo"}
            </span>
          </button>
        </div>

        {/* Fila de botones grandes (>= 64 px, separación 12 px) para Idioma (Castellano/Runasimi) y Modo (Fácil/Avanzado) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              id: "es",
              tipo: "idioma",
              nombre: "Castellano",
              dibujoId: "altavoz",
              activo: voiceLang === "es",
              bgActivo: "var(--dorado-suave)",
              onClick: () => onChangeVoiceLang?.("es"),
            },
            {
              id: "qu",
              tipo: "idioma",
              nombre: "Runasimi",
              dibujoId: "altavoz",
              activo: voiceLang === "qu",
              bgActivo: "var(--dorado-suave)",
              onClick: () => onChangeVoiceLang?.("qu"),
            },
            {
              id: "facil",
              tipo: "modo",
              nombre: esQuechua ? "Llampu (Fácil)" : "Modo Fácil",
              dibujoId: "mano_toca",
              activo: appMode === "facil",
              bgActivo: "var(--hoja-suave)",
              onClick: () => onChangeAppMode?.("facil"),
            },
            {
              id: "avanzado",
              tipo: "modo",
              nombre: esQuechua ? "Sut'i (Avanzado)" : "Avanzado",
              dibujoId: "lupa",
              activo: appMode === "avanzado",
              bgActivo: "var(--hoja-suave)",
              onClick: () => onChangeAppMode?.("avanzado"),
            },
          ].map((btn) => (
            <button
              key={`${btn.tipo}_${btn.id}`}
              type="button"
              onClick={btn.onClick}
              aria-pressed={btn.activo}
              className="min-h-[64px] px-3 py-2 rounded-2xl inline-flex items-center justify-center gap-2 cursor-pointer transition-all text-center"
              style={{
                backgroundColor: btn.activo ? btn.bgActivo : "var(--arena)",
                color: "var(--tinta)",
                border: btn.activo ? "2px solid var(--tinta)" : "1.5px solid var(--piedra)",
                boxShadow: btn.activo ? "0 3px 0 var(--tinta)" : "none",
                fontWeight: 700,
                fontSize: "clamp(0.95rem, 3.8vw, 1.08rem)",
              }}
            >
              <IlustracionTarpuy id={btn.dibujoId} size={22} />
              <span className="leading-tight break-words">{btn.nombre}</span>
              {btn.activo && <CheckSimple size={18} />}
            </button>
          ))}
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
      {mostrarPanelOffline && (
        <div
          className="rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3"
          style={{
            backgroundColor: "var(--cielo-suave)",
            border: "1.5px solid var(--tinta)",
          }}
        >
          <div className="space-y-0.5">
            <p className="font-bold text-lg" style={{ color: "var(--tinta)" }}>
              {esQuechua
                ? "Mana internet kaptinpas llamk'allanpuni"
                : "Sin internet: todo sigue funcionando"}
            </p>
            <p className="text-base font-normal" style={{ color: "var(--tinta-suave)" }}>
              {dbStats?.updatedAt
                ? `Autoguardado local (${dbStats.sizeKb} KB)`
                : syncStatus || tr(voiceLang, "autoSaveDefault")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onToggleOffline}
              className="tarpuy-btn-physical tarpuy-btn-physical--secondary flex-1 sm:flex-initial px-4 py-2 text-base font-bold cursor-pointer"
              style={{ minHeight: "64px" }}
            >
              {onlineActive
                ? esQuechua
                  ? "Internetwan · Mana internetta qhaway"
                  : "Probar modo sin internet"
                : esQuechua
                ? "Internetman kutiy"
                : "Volver a conectar"}
            </button>

            <button
              type="button"
              onClick={onDownloadBundle}
              className="tarpuy-btn-physical tarpuy-btn-physical--secondary flex-1 sm:flex-initial px-4 py-2 text-base font-bold cursor-pointer"
              style={{ minHeight: "64px" }}
            >
              {tr(voiceLang, "refreshCopy")} {dbStats?.sizeKb ? `(${dbStats.sizeKb} KB)` : ""}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
