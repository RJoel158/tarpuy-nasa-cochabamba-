import React from "react";
import { MapPin, SlidersHorizontal, Layers, Printer } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Primitives.jsx";
import CochabambaMap from "./maps/CochabambaMap.jsx";
import PrioritySelectorGrid from "../features/producer/PrioritySelectorGrid.jsx";
import RotationCard from "../features/producer/RotationCard.jsx";
import EarlyWarningBanner from "./alerts/EarlyWarningBanner.jsx";
import DataVeracityCard from "./alerts/DataVeracityCard.jsx";

export default function ProducerMode({
  zones = [],
  zone,
  activeZoneId,
  onSelectZone,
  forceOffline = false,
  isOnline = true,
  priorities = [],
  onTogglePriority,
  irrigation,
  onChangeIrrigation,
  equipment,
  onChangeEquipment,
  strategies = [],
  bulletin = null,
  voiceLang = "qu",
  onSpeak,
  activeAudioKey,
}) {
  const currentZoneId = activeZoneId || zone?.zone_id || "punata_valle_alto";
  const indicators = zone?.monthly_harmonized_indicators || [];

  return (
    <div className="space-y-6">
      <EarlyWarningBanner
        bulletin={bulletin}
        zoneName={zone?.name}
        onSpeak={onSpeak}
        activeAudioKey={activeAudioKey}
        voiceLang={voiceLang}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Context & Input Preferences */}
        <div className="lg:col-span-5 space-y-5">
          {/* Paso 1 */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>
                <MapPin className="w-5 h-5 text-emerald-700" />
                <span>Paso 1 · ¿Dónde está tu Chacra?</span>
              </CardTitle>
              <p className="text-xs text-stone-500 mt-1">
                Toca en el mapa el municipio más cercano a tu comunidad
              </p>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <CochabambaMap
                zones={zones}
                activeZoneId={currentZoneId}
                onSelectZone={onSelectZone}
                forceOffline={forceOffline}
                isOnline={isOnline}
              />
            </CardContent>
          </Card>

          {/* Paso 2 */}
          <Card>
            <CardHeader>
              <CardTitle>
                <SlidersHorizontal className="w-5 h-5 text-emerald-700" />
                <span>Paso 2 · ¿Qué quieres cuidar en tu Tierra?</span>
              </CardTitle>
              <p className="text-xs text-stone-500 mt-1">
                Marca lo que más te importa, cómo riegas y con qué trabajas
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <PrioritySelectorGrid
                priorities={priorities}
                onTogglePriority={onTogglePriority}
                irrigation={irrigation}
                onChangeIrrigation={onChangeIrrigation}
                equipment={equipment}
                onChangeEquipment={onChangeEquipment}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Comparative Recommendations */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 leading-tight">
                  Paso 3 · Compara 3 Siembras para tu Parcela
                </h3>
                <p className="text-xs text-stone-500">
                  Tu costumbre actual vs. 2 mejoras recomendadas para cuidar suelo y agua
                </p>
              </div>
            </div>

            <a
              href={`/api/poster/${currentZoneId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 transition shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-700" />
              <span>Cartilla para Imprimir y Compartir</span>
            </a>
          </div>

          <div className="space-y-4">
            {strategies.map((strategy, idx) => (
              <RotationCard
                key={strategy.strategy_id || idx}
                strategy={strategy}
                index={idx + 1}
                indicators={indicators}
                onSpeak={onSpeak}
                activeAudioKey={activeAudioKey}
              />
            ))}
          </div>
        </div>
      </div>

      {bulletin?.veracity_manifest ? <DataVeracityCard manifest={bulletin.veracity_manifest} /> : null}
    </div>
  );
}
