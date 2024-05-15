import { createSlice, nanoid } from '@reduxjs/toolkit';
import { store } from './store';
import { R300, G300 } from '@atlaskit/theme/colors';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import { AutoDismissFlag } from '@atlaskit/flag';
import { token } from '@atlaskit/tokens';
import { FirebaseError } from 'firebase/app';
import SuccessIcon from '@atlaskit/icon/glyph/check-circle';

interface FlagsMap {
  [id: string]: JSX.Element;
}

export interface FlagsState {
  flags: FlagsMap;
}

export class Flags {
  static slice = createSlice({
    name: 'Flags',
    initialState: {
      flags: {},
    } as FlagsState,
    reducers: {
      added: (state, { payload }) => {
        state.flags = { ...state.flags, [payload.id]: payload.flag };
      },
      removed: (state, { payload }) => {
        delete state.flags[payload];
      },
    },
  });

  static raiseError(error: unknown, id?: string): void {
    const title = getErrorTitle(error);
    const description = getErrorMessage(error);
    const flagId = id || nanoid();

    store.dispatch(
      Flags.slice.actions.added({
        id,
        flag: (
          <AutoDismissFlag
            id={flagId}
            onDismissed={() => store.dispatch(Flags.slice.actions.removed(id))}
            icon={
              <ErrorIcon
                primaryColor={token('color.icon.success', R300)}
                label="Error"
                size="medium"
              />
            }
            key={flagId}
            title={title}
            appearance="error"
            description={description}
          />
        ),
      }),
    );
  }

  static raiseSuccess(data: {
    id: string;
    title: string;
    descripton?: string;
  }): void {
    store.dispatch(
      Flags.slice.actions.added({
        id: data.id,
        flag: (
          <AutoDismissFlag
            id={data.id || 0}
            onDismissed={() =>
              store.dispatch(Flags.slice.actions.removed(data.id))
            }
            icon={
              <SuccessIcon
                primaryColor={token('color.icon.success', G300)}
                label="Success"
                size="medium"
              />
            }
            key={data.id || 0}
            title={data.title}
            description={data.descripton}
          />
        ),
      }),
    );
  }
}

function getErrorTitle(error: unknown): string {
  const defaultTitle = 'An error has occured';

  if (error instanceof FirebaseError) {
    return `${error.name} ${error.code}`;
  }

  if (error instanceof Error) {
    return error.name || defaultTitle;
  }

  return defaultTitle;
}

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof FirebaseError) {
    return error.message || error.stack;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') return error;

  return undefined;
}
