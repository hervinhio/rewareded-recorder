import { useEffect } from 'react';
import { Spinner } from '@fluentui/react-components';
import { Cases, GlobalState } from '../data';
import { useSelector } from 'react-redux';
import { RequestsBoard } from './requests-board';

export function RequestsPage() {
  const { cases, loading } = useSelector((state: GlobalState) => state.cases);

  useEffect(() => {
    Cases.loadAll();
  }, []);

  if (loading) {
    return <Spinner size="large" />;
  }

  return <RequestsBoard cases={cases} />;
}
