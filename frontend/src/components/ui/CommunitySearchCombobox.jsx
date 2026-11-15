import React, { useState, useRef, useEffect, useId } from "react";
import { Search, MapPin, ChevronDown, Check, X } from "lucide-react";
import { searchDistricts } from "../../utils/geoUtils.js";

import { useGamcDistricts } from "../../services/useGamcDistricts.js";

const REGION_TOKEN_STYLE = {
  "Valle Alto": {
    bg: "var(--dorado-suave)",
    fg: "var(--dorado-oscuro)",
  },
  "Zona Alta": {
    bg: "var(--piedra-suave)",
    fg: "var(--piedra-oscura)",
  },
  "Cono Sur": {
    bg: "var(--hoja-suave)",
    fg: "var(--hoja-oscura)",
  },
};

export default function CommunitySearchCombobox({
  selectedZoneId = "",
  selectedCommunityName = "",
  onSelectCommunity,
  variant = "sidebar",
  placeholder = "Buscar distrito...",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();

  const districts = useGamcDistricts();
  const results = searchDistricts(districts, open ? query : "");
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
        className="flex items-center gap-2.5 px-4 py-2.5 transition"
        style={{
          minHeight: "var(--size-btn-min-h)",
          backgroundColor: isSidebar ? "var(--tarjeta)" : "var(--tarjeta)",
          color: "var(--tinta)",
          border: "var(--border-width-thick) solid var(--tinta)",
          borderRadius: "var(--radius-btn)",
          boxShadow: "0 3px 0 var(--tinta)",
        }}
      >
        <Search className="w-6 h-6 shrink-0" style={{ color: "var(--tinta)" }} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Buscar distrito"
          value={open ? query : selectedCommunityName}
          placeholder={selectedCommunityName ? `Cambiar distrito (${selectedCommunityName})...` : placeholder}
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
          className="w-full min-w-0 bg-transparent font-extrabold outline-none"
          style={{
            color: "var(--tinta)",
            fontSize: "var(--font-size-body-min)",
          }}
        />
        {open && query ? (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="p-2 rounded-xl cursor-pointer shrink-0"
            style={{
              backgroundColor: "var(--arena)",
              color: "var(--tinta)",
              border: "1.5px solid var(--tinta)",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Mostrar lista de comunidades"
          onClick={() => {
            if (open) setOpen(false);
            else inputRef.current?.focus();
          }}
          className="p-2 rounded-xl cursor-pointer shrink-0"
          style={{
            backgroundColor: "var(--arena)",
            color: "var(--tinta)",
            border: "1.5px solid var(--tinta)",
          }}
        >
          <ChevronDown className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto z-[500] py-2"
          style={{
            backgroundColor: "var(--tarjeta)",
            color: "var(--tinta)",
            border: "var(--border-width-thick) solid var(--tinta)",
            borderRadius: "var(--radius-card)",
            boxShadow: "0 6px 0 var(--tinta)",
          }}
        >
          {results.length === 0 ? (
            <li
              className="px-4 py-3 font-bold"
              style={{ color: "var(--tinta-suave)", fontSize: "var(--font-size-body-min)" }}
            >
              No encontramos «{query}»
            </li>
          ) : (
            results.map((item, idx) => {
              const selected =
                item.name === selectedCommunityName ||
                (!selectedCommunityName && item.zoneId === selectedZoneId);
              const highlighted = idx === highlightIdx;
              const regColors = REGION_TOKEN_STYLE[item.region] || {
                bg: "var(--arena)",
                fg: "var(--tinta)",
              };
              return (
                <li key={item.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(item)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 transition cursor-pointer"
                    style={{
                      minHeight: "56px",
                      backgroundColor: selected
                        ? "var(--dorado-suave)"
                        : highlighted
                        ? "var(--arena)"
                        : "transparent",
                      color: "var(--tinta)",
                      fontWeight: selected ? 800 : 700,
                      fontSize: "var(--font-size-body-min)",
                      borderBottom: "1px solid var(--arena)",
                    }}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      {selected ? (
                        <Check className="w-5 h-5 shrink-0" style={{ color: "var(--hoja-oscura)" }} />
                      ) : (
                        <MapPin className="w-5 h-5 shrink-0" style={{ color: "var(--ladrillo)" }} />
                      )}
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-extrabold"
                        style={{
                          backgroundColor: regColors.bg,
                          color: regColors.fg,
                          border: "1.5px solid var(--tinta)",
                        }}
                      >
                        {item.region}
                      </span>
                      <span className="text-xs font-bold" style={{ color: "var(--tinta-suave)" }}>
                        {item.alt}
                      </span>
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
