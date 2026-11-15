import React, { useState, useEffect, useRef, useCallback } from "react";
import { PersonajeGuia } from "./personality/PersonajeGuia.jsx";
import { EtiquetaLogo } from "./ui/TarpuyBaseComponents.jsx";
import { DibujoBrote } from "./illustrations/TarpuyIllustrations.jsx";
import { NASA_SPACE_APPS_LOGO, ALCALDIA_COCHABAMBA_LOGO } from "../branding/institutionalLogos.js";

/**
 * TARPUY NASA COCHABAMBA — ANIMACIÓN DE INICIO (SOLO DISEÑO)
 * ==========================================================
 * Secuencia breve estilo cinemática al abrir la aplicación una sola vez por sesión:
 * 1. Logo NASA Space Apps en el centro sobre su etiqueta crema (~1.2s)
 * 2. Logo Alcaldía de Cochabamba en el centro sobre su etiqueta crema (~1.2s)
 * 3. Mamá Tomasa al centro grande (saludo) con frase de bienvenida ("Bienvenido a Tarpuy") (~1.0s)
 * 4. EL ACOMODO: Mamá Tomasa viaja desde el centro y se reduce hasta coincidir exactamente
 *    sobre el avatar real de arriba a la izquierda (.tarpuy-brand-target-emblem).
 *    El fondo se desvanece suavemente revelando la app y la marca.
 *
 * Características:
 * - Botón "Saltar" (>= 64px de alto) accesible en todo momento o tocando la pantalla.
 * - Soporte prefers-reduced-motion (sin traslaciones grandes, transición rápida por opacidad).
 * - Cierre accesible con tecla Escape o Enter.
 * - aria-live="polite" para la bienvenida.
 * - No requiere sonido automático (TODO-FUNCIONALIDAD: sonido opcional de bienvenida).
 * - Utiliza sessionStorage para correr una sola vez por sesión.
 */

const STORAGE_KEY = "tarpuy_intro_seen_v1";

