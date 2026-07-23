import { useState, useEffect, useCallback } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import {
  Title3,
  Subtitle2,
  Body1,
  Caption1,
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
  Combobox,
  Option,
  Persona,
  Badge,
  MessageBar,
  MessageBarBody,
  Divider,
} from '@fluentui/react-components';
import { List, ListItem } from '@fluentui/react-list';
import {
  BuildingPeople24Filled,
  ArrowSwap24Regular,
  PersonAdd24Regular,
  PeopleAdd24Regular,
} from '@fluentui/react-icons';
import { GlobalState, Congregations, Users } from '../data';
import { Publishers } from '../data/publishers';
import { Congregation, User, Publisher } from '../types';
import { Flags } from '../data/flags';
import { runTransaction, doc, collection, updateDoc } from 'firebase/firestore';
import { db } from '../data/database';
import { getPublisherName } from '../content-panel/util';

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
  layout: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  leftPanel: {
    flex: '0 0 280px',
    minWidth: '220px',
  },
  rightPanel: {
    flex: 1,
    minWidth: '300px',
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
    marginTop: '8px',
  },
  memberItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '16px',
    marginBottom: '4px',
  },
  detailHeader: {
    marginBottom: '12px',
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
  onTransfer: (
    memberId: string,
    publisherId: string | undefined,
    targetCongregationId: number,
  ) => Promise<void>;
  onClose: () => void;
}

function TransferDialog({
  show,
  member,
  linkedPublisherId,
  congregations,
  onTransfer,
  onClose,
}: TransferDialogProps) {
  const styles = useStyles();
  const [targetId, setTargetId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
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

  const filteredCongs = congregations
    .filter((c) => c.congregationNumber !== member.congregationId)
    .filter((c) =>
      `${c.name} ${c.congregationNumber}`
        .toLowerCase()
        .includes(inputValue.toLowerCase()),
    );

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
            <Field
              label="Congrégation de destination"
              className={styles.formField}>
              <Combobox
                freeform
                placeholder="Rechercher une congrégation..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (!e.target.value) setTargetId(null);
                }}
                onOptionSelect={(_, data) => {
                  setInputValue(data.optionText || '');
                  setTargetId(Number(data.optionValue) || null);
                }}>
                {filteredCongs.map((c) => (
                  <Option
                    key={c.id}
                    value={String(c.congregationNumber)}
                    text={`${c.name} (${c.congregationNumber})`}>
                    {c.name} ({c.congregationNumber})
                  </Option>
                ))}
              </Combobox>
            </Field>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              onClick={handleTransfer}
              disabled={!targetId || loading}>
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

