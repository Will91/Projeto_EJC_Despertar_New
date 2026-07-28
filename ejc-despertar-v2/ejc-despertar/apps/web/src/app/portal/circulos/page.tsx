'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { Casal, CirculoComContagem, Encontro } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PersonPicker } from '@/components/ui/PersonPicker';

/**
 * Gestão de Círculos e Casais (padrinhos) de um encontro — o
 * "atrelamento" mencionado no briefing original. Um Casal pode
 * liderar um Círculo; aqui é possível criar ambos e vinculá-los.
 */
export default function CirculosPage() {
  const [encontro, setEncontro] = useState<Encontro | null>(null);
  const [circulos, setCirculos] = useState<CirculoComContagem[]>([]);
  const [casais, setCasais] = useState<Casal[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function carregar() {
    const ativo = await api.get<Encontro>('/encontros/ativo');
    setEncontro(ativo);
    const [listaCirculos, listaCasais] = await Promise.all([
      api.get<CirculoComContagem[]>(`/encontros/${ativo.id}/circulos`),
      api.get<Casal[]>(`/encontros/${ativo.id}/casais`),
    ]);
    setCirculos(listaCirculos);
    setCasais(listaCasais);
  }

  useEffect(() => {
    carregar().catch((err) =>
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar círculos.'),
    );
  }, []);

  async function criarCirculo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!encontro) return;
    const form = new FormData(event.currentTarget);
    try {
      await api.post('/encontros/circulos', { nome: form.get('nome'), encontroId: encontro.id });
      (event.target as HTMLFormElement).reset();
      await carregar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar círculo.');
    }
  }

  async function criarCasal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!encontro) return;
    const form = new FormData(event.currentTarget);
    try {
      await api.post('/encontros/casais', {
        encontroId: encontro.id,
        primeiroComponenteId: form.get('primeiroComponenteId'),
        segundoComponenteId: form.get('segundoComponenteId'),
      });
      (event.target as HTMLFormElement).reset();
      await carregar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar casal.');
    }
  }

  async function vincular(casalId: string, circuloId: string) {
    try {
      await api.patch(`/encontros/casais/${casalId}/circulo/${circuloId}`);
      await carregar();
    } catch {
      alert('Não foi possível vincular o casal a este círculo.');
    }
  }

  if (!encontro) return <div className="p-10 text-sm text-slate-soft">Carregando...</div>;

  return (
    <div className="px-10 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">{encontro.tema}</p>
      <h1 className="mb-8 mt-2 font-display text-2xl font-semibold text-slate">
        Círculos &amp; Casais
      </h1>

      {error && <p className="mb-4 text-sm text-ember">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ----- Círculos ----- */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold">Círculos</h2>
          <form onSubmit={criarCirculo} className="mb-5 flex gap-2">
            <input
              name="nome"
              required
              placeholder="Nome do círculo (ex: Círculo 4)"
              className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-dawn-gold"
            />
            <Button type="submit" variant="dark">
              Criar
            </Button>
          </form>
          <ul className="divide-y divide-line">
            {circulos.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                <span>{c.nome}</span>
                <span className="text-xs text-slate-soft">{c._count.inscricoes} encontristas</span>
              </li>
            ))}
            {circulos.length === 0 && (
              <li className="py-4 text-sm text-slate-soft">Nenhum círculo criado ainda.</li>
            )}
          </ul>
        </Card>

        {/* ----- Casais ----- */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold">Casais (padrinhos)</h2>
          <form onSubmit={criarCasal} className="mb-5 space-y-2">
            <PersonPicker name="primeiroComponenteId" placeholder="Buscar 1ª pessoa do casal..." />
            <PersonPicker name="segundoComponenteId" placeholder="Buscar 2ª pessoa do casal..." />
            <Button type="submit" variant="dark" className="w-full">
              Criar casal
            </Button>
          </form>
          <ul className="divide-y divide-line">
            {casais.map((casal) => (
              <li key={casal.id} className="py-3 text-sm">
                <div className="mb-1.5 font-medium">
                  {casal.primeiroComponente.nome} &amp; {casal.segundoComponente.nome}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {circulos.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => vincular(casal.id, c.id)}
                      className="rounded-full border border-line px-2.5 py-1 text-xs text-slate-soft hover:border-dawn-gold hover:text-slate"
                    >
                      Vincular a {c.nome}
                    </button>
                  ))}
                </div>
              </li>
            ))}
            {casais.length === 0 && (
              <li className="py-4 text-sm text-slate-soft">Nenhum casal cadastrado ainda.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
