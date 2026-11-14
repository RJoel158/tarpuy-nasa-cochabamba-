import React from "react";
import { IlustracionTarpuy, DibujoAltavoz } from "../illustrations/TarpuyIllustrations.jsx";

/**
 * TARPUY NASA COCHABAMBA — COMPONENTES BASE REUTILIZABLES (FASE 1)
 * ================================================================
 * - BotonGrande (ícono dibujado + texto corto, >= 64px, estados: normal, presionado, deshabilitado)
 * - TarjetaGrande (borde grueso, esquinas redondeadas, ilustración arriba, texto abajo)
 * - BotonAltavoz (grande, redondo, con ondas animadas cuando suena)
 * - SeparadorAndino (patrón de textil andino / aguayo y chakana muy sutil)
 * - EtiquetaLogo (etiqueta de papel claro para conservar los logotipos tal cual)
 *
 * REGLA ESTRICTA: Cero colores hexadecimales sueltos; 100% variables CSS de tokens.css.
 */

/* 1. BOTÓN GRANDE FÍSICO */
export function BotonGrande({
  children,
  texto,
  dibujo = null,
  ilustracionId = null,
  variante = "primario", // 'primario' | 'secundario' | 'agua'
  estado = "normal",     // 'normal' | 'presionado' | 'deshabilitado'
  disabled = false,
  onClick,
  className = "",
  type = "button",
  ariaLabel,
}) {
  const isDisabled = disabled || estado === "deshabilitado";
  const isPressed = estado === "presionado";

  const variantClass =
    variante === "secundario"
      ? "tarpuy-btn-physical--secondary"
      : variante === "agua"
      ? "tarpuy-btn-physical--water"
      : "tarpuy-btn-physical--primary";

  const pressedClass = isPressed ? "tarpuy-btn-physical--pressed" : "";
  const disabledClass = isDisabled ? "tarpuy-btn-physical--disabled" : "";

  const labelContent = texto || children;

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-pressed={isPressed || undefined}
      aria-label={ariaLabel || (typeof labelContent === "string" ? labelContent : undefined)}
      className={`tarpuy-btn-physical ${variantClass} ${pressedClass} ${disabledClass} inline-flex items-center justify-center gap-3.5 px-6 py-3 cursor-pointer ${className}`}
    >
      {dibujo ? (
        <span className="shrink-0 flex items-center justify-center">{dibujo}</span>
      ) : ilustracionId ? (
        <span
          className="shrink-0 flex items-center justify-center rounded-xl p-1"
          style={{ backgroundColor: "var(--color-bg-card)" }}
        >
          <IlustracionTarpuy id={ilustracionId} size={42} />
        </span>
      ) : null}
      <span className="leading-tight text-left">{labelContent}</span>
    </button>
  );
}

/* 2. TARJETA GRANDE (Ilustración arriba, texto abajo, borde grueso) */
export function TarjetaGrande({
  titulo,
  texto,
  children,
  dibujo = null,
  ilustracionId = null,
  ilustracionSize = 84,
  semaforo = null, // null | 'favorable' | 'aviso' | 'peligro' (solo para avisos de clima)
  etiquetaSemaforo = null,
  accion = null,
  className = "",
}) {
  const semaforoStyles = {
    favorable: {
      bg: "var(--color-weather-ok-bg)",
      border: "var(--color-weather-ok-border)",
      ink: "var(--color-weather-ok-ink)",
      defaultLabel: "Buen tiempo",
    },
    aviso: {
      bg: "var(--color-weather-warn-bg)",
      border: "var(--color-weather-warn-border)",
      ink: "var(--color-weather-warn-ink)",
      defaultLabel: "Cuidado hoy",
    },
    peligro: {
      bg: "var(--color-weather-danger-bg)",
      border: "var(--color-weather-danger-border)",
      ink: "var(--color-weather-danger-ink)",
      defaultLabel: "Peligro de clima",
    },
  };

  const activeSemaforo = semaforo ? semaforoStyles[semaforo] : null;

  return (
    <article
      className={`tarpuy-card-physical p-6 sm:p-7 flex flex-col items-center text-center gap-4 ${className}`}
      style={
        activeSemaforo
          ? {
              backgroundColor: activeSemaforo.bg,
              borderColor: activeSemaforo.border,
            }
          : undefined
      }
    >
      {/* Etiqueta acompañada de palabra cuando es semáforo (nunca solo color) */}
      {activeSemaforo && (
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 font-extrabold uppercase tracking-wide"
          style={{
            backgroundColor: "var(--color-bg-card)",
            color: activeSemaforo.ink,
            border: "var(--border-width-medium) solid var(--color-border-strong)",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--font-size-body-min)",
          }}
        >
          <span
            className="w-3.5 h-3.5 rounded-full inline-block"
            style={{ backgroundColor: activeSemaforo.border }}
            aria-hidden="true"
          />
          <span>{etiquetaSemaforo || activeSemaforo.defaultLabel}</span>
        </div>
      )}

      {/* Ilustración grande arriba */}
      {(dibujo || ilustracionId) && (
        <div
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: "var(--color-bg-card-alt)",
            border: "var(--border-width-medium) solid var(--color-border-strong)",
          }}
        >
          {dibujo || <IlustracionTarpuy id={ilustracionId} size={ilustracionSize} />}
        </div>
      )}

      {/* Texto abajo: título grande y explicación clara sin jerga */}
      <div className="space-y-2 max-w-xl">
        {titulo && <h3 className="tarpuy-subtitle">{titulo}</h3>}
        {texto && <p className="tarpuy-body">{texto}</p>}
        {children}
      </div>

      {/* Acción opcional al pie de la tarjeta */}
      {accion && <div className="w-full pt-2 flex justify-center">{accion}</div>}
    </article>
  );
}

