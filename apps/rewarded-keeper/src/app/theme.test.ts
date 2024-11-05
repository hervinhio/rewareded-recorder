import { GlobalState } from './data';
import { determineThemeMode } from './theme';

describe('determineThemeMode', () => {
  const systemPreference = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  beforeEach(() => {
    localStorage.setItem('themeMode', '');
  });
  it('should return system preference when theme config is "system"', () => {
    const mockState: GlobalState = {
      // Populate only the config property as it's the only one used by the determineThemeMode function
      config: {
        theme: 'system',
      },
    } as GlobalState;

    expect(determineThemeMode(mockState)).toBe(systemPreference);
  });

  it('should return theme config when it is not "system"', () => {
    const mockState: GlobalState = {
      // Populate only the config property as it's the only one used by the determineThemeMode function
      config: {
        theme: 'light',
      },
    } as GlobalState;

    expect(determineThemeMode(mockState)).toBe('light');
  });

  it('should return theme config when it is not "system"', () => {
    const mockState: GlobalState = {
      // Populate only the config property as it's the only one used by the determineThemeMode function
      config: {
        theme: 'dark',
      },
    } as GlobalState;

    expect(determineThemeMode(mockState)).toBe('dark');
  });
});
