'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api-client';
import type { Pessoa } from '@/lib/types';

interface PersonPickerProps {
  name: string;
  placeholder: string;
  onSelect?: (pessoa: Pessoa) => void;
}

/**
 * Campo de busca com autocomplete, consumindo `GET /pessoas?search=`
 * (já existia na API desde a Etapa 5). Substitui o campo de "cole o
 * ID aqui" que era um placeholder temporário na tela de Círculos.
 * O ID da pessoa selecionada vai num <input type="hidden"> — o
 * formulário continua sendo submetido via FormData normalmente.
 */
export function PersonPicker({ name, placeholder, onSelect }: PersonPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Pessoa[]>([]);
  const [selected, setSelected] = useState<Pessoa | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!query || selected) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await api.get<{ items: Pessoa[] }>(
        `/pessoas?search=${encodeURIComponent(query)}&pageSize=6`,
      );
      setResults(res.items);
      setIsOpen(true);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, selected]);

  function escolher(pessoa: Pessoa) {
    setSelected(pessoa);
    setQuery(`${pessoa.nome} ${pessoa.sobrenome}`);
    setIsOpen(false);
    onSelect?.(pessoa);
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selected?.id ?? ''} />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(null);
        }}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-dawn-gold"
      />
      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-line bg-white shadow-lg">
          {results.map((pessoa) => (
            <li key={pessoa.id}>
              <button
                type="button"
                onClick={() => escolher(pessoa)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-paper-2"
              >
                {pessoa.nome} {pessoa.sobrenome}
                {pessoa.email && <span className="text-slate-soft"> — {pessoa.email}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
