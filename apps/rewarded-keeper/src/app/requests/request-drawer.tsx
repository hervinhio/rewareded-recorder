import { useState } from 'react';
import {
  Body1,
  Button,
  Dropdown,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Field,
  makeStyles,
  Option,
  OverlayDrawer,
  Persona,
  Subtitle2,
  Textarea,
  tokens,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { Case, CaseStatus } from '../types';
import { Cases } from '../data';
import { Users } from '../data';
import { SeverityBadge } from '../cases/severity-badge';
import { StatusBadge } from '../cases/status-badge';

interface Props {
  caseItem: Case | null;
  onClose: () => void;
}

const useStyles = makeStyles({
  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
  },
  meta: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  description: {
    whiteSpace: 'pre-wrap',
  },
  commentsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px',
  },
  comment: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  commentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  commentText: {
    paddingLeft: '4px',
  },
  addComment: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
});

const STATUS_OPTIONS: { key: CaseStatus; label: string }[] = [
  { key: 'open', label: 'Ouvert' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'closed', label: 'Résolu' },
];

export function RequestDrawer({ caseItem, onClose }: Props) {
  const styles = useStyles();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!caseItem || !commentText.trim()) return;
    const user = Users.getCurrent();
    setSubmitting(true);
    try {
      await Cases.addComment(
        caseItem,
        commentText.trim(),
        user.id,
        user.displayName,
        user.photoURL || '',
      );
      setCommentText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (status: CaseStatus) => {
    if (!caseItem) return;
    await Cases.updateStatus(caseItem, status);
  };

  return (
    <OverlayDrawer
      open={!!caseItem}
      onOpenChange={(_, { open }) => { if (!open) onClose(); }}
      position="end"
      size="medium">
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              icon={<Dismiss24Regular />}
              onClick={onClose}
            />
          }>
          {caseItem?.title ?? ''}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody className={styles.drawerBody}>
        {caseItem && (
          <>
            <div className={styles.meta}>
              <SeverityBadge severity={caseItem.severity} />
              <StatusBadge status={caseItem.status} />
              <Body1>
                Créé le{' '}
                {caseItem.createdAt?.toDate().toLocaleDateString('fr-FR')}
              </Body1>
            </div>

            {/* Creator info */}
            <div>
              <Subtitle2>Demandeur</Subtitle2>
              <Persona
                name={caseItem.creatorName}
                avatar={{ image: { src: caseItem.creatorPhotoURL } }}
                size="medium"
              />
            </div>

            {/* Change status */}
            <div className={styles.statusRow}>
              <Subtitle2>Statut</Subtitle2>
              <Dropdown
                value={
                  STATUS_OPTIONS.find((o) => o.key === caseItem.status)
                    ?.label ?? ''
                }
                selectedOptions={[caseItem.status]}
                onOptionSelect={(_, d) =>
                  handleStatusChange(d.optionValue as CaseStatus)
                }>
                {STATUS_OPTIONS.map((opt) => (
                  <Option key={opt.key} value={opt.key}>
                    {opt.label}
                  </Option>
                ))}
              </Dropdown>
            </div>

            <div>
              <Subtitle2>Description</Subtitle2>
              <Body1 className={styles.description}>
                {caseItem.description}
              </Body1>
            </div>

            {/* Dates */}
            <div>
              <Body1>
                Mis à jour le{' '}
                {caseItem.updatedAt?.toDate().toLocaleDateString('fr-FR')}
              </Body1>
            </div>

            {/* Comments */}
            <div className={styles.commentsSection}>
              <Subtitle2>
                Commentaires ({caseItem.comments?.length ?? 0})
              </Subtitle2>
              {(caseItem.comments ?? []).map((c) => (
                <div key={c.id} className={styles.comment}>
                  <div className={styles.commentMeta}>
                    <Persona
                      name={c.authorName}
                      avatar={{ image: { src: c.authorPhotoURL } }}
                      size="extra-small"
                    />
                    <Body1>
                      {c.createdAt?.toDate().toLocaleString('fr-FR')}
                    </Body1>
                  </div>
                  <Body1 className={styles.commentText}>{c.text}</Body1>
                </div>
              ))}

              <div className={styles.addComment}>
                <Field label="Ajouter un commentaire">
                  <Textarea
                    value={commentText}
                    onChange={(_, d) => setCommentText(d.value)}
                    placeholder="Écrivez votre commentaire…"
                    rows={3}
                  />
                </Field>
                <Button
                  appearance="primary"
                  onClick={handleAddComment}
                  disabled={submitting || !commentText.trim()}>
                  {submitting ? 'Envoi…' : 'Ajouter'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DrawerBody>
    </OverlayDrawer>
  );
}
