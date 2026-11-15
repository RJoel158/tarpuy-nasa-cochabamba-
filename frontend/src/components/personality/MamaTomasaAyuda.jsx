import React, { useState, useEffect, useRef } from "react";
import { PersonajeGuia } from "./PersonajeGuia.jsx";
import { IlustracionTarpuy } from "../illustrations/TarpuyIllustrations.jsx";
import { WeatherIllustration } from "../alerts/WeatherPictograms.jsx";
import { CropIllustration } from "../../features/producer/FarmPictograms.jsx";
import { BotonAltavoz } from "../ui/TarpuyBaseComponents.jsx";
import { tr } from "../../utils/quechuaI18n.js";

/**
 * VENTANA EMERGENTE DE MAMÁ TOMASA CON SEMÁFORO Y EXPRESIONES DE FASE 1 (`MamaTomasaAyuda`)
 * =========================================================================================
 * - Títulos completos sin cortar (sin `truncate`).
 * - Semáforo visual claro con los colores de `tokens.css`:
 *   - VERDE (`verde` / `tranquilo`): `--alerta-tranquilo` (`--hoja`) + `--alerta-tranquilo-suave` -> "BIEN"
 *   - AMARILLO (`amarillo` / `cuidado`): `--alerta-cuidado` (`--dorado`) + `--alerta-cuidado-suave` -> "CUIDADO"
 *   - ROJO (`rojo` / `peligro` / `critico`): `--alerta-critico` + `--alerta-critico-suave` -> "PELIGRO"
 * - Expresiones de Mamá Tomasa de la Fase 1 (`saludo`, `alerta`, `siembra`, `riego`, `cosecha`,
 *   `mapa`, `pensando`, `despedida`) sincronizadas con el semáforo y con cada tarjeta.
 * - Textos cortos y directos para personas con poca experiencia digital.
 */

