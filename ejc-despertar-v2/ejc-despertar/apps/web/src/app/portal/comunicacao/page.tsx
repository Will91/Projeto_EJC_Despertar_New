'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { Aviso } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ComunicacaoPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function carregar() {
    const lista = await api.get<Aviso[]>('/comunicacao/avisos');
    setAvisos(lista);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      await api.post('/comunicacao/avisos', {
        titulo: form.get('titulo'),
        conteudo: form.get('conteudo'),
        fixado: form.get('fixado') === 'on',
      });
      (event.target as HTMLFormElement).reset();
      await carregar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao publicar o aviso.');
    } finally {
      setIsSaving(false);
    }
  }

  async function remover(id: string) {
    if (!confirm('Remover este aviso do mural?')) return;
    await api.delete(`/comunicacao/avisos/${id}`);
    await carregar();
  }

  return (
    <div className="px-10 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Comunicação</p>
      <h1 className="mb-8 mt-2 font-display text-2xl font-semibold text-slate">Mural de avisos</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold">Novo aviso</h2>
          <form onSubmit={handleSubmit}>
            <input
              name="titulo"
              required
              placeholder="Título"
              className="mb-3 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-dawn-gold"
            />
            <textarea
              name="conteudo"
              required
              rows={4}
              placeholder="Conteúdo do aviso..."
              className="mb-3 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-dawn-gold"
            />
            <label className="mb-4 flex items-center gap-2 text-sm text-slate-soft">
              <input type="checkbox" name="fixado" /> Fixar no topo do mural
            </label>
            {error && <p className="mb-3 text-sm text-ember">{error}</p>}
            <Button type="submit" variant="dark" disabled={isSaving}>
              {isSaving ? 'Publicando...' : 'Publicar aviso'}
            </Button>
          </form>
        </Card>

        <div className="space-y-3">
          {avisos.map((aviso) => (
            <Card key={aviso.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {aviso.fixado && (
                      <span className="rounded-full bg-dawn-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-dawn-gold">
                        Fixado
                      </span>
                    )}
                    <h3 className="font-display text-base font-semibold">{aviso.titulo}</h3>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-soft">{aviso.conteudo}</p>
                </div>
                <button
                  onClick={() => remover(aviso.id)}
                  className="text-xs text-slate-soft hover:text-ember"
                >
                  Remover
                </button>
              </div>
            </Card>
          ))}
          {avisos.length === 0 && (
            <p className="text-sm text-slate-soft">Nenhum aviso publicado ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
