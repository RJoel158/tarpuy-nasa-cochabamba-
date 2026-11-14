import React from "react";

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

const CROP_SVG = {
  papa: (
    <>
      <circle cx="28" cy="28" r="24" fill="#FEF3C7" />
      <path d="M28 19v-8m0 4c-5-2-8 1-8 1s3 3 8-1zm0-2c5-2 8 1 8 1s-3 3-8-1z" stroke="#15803D" strokeWidth="2.4" strokeLinecap="round" fill="#22C55E" />
      <ellipse cx="28" cy="34" rx="14" ry="10" fill="#B45309" stroke="#78350F" strokeWidth="2" />
      <circle cx="22" cy="32" r="1.4" fill="#FEF3C7" />
      <circle cx="31" cy="37" r="1.4" fill="#FEF3C7" />
      <circle cx="35" cy="31" r="1.2" fill="#FEF3C7" />
    </>
  ),
  maiz: (
    <>
      <circle cx="28" cy="28" r="24" fill="#FEF9C3" />
      <ellipse cx="28" cy="26" rx="7.5" ry="14" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
      <path d="M24 20h8M23 26h10M24 32h8M28 14v24" stroke="#B45309" strokeWidth="1.4" opacity="0.5" />
      <path d="M20 26c-4 6-4 14 8 18-7-4-9-11-8-18zm16 0c4 6 4 14-8 18 7-4 9-11 8-18z" fill="#16A34A" stroke="#15803D" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  haba: (
    <>
      <circle cx="28" cy="28" r="24" fill="#DCFCE7" />
      <path d="M14 38c3-14 14-23 28-23-2 15-12 24-28 23z" fill="#16A34A" stroke="#14532D" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="21" cy="33" rx="3.2" ry="2.4" transform="rotate(-35 21 33)" fill="#BBF7D0" />
      <ellipse cx="28" cy="27" rx="3.2" ry="2.4" transform="rotate(-35 28 27)" fill="#BBF7D0" />
      <ellipse cx="35" cy="22" rx="3" ry="2.2" transform="rotate(-35 35 22)" fill="#BBF7D0" />
    </>
  ),
  cebada: (
    <>
      <circle cx="28" cy="28" r="24" fill="#FEF3C7" />
      <path d="M28 46V16M25 14l-3-5M31 14l3-5M28 14V8" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="24" cy="22" rx="3" ry="4.5" transform="rotate(-25 24 22)" fill="#F59E0B" />
      <ellipse cx="32" cy="22" rx="3" ry="4.5" transform="rotate(25 32 22)" fill="#F59E0B" />
      <ellipse cx="24" cy="31" rx="3" ry="4.5" transform="rotate(-25 24 31)" fill="#D97706" />
      <ellipse cx="32" cy="31" rx="3" ry="4.5" transform="rotate(25 32 31)" fill="#D97706" />
    </>
  ),
  quinua: (
    <>
      <circle cx="28" cy="28" r="24" fill="#FFE4E6" />
      <path d="M28 46V28M28 40l-7-4M28 40l7-4" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="28" cy="18" r="5" fill="#E11D48" />
      <circle cx="23" cy="24" r="4.5" fill="#F59E0B" />
      <circle cx="33" cy="24" r="4.5" fill="#BE123C" />
      <circle cx="28" cy="28" r="4" fill="#FBBF24" />
    </>
  ),
  tarwi: (
    <>
      <circle cx="28" cy="28" r="24" fill="#E0E7FF" />
      <path d="M28 46V15M28 40c5 0 8-3 8-3" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="28" cy="14" r="3.5" fill="#4338CA" />
      <circle cx="25" cy="21" r="3.5" fill="#4F46E5" />
      <circle cx="31" cy="21" r="3.5" fill="#6366F1" />
      <circle cx="25" cy="28" r="3.5" fill="#4F46E5" />
      <circle cx="31" cy="28" r="3.5" fill="#6366F1" />
    </>
  ),
  avena_vicia: (
    <>
      <circle cx="28" cy="28" r="24" fill="#ECFDF5" />
      <path d="M20 45c1-12 4-20 8-26M28 45V15M36 45c-1-12-4-20-8-26" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="21" cy="20" r="2.8" fill="#A855F7" />
      <circle cx="35" cy="23" r="2.8" fill="#9333EA" />
      <ellipse cx="28" cy="16" rx="2.5" ry="4" fill="#F59E0B" />
    </>
  ),
  alfalfa: (
    <>
      <circle cx="28" cy="28" r="24" fill="#DCFCE7" />
      <path d="M28 45V24" stroke="#15803D" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="22" cy="27" r="5" fill="#22C55E" />
      <circle cx="34" cy="27" r="5" fill="#22C55E" />
      <circle cx="28" cy="21" r="4.5" fill="#16A34A" />
      <circle cx="28" cy="14" r="4" fill="#A855F7" />
    </>
  ),
  mulch: (
    <>
      <circle cx="28" cy="28" r="24" fill="#FEF3C7" />
      <rect x="10" y="34" width="36" height="10" rx="3" fill="#78350F" />
      <path d="M12 31h32M15 27h26M18 33h20" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 11c3 4 5 7 5 9.5a5 5 0 1 1-10 0c0-2.5 2-5.5 5-9.5z" fill="#0284C7" />
    </>
  ),
  bare_soil: (
    <>
      <circle cx="28" cy="28" r="24" fill="#FFEDD5" />
      <circle cx="28" cy="17" r="6" fill="#F97316" />
      <path d="M28 8v2M18 17h-2M40 17h-2M21 10l1.5 1.5M35 10l-1.5 1.5" stroke="#EA580C" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M11 36h34l-3 9H14l-3-9z" fill="#9A3412" />
      <path d="M20 36l3 4-2 5M34 36l-3 5 2 4" stroke="#FED7AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function CropIllustration({ cropId, name, className = "w-11 h-11" }) {
  const kind = inferCropKind(cropId || name);
  return <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">{CROP_SVG[kind]}</svg>;
}

const WATER_SVG = {
  none_secano: (
    <>
      <path d="M17 28h23a7 7 0 0 0 1-14 9 9 0 0 0-18-2 8 8 0 0 0-6 16z" fill="#38BDF8" />
      <path d="M20 34l-2 7M29 34l-2 9M38 34l-2 7" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  deficit_auxiliary: (
    <>
      <circle cx="22" cy="26" r="12" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.8" />
      <path d="M22 20v6l4 3" stroke="#0B2545" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M40 16c4 5 7 9 7 13a7 7 0 1 1-14 0c0-4 3-8 7-13z" fill="#0284C7" />
    </>
  ),
  full_canal_well: (
    <>
      <path d="M10 18v24h36V18" stroke="#475569" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="#F1F5F9" />
      <path d="M12 28c6-3 10 3 16 0s10 3 16 0v12H12V28z" fill="#0284C7" />
      <path d="M16 33c5-2 9 2 12 0s7 2 12 0" stroke="#BAE6FD" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
};

export function WaterIllustration({ id, className = "w-10 h-10" }) {
  return <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">{WATER_SVG[id] || WATER_SVG.deficit_auxiliary}</svg>;
}

const TOOL_SVG = {
  manual_yunta: (
    <>
      <path d="M12 20h32M22 20v16l10 6" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 42l12-4-4-7-8 11z" fill="#475569" />
    </>
  ),
  mixed_tractor_service: (
    <>
      <path d="M10 34h16l-5 8H10" stroke="#92400E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="38" cy="34" r="9" fill="#0B2545" />
      <circle cx="38" cy="34" r="4" fill="#0284C7" />
    </>
  ),
  mechanized: (
    <>
      <path d="M18 18h12v10H18z" fill="#38BDF8" />
      <path d="M14 28h28v8H14z" fill="#0284C7" />
      <circle cx="20" cy="37" r="7" fill="#0B2545" />
      <circle cx="39" cy="39" r="5" fill="#0B2545" />
      <circle cx="20" cy="37" r="2.5" fill="#FBBF24" />
    </>
  ),
};

export function ToolIllustration({ id, className = "w-9 h-9" }) {
  return <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">{TOOL_SVG[id] || TOOL_SVG.manual_yunta}</svg>;
}

const CHECK_SVG = {
  water: <path d="M24 8c6 8 11 14 11 20a11 11 0 1 1-22 0c0-6 5-12 11-20z" fill="#0284C7" />,
  soil: (
    <>
      <path d="M8 34c7-4 25-4 32 0v6H8z" fill="#78350F" />
      <path d="M24 32V16m0 4c-6-4-10 0-10 0s4 4 10 0zm0-2c6-4 10 0 10 0s-4 4-10 0z" stroke="#16A34A" strokeWidth="2.4" fill="#22C55E" strokeLinejoin="round" />
    </>
  ),
  frost: (
    <>
      <path d="M24 6l14 6v11c0 10-6 16-14 19-8-3-14-9-14-19V12l14-6z" fill="#E0F2FE" stroke="#0B2545" strokeWidth="2.4" />
      <path d="M24 15v16M17 19l14 8M31 19l-14 8" stroke="#0284C7" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  erosion: (
    <>
      <path d="M8 38L40 24v16H8z" fill="#A16207" />
      <path d="M24 30V14m0 5l-6-4m6 4l6-4M24 30l-4 6m4-6l4 6" stroke="#16A34A" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
};

export function CheckIllustration({ kind = "water", className = "w-8 h-8" }) {
  return <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">{CHECK_SVG[kind] || CHECK_SVG.water}</svg>;
}
