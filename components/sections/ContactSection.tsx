import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Mail, Phone, MapPin, Send, ExternalLink, 
  Github, Linkedin, MessageCircle, Copy,
  CheckCircle, AlertCircle, Globe, Calendar
} from 'lucide-react';
import { fetchContactData } from '../../utils/api';
import { toast } from 'sonner@2.0.3';

interface ContactData {
  email?: string;
  phone?: string;
  location?: string;
  message?: string;
  social?: {
    linkedin?: string;
    github?: string;
    behance?: string;
    dribbble?: string;
    website?: string;
  };
  availability?: string;
  timezone?: string;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactSection() {
  const { language } = useLanguage();
  const [contactData, setContactData] = useState<ContactData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const texts = {
    zh: {
      title: '联系我',
      subtitle: '随时欢迎您的联系，让我们一起创造美好的项目',
      getInTouch: '取得联系',
      contactInfo: '联系信息',
      email: '邮箱',
      phone: '电话',
      location: '位置',
      availability: '工作状态',
      timezone: '时区',
      socialLinks: '社交媒体',
      sendMessage: '发送消息',
      yourName: '您的姓名',
      yourEmail: '您的邮箱',
      subject: '主题',
      message: '消息内容',
      messagePlaceholder: '请输入您想说的话...',
      send: '发送',
      sending: '发送中...',
      messageSent: '消息发送成功！',
      messageFailed: '发送失败，请重试',
      copyEmail: '复制邮箱',
      copyPhone: '复制电话',
      copied: '已复制',
      loading: '正在加载联系信息...',
      error: '加载失败，请稍后重试',
      required: '必填项',
      invalidEmail: '请输入有效的邮箱地址',
      defaultMessage: '欢迎通过邮箱或社交媒体与我联系，我会尽快回复您的消息。',
      formTitle: '发送消息',
      quickContact: '快速联系',
      responseTime: '通常在24小时内回复'
    },
    en: {
      title: 'Contact Me',
      subtitle: 'Feel free to reach out anytime, let\'s create amazing projects together',
      getInTouch: 'Get In Touch',
      contactInfo: 'Contact Information',
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      availability: 'Availability',
      timezone: 'Timezone',
      socialLinks: 'Social Media',
      sendMessage: 'Send Message',
      yourName: 'Your Name',
      yourEmail: 'Your Email',
      subject: 'Subject',
      message: 'Message',
      messagePlaceholder: 'Please enter your message...',
      send: 'Send',
      sending: 'Sending...',
      messageSent: 'Message sent successfully!',
      messageFailed: 'Failed to send, please try again',
      copyEmail: 'Copy Email',
      copyPhone: 'Copy Phone',
      copied: 'Copied',
      loading: 'Loading contact information...',
      error: 'Failed to load, please try again later',
      required: 'Required',
      invalidEmail: 'Please enter a valid email address',
      defaultMessage: 'Feel free to contact me via email or social media, I will get back to you as soon as possible.',
      formTitle: 'Send Message',
      quickContact: 'Quick Contact',
      responseTime: 'Usually responds within 24 hours'
    }
  };

  const t = texts[language];

  useEffect(() => {
    loadContactData();
  }, [language]);

  const loadContactData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await fetchContactData(language);
      
      if (fetchError) {
        console.error('Failed to load contact data:', fetchError);
        setContactData({
          email: 'your@email.com',
          phone: '+86 123 4567 8900',
          location: '中国，上海',
          message: t.defaultMessage,
          social: {
            linkedin: '',
            github: '',
            behance: '',
            dribbble: ''
          },
          availability: '可接受新项目',
          timezone: 'GMT+8'
        });
      } else {
        setContactData(data || {
          email: 'your@email.com',
          phone: '+86 123 4567 8900',
          location: '中国，上海',
          message: t.defaultMessage,
          social: {
            linkedin: '',
            github: '',
            behance: '',
            dribbble: ''
          },
          availability: '可接受新项目',
          timezone: 'GMT+8'
        });
      }
    } catch (err) {
      console.error('Failed to load contact data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error(`${t.yourName} ${t.required}`);
      return false;
    }
    if (!formData.email.trim()) {
      toast.error(`${t.yourEmail} ${t.required}`);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error(t.invalidEmail);
      return false;
    }
    if (!formData.message.trim()) {
      toast.error(`${t.message} ${t.required}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(t.messageSent);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(t.messageFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(t.copied);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Copy failed');
    }
  };

  const handleSocialLink = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const socialPlatforms = [
    { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'bg-blue-600' },
    { key: 'github', icon: Github, label: 'GitHub', color: 'bg-gray-800' },
    { key: 'behance', icon: ExternalLink, label: 'Behance', color: 'bg-blue-500' },
    { key: 'dribbble', icon: ExternalLink, label: 'Dribbble', color: 'bg-pink-500' },
    { key: 'website', icon: Globe, label: 'Website', color: 'bg-green-600' }
  ];

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-24" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-full mb-6">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="mb-4">{t.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t.error}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 to-red-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-full mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="mb-4">{t.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-6">
            {/* Welcome Message */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t.getInTouch}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {contactData.message || t.defaultMessage}
                </p>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t.responseTime}
                </div>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Phone className="w-5 h-5 mr-2" />
                  {t.contactInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email */}
                {contactData.email && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">{t.email}</p>
                        <p className="text-sm text-blue-700">{contactData.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(contactData.email!, 'email')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {copied === 'email' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                )}

                {/* Phone */}
                {contactData.phone && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">{t.phone}</p>
                        <p className="text-sm text-green-700">{contactData.phone}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(contactData.phone!, 'phone')}
                      className="text-green-600 hover:text-green-700"
                    >
                      {copied === 'phone' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                )}

                {/* Location */}
                {contactData.location && (
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-900">{t.location}</p>
                      <p className="text-sm text-purple-700">{contactData.location}</p>
                    </div>
                  </div>
                )}

                {/* Availability & Timezone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contactData.availability && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="font-medium text-yellow-900 text-sm">{t.availability}</p>
                      <p className="text-sm text-yellow-700">{contactData.availability}</p>
                    </div>
                  )}
                  {contactData.timezone && (
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="font-medium text-indigo-900 text-sm">{t.timezone}</p>
                      <p className="text-sm text-indigo-700">{contactData.timezone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            {contactData.social && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    {t.socialLinks}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {socialPlatforms.map((platform) => {
                      const IconComponent = platform.icon;
                      const url = contactData.social?.[platform.key as keyof typeof contactData.social];
                      
                      if (!url) return null;
                      
                      return (
                        <Button
                          key={platform.key}
                          variant="outline"
                          className="h-auto p-3 flex flex-col items-center space-y-2 hover:shadow-md transition-all"
                          onClick={() => handleSocialLink(url)}
                        >
                          <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-medium">{platform.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Send className="w-5 h-5 mr-2" />
                {t.formTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      {t.yourName} *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t.yourName}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      {t.yourEmail} *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t.yourEmail}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    {t.subject}
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder={t.subject}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    {t.message} *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={t.messagePlaceholder}
                    rows={6}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {t.sending}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t.send}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}