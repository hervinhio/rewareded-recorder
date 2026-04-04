import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Config, Dialogs, GlobalState, Users } from '../data';
import { FormEvent, useState } from 'react';
import {
  Body1,
  Button,
  Field,
  Input,
  makeStyles,
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  MessageBarBody,
  Subtitle1,
  Switch,
} from '@fluentui/react-components';
import {
  MultiPermissionGuard,
  RoleGuard,
} from '../components/permission-guard';
import { Link } from 'react-router-dom';
import { Permission, Role } from '../types';
import {
  auth,
  linkWithGoogle,
  updateUserEmail,
  updateUserPassword,
} from '../auth/authentication';
import { SignInButton } from '../auth/signin-button';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: '70% 1fr',
    gridAutoColumns: 'auto',
    rowGap: '16px',
  },
  mainColumn: {
    textWrap: 'wrap',
  },
  credentialsForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '320px',
  },
});

export function ConfigPage() {
  const config = useSelector(
    (state: GlobalState) => state.config,
    shallowEqual,
  );
  const dispatch = useDispatch();
  const [isThemeDropdownOpened, setIsThemeDropdownOpened] = useState(false);
  const saveThemeValue = (value: 'dark' | 'light' | 'system') => {
    Config.update({ ...config, theme: value });
    setIsThemeDropdownOpened(false);
    localStorage.setItem('themeMode', value);
  };
  const styles = useStyles();

  const currentFirebaseUser = auth.currentUser;
  const hasPasswordProvider = currentFirebaseUser?.providerData?.some(
    (p) => p.providerId === 'password',
  );
  const hasGoogleProvider = currentFirebaseUser?.providerData?.some(
    (p) => p.providerId === 'google.com',
  );

  return (
    <section role="grid" className={styles.grid}>
      <div role="gridcell" className={styles.mainColumn}>
        <Subtitle1>Afficher les mois au format court</Subtitle1>
        <p>
          <Body1>
            Lorsque cette option est activée, les mois dans la visualisation des
            rapports de services s'afficheront au format court. Ex: Jan. 23 au
            lieu de Janvier 2023.
          </Body1>
        </p>
      </div>
      <div role="gridcell">
        <Switch
          onChange={() => {
            Config.update({
              ...config,
              useShortenedMonths: !config.useShortenedMonths,
            });
          }}
          checked={config.useShortenedMonths}
        />
      </div>

      <MultiPermissionGuard
        permissions={[Permission.REPORT_MANAGE]}
        user={Users.getCurrent()}>
        <div role="gridcell" className={styles.mainColumn}>
          <Subtitle1>Générer les fichiers XLSX sur le serveur</Subtitle1>
          <p>
            <Body1>
              Lorsque cette option est activée, les fichiers Excel seront
              générés côté serveur au lieu du navigateur. Cela peut améliorer
              les performances pour des fichiers volumineux et offrir des
              fonctionnalités d'agrégation avancées.
            </Body1>
          </p>
        </div>
      </MultiPermissionGuard>

      <div role="gridcell">
        <Switch
          onChange={() => {
            Config.update({
              ...config,
              useServerXlsxGeneration: !config.useServerXlsxGeneration,
            });
          }}
          checked={config.useServerXlsxGeneration}
        />
      </div>
      <div role="gridcell" className={styles.mainColumn}>
        <Subtitle1>Thème</Subtitle1>
        <div>
          <Body1>Choisissez:</Body1>
          <ul>
            <li>
              <Body1>
                <code>Sombre</code> pour définir le thème sombre par défaut.
              </Body1>
            </li>
            <li>
              <Body1>
                <code>Claire</code> pour définir le thème claire par défaut.
              </Body1>
            </li>
            <li>
              <Body1>
                <code>Automatique</code> pour laisser le thème être dicté par le
                système.
              </Body1>
            </li>
          </ul>
        </div>
        <MessageBar intent="warning">
          Certains contorles ne supportent pas le mode sombre pour l'instant.
          C'est un travail en cours.
        </MessageBar>
      </div>
      <div role="gridcell">
        <Menu open={isThemeDropdownOpened}>
          <MenuTrigger>
            <Button
              onClick={() => setIsThemeDropdownOpened(!isThemeDropdownOpened)}>
              {themeToDropdownValue(config.theme)}
            </Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuItem onClick={() => saveThemeValue('dark')}>Sombre</MenuItem>
            <MenuItem onClick={() => saveThemeValue('light')}>Clair</MenuItem>
            <MenuItem onClick={() => saveThemeValue('system')}>
              Automatique
            </MenuItem>
          </MenuPopover>
        </Menu>
      </div>

      <RoleGuard
        user={Users.getCurrent()}
        allowedRoles={[Role.ADMIN, Role.ROOT]}>
        <div role="gridcell" className={styles.mainColumn}>
          <Subtitle1>Mois spéciaux</Subtitle1>
          <p>
            <Body1>
              Gérez les <Link to="/months">mois spéciaux</Link> pour votre
              organisation.
            </Body1>
          </p>
        </div>
        <div role="gridcell">
          <Button
            appearance="primary"
            onClick={() =>
              dispatch(Dialogs.slice.actions.toggleCreateSpecialMonthModal())
            }>
            Ajouter un mois spécial
          </Button>
        </div>
      </RoleGuard>

      {hasPasswordProvider && <CredentialsSection styles={styles} />}

      <GoogleSignInSection
        styles={styles}
        hasGoogleProvider={!!hasGoogleProvider}
        googleEmail={
          currentFirebaseUser?.providerData?.find(
            (p) => p.providerId === 'google.com',
          )?.email ?? null
        }
      />
    </section>
  );
}

