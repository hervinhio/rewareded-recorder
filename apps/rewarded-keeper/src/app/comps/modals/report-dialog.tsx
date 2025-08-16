import { FormEvent, ReactElement, useState } from 'react';
import {
  Month,
  Report,
  isSpecialPublisher,
  isPublisherAuxilaryPionierForMonth,
} from '../../types';
import { MonthSelector } from '../../header/month-selector';
import { GlobalState, Publishers } from '../../data';
import { shallowEqual, useSelector } from 'react-redux';
import {
  Button,
  Dialog,
  MessageBar,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogActions,
  Field,
  Input,
  Textarea,
  Checkbox,
} from '@fluentui/react-components';
import { Timestamp } from 'firebase/firestore';

interface Props {
  publisherId: string | undefined;
  report?: Report | undefined;
  show: boolean;
  onHide: (created: boolean) => void;
  children?: ReactElement;
}

export function ReportDialog(props: Props) {
  const defaultMonth = props.report
    ? Month.fromKey(props.report.monthId)
    : undefined;
  const [error, setError] = useState('');
  const { publisher, reports } = useSelector(
    (state: GlobalState) => ({
      publisher: state.publishers.publishers.find(
        (p) => p.id === props.publisherId,
      ),
      reports: Publishers.getReportsByPublisher(props.publisherId || ''),
    }),
    shallowEqual,
  );
  const [isAuxiliaryPionneer, setIsAuxiliaryPionneer] = useState(
    props.report?.isAPReport ||
      isPublisherAuxilaryPionierForMonth(
        publisher,
        defaultMonth?.getKey() as string,
      ),
  );
  const [month, setMonth] = useState<Month | undefined>(defaultMonth);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!props.report;
  const showRequestHoursCount =
    isSpecialPublisher(publisher, month) || isAuxiliaryPionneer;

  function handleSubmission(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    const form = new FormData(e.target as HTMLFormElement);
    const hours = Number(form.get('hours')?.valueOf()) || 0;
    const courses = Number(form.get('studies')?.valueOf()) || 0;
    const report = {
      active:
        (document.getElementById('active') as HTMLInputElement).checked ||
        (courses || hours) > 0,
      comment: form.get('comment')?.valueOf().toString() || '',
      isAPReport: (document.getElementById('ap-checkbox') as HTMLInputElement)
        .checked,
      isFirstReport: (
        document.getElementById('firstReport') as HTMLInputElement
      ).checked,
      monthId: month?.getKey() || defaultMonth?.getKey() || '',
      publisherId: props.publisherId || '',
      submitted: false,
      courses,
      date: Timestamp.now(),
      hours,
      id: props.report?.id,
    };

    if (!isEditMode) {
      delete report.id;
    }

    onValidate(
      report as Report,
      reports.filter((r) => r.publisherId === props.publisherId),
      isEditMode,
    )
      .then(() => {
        props.onHide(true);
      })
      .catch((e) => setError(e));
    return false;
  }

  if (!props.show) return props.children || null;

  return (
    <Dialog
      open={props.show}
      onOpenChange={(e, data) => {
        if (data.type === 'triggerClick') {
          setError('');
          setIsAuxiliaryPionneer(false);
          setIsLoading(false);
          setMonth(defaultMonth);
        }
      }}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogSurface aria-describedby={undefined}>
        {error && <MessageBar intent="error">{error.toString()}</MessageBar>}
        <form onSubmit={handleSubmission}>
          <DialogBody>
            <DialogTitle>Enregistrer un rapport</DialogTitle>
            <DialogContent>
              <div className="form-section">
                <Field label="Mois" required>
                  <MonthSelector
                    selectedMonth={month}
                    disabled={isLoading}
                    onMonthSelected={(month: Month | undefined) => {
                      setMonth(month);
                    }}
                  />
                </Field>

                <Field hint="Coche si c'est le tout premier rapport d'un nouveau proclamateur">
                  <Checkbox
                    label="Premier rapport"
                    name="firstReport"
                    id="firstReport"
                    defaultChecked={props.report?.isFirstReport}
                  />
                </Field>
                <Field hint="As-t-il (as-tu) participé à une forme de précication durant le mois?">
                  <Checkbox
                    label="A prêché"
                    name="active"
                    id="active"
                    defaultChecked={props.report?.active}
                  />
                </Field>
                <Field hint="Coche si le proclamateur a été PA">
                  <Checkbox
                    label="Pionnier auxiliaire"
                    name="ap-checkbox"
                    id="ap-checkbox"
                    onChange={(v) => setIsAuxiliaryPionneer(v.target.checked)}
                    defaultChecked={isAuxiliaryPionneer}
                  />
                </Field>
                {showRequestHoursCount && (
                  <Field required label="Heures">
                    <Input
                      type="number"
                      name="hours"
                      defaultValue={`${props.report?.hours}` || ''}
                    />
                  </Field>
                )}
                <Field required label="Cours bibliques">
                  <Input
                    type="number"
                    name="studies"
                    defaultValue={`${props.report?.courses}` || ''}
                  />
                </Field>
                <Field label="Commentaire">
                  <Textarea
                    name="comment"
                    defaultValue={props.report?.comment || ''}
                  />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  appearance="secondary"
                  onClick={() => props.onHide(false)}>
                  Fermer
                </Button>
              </DialogTrigger>
              <Button type="submit" appearance="primary">
                {isEditMode ? 'Modifier' : 'Créer'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}

const onValidate = (
  report: Report,
  existingReports: Report[],
  isEditMode: boolean,
) => {
  if (report.isAPReport && (report.hours || 0) < 15) {
    report.isAPReport = false;
  }

  if (isEditMode) {
    return updateReport(report);
  }

  if (existingReports.some((r) => r.monthId === report.monthId)) {
    return Promise.reject('Ce rapport existe déjà');
  }

  if (!report.monthId) {
    return Promise.reject('Veuillez renseigner le mois');
  }

  return createReport(report);
};

const updateReport = (report: Report) => {
  return Publishers.updateReport(report.publisherId, report);
};

const createReport = (report: Report) => {
  return Publishers.createReport(report.publisherId, {
    ...report,
    submitted: false,
  } as Report).then((report) => {
    return report;
  });
};