/* 3. BOTÓN DE ALTAVOZ (Grande, redondo, con ondas animadas cuando suena) */
export function BotonAltavoz({
  sonando = false,
  etiqueta = "Escuchar",
  mostrarTexto = false,
  onClick,
  disabled = false,
  className = "",
  ariaLabel = "Escuchar en voz alta",
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Anillos exteriores animados cuando está sonando */}
      {sonando && (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full pointer-events-none tarpuy-speaker-wave-1"
            style={{
              border: "var(--border-width-thick) solid var(--color-illus-water)",
            }}
          />
          <span
            aria-hidden="true"
            className="absolute -inset-2.5 rounded-full pointer-events-none tarpuy-speaker-wave-2"
            style={{
              border: "var(--border-width-medium) solid var(--color-illus-sun)",
            }}
          />
        </>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={sonando}
        aria-label={sonando ? "Detener voz" : ariaLabel}
        className={`tarpuy-btn-physical ${
          sonando ? "tarpuy-btn-physical--water tarpuy-btn-physical--pressed" : "tarpuy-btn-physical--secondary"
        } relative z-10 inline-flex items-center justify-center gap-3 cursor-pointer ${
          mostrarTexto ? "px-6 py-3" : "p-2"
        }`}
        style={{
          minWidth: "var(--size-speaker-btn)",
          minHeight: "var(--size-speaker-btn)",
          borderRadius: "var(--radius-pill)",
        }}
      >
        <span
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--color-bg-card)" }}
        >
          <DibujoAltavoz size={42} animated={sonando} />
        </span>
        {mostrarTexto && (
          <span className="pr-1 font-extrabold" style={{ fontSize: "var(--font-size-body)" }}>
            {sonando ? "Detener voz" : etiqueta}
          </span>
        )}
      </button>
    </div>
  );
}

/* 4. SEPARADOR DECORATIVO CON PATRÓN DE TEXTIL ANDINO MUY SUTIL (Aguayo / Chakana) */
export function SeparadorAndino({ className = "" }) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={`w-full py-2 flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 600 24"
        className="w-full max-w-2xl h-6"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Líneas laterales de terraza */}
        <path
          d="M4 12H205M395 12H596"
          stroke="var(--color-border-subtle)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M40 16H195M405 16H560"
          stroke="var(--color-border-subtle)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="6 6"
        />

        {/* Rombos laterales de aguayo */}
        <polygon
          points="225,12 235,5 245,12 235,19"
          fill="var(--color-illus-sun)"
          stroke="var(--color-ink-stroke)"
          strokeWidth="1.6"
        />
        <polygon
          points="255,12 263,6 271,12 263,18"
          fill="var(--color-illus-leaf)"
          stroke="var(--color-ink-stroke)"
          strokeWidth="1.5"
        />

        {/* Chakana / Cruz Andina central escalonada */}
        <path
          d="M296 4H304V8H308V16H304V20H296V16H292V8H296V4Z"
          fill="var(--color-illus-andean-clay)"
          stroke="var(--color-ink-stroke)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="300" cy="12" r="2.2" fill="var(--color-bg-card)" />

        {/* Rombos simétricos derechos */}
        <polygon
          points="329,12 337,6 345,12 337,18"
          fill="var(--color-illus-leaf)"
          stroke="var(--color-ink-stroke)"
          strokeWidth="1.5"
        />
        <polygon
          points="355,12 365,5 375,12 365,19"
          fill="var(--color-illus-sun)"
          stroke="var(--color-ink-stroke)"
          strokeWidth="1.6"
        />
      </svg>
    </div>
  );
}

/* 5. ETIQUETA DE PAPEL CLARO PARA LOGOTIPOS ORIGINALES */
export function EtiquetaLogo({ children, className = "" }) {
  return (
    <div className={`tarpuy-logo-paper-tag inline-flex items-center gap-3 px-3.5 py-2 ${className}`}>
      {children}
    </div>
  );
}
