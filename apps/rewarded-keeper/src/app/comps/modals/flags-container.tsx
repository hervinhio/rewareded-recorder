import { AutoDismissFlag, FlagGroup } from '@atlaskit/flag';
import SuccessIcon from '@atlaskit/icon/glyph/check-circle';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import { token } from '@atlaskit/tokens';
import { G300, R300 } from '@atlaskit/theme/colors';
import { Events, Group, Publisher, Report } from '../../types';
import { useEffect, useId } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState, store } from '../../data';
import { Flags } from '../../data/flags';
import { Toast, ToastBody } from 'react-bootstrap';
import { ToastTitle, useToastController } from '@fluentui/react-components';

export function FlagsContainer() {
  const { flags, version } = useSelector(
    (state: GlobalState) => ({
      flags: state.flags.flags,
      version: state.version,
    }),
    shallowEqual,
  );

  const toasterId = useId();
  const { dispatchToast } = useToastController(toasterId);

  useEffect(() => {
    const effectV1 = (data: Publisher) => {
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
        }),
      );
    };

    const effectV2 = (data: Publisher) => {
      dispatchToast(
        <Toast>
          <ToastTitle>Enregistrement réussi</ToastTitle>
          <ToastBody>
            Le proclamateur a été modifié/ajouté avec succès
          </ToastBody>
        </Toast>,
      );
    };

    Events.on('publisher_updated', version === 1 ? effectV1 : effectV2);

    return () =>
      Events.off('publisher_updated', version === 1 ? effectV1 : effectV2);
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
        }),
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
        }),
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
        }),
      );
    };

    Events.on('report_updated', effect);

    return () => Events.off('report_updated', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Report) => {
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
        }),
      );
    };

    Events.on('report_deleted', effect);

    return () => Events.off('report_deleted', effect);
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
        }),
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
        }),
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
                <SuccessIcon
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
        }),
      );
    };

    Events.on('group_deleted', effect);

    return () => Events.off('group_deleted', effect);
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
                <SuccessIcon
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
        }),
      );
    };

    Events.on('group_deleted', effect);

    return () => Events.off('group_deleted', effect);
  }, []);

  useEffect(() => {
    const effect = (data: {
      id: string;
      publishers: Publisher[];
      fromGroup: string;
      toGroup: string;
    }) => {
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
              title={`Les proclamateurs ont été transférés`}
              description={`${
                data.publishers.length
              } ont été transférés du groupe ${data.fromGroup.replace(
                '-',
                ' ',
              )} vers le groupe ${data.toGroup.replace('-', ' ')}.`}
            />
          ),
        }),
      );
    };

    Events.on('publishers_transfered', effect);

    return () => Events.off('publishers_transfered', effect);
  }, []);

  useEffect(() => {
    const effect = (data: {
      id: string;
      publishers: Publisher[];
      fromGroup: string;
      toGroup: string;
    }) => {
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
              title={`Le rapport d'assistance a été enregistré avec succès`}
            />
          ),
        }),
      );
    };

    Events.on('attendance_record_updated', effect);

    return () => Events.off('attendance_record_updated', effect);
  }, []);

  return <FlagGroup>{Object.values(flags)}</FlagGroup>;
}
