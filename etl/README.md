# ETL Module — Tarpuy NASA Cochabamba

**Propietarios:** Rol 1 (`feat/etl-climate`) y Rol 2 (`feat/etl-geospatial`)  
**Rama Git:** `feat/etl-climate` / `feat/etl-geospatial`

## Propósito
Este directorio contiene los scripts de extracción, transformación y carga (ETL) para conectar, descargar y procesar las fuentes de datos abiertos de la NASA y globales requeridas para el altiplano y valles de Cochabamba.

### Archivos y Subdirectorios Esperados:
- `climate/`: Ingesta de `NASA POWER API`, `GPM/IMERG` (precipitación) y `GLDAS` (temperatura y humedad superficial).
- `geospatial/`: Procesamiento raster y vectorial de `SMAP` (humedad de suelo), `MODIS / Sentinel-2` (NDVI y vigor vegetal), `SRTM` (elevación y pendientes) y `ECOSTRESS`.
- `nasa_power.py`: Conector principal para series temporales climáticas.
- `smap_modis.py`: Fusión de índices de vegetación y humedad.
- `srtm.py`: Análisis topográfico por zonas agrícolas de Cochabamba.
- `raw/` (excluido en `.gitignore`): Almacenamiento temporal de rasters brutos (`.tif`, `.nc`, etc.).
