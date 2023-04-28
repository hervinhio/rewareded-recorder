/* eslint-disable jsx-a11y/anchor-is-valid */
import { authenticate, AuthStatus } from './authentication';
import { SignInButton } from './signin-button';
import SectionMessage from '@atlaskit/section-message';

interface Props {
  status: AuthStatus;
}

export const AuthenticationPanel = (props: Props) => {
  return (
    <div className="login-box">
      <SectionMessage appearance={getSectionMessageAppearance(props.status)}>
        {getText(props.status)}
      </SectionMessage>
      <div className="buttons">
        <SignInButton
          text="Se connecter avec Google"
          onClick={() => authenticate()}
        />
        <div className="hr"></div>
        <span className="register-hint">
          Pas de compte ?{' '}
          <a href="#" onClick={() => authenticate(true)}>
            Enregistrez-vous
          </a>
        </span>
      </div>
    </div>
  );
};

const getText = (status: AuthStatus) => {
  if (status.unexisting) {
    return <span>Utisateur non existant, voulez-vous vous enregistrer?</span>;
  } else if (status.authenticated && !status.verified) {
    return (
      <span>
        Veuillez contacter votre administrateur afin qu'il valide votre compte.
      </span>
    );
  } else {
    return <span>Vous devez vous connecter pour accéder à l'application.</span>;
  }
};

const getSectionMessageAppearance = (status: AuthStatus) => {
  if (status.unexisting) {
    return 'error';
  } else if (status.authenticated && !status.verified) {
    return 'warning';
  } else {
    return 'information';
  }
};
