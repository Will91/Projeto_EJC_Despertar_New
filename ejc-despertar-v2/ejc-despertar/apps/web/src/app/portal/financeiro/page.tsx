'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Transacao {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA';
  descricao: string;
  valorCentavos: number;
  data: string;
}

interface Saldo {
  entradasCentavos: number;
  saidasCentavos: number;
  saldoCentavos: number;
}

function formatarReais(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [saldo, setSaldo] = useState<Saldo | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function carregar() {
    const [lista, resumo] = await Promise.all([
      api.get<Transacao[]>('/financeiro/transacoes'),
      api.get<Saldo>('/financeiro/saldo'),
    ]);
    setTransacoes(lista);
    setSaldo(resumo);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const valorReais = Number(form.get('valor'));

    try {
      await api.post('/financeiro/transacoes', {
        tipo: form.get('tipo'),
        descricao: form.get('descricao'),
        valorCentavos: Math.round(valorReais * 100),
      });
      (event.target as HTMLFormElement).reset();
      await carregar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao registrar a transação.');
    }
  }

  return (
    <div className="px-10 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Módulo novo</p>
      <h1 className="mb-8 mt-2 font-display text-2xl font-semibold text-slate">Financeiro</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl bg-ink-night p-7 text-white">
          <p className="text-xs text-[#A9ACC6]">Saldo atual</p>
          <p className="mt-1.5 font-display text-3xl font-semibold">
            {saldo ? formatarReais(saldo.saldoCentavos) : '—'}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3.5">
            <span className="text-xs text-slate-soft">Entradas</span>
            <span className="font-mono text-sm font-semibold text-sage">
              {saldo ? `+ ${formatarReais(saldo.entradasCentavos)}` : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3.5">
            <span className="text-xs text-slate-soft">Saídas</span>
            <span className="font-mono text-sm font-semibold text-ember">
              {saldo ? `− ${formatarReais(saldo.saidasCentavos)}` : '—'}
            </span>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Nova movimentação</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <select
            name="tipo"
            className="rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-dawn-gold"
          >
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>
          <input
            name="descricao"
            required
            placeholder="Descrição"
            className="rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-dawn-gold sm:col-span-2"
          />
          <input
            name="valor"
            required
            type="number"
            step="0.01"
            min="0"
            placeholder="Valor (R$)"
            className="rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-dawn-gold"
          />
          <div className="sm:col-span-4">
            {error && <p className="mb-2 text-sm text-ember">{error}</p>}
            <Button type="submit" variant="dark">
              Registrar
            </Button>
          </div>
        </form>
      </Card>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-paper text-left text-xs uppercase tracking-wide text-slate-soft">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((t) => (
              <tr key={t.id} className="border-b border-line last:border-none">
                <td className="px-4 py-3 font-mono text-xs text-slate-soft">
                  {new Date(t.data).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">{t.descricao}</td>
                <td
                  className={`px-4 py-3 text-right font-mono ${
                    t.tipo === 'ENTRADA' ? 'text-sage' : 'text-ember'
                  }`}
                >
                  {t.tipo === 'ENTRADA' ? '+ ' : '− '}
                  {formatarReais(t.valorCentavos)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
