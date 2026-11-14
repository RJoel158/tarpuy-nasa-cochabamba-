---
name: tarpuy-engineering-offline
description: Estándares de ingeniería de software para arquitectura offline-first, sincronización PWA, contratos de API FastAPI y robustez de bundles en baja conectividad.
---

# Ingeniería de Software y Resiliencia Offline

Estándares y patrones de arquitectura para garantizar la operatividad de Tarpuy en zonas rurales sin conexión:

## 1. Patrón Offline-First & Cache Strategy
- **PWA Service Worker**: Estrategia *Stale-While-Revalidate* para assets estáticos y *Cache-First con fallback a IndexedDB* para datos agroclimáticos y mapas vectoriales.
- **Offline Bundles (`/api/offline-bundle/{zone_id}`)**: Asegurar empaquetado comprimido y autosuficiente de la cartilla agronómica, telemetría de 30 días, modelos de alerta temprana y glosario fonético de audio.
- **Embedded DB (IndexedDB / LocalStorage)**: Manejo robusto de persistencia local en el navegador del productor, garantizando almacenamiento de zonas favoritas y consultas sin red.

## 2. Contratos y Validación de Datos (API Contract Integrity)
- Validación estricta con Pydantic en FastAPI según `contracts/api_contract.json`.
- Esquemas inmutables entre Backend (`backend/schemas.py`) y Frontend (`frontend/src/services/apiClient.js`).
- Respuestas degradadas con gracia (graceful degradation): si falla la telemetría en tiempo real o el API externa de NASA, retornar el fallback histórico local sin arrojar errores 500 al cliente.

## 3. Seguridad, Rendimiento y Pruebas
- Sanitización de parámetros geoespaciales (latitud/longitud en rangos válidos de Bolivia/Cochabamba).
- Tests automatizados en `pytest` cubriendo end-to-end, endpoints FastAPI y consistencia de hashes de integridad.
- Cero fugas de memoria en renderizado de mapas Leaflet y componentes SVG dinámicos.

