import { GlobalState } from "./data";

export namespace Web {
    export function determineThemeMode(state?: GlobalState) {
      const systemPreference =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      
      const themeFromLocalStorage = localStorage.getItem('themeMode');
      if (themeFromLocalStorage) {
        return themeFromLocalStorage === 'system'
          ? systemPreference
          : themeFromLocalStorage as 'light' | 'dark';      
      }

      if (state) {
        const mode = state.config.theme === 'system'
          ? systemPreference
          : state.config.theme;  
        
        localStorage.setItem('themeMode', mode);
        return mode;
      }

      return 'light';
    }
}
