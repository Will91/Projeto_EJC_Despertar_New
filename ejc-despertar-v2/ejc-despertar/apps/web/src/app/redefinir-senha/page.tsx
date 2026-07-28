'use client';

import { Suspense } from 'react';
import { useState, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function RedefinirSenhaPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword }, { auth: false });
      router.push('/login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível redefinir sua senha.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full">
        <h1 className="mb-1 font-display text-xl font-semibold text-slate">Nova senha</h1>
        <p className="mb-6 text-sm text-slate-soft">Escolha uma nova senha para sua conta.</p>
        <Input
          label="Nova senha"
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {error && <p className="mb-3 text-sm text-ember">{error}</p>}
        <Button type="submit" variant="dark" className="w-full" disabled={isSubmitting || !token}>
          {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
        </Button>
        {!token && <p className="mt-3 text-xs text-ember">Link inválido — token não encontrado.</p>}
      </form>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-slate-soft">Carregando...</div>}>
      <RedefinirSenhaPageContent />
    </Suspense>
  );
}
