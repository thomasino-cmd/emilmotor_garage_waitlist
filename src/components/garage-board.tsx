'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import Link from 'next/link';
import { appointments, clients, vehicles } from '@/lib/mock-db';
import { BlueprintCar } from './blueprint-car';
import { BrandLogo } from './brand-logo';
import { cn } from '@/lib/utils';
import vehiclesData from '../../public/vehicles.json';

type Column = 'In Attesa' | 'Sui Ponti' | 'Pronti';

const mapStatus: Record<string, Column> = {
  Pending: 'In Attesa',
  In_Workshop: 'Sui Ponti'
};

function Card({ id, vehicleId, isLarge = false, isClone = false }: { id: string; vehicleId: string, isLarge?: boolean, isClone?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  const vehicle = vehicles.find((v) => v.id === vehicleId)!;
  const client = clients.find((c) => c.id === vehicle.clientId)!;

  // When being dragged and NOT the floating clone, just render a faded placeholder
  // This prevents layout shifts and jumping widths
  const opacityClass = (isDragging && !isClone) ? "opacity-30" : "opacity-100";
  const draggingClass = (isDragging && !isClone) ? "bg-slate-50 border-dashed" : "bg-white hover:border-blue-300 hover:shadow-lg";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group relative flex-shrink-0 cursor-grab flex flex-col justify-between overflow-hidden rounded-3xl border shadow-sm transition-all duration-300",
        isLarge ? "w-80 p-5 min-h-[300px]" : "w-full p-4 min-h-[220px]",
        opacityClass,
        draggingClass,
        isClone ? "shadow-2xl ring-4 ring-blue-500/20 cursor-grabbing rotate-2 scale-105" : undefined
      )}
    >
      {/* Brand logo in background */}
      <div className="absolute -right-8 -top-12 opacity-[0.04] pointer-events-none">
        <BrandLogo brand={vehicle.make} className={isLarge ? "h-80 w-80" : "h-64 w-64"} />
      </div>

      {/* Top action button (go to detail) overlay */}
      <div className="absolute left-4 top-4 z-20" onPointerDown={e => e.stopPropagation()}>
        <Link href={`/vehicle/${vehicle.id}`} className="flex items-center justify-center rounded-full bg-slate-100 h-10 w-10 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white hover:shadow-md">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center z-10 w-full relative">
        {(() => {
          const vData = vehiclesData.find(vd => vd.brand === vehicle.make && vd.model === vehicle.model);
          if (vData && vData.imagePath) {
            return (
              <div className={cn("relative flex items-center justify-center w-full", isLarge ? "mb-4 h-44" : "mb-3 h-32")}>
                <img src={vData.imagePath} alt={`${vehicle.make} ${vehicle.model}`} className="max-h-full max-w-full object-contain drop-shadow-xl transition-transform group-hover:scale-110 duration-500" />
              </div>
            )
          }
          return <BlueprintCar shape={vehicle.blueprintShape || 'sedan'} color={vehicle.color || '#3b82f6'} className={cn("w-full transition-transform group-hover:scale-105 duration-300", isLarge ? "mb-4 h-40" : "mb-3 h-28")} />
        })()}
      </div>

      <div className="relative z-20 pt-2 border-t border-slate-100 bg-white/80">
        <p className={cn("font-black tracking-tight text-slate-900 leading-tight mb-1 truncate", isLarge ? "text-xl" : "text-lg")}>{client.fullName}</p>
        <div className="flex justify-between items-end mt-1 relative h-6">
          <p className={cn("font-bold text-slate-500 truncate pr-2 absolute bottom-0", isLarge ? "text-base" : "text-sm")}>{vehicle.make} {vehicle.model}</p>
          <BrandLogo brand={vehicle.make} className={cn("text-slate-300 flex-shrink-0 drop-shadow-sm absolute right-0 bottom-[-10px]", isLarge ? "h-32 w-32" : "h-28 w-28")} />
        </div>
      </div>
    </div>
  );
}

