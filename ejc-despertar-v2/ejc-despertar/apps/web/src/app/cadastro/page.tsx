'use client';

import { useState, FormEvent } from 'react';
import { api, ApiError } from '@/lib/api-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/**
 * Ficha do Encontrista — campos herdados 1:1 do legado (achados na
 * Etapa 4: nome, sobrenome, sexo, dataNascimento, rg, telefone, celular,
 * endereço completo, dois responsáveis, vida de fé) mais os campos
 * novos pedidos no briefing (apelido, foto, equipe, observações).
 *
 * Fluxo: cria a Pessoa e, em seguida, a Inscrição no encontro ativo.
 */
export default function CadastroPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const dataNascimento = String(form.get('dataNascimento'));

    try {
      const encontroAtivo = await api.get<{ id: string }>('/encontros/ativo', { auth: false });

      const pessoa = await api.post<{ id: string }>(
        '/pessoas',
        {
          nome: form.get('nome'),
          sobrenome: form.get('sobrenome'),
          apelido: form.get('apelido') || undefined,
          dataNascimento,
          telefone: form.get('telefone') || undefined,
          celular: form.get('celular') || undefined,
          email: form.get('email') || undefined,
          endereco: form.get('endereco') || undefined,
          responsavelNome: form.get('responsavelNome') || undefined,
          responsavelCelular: form.get('responsavelCelular') || undefined,
          observacoes: form.get('observacoes') || undefined,
        },
        { auth: false },
      );

      await api.post(
        '/encontros/inscricoes',
        { pessoaId: pessoa.id, encontroId: encontroAtivo.id },
        { auth: false },
      );

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível enviar sua ficha agora. Tente novamente em instantes.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-ember">Inscrição enviada</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate">
          Sua ficha chegou até nós! 🌅
        </h1>
        <p className="mt-3 text-sm text-slate-soft">
          A equipe da secretaria vai revisar seus dados e confirmar sua vaga em breve.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Encontros · Inscrição</p>
      <h1 className="mb-8 mt-2 font-display text-3xl font-semibold text-slate">
        Ficha do Encontrista
      </h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
            <Input name="nome" label="Nome completo" required />
            <Input name="sobrenome" label="Sobrenome" required />
            <Input name="apelido" label="Apelido" />
            <Input name="dataNascimento" label="Data de nascimento" type="date" required />
            <Input name="telefone" label="Telefone" />
            <Input name="celular" label="Celular" />
            <div className="sm:col-span-2">
              <Input name="email" label="E-mail" type="email" />
            </div>
            <div className="sm:col-span-2">
              <Input name="endereco" label="Endereço" placeholder="Rua, número, bairro, cidade" />
            </div>
            <Input name="responsavelNome" label="Nome do responsável" />
            <Input name="responsavelCelular" label="Celular do responsável" />
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-soft">
                Observações
              </label>
              <textarea
                name="observacoes"
                rows={3}
                placeholder="Restrições alimentares, saúde, observações da secretaria..."
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-dawn-gold"
              />
            </div>
          </div>

          {error && <p className="mb-4 text-sm text-ember">{error}</p>}

          <div className="mt-6 flex justify-end gap-3 border-t border-line pt-6">
            <Button type="submit" variant="dark" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Confirmar inscrição →'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
