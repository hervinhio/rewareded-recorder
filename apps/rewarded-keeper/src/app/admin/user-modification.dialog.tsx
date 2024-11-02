import './user-modification.dialog.scss';
import { Publisher, User } from '../types';
import { ModalTransition } from '@atlaskit/modal-dialog';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import Button, { ButtonGroup } from '@atlaskit/button';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState, Users } from '../data';
import { useState } from 'react';
import { getPublisherName } from '../content-panel/util';
import AtlaskitForm, { CheckboxField, Field } from '@atlaskit/form';
import { token } from '@atlaskit/tokens';
import { Checkbox } from '@atlaskit/checkbox';
import { GroupDropdownMenu } from '../comps/group-dropdown.menu';
import DropdownMenu, { DropdownItem } from '@atlaskit/dropdown-menu';

interface Props {
  user: User;
  onClose: () => void;
}

export function UserModificationDialog(props: Props) {
  const { publishers } = useSelector(
    (state: GlobalState) => ({
      groups: state.groups.groups,
      publishers: state.publishers.publishers,
    }),
    shallowEqual,
  );
  const [isLoading, setIsloading] = useState(false);
  const [user, setUser] = useState<User>({ ...props.user });
  const [isPubDropdownOpen, setIsPubDropdownOpen] = useState(false);

  return (
    <Modal onClose={props.onClose}>
      <ModalTransition>
        <ModalHeader>
          <ModalTitle>{user.displayName} | Modification</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <AtlaskitForm<User> onSubmit={(data) => false}>
            {({ formProps, submitting }) => (
              <form
                {...formProps}
                style={{
                  backgroundColor: token('elevation.surface.overlay'),
                }}>
                <CheckboxField name="admin" label="Administrateur">
                  {({ fieldProps }) => (
                    <Checkbox
                      {...fieldProps}
                      isChecked={user.admin}
                      label="Administrateur"
                      onChange={(event) =>
                        setUser({
                          ...user,
                          admin: (event as any).target.checked,
                        })
                      }
                    />
                  )}
                </CheckboxField>

                <CheckboxField name="validated" label="Validation">
                  {({ fieldProps }) => (
                    <Checkbox
                      {...fieldProps}
                      isChecked={user.validated}
                      label="Validé"
                      onChange={(event) =>
                        setUser({
                          ...user,
                          validated: (event as any).target.checked,
                        })
                      }
                    />
                  )}
                </CheckboxField>

                <Field
                  aria-required={true}
                  name="group"
                  label="Groupe"
                  defaultValue="unafiliated">
                  {({ fieldProps, error }) => (
                    <GroupDropdownMenu
                      {...fieldProps}
                      onChange={(value: string) =>
                        setUser({ ...user, groupId: value })
                      }
                    />
                  )}
                </Field>

                <Field
                  aria-required={true}
                  name="publisher"
                  label="Proclamateur"
                  defaultValue="">
                  {({ fieldProps, error }) => (
                    <DropdownMenu
                      isOpen={isPubDropdownOpen}
                      trigger={({ triggerRef, ...triggerProps }) => (
                        <div {...(fieldProps as any)}>
                          <Button
                            ref={triggerRef}
                            {...triggerProps}
                            onClick={() =>
                              setIsPubDropdownOpen(!isPubDropdownOpen)
                            }>
                            {user.publisherId
                              ? pickPublisherName(user.publisherId, publishers)
                              : 'Aucun'}
                          </Button>
                        </div>
                      )}>
                      {publishers.map((pub) => (
                        <DropdownItem
                          onClick={() => {
                            setUser({ ...user, publisherId: pub.id || '' });
                            setIsPubDropdownOpen(false);
                          }}>
                          <span style={{ color: token('color.text') }}>
                            {getPublisherName(pub)}
                          </span>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  )}
                </Field>
              </form>
            )}
          </AtlaskitForm>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              appearance={'primary'}
              onClick={async () => {
                setIsloading(true);

                await Users.update({
                  ...user,
                });

                setIsloading(false);
                props.onClose();
              }}>
              Confirmer
            </Button>
            <Button appearance="subtle" onClick={() => props.onClose()}>
              Annuler
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalTransition>
    </Modal>
  );
}

function getPublisherFullName(
  publisherId: string,
  publishers: Publisher[],
): string {
  return getPublisherName(publishers.find((p) => p.id === publisherId));
}

function pickPublisherName(
  id: string | undefined,
  publishers: Publisher[],
): string {
  if (!id) {
    return 'Aucun';
  }

  const pub = publishers.find((p) => p.id === id);
  if (pub) {
    return getPublisherName(pub);
  }

  return 'Aucun';
}
