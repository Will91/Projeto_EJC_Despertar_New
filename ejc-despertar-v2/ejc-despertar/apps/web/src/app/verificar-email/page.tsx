'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api-client';

function VerificarEmailPageContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'carregando' | 'sucesso' | 'erro'>('carregando');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('erro');
      setMensagem('Link inválido — token não encontrado.');
      return;
    }
    api
      .post('/auth/verify-email', { token }, { auth: false })
      .then(() => setStatus('sucesso'))
      .catch((err) => {
        setStatus('erro');
        setMensagem(err instanceof ApiError ? err.message : 'Não foi possível confirmar seu e-mail.');
      });
  }, [token]);

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      {status === 'carregando' && <p className="text-sm text-slate-soft">Confirmando seu e-mail...</p>}
      {status === 'sucesso' && (
        <>
          <h1 className="font-display text-2xl font-semibold text-slate">E-mail confirmado! 🌅</h1>
          <p className="mt-2 text-sm text-slate-soft">Sua conta já está pronta para uso.</p>
          <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-ember">
            Ir para o login →
          </Link>
        </>
      )}
      {status === 'erro' && (
        <>
          <h1 className="font-display text-2xl font-semibold text-slate">Não foi possível confirmar</h1>
          <p className="mt-2 text-sm text-ember">{mensagem}</p>
        </>
      )}
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-slate-soft">Carregando...</div>}>
      <VerificarEmailPageContent />
    </Suspense>
  );
}
