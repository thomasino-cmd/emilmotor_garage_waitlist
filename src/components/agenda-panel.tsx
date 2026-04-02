'use client';

import { useState, useEffect } from 'react';
import { appointments, clients, vehicles } from '@/lib/mock-db';

export function AgendaPanel() {
    const [, setTick] = useState(0);

    useEffect(() => {
        const handleUpdate = () => setTick(t => t + 1);
        window.addEventListener('dashboardUpdated', handleUpdate);
        return () => window.removeEventListener('dashboardUpdated', handleUpdate);
    }, []);

    // Sort them generally by date and show all
    const futureAppointments = appointments
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <aside className="flex flex-col rounded-3xl border bg-slate-50 p-4 sticky top-6 h-[calc(100vh-3rem)]">
            <h2 className="mb-4 text-3xl font-black">Agenda (2 sett.)</h2>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                {futureAppointments.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 rounded-xl border-2 border-dashed border-slate-200">
                        <p>Nessun appuntamento in programma.</p>
                    </div>
                ) : (
                    futureAppointments.map((item) => {
                        const vehicle = vehicles.find((v) => v.id === item.vehicleId);
                        const client = vehicle ? clients.find((c) => c.id === vehicle.clientId) : null;

                        if (!vehicle || !client) return null;

                        return (
                            <div key={item.id} className="rounded-2xl border bg-white p-4 hover:border-blue-300 transition-colors shadow-sm relative overflow-hidden">
                                <p className="text-sm font-bold text-slate-500 border-b pb-2 mb-3">
                                    {new Date(item.date).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()} • {item.time}
                                </p>

                                <div className="mb-2">
                                    <p className="font-black text-lg text-slate-900 leading-tight">{client.fullName}</p>
                                    <p className="text-sm font-bold text-slate-400">{vehicle.make} {vehicle.model}</p>
                                </div>

                                {item.jobDescription && (
                                    <div className="mt-3 text-sm text-slate-700 bg-slate-50 rounded-xl p-3 border">
                                        <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Da svolgere</span>
                                        <p className="leading-snug">{item.jobDescription}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </aside>
    );
}
