import React from "react";
import { IlustracionTarpuy, DibujoAltavoz } from "../illustrations/TarpuyIllustrations.jsx";

/**
 * TARPUY NASA COCHABAMBA — COMPONENTES BASE REUTILIZABLES (FASE 1 + 1B)
 * =====================================================================
 * Usa exclusivamente los tokens con nombre definidos en tokens.css:
 * --papel, --tarjeta, --arena, --tinta, --tinta-suave,
 * --hoja, --hoja-suave, --hoja-oscura,
 * --dorado, --dorado-suave, --dorado-oscuro,
 * --cielo, --cielo-suave, --cielo-oscuro,
 * --tierra, --tierra-suave, --tierra-oscura,
 * --ladrillo, --piedra, --acento-zona y los 4 niveles de alerta de clima.
 */

/* 1. BOTÓN GRANDE FÍSICO */
export function BotonGrande({
  children,
  texto,
  dibujo = null,
  ilustracionId = null,
  variante = "primario", // 'primario' (hoja) | 'secundario' (arena) | 'agua' (cielo) | 'tierra'
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
      : variante === "tierra"
      ? "tarpuy-btn-physical--earth"
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
          style={{
            backgroundColor: "var(--tarjeta)",
          }}
        >
          <IlustracionTarpuy id={ilustracionId} size={40} />
        </span>
      ) : null}
      <span className="leading-tight text-left font-bold">{labelContent}</span>
    </button>
  );
}

