import { AutoDismissFlag, FlagGroup } from '@atlaskit/flag';
import SuccessIcon from '@atlaskit/icon/glyph/check-circle';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import { token } from '@atlaskit/tokens';
import { G300, R300 } from '@atlaskit/theme/colors';
import { Events, Publisher } from '../../types';
import { useEffect, useState } from 'react';

export function Flags() {
  const [flags, setFlags] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const effect = (data: Publisher) => {
      flags.push(
        <AutoDismissFlag
          id={flags.length + 1}
          icon={
            <SuccessIcon
              primaryColor={token('color.icon.success', G300)}
              label="Success"
              size="medium"
            />
          }
          key={flags.length + 1}
          title={`Le proclamateur a été modifié/ajouté avec succès`}
        />
      );
      setFlags([...flags]);
    };

    Events.on('publisher_updated', effect);

    return () => Events.off('publisher_updated', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Publisher) => {
      flags.push(
        <AutoDismissFlag
          id={flags.length + 1}
          icon={
            <SuccessIcon
              primaryColor={token('color.icon.success', G300)}
              label="Success"
              size="medium"
            />
          }
          key={flags.length + 1}
          title={`Le groupe a été modifié/ajouté avec succès`}
        />
      );
      setFlags([...flags]);
    };

    Events.on('group_updated', effect);

    return () => Events.off('group_updated', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Publisher) => {
      flags.push(
        <AutoDismissFlag
          id={flags.length + 1}
          icon={
            <SuccessIcon
              primaryColor={token('color.icon.success', G300)}
              label="Success"
              size="medium"
            />
          }
          key={flags.length + 1}
          title={`Le rapport a été modifié/ajouté avec succès`}
        />
      );
      setFlags([...flags]);
    };

    Events.on('repport_updated', effect);

    return () => Events.off('repport_updated', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Publisher) => {
      flags.push(
        <AutoDismissFlag
          id={flags.length + 1}
          icon={
            <SuccessIcon
              primaryColor={token('color.icon.success', G300)}
              label="Success"
              size="medium"
            />
          }
          key={flags.length + 1}
          title={`Les rapports ont été soumis avec succès`}
        />
      );
      setFlags([...flags]);
    };

    Events.on('reports_submitted', effect);

    return () => Events.off('reports_submitted', effect);
  }, []);

  useEffect(() => {
    const effect = (data: any) => {
      flags.push(
        <AutoDismissFlag
          id={flags.length + 1}
          icon={
            <CrossCircleIcon
              primaryColor={token('color.icon.danger', R300)}
              label="Error"
              size="medium"
            />
          }
          key={flags.length + 1}
          title={`Echec lors de la soumisison des rapports`}
          description={data.toString()}
        />
      );
      setFlags([...flags]);
    };

    Events.on('reports_submission_failed', effect);

    return () => Events.off('reports_submission_failed', effect);
  }, []);

  return (
    <FlagGroup onDismissed={() => setFlags(flags.slice(1))}>{flags}</FlagGroup>
  );
}
