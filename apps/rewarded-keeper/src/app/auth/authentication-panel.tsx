/* eslint-disable jsx-a11y/anchor-is-valid */
import { FormEvent, useState } from 'react';
import {
  Button,
  Caption1,
  Field,
  Input,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Subtitle2,
  themeToTokensObject,
} from '@fluentui/react-components';
import {
  authenticate,
  authenticateWithCredentials,
  AuthStatus,
  isAuthenticated,
  registerWithCredentials,
} from './authentication';
import { SignInButton } from './signin-button';
import { darkTheme, lightTheme, themeMode } from '../theme';

interface Props {
  status: AuthStatus;
  onAuthSuccess?: (status: AuthStatus) => void;
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
    width: '320px',
    textAlign: 'center',
  },
  link: {
    color: tokens.colorBrandForegroundLink,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '12px 0',
  },
  dividerLine: {
    flex: '1',
    height: '1px',
    backgroundColor: tokens.colorNeutralStroke1,
  },
  errorMessage: {
    marginTop: '8px',
  },
});

export const AuthenticationPanel = (props: Props) => {
  const styles = useClasses();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [credentialsError, setCredentialsError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showMessageBox =
    (props.status.unexisting || !props.status.verified) &&
    props.status.authenticated;

  const handleCredentialsSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCredentialsError('');
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      .value;

    if (!email || !password) {
      setCredentialsError('Veuillez renseigner tous les champs.');
      return;
    }

    if (isRegisterMode) {
      const displayName = (
        form.elements.namedItem('displayName') as HTMLInputElement
      ).value;
      const confirmPassword = (
        form.elements.namedItem('confirmPassword') as HTMLInputElement
      ).value;

      if (!displayName) {
        setCredentialsError('Veuillez renseigner votre nom.');
        return;
      }
      if (password !== confirmPassword) {
        setCredentialsError('Les mots de passe ne correspondent pas.');
        return;
      }
      if (password.length < 6) {
        setCredentialsError(
          'Le mot de passe doit contenir au moins 6 caractères.',
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isRegisterMode) {
        const displayName = (
          form.elements.namedItem('displayName') as HTMLInputElement
        ).value;
        await registerWithCredentials(email, password, displayName);
      } else {
        await authenticateWithCredentials(email, password);
      }

      const status = await isAuthenticated();
      props.onAuthSuccess?.(status);
    } catch (err: any) {
      setCredentialsError(getFirebaseErrorMessage(err?.code));
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <div className={styles.divider}>
          <div className={styles.dividerLine}></div>
          <Caption1>ou</Caption1>
          <div className={styles.dividerLine}></div>
        </div>

        <Subtitle2>
          {isRegisterMode ? 'Créer un compte' : 'Se connecter'}
        </Subtitle2>

        <form onSubmit={handleCredentialsSubmit} className={styles.form}>
          {isRegisterMode && (
            <Field label="Nom d'affichage" required>
              <Input name="displayName" type="text" autoComplete="name" />
            </Field>
          )}
          <Field label="Adresse e-mail" required>
            <Input name="email" type="email" autoComplete="email" />
          </Field>
          <Field label="Mot de passe" required>
            <Input
              name="password"
              type="password"
              autoComplete={
                isRegisterMode ? 'new-password' : 'current-password'
              }
            />
          </Field>
          {isRegisterMode && (
            <Field label="Confirmer le mot de passe" required>
              <Input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
              />
            </Field>
          )}

          {credentialsError && (
            <MessageBar intent="error" className={styles.errorMessage}>
              <MessageBarBody>{credentialsError}</MessageBarBody>
            </MessageBar>
          )}

          <Button appearance="primary" type="submit" disabled={isSubmitting}>
            {isRegisterMode ? "S'enregistrer" : 'Se connecter'}
          </Button>
        </form>

        <div className="hr"></div>
        <Caption1>
          {isRegisterMode ? 'Déjà un compte ? ' : 'Pas de compte ? '}
          <a
            className={styles.link}
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setCredentialsError('');
            }}>
            {isRegisterMode ? 'Se connecter' : "S'enregistrer"}
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

const getFirebaseErrorMessage = (code: string | undefined): string => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Adresse e-mail invalide.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou mot de passe incorrect.';
    case 'auth/email-already-in-use':
      return 'Cette adresse e-mail est déjà utilisée.';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Veuillez réessayer plus tard.';
    case 'auth/network-request-failed':
      return 'Erreur réseau. Vérifiez votre connexion.';
    default:
      return 'Une erreur est survenue. Veuillez réessayer.';
  }
};
