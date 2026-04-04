import { Badge } from '@fluentui/react-components';
import { CaseSeverity } from '../types';

interface Props {
  severity: CaseSeverity;
}

const severityConfig: Record<
  CaseSeverity,
  { label: string; color: 'danger' | 'warning' | 'informative' }
> = {
  bug: { label: 'Bug', color: 'danger' },
  feature_request: { label: 'Demande de fonctionnalité', color: 'warning' },
  question: { label: 'Question', color: 'informative' },
};

export function SeverityBadge({ severity }: Props) {
  const config = severityConfig[severity];
  return (
    <Badge appearance="filled" color={config.color}>
      {config.label}
    </Badge>
  );
}
