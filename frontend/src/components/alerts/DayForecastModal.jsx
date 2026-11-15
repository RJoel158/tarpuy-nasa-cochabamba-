import { X } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { IlustracionTarpuy } from "../illustrations/TarpuyIllustrations.jsx";
import { tr } from "../../utils/quechuaI18n.js";
import { weatherTodayCards } from "../../services/weatherTodayCards.js";

export default function DayForecastModal({ day, dv, zoneName = "", lang = "es", onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!day) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector("button")?.focus();
    const keydown = event => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current?.(); }
      if (event.key !== "Tab") return;
      const elements = [...(dialogRef.current?.querySelectorAll("button:not(:disabled), summary, a[href], select, input") || [])].filter(el => el.getClientRects().length);
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); document.body.style.overflow = overflow; previous?.focus(); };
  }, [day?.date]);
  if (!day || !dv) return null;
  const cards = weatherTodayCards(day);
  const tones = {
    warning: { bg: "var(--alerta-cuidado-suave)", label: "Atención" },
    rain: { bg: "var(--cielo-suave)", label: "Tenlo en cuenta" },
    calm: { bg: "var(--hoja-suave)", label: "Sin extremos previstos" },
    unknown: { bg: "var(--arena)", label: "Por confirmar" },
  };
  return <div ref={dialogRef} role="dialog" lang="es-BO" aria-modal="true" aria-label={`Clima para ${day.day_label}`}
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5"
    style={{ backgroundColor: "rgba(35, 26, 20, 0.65)" }} onClick={onClose}>
    <div className="tarpuy-card-physical max-w-3xl w-full max-h-[88dvh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--tarjeta)", border: "2px solid var(--tinta)" }} onClick={e => e.stopPropagation()}>
      <header className="px-5 sm:px-6 py-4 shrink-0 border-b border-[var(--color-border-subtle)] bg-[var(--arena)]">
        <p className="text-sm text-[var(--tinta-suave)]">{zoneName}</p>
        <h3 className="tarpuy-title mt-1">{day.day_label}</h3>
        <p className="text-sm mt-1">Lo que se espera y cómo cuidar tu chacra</p>
      </header>
      <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
        {lang === "qu" && <p className="text-sm">Interpretación en castellano; traducción al quechua pendiente de revisión local.</p>}
        <div className="space-y-3">
          {cards.map(card => <article key={card.id} className="rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-5" style={{ backgroundColor: tones[card.tone].bg }}>
            <div className="shrink-0 rounded-full bg-[var(--tarjeta)] p-2"><IlustracionTarpuy id={card.dibujoId} size={56} /></div>
            <div className="min-w-0 space-y-2">
              <p className="text-sm font-bold">{card.etiqueta} · {tones[card.tone].label}</p>
              <h4 className="text-lg sm:text-xl font-extrabold leading-tight">{card.palabra}</h4>
              <p className="text-base leading-relaxed">{card.explicacion}</p>
            </div>
          </article>)}
        </div>
        <p className="text-sm text-[var(--tinta-suave)]">Es un pronóstico: puede cambiar. Comprueba cómo está tu parcela antes de decidir.</p>
        <details className="text-sm border-t border-[var(--color-border-subtle)] pt-2">
          <summary className="cursor-pointer font-bold min-h-11 flex items-center">Ver datos del pronóstico</summary>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3">
            {[["Temperatura más baja", `${day.temp_min_c ?? "—"} °C`], ["Temperatura más alta", `${day.temp_max_c ?? "—"} °C`],
              ["Lluvia prevista para el día", `${day.precip_mm ?? "—"} mm`], ["Probabilidad de lluvia", `${day.precip_prob_pct ?? "—"} %`],
              ["Viento previsto", `${day.wind_kmh ?? "—"} km/h`]].map(([name, value]) => <div key={name}><dt>{name}</dt><dd className="font-bold">{value}</dd></div>)}
          </dl>
          <p>Fecha: {day.date}. Los datos diarios no indican a qué hora lloverá ni cuánto durará la lluvia.</p>
        </details>
      </div>
      <div className="weather-modal-actions grid-cols-1">
        <button type="button" className="weather-action weather-action--primary" onClick={onClose}><X size={20} aria-hidden="true" />{tr(lang, "closeBtn")}</button>
      </div>
    </div>
  </div>;
}
