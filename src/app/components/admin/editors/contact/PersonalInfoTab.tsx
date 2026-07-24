import React, { useState } from 'react';
import { Mail, Phone, MapPin, Globe, MessageCircle, Check, X } from 'lucide-react';
import { useLanguage } from '../../../language/LanguageContext';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { ContactData, socialPlatforms } from './types';

interface PersonalInfoTabProps {
  contactData: ContactData;
  updateContactData: (updates: Partial<ContactData>) => void;
}

export default function PersonalInfoTab({ contactData, updateContactData }: PersonalInfoTabProps) {
  const { isZh } = useLanguage();
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '', username: '' });
  const [showSocialForm, setShowSocialForm] = useState(false);

  const updatePersonalInfo = (field: string, value: string) => {
    updateContactData({
      personalInfo: {
        ...contactData.personalInfo,
        [field]: value
      }
    });
  };

  const addSocialLink = () => {
    if (newSocialLink.platform && newSocialLink.url) {
      const updatedSocialLinks = [
        ...(contactData.personalInfo.socialLinks || []),
        { ...newSocialLink }
      ];
      updateContactData({
        personalInfo: {
          ...contactData.personalInfo,
          socialLinks: updatedSocialLinks
        }
      });
      setNewSocialLink({ platform: '', url: '', username: '' });
      setShowSocialForm(false);
    }
  };

  const removeSocialLink = (index: number) => {
    const updatedSocialLinks = contactData.personalInfo.socialLinks?.filter((_, i) => i !== index) || [];
    updateContactData({
      personalInfo: {
        ...contactData.personalInfo,
        socialLinks: updatedSocialLinks
      }
    });
  };

  return (
    <Card className="cms-bg-card border border-blue-500/30 rounded-xl">
      <CardHeader>
        <CardTitle className="text-white font-terminal">
          {isZh ? '个人联系信息' : 'Personal Contact Information'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-white font-terminal">
              <Mail className="w-4 h-4 inline mr-2" />
              {isZh ? '电子邮件' : 'Email'}
            </Label>
            <Input
              type="email"
              value={contactData.personalInfo.email || ''}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              placeholder={isZh ? '输入邮箱地址' : 'Enter email address'}
              className="cms-input rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white font-terminal">
              <Phone className="w-4 h-4 inline mr-2" />
              {isZh ? '电话号码' : 'Phone Number'}
            </Label>
            <Input
              type="tel"
              value={contactData.personalInfo.phone || ''}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              placeholder={isZh ? '输入电话号码' : 'Enter phone number'}
              className="cms-input rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white font-terminal">
              <MapPin className="w-4 h-4 inline mr-2" />
              {isZh ? '所在地点' : 'Location'}
            </Label>
            <Input
              value={contactData.personalInfo.location || ''}
              onChange={(e) => updatePersonalInfo('location', e.target.value)}
              placeholder={isZh ? '输入所在城市或地区' : 'Enter city or region'}
              className="cms-input rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white font-terminal">
              <Globe className="w-4 h-4 inline mr-2" />
              {isZh ? '个人网站' : 'Website'}
            </Label>
            <Input
              type="url"
              value={contactData.personalInfo.website || ''}
              onChange={(e) => updatePersonalInfo('website', e.target.value)}
              placeholder={isZh ? '输入个人网站URL' : 'Enter personal website URL'}
              className="cms-input rounded-xl"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white font-terminal">
              <MessageCircle className="w-4 h-4 inline mr-2" />
              {isZh ? '社交媒体链接' : 'Social Media Links'}
            </Label>
            <Button
              onClick={() => setShowSocialForm(true)}
              size="sm"
              className="cms-secondary-button"
            >
              {isZh ? '添加链接' : 'Add Link'}
            </Button>
          </div>

          {contactData.personalInfo.socialLinks && contactData.personalInfo.socialLinks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactData.personalInfo.socialLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-blue-500/30 rounded-lg bg-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {socialPlatforms.find(p => p.id === link.platform)?.icon || '🌐'}
                    </span>
                    <div>
                      <div className="text-white font-medium font-terminal">
                        {socialPlatforms.find(p => p.id === link.platform)?.name || link.platform}
                      </div>
                      {link.username && (
                        <div className="text-sm text-slate-400 font-terminal">
                          @{link.username}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => removeSocialLink(index)}
                    size="sm"
                    className="cms-danger-button"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showSocialForm && (
            <Card className="bg-slate-700/50 border border-blue-500/30 rounded-xl">
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-white font-terminal">{isZh ? '平台' : 'Platform'}</Label>
                    <select
                      value={newSocialLink.platform}
                      onChange={(e) => setNewSocialLink(prev => ({ ...prev, platform: e.target.value }))}
                      className="cms-select w-full rounded-xl"
                    >
                      <option value="">{isZh ? '选择平台' : 'Select Platform'}</option>
                      {socialPlatforms.map(platform => (
                        <option key={platform.id} value={platform.id}>
                          {platform.icon} {platform.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm text-white font-terminal">{isZh ? '用户名' : 'Username'}</Label>
                    <Input
                      value={newSocialLink.username}
                      onChange={(e) => setNewSocialLink(prev => ({ ...prev, username: e.target.value }))}
                      placeholder={isZh ? '输入用户名' : 'Enter username'}
                      className="cms-input rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-white font-terminal">{isZh ? '链接URL' : 'Link URL'}</Label>
                    <Input
                      type="url"
                      value={newSocialLink.url}
                      onChange={(e) => setNewSocialLink(prev => ({ ...prev, url: e.target.value }))}
                      placeholder={isZh ? '输入完整URL' : 'Enter full URL'}
                      className="cms-input rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => setShowSocialForm(false)}
                    className="cms-secondary-button"
                    size="sm"
                  >
                    {isZh ? '取消' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={addSocialLink}
                    size="sm"
                    disabled={!newSocialLink.platform || !newSocialLink.url}
                    className="cms-primary-button"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {isZh ? '添加' : 'Add'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}