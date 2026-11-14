import React, { useState } from "react";
import { Megaphone, X, Copy, Check, Share2, AlertTriangle, Droplets } from "lucide-react";

export default function MunicipalAlertModal({ alert, open, onClose, lang = "es" }) {
  const [copied, setCopied] = useState(false);

  if (!open || !alert) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(alert.share_text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: alert.title_es,
        text: alert.share_text,
      }).catch(() => {});
    } else {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(alert.share_text)}`;
      window.open(url, "_blank");
    }
  };

  const isFlood = alert.theme === "anegamiento_canales";
  const isDrought = alert.theme === "desabastecimiento";
  const badgeColor = alert.severity === "critical"
    ? "bg-red-100 text-red-800 border-red-300"
    : isFlood
    ? "bg-amber-100 text-amber-800 border-amber-300"
    : "bg-blue-100 text-blue-800 border-blue-300";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-lg rounded-3xl bg-white border-2 border-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-900"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-2xl ${isFlood ? "bg-amber-100 text-amber-700" : isDrought ? "bg-orange-100 text-orange-700" : "bg-sky-100 text-sky-700"}`}>
              {isFlood ? <AlertTriangle className="w-6 h-6" /> : isDrought ? <Droplets className="w-6 h-6" /> : <Megaphone className="w-6 h-6" />}
            </div>
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
                {alert.severity === "critical" ? "Alerta Crítica" : "Aviso Operativo"} · Regantes y GAMC
              </span>
              <h2 id="modal-title" className="text-lg font-black text-slate-900 leading-snug mt-1">
                {alert.title_es}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">
          {alert.body_es}
        </p>

        {alert.actions_es?.length > 0 && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Acciones sugeridas para la red de canales:
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              {alert.actions_es.map((action, i) => (
                <li key={i} className="leading-snug">{action}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Mensaje listo para WhatsApp / Radio comunal:
          </label>
          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-300 p-3.5 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed select-all">
            {alert.share_text}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-12 px-4 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "¡Copiado para WhatsApp!" : "Copiar mensaje"}</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="min-h-12 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir por WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}

