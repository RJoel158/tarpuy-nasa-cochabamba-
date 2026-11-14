import React from "react";
import { Loader2, CheckCircle2, AlertTriangle, Info, X, Volume2 } from "lucide-react";
import { WeatherIllustration, cleanAlertForFarmer } from "../alerts/WeatherPictograms.jsx";
import { tr } from "../../utils/quechuaI18n.js";

const TOAST_STYLE = {
  success: { border: "border-l-emerald-600", Icon: CheckCircle2, color: "text-emerald-700" },
  warning: { border: "border-l-amber-500", Icon: AlertTriangle, color: "text-amber-600" },
  info: { border: "border-l-[var(--cielo-oscuro)]", Icon: Info, color: "text-[var(--cielo-oscuro)]" },
};

export function FeedbackHost({ activeProcess = null, toasts = [], onDismissToast }) {
  if (!activeProcess && toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 flex flex-col gap-2.5 pointer-events-none"
    >
      {activeProcess ? (
        <div
          role="status"
          className="pointer-events-auto bg-[var(--tinta)] text-white rounded-xl px-4 py-3 shadow-lg border border-sky-400/30 space-y-2"
        >
          <div className="flex items-center justify-between gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-2 min-w-0 truncate">
              <Loader2 className="w-4 h-4 text-[var(--hoja-oscura)] animate-spin shrink-0" />
              <span className="truncate">{activeProcess.label}</span>
            </span>
            <span className="text-sky-300 shrink-0 tabular-nums">{activeProcess.pct}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--hoja-oscura)] rounded-full transition-all duration-150"
              style={{ width: `${activeProcess.pct}%` }}
            />
          </div>
        </div>
      ) : null}

      {toasts.map((t) => {
        const cfg = TOAST_STYLE[t.type] || TOAST_STYLE.info;
        const Icon = cfg.Icon;
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto bg-white border border-slate-200 border-l-4 ${cfg.border} text-slate-900 rounded-xl px-3.5 py-2.5 shadow-lg flex items-start justify-between gap-2.5`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.color}`} />
              <div className="min-w-0 text-xs">
                <p className="font-bold text-[var(--tinta)] leading-snug">{t.title}</p>
                {t.detail ? <p className="text-slate-600 mt-0.5 leading-snug">{t.detail}</p> : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDismissToast?.(t.id)}
              aria-label="Cerrar notificación"
              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer shrink-0"
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
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--cielo-oscuro)]">{tr(lang, "alertsModalSub")}</p>
            <h3 className="text-base font-bold text-[var(--tinta)]">{tr(lang, "seeAlerts")} · {zoneName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr(lang, "closeBtn")}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto">
          {alerts.map((al) => {
            const vis = cleanAlertForFarmer(al, lang);
            if (!vis) return null;
            return (
              <div
                key={al.id}
                className={`p-3.5 rounded-2xl border border-l-4 ${vis.borderClass} ${vis.bgClass} flex items-start gap-3`}
              >
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <WeatherIllustration kind={vis.kind} animated={true} className="w-11 h-11" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${vis.badgeClass}`}>
                      {vis.badgeText}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">{vis.category}</span>
                  </div>
                  <p className="text-sm font-bold text-[var(--tinta)] leading-snug">{vis.cleanTitle}</p>
                  <div className="bg-white/90 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-[var(--tinta)]">{tr(lang, "doToday")}</strong> {vis.action}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onListen}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--cielo-oscuro)] hover:bg-[var(--cielo-presionado)] text-white text-xs font-bold cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{tr(lang, "listenBtn")}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
          >
            {tr(lang, "closeBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
