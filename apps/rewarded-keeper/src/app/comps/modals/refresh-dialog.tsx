import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  ProgressBar,
  Spinner,
} from '@fluentui/react-components';
import { useSelector } from 'react-redux';
import { GlobalState } from '../../data';
import { Flags } from '../../data/flags';
import { useRefreshPublisher } from '../../content-panel/use-refresh-publisher';

interface Props {
  show: boolean;
  onHide: () => void;
}

export function RefreshDialog(props: Props) {
  if (!props.show) return null;

  const [progress, setProgress] = useState(0);
  const publishers = useSelector(
    (state: GlobalState) => state.publishers.publishers,
  );
  const refreshPublisher = useRefreshPublisher();
  const increaseProgress = (value: number) => {
    setProgress((prev) => prev + value);
  };

  useEffect(() => {
    const effector = async () => {
      if (!props.show || publishers.length === 0) {
        props.onHide?.();
        return;
      }

      const progressValue = publishers.length / 100;

      for (const publisher of publishers) {
        try {
          await refreshPublisher(publisher, true, false);
        } catch (error) {
          Flags.raiseError(error);
          break;
        }

        increaseProgress(progressValue);
      }

      props.onHide?.();
    };

    effector();
  }, []);

  return (
    <Dialog open={props.show}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Refresh Dialog</DialogTitle>
          <DialogContent>
            <p>Rafraîchissement en cours</p>
            <ProgressBar
              max={100}
              value={progress}
              thickness="large"
              color={progress < 100 ? 'brand' : 'success'}
            />
            {progress >= 100 && (
              <MessageBar>
                <MessageBarBody>
                  <MessageBarTitle>Finalisation...</MessageBarTitle>
                  <Spinner size="small" /> lorsque les derniers traitements
                  seront achêvés la boîte de dialogue se fermera
                  automatiquement.
                </MessageBarBody>
              </MessageBar>
            )}
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
