# Frontend PWA Module — Tarpuy NASA Cochabamba

**Propietarios:** Rol 5 (`feat/frontend-producer`) y Rol 6 (`feat/frontend-technical-pitch`)  
**Ramas Git:** `feat/frontend-producer` / `feat/frontend-technical-pitch`

## Propósito
Aplicación web progresiva (PWA) construida con **React, Vite, Tailwind CSS y Leaflet**, optimizada para operar completamente sin internet en zonas rurales y ofrecer doble experiencia de usuario.

### Estructura y Vistas Principales:
- `src/producer/` (**Rol 5**): Interfaz ultraselectiva de **Modo Productor** basada en íconos visuales claros, navegación táctil simplificada y reproductor de audio integrado en Quechua y Español.
- `src/technical/` (**Rol 6**): Interfaz de **Modo Técnico/Jurado** con mapa interactivo `Leaflet`, análisis espacial detallado, gráficas de series temporales climáticas y visualización del pitch y materiales del NASA Space Apps Challenge.
- `src/service-worker.js`: Estrategia de caché `CacheFirst` / `StaleWhileRevalidate` con almacenamiento local en `IndexedDB` para funcionamiento offline.
- `docs/`: Materiales adicionales, capturas y guías para el jurado.
