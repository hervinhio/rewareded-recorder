import { FormEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  Field,
  Input,
  MessageBar,
  Option,
} from '@fluentui/react-components';
import { Dialogs, SpecialMonths } from '../../data';

interface Props {
  show: boolean;
  onClose: () => void;
}

export function CreateSpecialMonthDialog(props: Props) {
  const dispatch = useDispatch();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];
  
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await SpecialMonths.create(selectedYear, selectedMonth, reason.trim());
      setReason('');
      setSelectedYear(currentYear);
      setSelectedMonth(0);
      props.onClose();
    } catch (error) {
      console.error('Error creating special month:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={props.show}>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Ajouter un mois spécial</DialogTitle>
            <DialogContent>
              {errorMessage && (
                <MessageBar intent="error">
                  {errorMessage}
                </MessageBar>
              )}
              
              <Field label="Année" required >
                <Dropdown
                  value={selectedYear.toString()}
                  onOptionSelect={(_, data) => {
                    if (data.optionValue) {
                      setSelectedYear(parseInt(data.optionValue));
                      setErrorMessage(''); // Clear error when user changes input
                    }
                  }}
                >
                  {years.map((year) => (
                    <Option key={year} value={year.toString()} text={year.toString()}>
                      {year}
                    </Option>
                  ))}
                </Dropdown>
              </Field>

              <Field label="Mois" required>
                <Dropdown
                  value={months[selectedMonth]}
                  onOptionSelect={(_, data) => {
                    if (data.optionValue !== undefined) {
                      setSelectedMonth(parseInt(data.optionValue));
                      setErrorMessage(''); // Clear error when user changes input
                    }
                  }}
                >
                  {months.map((month, index) => (
                    <Option key={index} value={index.toString()}>
                      {month}
                    </Option>
                  ))}
                </Dropdown>
              </Field>

              <Field label="Raison" required style={{ marginBottom: '16px'}}>
                <Input
                  value={reason}
                  onChange={(_, data) => {
                    setReason(data.value);
                    setErrorMessage(''); // Clear error when user changes input
                  }}
                  placeholder="Entrez la raison de ce mois spécial"
                />
              </Field>
            </DialogContent>
          </DialogBody>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button 
                appearance="secondary" 
                onClick={props.onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            </DialogTrigger>
            <Button 
              type="submit" 
              appearance="primary"
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
