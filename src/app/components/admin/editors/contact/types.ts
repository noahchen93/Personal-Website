export interface ContactData {
  pageSettings?: {
    title?: string;
    subtitle?: string;
    description?: string;
    navigationButtons?: Array<{
      id: string;
      text: string;
      target: string;
      style: 'primary' | 'secondary';
      external?: boolean;
    }>;
  };
  personalInfo: {
    phone?: string;
    email?: string;
    location?: string;
    website?: string;
    socialLinks?: Array<{
      platform: string;
      url: string;
      username: string;
    }>;
  };
  introduction: string;
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    message: string;
  };
  preferredContact: string[];
  responseTime: string;
}

export const defaultContactData: ContactData = {
  pageSettings: {
    title: '',
    subtitle: '',
    description: '',
    navigationButtons: []
  },
  personalInfo: {
    phone: '',
    email: '',
    location: '',
    website: '',
    socialLinks: []
  },
  introduction: '',
  availability: {
    status: 'available',
    message: ''
  },
  preferredContact: [],
  responseTime: ''
};

export const socialPlatforms = [
  { id: 'github', name: 'GitHub', icon: '🐙' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'twitter', name: 'Twitter', icon: '🐦' },
  { id: 'wechat', name: 'WeChat', icon: '💬' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' },
  { id: 'discord', name: 'Discord', icon: '🎮' }
];