function HorizontalLane({ title, ids }: { title: Column; ids: string[] }) {
  const { setNodeRef } = useDroppable({ id: title });
  return (
    <div className="mb-6 rounded-3xl border-2 border-blue-100 bg-blue-50/30 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-black text-blue-950 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white">{ids.length}</span>
          {title} <span className="text-blue-600/60">(In Lavorazione)</span>
        </h3>
      </div>
      <div
        ref={setNodeRef}
        className="flex min-h-[220px] items-stretch gap-4 overflow-x-auto pb-4 pt-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {ids.length === 0 ? (
          <div className="flex w-full items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 text-blue-400">
            Nessun veicolo sui ponti. Trascina qui un veicolo per iniziare il lavoro.
          </div>
        ) : (
          ids.map((id) => {
            const appt = appointments.find((a) => a.id === id)!;
            return <Card key={id} id={id} vehicleId={appt.vehicleId} isLarge />;
          })
        )}
      </div>
    </div>
  );
}

function VerticalLane({ title, ids, accentColor = "slate" }: { title: Column; ids: string[], accentColor?: "slate" | "green" }) {
  const { setNodeRef } = useDroppable({ id: title });

  const accentClasses = {
    slate: "border-slate-200 bg-slate-100",
    green: "border-emerald-200 bg-emerald-50/50"
  };

  const textClasses = {
    slate: "text-slate-800",
    green: "text-emerald-900"
  };

  return (
    <div className={cn("flex flex-col rounded-3xl border p-4", accentClasses[accentColor])}>
      <h3 className={cn("mb-4 text-xl font-black flex items-center justify-between", textClasses[accentColor])}>
        {title}
        <span className="rounded-full bg-white px-3 py-1 text-sm shadow-sm">{ids.length}</span>
      </h3>
      <div ref={setNodeRef} className="flex min-h-[400px] flex-col gap-3">
        {ids.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-slate-400">
            Vuoto
          </div>
        )}
        {ids.map((id) => {
          const appt = appointments.find((a) => a.id === id)!;
          return <Card key={id} id={id} vehicleId={appt.vehicleId} />;
        })}
      </div>
    </div>
  );
}

export function GarageBoard() {
  const initial = {
    'In Attesa': appointments.filter((a) => mapStatus[a.status] === 'In Attesa').map((a) => a.id),
    'Sui Ponti': appointments.filter((a) => mapStatus[a.status] === 'Sui Ponti').map((a) => a.id),
    Pronti: [] as string[]
  };

  const [columns, setColumns] = useState<Record<Column, string[]>>(initial);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setColumns((prev) => {
        const freshInAttesa = appointments.filter((a) => mapStatus[a.status] === 'In Attesa').map((a) => a.id);
        const newInAttesa = freshInAttesa.filter(id => !prev['Sui Ponti'].includes(id) && !prev['Pronti'].includes(id));
        return {
          ...prev,
          'In Attesa': newInAttesa
        };
      });
    };
    window.addEventListener('dashboardUpdated', handleUpdate);
    return () => window.removeEventListener('dashboardUpdated', handleUpdate);
  }, []);

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const to = event.over?.id as Column | undefined;
    const active = event.active.id as string;
    if (!to) return;

    setColumns((state) => {
      const from = (Object.keys(state) as Column[]).find((k) => state[k].includes(active));
      if (!from || from === to) return state; // Don't update if dropped in same column
      return {
        ...state,
        [from]: state[from].filter((id) => id !== active),
        [to]: [...state[to], active]
      };
    });
  };

  // Find active appointment for the overlay
  const activeAppt = activeId ? appointments.find(a => a.id === activeId) : null;
  // Determine if it was dragged from the large 'Sui Ponti' horizontal lane
  const wasLarge = activeId ? columns['Sui Ponti'].includes(activeId) : false;

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex flex-col gap-4">
        {/* Top High Priority Area */}
        <HorizontalLane title="Sui Ponti" ids={columns['Sui Ponti']} />

        {/* Bottom Split Area */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <VerticalLane title="In Attesa" ids={columns['In Attesa']} accentColor="slate" />
          <VerticalLane title="Pronti" ids={columns.Pronti} accentColor="green" />
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeId && activeAppt ? (
          <Card id={activeId} vehicleId={activeAppt.vehicleId} isLarge={wasLarge} isClone={true} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
