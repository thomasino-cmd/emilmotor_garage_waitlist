'use client';

import React from 'react';
import { BlueprintCar } from './blueprint-car';
import { BlueprintShape } from '@/lib/types';
import { vehicles } from '@/lib/mock-db';
import vehiclesData from '../../public/vehicles.json';

const SHAPES: BlueprintShape[] = ['compact', 'sedan', 'wagon', 'suv', 'van', 'sport'];
const COLORS = ['#2563eb', '#dc2626', '#0f766e', '#7c3aed', '#f59e0b', '#374151'];

function mockApiLookup(plate: string) {
  const map: Record<string, { make: string; model: string; year: number }> = {
    ZZ000ZZ: { make: 'BMW', model: 'Serie 1', year: 2022 },
    AA111AA: { make: 'Toyota', model: 'Yaris', year: 2021 }
  };
  return map[plate] ?? { make: 'Ford', model: 'Focus', year: 2018 };
}

export function VehicleLookup() {
  const [plate, setPlate] = React.useState('');
  const [result, setResult] = React.useState<{ make: string; model: string; year: number } | null>(null);
  const [shape, setShape] = React.useState<BlueprintShape>('compact');
  const [color, setColor] = React.useState(COLORS[0]);

  const onFind = () => {
    const local = vehicles.find((v) => v.licensePlate === plate.toUpperCase());
    if (local) {
      setResult({ make: local.make, model: local.model, year: local.year || new Date().getFullYear() });
      setShape(local.blueprintShape || 'compact');
      setColor(local.color || COLORS[0]);
      return;
    }

    setResult(mockApiLookup(plate.toUpperCase()));
  };

  return (
    <div className="rounded-2xl border bg-white p-4">
      <h3 className="mb-3 text-2xl font-black">Inserimento Veicolo</h3>
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="Targa (es. AB123CD)"
          className="min-h-14 rounded-xl border-2 px-4 text-2xl font-bold uppercase"
        />
        <button onClick={onFind} className="min-h-14 rounded-xl bg-blue-600 px-6 text-2xl font-black text-white">Trova Modello</button>
      </div>

      {result && (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <div className="rounded-xl border p-3 flex flex-col items-center justify-center">
            <p className="text-lg font-bold">{result.make} {result.model}</p>
            <p>{result.year}</p>
            {(() => {
              const vData = vehiclesData.find(vd => vd.brand === result.make && vd.model === result.model);
              if (vData && vData.imagePath) {
                return (
                  <div className="relative flex items-center justify-center h-24 mb-2 mt-2 w-full">
                    <img src={vData.imagePath} alt={`${result.make} ${result.model}`} className="max-h-full max-w-full object-contain drop-shadow-md" />
                  </div>
                )
              }
              return <BlueprintCar shape={shape} color={color} />
            })()}
          </div>
          <div className="rounded-xl border p-3 lg:col-span-2">
            <p className="mb-2 font-bold">In caso di modello non in database o personalizzazioni temporanee, puoi selezionare una sagoma di base qui sotto:</p>
            <p className="mb-2 font-bold">Seleziona sagoma</p>
            <div className="grid grid-cols-3 gap-2">
              {SHAPES.map((s) => (
                <button key={s} onClick={() => setShape(s)} className={`min-h-12 rounded-lg border-2 ${shape === s ? 'border-blue-700 bg-blue-100' : 'border-slate-300'}`}>
                  {s}
                </button>
              ))}
            </div>
            <p className="mb-2 mt-3 font-bold">Colore</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} aria-label={c} onClick={() => setColor(c)} className="h-12 w-12 rounded-full border-4" style={{ backgroundColor: c, borderColor: color === c ? '#0f172a' : '#e2e8f0' }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