function themeToDropdownValue(theme: 'dark' | 'light' | 'system'): string {
  if (theme === 'dark') {
    return 'Sombre';
  } else if (theme === 'light') {
    return 'Claire';
  }

  return 'Automatique';
}

interface CredentialsSectionProps {
  styles: ReturnType<typeof useStyles>;
}

function CredentialsSection({ styles }: CredentialsSectionProps) {
  const [passwordMessage, setPasswordMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [emailMessage, setEmailMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMessage(null);
    const form = e.currentTarget;
    const currentPassword = (
      form.elements.namedItem('currentPassword') as HTMLInputElement
    ).value;
    const newPassword = (
      form.elements.namedItem('newPassword') as HTMLInputElement
    ).value;
    const confirmNewPassword = (
      form.elements.namedItem('confirmNewPassword') as HTMLInputElement
    ).value;

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({
        text: 'Les nouveaux mots de passe ne correspondent pas.',
        type: 'error',
      });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({
        text: 'Le mot de passe doit contenir au moins 6 caractères.',
        type: 'error',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      setPasswordMessage({
        text: 'Mot de passe mis à jour avec succès.',
        type: 'success',
      });
      form.reset();
    } catch (err: any) {
      setPasswordMessage({
        text: getCredentialsErrorMessage(err?.code),
        type: 'error',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailMessage(null);
    const form = e.currentTarget;
    const currentPassword = (
      form.elements.namedItem('currentPasswordEmail') as HTMLInputElement
    ).value;
    const newEmail = (form.elements.namedItem('newEmail') as HTMLInputElement)
      .value;

    setIsChangingEmail(true);
    try {
      await updateUserEmail(currentPassword, newEmail);
      setEmailMessage({
        text: 'Adresse e-mail mise à jour avec succès.',
        type: 'success',
      });
      form.reset();
    } catch (err: any) {
      setEmailMessage({
        text: getCredentialsErrorMessage(err?.code),
        type: 'error',
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  return (
    <>
      <div role="gridcell" className={styles.mainColumn}>
        <Subtitle1>Identifiants</Subtitle1>
        <p>
          <Body1>Modifier le mot de passe de votre compte.</Body1>
        </p>
      </div>
      <div role="gridcell"></div>

      <div role="gridcell" className={styles.mainColumn}>
        <form
          onSubmit={handleChangePassword}
          className={styles.credentialsForm}>
          <Field label="Mot de passe actuel" required>
            <Input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
            />
          </Field>
          <Field label="Nouveau mot de passe" required>
            <Input
              name="newPassword"
              type="password"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirmer le nouveau mot de passe" required>
            <Input
              name="confirmNewPassword"
              type="password"
              autoComplete="new-password"
            />
          </Field>
          {passwordMessage && (
            <MessageBar intent={passwordMessage.type}>
              <MessageBarBody>{passwordMessage.text}</MessageBarBody>
            </MessageBar>
          )}
          <Button
            appearance="primary"
            type="submit"
            disabled={isChangingPassword}>
            Changer le mot de passe
          </Button>
        </form>
      </div>
      <div role="gridcell"></div>

      <div role="gridcell" className={styles.mainColumn}>
        <Subtitle1>Adresse e-mail</Subtitle1>
        <p>
          <Body1>Modifier l&apos;adresse e-mail de votre compte.</Body1>
        </p>
      </div>
      <div role="gridcell"></div>

      <div role="gridcell" className={styles.mainColumn}>
        <form onSubmit={handleChangeEmail} className={styles.credentialsForm}>
          <Field label="Mot de passe actuel" required>
            <Input
              name="currentPasswordEmail"
              type="password"
              autoComplete="current-password"
            />
          </Field>
          <Field label="Nouvelle adresse e-mail" required>
            <Input name="newEmail" type="email" autoComplete="email" />
          </Field>
          {emailMessage && (
            <MessageBar intent={emailMessage.type}>
              <MessageBarBody>{emailMessage.text}</MessageBarBody>
            </MessageBar>
          )}
          <Button appearance="primary" type="submit" disabled={isChangingEmail}>
            Changer l&apos;adresse e-mail
          </Button>
        </form>
      </div>
      <div role="gridcell"></div>
    </>
  );
}

function getCredentialsErrorMessage(code: string | undefined): string {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Mot de passe actuel incorrect.';
    case 'auth/email-already-in-use':
      return 'Cette adresse e-mail est déjà utilisée.';
    case 'auth/invalid-email':
      return 'Adresse e-mail invalide.';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Veuillez réessayer plus tard.';
    case 'auth/requires-recent-login':
      return 'Veuillez vous reconnecter avant de modifier vos identifiants.';
    default:
      return 'Une erreur est survenue. Veuillez réessayer.';
  }
}

interface GoogleSignInSectionProps {
  styles: ReturnType<typeof useStyles>;
  hasGoogleProvider: boolean;
  googleEmail: string | null;
}

function GoogleSignInSection({
  styles,
  hasGoogleProvider,
  googleEmail,
}: GoogleSignInSectionProps) {
  const [googleMessage, setGoogleMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkGoogle = async () => {
    setGoogleMessage(null);
    setIsLinking(true);
    try {
      await linkWithGoogle();
      setGoogleMessage({
        text: 'Connexion Google ajoutée avec succès.',
        type: 'success',
      });
    } catch (err: any) {
      const code: string | undefined = err?.code;
      let text: string;
      if (code === 'auth/credential-already-in-use') {
        text = 'Ce compte Google est déjà associé à un autre compte.';
      } else if (code === 'auth/email-already-in-use') {
        text = "L'adresse e-mail de ce compte Google est déjà utilisée.";
      } else if (code === 'auth/popup-closed-by-user') {
        text = 'La fenêtre de connexion a été fermée.';
      } else {
        text = 'Une erreur est survenue. Veuillez réessayer.';
      }
      setGoogleMessage({ text, type: 'error' });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <>
      <div role="gridcell" className={styles.mainColumn}>
        <Subtitle1>Connexion Google</Subtitle1>
        <p>
          <Body1>
            {hasGoogleProvider
              ? 'Votre compte est lié à un compte Google.'
              : 'Liez votre compte à un compte Google pour vous connecter plus facilement.'}
          </Body1>
        </p>
      </div>
      <div role="gridcell"></div>

      <div role="gridcell" className={styles.mainColumn}>
        {hasGoogleProvider ? (
          <Body1>
            Connecté avec Google
            {googleEmail ? ` (${googleEmail})` : ''}.
          </Body1>
        ) : (
          <div className={styles.credentialsForm}>
            {googleMessage && (
              <MessageBar intent={googleMessage.type}>
                <MessageBarBody>{googleMessage.text}</MessageBarBody>
              </MessageBar>
            )}
            <SignInButton
              text={
                isLinking
                  ? 'Connexion en cours…'
                  : 'Ajouter la connexion Google'
              }
              onClick={handleLinkGoogle}
              disabled={isLinking}
            />
          </div>
        )}
      </div>
      <div role="gridcell"></div>
    </>
  );
}
