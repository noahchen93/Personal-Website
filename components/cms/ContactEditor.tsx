import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { MarkdownEditor } from '../MarkdownEditor';
import { 
  Save, Mail, Phone, MapPin, Globe, Clock, CheckCircle
} from 'lucide-react';

interface ContactData {
  email: string;
  phone: string;
  location: string;
  social: {
    linkedin: string;
    github: string;
    behance: string;
    dribbble: string;
    twitter?: string;
    instagram?: string;
  };
  message: string;
  availability?: string;
  timezone?: string;
}

interface ContactEditorProps {
  data: ContactData;
  onSave: (data: ContactData) => void;
  language: string;
}

export function ContactEditor({ data, onSave, language }: ContactEditorProps) {
  const [contactData, setContactData] = useState<ContactData>(data || {
    email: '',
    phone: '',
    location: '',
    social: {
      linkedin: '',
      github: '',
      behance: '',
      dribbble: '',
      twitter: '',
      instagram: ''
    },
    message: '',
    availability: '',
    timezone: ''
  });

  const texts = {
    zh: {
      title: '联系信息管理',
      basicInfo: '基本信息',
      email: '邮箱地址',
      phone: '电话号码',
      location: '所在地点',
      timezone: '时区',
      availability: '工作状态',
      socialLinks: '社交媒体链接',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      behance: 'Behance',
      dribbble: 'Dribbble',
      twitter: 'Twitter / X',
      instagram: 'Instagram',
      message: '联系说明',
      messagePlaceholder: '欢迎通过邮箱或社交媒体与我联系...',
      save: '保存更改',
      saved: '联系信息已保存',
      availabilityPlaceholder: '例如：接受新项目合作',
      timezonePlaceholder: '例如：GMT+8 (北京时间)'
    },
    en: {
      title: 'Contact Information Management',
      basicInfo: 'Basic Information',
      email: 'Email Address',
      phone: 'Phone Number',
      location: 'Location',
      timezone: 'Timezone',
      availability: 'Availability',
      socialLinks: 'Social Media Links',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      behance: 'Behance',
      dribbble: 'Dribbble',
      twitter: 'Twitter / X',
      instagram: 'Instagram',
      message: 'Contact Message',
      messagePlaceholder: 'Feel free to contact me via email or social media...',
      save: 'Save Changes',
      saved: 'Contact information saved',
      availabilityPlaceholder: 'e.g., Available for new projects',
      timezonePlaceholder: 'e.g., GMT+8 (Beijing Time)'
    }
  };

  const t = texts[language];

  useEffect(() => {
    if (data) {
      setContactData({
        ...data,
        social: {
          linkedin: '',
          github: '',
          behance: '',
          dribbble: '',
          twitter: '',
          instagram: '',
          ...data.social
        }
      });
    }
  }, [data]);

  const handleSave = () => {
    onSave(contactData);
  };

  const handleInputChange = (field: string, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setContactData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Mail className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">{t.title}</h2>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            {t.basicInfo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={contactData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t.email}
                className="bg-input-background"
              />
            </div>

            <div>
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                type="tel"
                value={contactData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={t.phone}
                className="bg-input-background"
              />
            </div>

            <div>
              <Label htmlFor="location">{t.location}</Label>
              <Input
                id="location"
                value={contactData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={t.location}
                className="bg-input-background"
              />
            </div>

            <div>
              <Label htmlFor="timezone">{t.timezone}</Label>
              <Input
                id="timezone"
                value={contactData.timezone || ''}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                placeholder={t.timezonePlaceholder}
                className="bg-input-background"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="availability">{t.availability}</Label>
            <Input
              id="availability"
              value={contactData.availability || ''}
              onChange={(e) => handleInputChange('availability', e.target.value)}
              placeholder={t.availabilityPlaceholder}
              className="bg-input-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            {t.socialLinks}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin">{t.linkedin}</Label>
              <Input
                id="linkedin"
                value={contactData.social.linkedin}
                onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="bg-input-background"
              />
            </div>

            <div>
              <Label htmlFor="github">{t.github}</Label>
              <Input
                id="github"
                value={contactData.social.github}
                onChange={(e) => handleSocialChange('github', e.target.value)}
                placeholder="https://github.com/username"
                className="bg-input-background"
              />
            </div>

            <div>
              <Label htmlFor="behance">{t.behance}</Label>
              <Input
                id="behance"
                value={contactData.social.behance}
                onChange={(e) => handleSocialChange('behance', e.target.value)}
                placeholder="https://behance.net/username"
                className="bg-input-background"
              />
            </div>

            <div>
              <Label htmlFor="dribbble">{t.dribbble}</Label>
              <Input
                id="dribbble"
                value={contactData.social.dribbble}
                onChange={(e) => handleSocialChange('dribbble', e.target.value)}
                placeholder="https://dribbble.com/username"
                className="bg-input-background"
              />
            </div>

            <div>
              <Label htmlFor="twitter">{t.twitter}</Label>
              <Input
                id="twitter"
                value={contactData.social.twitter || ''}
                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                placeholder="https://x.com/username"
                className="bg-input-background"
              />
            </div>

            <div>
              <Label htmlFor="instagram">{t.instagram}</Label>
              <Input
                id="instagram"
                value={contactData.social.instagram || ''}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                placeholder="https://instagram.com/username"
                className="bg-input-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {t.message}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="message">{t.message}</Label>
            <MarkdownEditor
              value={contactData.message}
              onChange={(value) => handleInputChange('message', value)}
              placeholder={t.messagePlaceholder}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={handleSave} 
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        size="lg"
      >
        <Save className="w-4 h-4 mr-2" />
        {t.save}
      </Button>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'zh' ? '预览' : 'Preview'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {contactData.email && (
              <div className="flex items-center text-muted-foreground">
                <Mail className="w-4 h-4 mr-2" />
                {contactData.email}
              </div>
            )}
            
            {contactData.phone && (
              <div className="flex items-center text-muted-foreground">
                <Phone className="w-4 h-4 mr-2" />
                {contactData.phone}
              </div>
            )}
            
            {contactData.location && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                {contactData.location}
              </div>
            )}
            
            {contactData.timezone && (
              <div className="flex items-center text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                {contactData.timezone}
              </div>
            )}
          </div>

          {contactData.availability && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {contactData.availability}
              </AlertDescription>
            </Alert>
          )}

          {contactData.message && (
            <div className="border-l-4 border-primary/20 pl-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {contactData.message}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {Object.entries(contactData.social).map(([platform, url]) => (
              url && (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                >
                  <Globe className="w-3 h-3 mr-1" />
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              )
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}