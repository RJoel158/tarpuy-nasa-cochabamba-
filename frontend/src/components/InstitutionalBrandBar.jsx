import React from "react";

export default function InstitutionalBrandBar({ variant = "header" }) {
  if (variant === "footer") {
    return (
      <footer className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <img
            src="/logos/nasa-space-apps.png"
            alt="NASA International Space Apps Challenge"
            className="h-12 w-auto object-contain rounded-lg bg-white p-1 border border-slate-200"
          />
          <img
            src="/logos/alcaldia-cochabamba-escudo.jpg"
            alt="Alcaldía de Cochabamba"
            className="h-12 w-auto object-contain rounded-lg bg-white p-1 border border-slate-200"
          />
        </div>
        <div className="text-center md:text-right text-xs text-slate-600 space-y-0.5">
          <p className="font-bold text-slate-800">
            NASA International Space Apps Challenge • Alcaldía de Cochabamba (GAMC)
          </p>
          <p className="text-[11px] text-slate-500">
            Datos Abiertos NASA Earth Observation • Gobierno Autónomo Municipal de Cochabamba
          </p>
        </div>
      </footer>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-2xl shadow-sm border border-emerald-200 shrink-0">
      <img
        src="/logos/nasa-space-apps.png"
        alt="NASA International Space Apps Challenge"
        className="h-9 sm:h-10 w-auto object-contain"
      />
      <div className="h-7 w-px bg-slate-200" aria-hidden="true" />
      <img
        src="/logos/alcaldia-cochabamba-celeste.png"
        alt="Alcaldía de Cochabamba"
        className="h-9 sm:h-10 w-9 sm:w-10 object-cover rounded-lg"
      />
      <img
        src="/logos/alcaldia-cochabamba-escudo.jpg"
        alt="Escudo Alcaldía de Cochabamba"
        className="h-9 sm:h-10 w-auto object-contain rounded"
      />
    </div>
  );
}
