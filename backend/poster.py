"""Printable community poster (Cartilla Comunal) HTML generator with strict XSS escaping."""

import html
from typing import Any


def esc(value: Any) -> str:
    """Escape dynamic string for HTML inclusion (OWASP A03 XSS prevention)."""
    return html.escape(str(value) if value is not None else "", quote=True)


def _render_strategies(strategies: list[dict[str, Any]]) -> str:
    cards = []
    for s in strategies[:3]:
        badge_cls = "badge-green" if s.get("strategy_type") != "current_baseline" else "badge-amber"
        seq = [esc(c) for c in s.get("rotation_sequence", [])]
        crops = " &rarr; ".join(seq) if seq else "Rotaci&oacute;n est&aacute;ndar"
        name = esc(s.get("name", "Estrategia"))
        stype = esc(s.get("strategy_type", ""))
        name_qu = esc(s.get("name_qu", s.get("summary_qu", "")))
        rationale = esc(s.get("agronomic_rationale", s.get("summary_es", "")))
        cards.append(
            f'<div class="strategy-card">\n'
            f'  <h4>{name} <span class="badge {badge_cls}">{stype}</span></h4>\n'
            f'  <p class="quechua-sub">{name_qu}</p>\n'
            f'  <p><strong>Rotaci&oacute;n:</strong> {crops}</p>\n'
            f'  <p><strong>Beneficio:</strong> {rationale}</p>\n'
            f'</div>'
        )
    return "\n".join(cards)


def _render_months(indicators: list[dict[str, Any]]) -> str:
    rows = []
    for m in indicators:
        mname = esc(m.get("month_name", m.get("month")))
        tmin = esc(m.get("temp_min_c", "-"))
        tmax = esc(m.get("temp_max_c", "-"))
        precip = esc(m.get("precip_mm", "-"))
        frost_badge = (
            '<span class="badge badge-red">&#10052; Helada</span>'
            if m.get("frost_risk_days", 0) > 10
            else '<span class="badge badge-green">&#9728; Seguro</span>'
        )
        soil_badge = (
            '<span class="badge badge-red">&#9888; Suelo Desnudo</span>'
            if m.get("bare_soil_flag")
            else '<span class="badge badge-green">&#127793; Cobertura</span>'
        )
        rows.append(
            f"<tr><td><strong>{mname}</strong></td><td>{tmin}&deg;C / {tmax}&deg;C</td>"
            f"<td>{precip} mm</td><td>{frost_badge}</td><td>{soil_badge}</td></tr>"
        )
    return "\n".join(rows)


def render_zone_poster_html(
    zone: Any = None, recommendation: dict[str, Any] | None = None
) -> str:
    """Generate printable 1-page community poster HTML with strict escaping."""
    if isinstance(zone, str):
        zone = {"name": zone, "quechua_name": zone, "municipality": zone, "elevation_msnm": 2750}
    zone_dict = zone or {}
    rec_dict = recommendation or {}
    strategies = rec_dict.get("strategies", zone_dict.get("strategies", []))
    indicators = zone_dict.get("monthly_harmonized_indicators", [])

    z_name = esc(zone_dict.get("name", "Cochabamba"))
    z_qu = esc(zone_dict.get("quechua_name", ""))
    z_mun = esc(zone_dict.get("municipality", ""))
    z_alt = esc(zone_dict.get("elevation_msnm", ""))

    return (
        '<!DOCTYPE html>\n<html lang="es">\n<head>\n'
        '  <meta charset="utf-8">\n'
        f"  <title>Cartilla Agr&iacute;cola Comunal &mdash; {z_name}</title>\n"
        "  <style>\n"
        "    body { font-family: system-ui, sans-serif; margin: 20px; color: #1e293b; }\n"
        "    .header { border-bottom: 3px solid #16a34a; padding-bottom: 12px; }\n"
        "    h1 { color: #15803d; margin: 0; font-size: 24px; }\n"
        "    .meta { font-size: 14px; color: #475569; margin: 6px 0; }\n"
        "    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }\n"
        "    .badge-green { background: #dcfce7; color: #166534; }\n"
        "    .badge-amber { background: #fef3c7; color: #92400e; }\n"
        "    .badge-red { background: #fee2e2; color: #991b1b; }\n"
        "    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }\n"
        "    .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; }\n"
        "    table { width: 100%; border-collapse: collapse; font-size: 12px; }\n"
        "    th, td { padding: 4px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }\n"
        "    .strategy-card { background: #f8fafc; border-left: 4px solid #16a34a; padding: 8px; margin-bottom: 8px; }\n"
        "    .quechua-sub { font-style: italic; color: #64748b; font-size: 13px; margin: 2px 0; }\n"
        "    @media print { body { margin: 0; } }\n"
        "  </style>\n</head>\n<body>\n"
        '  <div class="header">\n'
        "    <h1>&#127793; Cartilla Agr&iacute;cola Comunal &mdash; Cochabamba</h1>\n"
        f'    <div class="meta"><strong>Zona:</strong> {z_name} ({z_qu}) | '
        f"<strong>Municipio:</strong> {z_mun} | <strong>Altitud:</strong> {z_alt} msnm</div>\n"
        "  </div>\n"
        '  <div class="grid">\n'
        '    <div class="card">\n'
        "      <h3>&#128197; Calendario Climatol&oacute;gico y Alertas NASA</h3>\n"
        "      <table><thead><tr><th>Mes</th><th>Temp</th><th>Lluvia</th><th>Helada</th><th>Suelo</th></tr></thead>\n"
        f"      <tbody>{_render_months(indicators)}</tbody></table>\n"
        "    </div>\n"
        '    <div class="card">\n'
        "      <h3>&#128260; Estrategias de Rotaci&oacute;n Recomendadas</h3>\n"
        f"      {_render_strategies(strategies)}\n"
        "    </div>\n  </div>\n</body>\n</html>"
    )
