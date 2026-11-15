# Fase 3 — Alertas a regantes / GAMC + proyección 14 días

**Estado:** completado y verificado  
**Prioridad:** media–alta para cerrar el enunciado municipal de canales y anegamiento  
**Depende de:** Fase 1 (acción de agua) y Fase 2 (distrito/periurbano en contexto)  
**Verificación previa:** [00-verificacion-requisitos.md](./00-verificacion-requisitos.md)

---

## Objetivo de producto

1. Extender el horizonte climático a **7 y 14 días** (requisito del reto).  
2. Generar una **alerta accionable para asociaciones de regantes y GAMC** (no solo para el productor), centrada en **red de canales y anegamiento**, usando drenaje + distrito + lluvia/humedad.

Farmers First: el productor solo pulsa **“Avisar al canal / al municipio”**; el texto técnico largo es para el destinatario.

---

## Problema confirmado

- `RealtimeWeatherClient` usa `forecast_days: 7`.
- Alertas en `engine/alerts.py` hablan al agricultor (helada, sequía, lluvia en surcos).
- No existe payload ni UI “para regantes/GAMC” ni mención a compuertas/turnos de canal.

---

## Alcance (hacer)

### A. Forecast 14 días

1. En `etl/realtime_weather_client.py`: pedir `forecast_days: 14` (Open-Meteo lo soporta).
2. Persistir en `realtime_weather_telemetry.json` (o truncar en escritura compacta si el tamaño duele).
3. En `engine/alerts.py`:
   - mantener resumen 7d para la pastilla Farmer First;
   - añadir `predictions_summary_14d` y días 8–14;
   - UI fácil: toggle o pestaña **7 días | 14 días** con pictogramas (sin tablas densas).
4. Re-ejecutar sync ETL documentado en el README (`python -m etl…` según el entrypoint actual).

### B. Boletín para regantes / GAMC

Nuevo bloque en el bulletin (ejemplo de contrato):

```json
{
  "municipal_alert": {
    "audience": "regantes_gamc",
    "district_code": "D9",
    "comuna": "…",
    "severity": "warning",
    "theme": "anegamiento_canales",
    "title_es": "Riesgo de saturación de drenaje — Distrito 9",
    "body_es": "… lluvia acumulada 7/14d, humedad, clasificación de drenaje …",
    "actions_es": [
      "Revisar turnos de riego en la red de canales",
      "Priorizar drenaje en zonas de Quebradas / Princ. Tributarios",
      "Avisar a productores periurbanos consolidados"
    ],
    "share_text": "texto listo para WhatsApp/radio"
  }
}
```

Reglas (borrador):

- Emitir `municipal_alert` si lluvia fuerte **o** balance muy positivo **y** (cerca de drenaje **o** distrito flood-sensitive D9/D13).
- Si solo sequía: alerta municipal de **desabastecimiento / turno de riego**, no de anegamiento.

### C. UI Farmers First

1. En modo fácil, botón secundario grande: **“Preparar aviso al canal”**.  
2. Abre modal con:
   - texto listo para copiar;
   - botón **Copiar** / **Compartir** (`navigator.share` si existe);
   - audio opcional de la versión corta al productor (“Ya armamos el aviso”).  
3. Modo avanzado: panel “Para GAMC / regantes” con distrito, severidad y export JSON/texto.
4. **No** simular envío real a servidores GAMC (el proxy WMS es solo lectura); el entregable es el **mensaje + evidencia**.

### D. Offline

- Incluir `municipal_alert` (si existe) en el offline-bundle o regenerarla en cliente con datos cacheados.
- Si no hay red, permitir copiar el último aviso guardado.

## Fuera de alcance

- Integración WhatsApp Business / email institucional real.
- Escritura en GeoServer GAMC.
- Entrenar ML con datasets de inundación.

---

## Archivos probables a tocar

- `etl/realtime_weather_client.py`
- `data/zones/realtime_weather_telemetry.json` (regenerado)
- `engine/alerts.py`, `engine/recommender.py` (bundle)
- `frontend/src/components/alerts/*` — modal aviso canal
- `frontend/src/services/narration.js`
- `contracts/api_contract.json` — schema `municipal_alert`
- `tests/test_alerts.py`, `tests/test_end_to_end.py`

---

## Criterios de aceptación

- [x] El boletín expone métricas agregadas a **14 días** además de 7.
- [x] Modo fácil puede mostrar pictogramas a 14 días sin saturar la primera pantalla (detalle bajo toggle).
- [x] Cuando hay riesgo de anegamiento + drenaje/distrito, existe `municipal_alert` con `share_text`.
- [x] El productor copia/comparte el aviso en ≤ 2 toques.
- [x] Tests unitarios para: solo sequía → tema `desabastecimiento`; lluvia+drenaje → tema `anegamiento_canales`.

---

## Demo de jurado (fase 3)

1. Escenario D9 + lluvia + quebrada → productor pulsa “Preparar aviso al canal” → texto con Distrito 9.  
2. Mostrar vista 14 días en avanzado.  
3. Explicar honestamente: “No empujamos al servidor GAMC; generamos el aviso operativo con datos NASA + capas municipales.”

---

## Estimación

~1 día (ETL 14d + reglas alerta + modal compartir).

---

## Orden de ejecución global (recordatorio)

1. Fase 1 — acción de agua  
2. Fase 2 — D9/D13 + pesos periurbano/drenaje  
3. Fase 3 — regantes/GAMC + 14 días  

**No iniciar implementación hasta aprobación explícita del equipo.**
