import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b-4 border-orange-600 bg-orange-500 px-6 py-4 shadow-md">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm uppercase italic">Emil Motor</h1>
          </div>
          <nav className="flex gap-2">
            <Link href="/" className="rounded-xl bg-orange-600 border border-orange-400 px-4 py-2 text-lg font-bold text-white hover:bg-orange-700 transition-colors shadow-sm">Garage</Link>
            <Link href="/ufficio" className="rounded-xl bg-orange-600 border border-orange-400 px-4 py-2 text-lg font-bold text-white hover:bg-orange-700 transition-colors shadow-sm">Ufficio</Link>
          </nav>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </body>
    </html>
  );
}
