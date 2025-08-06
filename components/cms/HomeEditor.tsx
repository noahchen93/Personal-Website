import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { MarkdownEditor } from '../MarkdownEditor';
import { getTexts, validateRequired, arrayToString, parseStringToArray } from './utils';
import { Home, Globe, Save, User, Mail, MapPin, Phone } from 'lucide-react';

interface HomeData {
  name: string;
  title: string;
  description: string;
  skills: string[];
  highlights: string[];
  socialLinks: {
    email: string;
    github: string;
    linkedin: string;
    website?: string;
  };
  contactInfo: {
    location: string;
    email: string;
    phone: string;
  };
}

interface HomeEditorProps {
  data: HomeData;
  onSave: (data: HomeData) => void;
  language: string;
}

export function HomeEditor({ data, onSave, language }: HomeEditorProps) {
  const [formData, setFormData] = useState<HomeData>({
    name: '',
    title: '',
    description: '',
    skills: [],
    highlights: [],
    socialLinks: {
      email: '',
      github: '',
      linkedin: '',
      website: ''
    },
    contactInfo: {
      location: '',
      email: '',
      phone: ''
    },
    ...data
  });

  const t = getTexts(language);

  useEffect(() => {
    setFormData(prev => ({ ...prev, ...data }));
  }, [data]);

  const handleInputChange = (field: string, value: any, nested?: string) => {
    setFormData(prev => {
      if (nested) {
        return {
          ...prev,
          [nested]: {
            ...prev[nested as keyof HomeData],
            [field]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSave = () => {
    const requiredFields = ['name', 'title', 'description'];
    if (!validateRequired(formData, requiredFields, language)) {
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Home className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">{t.homeManagement}</h2>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            {t.personalInfo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t.name} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t.name}
                className="bg-input-background"
              />
            </div>

            <div>
              <Label htmlFor="title">{t.title} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={language === 'zh' ? '职位标题' : 'Job Title'}
                className="bg-input-background"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">{t.description} *</Label>
            <MarkdownEditor
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
              placeholder={language === 'zh' ? '输入个人简介...' : 'Enter personal description...'}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="skills">{t.skills} ({language === 'zh' ? '每行一个' : 'one per line'})</Label>
              <Textarea
                id="skills"
                value={arrayToString(formData.skills)}
                onChange={(e) => handleInputChange('skills', parseStringToArray(e.target.value))}
                placeholder={language === 'zh' ? 'UI/UX设计\n产品策划\n项目管理' : 'UI/UX Design\nProduct Strategy\nProject Management'}
                rows={4}
                className="bg-input-background"
              />
            </div>

            <div>
              <Label htmlFor="highlights">{t.highlights} ({language === 'zh' ? '每行一个' : 'one per line'})</Label>
              <Textarea
                id="highlights"
                value={arrayToString(formData.highlights)}
                onChange={(e) => handleInputChange('highlights', parseStringToArray(e.target.value))}
                placeholder={language === 'zh' ? '创新问题解决\n用户为中心的设计' : 'Creative Problem Solving\nUser-Centered Design'}
                rows={4}
                className="bg-input-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            {language === 'zh' ? '联系信息' : 'Contact Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact-email">{t.email}</Label>
            <Input
              id="contact-email"
              type="email"
              value={formData.contactInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value, 'contactInfo')}
              placeholder={t.email}
              className="bg-input-background"
            />
          </div>

          <div>
            <Label htmlFor="contact-phone">{t.phone}</Label>
            <Input
              id="contact-phone"
              value={formData.contactInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value, 'contactInfo')}
              placeholder={t.phone}
              className="bg-input-background"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="contact-location">{t.location}</Label>
            <Input
              id="contact-location"
              value={formData.contactInfo.location}
              onChange={(e) => handleInputChange('location', e.target.value, 'contactInfo')}
              placeholder={t.location}
              className="bg-input-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            {t.socialLinks}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="social-github">GitHub</Label>
            <Input
              id="social-github"
              value={formData.socialLinks.github}
              onChange={(e) => handleInputChange('github', e.target.value, 'socialLinks')}
              placeholder="https://github.com/username"
              className="bg-input-background"
            />
          </div>

          <div>
            <Label htmlFor="social-linkedin">LinkedIn</Label>
            <Input
              id="social-linkedin"
              value={formData.socialLinks.linkedin}
              onChange={(e) => handleInputChange('linkedin', e.target.value, 'socialLinks')}
              placeholder="https://linkedin.com/in/username"
              className="bg-input-background"
            />
          </div>

          <div>
            <Label htmlFor="social-email">{language === 'zh' ? '公开邮箱' : 'Public Email'}</Label>
            <Input
              id="social-email"
              type="email"
              value={formData.socialLinks.email}
              onChange={(e) => handleInputChange('email', e.target.value, 'socialLinks')}
              placeholder="public@email.com"
              className="bg-input-background"
            />
          </div>

          <div>
            <Label htmlFor="social-website">{t.website}</Label>
            <Input
              id="social-website"
              value={formData.socialLinks.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value, 'socialLinks')}
              placeholder="https://yourwebsite.com"
              className="bg-input-background"
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
    </div>
  );
}