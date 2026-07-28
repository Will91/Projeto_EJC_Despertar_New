'use client';

import { useState, FormEvent } from 'react';
import { api } from '@/lib/api-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    // Sempre mostra a mesma mensagem de sucesso, exista ou não o e-mail
    // (mesma lógica de não revelar contas existentes usada no login).
    await api.post('/auth/forgot-password', { email }, { auth: false }).catch(() => undefined);
    setEnviado(true);
    setIsSubmitting(false);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm items-center justify-center px-6">
      {enviado ? (
        <div className="text-center">
          <h1 className="font-display text-xl font-semibold text-slate">Verifique seu e-mail</h1>
          <p className="mt-2 text-sm text-slate-soft">
            Se {email} estiver cadastrado, você vai receber um link para redefinir sua senha.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full">
          <h1 className="mb-1 font-display text-xl font-semibold text-slate">Esqueci minha senha</h1>
          <p className="mb-6 text-sm text-slate-soft">
            Informe seu e-mail para receber o link de redefinição.
          </p>
          <Input
            label="E-mail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="dark" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar link'}
          </Button>
        </form>
      )}
    </div>
  );
}
