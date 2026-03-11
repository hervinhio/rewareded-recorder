import { useState } from 'react';
import {
  Body1,
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Field,
  makeStyles,
  OverlayDrawer,
  Persona,
  Select,
  Subtitle2,
  Textarea,
  tokens,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { Case } from '../types';
import { Cases } from '../data';
import { Users } from '../data';
import { SeverityBadge } from './severity-badge';
import { StatusBadge } from './status-badge';

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
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  description: {
    whiteSpace: 'pre-wrap',
  },
  updatedAt: {
    color: tokens.colorNeutralForeground3,
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
});

export function CaseDrawer({ caseItem, onClose }: Props) {
  const styles = useStyles();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const handleStatusChange = async (status: Case['status']) => {
    if (!caseItem) return;
    setUpdatingStatus(true);
    try {
      await Cases.updateStatus(caseItem, status);
    } finally {
      setUpdatingStatus(false);
    }
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

            <div className={styles.section}>
              <Subtitle2>Demandeur</Subtitle2>
              <Persona
                name={caseItem.creatorName}
                avatar={{ image: { src: caseItem.creatorPhotoURL } }}
                size="small"
              />
            </div>

            <Field label="Statut">
              <Select
                value={caseItem.status}
                disabled={updatingStatus}
                onChange={(_, d) => handleStatusChange(d.value as Case['status'])}>
                <option value="open">Ouvert</option>
                <option value="in_progress">En cours</option>
                <option value="closed">Résolu</option>
              </Select>
            </Field>

            <div className={styles.section}>
              <Subtitle2>Description</Subtitle2>
              <Body1 className={styles.description}>
                {caseItem.description}
              </Body1>
            </div>

            {caseItem.updatedAt && (
              <Body1 className={styles.updatedAt}>
                Mis à jour le{' '}
                {caseItem.updatedAt.toDate().toLocaleDateString('fr-FR')}
              </Body1>
            )}

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
