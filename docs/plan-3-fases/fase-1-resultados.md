# Fase 1: acción de agua

Implementada en el frontend, sin cambiar contratos, claves ni el motor de rotación.
La regla independiente usa el boletín zonal y la consulta GAMC del punto GPS/mapa.
Los paquetes offline anteriores también funcionan: no requieren campos nuevos.

## Revisar

Abrir Clima en modo Fácil: «Tu chacra hoy» aparece antes del resumen de parcela.
Cambiar ES/Quechua y pulsar Escuchar; pulsar otra vez detiene la narración.
«Ver qué sembrar» abre Siembra. En modo Avanzado, desplegar «Ver datos del agua»;
el banner y el pronóstico técnico existentes se conservan.
Seleccionar un punto o GPS consulta drenaje; sin conexión o ante error se usa solo
el boletín. Cambiar zona desde el selector descarta el punto anterior.

## Reglas y matriz automatizada

| Escenario | Resultado |
|---|---|
| Mínima ≤ 2 °C, incluso con lluvia | ESPERA: helada |
| Algún día con lluvia ≥ 10 mm | CUIDADO |
| Humedad ≥ 26 % y quebrada/tributario | CUIDADO |
| Humedad < 26 % o balance ≤ −12 mm, sin drenaje identificado | RIEGA |
| Seco junto a quebrada | ESPERA: revisar canal |
| Agua aceptable | ESPERA |
| Datos ausentes o humedad inválida | ESPERA: revisar tierra |

Los límites reutilizan los indicadores de alerts.py; 26 % separa el estado de
déficit existente, no representa saturación física calibrada del suelo.
GetFeatureInfo identifica elementos en el punto consultado: no calcula distancia
hidrológica ni prueba ausencia de drenaje. Es orientación zonal, no dosis de riego.
El boletín operativo sigue siendo Open-Meteo; no se presenta como SMAP/GPM live.

## Validación

- `node --test src/services/farmerWaterAction.test.js` desde frontend: 12 casos.
- Audio: `node --test src/services/waterVoice.test.js src/services/waterAudioPack.test.js`: 3 casos adicionales; verifica WAV, hashes y coincidencia del texto en ambos idiomas.
- `python -m pytest tests/test_alerts.py -q`: 4 casos existentes.
- `corepack pnpm build` desde frontend para compilar.
- Pendiente: voz real, traducciones con hablante local y recorrido táctil 320/390 px.

La voz usa los clientes Python existentes: MMS Spanish y South Bolivian Quechua.
`python -m etl.build_water_audio` genera los siete mensajes en ambos idiomas sin
reemplazar los clips anteriores. La tarjeta reproduce esos WAV exactos; si faltan,
intenta el TTS Python y muestra error si falla, sin cambiar a voz del navegador.
El service worker guarda los 14 clips para uso offline tras una carga con conexión.
El paquete de voz de agua ocupa aproximadamente 6 MB en la primera descarga.
`node --test src/services/waterVoice.test.js` verifica la ausencia de sustitución.

No se generaron commits. Separar código de decisión/UI y voz/audio en commits de
menos de 250 líneas: `feat: agregar acción de agua para productores` y
`fix: usar voz Python en mensajes de agua`. Los WAV son archivos binarios.
No incluye fases 2 o 3.
