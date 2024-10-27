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
  makeStyles,
} from '@fluentui/react-components';
import { darkTheme, lightTheme, themeMode } from '../../theme';

interface Props {
  title: string;
  risky?: boolean;
  children: ReactNode;
  show: boolean;
  onClose: (confirmed: boolean) => void;
}

const useClasses = makeStyles({
  dangerButton: {
    backgroundColor: (themeMode === 'dark' ? darkTheme : lightTheme)
      .colorStatusDangerBackground3,
    color: (themeMode === 'dark' ? darkTheme : lightTheme)
      .colorNeutralForeground1,
  },
  primaryButton: {
    backgroundColor: (themeMode === 'dark' ? darkTheme : lightTheme)
      .colorBrandBackground,
    color: (themeMode === 'dark' ? darkTheme : lightTheme)
      .colorNeutralForeground1,
  },
});

export const ConfirmationDialog = (props: Props) => {
  const styles = useClasses();

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
