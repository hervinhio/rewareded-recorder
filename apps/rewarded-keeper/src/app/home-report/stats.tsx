import Page from '@atlaskit/page';
import {
  borderRadius as getBorderRadius,
  gridSize as getGridSize,
} from '@atlaskit/theme/constants';
import { token } from '@atlaskit/tokens';
import { N20, N200 } from '@atlaskit/theme/colors';
import { CSSProperties, useEffect, useState } from 'react';
import { MonthSelector } from '../header/month-selector';
import { Month, Publisher, Repport } from '../types';
import { Publishers, Repports } from '../data';
import { RepportsStats, StatsType } from './repports-stats';

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
  const [month, setMonth] = useState<Month | undefined>();
  const [repports, setRepports] = useState<Repport[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);

  useEffect(() => {
    if (month) {
      Repports.byMonthId(month.getKey()).then(
        (reps) => setRepports(reps),
        (err) => console.error(err)
      );
    }
  }, [month?.getKey()]);

  useEffect(() => {
    Publishers.all().then(
      (pubs) => setPublishers(pubs),
      (err) => console.error(err)
    );
  }, []);

  return (
    <Page>
      <MonthSelector
        selectedMonth={month}
        onMonthSelected={(m: Month | undefined) => {
          setMonth(m);
        }}
      />
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
    </Page>
  );
};
