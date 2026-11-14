import React from "react";
import {
  DibujoPapa,
  DibujoMaiz,
  DibujoHaba,
  DibujoQuinua,
  DibujoAvena,
  DibujoTierraSeca,
  DibujoTierraHumeda,
  DibujoPlantaCrecida,
  DibujoBrote,
  DibujoLluvia,
  DibujoRiegoGoteo,
  DibujoRiegoGravedad,
  DibujoYuntaBueyes,
  DibujoTractor,
  DibujoGotaAgua,
  DibujoHelada,
} from "../../components/illustrations/TarpuyIllustrations.jsx";

/**
 * FarmPictograms — Mantiene todos los nombres y firmas existentes,
 * reemplazando y extendiendo sus dibujos con el nuevo estilo hecho a mano
 * y 100% variables CSS (cero hex sueltos).
 */

const CROP_MATCHERS = [
  ["bare_soil", /pelad|descans|barbecho|vaci|desnudo|sin cobertura/],
  ["mulch", /rastrojo|mulch|cobertura|paja|tapad/],
  ["avena_vicia", /avena|vicia|forraje/],
  ["papa", /papa|akshu/],
  ["maiz", /maiz|sara/],
  ["haba", /haba|jawasa/],
  ["cebada", /cebada|siwara/],
  ["quinua", /quinua|kinwa/],
  ["tarwi", /tarwi/],
  ["alfalfa", /alfalfa/],
];

export function inferCropKind(idOrName = "") {
  const norm = String(idOrName).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const found = CROP_MATCHERS.find(([, rx]) => rx.test(norm));
  return found ? found[0] : "maiz";
}

export function CropIllustration({ cropId, name, className = "w-11 h-11" }) {
  const kind = inferCropKind(cropId || name);

  switch (kind) {
    case "papa":
      return <DibujoPapa className={className} />;
    case "maiz":
      return <DibujoMaiz className={className} />;
    case "haba":
      return <DibujoHaba className={className} />;
    case "quinua":
      return <DibujoQuinua className={className} />;
    case "avena_vicia":
    case "cebada":
      return <DibujoAvena className={className} />;
    case "alfalfa":
    case "tarwi":
      return <DibujoPlantaCrecida className={className} />;
    case "mulch":
      return <DibujoTierraHumeda className={className} />;
    case "bare_soil":
      return <DibujoTierraSeca className={className} />;
    default:
      return <DibujoMaiz className={className} />;
  }
}

export function WaterIllustration({ id, className = "w-10 h-10" }) {
  if (id === "none_secano") {
    return <DibujoLluvia className={className} />;
  }
  if (id === "full_canal_well") {
    return <DibujoRiegoGravedad className={className} />;
  }
  return <DibujoRiegoGoteo className={className} />;
}

export function ToolIllustration({ id, className = "w-9 h-9" }) {
  if (id === "mechanized" || id === "mixed_tractor_service") {
    return <DibujoTractor className={className} />;
  }
  return <DibujoYuntaBueyes className={className} />;
}

export function CheckIllustration({ kind = "water", className = "w-8 h-8" }) {
  if (kind === "soil") {
    return <DibujoTierraHumeda className={className} />;
  }
  if (kind === "frost") {
    return <DibujoHelada className={className} />;
  }
  if (kind === "erosion") {
    return <DibujoBrote className={className} />;
  }
  return <DibujoGotaAgua className={className} />;
}
