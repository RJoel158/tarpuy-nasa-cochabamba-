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
  const compact = variant === "light";

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

  const inputPlaceholder = selectedCommunityName
    ? compact
      ? "Cambiar distrito..."
      : `Cambiar distrito (${selectedCommunityName})...`
    : placeholder;

  return (
    <div ref={rootRef} className={`relative w-full min-w-0 ${compact ? "tarpuy-district-search--compact" : ""}`}>
      <div
        className={`flex items-center transition ${compact ? "gap-1.5 px-2.5 py-1.5" : "gap-2.5 px-4 py-2.5"}`}
        style={{
          minHeight: compact ? "44px" : "var(--size-btn-min-h)",
          backgroundColor: "var(--tarjeta)",
          color: "var(--tinta)",
          border: compact ? "1.5px solid var(--tinta)" : "var(--border-width-thick) solid var(--tinta)",
          borderRadius: "var(--radius-btn)",
          boxShadow: compact ? "0 2px 0 var(--tinta)" : "0 3px 0 var(--tinta)",
        }}
      >
        <Search
          className={`${compact ? "w-4 h-4" : "w-6 h-6"} shrink-0`}
          style={{ color: "var(--tinta)" }}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Buscar distrito"
          value={open ? query : selectedCommunityName}
          placeholder={inputPlaceholder}
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
          className="w-full min-w-0 bg-transparent outline-none truncate"
          style={{
            color: "var(--tinta)",
            fontWeight: compact ? 700 : 800,
            fontSize: compact ? "clamp(0.8125rem, 2.8vw, 1rem)" : "var(--font-size-body-min)",
            lineHeight: 1.25,
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
            className={`${compact ? "p-1.5" : "p-2"} rounded-xl cursor-pointer shrink-0`}
            style={{
              backgroundColor: "var(--arena)",
              color: "var(--tinta)",
              border: "1.5px solid var(--tinta)",
            }}
          >
            <X className={compact ? "w-3.5 h-3.5" : "w-5 h-5"} />
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Mostrar lista de distritos"
          onClick={() => {
            if (open) setOpen(false);
            else inputRef.current?.focus();
          }}
          className={`${compact ? "p-1.5" : "p-2"} rounded-xl cursor-pointer shrink-0`}
          style={{
            backgroundColor: "var(--arena)",
            color: "var(--tinta)",
            border: "1.5px solid var(--tinta)",
          }}
        >
          <ChevronDown className={`${compact ? "w-3.5 h-3.5" : "w-5 h-5"} transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className={`absolute left-0 right-0 top-full mt-2 overflow-y-auto z-[500] py-1.5 ${
            compact ? "max-h-[min(50dvh,18rem)]" : "max-h-72 py-2"
          }`}
          style={{
            backgroundColor: "var(--tarjeta)",
            color: "var(--tinta)",
            border: compact ? "1.5px solid var(--tinta)" : "var(--border-width-thick) solid var(--tinta)",
            borderRadius: "var(--radius-card)",
            boxShadow: compact ? "0 4px 0 var(--tinta)" : "0 6px 0 var(--tinta)",
          }}
        >
          {results.length === 0 ? (
            <li
              className="px-3 py-2.5 font-bold"
              style={{
                color: "var(--tinta-suave)",
                fontSize: compact ? "0.875rem" : "var(--font-size-body-min)",
              }}
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
              const title = item.code ? `Distrito ${String(item.code).replace(/^D/i, "")}` : item.name;
              const subtitle = [item.region, item.alt || item.comuna].filter(Boolean).join(" · ");
              return (
                <li key={item.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(item)}
                    className={`w-full text-left flex items-start gap-2 transition cursor-pointer ${
                      compact ? "px-2.5 py-2" : "px-4 py-3 items-center justify-between gap-3"
                    }`}
                    style={{
                      minHeight: compact ? "48px" : "56px",
                      backgroundColor: selected
                        ? "var(--dorado-suave)"
                        : highlighted
                        ? "var(--arena)"
                        : "transparent",
                      color: "var(--tinta)",
                      borderBottom: "1px solid var(--arena)",
                    }}
                  >
                    {selected ? (
                      <Check
                        className={`${compact ? "w-4 h-4 mt-0.5" : "w-5 h-5"} shrink-0`}
                        style={{ color: "var(--hoja-oscura)" }}
                      />
                    ) : (
                      <MapPin
                        className={`${compact ? "w-4 h-4 mt-0.5" : "w-5 h-5"} shrink-0`}
                        style={{ color: "var(--ladrillo)" }}
                      />
                    )}
                    <span className="min-w-0 flex-1 flex flex-col gap-0.5">
                      <span
                        className="font-extrabold leading-snug break-words"
                        style={{
                          fontSize: compact ? "clamp(0.8125rem, 2.7vw, 0.95rem)" : "var(--font-size-body-min)",
                        }}
                      >
                        {title}
                        {item.periurbanProfile?.alias ? ` · ${item.periurbanProfile.alias}` : ""}
                      </span>
                      <span className="flex flex-wrap items-center gap-1.5 min-w-0">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold max-w-full truncate"
                          style={{
                            backgroundColor: regColors.bg,
                            color: regColors.fg,
                            border: "1px solid var(--tinta)",
                          }}
                        >
                          {item.region}
                        </span>
                        {item.alt || item.comuna ? (
                          <span
                            className="text-[11px] sm:text-xs font-bold min-w-0 break-words"
                            style={{ color: "var(--tinta-suave)" }}
                          >
                            {item.alt || item.comuna}
                          </span>
                        ) : null}
                      </span>
                      {!compact && subtitle ? (
                        <span className="sr-only">{subtitle}</span>
                      ) : null}
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
