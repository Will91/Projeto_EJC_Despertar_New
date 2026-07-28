'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { DashboardInscricoes, Encontro, Inscricao } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function InscricoesPage() {
  const [encontro, setEncontro] = useState<Encontro | null>(null);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [dashboard, setDashboard] = useState<DashboardInscricoes | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const ativo = await api.get<Encontro>('/encontros/ativo');
        setEncontro(ativo);

        const [lista, dash] = await Promise.all([
          api.get<Inscricao[]>(`/encontros/${ativo.id}/inscricoes`),
          api.get<DashboardInscricoes>(`/encontros/${ativo.id}/dashboard`),
        ]);
        setInscricoes(lista);
        setDashboard(dash);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Erro ao carregar as inscrições.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function confirmar(inscricaoId: string) {
    try {
      const atualizada = await api.patch<Inscricao>(`/encontros/inscricoes/${inscricaoId}/confirmar`);
      setInscricoes((prev) => prev.map((i) => (i.id === inscricaoId ? atualizada : i)));
    } catch {
      alert('Não foi possível confirmar esta inscrição.');
    }
  }

  const filtradas = inscricoes.filter((i) => {
    const matchStatus = !statusFilter || i.status === statusFilter;
    const nomeCompleto = `${i.pessoa.nome} ${i.pessoa.sobrenome}`.toLowerCase();
    const matchSearch = !search || nomeCompleto.includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (isLoading) return <div className="p-10 text-sm text-slate-soft">Carregando...</div>;
  if (error) return <div className="p-10 text-sm text-ember">{error}</div>;
  if (!encontro) return <div className="p-10 text-sm text-slate-soft">Nenhum encontro ativo.</div>;

  return (
    <div className="px-10 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ember">
            {encontro.tema}
          </p>
          <h1 className="font-display text-2xl font-semibold text-slate">Painel de Inscrições</h1>
        </div>
        <div className="flex gap-2">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/admin/encontros/${encontro.id}/exportar/excel`}
            className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-slate hover:bg-paper-2"
          >
            Exportar Excel
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/admin/encontros/${encontro.id}/exportar/pdf`}
            className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-slate hover:bg-paper-2"
          >
            Exportar PDF
          </a>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-dawn-gold bg-gradient-to-b from-[#FFF8EC] to-white p-4">
          <div className="font-display text-2xl font-semibold text-slate">{dashboard?.total ?? 0}</div>
          <div className="mt-0.5 text-xs text-slate-soft">Inscritos totais</div>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <div className="font-display text-2xl font-semibold text-slate">
            {dashboard?.porStatus.CONFIRMADO ?? 0}
          </div>
          <div className="mt-0.5 text-xs text-slate-soft">Confirmados</div>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <div className="font-display text-2xl font-semibold text-slate">
            {dashboard?.porStatus.PENDENTE ?? 0}
          </div>
          <div className="mt-0.5 text-xs text-slate-soft">Pendentes</div>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <div className="font-display text-2xl font-semibold text-slate">
            {dashboard?.porStatus.RECUSADO ?? 0}
          </div>
          <div className="mt-0.5 text-xs text-slate-soft">Recusados</div>
        </div>
      </div>

      <div className="mb-3.5 flex items-center gap-2.5">
        <input
          type="search"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-dawn-gold"
        />
        {[null, 'CONFIRMADO', 'PENDENTE', 'RECUSADO'].map((status) => (
          <button
            key={status ?? 'todos'}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
              statusFilter === status
                ? 'border-ink-night bg-ink-night text-white'
                : 'border-line bg-white text-slate-soft'
            }`}
          >
            {status ?? 'Todos'}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-paper text-left text-xs uppercase tracking-wide text-slate-soft">
              <th className="px-4 py-3">Encontrista</th>
              <th className="px-4 py-3">Círculo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((inscricao) => (
              <tr key={inscricao.id} className="border-b border-line last:border-none">
                <td className="px-4 py-3">
                  {inscricao.pessoa.nome} {inscricao.pessoa.sobrenome}
                </td>
                <td className="px-4 py-3 text-slate-soft">{inscricao.circulo?.nome ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={inscricao.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {inscricao.status === 'PENDENTE' && (
                    <Button variant="ghost" onClick={() => confirmar(inscricao.id)}>
                      Confirmar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-soft">
                  Nenhum encontrista encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
