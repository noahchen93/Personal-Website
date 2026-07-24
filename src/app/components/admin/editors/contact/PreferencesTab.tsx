import React from 'react';
import { Phone, Mail, MessageCircle, Globe } from 'lucide-react';
import { useLanguage } from '../../../language/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { ContactData } from './types';

interface PreferencesTabProps {
  contactData: ContactData;
  updateContactData: (updates: Partial<ContactData>) => void;
}

export default function PreferencesTab({ contactData, updateContactData }: PreferencesTabProps) {
  const { isZh } = useLanguage();

  const contactMethods = [
    { id: 'email', label: isZh ? '电子邮件' : 'Email', icon: Mail },
    { id: 'phone', label: isZh ? '电话' : 'Phone', icon: Phone },
    { id: 'social', label: isZh ? '社交媒体' : 'Social Media', icon: MessageCircle },
    { id: 'website', label: isZh ? '个人网站' : 'Website', icon: Globe }
  ];

  return (
    <Card className="cms-bg-card border border-blue-500/30 rounded-xl">
      <CardHeader>
        <CardTitle className="text-white font-terminal">
          {isZh ? '联系偏好设置' : 'Contact Preferences'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-white font-terminal">{isZh ? '首选联系方式' : 'Preferred Contact Methods'}</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contactMethods.map(method => {
              const Icon = method.icon;
              const isSelected = contactData.preferredContact.includes(method.id);
              return (
                <button
                  key={method.id}
                  onClick={() => {
                    const updated = isSelected
                      ? contactData.preferredContact.filter(id => id !== method.id)
                      : [...contactData.preferredContact, method.id];
                    updateContactData({ preferredContact: updated });
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-blue-500/30 hover:border-blue-500/50 bg-slate-700/30'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className={`text-sm font-terminal ${isSelected ? 'text-blue-200' : 'text-slate-300'}`}>
                      {method.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white font-terminal">{isZh ? '预期回复时间' : 'Expected Response Time'}</Label>
          <Input
            value={contactData.responseTime}
            onChange={(e) => updateContactData({ responseTime: e.target.value })}
            placeholder={isZh ? '例如：24小时内回复' : 'e.g., Reply within 24 hours'}
            className="cms-input rounded-xl"
          />
        </div>
      </CardContent>
    </Card>
  );
}