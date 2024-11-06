import { Stats } from '../../data';
import { FormEvent, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
} from '@fluentui/react-components';

interface Props {
  stats: Stats;
  show: boolean;
  onClose: (stats?: Stats) => void;
}

export function StatsModificationDialog({ stats, onClose, show }: Props) {
  return (
    <Dialog open={show}>
      <DialogSurface>
        <form
          onSubmit={(event: FormEvent) => {
            event.stopPropagation();
            event.preventDefault();
            
            const form = event.target as any;
            onClose({
              ...stats,
              underRestrictions: Number(form.underRestrictions?.value) || 0,
              baptized: Number(form.baptized?.value) || 0,
              blamed: Number(form.blamished?.value) || 0,
              families: Number(form.families?.value) || 0,
            });
          }}>
          <DialogBody>
            <DialogTitle>Mise à jour des stats</DialogTitle>
            <DialogContent>
              <Field required label="Blâmés">
                <Input
                  defaultValue={`${stats.blamed || 0}`}
                  type="number"
                  name="blamished"
                  required
                />
              </Field>
              <Field required label="Sous restrictions">
                <Input
                  defaultValue={`${stats.underRestrictions || 0}`}
                  type="number"
                  name="underRestrictions"
                  required
                />
              </Field>
              <Field required label="Baptisés">
                <Input
                  defaultValue={`${stats.baptized || 0}`}
                  type="number"
                  name="baptized"
                  required
                />
              </Field>
              <Field required label="Familles">
                <Input
                  defaultValue={`${stats.families || 0}`}
                  type="number"
                  name="families"
                  required
                />
              </Field>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={() => onClose()}>
                  Annuler
                </Button>
              </DialogTrigger>
              <Button type="submit" appearance="primary">
                Modifier
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
