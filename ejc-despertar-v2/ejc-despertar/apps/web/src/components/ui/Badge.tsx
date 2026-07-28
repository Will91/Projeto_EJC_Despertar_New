import clsx from 'clsx';
import type { StatusConfirmacao } from '@/lib/types';

const stylesByStatus: Record<StatusConfirmacao, string> = {
  CONFIRMADO: 'bg-[#E9F2EA] text-sage',
  PENDENTE: 'bg-[#FDF1E3] text-dawn-gold',
  RECUSADO: 'bg-[#FBEAE6] text-ember',
};

const labelByStatus: Record<StatusConfirmacao, string> = {
  CONFIRMADO: 'Confirmado',
  PENDENTE: 'Pendente',
  RECUSADO: 'Recusado',
};

export function StatusBadge({ status }: { status: StatusConfirmacao }) {
  return (
    <span className={clsx('rounded-full px-2.5 py-1 text-xs font-bold', stylesByStatus[status])}>
      {labelByStatus[status]}
    </span>
  );
}
