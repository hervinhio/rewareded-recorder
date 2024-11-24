interface AndroidInterface {
    getThemeMode(): 'light' | 'dark';
}

declare global {
    interface Window { android: AndroidInterface }
}

declare var android: AndroidInterface;
window.android = window.android || null;
