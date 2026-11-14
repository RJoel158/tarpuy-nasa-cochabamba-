import React, { useState } from "react";
import { ShieldCheck, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Primitives.jsx";

const GLOSSARY = [
  { term: "Verdor de plantas (NDVI satélite)", plain: "Mide si la parcela está cubierta con plantas verdes o si está tierra pelada sufriendo con el sol." },
  { term: "Humedad en tierra (SMAP NASA)", plain: "Cuánta agua queda guardada debajo de los surcos, hasta las raíces." },
  { term: "Evaporación (ET0)", plain: "El agua que el sol fuerte y el viento le chupan cada día a tu parcela." },
  { term: "Abono natural (Fijar nitrógeno)", plain: "Haba, tarwi, arveja, vicia y alfalfa dejan alimento gratis en sus raíces para el próximo cultivo." },
  { term: "Solo con lluvia (Secano)", plain: "Parcela que depende únicamente de las lluvias de temporada, sin canal ni pozo." },
];

export default function DataVeracityCard({ manifest = [] }) {
  const [showGlossary, setShowGlossary] = useState(false);

  return (
    <Card className="bg-stone-50 border-stone-200">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-stone-900">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>Transparencia: ¿De dónde salen estos datos y qué tan exactos son?</span>
        </CardTitle>
        <button
          type="button"
          onClick={() => setShowGlossary((p) => !p)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
          <span>{showGlossary ? "Ocultar Diccionario Simple" : "Ver Palabras Fáciles"}</span>
          {showGlossary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {manifest.map((item) => (
            <div key={item.layer} className="p-3 rounded-xl bg-white border border-stone-200 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className="font-bold text-stone-900">{item.title_es}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                  {item.status_badge}
                </span>
              </div>
              <p className="text-[11px] font-medium text-emerald-800">{item.source}</p>
              <p className="text-[11px] text-stone-600 leading-relaxed">{item.honest_note}</p>
            </div>
          ))}
        </div>

        {showGlossary && (
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <h4 className="font-bold text-emerald-950 text-xs">Palabras del Campo y del Satélite Explicadas Fácil</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {GLOSSARY.map((g) => (
                <div key={g.term} className="bg-white/90 p-2.5 rounded-lg border border-emerald-100">
                  <strong className="text-emerald-900 block">{g.term}</strong>
                  <span className="text-[11px] text-stone-700">{g.plain}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
