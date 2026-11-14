import React, { useState } from "react";
import CommunitySearchCombobox from "../ui/CommunitySearchCombobox.jsx";
import { EtiquetaLogo, BotonAltavoz } from "../ui/TarpuyBaseComponents.jsx";
import { IlustracionTarpuy } from "../illustrations/TarpuyIllustrations.jsx";
import { tr } from "../../utils/quechuaI18n.js";

/**
 * TARPUY NASA COCHABAMBA — NAVEGACIÓN PRINCIPAL Y CABECERA (FASE 2)
 * =================================================================
 * Objetivo: que alguien que nunca usó una computadora sepa en 3 segundos
 * dónde está, cómo moverse y cómo volver.
 *
 * - 4 Pestañas grandes con dibujo + UNA palabra:
 *   Clima (nube con sol), Siembra (mano que siembra), Mapa (chacra con camino),
 *   Datos (cartilla con gráfico).
 * - Pestaña activa: relleno --dorado, borde grueso --tinta, dibujo más grande
 *   y flechita dibujada a mano (nunca solo por color).
 * - Ubicación: barra inferior fija en celular; barra lateral en pantalla grande.
 *   Fondo en --tinta con dibujos y letras claras (--tarjeta).
 * - Logos: NASA Space Apps Challenge y Alcaldía de Cochabamba siempre visibles
 *   arriba, juntos, en su etiqueta crema (--tarjeta).
 * - Cabecera simple en orden fijo:
 *   (a) Comunidad y GPS, (b) Idioma, (c) Modo, (d) Estado sin internet.
 * - Botón "Inicio" siempre visible con dibujo de casa.
 * - Cero códigos hexadecimales sueltos.
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

/* Check dibujado a mano para indicar opción activa (Idioma, Modo) */
function CheckDibujado({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle
        cx="14"
        cy="14"
        r="12"
        fill="var(--hoja-oscura)"
        stroke="var(--tinta)"
        strokeWidth="2.4"
      />
      <path
        d="M8.5 14.5L12.5 18.5L19.5 10"
        stroke="var(--tarjeta)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Flechita dibujada a mano que acompaña a la pestaña activa */
function FlechitaPestanaActiva({ direccion = "derecha" }) {
  const rotation =
    direccion === "arriba" ? "-rotate-90" : direccion === "abajo" ? "rotate-90" : "";
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${rotation}`}
    >
      <path
        d="M4 12H19M13 6L19 12L13 18"
        stroke="var(--tinta)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
  const [mostrarBuscadorComunidad, setMostrarBuscadorComunidad] = useState(false);

  const onlineActive = !forceOffline && isOnline;
  const esQuechua = voiceLang === "qu";

  /* 10. Modo Fácil: mantiene el comportamiento actual de la pestaña Datos (oculta en Modo Fácil) */
  const visibleNavItems =
    appMode === "avanzado" ? NAV_ITEMS : NAV_ITEMS.filter((i) => i.id !== "datos");

  return (
    <>
      {/* =====================================================================
       * 1. BARRA LATERAL EN PANTALLA GRANDE (Fondo en --tinta, letras claras)
       * ===================================================================== */}
      <aside
        aria-label="Navegación principal"
        className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 lg:shrink-0 min-h-screen sticky top-0 max-h-screen justify-between p-5 select-none overflow-y-auto"
        style={{
          backgroundColor: "var(--tinta)",
          color: "var(--tarjeta)",
          borderRight: "var(--border-width-thick) solid var(--tinta)",
        }}
      >
        <div className="space-y-5">
          {/* 3. LOGOS: siempre visibles arriba, juntos, en su etiqueta crema */}
          <div
            className="space-y-3 pb-4"
            style={{ borderBottom: "2px solid var(--tinta-suave)" }}
          >
            <EtiquetaLogo className="w-full justify-center">
              <img
                src="/logos/nasa-space-apps.png"
                alt="NASA International Space Apps Challenge"
                className="h-10 w-auto object-contain"
              />
              <span
                className="h-7 w-0.5"
                style={{ backgroundColor: "var(--piedra)" }}
                aria-hidden="true"
              />
              <img
                src="/logos/alcaldia-cochabamba-escudo.jpg"
                alt="Alcaldía de Cochabamba"
                className="h-10 w-auto object-contain"
              />
            </EtiquetaLogo>

            <div className="px-1">
              <h1
                className="font-extrabold tracking-tight leading-tight"
                style={{ color: "var(--tarjeta)", fontSize: "1.35rem" }}
              >
                Tarpuy Cochabamba
              </h1>
              <p className="text-base font-bold" style={{ color: "var(--arena)" }}>
                {tr(voiceLang, "subtitle")}
              </p>
            </div>
          </div>

          {/* 9. BOTÓN "INICIO" VISIBLE CON DIBUJO DE CASA */}
          <button
            type="button"
            onClick={() => onChangeView?.("clima")}
            aria-label={esQuechua ? "Qallariyman kutiy" : "Volver a Inicio"}
            className="tarpuy-btn-physical w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer"
            style={{
              minHeight: "var(--size-btn-min-h)",
              backgroundColor: activeView === "clima" ? "var(--arena)" : "var(--tarjeta)",
              color: "var(--tinta)",
              borderColor: "var(--tarjeta)",
            }}
          >
            <span className="flex items-center gap-3">
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "var(--dorado-suave)",
                  border: "2px solid var(--tinta)",
                }}
              >
                <IlustracionTarpuy id="casa" size={34} />
              </span>
              <span className="font-extrabold text-xl">
                {esQuechua ? "Qallariy" : "Inicio"}
              </span>
            </span>
            <span
              className="text-xs font-extrabold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: "var(--arena)",
                color: "var(--tinta)",
                border: "1.5px solid var(--tinta)",
              }}
            >
              {esQuechua ? "Wasiman" : "Ir arriba"}
            </span>
          </button>

          {/* 1. LAS 4 PESTAÑAS GRANDES (Dibujo + UNA palabra; activa en --dorado + más grande + flechita) */}
          <nav aria-label={tr(voiceLang, "sections")} className="space-y-3.5 pt-1">
            <span
              className="block text-sm font-extrabold uppercase tracking-wider px-1"
              style={{ color: "var(--arena)" }}
            >
              {esQuechua ? "¿Mayman riyta munanki?" : "¿Qué quieres ver hoy?"}
            </span>

            {visibleNavItems.map(({ id, ilustracionId, palabraEs, palabraQu }) => {
              const activa = activeView === id;
              const palabra = esQuechua ? palabraQu : palabraEs;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChangeView?.(id)}
                  aria-current={activa ? "page" : undefined}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer transition-transform ${
                    activa ? "scale-[1.02]" : ""
                  }`}
                  style={{
                    minHeight: activa ? "84px" : "72px",
                    backgroundColor: activa ? "var(--dorado)" : "var(--tinta-suave)",
                    color: activa ? "var(--tinta)" : "var(--tarjeta)",
                    border: activa
                      ? "var(--border-width-thick) solid var(--tarjeta)"
                      : "var(--border-width-medium) solid var(--piedra)",
                    borderRadius: "var(--radius-btn)",
                    boxShadow: activa ? "0 5px 0 var(--tarjeta)" : "0 3px 0 var(--tinta)",
                  }}
                >
                  <span className="flex items-center gap-3.5 min-w-0">
                    <span
                      className="rounded-2xl flex items-center justify-center shrink-0 transition-all"
                      style={{
                        width: activa ? "60px" : "48px",
                        height: activa ? "60px" : "48px",
                        backgroundColor: "var(--tarjeta)",
                        border: "var(--border-width-medium) solid var(--tinta)",
                      }}
                    >
                      <IlustracionTarpuy
                        id={ilustracionId}
                        size={activa ? 50 : 36}
                      />
                    </span>
                    <span
                      className="font-extrabold tracking-tight"
                      style={{ fontSize: activa ? "1.35rem" : "1.2rem" }}
                    >
                      {palabra}
                    </span>
                  </span>

                  {/* Flechita visible en la pestaña activa */}
                  {activa ? (
                    <span
                      className="inline-flex items-center justify-center px-2 py-1 rounded-full shrink-0"
                      style={{
                        backgroundColor: "var(--tarjeta)",
                        color: "var(--tinta)",
                        border: "2px solid var(--tinta)",
                      }}
                    >
                      <FlechitaPestanaActiva direccion="derecha" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Botón grande de Altavoz al pie de la barra lateral */}
        <div
          className="pt-4 mt-4 flex flex-col items-center gap-2"
          style={{ borderTop: "2px solid var(--tinta-suave)" }}
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
       * 2. BARRA INFERIOR FIJA EN CELULAR (Fondo en --tinta, al alcance del pulgar)
       * ===================================================================== */}
      <nav
        aria-label="Pestañas principales"
        className={`lg:hidden fixed bottom-0 inset-x-0 z-40 grid gap-2 px-2.5 py-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom))] ${
          visibleNavItems.length === 3 ? "grid-cols-3" : "grid-cols-4"
        }`}
        style={{
          backgroundColor: "var(--tinta)",
          borderTop: "var(--border-width-thick) solid var(--tinta)",
        }}
      >
        {visibleNavItems.map(({ id, ilustracionId, palabraEs, palabraQu }) => {
          const activa = activeView === id;
          const palabra = esQuechua ? palabraQu : palabraEs;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChangeView?.(id)}
              aria-current={activa ? "page" : undefined}
              className="flex flex-col items-center justify-center gap-1 px-2 py-2 cursor-pointer transition-transform"
              style={{
                minHeight: "82px",
                backgroundColor: activa ? "var(--dorado)" : "var(--tinta-suave)",
                color: activa ? "var(--tinta)" : "var(--tarjeta)",
                border: activa
                  ? "var(--border-width-thick) solid var(--tarjeta)"
                  : "var(--border-width-medium) solid var(--piedra)",
                borderRadius: "var(--radius-btn)",
              }}
            >
              <span className="flex items-center gap-1">
                <span
                  className="rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    width: activa ? "46px" : "36px",
                    height: activa ? "46px" : "36px",
                    backgroundColor: "var(--tarjeta)",
                    border: "2px solid var(--tinta)",
                  }}
                >
                  <IlustracionTarpuy id={ilustracionId} size={activa ? 38 : 28} />
                </span>
                {activa && <FlechitaPestanaActiva direccion="arriba" />}
              </span>
              <span
                className="font-extrabold leading-tight"
                style={{ fontSize: activa ? "1.15rem" : "1rem" }}
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
 * 4. CABECERA SIMPLE CON ORDEN FIJO:
 *    (a) Comunidad y GPS
 *    (b) Idioma ("Castellano" y "Runasimi", sin siglas ES/QU ni banderas, activo con check)
 *    (c) Modo ("Fácil" con mano y "Avanzado" con lupa + 1 línea de explicación)
 *    (d) Estado sin internet (dibujo de antena con ondas + "Sin internet: todo sigue funcionando", sin rojo)
 *    Además incluye en la franja superior los 2 Logos en su etiqueta crema (para móvil e impresión)
 *    y el botón visible "Inicio" con dibujo de casa.
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
  const onlineActive = !forceOffline && isOnline;
  const esQuechua = voiceLang === "qu";

  const explicacionModo =
    appMode === "facil"
      ? esQuechua
        ? "Jatun rikch'aykuna, mana sasa simikunachu."
        : "Con dibujos grandes y sin palabras difíciles."
      : esQuechua
      ? "Satélite nisqamanta t'aqwisqa willaykuna."
      : "Con gráficos y datos técnicos del satélite.";

  return (
    <header
      data-zona={zoneId}
      className="producer-header w-full px-4 sm:px-8 pt-4 pb-2 space-y-4 max-w-5xl mx-auto"
    >
      {/* Franja superior: Logos en su etiqueta crema + Botón Inicio + Altavoz */}
      <div className="tarpuy-card-physical p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <EtiquetaLogo>
            <img
              src="/logos/nasa-space-apps.png"
              alt="NASA International Space Apps Challenge"
              className="h-9 sm:h-10 w-auto object-contain"
            />
            <span
              className="h-7 w-0.5"
              style={{ backgroundColor: "var(--piedra)" }}
              aria-hidden="true"
            />
            <img
              src="/logos/alcaldia-cochabamba-escudo.jpg"
              alt="Alcaldía de Cochabamba"
              className="h-9 sm:h-10 w-auto object-contain"
            />
          </EtiquetaLogo>

          <div>
            <span
              className="block font-extrabold leading-tight"
              style={{ color: "var(--tinta)", fontSize: "var(--font-size-body)" }}
            >
              Tarpuy Cochabamba
            </span>
            <span className="text-sm font-bold" style={{ color: "var(--tinta-suave)" }}>
              {tr(voiceLang, "subtitle")}
            </span>
          </div>
        </div>

        {/* 9. BOTÓN "INICIO" VISIBLE CON DIBUJO DE CASA + BOTÓN DE ALTAVOZ */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onChangeView?.("clima")}
            className="tarpuy-btn-physical tarpuy-btn-physical--secondary inline-flex items-center gap-3 px-5 py-2.5 cursor-pointer"
          >
            <span
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "var(--tarjeta)",
                border: "var(--border-width-medium) solid var(--tinta)",
              }}
            >
              <IlustracionTarpuy id="casa" size={34} />
            </span>
            <span className="font-extrabold" style={{ fontSize: "var(--font-size-body)" }}>
              {esQuechua ? "Qallariy" : "Inicio"}
            </span>
          </button>

          <BotonAltavoz
            sonando={isSpeaking}
            mostrarTexto={true}
            etiqueta={esQuechua ? "Uyariy" : "Escuchar"}
            onClick={isSpeaking ? onStopAudio : onSpeakGuide}
          />
        </div>
      </div>

      {/* 4. LOS 4 BLOQUES EN ORDEN ESTRICTO: (a) Comunidad y GPS, (b) Idioma, (c) Modo, (d) Sin internet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* (a) COMUNIDAD Y GPS: Botón grande con dibujo de pin y "Estás en: Punata", con acento de zona */}
        <div
          className="tarpuy-card-physical p-4 flex flex-col justify-between gap-3"
          style={{
            backgroundColor: "var(--acento-zona-suave)",
            borderColor: "var(--tinta)",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full"
              style={{
                backgroundColor: "var(--tarjeta)",
                color: "var(--acento-zona-oscuro)",
                border: "1.5px solid var(--tinta)",
              }}
            >
              <span
                className="w-3.5 h-3.5 rounded-full inline-block"
                style={{
                  backgroundColor: "var(--acento-zona)",
                  border: "1.5px solid var(--tinta)",
                }}
                aria-hidden="true"
              />
              <span>{esQuechua ? "Llaqtayki" : "Tu comunidad"}</span>
            </span>

            <button
              type="button"
              onClick={() => setMostrarBuscador((v) => !v)}
              className="text-sm font-extrabold underline cursor-pointer px-2 py-1"
              style={{ color: "var(--tinta)" }}
            >
              {mostrarBuscador
                ? esQuechua
                  ? "Wichq'ay"
                  : "Cerrar lista"
                : esQuechua
                ? "Llaqtata t'ikray"
                : "Cambiar pueblo"}
            </button>
          </div>

          {/* Botón principal grande con dibujo de pin y "Estás en: Punata" */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <button
              type="button"
              onClick={() => setMostrarBuscador((v) => !v)}
              className="tarpuy-btn-physical flex-1 inline-flex items-center gap-3.5 px-4 py-3 text-left cursor-pointer"
              style={{
                backgroundColor: "var(--tarjeta)",
                color: "var(--tinta)",
              }}
            >
              <span
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "var(--acento-zona-suave)",
                  border: "var(--border-width-medium) solid var(--tinta)",
                }}
              >
                <IlustracionTarpuy id="pin_ubicacion" size={38} />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold" style={{ color: "var(--tinta-suave)" }}>
                  {esQuechua ? "Kaypi kachkanki:" : "Estás en:"}
                </span>
                <span className="block font-extrabold text-xl">
                  {selectedCommunityName}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={onDetectGps}
              className="tarpuy-btn-physical tarpuy-btn-physical--secondary inline-flex items-center justify-center gap-2.5 px-4 py-3 cursor-pointer shrink-0"
            >
              <IlustracionTarpuy id="mapa_chacra" size={34} />
              <span className="font-extrabold">
                {esQuechua ? "GPS tariy" : "Usar mi GPS"}
              </span>
            </button>
          </div>

          {mostrarBuscador && (
            <div className="pt-1">
              <CommunitySearchCombobox
                selectedZoneId={zoneId}
                selectedCommunityName={selectedCommunityName}
                onSelectCommunity={(comm) => {
                  onSelectCommunity?.(comm);
                  setMostrarBuscador(false);
                }}
                variant="header"
              />
            </div>
          )}
        </div>

        {/* (b) IDIOMA: Dos botones grandes "Castellano" y "Runasimi", sin siglas ES/QU ni banderas */}
        <div className="tarpuy-card-physical p-4 flex flex-col justify-between gap-3">
          <span
            className="block text-sm font-extrabold uppercase tracking-wider"
            style={{ color: "var(--tinta-suave)" }}
          >
            {esQuechua ? "Simi (Idioma)" : "Idioma de lectura y voz"}
          </span>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "es", nombre: "Castellano", dibujo: "altavoz" },
              { id: "qu", nombre: "Runasimi", dibujo: "altavoz" },
            ].map((idioma) => {
              const activo = voiceLang === idioma.id;
              return (
                <button
                  key={idioma.id}
                  type="button"
                  onClick={() => onChangeVoiceLang?.(idioma.id)}
                  aria-pressed={activo}
                  className={`tarpuy-btn-physical ${
                    activo ? "tarpuy-btn-physical--pressed" : ""
                  } flex items-center justify-between gap-2 px-4 py-3 cursor-pointer`}
                  style={{
                    backgroundColor: activo ? "var(--dorado-suave)" : "var(--arena)",
                    color: "var(--tinta)",
                  }}
                >
                  <span className="font-extrabold text-lg sm:text-xl">{idioma.nombre}</span>
                  {activo ? (
                    <CheckDibujado size={26} />
                  ) : (
                    <span
                      className="w-6 h-6 rounded-full inline-block shrink-0"
                      style={{
                        backgroundColor: "var(--tarjeta)",
                        border: "2px solid var(--tinta)",
                      }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* (c) MODO: "Fácil" (dibujo de mano) y "Avanzado" (dibujo de lupa), con 1 línea de explicación */}
        <div className="tarpuy-card-physical p-4 flex flex-col justify-between gap-3">
          <span
            className="block text-sm font-extrabold uppercase tracking-wider"
            style={{ color: "var(--tinta-suave)" }}
          >
            {esQuechua ? "Imayna rikuy (Modo)" : "Modo de pantalla"}
          </span>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: "facil",
                nombre: esQuechua ? "Fácil" : "Fácil",
                dibujoId: "mano_toca",
              },
              {
                id: "avanzado",
                nombre: esQuechua ? "Avanzado" : "Avanzado",
                dibujoId: "lupa",
              },
            ].map((m) => {
              const activo = appMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChangeAppMode?.(m.id)}
                  aria-pressed={activo}
                  className={`tarpuy-btn-physical ${
                    activo ? "tarpuy-btn-physical--pressed" : ""
                  } flex items-center justify-between gap-2 px-3.5 py-2.5 cursor-pointer`}
                  style={{
                    backgroundColor: activo ? "var(--hoja-suave)" : "var(--arena)",
                    color: "var(--tinta)",
                  }}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: "var(--tarjeta)",
                        border: "2px solid var(--tinta)",
                      }}
                    >
                      <IlustracionTarpuy id={m.dibujoId} size={30} />
                    </span>
                    <span className="font-extrabold text-base sm:text-lg">
                      {m.nombre}
                    </span>
                  </span>
                  {activo && <CheckDibujado size={22} />}
                </button>
              );
            })}
          </div>

          <p className="text-base font-bold leading-snug" style={{ color: "var(--tinta)" }}>
            {explicacionModo}
          </p>
        </div>

        {/* (d) SIN INTERNET: dibujo simple (antena con ondas) y frase tranquila, sin rojo */}
        <div
          className="tarpuy-card-physical p-4 flex flex-col justify-between gap-3"
          style={{
            backgroundColor: onlineActive ? "var(--cielo-suave)" : "var(--hoja-suave)",
          }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "var(--tarjeta)",
                border: "var(--border-width-medium) solid var(--tinta)",
              }}
            >
              <IlustracionTarpuy id="antena_ondas" size={44} />
            </div>

            <div className="space-y-0.5 text-left">
              <p className="font-extrabold leading-snug" style={{ fontSize: "var(--font-size-body-min)" }}>
                {esQuechua
                  ? "Mana internet kaptinpis: tukuy ima llamk'ashallan"
                  : "Sin internet: todo sigue funcionando"}
              </p>
              <p className="text-sm font-bold" style={{ color: "var(--tinta-suave)" }}>
                {syncStatus || tr(voiceLang, "autoSaveDefault")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onToggleOffline}
              className="tarpuy-btn-physical tarpuy-btn-physical--secondary flex-1 px-3.5 py-2 text-sm font-extrabold cursor-pointer"
              style={{ minHeight: "54px" }}
            >
              {onlineActive
                ? esQuechua
                  ? "Internetwan (Mana señalwan qhaway)"
                  : "Con señal · Probar sin internet"
                : esQuechua
                ? "Mana internetwan · Señalwan tinkiy"
                : "Usando copia guardada · Conectar"}
            </button>

            <button
              type="button"
              onClick={onDownloadBundle}
              className="tarpuy-btn-physical tarpuy-btn-physical--secondary px-3.5 py-2 text-sm font-extrabold cursor-pointer"
              style={{ minHeight: "54px" }}
            >
              {tr(voiceLang, "refreshCopy")} ({dbStats?.sizeKb ? `${dbStats.sizeKb} KB` : cachedCount})
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
