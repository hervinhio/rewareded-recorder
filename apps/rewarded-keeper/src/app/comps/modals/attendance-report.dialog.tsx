import { FormEvent, useState } from 'react';
import { AttendanceRecord, AttendanceRecords } from '../../data';
import { FirebaseError } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  MessageBar,
  Radio,
  RadioGroup,
  Spinner,
} from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';

interface Props {
  show: boolean;
  mode: 'edit' | 'create';
  record?: AttendanceRecord;
  onHide: () => void;
}

export function AttendanceReportModal(props: Props) {
  const now = new Date();
  now.setHours(1, 0, 0, 0);

  const initialState = {
    date: Timestamp.fromDate(now),
    monthId: `${now.getFullYear()}#${now.getMonth()}`,
    isMidweekMeeting: false,
  };
  const [error, setError] = useState<
    Error | FirebaseError | unknown | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [record, _setRecord] = useState<AttendanceRecord>(
    props.record || initialState,
  );
  const isEditMode = !!props.record;

  if (!props.show) return null;

  const setRecord = (record: AttendanceRecord) => {
    _setRecord(record);
    setError(undefined);
  };

  async function handleSubmission(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    const form = e.target as any;

    if (!form.date.value) {
      setError('La date est incorrecte');
    }

    setIsLoading(true);
    try {
      const _record = {
        ...(record || {}),
        date: Timestamp.fromDate(new Date(form.date.value)),
        inPerson: Number(form.inPerson.value),
        zoom: Number(form.zoom.value),
      };

      validateRecord(_record);

      if (
        props.mode === 'create' &&
        (await AttendanceRecords.existsForDate(_record.date))
      ) {
        throw new Error('Un rapport existe déjà pour la date séléctionnée');
      }

      const promise$ =
        props.mode === 'edit'
          ? AttendanceRecords.update(_record)
          : AttendanceRecords.create(_record);
      await promise$;
      props.onHide();
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={props.show}>
      <DialogSurface>
        {!!error && <MessageBar intent="error">{error.toString()}</MessageBar>}
        <form onSubmit={handleSubmission}>
          <DialogBody>
            <DialogTitle>
              {props.mode === 'edit' ? 'Modifier' : 'Créer'} un rapport
              d'assitance
            </DialogTitle>
            <DialogContent>
              <Field label="Date" required>
                <DatePicker
                  name="date"
                  value={isEditMode ? record.date.toDate() : undefined}
                  placeholder="Sélectionnez une date..."
                />
              </Field>
              <Field label="Nombre en présentiel" required>
                <Input
                  required
                  name="inPerson"
                  placeholder="Nombre de personnes en presentiel"
                  type="number"
                />
              </Field>
              <Field label="Nombre sur Zoom" required>
                <Input
                  required
                  name="zoom"
                  placeholder="Nombre de personnes sur Zoom"
                  type="number"
                />
              </Field>
              <Field>
                <RadioGroup
                  onChange={(_, data) =>
                    setRecord({
                      ...record,
                      isMidweekMeeting: data.value === 'midweek',
                    })
                  }
                  defaultValue={
                    props.record?.isMidweekMeeting === undefined
                      ? undefined
                      : props.record?.isMidweekMeeting
                        ? 'midweek'
                        : 'weekend'
                  }>
                  <Radio value="midweek" label="Réunion de semaine" />
                  <Radio value="weekend" label="Réunion du weekend" />
                </RadioGroup>
              </Field>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={() => props.onHide()}>
                  Fermer
                </Button>
              </DialogTrigger>
              <Button
                type="submit"
                appearance="primary"
                disabled={isLoading}
                icon={isLoading ? <Spinner size="tiny" /> : undefined}>
                {isEditMode ? 'Modifier' : 'Créer'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}

function validateRecord(record: AttendanceRecord) {
  if (!record.date || !record.monthId) {
    throw new Error('Vous devez définir la date');
  }

  if ((record.inPerson || 0) + (record.zoom || 0) === 0) {
    throw new Error("L'assistance ne peut être nulle");
  }

  if (
    record.isMidweekMeeting === undefined ||
    record.isMidweekMeeting === null
  ) {
    throw new Error('Veuillez définir le type de réunion');
  }
}
