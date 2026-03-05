import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  ProgressBar,
  Spinner,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ArrowMinimizeRegular, CheckmarkCircle24Filled } from '@fluentui/react-icons';
import { useSelector } from 'react-redux';
import { GlobalState } from '../../data';
import { Flags } from '../../data/flags';
import { useRefreshPublisher } from '../../content-panel/use-refresh-publisher';
import { Publisher } from '../../types';
import { getPublisherName } from '../../content-panel/util';

const MAX_LOG_ENTRIES = 3;
const REFRESH_TOAST_ID = 'refresh-progress-toast';
const REFRESH_TITLE = 'Rafraîchissement en cours';

interface LogEntry {
  key: string;
  name: string;
  done: boolean;
}

const useStyles = makeStyles({
  log: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    overflow: 'hidden',
  },
  logEntry: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    animationName: {
      from: { transform: 'translateY(20px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    animationDuration: '0.3s',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  },
  checkIcon: {
    color: tokens.colorPaletteGreenForeground1,
    flexShrink: 0,
  },
});

interface Props {
  show: boolean;
  onHide: () => void;
}

export function RefreshDialog(props: Props) {
  if (!props.show) return null;

  const styles = useStyles();
  const [progress, setProgress] = useState(0);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const isMinimizedRef = useRef(false);
  const publishers = useSelector(
    (state: GlobalState) => state.publishers.publishers,
  );
  const refreshPublisher = useRefreshPublisher();

  const handleMinimize = () => {
    isMinimizedRef.current = true;
    setIsMinimized(true);
    Flags.raiseLoading({ title: REFRESH_TITLE, id: REFRESH_TOAST_ID });
  };

  useEffect(() => {
    const effector = async () => {
      if (!props.show || publishers.length === 0) {
        props.onHide?.();
        return;
      }

      const progressValue = 100 / publishers.length;

      for (const publisher of publishers) {
        const entry: LogEntry = {
          key: publisher.id ?? `${publisher.firstName}_${publisher.lastName}`,
          name: getPublisherName(publisher),
          done: false,
        };

        setLogEntries((prev) => {
          const updated = prev.map((e) => ({ ...e, done: true }));
          return [...updated, entry].slice(-MAX_LOG_ENTRIES);
        });

        try {
          await refreshPublisher(publisher, true, false);
        } catch (error) {
          Flags.raiseError(error);
          if (isMinimizedRef.current) {
            Flags.dismissLoading(REFRESH_TOAST_ID);
          }
          break;
        }

        setProgress((prev) => prev + progressValue);
      }

      if (isMinimizedRef.current) {
        Flags.dismissLoading(REFRESH_TOAST_ID);
      }
      props.onHide?.();
    };

    effector();
  }, []);

  return (
    <Dialog open={props.show && !isMinimized}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Réduire"
                icon={<ArrowMinimizeRegular />}
                onClick={handleMinimize}
              />
            }
          >
            {REFRESH_TITLE}
          </DialogTitle>
          <DialogContent>
            <ProgressBar
              max={100}
              value={progress}
              thickness="large"
              color={progress >= 100 ? 'success' : 'brand'}
            />
            {logEntries.length > 0 && (
              <div className={styles.log}>
                {logEntries.map((entry) => (
                  <div key={entry.key} className={styles.logEntry}>
                    {entry.done ? (
                      <CheckmarkCircle24Filled className={styles.checkIcon} />
                    ) : (
                      <Spinner size="extra-small" />
                    )}
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
