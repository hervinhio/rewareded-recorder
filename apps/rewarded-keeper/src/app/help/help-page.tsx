import { useState } from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Body1,
  Button,
  Divider,
  Dropdown,
  Field,
  Input,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Option,
  Subtitle1,
  Textarea,
  Title3,
  tokens,
} from '@fluentui/react-components';
import {
  BookQuestionMark24Regular,
  Chat24Regular,
  Link24Regular,
  Video24Regular,
} from '@fluentui/react-icons';
import { Link } from 'react-router-dom';
import { Cases } from '../data';
import { Users } from '../data';
import { CaseSeverity } from '../types';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '600px',
  },
  casesLink: {
    marginTop: '8px',
  },
  emptyState: {
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
  },
});

export function HelpPage() {
  const styles = useStyles();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<CaseSeverity>('question');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const severityOptions: { key: CaseSeverity; label: string }[] = [
    { key: 'bug', label: 'Bug' },
    { key: 'feature_request', label: 'Demande de fonctionnalité' },
    { key: 'question', label: 'Question' },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;
    const user = Users.getCurrent();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await Cases.create(
        title.trim(),
        description.trim(),
        severity,
        user.id,
        user.displayName,
        user.photoURL || '',
      );
      setTitle('');
      setDescription('');
      setSeverity('question');
      setSubmitted(true);
    } catch (error: any) {
      setSubmitError(
        error?.message ?? 'Une erreur est survenue. Veuillez réessayer.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Title3>Aide</Title3>

      {/* FAQ Section */}
      <Divider />
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <BookQuestionMark24Regular />
          <Subtitle1>FAQ</Subtitle1>
        </div>
        <Accordion collapsible multiple>
          {/* No FAQ entries yet */}
        </Accordion>
        <Body1 className={styles.emptyState}>
          Aucune question fréquemment posée pour le moment.
        </Body1>
      </div>

      {/* Tutorials Section */}
      <Divider />
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Video24Regular />
          <Subtitle1>Tutoriels</Subtitle1>
        </div>
        <Body1 className={styles.emptyState}>
          Aucun tutoriel disponible pour le moment.
        </Body1>
      </div>

      {/* Contact Section */}
      <Divider />
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Chat24Regular />
          <Subtitle1>Contacter le développeur</Subtitle1>
        </div>
        <Body1>
          Vous avez un problème, une question ou une suggestion ? Remplissez le
          formulaire ci-dessous pour nous contacter.
        </Body1>

        {submitted ? (
          <Body1>
            ✅ Votre demande a été envoyée avec succès. Nous vous répondrons
            dans les plus brefs délais.
          </Body1>
        ) : (
          <div className={styles.form}>
            <Field label="Titre" required>
              <Input
                value={title}
                onChange={(_, d) => setTitle(d.value)}
                placeholder="Résumez votre demande en quelques mots"
              />
            </Field>

            <Field label="Sévérité" required>
              <Dropdown
                value={
                  severityOptions.find((o) => o.key === severity)?.label ?? ''
                }
                selectedOptions={[severity]}
                onOptionSelect={(_, d) =>
                  setSeverity(d.optionValue as CaseSeverity)
                }>
                {severityOptions.map((opt) => (
                  <Option key={opt.key} value={opt.key}>
                    {opt.label}
                  </Option>
                ))}
              </Dropdown>
            </Field>

            <Field label="Description" required>
              <Textarea
                value={description}
                onChange={(_, d) => setDescription(d.value)}
                placeholder="Décrivez votre problème ou votre demande en détail"
                rows={5}
              />
            </Field>

            <Button
              appearance="primary"
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !description.trim()}>
              {submitting ? 'Envoi en cours…' : 'Envoyer'}
            </Button>

            {submitError && (
              <MessageBar intent="error">
                <MessageBarBody>{submitError}</MessageBarBody>
              </MessageBar>
            )}
          </div>
        )}

        <div className={styles.casesLink}>
          <Link24Regular style={{ verticalAlign: 'middle', marginRight: 4 }} />
          <Link to="/cases">Voir toutes mes demandes</Link>
        </div>
      </div>
    </div>
  );
}