export default function IntroInicio({
  voiceLang = "es",
  isAppReady = true, // Permite saber si la app ya cargó datos iniciales
  onFinish,
}) {
  const [paso, setPaso] = useState("nasa"); // 'nasa' | 'alcaldia' | 'tomasa' | 'espera' | 'viaje' | 'terminado'
  const [coordenadasViaje, setCoordenadasViaje] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const tomasaCentroRef = useRef(null);
  const skipBtnRef = useRef(null);

  // Comprobar sincrónicamente si ya se mostró en esta sesión para evitar parpadeos
  const [yaVisto, setYaVisto] = useState(() => {
    try {
      if (typeof window === "undefined") return true;
      return sessionStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Detectar preferencia de reducción de movimiento
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Función para finalizar inmediatamente (saltar o completar)
  const finalizarSecuencia = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignorar si cookies/storage están deshabilitados
    }
    setYaVisto(true);
    setPaso("terminado");

    // Quitar ocultamiento del avatar real y texto de marca
    const emblem = document.querySelector(".tarpuy-brand-target-emblem");
    if (emblem) emblem.classList.remove("tarpuy-brand-emblem--hidden");
    const copy = document.querySelector(".tarpuy-brand-target-copy");
    if (copy) copy.classList.remove("tarpuy-brand-copy--fading");

    if (onFinish) onFinish();
  }, [onFinish]);

  // Manejo de teclado (Esc o Enter para saltar)
  useEffect(() => {
    if (yaVisto || paso === "terminado") return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        finalizarSecuencia();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [yaVisto, paso, finalizarSecuencia]);

  // Medir posición del avatar destino (.tarpuy-brand-target-emblem visible en la pantalla actual)
  const calcularDestino = useCallback(() => {
    const emblems = document.querySelectorAll(".tarpuy-brand-target-emblem");
    let target = null;
    // Buscar el emblema que esté visible en el viewport
    for (const el of emblems) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        target = { el, rect };
        break;
      }
    }

    if (!target || !tomasaCentroRef.current) return null;

    const sourceRect = tomasaCentroRef.current.getBoundingClientRect();
    const targetRect = target.rect;

    // Calcular desplazamiento desde el centro hacia el destino
    const deltaX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
    const deltaY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
    const scale = targetRect.width / sourceRect.width;

    return {
      deltaX,
      deltaY,
      scale,
      targetEl: target.el,
    };
  }, []);

  // Recalcular si cambia el tamaño de ventana o se rota el celular
  useEffect(() => {
    if (paso === "viaje") {
      const onResize = () => {
        const coords = calcularDestino();
        if (coords) setCoordenadasViaje(coords);
      };
      window.addEventListener("resize", onResize);
      window.addEventListener("orientationchange", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("orientationchange", onResize);
      };
    }
  }, [paso, calcularDestino]);

  // Orquestación del flujo temporal
  useEffect(() => {
    if (yaVisto || paso === "terminado") return;

    // Modo reducido de movimiento: secuencia rápida sin saltos (~2.8s)
    if (reducedMotion) {
      const t1 = setTimeout(() => setPaso("alcaldia"), 900);
      const t2 = setTimeout(() => setPaso("tomasa"), 1800);
      const t3 = setTimeout(() => finalizarSecuencia(), 2800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    let timer;
    if (paso === "nasa") {
      timer = setTimeout(() => setPaso("alcaldia"), 1900);
    } else if (paso === "alcaldia") {
      timer = setTimeout(() => setPaso("tomasa"), 1900);
    } else if (paso === "tomasa") {
      // Si la app aún no terminó de cargar datos básicos, mantener espera suave
      if (!isAppReady) {
        timer = setTimeout(() => setPaso("espera"), 1600);
      } else {
        timer = setTimeout(() => iniciarViaje(), 1600);
      }
    } else if (paso === "espera") {
      if (isAppReady) {
        timer = setTimeout(() => iniciarViaje(), 500);
      }
    }

    return () => clearTimeout(timer);
  }, [paso, yaVisto, reducedMotion, isAppReady, finalizarSecuencia]);

  // Si estaba en espera y la app terminó de cargar, arrancar viaje
  useEffect(() => {
    if (paso === "espera" && isAppReady && !reducedMotion) {
      iniciarViaje();
    }
  }, [paso, isAppReady, reducedMotion]);

  const iniciarViaje = () => {
    const coords = calcularDestino();
    if (!coords) {
      finalizarSecuencia();
      return;
    }

    // Ocultar avatar real mientras viaja la copia
    const emblem = document.querySelector(".tarpuy-brand-target-emblem");
    if (emblem) emblem.classList.add("tarpuy-brand-emblem--hidden");
    const copy = document.querySelector(".tarpuy-brand-target-copy");
    if (copy) copy.classList.add("tarpuy-brand-copy--fading");

    setCoordenadasViaje(coords);
    setPaso("viaje");

    // Tiempo del viaje: 1100ms de trayecto + desvanecimiento suave de fondo
    setTimeout(() => {
      finalizarSecuencia();
    }, 1100);
  };

  if (yaVisto || paso === "terminado") {
    return null;
  }

  const esQuechua = voiceLang === "qu";
  const textoBienvenida = esQuechua ? "Allin jamusqa Tarpuyman" : "Bienvenido a Tarpuy";

  // TODO-FUNCIONALIDAD: Si en el futuro se desea agregar un jingle o efecto sonoro opcional
  // de bienvenida, conectarlo aquí previa interacción o preferencia del usuario.

  return (
    <aside
      aria-label="Presentación de bienvenida Tarpuy"
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        backgroundColor: "var(--papel)",
        transition: paso === "viaje" ? "opacity 850ms cubic-bezier(0.4, 0, 0.2, 1)" : "none",
        opacity: paso === "viaje" ? 0 : 1,
        pointerEvents: paso === "viaje" ? "none" : "auto",
      }}
      onClick={(e) => {
        // Al tocar cualquier parte se puede saltar la secuencia
        if (e.target.tagName !== "BUTTON") {
          finalizarSecuencia();
        }
      }}
    >
      {/* Región para lectores de pantalla */}
      <div aria-live="polite" className="sr-only">
        {paso === "tomasa" || paso === "espera" || paso === "viaje"
          ? textoBienvenida
          : "Iniciando Tarpuy Cochabamba"}
      </div>

      {/* Botón SALTAR grande (>= 64px) accesible desde el primer segundo */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          ref={skipBtnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            finalizarSecuencia();
          }}
          aria-label={esQuechua ? "Saltay puriyta" : "Saltar presentación"}
          className="tarpuy-btn-physical tarpuy-btn-physical--secondary px-5 py-2.5 rounded-2xl font-bold cursor-pointer transition-transform active:translate-y-0.5"
          style={{
            minHeight: "64px",
            fontSize: "clamp(1rem, 3.8vw, 1.15rem)",
            backgroundColor: "var(--tarjeta)",
            color: "var(--tinta)",
            border: "2px solid var(--tinta)",
          }}
        >
          {esQuechua ? "P'inkiy (Saltar)" : "Saltar"}
        </button>
      </div>

      {/* CONTENEDOR CENTRAL */}
      <div className="relative w-full max-w-lg px-6 flex flex-col items-center justify-center text-center">
        {/* 1. LOGO NASA SPACE APPS */}
        {paso === "nasa" && (
          <div
            className="flex flex-col items-center justify-center"
            style={{
              animation: reducedMotion
                ? "tarpuy-fade-in 400ms ease-out forwards"
                : "tarpuy-intro-logo-enter 1850ms cubic-bezier(0.25, 1, 0.5, 1) forwards",
            }}
          >
            <EtiquetaLogo className="py-4 px-6 sm:px-8 max-w-[85vw] sm:max-w-[340px] shadow-sm">
              <img
                src={NASA_SPACE_APPS_LOGO}
                alt="NASA International Space Apps Challenge"
                className="h-14 sm:h-20 w-auto object-contain mx-auto"
                decoding="sync"
              />
            </EtiquetaLogo>
            <span
              className="mt-3 text-xs sm:text-sm font-bold uppercase tracking-wider"
              style={{ color: "var(--tinta-suave)" }}
            >
              NASA Earth Observation
            </span>
          </div>
        )}

        {/* 2. LOGO ALCALDÍA DE COCHABAMBA */}
        {paso === "alcaldia" && (
          <div
            className="flex flex-col items-center justify-center"
            style={{
              animation: reducedMotion
                ? "tarpuy-fade-in 400ms ease-out forwards"
                : "tarpuy-intro-logo-enter 1850ms cubic-bezier(0.25, 1, 0.5, 1) forwards",
            }}
          >
            <EtiquetaLogo className="py-4 px-6 sm:px-8 max-w-[85vw] sm:max-w-[340px] shadow-sm">
              <img
                src={ALCALDIA_COCHABAMBA_LOGO}
                alt="Alcaldía de Cochabamba"
                className="h-14 sm:h-20 w-auto object-contain mx-auto"
                decoding="sync"
              />
            </EtiquetaLogo>
            <span
              className="mt-3 text-xs sm:text-sm font-bold uppercase tracking-wider"
              style={{ color: "var(--tinta-suave)" }}
            >
              Gobierno Autónomo Municipal de Cochabamba
            </span>
          </div>
        )}

        {/* 3 y 4. MAMÁ TOMASA (Centro -> Viaje al avatar superior) */}
        {(paso === "tomasa" || paso === "espera" || paso === "viaje") && (
          <div className="flex flex-col items-center justify-center">
            {/* Elemento que viaja hacia arriba a la izquierda */}
            <div
              ref={tomasaCentroRef}
              className="tarpuy-intro-avatar-wrapper relative flex items-center justify-center"
              style={{
                width: "210px",
                height: "210px",
                borderRadius: "50%",
                backgroundColor: "var(--dorado-suave)",
                border: "3px solid var(--dorado)",
                boxShadow: "0 0 0 6px color-mix(in srgb, var(--dorado) 22%, transparent)",
                transformOrigin: "center center",
                willChange: "transform, opacity",
                animation:
                  paso === "tomasa" && !reducedMotion
                    ? "tarpuy-intro-tomasa-enter 750ms cubic-bezier(0.18, 0.89, 0.32, 1.15) forwards"
                    : undefined,
                transform:
                  paso === "viaje" && coordenadasViaje && !reducedMotion
                    ? `translate3d(${coordenadasViaje.deltaX}px, ${coordenadasViaje.deltaY}px, 0) scale(${coordenadasViaje.scale})`
                    : "none",
                transition:
                  paso === "viaje" && !reducedMotion
                    ? "transform 900ms cubic-bezier(0.25, 1, 0.35, 1)"
                    : "none",
              }}
            >
              <PersonajeGuia
                pose="saludo"
                nombre="Mamá Tomasa"
                size={180}
                mostrarEtiquetaNombre={false}
              />
            </div>

            {/* Texto de bienvenida en el centro (se desvanece al iniciar el viaje) */}
            <div
              className="mt-5 space-y-1 transition-opacity duration-300"
              style={{
                opacity: paso === "viaje" ? 0 : 1,
              }}
            >
              <h2
                className="font-extrabold tracking-tight"
                style={{
                  fontFamily: "var(--tarpuy-font-display)",
                  fontSize: "clamp(1.4rem, 5vw, 1.85rem)",
                  color: "var(--tinta)",
                }}
              >
                {textoBienvenida}
              </h2>
              <p
                className="text-base sm:text-lg font-bold"
                style={{ color: "var(--hoja-oscura)" }}
              >
                TARPUY · {esQuechua ? "Chakrayki kaypi qallarin" : "Tu chacra empieza aquí"}
              </p>

              {/* Indicador suave de espera si la app sigue preparando datos */}
              {paso === "espera" && (
                <div className="pt-2 flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center animate-bounce">
                    <DibujoBrote size={28} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "var(--tinta-suave)" }}>
                    {esQuechua ? "Allichakuchkan..." : "Preparando tu parcela..."}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
