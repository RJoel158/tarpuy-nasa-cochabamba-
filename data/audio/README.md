# Audio Clips (Quechua Cochabambino & Español) — Tarpuy NASA Cochabamba

**Propietario:** Rol 3 (`feat/engine-agronomy`) en coordinación con Roles 5 y 6.  
**Rama Git:** `feat/engine-agronomy`

## Propósito y Formato
Este directorio almacena los clips de audio ligeros en formato `.mp3` u `.ogg` (bajos bits per second / alta compresión de voz) para habilitar la accesibilidad auditiva bilingüe (**Quechua cochabambino** y **Español**) en comunidades rurales con baja alfabetización.

### Convenciones de Nomenclatura y Estructura:
- `es/`: Audios explicativos en idioma Español (ej. `rotation_sipe_sipe_1.mp3`).
- `qu/`: Audios explicativos en idioma Quechua cochabambino (ej. `rotation_sipe_sipe_1_qu.mp3`).
- Los clips deben mantenerse ligeros (< 500 KB por archivo) para permitir su empaquetamiento completo en el bundle offline de la PWA (`IndexedDB` / Service Worker).
