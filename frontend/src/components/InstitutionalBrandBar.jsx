import React from "react";
import { EtiquetaLogo } from "./ui/TarpuyBaseComponents.jsx";
import { INSTITUTIONAL_LOGOS } from "../branding/institutionalLogos.js";

/**
 * TARPUY NASA COCHABAMBA — LOGOS INSTITUCIONALES EN ETIQUETA CREMA
 * NASA Space Apps + Alcaldía de Cochabamba (PNG sin fondo), siempre juntos.
 */

function LogoPair({ size = "md" }) {
  const height =
    size === "lg" ? "h-14 sm:h-16" : size === "sm" ? "h-8 sm:h-9" : "h-10 sm:h-12";
  return (
    <>
      {INSTITUTIONAL_LOGOS.map((logo, idx) => (
        <React.Fragment key={logo.src}>
          {idx > 0 ? (
            <span
              className="h-8 w-0.5 shrink-0"
              style={{ backgroundColor: "var(--piedra)" }}
              aria-hidden="true"
            />
          ) : null}
          <img
            src={logo.src}
            alt={logo.alt}
            className={`${height} w-auto max-w-[46vw] sm:max-w-[220px] object-contain`}
            loading="lazy"
            decoding="async"
          />
        </React.Fragment>
      ))}
    </>
  );
}

export default function InstitutionalBrandBar({ variant = "header", size = "md" }) {
  if (variant === "footer") {
    return (
      <footer className="tarpuy-card-physical p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <EtiquetaLogo>
          <LogoPair size="lg" />
        </EtiquetaLogo>

        <div className="text-center md:text-right space-y-0.5">
          <p
            className="font-extrabold"
            style={{ color: "var(--tinta)", fontSize: "var(--font-size-body-min)" }}
          >
            NASA International Space Apps Challenge · Alcaldía de Cochabamba
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--tinta-suave)" }}>
            Datos Abiertos NASA Earth Observation · Gobierno Autónomo Municipal de Cochabamba
          </p>
        </div>
      </footer>
    );
  }

  if (variant === "inline") {
    return (
      <EtiquetaLogo className="max-w-full">
        <LogoPair size={size} />
      </EtiquetaLogo>
    );
  }

  return (
    <EtiquetaLogo>
      <LogoPair size={size} />
    </EtiquetaLogo>
  );
}
