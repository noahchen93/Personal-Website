import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { contactAPI } from '../../utils/api';
import { getDefaultContactData } from '../../utils/cmsDefaults';
import { 
  Loader2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  MessageSquare,
  Linkedin,
  Send,
  AlertCircle,
  ExternalLink,
  Users
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ContactData {
  contactInfo: {
    email: string;
    phone: string;
    location: string;
    website: string;
    wechat: string;
    linkedin: string;
  };
  socialMedia: Array<{
    platform: string;
    username: string;
    url: string;
  }>;
  collaborationAreas: string[];
}

export function ContactSection() {
  const { language } = useLanguage();
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    loadContactData();
  }, [language]);

  const loadContactData = async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      const data = await contactAPI.get(language, false);
      
      if (!data || !data.contactInfo) {
        console.log('No CMS contact data available, using default data');
        setContactData(getDefaultContactData(language));
        setUsingFallback(true);
      } else {
        setContactData({ ...getDefaultContactData(language), ...data });
      }
    } catch (error) {
      console.log('CMS not available, using default contact data:', error);
      setContactData(getDefaultContactData(language));
      setUsingFallback(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    try {
      // 这里可以添加发送邮件的逻辑
      // 例如通过API发送邮件或使用第三方服务
      
      // 模拟发送延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(language === 'zh' ? '消息发送成功！我会尽快回复您。' : 'Message sent successfully! I will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(language === 'zh' ? '消息发送失败，请重试。' : 'Failed to send message, please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'wechat':
      case '微信':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const texts = {
    zh: {
      loading: '加载中...',
      contactTitle: '联系我',
      getInTouch: '取得联系',
      contactInfo: '联系信息',
      collaborationAreas: '合作领域',
      socialMedia: '社交媒体',
      sendMessage: '发送消息',
      name: '姓名',
      email: '邮箱',
      subject: '主题',
      message: '消息',
      sendButton: '发送消息',
      sending: '发送中...',
      demo: '演示模式',
      contactDescription: '很高兴与您取得联系。请随时通过以下方式与我沟通，或者填写联系表单，我会尽快回复您。'
    },
    en: {
      loading: 'Loading...',
      contactTitle: 'Contact Me',
      getInTouch: 'Get In Touch',
      contactInfo: 'Contact Information',
      collaborationAreas: 'Collaboration Areas',
      socialMedia: 'Social Media',
      sendMessage: 'Send Message',
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
      sendButton: 'Send Message',
      sending: 'Sending...',
      demo: 'Demo Mode',
      contactDescription: 'I would love to hear from you. Feel free to reach out through any of the following channels, or fill out the contact form and I\'ll get back to you as soon as possible.'
    }
  };

  const t = texts[language];

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">{t.loading}</span>
        </div>
      </section>
    );
  }

  if (!contactData) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">加载联系信息时出现问题</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Demo Mode Indicator */}
        {usingFallback && (
          <div className="mb-6 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{t.demo}</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t.contactTitle}</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.contactDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>{t.contactInfo}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactData.contactInfo.email && (
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">邮箱</p>
                        <a 
                          href={`mailto:${contactData.contactInfo.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {contactData.contactInfo.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {contactData.contactInfo.phone && (
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">电话</p>
                        <a 
                          href={`tel:${contactData.contactInfo.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {contactData.contactInfo.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {contactData.contactInfo.location && (
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-gray-900">位置</p>
                        <p className="text-gray-700">{contactData.contactInfo.location}</p>
                      </div>
                    </div>
                  )}

                  {contactData.contactInfo.website && (
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <Globe className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">网站</p>
                        <a 
                          href={contactData.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          {contactData.contactInfo.website}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            {contactData.socialMedia && contactData.socialMedia.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>{t.socialMedia}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {contactData.socialMedia.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {getSocialIcon(social.platform)}
                        <div>
                          <p className="font-medium text-gray-900">{social.platform}</p>
                          <p className="text-sm text-gray-600">@{social.username}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Collaboration Areas */}
            {contactData.collaborationAreas && contactData.collaborationAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>{t.collaborationAreas}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {contactData.collaborationAreas.map((area, index) => (
                      <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>{t.sendMessage}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        {t.name} *
                      </label>
                      <Input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder={language === 'zh' ? '请输入您的姓名' : 'Enter your name'}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        {t.email} *
                      </label>
                      <Input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        placeholder={language === 'zh' ? '请输入您的邮箱' : 'Enter your email'}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      {t.subject} *
                    </label>
                    <Input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      required
                      placeholder={language === 'zh' ? '请输入消息主题' : 'Enter message subject'}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      {t.message} *
                    </label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      required
                      rows={5}
                      placeholder={language === 'zh' ? '请输入您的消息内容...' : 'Enter your message...'}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t.sending}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t.sendButton}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}