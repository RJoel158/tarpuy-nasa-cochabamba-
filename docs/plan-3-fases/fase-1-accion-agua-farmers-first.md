# Fase 1 — Acción de agua Farmers First

**Estado:** pendiente de ejecución (solo plan)  
**Prioridad:** alta — cierra el hueco más visible para productor con baja alfabetización digital  
**Depende de:** capas GAMC ya integradas (Distritos, Drenaje); boletín `engine/alerts.py`; `fetchDrainageAt` en frontend  
**Verificación previa:** [00-verificacion-requisitos.md](./00-verificacion-requisitos.md)

---

## Objetivo de producto

Que un productor, al abrir la app en **modo fácil**, vea **una sola decisión**:

> **RIEGA** · **ESPERA** · **CUIDADO CON EL AGUA** (anegamiento)

con pictograma + frase corta ES/Quechua + botón **Escuchar**, sin mm, ET0, SMAP ni capas WMS.

---

## Alcance (hacer)

1. **Regla de decisión hídrica** (backend o servicio JS compartido) que combine:
   - humedad / balance 7 días del `realtime_bulletin`;
   - proximidad a drenaje vía `fetchDrainageAt(lat, lon)` (`Tipo`, `Clasificación`);
   - distrito opcional (`fetchDistrictAt`) solo para etiquetar (“Distrito 9”).
2. **UI entrada modo fácil:** bloque “Tu chacra hoy” encima o en lugar del banner denso:
   - pastilla de acción (3 estados);
   - 1 frase de por qué;
   - CTA “Escuchar” y “Ver qué sembrar”.
3. **Traducciones** ES/Quechua en `quechuaI18n.js` + narración en `narration.js`.
4. **Modo avanzado:** mostrar los números (mm, %) debajo, colapsados.
5. **Tests:** matriz de escenarios (seco, húmedo+quebrada, helada) → acción esperada.

## Fuera de alcance (fase 1)

- Nuevos perfiles D9/D13 en el motor de rotación (fase 2).
- Texto “para regantes/GAMC” compartible (fase 3).
- Forecast 14 días (fase 3).
- Ingest live SMAP/GPM (opcional post-hackathon).

---

## Regla sugerida (borrador)

| Condición | Acción | Mensaje productor (ES) |
|-----------|--------|-------------------------|
| `tmin ≤ 2°C` en 7d | **ESPERA** (prioridad helada) | “Noche muy fría: protege brotes; no riegues de madrugada.” |
| Suelo seco o balance muy negativo **y** sin drenaje cercano | **RIEGA** | “La tierra está seca: pide turno de canal o riega al atardecer.” |
| Lluvia fuerte prevista **o** suelo húmedo **y** cerca de Quebrada / Tributario | **CUIDADO** | “Puede juntarse agua: limpia surcos; no satures el canal.” |
| Resto | **ESPERA** | “Agua aceptable: revisa la chacra mañana.” |

Umbrales concretos a calibrar con el rol de ciencia (usar los ya existentes en `alerts.py`: `soil_pct`, `net_water`, `rainy`).

---

## Archivos probables a tocar

- `engine/alerts.py` — campo `farmer_water_action: { code, title_es, title_qu, action_es, action_qu }`
- `frontend/src/services/gamcClient.js` — ya tiene `fetchDrainageAt`
- `frontend/src/App.jsx` — al GPS/punto, guardar `drainage` + `district` en estado
- `frontend/src/components/alerts/EarlyWarningBanner.jsx` o nuevo `FarmerWaterActionCard.jsx`
- `frontend/src/services/narration.js`
- `frontend/src/utils/quechuaI18n.js`
- `tests/test_alerts.py`

---

## Criterios de aceptación Farmers First

- [ ] En modo fácil, la primera pantalla de Clima muestra **una** acción grande (no 4 tarjetas técnicas primero).
- [ ] Un usuario sin leer números entiende qué hacer en &lt; 5 segundos.
- [ ] Audio reproduce la misma acción en ES y Quechua.
- [ ] Si no hay GPS/drenaje, la acción sigue funcionando solo con boletín NASA/Open-Meteo.
- [ ] Modo avanzado no pierde detalle técnico.

---

## Demo de jurado (fase 1)

1. GPS o punto en zona con quebrada + lluvia → pastilla **CUIDADO**.  
2. Zona seca sin drenaje → **RIEGA**.  
3. Pulsar Escuchar en Quechua.

---

## Estimación

~0,5–1 día de equipo (1 frontend + 1 backend/ciencia ligera).
