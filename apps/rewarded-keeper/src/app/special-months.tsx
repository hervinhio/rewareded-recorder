import { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  Button,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  MessageBar,
  Subtitle1,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
  makeStyles,
} from '@fluentui/react-components';
import { Delete24Regular, Edit24Regular, Add24Regular } from '@fluentui/react-icons';
import { GlobalState, SpecialMonths, Dialogs } from './data';
import { SpecialMonth } from './types';
import { RoleGuard } from './components/permission-guard';
import { Role } from './types';
import { Users } from './data';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  table: {
    width: '100%',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
});

interface DeleteDialogProps {
  open: boolean;
  specialMonth: SpecialMonth | null;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteDialog({ open, specialMonth, onClose, onConfirm }: DeleteDialogProps) {
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  if (!specialMonth) return null;

  return (
    <Dialog open={open}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            Êtes-vous sûr de vouloir supprimer le mois spécial "{monthNames[specialMonth.month]} {specialMonth.year}"?
            <br />
            Raison: {specialMonth.reason}
          </DialogContent>
        </DialogBody>
        <DialogActions>
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="secondary" onClick={onClose}>
              Annuler
            </Button>
          </DialogTrigger>
          <Button appearance="primary" onClick={onConfirm}>
            Supprimer
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}

export function SpecialMonthsPage() {
  const styles = useStyles();
  const dispatch = useDispatch();
  const { specialMonths, loading } = useSelector(
    (state: GlobalState) => state.specialMonths,
    shallowEqual
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    specialMonth: SpecialMonth | null;
  }>({ open: false, specialMonth: null });
  const [error, setError] = useState<string>('');

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  useEffect(() => {
    SpecialMonths.getAll().catch((err) => {
      console.error('Error loading special months:', err);
      setError('Erreur lors du chargement des mois spéciaux');
    });
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.specialMonth?.id) return;

    try {
      await SpecialMonths.deleteById(deleteDialog.specialMonth.id);
      setDeleteDialog({ open: false, specialMonth: null });
    } catch (err) {
      console.error('Error deleting special month:', err);
      setError('Erreur lors de la suppression du mois spécial');
    }
  };

  const handleEdit = (specialMonth: SpecialMonth) => {
    dispatch(Dialogs.slice.actions.setEditingSpecialMonth(specialMonth));
  };

  const sortedSpecialMonths = [...specialMonths].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const columns: TableColumnDefinition<SpecialMonth>[] = [
    createTableColumn<SpecialMonth>({
      columnId: 'year',
      compare: (a, b) => a.year - b.year,
      renderHeaderCell: () => 'Année',
      renderCell: (item) => (
        <TableCellLayout>{item.year}</TableCellLayout>
      ),
    }),
    createTableColumn<SpecialMonth>({
      columnId: 'month',
      compare: (a, b) => a.month - b.month,
      renderHeaderCell: () => 'Mois',
      renderCell: (item) => (
        <TableCellLayout>{monthNames[item.month]}</TableCellLayout>
      ),
    }),
    createTableColumn<SpecialMonth>({
      columnId: 'reason',
      compare: (a, b) => a.reason.localeCompare(b.reason),
      renderHeaderCell: () => 'Raison',
      renderCell: (item) => (
        <TableCellLayout>{item.reason}</TableCellLayout>
      ),
    }),
    createTableColumn<SpecialMonth>({
      columnId: 'actions',
      renderHeaderCell: () => 'Actions',
      renderCell: (item) => (
        <TableCellLayout>
          <div className={styles.actionButtons}>
            <Button
              size="small"
              appearance="subtle"
              icon={<Edit24Regular />}
              onClick={() => handleEdit(item)}
              title="Modifier"
            />
            <Button
              size="small"
              appearance="subtle"
              icon={<Delete24Regular />}
              onClick={() => setDeleteDialog({ open: true, specialMonth: item })}
              title="Supprimer"
            />
          </div>
        </TableCellLayout>
      ),
    }),
  ];

  return (
    <RoleGuard user={Users.getCurrent()} allowedRoles={[Role.ADMIN, Role.ROOT]}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Subtitle1>Mois spéciaux</Subtitle1>
          <Button
            appearance="primary"
            icon={<Add24Regular />}
            onClick={() => dispatch(Dialogs.slice.actions.toggleCreateSpecialMonthModal())}
          >
            Ajouter un mois spécial
          </Button>
        </div>

        {error && (
          <MessageBar intent="error" onDismiss={() => setError('')}>
            {error}
          </MessageBar>
        )}

        {loading ? (
          <MessageBar>Chargement...</MessageBar>
        ) : (
          <DataGrid
            items={sortedSpecialMonths}
            columns={columns}
            sortable
            className={styles.table}
          >
            <DataGridHeader>
              <DataGridRow>
                {({ renderHeaderCell }) => (
                  <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                )}
              </DataGridRow>
            </DataGridHeader>
            <DataGridBody<SpecialMonth>>
              {({ item, rowId }) => (
                <DataGridRow<SpecialMonth> key={rowId}>
                  {({ renderCell }) => (
                    <DataGridCell>{renderCell(item)}</DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>
        )}

        <DeleteDialog
          open={deleteDialog.open}
          specialMonth={deleteDialog.specialMonth}
          onClose={() => setDeleteDialog({ open: false, specialMonth: null })}
          onConfirm={handleDelete}
        />
      </div>
    </RoleGuard>
  );
}