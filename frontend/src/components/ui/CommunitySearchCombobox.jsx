import React, { useState, useRef, useEffect, useId } from "react";
import { Search, MapPin, ChevronDown, Check, X } from "lucide-react";
import { searchCommunities } from "../../utils/geoUtils.js";

const REGION_STYLE = {
  "Valle Alto": "bg-sky-100 text-sky-900",
  "Zona Alta": "bg-indigo-100 text-indigo-900",
  "Cono Sur": "bg-amber-100 text-amber-900",
};

export default function CommunitySearchCombobox({
  selectedZoneId = "",
  selectedCommunityName = "",
  onSelectCommunity,
  variant = "sidebar",
  placeholder = "Buscar comunidad o pueblo...",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();

  const results = searchCommunities(open ? query : "");
  const isSidebar = variant === "sidebar";

  useEffect(() => {
    const onOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const choose = (item) => {
    if (!item) return;
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    onSelectCommunity?.(item);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlightIdx((p) => (results.length ? Math.min(p + 1, results.length - 1) : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter" && open && results[highlightIdx]) {
      e.preventDefault();
      choose(results[highlightIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <div
        className={`flex min-h-11 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition ${
          isSidebar
            ? "bg-white/10 border-white/20 text-white focus-within:border-[var(--hoja-oscura)] focus-within:bg-white/15"
            : "bg-white border-slate-300 text-[var(--tinta)] focus-within:border-[var(--cielo-oscuro)]"
        }`}
      >
        <Search className={`w-3.5 h-3.5 shrink-0 ${isSidebar ? "text-sky-300" : "text-[var(--cielo-oscuro)]"}`} />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Buscar comunidad o municipio"
          value={open ? query : selectedCommunityName}
          placeholder={selectedCommunityName ? `${selectedCommunityName} · Buscar...` : placeholder}
          onFocus={() => {
            setOpen(true);
            setQuery("");
            setHighlightIdx(0);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlightIdx(0);
          }}
          onKeyDown={handleKeyDown}
          className={`w-full min-w-0 bg-transparent text-xs font-medium outline-none ${
            isSidebar ? "text-white placeholder-sky-200/80" : "text-[var(--tinta)] placeholder-slate-400"
          }`}
        />
        {open && query ? (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className={`p-0.5 rounded cursor-pointer ${isSidebar ? "text-sky-200 hover:text-white" : "text-slate-400 hover:text-slate-700"}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Mostrar comunidades"
          onClick={() => {
            if (open) setOpen(false);
            else inputRef.current?.focus();
          }}
          className={`p-0.5 rounded cursor-pointer shrink-0 ${isSidebar ? "text-sky-200 hover:text-white" : "text-slate-500 hover:text-[var(--tinta)]"}`}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-[500] py-1 divide-y divide-slate-100"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2.5 text-xs text-slate-500">Sin resultados para “{query}”</li>
          ) : (
            results.map((item, idx) => {
              const selected =
                item.name === selectedCommunityName || (!selectedCommunityName && item.zoneId === selectedZoneId);
              const highlighted = idx === highlightIdx;
              return (
                <li key={item.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(item)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 text-xs transition cursor-pointer ${
                      selected
                        ? "bg-sky-50 text-[var(--tinta)] font-bold"
                        : highlighted
                        ? "bg-slate-100 text-[var(--tinta)]"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      {selected ? (
                        <Check className="w-3.5 h-3.5 text-[var(--cielo-oscuro)] shrink-0" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${REGION_STYLE[item.region] || "bg-slate-100 text-slate-700"}`}>
                        {item.region}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.alt}</span>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
