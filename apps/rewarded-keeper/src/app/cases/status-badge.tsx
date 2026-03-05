import { Badge } from '@fluentui/react-components';
import { CaseStatus } from '../types';

interface Props {
  status: CaseStatus;
}

const statusConfig: Record<CaseStatus, { label: string; color: 'success' | 'informative' | 'subtle' }> = {
  open: { label: 'Ouvert', color: 'informative' },
  in_progress: { label: 'En cours', color: 'success' },
  closed: { label: 'Résolu', color: 'subtle' },
};

export function StatusBadge({ status }: Props) {
  const config = statusConfig[status];
  return (
    <Badge appearance="outline" color={config.color}>
      {config.label}
    </Badge>
  );
}
