import { useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import {
  Title3,
  Body1,
  Button,
  Spinner,
  makeStyles,
  tokens,
  Toolbar,
  ToolbarButton,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  DialogTrigger,
  Field,
  Input,
  Select,
  Persona,
  Badge,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import { List, ListItem } from '@fluentui/react-list-preview';
import { BuildingPeople24Filled, ArrowSwap24Regular } from '@fluentui/react-icons';
import { GlobalState, Congregations, Users } from '../data';
import { Congregation, User } from '../types';
import { Flags } from '../data/flags';
import { runTransaction, doc, collection } from 'firebase/firestore';
import { db } from '../data/database';

const useStyles = makeStyles({
  container: {
    padding: '16px',
  },
  header: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
  },
  list: {
    marginTop: '16px',
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
  },
  selectedItem: {
    backgroundColor: tokens.colorNeutralBackground2,
  },
  membersList: {
    marginTop: '16px',
  },
  memberItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  formField: {
    marginBottom: '12px',
  },
});

interface TransferDialogProps {
  show: boolean;
  member: User;
  linkedPublisherId?: string;
  congregations: Congregation[];
  onTransfer: (memberId: string, publisherId: string | undefined, targetCongregationId: string) => Promise<void>;
  onClose: () => void;
}

function TransferDialog({ show, member, linkedPublisherId, congregations, onTransfer, onClose }: TransferDialogProps) {
  const styles = useStyles();
  const [targetId, setTargetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTransfer = () => {
    if (!targetId) return;
    setLoading(true);
    setError('');
    onTransfer(member.id, linkedPublisherId, targetId)
      .then(() => {
        onClose();
      })
      .catch((e: Error) => {
        setError(e?.message || 'Une erreur est survenue lors du transfert.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog open={show}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Transférer {member.displayName}</DialogTitle>
          <DialogContent>
            {error && (
              <MessageBar intent="error" className={styles.formField}>
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            )}
            <Field label="Congrégation de destination" className={styles.formField}>
              <Select value={targetId} onChange={(_, d) => setTargetId(d.value)}>
                <option value="">-- Choisir --</option>
                {congregations
                  .filter((c) => c.id !== member.congregationId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.number})
                    </option>
                  ))}
              </Select>
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={handleTransfer} disabled={!targetId || loading}>
              {loading ? <Spinner size="tiny" /> : 'Transférer'}
            </Button>
            <DialogTrigger disableButtonEnhancement>
              <Button onClick={onClose}>Annuler</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

interface CreateCongregationDialogProps {
  show: boolean;
  onCreated: (congregation: Congregation) => void;
  onClose: () => void;
}

function CreateCongregationDialog({ show, onCreated, onClose }: CreateCongregationDialogProps) {
  const styles = useStyles();
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!name || !number) return;
    setLoading(true);
    setError('');
    Congregations.create({
      name,
      number: parseInt(number, 10),
    })
      .then((congregation) => {
        onCreated(congregation);
        Flags.raiseSuccess({ title: 'Congrégation créée', description: `"${congregation.name}" a été créée avec succès.` });
        setName('');
        setNumber('');
        onClose();
      })
      .catch((e: Error) => {
        setError(e?.message || 'Une erreur est survenue lors de la création.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog open={show}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Nouvelle Congrégation</DialogTitle>
          <DialogContent>
            {error && (
              <MessageBar intent="error" className={styles.formField}>
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            )}
            <Field label="Nom" className={styles.formField}>
              <Input value={name} onChange={(_, d) => setName(d.value)} />
            </Field>
            <Field label="Numéro" className={styles.formField}>
              <Input
                type="number"
                value={number}
                onChange={(_, d) => setNumber(d.value)}
              />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={handleCreate} disabled={!name || !number || loading}>
              {loading ? <Spinner size="tiny" /> : 'Créer'}
            </Button>
            <DialogTrigger disableButtonEnhancement>
              <Button onClick={onClose}>Annuler</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

export function CongregationsPage() {
  const styles = useStyles();
  const { congregations, users, publishers } = useSelector(
    (state: GlobalState) => ({
      congregations: state.congregations.congregations,
      users: Object.values(state.users.users),
      publishers: state.publishers.publishers,
    }),
    shallowEqual,
  );

  const [selectedCongregation, setSelectedCongregation] = useState<Congregation | null>(null);
  const [transferMember, setTransferMember] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const membersOfSelected = selectedCongregation
    ? (users as User[]).filter((u) => u.congregationId === selectedCongregation.id)
    : [];

  const publishersOfSelected = selectedCongregation
    ? publishers.filter((p) => p.congregationId === selectedCongregation.id)
    : [];

  /**
   * Transfers a user (and their linked publisher if any) to a new congregation
   * using a Firestore Transaction for atomicity.
   */
  const handleTransfer = async (
    memberId: string,
    linkedPublisherId: string | undefined,
    targetCongregationId: string,
  ) => {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(collection(db, 'Users'), memberId);
      transaction.update(userRef, { congregationId: targetCongregationId });

      if (linkedPublisherId) {
        const publisherRef = doc(collection(db, 'Publishers'), linkedPublisherId);
        transaction.update(publisherRef, { congregationId: targetCongregationId });
      }
    });

    // Refresh users/publishers
    await Users.all();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BuildingPeople24Filled />
        <Title3>Gestion des Congrégations</Title3>
        <Button
          appearance="primary"
          size="small"
          onClick={() => setShowCreateDialog(true)}>
          + Nouvelle Congrégation
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Left: congregation list */}
        <div style={{ flex: '0 0 280px' }}>
          <Body1>Congrégations ({congregations.length})</Body1>
          <List className={styles.list}>
            {congregations.map((cong) => (
              <ListItem
                key={cong.id}
                className={`${styles.listItem} ${selectedCongregation?.id === cong.id ? styles.selectedItem : ''}`}
                onClick={() => setSelectedCongregation(cong)}>
                <div>
                  <Body1>{cong.name}</Body1>
                  <br />
                  <Badge appearance="outline" color="informative">
                    #{cong.number}
                  </Badge>
                </div>
              </ListItem>
            ))}
            {congregations.length === 0 && (
              <Body1>Aucune congrégation enregistrée.</Body1>
            )}
          </List>
        </div>

        {/* Right: members of selected congregation */}
        {selectedCongregation && (
          <div style={{ flex: 1 }}>
            <Title3>{selectedCongregation.name}</Title3>
            <Body1>
              {membersOfSelected.length} utilisateur(s) · {publishersOfSelected.length} proclamateur(s)
            </Body1>

            <List className={styles.membersList}>
              {membersOfSelected.map((member) => {
                return (
                  <ListItem key={member.id} className={styles.memberItem}>
                    <Persona
                      name={member.displayName}
                      secondaryText={member.email}
                      avatar={{ image: { src: member.photoURL } }}
                    />
                    <Toolbar>
                      <ToolbarButton
                        icon={<ArrowSwap24Regular />}
                        onClick={() => setTransferMember(member)}>
                        Transférer
                      </ToolbarButton>
                    </Toolbar>
                  </ListItem>
                );
              })}
              {membersOfSelected.length === 0 && (
                <Body1>Aucun membre dans cette congrégation.</Body1>
              )}
            </List>
          </div>
        )}
      </div>

      {/* Transfer dialog */}
      {transferMember && (
        <TransferDialog
          show={!!transferMember}
          member={transferMember}
          linkedPublisherId={
            transferMember.publisherId !== 'unassociated'
              ? transferMember.publisherId
              : undefined
          }
          congregations={congregations}
          onTransfer={handleTransfer}
          onClose={() => setTransferMember(null)}
        />
      )}

      {/* Create congregation dialog */}
      <CreateCongregationDialog
        show={showCreateDialog}
        onCreated={() => {}}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
}
