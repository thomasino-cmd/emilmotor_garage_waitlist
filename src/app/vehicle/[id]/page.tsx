'use client';

import React from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { clients, jobs as jobsDb, vehicles, appointments as appointmentsDb } from '@/lib/mock-db';
import { TagToggleGrid } from '@/components/tag-toggle-grid';
import { BrandLogo } from '@/components/brand-logo';
import { BlueprintCar } from '@/components/blueprint-car';
import vehiclesData from '../../../../public/vehicles.json';

export default function VehicleProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const vehicle = vehicles.find((v) => v.id === id)!;
  const client = clients.find((c) => c.id === vehicle.clientId)!;
  const history = jobsDb.filter((j) => j.vehicleId === vehicle.id).sort((a, b) => b.kilometers - a.kilometers);
  const last = history[0];
  const lastTagliando = history.find((j) => j.tags.includes('Tagliando'));

  const [km, setKm] = React.useState(last?.kilometers ?? 0);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [notes, setNotes] = React.useState('');
  const [price, setPrice] = React.useState<number>(0);
  const [bill, setBill] = React.useState(true);

  const kmInvalid = last && km < last.kilometers;
  const tagliandoOld = lastTagliando
    ? (new Date().getTime() - new Date(lastTagliando.date).getTime()) / (1000 * 60 * 60 * 24) > 365 || (last?.kilometers ?? 0) - lastTagliando.kilometers > 15000
    : false;

  const handleSave = () => {
    const newJob = {
      id: `j${Date.now()}`,
      vehicleId: vehicle.id,
      date: new Date().toISOString().split('T')[0],
      kilometers: km,
      tags: selectedTags,
      notes,
      price,
      isBilled: !bill
    };

    // 1. Add to history
    jobsDb.push(newJob);

    // 2. Mark any active appointments for this vehicle as completed
    // so they are removed from "In Attesa" or "Sui Ponti"
    const activeAppts = appointmentsDb.filter(a => a.vehicleId === vehicle.id && a.status !== 'Completed');
    activeAppts.forEach(appt => {
      appt.status = 'Completed';
    });

    // 3. Dispatch global event to update Agenda / Board
    window.dispatchEvent(new Event('dashboardUpdated'));

    // 4. Go back to Home
    router.push('/');
  };

  const vData = vehiclesData.find(vd => vd.brand === vehicle.make && vd.model === vehicle.model);

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Torna al Garage
        </Link>
      </div>

      <header className="rounded-3xl border bg-slate-50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative shadow-sm">
        {/* Background Logo */}
        <div className="absolute -right-16 -bottom-16 opacity-[0.03] pointer-events-none">
          <BrandLogo brand={vehicle.make} className="h-[400px] w-[400px]" />
        </div>

        <div className="z-10 relative flex-1">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-2">
            {vehicle.make} {vehicle.model}
          </h2>
          <p className="text-xl font-bold text-slate-400 mb-6">Anno: {vehicle.year || 'N/D'}</p>

          <div className="inline-block bg-white rounded-2xl px-6 py-4 shadow-sm border border-slate-100">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
            <p className="text-2xl font-black text-slate-800">{client.fullName}</p>
          </div>
        </div>

        <div className="w-full md:w-1/2 h-56 md:h-72 relative flex items-center justify-center z-10 perspective-1000">
          {vData && vData.imagePath ? (
            <Image 
              src={vData.imagePath} 
              alt={`${vehicle.make} ${vehicle.model}`} 
              fill
              className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <BlueprintCar shape={vehicle.blueprintShape || 'sedan'} color={vehicle.color || '#3b82f6'} className="w-full h-full hover:scale-105 transition-transform duration-500" />
          )}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[7fr_3fr]">
        <section className="rounded-3xl border p-4">
          <h3 className="mb-3 text-2xl font-black">Nuovo Intervento · 3 Step</h3>
          <label className="text-sm font-bold">1) Chilometri</label>
          <input
            type="number"
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
            className={`mb-3 mt-1 min-h-16 w-full rounded-xl border-4 px-4 text-4xl font-black ${kmInvalid ? 'border-red-500' : 'border-slate-200'}`}
          />
          {kmInvalid && <p className="mb-2 font-bold text-red-600">Attenzione: KM inferiore all&apos;ultimo intervento.</p>}

          <label className="text-sm font-bold">2) Tag intervento</label>
          <div className="my-2"><TagToggleGrid value={selectedTags} onChange={setSelectedTags} /></div>

          <label className="text-sm font-bold">3) Billing & Save</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note lavoro" className="mt-1 min-h-28 w-full rounded-xl border-2 p-3 text-lg" />
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Prezzo Finale €" className="mt-2 min-h-14 w-full rounded-xl border-2 px-4 text-2xl font-bold" />
          <label className="mt-3 flex items-center gap-3 text-xl font-bold">
            <input type="checkbox" checked={bill} onChange={(e) => setBill(e.target.checked)} className="h-7 w-7" /> Da Fatturare
          </label>
          <button onClick={handleSave} className="mt-4 min-h-16 w-full rounded-2xl bg-blue-700 text-3xl font-black text-white hover:bg-blue-800 transition">SALVA</button>
        </section>

        <section className="rounded-3xl border bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-2xl font-black">Timeline Interventi</h3>
            {tagliandoOld && <span className="rounded-full bg-amber-200 px-3 py-1 text-sm font-bold">⚠ Tagliando oltre soglia</span>}
          </div>
          <div className="space-y-3">
            {history.map((job) => (
              <article key={job.id} className="rounded-2xl border bg-white p-3">
                <p className="font-bold">{job.date} · {job.kilometers.toLocaleString()} km</p>
                <div className="my-2 flex flex-wrap gap-2">
                  {job.tags.map((tag) => <span key={tag} className="rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">{tag}</span>)}
                </div>
                <p className="text-sm text-slate-700">{job.notes}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
