import React from "react";
import { Loader2, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { WeatherIllustration, cleanAlertForFarmer } from "../alerts/WeatherPictograms.jsx";
import { BotonGrande, BotonAltavoz } from "./TarpuyBaseComponents.jsx";
import { tr } from "../../utils/quechuaI18n.js";

/**
 * TARPUY NASA COCHABAMBA — SISTEMA DE AVISOS Y MODAL DE ALERTAS (FASE 3)
 * ======================================================================
 * Cero códigos hexadecimales sueltos: usa únicamente tokens de tokens.css.
 */

const TOAST_TOKEN_STYLE = {
  success: {
    bg: "var(--hoja-suave)",
    accent: "var(--hoja-oscura)",
    Icon: CheckCircle2,
  },
  warning: {
    bg: "var(--alerta-cuidado-suave)",
    accent: "var(--alerta-cuidado-oscuro)",
    Icon: AlertTriangle,
  },
  info: {
    bg: "var(--cielo-suave)",
    accent: "var(--cielo-oscuro)",
    Icon: Info,
  },
};

export function FeedbackHost({ activeProcess = null, toasts = [], onDismissToast }) {
  if (!activeProcess && toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 left-4 sm:left-auto sm:w-80 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {activeProcess ? (
        <div
          role="status"
          className="pointer-events-auto px-3.5 py-2.5 space-y-2 rounded-2xl"
          style={{
            backgroundColor: "var(--tinta)",
            color: "var(--tarjeta)",
            border: "1.5px solid var(--tarjeta)",
            boxShadow: "0 3px 0 var(--tinta)",
          }}
        >
          <div className="flex items-center justify-between gap-2 text-sm font-bold">
            <span className="inline-flex items-center gap-2 min-w-0 truncate">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" style={{ color: "var(--dorado)" }} />
              <span className="truncate">{activeProcess.label}</span>
            </span>
            <span className="shrink-0 tabular-nums" style={{ color: "var(--dorado)" }}>
              {activeProcess.pct}%
            </span>
          </div>
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--tinta-suave)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${activeProcess.pct}%`,
                backgroundColor: "var(--dorado)",
              }}
            />
          </div>
        </div>
      ) : null}

      {toasts.map((t) => {
        const cfg = TOAST_TOKEN_STYLE[t.type] || TOAST_TOKEN_STYLE.info;
        const Icon = cfg.Icon;
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-2.5"
            style={{
              backgroundColor: cfg.bg,
              color: "var(--tinta)",
              border: "1.5px solid var(--tinta)",
              boxShadow: "0 3px 0 var(--tinta)",
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-5 h-5 shrink-0" style={{ color: cfg.accent }} />
              <div className="min-w-0 leading-tight">
                <p className="font-bold text-sm leading-snug">{t.title}</p>
                {t.detail ? (
                  <p className="text-xs font-normal mt-0.5 leading-snug" style={{ color: "var(--tinta-suave)" }}>
                    {t.detail}
                  </p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDismissToast?.(t.id)}
              aria-label="Cerrar notificación"
              className="p-1 rounded-lg cursor-pointer shrink-0"
              style={{
                backgroundColor: "var(--tarjeta)",
                color: "var(--tinta)",
                border: "1px solid var(--tinta)",
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function AlertsModal({ open, onClose, alerts = [], zoneName = "", lang = "es", onListen }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tr(lang, "alertsModalTitle")}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(35, 26, 20, 0.72)" }}
      onClick={onClose}
    >
      <div
        className="tarpuy-card-physical max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden"
        style={{
          backgroundColor: "var(--tarjeta)",
          boxShadow: "0 8px 0 var(--tinta)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 py-4 flex flex-wrap items-center justify-between gap-4"
          style={{
            backgroundColor: "var(--arena)",
            borderBottom: "var(--border-width-thick) solid var(--tinta)",
          }}
        >
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider" style={{ color: "var(--tinta-suave)" }}>
              {tr(lang, "alertsModalSub")}
            </p>
            <h3 className="tarpuy-subtitle">
              {tr(lang, "seeAlerts")} · {zoneName}
            </h3>
          </div>

          <BotonAltavoz
            sonando={false}
            mostrarTexto={true}
            etiqueta={tr(lang, "listenBtn")}
            onClick={onListen}
          />
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {alerts.map((al) => {
            const vis = cleanAlertForFarmer(al, lang);
            if (!vis) return null;
            const bgAlerta =
              al.severity === "critical"
                ? "var(--alerta-critico-suave)"
                : al.severity === "warning"
                ? "var(--alerta-cuidado-suave)"
                : "var(--hoja-suave)";

            return (
              <div
                key={al.id}
                className="p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-4"
                style={{
                  backgroundColor: bgAlerta,
                  border: "var(--border-width-thick) solid var(--tinta)",
                }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--tarjeta)",
                    border: "var(--border-width-medium) solid var(--tinta)",
                  }}
                >
                  <WeatherIllustration kind={vis.kind} animated={true} className="w-14 h-14" />
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-sm font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--tarjeta)",
                        color: "var(--tinta)",
                        border: "1.5px solid var(--tinta)",
                      }}
                    >
                      {vis.badgeText}
                    </span>
                    <span className="text-sm font-extrabold" style={{ color: "var(--tinta-suave)" }}>
                      {vis.category}
                    </span>
                  </div>
                  <p className="tarpuy-subtitle">{vis.cleanTitle}</p>
                  <div
                    className="p-3.5 rounded-2xl text-base font-bold"
                    style={{
                      backgroundColor: "var(--tarjeta)",
                      border: "var(--border-width-medium) solid var(--tinta)",
                    }}
                  >
                    <strong>{tr(lang, "doToday")}</strong> {vis.action}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="px-6 py-4"
          style={{
            backgroundColor: "var(--arena)",
            borderTop: "var(--border-width-thick) solid var(--tinta)",
          }}
        >
          <BotonGrande
            variante="primario"
            texto={tr(lang, "closeBtn")}
            onClick={onClose}
            className="w-full text-xl justify-center"
          />
        </div>
      </div>
    </div>
  );
}
