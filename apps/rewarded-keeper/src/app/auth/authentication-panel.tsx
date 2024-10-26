/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  makeStyles,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import { authenticate, AuthStatus } from './authentication';
import { SignInButton } from './signin-button';

interface Props {
  status: AuthStatus;
}

const useClasses = makeStyles({
  messageContainer: {
    position: 'fixed',
    width: 'calc(100% - 32px)',
    margin: '16px 16px 0 16px',
  },
  buttons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
    height: 'fit-content',
    width: 'fit-content',
    textAlign: 'center',
  },
});

export const AuthenticationPanel = (props: Props) => {
  const styles = useClasses();
  const showMessageBox = props.status.unexisting || !props.status.verified;

  return (
    <div className="login-box">
      <div className={styles.messageContainer}>
        {showMessageBox && (
          <MessageBar intent={getMessageBarIntent(props.status)}>
            <MessageBarBody>{getText(props.status)}</MessageBarBody>
          </MessageBar>
        )}
      </div>
      <div className={styles.buttons}>
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
  }

  return null;
};

const getMessageBarIntent = (status: AuthStatus) => {
  if (status.unexisting) {
    return 'error';
  } else if (status.authenticated && !status.verified) {
    return 'warning';
  } else {
    return 'info';
  }
};
