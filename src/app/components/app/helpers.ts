import { Section, VALID_SECTIONS } from './constants';

export const isValidSection = (section: string): section is Section => {
  return VALID_SECTIONS.includes(section as Section);
};

export const getInitialSection = (): Section => {
  const hash = window.location.hash.slice(1);
  return isValidSection(hash) ? hash : 'home';
};

export const updateBrowserHistory = (section: Section): void => {
  const url = `#${section}`;
  window.history.pushState({ section }, '', url);
};

export const setLanguageAttribute = (language: string): void => {
  document.documentElement.lang = language;
};