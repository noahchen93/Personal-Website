import React from 'react';
import { useLanguage } from '../../../language/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import MarkdownEditor from '../../MarkdownEditor';
import { ContactData } from './types';

interface IntroductionTabProps {
  contactData: ContactData;
  updateContactData: (updates: Partial<ContactData>) => void;
}

export default function IntroductionTab({ contactData, updateContactData }: IntroductionTabProps) {
  const { isZh } = useLanguage();

  return (
    <Card className="cms-bg-card border border-blue-500/30 rounded-xl">
      <CardHeader>
        <CardTitle className="text-white font-terminal">
          {isZh ? '联系页面介绍' : 'Contact Page Introduction'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MarkdownEditor
          value={contactData.introduction}
          onChange={(value) => updateContactData({ introduction: value })}
          placeholder={isZh ? '输入联系页面的介绍内容...' : 'Enter contact page introduction...'}
          height="400px"
        />
      </CardContent>
    </Card>
  );
}