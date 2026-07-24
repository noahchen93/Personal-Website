import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, Server, Cloud, Settings, RefreshCw, Wifi, WifiOff, ExternalLink, Wrench, Activity, Monitor, HardDrive, Zap, Brain, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { useAuth } from '../auth/AuthContext';
import { useContent } from '../content/ContentContext';
import { useLanguage } from '../language/LanguageContext';
import SupabaseConnectionFixer from './SupabaseConnectionFixer';
import AIConfigManager from './AIConfigManager';

interface SystemStatus {
  component: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  message: string;
  details?: string;
  lastCheck?: Date;
}

interface SystemMetric {
  label: string;
  value: string;
  progress?: number;
  status: 'good' | 'warning' | 'error';
}

export default function SystemDashboard() {
  const { isOnline: authOnline, forceOnline, retry: authRetry } = useAuth();
  const { isOnline: contentOnline, retry: contentRetry } = useContent();
  const { isZh } = useLanguage();
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showConnectionFixer, setShowConnectionFixer] = useState(false);

  const isSystemOnline = authOnline && contentOnline;

  useEffect(() => {
    checkSystemStatus();
    updateSystemMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      checkSystemStatus();
      updateSystemMetrics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [authOnline, contentOnline]);

  const checkSystemStatus = async () => {
    const now = new Date();
    const status: SystemStatus[] = [];

    // Auth Service Status
    status.push({
      component: isZh ? '认证服务' : 'Auth Service',
      status: authOnline ? 'healthy' : 'error',
      message: authOnline 
        ? (isZh ? '正常运行' : 'Online') 
        : (isZh ? '连接失败' : 'Connection Failed'),
      details: authOnline 
        ? undefined 
        : (isZh ? '无法连接到Supabase认证服务' : 'Cannot connect to Supabase Auth'),
      lastCheck: now
    });

    // Content Service Status  
    status.push({
      component: isZh ? '内容服务' : 'Content Service',
      status: contentOnline ? 'healthy' : 'error',
      message: contentOnline 
        ? (isZh ? '正常运行' : 'Online') 
        : (isZh ? '连接失败' : 'Connection Failed'),
      details: contentOnline 
        ? undefined 
        : (isZh ? '无法连接到Supabase数据库' : 'Cannot connect to Supabase Database'),
      lastCheck: now
    });

    // Network Connectivity
    const networkStatus = navigator.onLine;
    status.push({
      component: isZh ? '网络连接' : 'Network Connection',
      status: networkStatus ? 'healthy' : 'error',
      message: networkStatus 
        ? (isZh ? '已连接' : 'Connected') 
        : (isZh ? '离线' : 'Offline'),
      details: networkStatus 
        ? undefined 
        : (isZh ? '设备当前处于离线状态' : 'Device is currently offline'),
      lastCheck: now
    });

    // Storage Service Check
    try {
      const storageHealthy = isSystemOnline;
      status.push({
        component: isZh ? '存储服务' : 'Storage Service',
        status: storageHealthy ? 'healthy' : 'error',
        message: storageHealthy 
          ? (isZh ? '可访问' : 'Accessible') 
          : (isZh ? '不可访问' : 'Inaccessible'),
        details: storageHealthy 
          ? undefined 
          : (isZh ? 'Supabase存储服务连接失败' : 'Supabase Storage service connection failed'),
        lastCheck: now
      });
    } catch (error) {
      status.push({
        component: isZh ? '存储服务' : 'Storage Service',
        status: 'error',
        message: isZh ? '检查失败' : 'Check Failed',
        details: error instanceof Error ? error.message : String(error),
        lastCheck: now
      });
    }

    // LocalStorage Check
    try {
      localStorage.setItem('health-check', 'test');
      localStorage.removeItem('health-check');
      status.push({
        component: isZh ? '本地存储' : 'Local Storage',
        status: 'healthy',
        message: isZh ? '可用' : 'Available',
        lastCheck: now
      });
    } catch (error) {
      status.push({
        component: isZh ? '本地存储' : 'Local Storage',
        status: 'error',
        message: isZh ? '不可用' : 'Unavailable',
        details: isZh ? '浏览器本地存储被禁用或已满' : 'Browser local storage disabled or full',
        lastCheck: now
      });
    }

    setSystemStatus(status);
    setLastRefresh(now);
  };

  const updateSystemMetrics = () => {
    const metrics: SystemMetric[] = [
      {
        label: isZh ? '系统连接率' : 'System Connectivity',
        value: isSystemOnline ? '100%' : '0%',
        progress: isSystemOnline ? 100 : 0,
        status: isSystemOnline ? 'good' : 'error'
      },
      {
        label: isZh ? '服务可用性' : 'Service Availability',
        value: `${systemStatus.filter(s => s.status === 'healthy').length}/${systemStatus.length}`,
        progress: (systemStatus.filter(s => s.status === 'healthy').length / Math.max(systemStatus.length, 1)) * 100,
        status: systemStatus.every(s => s.status === 'healthy') ? 'good' : 
                systemStatus.some(s => s.status === 'error') ? 'error' : 'warning'
      },
      {
        label: isZh ? '网络状态' : 'Network Status',
        value: navigator.onLine ? (isZh ? '正常' : 'Online') : (isZh ? '离线' : 'Offline'),
        progress: navigator.onLine ? 100 : 0,
        status: navigator.onLine ? 'good' : 'error'
      },
      {
        label: isZh ? '本地存储' : 'Local Storage',
        value: isZh ? '可用' : 'Available',
        progress: 85,
        status: 'good'
      }
    ];

    setSystemMetrics(metrics);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkSystemStatus();
    updateSystemMetrics();
    
    // Also trigger retries for the contexts
    authRetry();
    contentRetry();
    
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleForceOnline = () => {
    forceOnline();
    setTimeout(() => {
      checkSystemStatus();
      updateSystemMetrics();
    }, 1000);
  };

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getMetricColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const overallHealth = systemStatus.every(s => s.status === 'healthy') ? 'healthy' :
                       systemStatus.some(s => s.status === 'error') ? 'error' : 'warning';

  return (
    <div className="space-y-6 admin-editor cms-container">
      {/* Overall System Status Card */}
      <Card className="cms-bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${
                isSystemOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isSystemOnline ? (
                  <Activity className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="terminal-text-large cms-text-primary terminal-glow">
                  {isZh ? '系统总体状态' : 'Overall System Status'}
                </h3>
                <p className={`terminal-text-small ${
                  overallHealth === 'healthy' ? 'text-green-400' :
                  overallHealth === 'error' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {overallHealth === 'healthy' && (isZh ? '所有服务正常运行' : 'All services running normally')}
                  {overallHealth === 'error' && (isZh ? '检测到服务异常' : 'Service issues detected')}
                  {overallHealth === 'warning' && (isZh ? '部分服务存在警告' : 'Some services have warnings')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={overallHealth === 'healthy' ? 'default' : 'destructive'}
                className="terminal-text-small px-3 py-1 cms-bg-secondary cms-text-primary border-blue-400/30"
              >
                {overallHealth === 'healthy' && (isZh ? '正常' : 'Healthy')}
                {overallHealth === 'error' && (isZh ? '异常' : 'Error')}
                {overallHealth === 'warning' && (isZh ? '警告' : 'Warning')}
              </Badge>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="h-8 px-3 cms-secondary-button"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isZh ? '刷新' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="cms-bg-secondary backdrop-blur-sm rounded-lg p-4 border border-blue-400/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="terminal-text-small cms-text-secondary">{metric.label}</span>
                  <span className={`terminal-text-small font-semibold ${getMetricColor(metric.status)}`}>
                    {metric.value}
                  </span>
                </div>
                {metric.progress !== undefined && (
                  <Progress 
                    value={metric.progress} 
                    className="h-1.5"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Issues Alert */}
      {!isSystemOnline && (
        <Alert className="cms-bg-card border-red-400/50">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <AlertDescription className="flex items-center justify-between">
            <span className="cms-text-primary">
              {isZh 
                ? 'HTTP 404错误：无法连接到Supabase服务。点击右侧按钮打开连接修复工具。' 
                : 'HTTP 404 Error: Cannot connect to Supabase services. Click the button to open connection fixer.'}
            </span>
            <Button
              onClick={() => setShowConnectionFixer(true)}
              variant="outline"
              size="sm"
              className="ml-4 h-8 px-3 cms-danger-button"
            >
              <Wrench className="w-3 h-3 mr-1" />
              {isZh ? '修复' : 'Fix'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Fixer Tool */}
      {showConnectionFixer && (
        <Card className="cms-bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 terminal-text-large cms-text-primary">
                <Wrench className="w-5 h-5 terminal-text-cyan" />
                <span>{isZh ? '连接修复工具' : 'Connection Fix Tool'}</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConnectionFixer(false)}
                className="h-8 w-8 p-0 cms-secondary-button"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SupabaseConnectionFixer />
          </CardContent>
        </Card>
      )}

      {/* Service Status Details */}
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-4 cms-bg-secondary backdrop-blur-sm border border-blue-400/30">
          <TabsTrigger value="services" className="data-[state=active]:cms-primary-button cms-text-primary rounded-lg">
            <Database className="w-4 h-4 mr-2" />
            {isZh ? '服务状态' : 'Services'}
          </TabsTrigger>
          <TabsTrigger value="network" className="data-[state=active]:cms-primary-button cms-text-primary rounded-lg">
            <Monitor className="w-4 h-4 mr-2" />
            {isZh ? '网络信息' : 'Network'}
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:cms-primary-button cms-text-primary rounded-lg">
            <Brain className="w-4 h-4 mr-2" />
            {isZh ? 'AI配置' : 'AI Config'}
          </TabsTrigger>
          <TabsTrigger value="actions" className="data-[state=active]:cms-primary-button cms-text-primary rounded-lg">
            <Settings className="w-4 h-4 mr-2" />
            {isZh ? '操作面板' : 'Actions'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {systemStatus.map((service, index) => (
              <Card key={index} className="cms-bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="cms-text-primary font-medium">{service.component}</span>
                          <Badge 
                            variant={service.status === 'healthy' ? 'default' : 'destructive'}
                            className="terminal-text-small cms-bg-secondary cms-text-primary border-blue-400/30"
                          >
                            {service.message}
                          </Badge>
                        </div>
                        {service.details && (
                          <p className="terminal-text-small cms-text-secondary mb-2 cms-bg-secondary rounded-lg px-2 py-1">
                            {service.details}
                          </p>
                        )}
                        {service.lastCheck && (
                          <p className="terminal-text-small cms-text-secondary">
                            {isZh ? '最后检查: ' : 'Last check: '}
                            {service.lastCheck.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4 mt-6">
          <Card className="cms-bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 cms-text-primary">
                <Wifi className="w-5 h-5" />
                <span>{isZh ? '网络状态信息' : 'Network Status Information'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="cms-bg-secondary backdrop-blur-sm rounded-lg p-4 border border-blue-400/30">
                  <h4 className="cms-text-primary font-medium mb-3">{isZh ? '连接状态' : 'Connection Status'}</h4>
                  <div className="space-y-3 terminal-text-small">
                    <div className="flex justify-between items-center">
                      <span className="cms-text-secondary">{isZh ? 'Auth服务:' : 'Auth Service:'}</span>
                      <Badge variant={authOnline ? 'default' : 'destructive'} className="terminal-text-small cms-bg-secondary cms-text-primary">
                        {authOnline ? (isZh ? '在线' : 'Online') : (isZh ? '离线' : 'Offline')}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="cms-text-secondary">{isZh ? '内容服务:' : 'Content Service:'}</span>
                      <Badge variant={contentOnline ? 'default' : 'destructive'} className="terminal-text-small cms-bg-secondary cms-text-primary">
                        {contentOnline ? (isZh ? '在线' : 'Online') : (isZh ? '离线' : 'Offline')}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="cms-text-secondary">{isZh ? '浏览器网络:' : 'Browser Network:'}</span>
                      <Badge variant={navigator.onLine ? 'default' : 'destructive'} className="terminal-text-small cms-bg-secondary cms-text-primary">
                        {navigator.onLine ? (isZh ? '已连接' : 'Connected') : (isZh ? '断开' : 'Disconnected')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="cms-bg-secondary backdrop-blur-sm rounded-lg p-4 border border-blue-400/30">
                  <h4 className="cms-text-primary font-medium mb-3">{isZh ? '系统信息' : 'System Information'}</h4>
                  <div className="space-y-2 terminal-text-small cms-text-secondary">
                    <div>{isZh ? '最后刷新: ' : 'Last refresh: '}{lastRefresh.toLocaleString()}</div>
                    <div>{isZh ? '浏览器: ' : 'Browser: '}{navigator.userAgent.split(' ')[0]}</div>
                    <div>{isZh ? '平台: ' : 'Platform: '}{navigator.platform}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4 mt-6">
          <AIConfigManager />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="cms-bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 cms-text-primary">
                  <Zap className="w-5 h-5" />
                  <span>{isZh ? '连接操作' : 'Connection Actions'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="w-full cms-secondary-button"
                  variant="outline"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isZh ? '刷新所有状态' : 'Refresh All Status'}
                </Button>
                
                {!isSystemOnline && (
                  <Button 
                    onClick={handleForceOnline}
                    className="w-full cms-secondary-button"
                    variant="outline"
                  >
                    <Wifi className="w-4 h-4 mr-2" />
                    {isZh ? '强制设为在线' : 'Force Online Status'}
                  </Button>
                )}

                <Button 
                  onClick={() => setShowConnectionFixer(true)}
                  className="w-full cms-primary-button"
                  variant={!isSystemOnline ? 'default' : 'outline'}
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  {isZh ? '打开连接修复工具' : 'Open Connection Fixer'}
                </Button>
              </CardContent>
            </Card>

            <Card className="cms-bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 cms-text-primary">
                  <HardDrive className="w-5 h-5" />
                  <span>{isZh ? '诊断信息' : 'Diagnostic Information'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className={`${
                  isSystemOnline 
                    ? 'cms-bg-card border-green-400/50' 
                    : 'cms-bg-card border-amber-400/50'
                } backdrop-blur-sm`}>
                  {isSystemOnline ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <AlertDescription className={`terminal-text-small ${
                    isSystemOnline ? 'text-green-300' : 'text-amber-300'
                  }`}>
                    {isSystemOnline ? (
                      isZh ? '系统运行正常，所有服务已连接。' : 'System is running normally, all services connected.'
                    ) : (
                      isZh ? 'HTTP 404错误通常表示Supabase项目配置有问题。请使用连接修复工具进行诊断。' : 'HTTP 404 errors usually indicate Supabase project configuration issues. Please use the connection fixer tool for diagnosis.'
                    )}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}