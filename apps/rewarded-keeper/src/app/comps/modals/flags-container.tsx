import { Events, Group, Publisher, Report } from '../../types';
import { useEffect } from 'react';
import {
  useId,
  Toaster,
  ToastIntent,
  ToastTitle,
  useToastController,
  Toast,
  ToastBody,
} from '@fluentui/react-components';

export function FlagsContainer() {
  const toasterId = useId();
  const { dispatchToast } = useToastController(toasterId);
  const notify = (title: string, content: string, intent: ToastIntent) => {
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
        {!!content && <ToastBody>{content}</ToastBody>}
      </Toast>,
      { intent: intent },
    );
  };

  useEffect(() => {
    const effect = (data: Publisher) => {
      notify(
        'Enregistrement réussi',
        'Le proclamateur a été modifié/ajouté avec succès',
        'success',
      );
    };

    Events.on('publisher_updated', effect);

    return () => Events.off('publisher_updated', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Publisher) => {
      notify('Le proclamateur a été supprimé avec succès', '', 'success');
    };

    Events.on('publisher_deleted', effect);

    return () => Events.off('publisher_deleted', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Publisher) => {
      notify('Le groupe a été modifié/ajouté avec succès', '', 'success');
    };

    Events.on('group_updated', effect);

    return () => Events.off('group_updated', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Publisher) => {
      notify('Le rapport a été modifié/ajouté avec succès', '', 'success');
    };

    Events.on('report_updated', effect);

    return () => Events.off('report_updated', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Report) => {
      notify('Le rapport a été supprimé avec succès', '', 'success');
    };

    Events.on('report_deleted', effect);

    return () => Events.off('report_deleted', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Publisher) => {
      notify('Les rapports ont été soumis avec succès', '', 'success');
    };

    Events.on('reports_submitted', effect);

    return () => Events.off('reports_submitted', effect);
  }, []);

  useEffect(() => {
    const effect = (data: any) => {
      notify('Echec lors de la soumisison des rapports', '', 'success');
    };

    Events.on('reports_submission_failed', effect);

    return () => Events.off('reports_submission_failed', effect);
  }, []);

  useEffect(() => {
    const effect = (data: Group) => {
      notify(
        'Le groupe a été supprimé avec succès',
        `Le groupe ${data.name} a été supprimé avec succès. Tous les proclamateurs qui y étaient attachés sont maintenant non affiliés.`,
        'success',
      );
    };

    Events.on('group_deleted', effect);

    return () => Events.off('group_deleted', effect);
  }, []);

  useEffect(() => {
    const effect = (data: {
      title: string;
      message: string;
      severity: ToastIntent;
    }) => {
      notify(data.title, data.message, data.severity || 'info');
    };

    Events.on('message', effect);

    return () => Events.off('message', effect);
  }, []);

  useEffect(() => {
    const effect = (data: {
      id: string;
      publishers: Publisher[];
      fromGroup: string;
      toGroup: string;
    }) => {
      notify(
        'Les proclamateurs ont été transférés',
        `${
          data.publishers.length
        } ont été transférés du groupe ${data.fromGroup.replace(
          '-',
          ' ',
        )} vers le groupe ${data.toGroup.replace('-', ' ')}.`,
        'success',
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
      notify(
        `Le rapport d'assistance a été enregistré avec succès`,
        '',
        'success',
      );
    };

    Events.on('attendance_record_updated', effect);

    return () => Events.off('attendance_record_updated', effect);
  }, []);

  return <Toaster toasterId={toasterId} />;
}
