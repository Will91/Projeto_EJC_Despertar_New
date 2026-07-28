'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { RecursoBiblioteca, TipoRecurso } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const TIPOS: TipoRecurso[] = ['DOCUMENTO', 'FOTO', 'VIDEO', 'ORACAO', 'MUSICA', 'FORMACAO'];
const LABELS: Record<TipoRecurso, string> = {
  DOCUMENTO: 'Documento',
  FOTO: 'Foto',
  VIDEO: 'Vídeo',
  ORACAO: 'Oração',
  MUSICA: 'Música',
  FORMACAO: 'Formação',
};

export default function BibliotecaPage() {
  const [recursos, setRecursos] = useState<RecursoBiblioteca[]>([]);
  const [filtro, setFiltro] = useState<TipoRecurso | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function carregar(tipo?: TipoRecurso | null) {
    const query = tipo ? `?tipo=${tipo}` : '';
    const lista = await api.get<RecursoBiblioteca[]>(`/biblioteca${query}`);
    setRecursos(lista);
  }

  useEffect(() => {
    carregar(filtro);
  }, [filtro]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await api.post('/biblioteca', {
        titulo: form.get('titulo'),
        tipo: form.get('tipo'),
        arquivoUrl: form.get('arquivoUrl'),
        descricao: form.get('descricao') || undefined,
      });
      (event.target as HTMLFormElement).reset();
      await carregar(filtro);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao adicionar o recurso.');
    }
  }

  return (
    <div className="px-10 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Comunidade</p>
      <h1 className="mb-8 mt-2 font-display text-2xl font-semibold text-slate">Biblioteca</h1>

      <Card className="mb-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Adicionar recurso</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            name="titulo"
            required
            placeholder="Título"
            className="rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-dawn-gold"
          />
          <select
            name="tipo"
            className="rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-dawn-gold"
          >
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {LABELS[tipo]}
              </option>
            ))}
          </select>
          <input
            name="arquivoUrl"
            required
            placeholder="URL do arquivo"
            className="rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-dawn-gold sm:col-span-2"
          />
          <input
            name="descricao"
            placeholder="Descrição (opcional)"
            className="rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-dawn-gold sm:col-span-2"
          />
          {error && <p className="text-sm text-ember sm:col-span-2">{error}</p>}
          <Button type="submit" variant="dark" className="sm:col-span-2">
            Adicionar
          </Button>
        </form>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFiltro(null)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
            !filtro ? 'border-ink-night bg-ink-night text-white' : 'border-line bg-white text-slate-soft'
          }`}
        >
          Todos
        </button>
        {TIPOS.map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
              filtro === tipo
                ? 'border-ink-night bg-ink-night text-white'
                : 'border-line bg-white text-slate-soft'
            }`}
          >
            {LABELS[tipo]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {recursos.map((recurso) => (
          <a
            key={recurso.id}
            href={recurso.arquivoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-line bg-white p-4 transition hover:border-dawn-gold"
          >
            <span className="text-[10px] font-bold uppercase tracking-wide text-ember">
              {LABELS[recurso.tipo]}
            </span>
            <h3 className="mt-1 font-display text-sm font-semibold text-slate">{recurso.titulo}</h3>
            {recurso.descricao && (
              <p className="mt-1 text-xs text-slate-soft">{recurso.descricao}</p>
            )}
          </a>
        ))}
        {recursos.length === 0 && (
          <p className="text-sm text-slate-soft">Nenhum recurso encontrado.</p>
        )}
      </div>
    </div>
  );
}
