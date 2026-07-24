import React from 'react';
import { useLanguage } from '../../../language/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { ContactData } from './types';

interface AvailabilityTabProps {
  contactData: ContactData;
  updateContactData: (updates: Partial<ContactData>) => void;
}

export default function AvailabilityTab({ contactData, updateContactData }: AvailabilityTabProps) {
  const { isZh } = useLanguage();

  const statusOptions = [
    { value: 'available', label: isZh ? '可联系' : 'Available', icon: '✅' },
    { value: 'busy', label: isZh ? '忙碌中' : 'Busy', icon: '⏰' },
    { value: 'unavailable', label: isZh ? '暂时不可联系' : 'Unavailable', icon: '🚫' }
  ];

  return (
    <Card className="cms-bg-card border border-blue-500/30 rounded-xl">
      <CardHeader>
        <CardTitle className="text-white font-terminal">
          {isZh ? '可联系状态' : 'Contact Availability'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-white font-terminal">{isZh ? '当前状态' : 'Current Status'}</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusOptions.map(status => (
              <button
                key={status.value}
                onClick={() => updateContactData({
                  availability: {
                    ...contactData.availability,
                    status: status.value as 'available' | 'busy' | 'unavailable'
                  }
                })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  contactData.availability.status === status.value
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-blue-500/30 hover:border-blue-500/50 bg-slate-700/30'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-2xl">{status.icon}</div>
                  <div className="text-white font-medium font-terminal">{status.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white font-terminal">{isZh ? '状态说明' : 'Status Message'}</Label>
          <Textarea
            value={contactData.availability.message}
            onChange={(e) => updateContactData({
              availability: {
                ...contactData.availability,
                message: e.target.value
              }
            })}
            placeholder={isZh ? '输入状态说明信息...' : 'Enter status message...'}
            rows={3}
            className="cms-textarea rounded-xl"
          />
        </div>
      </CardContent>
    </Card>
  );
}