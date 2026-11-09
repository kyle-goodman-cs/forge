/* Appearance is device-local and independent of learning progress and backups. */
(() => {
  'use strict';
  const key = 'forge-theme-v1';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => ['light', 'dark', 'system'].includes(value) ? value : 'system';
  let preference = 'system';
  try { preference = valid(localStorage.getItem(key)); } catch { /* Use the system setting if storage is unavailable. */ }
  const sun = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>';
  const moon = '<path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/>';
  function apply() {
    const dark = preference === 'dark' || (preference === 'system' && media.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#151D1B' : '#F5F4EE';
    for (const button of document.querySelectorAll('[data-theme-toggle]')) {
      button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
      button.title = `Switch to ${dark ? 'light' : 'dark'} theme`;
      button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${dark ? sun : moon}</svg><span>${dark ? 'Light' : 'Dark'} mode</span>`;
    }
    for (const button of document.querySelectorAll('[data-theme-choice]')) {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === preference));
    }
  }
  function setPreference(value) {
    preference = valid(value);
    try { localStorage.setItem(key, preference); } catch { /* Keep this tab's choice even if it cannot be saved. */ }
    apply();
  }
  window.ForgeAppearance = { getPreference: () => preference, setPreference };
  document.addEventListener('click', event => {
    const choice = event.target.closest('[data-theme-choice]');
    if (choice) setPreference(choice.dataset.themeChoice);
    else if (event.target.closest('[data-theme-toggle]')) setPreference(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      try { preference = valid(localStorage.getItem(key)); } catch { preference = 'system'; }
      apply();
    }
  });
  media.addEventListener('change', () => { if (preference === 'system') apply(); });
  apply();
})();
