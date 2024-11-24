/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Caption1,
  makeStyles,
  MessageBar,
  MessageBarBody,
  themeToTokensObject,
} from '@fluentui/react-components';
import { authenticate } from './authentication';
import { SignInButton } from './signin-button';
import { darkTheme, lightTheme, themeMode } from '../theme';
import { AuthStatus } from './authenticator';

interface Props {
  status: AuthStatus;
}

const tokens = themeToTokensObject(
  themeMode === 'light' ? lightTheme : darkTheme,
);

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
  link: {
    color: tokens.colorBrandForegroundLink,
    textDecoration: 'none',
  },
});

export const AuthenticationPanel = (props: Props) => {
  const styles = useClasses();
  const showMessageBox =
    (props.status.unexisting || !props.status.verified) &&
    props.status.authenticated;

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
        <Caption1 className="register-hint">
          Pas de compte ?{' '}
          <a
            className={styles.link}
            href="#"
            onClick={() => authenticate(true)}>
            Enregistrez-vous
          </a>
        </Caption1>
      </div>
    </div>
  );
};

const getText = (status: AuthStatus) => {
  if (status.unexisting) {
    return 'Utisateur non existant, voulez-vous vous enregistrer?';
  } else if (status.authenticated && !status.verified) {
    return `Veuillez contacter votre administrateur afin qu'il valide votre compte.`;
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
