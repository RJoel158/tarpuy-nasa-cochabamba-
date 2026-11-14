# Agronomy Engine Module — Tarpuy NASA Cochabamba

**Propietario:** Rol 3 (`feat/engine-agronomy`)  
**Rama Git:** `feat/engine-agronomy`

## Propósito
Este directorio contiene el motor agronómico y de decisión que procesa los datos normalizados de la NASA para generar recomendaciones comparativas de **al menos 3 estrategias de rotación de cultivos** adaptadas a las condiciones agroecológicas de Cochabamba (Sipe Sipe, Tiraque, Arani, Mizque, etc.).

### Archivos y Subdirectorios Esperados:
- `engine.py`: Lógica central de cálculo de brechas hídricas, riesgos de helada/sequía y puntuación de rotación.
- `rotations.py`: Reglas agronómicas para cultivos andinos (Papa, Maíz, Quinua, Habas, Arveja, Oca).
- `audio_generator.py` (o scripts de síntesis): Generación y estructuración de guiones bilingües (Español / Quechua cochabambino).
- `../data/crops_cochabamba.json`: Base de conocimiento estructurada de cultivos, requerimientos hídricos y rotaciones recomendadas.
