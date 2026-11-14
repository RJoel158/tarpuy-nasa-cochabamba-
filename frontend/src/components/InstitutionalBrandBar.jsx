import React from "react";
import { EtiquetaLogo } from "./ui/TarpuyBaseComponents.jsx";

/**
 * TARPUY NASA COCHABAMBA — LOGOS INSTITUCIONALES EN ETIQUETA CREMA (FASE 2)
 * =========================================================================
 * Conserva exactamente los dos logos ("NASA International Space Apps Challenge"
 * y "Alcaldía de Cochabamba") con sus proporciones y colores originales,
 * siempre juntos, dentro de su etiqueta crema (--tarjeta) con borde (--tinta)
 * y esquinas redondeadas, visibles también al imprimir.
 */

export default function InstitutionalBrandBar({ variant = "header" }) {
  if (variant === "footer") {
    return (
      <footer className="tarpuy-card-physical p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <EtiquetaLogo>
          <img
            src="/logos/nasa-space-apps.png"
            alt="NASA International Space Apps Challenge"
            className="h-12 w-auto object-contain"
          />
          <span
            className="h-8 w-0.5"
            style={{ backgroundColor: "var(--piedra)" }}
            aria-hidden="true"
          />
          <img
            src="/logos/alcaldia-cochabamba-escudo.jpg"
            alt="Alcaldía de Cochabamba"
            className="h-12 w-auto object-contain"
          />
        </EtiquetaLogo>

        <div className="text-center md:text-right space-y-0.5">
          <p className="font-extrabold" style={{ color: "var(--tinta)", fontSize: "var(--font-size-body-min)" }}>
            NASA International Space Apps Challenge · Alcaldía de Cochabamba
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--tinta-suave)" }}>
            Datos Abiertos NASA Earth Observation · Gobierno Autónomo Municipal de Cochabamba
          </p>
        </div>
      </footer>
    );
  }

  return (
    <EtiquetaLogo>
      <img
        src="/logos/nasa-space-apps.png"
        alt="NASA International Space Apps Challenge"
        className="h-9 sm:h-10 w-auto object-contain"
      />
      <span
        className="h-7 w-0.5"
        style={{ backgroundColor: "var(--piedra)" }}
        aria-hidden="true"
      />
      <img
        src="/logos/alcaldia-cochabamba-escudo.jpg"
        alt="Alcaldía de Cochabamba"
        className="h-9 sm:h-10 w-auto object-contain"
      />
    </EtiquetaLogo>
  );
}
