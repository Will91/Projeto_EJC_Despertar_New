// Tipos espelham os DTOs/entidades do backend (apps/api).
// Em um monorepo real, isso viraria um pacote @ejc-despertar/shared-types
// compartilhado entre web e api — omitido aqui para simplificar o setup inicial.

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Pessoa {
  id: string;
  nome: string;
  sobrenome: string;
  apelido?: string | null;
  email?: string | null;
  telefone?: string | null;
}

export type StatusConfirmacao = 'PENDENTE' | 'CONFIRMADO' | 'RECUSADO';

export interface Circulo {
  id: string;
  nome: string;
}

export interface Inscricao {
  id: string;
  status: StatusConfirmacao;
  pessoa: Pessoa;
  circulo?: Circulo | null;
  createdAt: string;
}

export interface Encontro {
  id: string;
  tema: string;
  numero?: number | null;
  local: string;
  status: string;
  dataInicio: string;
  inicioInscricoes: string;
  fimInscricoes: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  capaUrl?: string | null;
  publicadoEm?: string | null;
}

export interface DashboardInscricoes {
  total: number;
  porStatus: Record<string, number>;
}

export interface Casal {
  id: string;
  primeiroComponente: Pessoa;
  segundoComponente: Pessoa;
  circulos: { id: string; nome: string }[];
}

export interface CirculoComContagem extends Circulo {
  _count: { inscricoes: number };
}

export interface Aviso {
  id: string;
  titulo: string;
  conteudo: string;
  fixado: boolean;
  createdAt: string;
}

export type TipoRecurso = 'DOCUMENTO' | 'FOTO' | 'VIDEO' | 'ORACAO' | 'MUSICA' | 'FORMACAO';

export interface RecursoBiblioteca {
  id: string;
  titulo: string;
  tipo: TipoRecurso;
  arquivoUrl: string;
  descricao?: string | null;
}

export interface FichaFormacao {
  id: string;
  nome: string;
  email: string;
  idade: number;
  ultimoEncontroTrabalhado: string;
  ultimaEquipe: string;
  createdAt: string;
}
