'use client';

import { useState, FormEvent } from 'react';
import { api, ApiError } from '@/lib/api-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/**
 * Ficha simplificada para quem JÁ trabalha no encontro (equipeiros)
 * se inscrever numa formação — pedido explicitamente separado da
 * ficha do encontrista (/cadastro), por ser um público diferente.
 */
export default function FormacaoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      await api.post(
        '/formacoes',
        {
          nome: form.get('nome'),
          email: form.get('email'),
          idade: Number(form.get('idade')),
          ultimoEncontroTrabalhado: form.get('ultimoEncontroTrabalhado'),
          ultimaEquipe: form.get('ultimaEquipe'),
        },
        { auth: false },
      );
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Não foi possível enviar sua ficha. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-ember">Ficha enviada</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate">
          Inscrição na formação recebida! 🌅
        </h1>
        <p className="mt-3 text-sm text-slate-soft">
          A coordenação vai usar seus dados para organizar a próxima formação.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-14">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Equipe · Formação</p>
      <h1 className="mb-2 mt-2 font-display text-3xl font-semibold text-slate">
        Ficha de Formação
      </h1>
      <p className="mb-8 text-sm text-slate-soft">
        Para quem já trabalha no encontro e vai participar de uma formação.
      </p>

      <Card>
        <form onSubmit={handleSubmit}>
          <Input name="nome" label="Nome completo" required />
          <Input name="email" label="E-mail" type="email" required />
          <Input name="idade" label="Idade" type="number" min={14} max={120} required />
          <Input
            name="ultimoEncontroTrabalhado"
            label="Último encontro que trabalhou"
            placeholder="Ex: Despertar 46"
            required
          />
          <Input
            name="ultimaEquipe"
            label="Última equipe que trabalhou"
            placeholder="Ex: Liturgia, Cozinha, Coordenação..."
            required
          />

          {error && <p className="mb-4 text-sm text-ember">{error}</p>}

          <div className="mt-2 flex justify-end border-t border-line pt-6">
            <Button type="submit" variant="dark" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar ficha →'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