function CreateCongregationDialog({
  show,
  onCreated,
  onClose,
}: CreateCongregationDialogProps) {
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
      congregationNumber: parseInt(number, 10),
    })
      .then((congregation) => {
        onCreated(congregation);
        Flags.raiseSuccess({
          title: 'Congrégation créée',
          description: `"${congregation.name}" a été créée avec succès.`,
        });
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
            <Button
              appearance="primary"
              onClick={handleCreate}
              disabled={!name || !number || loading}>
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

// ── AddUserDialog ──────────────────────────────────────────────────────────────

interface AddUserDialogProps {
  show: boolean;
  congregation: Congregation;
  allUsers: User[];
  onClose: () => void;
  onAdded: () => void;
}

function AddUserDialog({
  show,
  congregation,
  allUsers,
  onClose,
  onAdded,
}: AddUserDialogProps) {
  const styles = useStyles();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const candidates = allUsers.filter(
    (u) => u.congregationId !== congregation.congregationNumber,
  );
  const filtered = candidates.filter((u) =>
    `${u.displayName} ${u.email}`
      .toLowerCase()
      .includes(inputValue.toLowerCase()),
  );
  const displayedUsers = filtered.slice(0, 10);

  const handleAdd = async () => {
    if (!selectedUserId) return;
    const user = allUsers.find((u) => u.id === selectedUserId);
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      await updateDoc(doc(collection(db, 'Users'), user.id), {
        congregationId: congregation.congregationNumber,
      });
      await Users.all();
      onAdded();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Une erreur est survenue lors de l'ajout.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setInputValue('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={show}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            Ajouter un utilisateur à {congregation.name}
          </DialogTitle>
          <DialogContent>
            {error && (
              <MessageBar intent="error" className={styles.formField}>
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            )}
            <Field label="Utilisateur" className={styles.formField}>
              <Combobox
                freeform
                placeholder="Rechercher par nom ou email..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (!e.target.value) setSelectedUserId('');
                }}
                onOptionSelect={(_, data) => {
                  setInputValue(data.optionText || '');
                  setSelectedUserId(data.optionValue || '');
                }}>
                {displayedUsers.map((u) => (
                  <Option key={u.id} value={u.id} text={u.displayName}>
                    {u.displayName} — {u.email}
                  </Option>
                ))}
              </Combobox>
            </Field>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              onClick={handleAdd}
              disabled={!selectedUserId || loading}>
              {loading ? <Spinner size="tiny" /> : 'Ajouter'}
            </Button>
            <DialogTrigger disableButtonEnhancement>
              <Button onClick={handleClose}>Annuler</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

// ── AddPublisherDialog ─────────────────────────────────────────────────────────

interface AddPublisherDialogProps {
  show: boolean;
  congregation: Congregation;
  allPublishers: Publisher[];
  onClose: () => void;
  onAdded: () => void;
}

function AddPublisherDialog({
  show,
  congregation,
  allPublishers,
  onClose,
  onAdded,
}: AddPublisherDialogProps) {
  const styles = useStyles();
  const [selectedPublisherId, setSelectedPublisherId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const candidates = allPublishers.filter(
    (p) => p.congregationId !== congregation.congregationNumber,
  );
  const filtered = candidates.filter((p) =>
    getPublisherName(p).toLowerCase().includes(inputValue.toLowerCase()),
  );
  const displayedPublishers = filtered.slice(0, 10);

  const handleAdd = async () => {
    if (!selectedPublisherId) return;
    const publisher = allPublishers.find((p) => p.id === selectedPublisherId);
    if (!publisher?.id) return;
    setLoading(true);
    setError('');
    try {
      await updateDoc(doc(collection(db, 'Publishers'), publisher.id), {
        congregationId: congregation.congregationNumber,
      });
      await Publishers.all();
      onAdded();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Une erreur est survenue lors de l'ajout.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPublisherId('');
    setInputValue('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={show}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            Ajouter un proclamateur à {congregation.name}
          </DialogTitle>
          <DialogContent>
            {error && (
              <MessageBar intent="error" className={styles.formField}>
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            )}
            <Field label="Proclamateur" className={styles.formField}>
              <Combobox
                freeform
                placeholder="Rechercher par nom..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (!e.target.value) setSelectedPublisherId('');
                }}
                onOptionSelect={(_, data) => {
                  setInputValue(data.optionText || '');
                  setSelectedPublisherId(data.optionValue || '');
                }}>
                {displayedPublishers.map((p) => (
                  <Option key={p.id} value={p.id} text={getPublisherName(p)}>
                    {getPublisherName(p)}
                  </Option>
                ))}
              </Combobox>
            </Field>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              onClick={handleAdd}
              disabled={!selectedPublisherId || loading}>
              {loading ? <Spinner size="tiny" /> : 'Ajouter'}
            </Button>
            <DialogTrigger disableButtonEnhancement>
              <Button onClick={handleClose}>Annuler</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

// ── CongregationsPage ──────────────────────────────────────────────────────────

export function CongregationsPage() {
  const styles = useStyles();
  const { congregations } = useSelector(
    (state: GlobalState) => ({
      congregations: state.congregations.congregations,
    }),
    shallowEqual,
  );

  const [selectedCongregation, setSelectedCongregation] =
    useState<Congregation | null>(null);
  const [transferMember, setTransferMember] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showAddPublisherDialog, setShowAddPublisherDialog] = useState(false);
  const [allAdminUsers, setAllAdminUsers] = useState<User[]>([]);
  const [allAdminPublishers, setAllAdminPublishers] = useState<Publisher[]>([]);

  const loadAdminData = useCallback(async () => {
    const [loadedUsers, loadedPublishers] = await Promise.all([
      Users.fetchAll(),
      Publishers.fetchAll(),
    ]);
    setAllAdminUsers(loadedUsers);
    setAllAdminPublishers(loadedPublishers);
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const membersOfSelected = selectedCongregation
    ? allAdminUsers.filter(
        (u) => u.congregationId === selectedCongregation.congregationNumber,
      )
    : [];

  const publishersOfSelected = selectedCongregation
    ? allAdminPublishers.filter(
        (p) => p.congregationId === selectedCongregation.congregationNumber,
      )
    : [];

  /**
   * Transfers a user (and their linked publisher if any) to a new congregation
   * using a Firestore Transaction for atomicity.
   */
  const handleTransfer = async (
    memberId: string,
    linkedPublisherId: string | undefined,
    targetCongregationId: number,
  ) => {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(collection(db, 'Users'), memberId);
      transaction.update(userRef, { congregationId: targetCongregationId });

      if (linkedPublisherId) {
        const publisherRef = doc(
          collection(db, 'Publishers'),
          linkedPublisherId,
        );
        transaction.update(publisherRef, {
          congregationId: targetCongregationId,
        });
      }
    });

    // Refresh Redux store and local admin data
    await Users.all();
    await loadAdminData();
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

      <div className={styles.layout}>
        {/* Left: congregation list */}
        <div className={styles.leftPanel}>
          <Body1>Congrégations ({congregations.length})</Body1>
          <List className={styles.list}>
            {congregations.map((cong) => (
              <ListItem
                key={cong.id}
                className={`${styles.listItem} ${selectedCongregation?.id === cong.id ? styles.selectedItem : ''}`}
                onClick={() => setSelectedCongregation(cong)}>
                <div>
                  <Body1>{cong.name}</Body1>
                  <Badge appearance="outline" color="informative">
                    #{cong.congregationNumber}
                  </Badge>
                </div>
              </ListItem>
            ))}
            {congregations.length === 0 && (
              <Body1>Aucune congrégation enregistrée.</Body1>
            )}
          </List>
        </div>

        {/* Right: detail of selected congregation */}
        {selectedCongregation && (
          <div className={styles.rightPanel}>
            {/* Header */}
            <div className={styles.detailHeader}>
              <div>
                <Subtitle2>{selectedCongregation.name}</Subtitle2>
              </div>
              <div>
                <Caption1>
                  {membersOfSelected.length} utilisateur(s) ·{' '}
                  {publishersOfSelected.length} proclamateur(s)
                </Caption1>
              </div>
            </div>

            <Divider />

            {/* Users section */}
            <div className={styles.sectionHeader}>
              <Body1>
                <strong>Utilisateurs ({membersOfSelected.length})</strong>
              </Body1>
              <Button
                size="small"
                appearance="outline"
                icon={<PersonAdd24Regular />}
                onClick={() => setShowAddUserDialog(true)}>
                Ajouter
              </Button>
            </div>
            <List className={styles.membersList}>
              {membersOfSelected.map((member) => (
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
              ))}
              {membersOfSelected.length === 0 && (
                <div style={{ padding: '8px 0' }}>
                  <Body1>Aucun utilisateur dans cette congrégation.</Body1>
                </div>
              )}
            </List>

            {/* Publishers section */}
            <div className={styles.sectionHeader} style={{ marginTop: '20px' }}>
              <Body1>
                <strong>Proclamateurs ({publishersOfSelected.length})</strong>
              </Body1>
              <Button
                size="small"
                appearance="outline"
                icon={<PeopleAdd24Regular />}
                onClick={() => setShowAddPublisherDialog(true)}>
                Ajouter
              </Button>
            </div>
            <List className={styles.membersList}>
              {publishersOfSelected.map((publisher) => (
                <ListItem key={publisher.id} className={styles.memberItem}>
                  <Persona name={getPublisherName(publisher)} />
                </ListItem>
              ))}
              {publishersOfSelected.length === 0 && (
                <div style={{ padding: '8px 0' }}>
                  <Body1>Aucun proclamateur dans cette congrégation.</Body1>
                </div>
              )}
            </List>
          </div>
        )}
      </div>

      {/* Transfer user dialog */}
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

      {/* Add user to congregation dialog */}
      {showAddUserDialog && selectedCongregation && (
        <AddUserDialog
          show={showAddUserDialog}
          congregation={selectedCongregation}
          allUsers={allAdminUsers}
          onClose={() => setShowAddUserDialog(false)}
          onAdded={loadAdminData}
        />
      )}

      {/* Add publisher to congregation dialog */}
      {showAddPublisherDialog && selectedCongregation && (
        <AddPublisherDialog
          show={showAddPublisherDialog}
          congregation={selectedCongregation}
          allPublishers={allAdminPublishers}
          onClose={() => setShowAddPublisherDialog(false)}
          onAdded={loadAdminData}
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
