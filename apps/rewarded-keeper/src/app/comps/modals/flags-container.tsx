import { AutoDismissFlag, FlagGroup } from '@atlaskit/flag';
import SuccessIcon from '@atlaskit/icon/glyph/check-circle';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import { token } from '@atlaskit/tokens';
import { G300, R300 } from '@atlaskit/theme/colors';
import { Events, Group, Publisher, Repport } from '../../types';
import { useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState, store } from '../../data';
import { Flags } from '../../data/flags';

export function FlagsContainer() {
  const flags = useSelector(
    (state: GlobalState) => state.flags.flags,
    shallowEqual
  );

  useEffect(() => {
    const effect = (data: Publisher) => {
      store.dispatch(
        Flags.slice.actions.added({
          id: data.id || 0,
          flag: (
            <AutoDismissFlag
              id={data.id || 0}
              onDismissed={() =>
                store.dispatch(Flags.slice.actions.removed(data.id))
              }
              icon={
                <SuccessIcon
                  primaryColor={token('color.icon.success', G300)}
                  label="Success"
                  size="medium"
                />
              }
              key={data.id || 0}
              title={`Le proclamateur a été modifié/ajouté avec succès`}
            />
          ),
        })
      );
    };

    Events.on('publisher_updated', effect);

    return () => Events.off('publisher_updated', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Publisher) => {
      store.dispatch(
        Flags.slice.actions.added({
          id: data.id || 0,
          flag: (
            <AutoDismissFlag
              id={data.id || 0}
              onDismissed={() =>
                store.dispatch(Flags.slice.actions.removed(data.id))
              }
              icon={
                <SuccessIcon
                  primaryColor={token('color.icon.success', G300)}
                  label="Success"
                  size="medium"
                />
              }
              key={data.id || 0}
              title={`Le proclamateur a été supprimé avec succès`}
            />
          ),
        })
      );
    };

    Events.on('publisher_deleted', effect);

    return () => Events.off('publisher_deleted', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Publisher) => {
      store.dispatch(
        Flags.slice.actions.added({
          id: data.id || 0,
          flag: (
            <AutoDismissFlag
              id={data.id || 0}
              onDismissed={() =>
                store.dispatch(Flags.slice.actions.removed(data.id))
              }
              icon={
                <SuccessIcon
                  primaryColor={token('color.icon.success', G300)}
                  label="Success"
                  size="medium"
                />
              }
              key={data.id || 0}
              title={`Le groupe a été modifié/ajouté avec succès`}
            />
          ),
        })
      );
    };

    Events.on('group_updated', effect);

    return () => Events.off('group_updated', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Publisher) => {
      store.dispatch(
        Flags.slice.actions.added({
          id: data.id || 0,
          flag: (
            <AutoDismissFlag
              id={data.id || 0}
              onDismissed={() =>
                store.dispatch(Flags.slice.actions.removed(data.id))
              }
              icon={
                <SuccessIcon
                  primaryColor={token('color.icon.success', G300)}
                  label="Success"
                  size="medium"
                />
              }
              key={data.id || 0}
              title={`Le rapport a été modifié/ajouté avec succès`}
            />
          ),
        })
      );
    };

    Events.on('repport_updated', effect);

    return () => Events.off('repport_updated', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Repport) => {
      store.dispatch(
        Flags.slice.actions.added({
          id: data.id || 0,
          flag: (
            <AutoDismissFlag
              id={data.id || 0}
              onDismissed={() =>
                store.dispatch(Flags.slice.actions.removed(data.id))
              }
              icon={
                <SuccessIcon
                  primaryColor={token('color.icon.success', G300)}
                  label="Success"
                  size="medium"
                />
              }
              key={data.id || 0}
              title={`Le rapport a été supprimé avec succès`}
            />
          ),
        })
      );
    };

    Events.on('repport_deleted', effect);

    return () => Events.off('repport_deleted', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Publisher) => {
      store.dispatch(
        Flags.slice.actions.added({
          id: data.id || 0,
          flag: (
            <AutoDismissFlag
              id={data.id || 0}
              onDismissed={() =>
                store.dispatch(Flags.slice.actions.removed(data.id))
              }
              icon={
                <SuccessIcon
                  primaryColor={token('color.icon.success', G300)}
                  label="Success"
                  size="medium"
                />
              }
              key={data.id || 0}
              title={`Les rapports ont été soumis avec succès`}
            />
          ),
        })
      );
    };

    Events.on('reports_submitted', effect);

    return () => Events.off('reports_submitted', effect);
  }, []);

  useEffect(() => {
    const effect = (data: any) => {
      store.dispatch(
        Flags.slice.actions.added({
          id: data.id || 0,
          flag: (
            <AutoDismissFlag
              id={data.id || 0}
              onDismissed={() =>
                store.dispatch(Flags.slice.actions.removed(data.id))
              }
              icon={
                <CrossCircleIcon
                  primaryColor={token('color.icon.danger', R300)}
                  label="Error"
                  size="medium"
                />
              }
              key={data.id || 0}
              title={`Echec lors de la soumisison des rapports`}
              description={
                data.message || data.error?.toString() || data.toString()
              }
            />
          ),
        })
      );
    };

    Events.on('reports_submission_failed', effect);

    return () => Events.off('reports_submission_failed', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Group) => {
      store.dispatch(
        Flags.slice.actions.added({
          id: data.id || 0,
          flag: (
            <AutoDismissFlag
              id={data.id || 0}
              onDismissed={() =>
                store.dispatch(Flags.slice.actions.removed(data.id))
              }
              icon={
                <CrossCircleIcon
                  primaryColor={token('color.icon.success', G300)}
                  label="Success"
                  size="medium"
                />
              }
              key={data.id || 0}
              title={`Le groupe a été supprimé avec succès`}
              description={`Le groupe ${data.name} a été supprimé avec succès. Tous les proclamateurs qui y étaient attachés sont maintenant non affiliés.`}
            />
          ),
        })
      );
    };

    Events.on('group_deleted', effect);

    return () => Events.off('group_deleted', effect);
  }, []);

  return <FlagGroup>{Object.values(flags)}</FlagGroup>;
}
