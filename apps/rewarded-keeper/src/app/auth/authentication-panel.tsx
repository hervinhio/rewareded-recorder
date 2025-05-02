/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Link,
  Button,
  makeStyles,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
  themeToTokensObject,
} from '@fluentui/react-components';
import { SignInButton } from './signin-button';
import { darkTheme, lightTheme, themeMode } from '../theme';
import { useMemo } from 'react';
import { GoogleAuthenticator } from './google-authenticator';
import { useLocation, useNavigate } from 'react-router-dom';
import { DismissRegular } from '@fluentui/react-icons';
import WhatsAppImage from './whatsapp.png';

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

interface Props {
  action: 'stop' | 'continue' | 'error' | '';
}

export const AuthenticationPanel = (props: Props) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const authenticator = useMemo(() => {
    return new GoogleAuthenticator(navigate);
  }, []);
  const styles = useClasses();
  const showMessageBox = state?.action === 'register' || props.action;

  return (
    <div className="login-box">
      <div className={styles.messageContainer}>
        {showMessageBox && (
          <MessageBar
            intent={getMessageBarIntent(state?.action || props.action)}>
            <MessageBarBody>
              <MessageBarTitle>Erreur de compte</MessageBarTitle>
              {getText(state?.action || props.action)}
            </MessageBarBody>
            <MessageBarActions
              containerAction={
                <Button
                  aria-label="signup"
                  appearance="transparent"
                  onClick={() => navigate('/')}
                  icon={<DismissRegular />}
                />
              }>
              {state?.action === 'register' && (
                <Button onClick={() => authenticator.signUp(state.code)}>
                  S'enregistrer
                </Button>
              )}
            </MessageBarActions>
          </MessageBar>
        )}
      </div>
      <div className={styles.buttons}>
        <SignInButton
          text="Se connecter avec Google"
          onClick={() => authenticator.logIn()}
        />
      </div>
    </div>
  );
};

const getText = (status: 'error' | 'register' | 'continue' | 'stop') => {
  if (status === 'register') {
    return 'Utisateur non existant, voulez-vous vous enregistrer?';
  } else if (status === 'stop') {
    return `Veuillez contacter votre administrateur afin qu'il valide votre compte.`;
  } else if (status === 'error') {
    return (
      <div style={{ marginBottom: '8px' }}>
        <span>
          Une erreur est survenue lors de l'authentification. Si cette error
          persiste veuillez en informer l'administrateur sur son{' '}
        </span>{' '}
        <Link href={'https://wa.me/243820989056'}>
          WhatsApp{' '}
          <img alt={'WhatsApp'} src={WhatsAppImage} height={24} width={24} />
        </Link>
      </div>
    );
  }

  return null;
};

const getMessageBarIntent = (
  status: 'error' | 'register' | 'continue' | 'stop',
) => {
  if (status === 'register') {
    return 'error';
  } else if (status === 'stop') {
    return 'warning';
  } else if (status === 'error') {
    return 'error';
  }

  return 'info';
};
