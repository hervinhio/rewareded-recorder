import Page from '@atlaskit/page';
import {
  borderRadius as getBorderRadius,
  gridSize as getGridSize,
} from '@atlaskit/theme/constants';
import { token } from '@atlaskit/tokens';
import { CSSProperties, useEffect, useState } from 'react';
import { currentUserHasPermission, Publisher, Repport } from '../types';
import { Publishers, Repports } from '../data';
import { RepportsStats, StatsType } from './repports-stats';
import { ConfirmationModal } from '../modals';
import Button from '@atlaskit/button';

const borderRadius = getBorderRadius();
const gridSize = getGridSize();
const style = {
  display: 'flex',
  marginTop: `${gridSize * 2}px`,
  marginBottom: `${gridSize}px`,
  padding: `${gridSize * 4}px`,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  flexGrow: 1,
  backgroundColor: token('color.background.neutral', '#3949ab'),
  borderRadius: `${borderRadius}px`,
  color: token('color.text.subtlest', '#fff'),
};

export const Stats = () => {
  const [counter, setCounter] = useState<number>(0);
  const [repports, setRepports] = useState<Repport[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [shouldShowRepportsModal, setShouldShowSubmitRepportsModal] =
    useState(false);

  useEffect(() => {
    Repports.unsubmitted().then(
      (reps) => setRepports(reps),
      (err) => console.error(err)
    );
  }, [counter]);

  useEffect(() => {
    Publishers.all().then(
      (pubs) => setPublishers(pubs),
      (err) => console.error(err)
    );
  }, []);

  return (
    <Page>
      <div className="stats-card" style={style as CSSProperties}>
        <h2>Totaux</h2>
        <RepportsStats
          type={StatsType.All}
          repports={repports}
          publishers={publishers}
          filterOutSubOne={false}
        />
      </div>

      <div className="stats-card" style={style as CSSProperties}>
        <h2>Proclamateurs</h2>
        <RepportsStats
          type={StatsType.Publishers}
          repports={repports}
          publishers={publishers}
          filterOutSubOne={true}
        />
      </div>

      <div className="stats-card" style={style as CSSProperties}>
        <h2>Pionnier auxiliaires</h2>
        <RepportsStats
          type={StatsType.AuxilaryPionneer}
          repports={repports}
          publishers={publishers}
          filterOutSubOne={true}
        />
      </div>

      <div className="stats-card" style={style as CSSProperties}>
        <h2>Pionnier permanents</h2>
        <RepportsStats
          type={StatsType.RegularPionneer}
          repports={repports}
          publishers={publishers}
          filterOutSubOne={true}
        />
      </div>
      {shouldShowRepportsModal && (
        <ConfirmationModal
          title="Soumttre tous les rapports"
          risky={true}
          onClose={(success) => {
            setShouldShowSubmitRepportsModal(false);

            if (success) {
              Repports.submitAll()
                .finally(() => {
                  setCounter(counter + 1);
                });
            }
          }}
        >
          Voulez-vous vraiment soumettre tous les rapports ? Cette opération ne
          peut être annullée.
        </ConfirmationModal>
      )}
      <Button
        isDisabled={!currentUserHasPermission('admin')}
        appearance="danger"
        onClick={() => setShouldShowSubmitRepportsModal(true)}
      >
        Soumettre
      </Button>
    </Page>
  );
};
