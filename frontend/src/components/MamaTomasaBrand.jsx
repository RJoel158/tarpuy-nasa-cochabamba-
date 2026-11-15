import React from "react";
import { PersonajeGuia } from "./personality/PersonajeGuia.jsx";

export default function MamaTomasaBrand({ compact = false }) {
  return <div className={`tarpuy-brand-lockup ${compact ? "tarpuy-brand-lockup--compact" : ""}`}>
    <div className="tarpuy-brand-emblem">
      <PersonajeGuia pose="saludo" nombre="Mamá Tomasa" size={compact ? 68 : 76} />
    </div>
    <div className="tarpuy-brand-copy">
      <strong className="tarpuy-brand-wordmark">TARPUY</strong>
      <span className="tarpuy-brand-rule" aria-hidden="true" />
      <span className="tarpuy-brand-tagline">Tu chacra empieza aquí</span>
    </div>
  </div>;
}
