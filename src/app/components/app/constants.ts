export type Section = 'home' | 'projects' | 'ai-explore' | 'blog' | 'interests' | 'contact';

export const VALID_SECTIONS: readonly Section[] = ['home', 'projects', 'ai-explore', 'blog', 'interests', 'contact'] as const;

export const LOADING_DELAY = 800;
export const TIME_UPDATE_INTERVAL = 1000;

export const NAVIGATION_EVENT_NAME = 'navigate';