import Banner from '@atlaskit/banner';
import { authenticate, AuthStatus } from './authentication';
import { SignInButton } from './signin-button';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import InfoIcon from '@atlaskit/icon/glyph/info';
import ErrorIcon from '@atlaskit/icon/glyph/error';

interface Props {
  status: AuthStatus;
}

export const AuthenticationPanel = (props: Props) => {
  return (
    <div className="login-box">
      <Banner
        appearance={getAppearance(props.status)}
        icon={getIcon(props.status)}
        isOpen
      >
        {getText(props.status)}
      </Banner>
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
        Veuille contacter votre administrateur afin qu'il valide votre compte.
      </span>
    );
  } else {
    return <span>Vous devez vous connecter pour accéder à l'application.</span>;
  }
};

const getIcon = (status: AuthStatus) => {
  if (status.unexisting) {
    return <ErrorIcon label="" secondaryColor="inherit" />;
  } else if (status.authenticated && !status.verified) {
    return <WarningIcon label="" secondaryColor="inherit" />;
  } else {
    return <InfoIcon label="" secondaryColor="inherit" />;
  }
};

const getAppearance = (status: AuthStatus) => {
  if (status.unexisting) {
    return 'error';
  } else if (status.authenticated && !status.verified) {
    return 'warning';
  } else {
    return 'announcement';
  }
};