function IconoCerrarDibujado({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M8 8L24 24M24 8L8 24"
        stroke="var(--tinta)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Normaliza cualquier valor de tono/semáforo a 'verde' | 'amarillo' | 'rojo' */
function normalizarSemaforo(valor = "verde", pose = "saludo") {
  const v = String(valor || "").toLowerCase();
  if (v === "rojo" || v === "critico" || v === "peligro" || v === "red" || v === "critical") {
    return "rojo";
  }
  if (v === "amarillo" || v === "cuidado" || v === "yellow" || v === "warning") {
    return "amarillo";
  }
  if (v === "verde" || v === "tranquilo" || v === "bien" || v === "green") {
    return "verde";
  }
  if (pose === "alerta") return "amarillo";
  return "verde";
}

function obtenerConfigSemaforo(nivel = "verde", isQu = false) {
  if (nivel === "rojo") {
    return {
      id: "rojo",
      palabra: isQu ? "MANCHAY (Peligro)" : "PELIGRO",
      palabraCorta: isQu ? "Manchay" : "Peligro",
      simbolo: "!",
      colorFuerte: "var(--alerta-critico)",
      colorSuave: "var(--alerta-critico-suave)",
      colorOscuro: "var(--alerta-critico-oscuro)",
      textoSobreFuerte: "var(--texto-sobre-fuerte)",
      poseDefault: "alerta",
    };
  }
  if (nivel === "amarillo") {
    return {
      id: "amarillo",
      palabra: isQu ? "QHAWARIY (Cuidado)" : "CUIDADO",
      palabraCorta: isQu ? "Qhawariy" : "Cuidado",
      simbolo: "•",
      colorFuerte: "var(--alerta-cuidado)",
      colorSuave: "var(--alerta-cuidado-suave)",
      colorOscuro: "var(--alerta-cuidado-oscuro)",
      textoSobreFuerte: "var(--tinta)",
      poseDefault: "alerta",
    };
  }
  return {
    id: "verde",
    palabra: isQu ? "ALLIN (Bien)" : "BIEN",
    palabraCorta: isQu ? "Allin" : "Bien",
    simbolo: "✓",
    colorFuerte: "var(--alerta-tranquilo)",
    colorSuave: "var(--alerta-tranquilo-suave)",
    colorOscuro: "var(--alerta-tranquilo-oscuro)",
    textoSobreFuerte: "var(--texto-sobre-fuerte)",
    poseDefault: "saludo",
  };
}

const ETIQUETA_EXPRESION_FASE1 = {
  saludo: { es: "Saludo amable", qu: "Allinllachu" },
  alerta: { es: "Aviso de cuidado", qu: "Qhawariy" },
  siembra: { es: "Consejo de siembra", qu: "Tarpuy" },
  riego: { es: "Cuidado del agua", qu: "Yaku" },
  cosecha: { es: "Buena cosecha", qu: "Allin puquy" },
  mapa: { es: "Tu comunidad", qu: "Llaqtayki" },
  pensando: { es: "Saber del campo", qu: "Yachay" },
  despedida: { es: "Todo listo", qu: "Wakichisqa" },
};

/* Barra visual de Semáforo (3 luces: Rojo, Amarillo, Verde) */
function BarraSemaforoVisual({ nivelActivo = "verde", isQu = false }) {
  const info = obtenerConfigSemaforo(nivelActivo, isQu);
  const luces = [
    { id: "verde", color: "var(--alerta-tranquilo)", label: isQu ? "Allin" : "Bien" },
    { id: "amarillo", color: "var(--alerta-cuidado)", label: isQu ? "Qhawariy" : "Cuidado" },
    { id: "rojo", color: "var(--alerta-critico)", label: isQu ? "Manchay" : "Peligro" },
  ];

  return (
    <div
      className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full"
      style={{
        backgroundColor: "var(--tarjeta)",
        border: "1.5px solid var(--tinta)",
      }}
      aria-label={`Semáforo: ${info.palabra}`}
    >
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {luces.map((luz) => {
          const encendida = luz.id === nivelActivo;
          return (
            <span
              key={luz.id}
              className="rounded-full transition-all"
              style={{
                width: encendida ? "20px" : "12px",
                height: encendida ? "20px" : "12px",
                backgroundColor: luz.color,
                opacity: encendida ? 1 : 0.28,
                border: encendida ? "2px solid var(--tinta)" : "1px solid var(--tinta)",
              }}
            />
          );
        })}
      </div>
      <span
        className="font-bold text-sm tracking-wide uppercase"
        style={{ color: "var(--tinta)" }}
      >
        {info.palabra}
      </span>
    </div>
  );
}

export default function MamaTomasaAyuda({
  titulo = "Consejos de Mamá Tomasa",
  pose = "saludo",
  mensaje = "",
  tarjetas = [],
  onListen,
  isSpeaking = false,
  badgeCount = 0,
  tonoAvisoPrincipal = "normal",
  semaforoPrincipal,
  lang = "es",
  abiertoControlado,
  onCambiarAbierto,
}) {
  const [abiertoLocal, setAbiertoLocal] = useState(false);
  const esControlado = typeof abiertoControlado === "boolean";
  const abierto = esControlado ? abiertoControlado : abiertoLocal;

  const setAbierto = (val) => {
    if (esControlado) {
      onCambiarAbierto?.(val);
    } else {
      setAbiertoLocal(val);
      onCambiarAbierto?.(val);
    }
  };

  const triggerBtnRef = useRef(null);
  const closeBtnRef = useRef(null);
  const wasOpenRef = useRef(false);
  const isQu = lang === "qu";

  const nivelPrincipal = normalizarSemaforo(
    semaforoPrincipal || tonoAvisoPrincipal,
    pose
  );
  const semPrincipal = obtenerConfigSemaforo(nivelPrincipal, isQu);
  const expresionInfo =
    ETIQUETA_EXPRESION_FASE1[pose] || ETIQUETA_EXPRESION_FASE1.saludo;

  /* Gestión accesible del foco y tecla Escape */
  useEffect(() => {
    if (abierto) {
      wasOpenRef.current = true;
      const t = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 30);

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setAbierto(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        clearTimeout(t);
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerBtnRef.current?.focus();
    }
  }, [abierto]);

  return (
    <div className="no-print">
      {/* =====================================================================
       * 1. BOTÓN FIJO COMPACTO DE MAMÁ TOMASA
       *    - En móvil: solo el medallón de Mamá Tomasa (64x64 px) con punto de semáforo
       *    - En escritorio: versión compacta y discreta a un costado
       * ===================================================================== */}
      <div className="fixed bottom-[calc(5.2rem+env(safe-area-inset-bottom,0px))] right-3 lg:bottom-5 lg:right-5 z-40">
        <button
          ref={triggerBtnRef}
          type="button"
          onClick={() => setAbierto(!abierto)}
          aria-expanded={abierto}
          aria-haspopup="dialog"
          aria-label={
            isQu
              ? "Mamá Tomasa willasunki. Ñit'iy qhawanapaq"
              : "Mamá Tomasa te cuenta. Toca aquí para abrir el semáforo de consejos"
          }
          className="tarpuy-btn-physical relative flex items-center justify-center lg:justify-start gap-2 w-16 h-16 lg:w-auto lg:h-auto p-1.5 lg:px-3 lg:py-1.5 rounded-full lg:rounded-2xl cursor-pointer text-left"
          style={{
            minHeight: "64px",
            minWidth: "64px",
            backgroundColor: abierto ? "var(--dorado)" : "var(--dorado-suave)",
            color: "var(--tinta)",
            border: "2px solid var(--tinta)",
          }}
        >
          {/* Punto del semáforo arriba a la izquierda (en móvil solo círculo, en escritorio con palabra) */}
          <span
            className="absolute -top-1.5 -left-1 lg:-top-2 lg:-left-1.5 w-5 h-5 lg:w-auto lg:h-auto lg:px-2 lg:py-0.5 rounded-full inline-flex items-center justify-center gap-1 font-bold text-[11px]"
            style={{
              backgroundColor: semPrincipal.colorFuerte,
              color: semPrincipal.textoSobreFuerte,
              border: "2px solid var(--tinta)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full inline-block shrink-0"
              style={{ backgroundColor: "var(--tarjeta)" }}
            />
            <span className="hidden lg:inline">{semPrincipal.palabraCorta}</span>
          </span>

          {/* Globito compacto con número si hay varios puntos */}
          {badgeCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1 lg:-top-2 lg:-right-1.5 min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center font-bold text-xs"
              style={{
                backgroundColor: "var(--tarjeta)",
                color: "var(--tinta)",
                border: "2px solid var(--tinta)",
              }}
            >
              {badgeCount}
            </span>
          )}

          {/* Mamá Tomasa con su expresión de la Fase 1 */}
          <div className="shrink-0 flex items-center justify-center">
            <PersonajeGuia
              pose={pose}
              size={48}
              mostrarEtiquetaNombre={false}
            />
          </div>

          {/* Etiqueta corta solo en escritorio para que en móvil solo se vea Mamá Tomasa */}
          <div className="hidden lg:block pr-1 leading-tight">
            <span className="block font-bold text-sm">
              Mamá Tomasa
            </span>
            <span
              className="block text-xs font-medium"
              style={{ color: "var(--tinta-suave)" }}
            >
              {abierto
                ? isQu
                  ? "Wisq'ay"
                  : "Cerrar"
                : isQu
                ? "Semáforo"
                : "Ver semáforo"}
            </span>
          </div>
        </button>
      </div>

      {/* =====================================================================
       * 2. VENTANA EMERGENTE CON SEMÁFORO VISUAL Y EXPRESIONES DE FASE 1
       * ===================================================================== */}
      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:items-end lg:justify-end"
          style={{
            backgroundColor: "rgba(38, 28, 20, 0.42)",
            animation: "tarpuy-popup-fade 160ms ease-out",
          }}
          onClick={() => setAbierto(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mama-tomasa-dialog-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full lg:w-[500px] lg:mr-6 lg:mb-28 max-h-[70vh] lg:max-h-[78vh] flex flex-col rounded-t-3xl lg:rounded-3xl overflow-hidden"
            style={{
              backgroundColor: "var(--tarjeta)",
              border: "2px solid var(--tinta)",
              boxShadow: "0 8px 0 0 var(--tinta)",
              animation: "tarpuy-popup-slide 170ms ease-out",
            }}
          >
            {/* (a) Cabecera con TÍTULO COMPLETO SIN CORTAR + Semáforo de 3 luces */}
            <div
              className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 shrink-0"
              style={{
                backgroundColor: semPrincipal.colorSuave,
                borderBottom: "1.5px solid var(--tinta)",
              }}
            >
              <h2
                id="mama-tomasa-dialog-title"
                className="font-bold text-lg sm:text-xl leading-snug break-words flex-1 min-w-[200px]"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--tinta)",
                }}
              >
                {titulo}
              </h2>

              <BarraSemaforoVisual nivelActivo={nivelPrincipal} isQu={isQu} />
            </div>

            {/* Cuerpo desplazable: (b) Expresión de Mamá Tomasa + (c) Frase corta + (d) Semáforo por punto */}
            <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
              {/* (b) y (c): Mamá Tomasa con su expresión de Fase 1 + 1 frase corta */}
              <div
                className="p-4 rounded-3xl flex items-center gap-4"
                style={{
                  backgroundColor: semPrincipal.colorSuave,
                  border: "2px solid var(--tinta)",
                }}
              >
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <PersonajeGuia
                    pose={pose}
                    size={84}
                    mostrarEtiquetaNombre={false}
                  />
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: "var(--tarjeta)",
                      color: "var(--tinta)",
                      border: "1.5px solid var(--tinta)",
                    }}
                  >
                    {isQu ? expresionInfo.qu : expresionInfo.es}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase"
                    style={{
                      backgroundColor: semPrincipal.colorFuerte,
                      color: semPrincipal.textoSobreFuerte,
                    }}
                  >
                    <span>{semPrincipal.simbolo}</span>
                    <span>{semPrincipal.palabra}</span>
                  </span>

                  <p
                    className="font-bold leading-snug break-words"
                    style={{
                      fontSize: "20px",
                      color: "var(--tinta)",
                    }}
                  >
                    {mensaje}
                  </p>
                </div>
              </div>

              {/* (d) Puntos del Semáforo (cortos, relevantes, con su color y expresión de Mamá Tomasa) */}
              {tarjetas.length > 0 && (
                <div className="space-y-2.5">
                  {tarjetas.map((item, idx) => {
                    const poseItem = item.pose || pose;
                    const nivelItem = normalizarSemaforo(
                      item.semaforo || item.tonoAviso || "verde",
                      poseItem
                    );
                    const semItem = obtenerConfigSemaforo(nivelItem, isQu);

                    return (
                      <div
                        key={item.id || idx}
                        className="p-3.5 rounded-2xl flex items-center gap-3.5"
                        style={{
                          backgroundColor: semItem.colorSuave,
                          border: "1.5px solid var(--tinta)",
                        }}
                      >
                        {/* Mamá Tomasa en la expresión de Fase 1 que coincide con este punto */}
                        <div className="shrink-0 flex flex-col items-center gap-1">
                          <div className="relative">
                            <PersonajeGuia
                              pose={poseItem}
                              size={58}
                              mostrarEtiquetaNombre={false}
                            />
                            {/* Ícono de apoyo en esquina si existe */}
                            {(item.dibujoId || item.weatherKind || item.cropId) && (
                              <span
                                className="w-7 h-7 rounded-full flex items-center justify-center absolute -bottom-1 -right-1"
                                style={{
                                  backgroundColor: "var(--tarjeta)",
                                  border: "1.5px solid var(--tinta)",
                                }}
                              >
                                {item.weatherKind ? (
                                  <WeatherIllustration
                                    kind={item.weatherKind}
                                    className="w-5 h-5"
                                  />
                                ) : item.cropId ? (
                                  <CropIllustration
                                    cropId={item.cropId}
                                    name={item.titulo}
                                    className="w-5 h-5"
                                  />
                                ) : (
                                  <IlustracionTarpuy id={item.dibujoId} size={20} />
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Semáforo del punto + título completo + 1 frase corta */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase"
                              style={{
                                backgroundColor: semItem.colorFuerte,
                                color: semItem.textoSobreFuerte,
                              }}
                            >
                              <span
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: "var(--tarjeta)" }}
                              />
                              <span>{semItem.palabraCorta}</span>
                            </span>

                            {item.titulo && (
                              <p
                                className="font-bold text-base sm:text-lg leading-snug break-words"
                                style={{ color: "var(--tinta)" }}
                              >
                                {item.titulo}
                              </p>
                            )}
                          </div>

                          <p
                            className="font-normal text-base leading-snug break-words"
                            style={{ color: "var(--tinta)" }}
                          >
                            {item.frase}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* (e) Botón grande "Escuchar" + (f) Botón grande "Cerrar" */}
            <div
              className="p-4 flex flex-wrap items-center justify-between gap-3 shrink-0"
              style={{
                backgroundColor: "var(--papel)",
                borderTop: "1.5px solid var(--tinta)",
              }}
            >
              {onListen && (
                <BotonAltavoz
                  sonando={isSpeaking}
                  mostrarTexto={true}
                  etiqueta={tr(lang, "listenBtn")}
                  onClick={onListen}
                />
              )}

              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setAbierto(false)}
                className="tarpuy-btn-physical tarpuy-btn-physical--secondary inline-flex items-center justify-center gap-2.5 px-5 py-3 font-bold text-lg cursor-pointer ml-auto"
                style={{ minHeight: "64px" }}
              >
                <IconoCerrarDibujado size={24} />
                <span>{isQu ? "Wisq'ay (Cerrar)" : "Cerrar"}</span>
              </button>
            </div>

            {/* Colita apuntando a Mamá Tomasa en escritorio */}
            <svg
              width="28"
              height="16"
              viewBox="0 0 28 16"
              fill="none"
              aria-hidden="true"
              className="hidden lg:block absolute -bottom-4 right-12 pointer-events-none"
            >
              <path
                d="M2 0L14 14L26 0Z"
                fill="var(--papel)"
                stroke="var(--tinta)"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
