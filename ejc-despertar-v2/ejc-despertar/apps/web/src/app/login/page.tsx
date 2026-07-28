'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Lado visual — mesmo conceito de "amanhecer" do protótipo */}
      <div className="relative hidden flex-1 items-end overflow-hidden bg-gradient-to-b from-[#141830] via-ink-night to-[#2B2444] p-14 lg:flex">
        <div
          className="pointer-events-none absolute left-1/2 top-[62%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-sm"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, #E8A33D 0%, rgba(232,163,61,.25) 45%, transparent 72%)',
          }}
        />
        <div className="relative z-10 max-w-md">
          <p className="font-mono text-xs uppercase tracking-widest text-dawn-gold">
            Encontro de Jovens com Cristo
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-white">
            Cada encontro começa antes do amanhecer.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#B9BCD4]">
            Portal único de inscrições, círculos, comunicação e gestão do Despertar.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 items-center justify-center bg-ink-night p-10">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl text-white">Entrar</h2>
          <p className="mb-7 mt-1 text-sm text-[#9FA3C0]">
            Acesse com o e-mail cadastrado na sua equipe ou como encontrista.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-[#C7C9DA]">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full rounded-lg border border-[#3B3F5C] bg-[#20243D] px-3 py-2.5 text-sm text-white outline-none focus:border-dawn-gold"
              />
            </div>
            <div className="mb-2">
              <label className="mb-1.5 block text-xs font-semibold text-[#C7C9DA]">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#3B3F5C] bg-[#20243D] px-3 py-2.5 text-sm text-white outline-none focus:border-dawn-gold"
              />
            </div>

            {error && <p className="mb-3 text-sm text-[#F0A98A]">{error}</p>}

            <Button type="submit" variant="primary" className="mt-3 w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="mt-4 flex justify-between text-xs text-[#9FA3C0]">
              <Link href="/cadastro" className="hover:text-dawn-gold">
                Fazer minha ficha de inscrição
              </Link>
              <Link href="/esqueci-senha" className="hover:text-dawn-gold">
                Esqueci minha senha
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
