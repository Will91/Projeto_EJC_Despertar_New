import Link from 'next/link';
import type { Noticia } from '@/lib/types';

async function getNoticiasPublicadas(): Promise<Noticia[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api/v1';
  try {
    const res = await fetch(`${apiUrl}/institucional/noticias/publicadas`, {
      next: { revalidate: 60 }, // ISR — decisão da Etapa 2 (SEO da página institucional)
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return []; // API pode estar offline durante o desenvolvimento local
  }
}

export default async function HomePage() {
  const noticias = await getNoticiasPublicadas();

  return (
    <div>
      <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-gradient-to-b from-[#141830] via-ink-night to-[#2B2444] p-14 text-white">
        <div
          className="pointer-events-none absolute left-1/2 top-[55%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-sm"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, #E8A33D 0%, rgba(232,163,61,.25) 45%, transparent 72%)',
          }}
        />
        <div className="relative z-10 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-dawn-gold">
            Encontro de Jovens com Cristo
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-tight">
            Cada encontro começa antes do amanhecer.
          </h1>
          <p className="mt-4 max-w-md text-[#B9BCD4]">
            Inscrições, círculos e comunidade do Despertar — tudo em um só lugar.
          </p>
          <Link
            href="/cadastro"
            className="mt-6 inline-block rounded-lg bg-dawn-gold px-6 py-3 text-sm font-bold text-[#241A08]"
          >
            Fazer minha inscrição →
          </Link>
          <Link
            href="/formacao"
            className="mt-6 ml-3 inline-block rounded-lg border border-white/30 px-6 py-3 text-sm font-bold text-white hover:border-dawn-gold"
          >
            Já sou da equipe — ficha de formação
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-6 font-display text-2xl font-semibold text-slate">Últimas notícias</h2>
        {noticias.length === 0 ? (
          <p className="text-sm text-slate-soft">Nenhuma notícia publicada ainda.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {noticias.map((noticia) => (
              <article key={noticia.id} className="rounded-2xl border border-line bg-white p-6">
                <h3 className="font-display text-lg font-semibold text-slate">{noticia.titulo}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-soft">{noticia.conteudo}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
