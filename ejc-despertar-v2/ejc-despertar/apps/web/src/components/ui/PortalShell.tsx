'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-context';

const links = [
  { href: '/portal/inscricoes', label: 'Inscrições' },
  { href: '/portal/circulos', label: 'Círculos & Casais' },
  { href: '/portal/formacoes', label: 'Formações (equipe)' },
  { href: '/portal/institucional', label: 'Institucional' },
  { href: '/portal/comunicacao', label: 'Comunicação' },
  { href: '/portal/biblioteca', label: 'Biblioteca' },
  { href: '/portal/financeiro', label: 'Financeiro' },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <nav className="flex w-56 flex-shrink-0 flex-col gap-1 bg-ink-night p-5 text-white">
        <div className="mb-6 px-2 font-display text-lg font-semibold">
          Despertar<span className="text-dawn-gold">.</span>
        </div>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              'rounded-lg px-3 py-2.5 text-sm font-medium text-[#C7C9DA] transition hover:bg-white/5 hover:text-white',
              pathname.startsWith(link.href) && 'bg-ink-night-2 text-white shadow-[inset_3px_0_0_#E8A33D]',
            )}
          >
            {link.label}
          </Link>
        ))}
        <div className="mt-auto px-2 text-xs text-[#6C7192]">
          <p className="mb-2 truncate">{user?.email}</p>
          <button onClick={() => logout()} className="hover:text-dawn-gold">
            Sair
          </button>
        </div>
      </nav>
      <main className="flex-1 bg-paper">{children}</main>
    </div>
  );
}
