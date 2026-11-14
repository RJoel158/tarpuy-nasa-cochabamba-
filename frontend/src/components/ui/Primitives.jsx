import React from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-200/90 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`p-4 sm:p-5 border-b border-stone-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-base sm:text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2 ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

const BADGE_STYLES = {
  default: "bg-stone-100 text-stone-700 border-stone-200",
  water: "bg-sky-50 text-sky-900 border-sky-200",
  soil: "bg-emerald-50 text-emerald-950 border-emerald-200",
  warning: "bg-amber-50 text-amber-950 border-amber-200",
  danger: "bg-rose-50 text-rose-950 border-rose-200",
  nasa: "bg-[var(--cielo-oscuro)]/10 text-[var(--cielo-oscuro)] border-[var(--cielo-oscuro)]/30",
  gamc: "bg-[var(--hoja-oscura)]/10 text-[var(--hoja-oscura)] border-[var(--hoja-oscura)]/30",
};

export function Badge({ children, variant = "default", className = "" }) {
  const style = BADGE_STYLES[variant] || BADGE_STYLES.default;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      {children}
    </span>
  );
}

const METER_CONFIG = {
  green: {
    label: "Óptimo / Protegido",
    barColor: "bg-emerald-500",
    badgeVariant: "soil",
    Icon: CheckCircle2,
    percent: 100,
  },
  yellow: {
    label: "Precaución",
    barColor: "bg-amber-500",
    badgeVariant: "warning",
    Icon: AlertTriangle,
    percent: 55,
  },
  red: {
    label: "Riesgo Alto",
    barColor: "bg-rose-500",
    badgeVariant: "danger",
    Icon: AlertOctagon,
    percent: 25,
  },
};

export function SemanticMeter({ label, status = "yellow", hint }) {
  const config = METER_CONFIG[status] || METER_CONFIG.yellow;
  const Icon = config.Icon;
  const statusLabel = hint || config.label;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-stone-700">{label}</span>
        <Badge variant={config.badgeVariant} className="text-[11px]">
          <Icon className="w-3 h-3" />
          <span>{statusLabel}</span>
        </Badge>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
        <div
          className={`h-full transition-all duration-300 ${config.barColor}`}
          style={{ width: `${config.percent}%` }}
        />
      </div>
    </div>
  );
}
