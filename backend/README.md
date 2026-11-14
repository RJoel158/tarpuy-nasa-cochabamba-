# Backend API Module — Tarpuy NASA Cochabamba

**Propietario:** Rol 4 (`feat/backend-api`)  
**Rama Git:** `feat/backend-api`

## Propósito
Este directorio contiene la aplicación `FastAPI` que sirve los datos procesados y el motor agronómico, diseñada con un enfoque **offline-first** para sincronización con dispositivos móviles de campo en comunidades rurales de Cochabamba.

### Archivos y Subdirectorios Esperados:
- `main.py`: Punto de entrada de la aplicación FastAPI.
- `routers/`: Endpoints modularizados (ej. `/api/zones`, `/api/recommendations`).
- `services/`: Lógica de empaquetado offline y generación de cartillas agronómicas imprimibles en PDF.
- `../contracts/`: Definiciones JSON Schema para asegurar contratos estrictos entre backend, engine y frontend PWA.