/* 2. TARJETA GRANDE (Ilustración arriba, texto abajo, 4 niveles de alerta y acento por zona) */
export function TarjetaGrande({
  titulo,
  texto,
  children,
  dibujo = null,
  ilustracionId = null,
  ilustracionSize = 84,
  semaforo = null, // null | 'tranquilo'/'favorable' | 'cuidado'/'aviso' | 'peligro_cercano' | 'critico'/'peligro'
  etiquetaSemaforo = null,
  zona = null,     // null | 'tapacari' | 'punata' | 'chapare'
  nombreZona = null,
  recomendado = false,
  accion = null,
  className = "",
}) {
  const semaforoStyles = {
    tranquilo: {
      bg: "var(--alerta-tranquilo-suave)",
      accent: "var(--alerta-tranquilo)",
      ink: "var(--alerta-tranquilo-oscuro)",
      defaultLabel: "Tranquilo · Buen tiempo",
    },
    favorable: {
      bg: "var(--alerta-tranquilo-suave)",
      accent: "var(--alerta-tranquilo)",
      ink: "var(--alerta-tranquilo-oscuro)",
      defaultLabel: "Tranquilo · Buen tiempo",
    },
    cuidado: {
      bg: "var(--alerta-cuidado-suave)",
      accent: "var(--alerta-cuidado)",
      ink: "var(--alerta-cuidado-oscuro)",
      defaultLabel: "Cuidado · Atención",
    },
    aviso: {
      bg: "var(--alerta-cuidado-suave)",
      accent: "var(--alerta-cuidado)",
      ink: "var(--alerta-cuidado-oscuro)",
      defaultLabel: "Cuidado · Atención",
    },
    peligro_cercano: {
      bg: "var(--alerta-peligro-suave)",
      accent: "var(--alerta-peligro)",
      ink: "var(--alerta-peligro-oscuro)",
      defaultLabel: "Peligro cercano",
    },
    critico: {
      bg: "var(--alerta-critico-suave)",
      accent: "var(--alerta-critico)",
      ink: "var(--alerta-critico-oscuro)",
      defaultLabel: "Alerta crítica · Helada o sequía",
    },
    peligro: {
      bg: "var(--alerta-critico-suave)",
      accent: "var(--alerta-critico)",
      ink: "var(--alerta-critico-oscuro)",
      defaultLabel: "Alerta crítica · Helada o sequía",
    },
  };

  const activeSemaforo = semaforo ? semaforoStyles[semaforo] : null;

  return (
    <article
      data-zona={zona || undefined}
      className={`tarpuy-card-physical overflow-hidden flex flex-col justify-between ${className}`}
      style={
        activeSemaforo
          ? {
              backgroundColor: activeSemaforo.bg,
              borderColor: "var(--tinta)",
            }
          : recomendado
          ? {
              backgroundColor: "var(--dorado-suave)",
              borderColor: "var(--tinta)",
            }
          : undefined
      }
    >
      {/* Franja superior de acento por zona cuando se indica */}
      {zona && (
        <div
          className="w-full px-5 py-2.5 flex items-center justify-between gap-2 font-extrabold"
          style={{
            backgroundColor: "var(--acento-zona-suave)",
            borderBottom: "var(--border-width-medium) solid var(--tinta)",
            color: "var(--tinta)",
          }}
        >
          <span className="inline-flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full inline-block"
              style={{
                backgroundColor: "var(--acento-zona)",
                border: "var(--border-width-medium) solid var(--tinta)",
              }}
              aria-hidden="true"
            />
            <span>{nombreZona || zona}</span>
          </span>
          <span
            className="text-sm px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: "var(--tarjeta)",
              border: "1.5px solid var(--tinta)",
              color: "var(--acento-zona-oscuro)",
            }}
          >
            Zona activa
          </span>
        </div>
      )}

      {/* Franja superior de color de alerta cuando es un aviso de clima */}
      {activeSemaforo && (
        <div
          className="w-full h-3"
          style={{
            backgroundColor: activeSemaforo.accent,
            borderBottom: "var(--border-width-medium) solid var(--tinta)",
          }}
          aria-hidden="true"
        />
      )}

      <div className="p-6 sm:p-7 flex flex-col items-center text-center gap-4 flex-1">
        {/* Sello de alerta con dibujo/símbolo + palabra (nunca solo color) */}
        {activeSemaforo && (
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 font-extrabold uppercase tracking-wide"
            style={{
              backgroundColor: "var(--tarjeta)",
              color: activeSemaforo.ink,
              border: "var(--border-width-medium) solid var(--tinta)",
              borderRadius: "var(--radius-pill)",
              fontSize: "var(--font-size-body-min)",
            }}
          >
            <span
              className="w-4 h-4 rounded-full inline-block"
              style={{
                backgroundColor: activeSemaforo.accent,
                border: "1.5px solid var(--tinta)",
              }}
              aria-hidden="true"
            />
            <span>{etiquetaSemaforo || activeSemaforo.defaultLabel}</span>
          </div>
        )}

        {/* Sello de recomendado en --dorado */}
        {recomendado && !activeSemaforo && (
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 font-extrabold uppercase tracking-wide"
            style={{
              backgroundColor: "var(--tarjeta)",
              color: "var(--dorado-oscuro)",
              border: "var(--border-width-medium) solid var(--tinta)",
              borderRadius: "var(--radius-pill)",
              fontSize: "var(--font-size-body-min)",
            }}
          >
            <span
              className="w-4 h-4 rounded-full inline-block"
              style={{
                backgroundColor: "var(--dorado)",
                border: "1.5px solid var(--tinta)",
              }}
              aria-hidden="true"
            />
            <span>Recomendado hoy</span>
          </div>
        )}

        {/* Ilustración grande arriba */}
        {(dibujo || ilustracionId) && (
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shrink-0"
            style={{
              backgroundColor: "var(--tarjeta)",
              border: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            {dibujo || <IlustracionTarpuy id={ilustracionId} size={ilustracionSize} />}
          </div>
        )}

        {/* Texto abajo */}
        <div className="space-y-2 max-w-xl">
          {titulo && <h3 className="tarpuy-subtitle">{titulo}</h3>}
          {texto && <p className="tarpuy-body">{texto}</p>}
          {children}
        </div>

        {/* Acción opcional al pie */}
        {accion && <div className="w-full pt-2 flex justify-center">{accion}</div>}
      </div>
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
    <div className={`tarpuy-speaker relative inline-flex items-center justify-center ${className}`}>
      {sonando && (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full pointer-events-none tarpuy-speaker-wave-1"
            style={{
              border: "var(--border-width-thick) solid var(--cielo-oscuro)",
            }}
          />
          <span
            aria-hidden="true"
            className="absolute -inset-2.5 rounded-full pointer-events-none tarpuy-speaker-wave-2"
            style={{
              border: "var(--border-width-medium) solid var(--dorado)",
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
          style={{
            backgroundColor: "var(--tarjeta)",
            border: "1.5px solid var(--tinta)",
          }}
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

/* 4. SEPARADOR DECORATIVO CON PATRÓN DE TEXTIL ANDINO (--dorado, --hoja, --ladrillo) */
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
        <path
          d="M4 12H205M395 12H596"
          stroke="var(--piedra)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M40 16H195M405 16H560"
          stroke="var(--piedra)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="6 6"
        />

        {/* Rombo dorado */}
        <polygon
          points="225,12 235,5 245,12 235,19"
          fill="var(--dorado)"
          stroke="var(--tinta)"
          strokeWidth="1.6"
        />
        {/* Rombo hoja */}
        <polygon
          points="255,12 263,6 271,12 263,18"
          fill="var(--hoja)"
          stroke="var(--tinta)"
          strokeWidth="1.5"
        />

        {/* Chakana central en ladrillo */}
        <path
          d="M296 4H304V8H308V16H304V20H296V16H292V8H296V4Z"
          fill="var(--ladrillo)"
          stroke="var(--tinta)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="300" cy="12" r="2.2" fill="var(--tarjeta)" />

        {/* Rombo hoja */}
        <polygon
          points="329,12 337,6 345,12 337,18"
          fill="var(--hoja)"
          stroke="var(--tinta)"
          strokeWidth="1.5"
        />
        {/* Rombo dorado */}
        <polygon
          points="355,12 365,5 375,12 365,19"
          fill="var(--dorado)"
          stroke="var(--tinta)"
          strokeWidth="1.6"
        />
      </svg>
    </div>
  );
}

/* 5. ETIQUETA CREMA CON BORDE DE TINTA PARA LOGOTIPOS EN CUALQUIER FONDO */
export function EtiquetaLogo({ children, className = "" }) {
  return (
    <div className={`tarpuy-logo-paper-tag inline-flex items-center gap-3 px-3.5 py-2 ${className}`}>
      {children}
    </div>
  );
}
