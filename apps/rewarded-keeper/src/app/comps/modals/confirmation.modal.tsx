import { ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
} from '@fluentui/react-components';

interface Props {
  title: string;
  risky?: boolean;
  children: ReactNode;
  show: boolean;
  onClose: (confirmed: boolean) => void;
}


export const ConfirmationDialog = (props: Props) => {
  return (
    <Dialog open={props.show}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogContent>{props.children}</DialogContent>
          <DialogActions>
            <DialogTrigger>
              <Button appearance="subtle" onClick={() => props.onClose(false)}>
                Annuler
              </Button>
            </DialogTrigger>
            <Button onClick={() => props.onClose(true)}>Confirmer</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
