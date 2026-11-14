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

  /* En Modo Fácil se muestran Clima, Siembra y Mapa; en Avanzado se suma Datos */
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
                  <span
                    className="rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      width: activa ? "52px" : "44px",
                      height: activa ? "52px" : "44px",
                      backgroundColor: "var(--tarjeta)",
                    }}
                  >
                    <IlustracionTarpuy
                      id={ilustracionId}
                      size={activa ? 42 : 34}
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
       * 2. BARRA INFERIOR FIJA EN CELULAR (Sin flechitas internas ni cortes)
       * ===================================================================== */}
      <nav
        aria-label="Navegación inferior móvil"
        className={`lg:hidden fixed bottom-0 inset-x-0 z-40 grid gap-2 px-2.5 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] ${
          visibleNavItems.length === 3 ? "grid-cols-3" : "grid-cols-4"
        }`}
        style={{
          backgroundColor: "var(--tinta)",
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
              className="flex flex-col items-center justify-center gap-1 px-2 py-2 cursor-pointer transition-all"
              style={{
                minHeight: "76px",
                backgroundColor: activa ? "var(--dorado)" : "var(--tinta-suave)",
                color: activa ? "var(--tinta)" : "var(--tarjeta)",
                border: activa ? "2px solid var(--tarjeta)" : "1px solid transparent",
                borderRadius: "var(--radius-btn)",
              }}
            >
              <span
                className="rounded-xl flex items-center justify-center shrink-0"
                style={{
                  width: activa ? "42px" : "36px",
                  height: activa ? "42px" : "36px",
                  backgroundColor: "var(--tarjeta)",
                }}
              >
                <IlustracionTarpuy id={ilustracionId} size={activa ? 34 : 28} />
              </span>
              <span
                className={activa ? "font-bold leading-tight" : "font-medium leading-tight"}
                style={{ fontSize: "1.05rem", whiteSpace: "nowrap" }}
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
      className="no-print w-full px-4 sm:px-8 pt-4 pb-2 max-w-5xl mx-auto space-y-3"
    >
      {/* En celular/tablet: logos + casita de inicio + altavoz */}
      <div className="lg:hidden flex items-center justify-between gap-2 pb-2">
        <EtiquetaLogo>
          <img
            src="/logos/nasa-space-apps.png"
            alt="NASA International Space Apps Challenge"
            className="h-8 w-auto object-contain"
          />
          <span
            className="h-6 w-px"
            style={{ backgroundColor: "var(--piedra)" }}
            aria-hidden="true"
          />
          <img
            src="/logos/alcaldia-cochabamba-escudo.jpg"
            alt="Alcaldía de Cochabamba"
            className="h-8 w-auto object-contain"
          />
        </EtiquetaLogo>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => irDirectoASeccion(onChangeView, "clima")}
            aria-label={esQuechua ? "Qallariyman kutiy" : "Ir al inicio"}
            title={esQuechua ? "Qallariyman kutiy" : "Ir al inicio"}
            className="tarpuy-btn-physical tarpuy-btn-physical--secondary w-14 h-14 flex items-center justify-center cursor-pointer"
          >
            <IlustracionTarpuy id="casa" size={32} />
          </button>

          <BotonAltavoz
            sonando={isSpeaking}
            mostrarTexto={false}
            onClick={isSpeaking ? onStopAudio : onSpeakGuide}
          />
        </div>
      </div>

      {/* Barra única tranquila con los 4 controles esenciales en orden: (a) Comunidad/GPS, (b) Idioma, (c) Modo, (d) Sin internet */}
      <div
        className="rounded-3xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3"
        style={{
          backgroundColor: "var(--tarjeta)",
          border: "1px solid color-mix(in srgb, var(--piedra) 35%, transparent)",
        }}
      >
        {/* (a) Comunidad actual + botón GPS */}
        <div className="flex flex-wrap items-center gap-2.5">
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
              <span className="block text-xs font-normal" style={{ color: "var(--tinta-suave)" }}>
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
            className="tarpuy-btn-physical tarpuy-btn-physical--secondary inline-flex items-center gap-2 px-3.5 py-2 cursor-pointer"
            style={{ minHeight: "64px" }}
            title={tr(voiceLang, "detectGps")}
          >
            <IlustracionTarpuy id="mapa_chacra" size={28} />
            <span className="font-bold text-base">
              {esQuechua ? "GPS tariy" : "Mi GPS"}
            </span>
          </button>
        </div>

        {/* (b) Idioma: Castellano / Runasimi */}
        <div
          className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl"
          style={{ backgroundColor: "var(--arena)" }}
          role="group"
          aria-label="Idioma de lectura y voz"
        >
          {[
            { id: "es", nombre: "Castellano" },
            { id: "qu", nombre: "Runasimi" },
          ].map((idioma) => {
            const activo = voiceLang === idioma.id;
            return (
              <button
                key={idioma.id}
                type="button"
                onClick={() => onChangeVoiceLang?.(idioma.id)}
                aria-pressed={activo}
                className="min-h-[52px] px-3.5 py-2 rounded-xl inline-flex items-center gap-2 cursor-pointer transition-all"
                style={{
                  backgroundColor: activo ? "var(--dorado-suave)" : "transparent",
                  color: "var(--tinta)",
                  border: activo ? "2px solid var(--tinta)" : "1px solid transparent",
                  fontWeight: activo ? 700 : 500,
                  fontSize: "1.05rem",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{idioma.nombre}</span>
                {activo && <CheckSimple size={18} />}
              </button>
            );
          })}
        </div>

        {/* (c) Modo: Fácil / Avanzado */}
        <div
          className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl"
          style={{ backgroundColor: "var(--arena)" }}
          role="group"
          aria-label="Modo de pantalla"
        >
          {[
            { id: "facil", nombre: "Fácil", dibujoId: "mano_toca" },
            { id: "avanzado", nombre: "Avanzado", dibujoId: "lupa" },
          ].map((m) => {
            const activo = appMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onChangeAppMode?.(m.id)}
                aria-pressed={activo}
                className="min-h-[52px] px-3.5 py-2 rounded-xl inline-flex items-center gap-2 cursor-pointer transition-all"
                style={{
                  backgroundColor: activo ? "var(--hoja-suave)" : "transparent",
                  color: "var(--tinta)",
                  border: activo ? "2px solid var(--tinta)" : "1px solid transparent",
                  fontWeight: activo ? 700 : 500,
                  fontSize: "1.05rem",
                  whiteSpace: "nowrap",
                }}
              >
                <IlustracionTarpuy id={m.dibujoId} size={24} />
                <span>{m.nombre}</span>
                {activo && <CheckSimple size={18} />}
              </button>
            );
          })}
        </div>

        {/* (d) Estado sin internet tranquilo */}
        <button
          type="button"
          onClick={() => setMostrarPanelOffline((v) => !v)}
          className="min-h-[52px] px-3.5 py-2 rounded-2xl inline-flex items-center gap-2 cursor-pointer transition-all"
          style={{
            backgroundColor: "var(--cielo-suave)",
            color: "var(--tinta)",
            border: "1px solid color-mix(in srgb, var(--tinta) 25%, transparent)",
          }}
          title="Estado de conexión y copia local"
        >
          <IlustracionTarpuy id="antena_ondas" size={26} />
          <span className="text-sm font-medium">
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

      {/* Panel desplegable para buscar otra comunidad cuando se toca el botón de comunidad */}
      {mostrarBuscador && (
        <div
          className="rounded-3xl p-4 space-y-2"
          style={{
            backgroundColor: "var(--tarjeta)",
            border: "1px solid color-mix(in srgb, var(--piedra) 45%, transparent)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-base" style={{ color: "var(--tinta)" }}>
              {esQuechua ? "Aylluykita maskhay:" : "Busca y elige tu comunidad:"}
            </span>
            <button
              type="button"
              onClick={() => setMostrarBuscador(false)}
              className="text-sm font-bold underline cursor-pointer px-2 py-1"
              style={{ color: "var(--tinta-suave)" }}
            >
              {esQuechua ? "Wichq'ay" : "Cerrar"}
            </button>
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
            border: "1px solid color-mix(in srgb, var(--tinta) 25%, transparent)",
          }}
        >
          <div className="space-y-0.5">
            <p className="font-bold text-base" style={{ color: "var(--tinta)" }}>
              {esQuechua
                ? "Mana internet kaptinpas llamk'allanpuni"
                : "Sin internet: todo sigue funcionando"}
            </p>
            <p className="text-sm font-normal" style={{ color: "var(--tinta-suave)" }}>
              {dbStats?.updatedAt
                ? `Autoguardado local (${dbStats.sizeKb} KB)`
                : syncStatus || tr(voiceLang, "autoSaveDefault")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleOffline}
              className="tarpuy-btn-physical tarpuy-btn-physical--secondary px-4 py-2 text-base font-bold cursor-pointer"
              style={{ minHeight: "56px" }}
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
              className="tarpuy-btn-physical tarpuy-btn-physical--secondary px-4 py-2 text-base font-bold cursor-pointer"
              style={{ minHeight: "56px" }}
            >
              {tr(voiceLang, "refreshCopy")} {dbStats?.sizeKb ? `(${dbStats.sizeKb} KB)` : ""}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
