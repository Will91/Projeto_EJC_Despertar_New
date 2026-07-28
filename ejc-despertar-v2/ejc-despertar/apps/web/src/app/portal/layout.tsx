import { PortalShell } from '@/components/ui/PortalShell';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
