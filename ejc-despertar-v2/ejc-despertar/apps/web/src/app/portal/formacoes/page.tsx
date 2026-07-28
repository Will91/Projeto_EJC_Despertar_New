'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { FichaFormacao } from '@/lib/types';

export default function FormacoesAdminPage() {
  const [fichas, setFichas] = useState<FichaFormacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function carregar() {
    const lista = await api.get<FichaFormacao[]>('/formacoes');
    setFichas(lista);
  }

  useEffect(() => {
    carregar()
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Erro ao carregar fichas.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function remover(id: string) {
    if (!confirm('Remover esta ficha de formação?')) return;
    await api.delete(`/formacoes/${id}`);
    await carregar();
  }

  return (
    <div className="px-10 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Equipe</p>
      <h1 className="mb-2 mt-2 font-display text-2xl font-semibold text-slate">
        Fichas de Formação
      </h1>
      <p className="mb-6 text-sm text-slate-soft">
        Inscrições de equipeiros para as próximas formações.
      </p>

      {isLoading && <p className="text-sm text-slate-soft">Carregando...</p>}
      {error && <p className="text-sm text-ember">{error}</p>}

      {!isLoading && !error && (
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-paper text-left text-xs uppercase tracking-wide text-slate-soft">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Idade</th>
                <th className="px-4 py-3">Último encontro</th>
                <th className="px-4 py-3">Última equipe</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {fichas.map((ficha) => (
                <tr key={ficha.id} className="border-b border-line last:border-none">
                  <td className="px-4 py-3">{ficha.nome}</td>
                  <td className="px-4 py-3 text-slate-soft">{ficha.email}</td>
                  <td className="px-4 py-3">{ficha.idade}</td>
                  <td className="px-4 py-3">{ficha.ultimoEncontroTrabalhado}</td>
                  <td className="px-4 py-3">{ficha.ultimaEquipe}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remover(ficha.id)}
                      className="text-xs text-slate-soft hover:text-ember"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              {fichas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-soft">
                    Nenhuma ficha de formação enviada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
