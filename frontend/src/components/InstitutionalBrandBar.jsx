import React from "react";

export default function InstitutionalBrandBar({ variant = "header" }) {
  if (variant === "footer") {
    return (
      <footer className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/logos/nasa-logo.svg"
            alt="Logo NASA Earth Observation"
            className="h-11 w-11 shrink-0 drop-shadow-sm"
          />
          <img
            src="/logos/gamc-cochabamba-logo.svg"
            alt="Logo Gobierno Autónomo Municipal de Cochabamba"
            className="h-11 w-auto shrink-0"
          />
        </div>
        <div className="text-center sm:text-right text-xs text-slate-600 space-y-0.5">
          <p className="font-bold text-slate-800">
            Datos Abiertos NASA Earth Observation • Articulación Territorial Cochabamba
          </p>
          <p className="text-[11px] text-slate-500">
            Respaldo institucional de referencia: NASA Space Apps Challenge 2026 &amp; Gobierno Autónomo Municipal de Cochabamba (GAMC)
          </p>
        </div>
      </footer>
    );
  }

  return (
    <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-2xl border border-white/20 shrink-0">
      <img
        src="/logos/nasa-logo.svg"
        alt="Logo NASA"
        className="h-10 w-10 sm:h-11 sm:w-11 drop-shadow"
      />
      <div className="h-7 w-px bg-white/25" aria-hidden="true" />
      <img
        src="/logos/gamc-cochabamba-logo.svg"
        alt="Logo Gobierno Autónomo Municipal de Cochabamba"
        className="h-10 sm:h-11 w-auto rounded-lg shadow-sm"
      />
    </div>
  );
}
