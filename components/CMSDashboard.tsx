import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Settings, Home, User, GraduationCap, Briefcase, 
  FolderOpen, Heart, Mail, Save, RefreshCw,
  AlertCircle, CheckCircle, Database, Globe, Cloud, 
  Wifi, WifiOff, Clock, Activity, Signal
} from 'lucide-react';
import { 
  fetchHomeData, fetchProfileData, fetchEducationData,
  fetchExperienceData, fetchProjectsData, fetchInterestsData,
  fetchContactData, saveContent, setAccessToken, getConnectionStatus,
  getLastSyncTime, getSyncQueueLength, addConnectionListener,
  removeConnectionListener, forceReconnect
} from '../utils/api';

// Import all the enhanced editors
import { EducationEditor } from './cms/EducationEditor';
import { ExperienceEditor } from './cms/ExperienceEditor';
import { ProjectsEditor } from './cms/ProjectsEditor';
import { InterestsEditor } from './cms/InterestsEditor';
import { ContactEditor } from './cms/ContactEditor';
import { HomeEditor } from './cms/HomeEditor';

interface CMSDashboardProps {
  accessToken: string;
  onLogout: () => void;
}

export function CMSDashboard({ accessToken, onLogout }: CMSDashboardProps) {
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState('home');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking' | 'syncing'>('checking');
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [syncQueueLength, setSyncQueueLength] = useState<number>(0);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Data states for different sections
  const [homeData, setHomeData] = useState<any>({});
  const [profileData, setProfileData] = useState<any>({});
  const [educationData, setEducationData] = useState<any>([]);
  const [experienceData, setExperienceData] = useState<any>([]);
  const [projectsData, setProjectsData] = useState<any>([]);
  const [interestsData, setInterestsData] = useState<any>([]);
  const [contactData, setContactData] = useState<any>({});

  const texts = {
    zh: {
      title: '内容管理系统',
      subtitle: '管理您的个人作品集内容',
      home: '首页管理',
      about: '关于我',
      education: '教育背景',
      experience: '工作经历',
      projects: '项目案例',
      interests: '兴趣爱好',
      contact: '联系信息',
      settings: '系统设置',
      save: '保存更改',
      saved: '已保存',
      saving: '保存中...',
      load: '刷新数据',
      loading: '加载中...',
      hasChanges: '有未保存的更改',
      saveSuccess: '内容保存成功',
      saveError: '保存失败，请重试',
      loadError: '加载数据失败',
      dataLoaded: '数据加载成功',
      connected: '已连接',
      offline: '离线',
      checking: '检查中',
      syncing: '同步中',
      demoData: '演示数据',
      apiStatus: 'API状态',
      connectionStatus: '连接状态',
      lastSync: '最后同步',
      queuedItems: '待同步项目',
      forceReconnect: '强制重连',
      autoSave: '自动保存',
      realTimeMode: '实时模式',
      backendConnected: '后端服务已连接',
      backendSyncing: '正在同步数据',
      backendOffline: '后端服务离线',
      realTimeSync: '实时同步已启用',
      timeAgo: {
        justNow: '刚刚',
        secondsAgo: '秒前',
        minutesAgo: '分钟前',
        hoursAgo: '小时前'
      }
    },
    en: {
      title: 'Content Management System',
      subtitle: 'Manage your personal portfolio content',
      home: 'Home Management',
      about: 'About Me',
      education: 'Education',
      experience: 'Experience',
      projects: 'Projects',
      interests: 'Interests',
      contact: 'Contact',
      settings: 'Settings',
      save: 'Save Changes',
      saved: 'Saved',
      saving: 'Saving...',
      load: 'Refresh Data',
      loading: 'Loading...',
      hasChanges: 'Unsaved changes',
      saveSuccess: 'Content saved successfully',
      saveError: 'Save failed, please try again',
      loadError: 'Failed to load data',
      dataLoaded: 'Data loaded successfully',
      connected: 'Connected',
      offline: 'Offline',
      checking: 'Checking',
      syncing: 'Syncing',
      demoData: 'Demo Data',
      apiStatus: 'API Status',
      connectionStatus: 'Connection Status',
      lastSync: 'Last Sync',
      queuedItems: 'Queued Items',
      forceReconnect: 'Force Reconnect',
      autoSave: 'Auto Save',
      realTimeMode: 'Real-time Mode',
      backendConnected: 'Backend service connected',
      backendSyncing: 'Syncing data',
      backendOffline: 'Backend service offline',
      realTimeSync: 'Real-time sync enabled',
      timeAgo: {
        justNow: 'just now',
        secondsAgo: 'seconds ago',
        minutesAgo: 'minutes ago',
        hoursAgo: 'hours ago'
      }
    }
  };

  const t = texts[language];

  const sections = [
    { id: 'home', label: t.home, icon: Home, color: 'text-blue-600' },
    { id: 'about', label: t.about, icon: User, color: 'text-green-600' },
    { id: 'education', label: t.education, icon: GraduationCap, color: 'text-purple-600' },
    { id: 'experience', label: t.experience, icon: Briefcase, color: 'text-orange-600' },
    { id: 'projects', label: t.projects, icon: FolderOpen, color: 'text-pink-600' },
    { id: 'interests', label: t.interests, icon: Heart, color: 'text-red-600' },
    { id: 'contact', label: t.contact, icon: Mail, color: 'text-cyan-600' },
    { id: 'settings', label: t.settings, icon: Settings, color: 'text-gray-600' }
  ];

  // Connection status listener
  const handleConnectionStatusChange = useCallback((status: string) => {
    setConnectionStatus(status as any);
    setLastSyncTime(getLastSyncTime());
    setSyncQueueLength(getSyncQueueLength());
  }, []);

  // Set access token for API calls
  useEffect(() => {
    setAccessToken(accessToken);
  }, [accessToken]);

  // Setup connection monitoring
  useEffect(() => {
    addConnectionListener(handleConnectionStatusChange);
    
    // Initial status update
    setConnectionStatus(getConnectionStatus());
    setLastSyncTime(getLastSyncTime());
    setSyncQueueLength(getSyncQueueLength());

    // Regular status updates
    const statusInterval = setInterval(() => {
      setLastSyncTime(getLastSyncTime());
      setSyncQueueLength(getSyncQueueLength());
    }, 2000);

    return () => {
      removeConnectionListener(handleConnectionStatusChange);
      clearInterval(statusInterval);
    };
  }, [handleConnectionStatusChange]);

  // Load data on language change
  useEffect(() => {
    loadAllData();
  }, [language]);

  // Auto-save setup
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const autoSaveInterval = setInterval(() => {
      if (hasChanges && connectionStatus === 'online') {
        handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasChanges, connectionStatus, autoSaveEnabled]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('Loading all CMS data...');
      
      const [home, profile, education, experience, projects, interests, contact] = await Promise.all([
        fetchHomeData(language),
        fetchProfileData(language),
        fetchEducationData(language),
        fetchExperienceData(language),
        fetchProjectsData(language),
        fetchInterestsData(language),
        fetchContactData(language)
      ]);

      // Set data with fallbacks
      setHomeData(home.data || {});
      setProfileData(profile.data || {});
      setEducationData(education.data || []);
      setExperienceData(experience.data || []);
      setProjectsData(projects.data || []);
      setInterestsData(interests.data || []);
      setContactData(contact.data || {});

      console.log('All CMS data loaded successfully');
      showMessage('success', t.dataLoaded);
    } catch (error) {
      console.error('Failed to load CMS data:', error);
      showMessage('error', t.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (section: string, data: any) => {
    setSaving(true);
    try {
      console.log(`Saving ${section} data:`, data);
      
      const result = await saveContent(section, language, data);
      
      if (result.success) {
        showMessage('success', t.saveSuccess);
        setHasChanges(false);
        
        // Update local state immediately
        switch (section) {
          case 'home':
            setHomeData(data);
            break;
          case 'about':
            setProfileData(data);
            break;
          case 'education':
            setEducationData(data);
            break;
          case 'experience':
            setExperienceData(data);
            break;
          case 'projects':
            setProjectsData(data);
            break;
          case 'interests':
            setInterestsData(data);
            break;
          case 'contact':
            setContactData(data);
            break;
        }
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      showMessage('error', t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSave = async () => {
    if (!hasChanges || connectionStatus !== 'online') return;

    try {
      // Auto-save current section data
      let currentData = null;
      switch (activeSection) {
        case 'home':
          currentData = homeData;
          break;
        case 'about':
          currentData = profileData;
          break;
        case 'education':
          currentData = educationData;
          break;
        case 'experience':
          currentData = experienceData;
          break;
        case 'projects':
          currentData = projectsData;
          break;
        case 'interests':
          currentData = interestsData;
          break;
        case 'contact':
          currentData = contactData;
          break;
      }

      if (currentData) {
        const result = await saveContent(activeSection, language, currentData);
        if (result.success) {
          setHasChanges(false);
          console.log(`Auto-saved ${activeSection} data`);
        }
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);

    if (diff < 10) return t.timeAgo.justNow;
    if (diff < 60) return `${diff} ${t.timeAgo.secondsAgo}`;
    if (diff < 3600) return `${Math.floor(diff / 60)} ${t.timeAgo.minutesAgo}`;
    return `${Math.floor(diff / 3600)} ${t.timeAgo.hoursAgo}`;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'online': return 'text-green-600';
      case 'syncing': return 'text-blue-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'online': return <Wifi className="w-4 h-4" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'checking': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'online': return t.backendConnected;
      case 'syncing': return t.backendSyncing;
      case 'checking': return t.checking;
      default: return t.backendOffline;
    }
  };

  const renderHomeEditor = () => (
    <HomeEditor
      data={homeData}
      onSave={(data) => handleSaveSection('home', data)}
      language={language}
    />
  );

  const renderAboutEditor = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {language === 'zh' ? '个人简介' : 'Biography'}
          </label>
          <textarea
            value={profileData.bio || ''}
            onChange={(e) => {
              setProfileData(prev => ({ ...prev, bio: e.target.value }));
              setHasChanges(true);
            }}
            placeholder={language === 'zh' ? '输入详细的个人简介...' : 'Enter detailed biography...'}
            rows={6}
            className="w-full px-3 py-2 border border-border rounded-md bg-input-background text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {language === 'zh' ? '设计理念' : 'Philosophy'}
          </label>
          <textarea
            value={profileData.philosophy || ''}
            onChange={(e) => {
              setProfileData(prev => ({ ...prev, philosophy: e.target.value }));
              setHasChanges(true);
            }}
            placeholder={language === 'zh' ? '输入设计理念或工作哲学...' : 'Enter design philosophy or work beliefs...'}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md bg-input-background text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {language === 'zh' ? '技能列表（每行一个）' : 'Skills (one per line)'}
          </label>
          <textarea
            value={profileData.skills?.join('\n') || ''}
            onChange={(e) => {
              setProfileData(prev => ({ ...prev, skills: e.target.value.split('\n').filter(Boolean) }));
              setHasChanges(true);
            }}
            placeholder={language === 'zh' ? 'UI/UX设计\n产品策划\n项目管理' : 'UI/UX Design\nProduct Strategy\nProject Management'}
            rows={5}
            className="w-full px-3 py-2 border border-border rounded-md bg-input-background text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {language === 'zh' ? '主要成就（每行一个）' : 'Achievements (one per line)'}
          </label>
          <textarea
            value={profileData.achievements?.join('\n') || ''}
            onChange={(e) => {
              setProfileData(prev => ({ ...prev, achievements: e.target.value.split('\n').filter(Boolean) }));
              setHasChanges(true);
            }}
            placeholder={language === 'zh' ? '主导完成20+个成功项目\n获得国际设计奖项认可' : 'Led 20+ successful projects\nReceived international design awards'}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md bg-input-background text-foreground"
          />
        </div>
      </div>

      <Button
        onClick={() => handleSaveSection('about', profileData)}
        disabled={saving || !hasChanges}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        size="lg"
      >
        {saving ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            {t.saving}
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            {t.save}
          </>
        )}
      </Button>
    </div>
  );

  const renderSettingsEditor = () => (
    <div className="space-y-6">
      {/* Real-time Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            {t.realTimeMode}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`${getConnectionStatusColor()}`}>
                {getConnectionStatusIcon()}
              </div>
              <div>
                <p className="font-medium text-foreground">{t.connectionStatus}</p>
                <p className="text-sm text-muted-foreground">{getConnectionStatusText()}</p>
              </div>
            </div>
            <Badge 
              variant={connectionStatus === 'online' ? 'default' : 'secondary'} 
              className={connectionStatus === 'online' ? 'bg-green-100 text-green-800' : ''}
            >
              <Signal className="w-3 h-3 mr-1" />
              {connectionStatus === 'online' ? t.connected : 
               connectionStatus === 'syncing' ? t.syncing :
               connectionStatus === 'checking' ? t.checking : t.offline}
            </Badge>
          </div>

          {/* Sync Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{t.lastSync}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatTimeAgo(lastSyncTime)}
              </p>
            </div>

            <div className="p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{t.queuedItems}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {syncQueueLength} {language === 'zh' ? '项' : 'items'}
              </p>
            </div>
          </div>

          {/* Auto-save Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div>
              <p className="font-medium text-foreground">{t.autoSave}</p>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' 
                  ? '每30秒自动保存更改' 
                  : 'Automatically save changes every 30 seconds'
                }
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-10 h-6 rounded-full transition-colors ${
                autoSaveEnabled ? 'bg-primary' : 'bg-muted'
              }`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${
                  autoSaveEnabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={forceReconnect}
              variant="outline"
              size="sm"
              disabled={connectionStatus === 'checking'}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
              {t.forceReconnect}
            </Button>

            <Button
              onClick={loadAllData}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <Database className="w-4 h-4 mr-2" />
              {t.load}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Alert className={`border-blue-200 bg-blue-50 ${connectionStatus === 'online' ? 'border-green-200 bg-green-50' : ''}`}>
        <Activity className={`h-4 w-4 ${connectionStatus === 'online' ? 'text-green-600' : 'text-blue-600'}`} />
        <AlertDescription className={connectionStatus === 'online' ? 'text-green-800' : 'text-blue-800'}>
          {connectionStatus === 'online' 
            ? t.realTimeSync
            : (language === 'zh' 
                ? '系统正在尝试连接后端服务器，所有更改将在连接恢复后自动同步。'
                : 'System is attempting to connect to backend server. All changes will be automatically synced when connection is restored.'
              )
          }
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return renderHomeEditor();
      case 'about':
        return renderAboutEditor();
      case 'education':
        return (
          <EducationEditor
            data={educationData}
            onSave={(data) => handleSaveSection('education', data)}
            language={language}
          />
        );
      case 'experience':
        return (
          <ExperienceEditor
            data={experienceData}
            onSave={(data) => handleSaveSection('experience', data)}
            language={language}
          />
        );
      case 'projects':
        return (
          <ProjectsEditor
            data={projectsData}
            onSave={(data) => handleSaveSection('projects', data)}
            language={language}
          />
        );
      case 'interests':
        return (
          <InterestsEditor
            data={interestsData}
            onSave={(data) => handleSaveSection('interests', data)}
            language={language}
          />
        );
      case 'contact':
        return (
          <ContactEditor
            data={contactData}
            onSave={(data) => handleSaveSection('contact', data)}
            language={language}
          />
        );
      case 'settings':
        return renderSettingsEditor();
      default:
        return renderHomeEditor();
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-medium text-foreground">{t.title}</h2>
                <p className="text-xs text-muted-foreground">{t.subtitle}</p>
              </div>
            </div>

            {/* Real-time Status Indicator */}
            <Alert className={`mb-6 ${
              connectionStatus === 'online' 
                ? 'border-green-200 bg-green-50' 
                : connectionStatus === 'syncing'
                ? 'border-blue-200 bg-blue-50'
                : connectionStatus === 'checking'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-red-200 bg-red-50'
            }`}>
              <div className={getConnectionStatusColor()}>
                {getConnectionStatusIcon()}
              </div>
              <AlertDescription className={`text-xs ${
                connectionStatus === 'online' 
                  ? 'text-green-800' 
                  : connectionStatus === 'syncing'
                  ? 'text-blue-800'
                  : connectionStatus === 'checking'
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span>{getConnectionStatusText()}</span>
                  {syncQueueLength > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {syncQueueLength}
                    </Badge>
                  )}
                </div>
                {autoSaveEnabled && connectionStatus === 'online' && (
                  <div className="text-xs opacity-75 mt-1">
                    {language === 'zh' ? '自动保存已启用' : 'Auto-save enabled'}
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {/* Section Navigation */}
            <nav className="space-y-2">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${section.color}`} />
                    <span className="text-sm font-medium">{section.label}</span>
                    {section.id === activeSection && hasChanges && (
                      <div className="w-2 h-2 bg-accent rounded-full ml-auto" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-medium text-foreground">
                  {sections.find(s => s.id === activeSection)?.label}
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  {hasChanges && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {t.hasChanges}
                    </Badge>
                  )}
                  {connectionStatus === 'online' && autoSaveEnabled && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Activity className="w-3 h-3 mr-1" />
                      {t.realTimeMode}
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button
                onClick={loadAllData}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {t.loading}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t.load}
                  </>
                )}
              </Button>
            </div>

            {/* Status Message */}
            {message && (
              <Alert className={`mb-6 ${message.type === 'error' ? 'border-destructive/20 bg-destructive/5' : 'border-green-200 bg-green-50'}`}>
                {message.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={message.type === 'error' ? 'text-destructive' : 'text-green-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {/* Content Editor */}
            <Card>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">{t.loading}</p>
                  </div>
                ) : (
                  renderContent()
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}