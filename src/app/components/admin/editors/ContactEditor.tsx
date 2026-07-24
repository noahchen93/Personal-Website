import React, { useState, useEffect } from 'react';
import { Loader2, Contact } from 'lucide-react';
import { useContent } from '../../content/ContentContext';
import { useLanguage } from '../../language/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { toast } from 'sonner';
import EditorHeader from '../shared/EditorHeader';
import StatusMessage from '../shared/StatusMessage';
import PersonalInfoTab from './contact/PersonalInfoTab';
import IntroductionTab from './contact/IntroductionTab';
import AvailabilityTab from './contact/AvailabilityTab';
import PreferencesTab from './contact/PreferencesTab';
import PageSettingsTab from './contact/PageSettingsTab';
import { ContactData, defaultContactData } from './contact/types';

export default function ContactEditor() {
  const { getContent, createContent, updateContent, isOnline } = useContent();
  const { isZh, currentLanguage } = useLanguage();
  const [contactData, setContactData] = useState<ContactData>(defaultContactData);
  const [contentId, setContentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  useEffect(() => {
    loadContactData();
  }, [currentLanguage]);

  const loadContactData = async () => {
    setIsLoading(true);
    try {
      const content = await getContent('contact', undefined, currentLanguage);
      if (content.length > 0) {
        const contactContent = content[0];
        setContentId(contactContent.id);
        setIsPublished(contactContent.is_published);
        if (contactContent.data && typeof contactContent.data === 'object') {
          setContactData({
            ...defaultContactData,
            ...contactContent.data
          });
        }
      } else {
        setContactData(defaultContactData);
        setContentId(null);
        setIsPublished(false);
      }
    } catch (error) {
      console.error('Error loading contact data:', error);
      toast.error(isZh ? '加载数据失败' : 'Failed to load data');
      setContactData(defaultContactData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      let result;
      const title = contactData.pageSettings?.title || (isZh ? '联系页面' : 'Contact Page');
      
      if (contentId) {
        result = await updateContent(contentId, {
          type: 'contact',
          title: title, // Add required title field
          data: contactData,
          is_published: false,
          language: currentLanguage
        });
      } else {
        result = await createContent({
          type: 'contact',
          title: title, // Add required title field
          data: contactData,
          is_published: false,
          language: currentLanguage
        });
        setContentId(result.id);
      }
      setIsPublished(false);
      setHasUnsavedChanges(false);
      setLastSavedTime(new Date());
      toast.success(isZh ? '草稿已保存' : 'Draft saved');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(isZh ? '草稿保存失败' : 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let result;
      const title = contactData.pageSettings?.title || (isZh ? '联系页面' : 'Contact Page');
      
      if (contentId) {
        result = await updateContent(contentId, {
          type: 'contact',
          title: title, // Add required title field
          data: contactData,
          is_published: true,
          language: currentLanguage
        });
        setIsPublished(true);
      } else {
        result = await createContent({
          type: 'contact',
          title: title, // Add required title field
          data: contactData,
          is_published: true,
          language: currentLanguage
        });
        setContentId(result.id);
        setIsPublished(true);
      }
      setHasUnsavedChanges(false);
      setLastSavedTime(new Date());
      toast.success(isZh ? '发布成功' : 'Published successfully');
      return result;
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error(isZh ? '发布失败' : 'Failed to publish');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const updateContactData = (updates: Partial<ContactData>) => {
    setContactData(prev => ({
      ...prev,
      ...updates
    }));
    setHasUnsavedChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 cms-container">
      <EditorHeader
        title={isZh ? '联系页面编辑' : 'Contact Page Editor'}
        description={isZh ? '管理个人联系信息和联系方式偏好' : 'Manage personal contact information and contact preferences'}
        icon={<Contact className="w-5 h-5" />}
        onSave={handleSave}
        isSaving={isSaving}
        onSaveDraft={handleSaveDraft}
        isSavingDraft={isSavingDraft}
        showDraftSave={true}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSavedTime={lastSavedTime}
        isOnline={isOnline}
        saveButtonText={isZh ? '发布' : 'Publish'}
        isPublished={isPublished}
      />

      <StatusMessage />

      <Tabs defaultValue="page-settings" className="space-y-6">
        <TabsList className="cms-bg-secondary rounded-xl border border-blue-500/30">
          <TabsTrigger value="page-settings" className="text-small rounded-lg text-white font-terminal">
            {isZh ? '页面设置' : 'Page Settings'}
          </TabsTrigger>
          <TabsTrigger value="personal" className="text-small rounded-lg text-white font-terminal">
            {isZh ? '个人信息' : 'Personal Info'}
          </TabsTrigger>
          <TabsTrigger value="introduction" className="text-small rounded-lg text-white font-terminal">
            {isZh ? '介绍内容' : 'Introduction'}
          </TabsTrigger>
          <TabsTrigger value="availability" className="text-small rounded-lg text-white font-terminal">
            {isZh ? '可联系状态' : 'Availability'}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="text-small rounded-lg text-white font-terminal">
            {isZh ? '联系偏好' : 'Preferences'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="page-settings">
          <PageSettingsTab 
            contactData={contactData}
            updateContactData={updateContactData}
          />
        </TabsContent>

        <TabsContent value="personal">
          <PersonalInfoTab 
            contactData={contactData}
            updateContactData={updateContactData}
          />
        </TabsContent>

        <TabsContent value="introduction">
          <IntroductionTab 
            contactData={contactData}
            updateContactData={updateContactData}
          />
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityTab 
            contactData={contactData}
            updateContactData={updateContactData}
          />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesTab 
            contactData={contactData}
            updateContactData={updateContactData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}