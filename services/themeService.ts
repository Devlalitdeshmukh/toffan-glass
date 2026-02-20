export type ThemeMode = 'light' | 'dark' | 'orange';

const THEME_STORAGE_KEY = 'toffan_theme_mode';

class ThemeService {
  static getTheme(): ThemeMode {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'orange' || saved === 'light') return saved;
    return 'light';
  }

  static applyTheme(theme: ThemeMode) {
    if (typeof document === 'undefined') return;
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-orange');
    document.body.classList.add(`theme-${theme}`);
  }

  static setTheme(theme: ThemeMode) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    this.applyTheme(theme);
    window.dispatchEvent(new CustomEvent('theme:changed', { detail: theme }));
  }
}

export default ThemeService;
