import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { getMonthConfigByKey } from './data';
import { Form } from './form';
import { Header } from './header/header';
import { NoValidMonthModal, ErrorModal, AddMonthModal } from './modals';
import { Month } from './types';
import { authenticate } from './auth';
import { Alert } from 'react-bootstrap';

interface OnMonthSelectedParams {
  month: Month | undefined;
  setFormUrl: (url: string) => void;
  setShowNoValidMonthModal: (flag: boolean) => void;
  setShowErrorModal: (flag: boolean) => void;
  setError: (error: any) => void;
}

export function App() {
  const [ formUrl, setFormUrl ] = useState('');
  const [ showNoValidMonthModal, setShowNoValidMonthModal ] = useState(false);
  const [ showErrorModal, setShowErrorModal ] = useState(false);
  const [ error, setError ] = useState<any>();
  const [ authenticated, setAuthenticated ] = useState(false);
  const [ showAddMonthModal, setShowAddMonthModal] = useState(false);

  useEffect(() => {
    authenticate()
      .then(
        flag => setAuthenticated(flag),
        error => { setError(error); setShowErrorModal(true); setAuthenticated(false) }
      ).catch((e) => {
        setAuthenticated(false);
        console.warn(e);
      });
  }, []);

  if (!authenticated) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Quelque chose ne tourne pas rond!</Alert.Heading>
        <p>
          Vous n'êtes pas autorisé à utiliser cette application, prière de vous authentifier ou de demande à l'administrateur de l'application de créer un compte pour vous.
        </p>
      </Alert>
    );
  }

  return (
    <main>
      <Header onShowAddMonthModal={() => setShowAddMonthModal(true)} onMonthSelected={(month) => onMonthSelected({
        month,
        setFormUrl,
        setShowNoValidMonthModal,
        setShowErrorModal,
        setError,
      })}/>
      <p className="mt-3 col-10 offset-1">Introduis les données dans chaque champ demandé puis vérifie que les données que tu as fournies sont correctes avant de les soumettre.</p>
      <NoValidMonthModal show={showNoValidMonthModal} onHide={() => setShowNoValidMonthModal(false) }/>
      <ErrorModal error={error} show={showErrorModal} onHide={() => setShowErrorModal(false) }/>
      <AddMonthModal show={showAddMonthModal} onHide={() => setShowAddMonthModal(false)}/>
      <Form url={formUrl}/>
    </main>
  );
}

const onMonthSelected = async (params: OnMonthSelectedParams) => {
  if (!params.month) {
    params.setShowNoValidMonthModal(true);
    return;
  }

  try {
    const config = await getMonthConfigByKey(params.month);
    if (config) {
      params.setFormUrl(config.formUrl);
    } else {
      params.setFormUrl('');
    }
  } catch (e) {
    params.setShowErrorModal(true);
    params.setError(e);
  }
}

export default App;
