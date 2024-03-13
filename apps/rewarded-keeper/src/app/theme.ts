import { GlobalState } from "./data";

export const determineThemeMode = (state: GlobalState) => {
    const systemPreference =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    return state.config.theme === 'system'
      ? systemPreference
      : state.config.theme;
}