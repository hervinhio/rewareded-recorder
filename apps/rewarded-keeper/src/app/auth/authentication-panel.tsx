import { Alert } from 'react-bootstrap';
import { authenticate } from './authentication';
import { SignInButton } from './signin-button';

export const AuthenticationPanel = () => {
  return (
    <>
        <div className='row'>
          <Alert className='col-12' variant='danger'>
            <Alert.Heading>Quelque chose ne tourne pas rond!</Alert.Heading>
            <p>
              Vous n'êtes pas autorisé à utiliser cette application, prière de vous authentifier ou de demande à l'administrateur de l'application de créer un compte pour vous.
            </p>
          </Alert>
        </div>
        <div className='row'>
          <SignInButton onClick={() => authenticate()}/>
        </div>
      </>
  );
}
