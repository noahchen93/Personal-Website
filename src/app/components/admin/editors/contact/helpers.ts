import { ContactData } from './types';

export const updatePageSettings = (
  contactData: ContactData,
  updateContactData: (updates: Partial<ContactData>) => void,
  field: string,
  value: any
) => {
  updateContactData({
    pageSettings: {
      ...contactData.pageSettings,
      [field]: value
    }
  });
};

export const generateButtonId = () => `btn_${Date.now()}`;

export const addNavigationButton = (
  contactData: ContactData,
  updateContactData: (updates: Partial<ContactData>) => void,
  newButton: any
) => {
  if (!newButton.text || !newButton.target) return false;

  const buttonId = newButton.id || generateButtonId();
  const updatedButtons = [
    ...(contactData.pageSettings?.navigationButtons || []),
    { ...newButton, id: buttonId }
  ];
  
  updatePageSettings(contactData, updateContactData, 'navigationButtons', updatedButtons);
  return true;
};

export const removeNavigationButton = (
  contactData: ContactData,
  updateContactData: (updates: Partial<ContactData>) => void,
  index: number
) => {
  const updatedButtons = contactData.pageSettings?.navigationButtons?.filter((_, i) => i !== index) || [];
  updatePageSettings(contactData, updateContactData, 'navigationButtons', updatedButtons);
};