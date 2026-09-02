import Link from 'next/link';
import { IconInbox, IconKey, IconShield } from './Icons';

const NAV = [
  { href: '/', label: 'Financier desk', icon: IconInbox },
  { href: '/consent', label: 'AA consent', icon: IconKey }
];

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/15 text-teal">
              <IconShield className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-wide text-white">TrustFlow</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                RXIL desk · Person 3
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 rounded-full border border-line bg-ink-800/80 p-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-slate-300 transition-colors duration-200 hover:bg-ink-700 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-slate-300">Alchemy Finance Partners</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-teal">Financier session</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
}
