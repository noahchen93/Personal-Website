import { ContentItem } from '../../content/ContentContext';

export interface NavigationButton {
  id: string;
  text: string;
  target: string;
  style: 'primary' | 'secondary';
  external?: boolean;
}

export interface PageSettings {
  title?: string;
  subtitle?: string;
  navigationButtons?: NavigationButton[];
}

export interface InterestsPageProps {
  interests: ContentItem[];
  pageSettings: PageSettings;
  isLoading: boolean;
  error: string | null;
  readingMode: ContentItem | null;
}