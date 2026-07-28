'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { Noticia } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function InstitucionalAdminPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function carregar() {
    const lista = await api.get<Noticia[]>('/institucional/noticias');
    setNoticias(lista);
  }

  useEffect(() => {
    carregar().finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      await api.post('/institucional/noticias', {
        titulo: form.get('titulo'),
        conteudo: form.get('conteudo'),
      });
      (event.target as HTMLFormElement).reset();
      await carregar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar a notícia.');
    } finally {
      setIsSaving(false);
    }
  }

  async function publicar(id: string) {
    await api.patch(`/institucional/noticias/${id}/publicar`);
    await carregar();
  }

  return (
    <div className="px-10 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Site institucional</p>
      <h1 className="mb-8 mt-2 font-display text-2xl font-semibold text-slate">Conteúdo público</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold">Nova notícia</h2>
          <form onSubmit={handleSubmit}>
            <input
              name="titulo"
              required
              placeholder="Título da notícia"
              className="mb-3 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-dawn-gold"
            />
            <textarea
              name="conteudo"
              required
              rows={6}
              placeholder="Conteúdo..."
              className="mb-4 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-dawn-gold"
            />
            {error && <p className="mb-3 text-sm text-ember">{error}</p>}
            <Button type="submit" variant="dark" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar rascunho'}
            </Button>
          </form>
        </Card>

        <Card className="p-0">
          <div className="border-b border-line p-5 font-display text-lg font-semibold">
            Publicações
          </div>
          {isLoading ? (
            <p className="p-5 text-sm text-slate-soft">Carregando...</p>
          ) : (
            <ul>
              {noticias.map((noticia) => (
                <li
                  key={noticia.id}
                  className="flex items-center justify-between border-b border-line p-4 text-sm last:border-none"
                >
                  <span>{noticia.titulo}</span>
                  {noticia.publicadoEm ? (
                    <span className="text-xs text-slate-soft">publicado</span>
                  ) : (
                    <Button variant="ghost" onClick={() => publicar(noticia.id)}>
                      Publicar
                    </Button>
                  )}
                </li>
              ))}
              {noticias.length === 0 && (
                <li className="p-5 text-sm text-slate-soft">Nenhuma notícia ainda.</li>
              )}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
