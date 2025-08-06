import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { Loader2, LogIn, UserPlus, Settings, AlertCircle, TestTube, Users, CheckCircle, Info, Server, ExternalLink } from 'lucide-react';
import { authAPI } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (accessToken: string) => void;
}

export function AuthDialog({ isOpen, onClose, onAuthSuccess }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'cms' | 'test' | 'backend'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testUsers, setTestUsers] = useState<any[]>([]);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  // 登录表单状态
  const [signinData, setSigninData] = useState({
    email: '',
    password: '',
  });

  // 注册表单状态
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Check backend status
  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c529659a/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (response.ok) {
        setBackendStatus('available');
        return true;
      } else {
        setBackendStatus('unavailable');
        return false;
      }
    } catch (error) {
      console.log('Backend health check failed:', error);
      setBackendStatus('unavailable');
      return false;
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      checkBackendStatus();
    }
  }, [isOpen]);

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    const isBackendAvailable = await checkBackendStatus();
    if (!isBackendAvailable) {
      setError('CMS后端服务不可用，请检查Supabase Functions是否正在运行');
      setActiveTab('backend');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.signin(signinData.email, signinData.password);
      
      if (response.session?.access_token) {
        toast.success('登录成功');
        onAuthSuccess(response.session.access_token);
        onClose();
        
        // 重置表单
        setSigninData({ email: '', password: '' });
      } else {
        throw new Error('无法获取访问令牌');
      }
    } catch (error: any) {
      console.error('Signin error:', error);
      let errorMessage = '登录失败，请检查邮箱和密码';
      
      if (error.message.includes('Backend not available')) {
        errorMessage = 'CMS后端服务不可用，请先启动Supabase Functions';
        setActiveTab('backend');
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = '邮箱或密码错误，请检查后重试';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = '邮箱未验证，请检查邮箱并点击验证链接';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = '请求过于频繁，请稍后重试';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    const isBackendAvailable = await checkBackendStatus();
    if (!isBackendAvailable) {
      setError('CMS后端服务不可用，请检查Supabase Functions是否正在运行');
      setActiveTab('backend');
      setLoading(false);
      return;
    }

    // 验证密码确认
    if (signupData.password !== signupData.confirmPassword) {
      setError('密码确认不匹配');
      setLoading(false);
      return;
    }

    // 验证密码强度
    if (signupData.password.length < 6) {
      setError('密码长度至少为6位');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.signup(signupData.email, signupData.password, signupData.name);
      
      if (response.user) {
        toast.success('注册成功！账户已自动激活，请直接登录');
        setSuccess('注册成功！请切换到登录页面使用您的账户信息登录。');
        setActiveTab('signin');
        setSigninData({ email: signupData.email, password: '' });
        
        // 重置表单
        setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // 尝试解析错误响应
      let errorData = null;
      try {
        if (error.message.startsWith('API Error')) {
          const errorText = error.message.split('): ')[1];
          errorData = JSON.parse(errorText);
        }
      } catch (parseError) {
        // 解析失败，使用原始错误消息
      }
      
      if (error.message.includes('Backend not available')) {
        setError('CMS后端服务不可用，请先启动Supabase Functions');
        setActiveTab('backend');
        return;
      }
      
      // 处理用户已存在的情况
      if (errorData?.user_exists || errorData?.code === 'email_exists' || 
          error.message.includes('already registered') || 
          error.message.includes('User already registered')) {
        
        // 自动切换到登录页面并填充邮箱
        setSigninData({ email: signupData.email, password: '' });
        setActiveTab('signin');
        setSuccess('该邮箱已注册，已为您切换到登录页面，请输入密码登录。');
        toast.info('该邮箱已注册，请直接登录');
        return;
      }
      
      // 处理其他错误
      let errorMessage = '注册失败，请重试';
      
      if (error.message.includes('Invalid email')) {
        errorMessage = '邮箱格式不正确，请检查后重试';
      } else if (error.message.includes('Password should be')) {
        errorMessage = '密码不符合要求，请使用至少6位字符';
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTestUsers = async () => {
    setLoading(true);
    clearMessages();

    const isBackendAvailable = await checkBackendStatus();
    if (!isBackendAvailable) {
      setError('CMS后端服务不可用，请检查Supabase Functions是否正在运行');
      setActiveTab('backend');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c529659a/auth/test`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`无法获取用户列表: ${errorData}`);
      }
      
      const data = await response.json();
      setTestUsers(data.users || []);
      setSuccess(`找到 ${data.userCount} 个用户`);
      toast.success(`找到 ${data.userCount} 个用户`);
    } catch (error: any) {
      console.error('Test users error:', error);
      if (error.message.includes('Failed to fetch')) {
        setError('CMS后端服务不可用，请先启动Supabase Functions');
        setActiveTab('backend');
      } else {
        setError('获取用户列表失败：' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    setLoading(true);
    clearMessages();

    const isBackendAvailable = await checkBackendStatus();
    if (!isBackendAvailable) {
      setError('CMS后端服务不可用，请检查Supabase Functions是否正在运行');
      setActiveTab('backend');
      setLoading(false);
      return;
    }

    const testEmail = 'admin@example.com';
    const testPassword = 'admin123';
    const testName = '测试管理员';

    try {
      await authAPI.signup(testEmail, testPassword, testName);
      toast.success('测试用户创建成功！');
      setSuccess(`测试用户创建成功！邮箱: ${testEmail}, 密码: ${testPassword}`);
      
      // 自动填充登录表单
      setSigninData({ email: testEmail, password: testPassword });
      setActiveTab('signin');
    } catch (error: any) {
      console.log('Create test user response:', error);
      
      if (error.message.includes('Backend not available')) {
        setError('CMS后端服务不可用，请先启动Supabase Functions');
        setActiveTab('backend');
        return;
      }
      
      // 尝试解析错误响应
      let errorData = null;
      try {
        if (error.message.startsWith('API Error')) {
          const errorText = error.message.split('): ')[1];
          errorData = JSON.parse(errorText);
        }
      } catch (parseError) {
        // 解析失败，使用原始错误消息
      }
      
      // 处理用户已存在的情况
      if (errorData?.user_exists || errorData?.code === 'email_exists' || 
          error.message.includes('already registered') || 
          error.message.includes('User already registered')) {
        
        toast.success('测试用户已存在，已为您填充登录信息');
        setSuccess(`测试用户已存在。邮箱: ${testEmail}, 密码: ${testPassword}，已为您填充登录信息。`);
        setSigninData({ email: testEmail, password: testPassword });
        setActiveTab('signin');
      } else {
        console.error('Create test user error:', error);
        setError(`创建测试用户失败：${errorData?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    if (signinData.email && signinData.password) {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      await handleSignin(event as any);
    }
  };

  const handleClose = () => {
    clearMessages();
    setSigninData({ email: '', password: '' });
    setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
    setTestUsers([]);
    setBackendStatus('checking');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>管理员认证</span>
          </DialogTitle>
          <DialogDescription>
            请登录或注册管理员账户以访问内容管理系统
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value: 'signin' | 'signup' | 'cms' | 'test' | 'backend') => {
          setActiveTab(value);
          clearMessages();
        }}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="signin" className="flex items-center space-x-1 text-xs">
              <LogIn className="w-3 h-3" />
              <span>登录</span>
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center space-x-1 text-xs">
              <UserPlus className="w-3 h-3" />
              <span>注册</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center space-x-1 text-xs">
              <TestTube className="w-3 h-3" />
              <span>测试</span>
            </TabsTrigger>
            <TabsTrigger value="backend" className="flex items-center space-x-1 text-xs">
              <Server className="w-3 h-3" />
              <span>后端</span>
            </TabsTrigger>
            <TabsTrigger value="cms" className="flex items-center space-x-1 text-xs">
              <Settings className="w-3 h-3" />
              <span>说明</span>
            </TabsTrigger>
          </TabsList>

          {/* Backend Status Tab */}
          <TabsContent value="backend">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Server className="w-5 h-5" />
                    <span>后端服务状态</span>
                  </CardTitle>
                  <CardDescription>
                    CMS功能需要Supabase Edge Functions正在运行
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Server className="w-4 h-4" />
                      <span>后端状态</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {backendStatus === 'checking' && (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          <span className="text-blue-600">检查中...</span>
                        </>
                      )}
                      {backendStatus === 'available' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">运行中</span>
                        </>
                      )}
                      {backendStatus === 'unavailable' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600">不可用</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={checkBackendStatus}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {backendStatus === 'checking' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        检查中...
                      </>
                    ) : (
                      '重新检查'
                    )}
                  </Button>

                  {backendStatus === 'unavailable' && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p>CMS后端服务不可用。要使用CMS功能，请：</p>
                          <ol className="list-decimal list-inside text-sm space-y-1">
                            <li>确保已安装Supabase CLI</li>
                            <li>在项目根目录运行 <code className="bg-gray-100 px-1 rounded">supabase start</code></li>
                            <li>运行 <code className="bg-gray-100 px-1 rounded">supabase functions serve</code></li>
                            <li>等待Functions启动完成后重新检查</li>
                          </ol>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {backendStatus === 'available' && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        后端服务正常运行！您可以使用所有CMS功能了。
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">快速启动指南</h4>
                    <div className="text-sm text-blue-700 space-y-2">
                      <p>如果这是您第一次运行，请按以下步骤操作：</p>
                      <div className="bg-blue-100 p-2 rounded font-mono text-xs">
                        # 安装Supabase CLI<br/>
                        npm install -g supabase<br/><br/>
                        # 启动本地Supabase<br/>
                        supabase start<br/><br/>
                        # 启动Edge Functions<br/>
                        supabase functions serve
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4" />
                    <a 
                      href="https://supabase.com/docs/guides/cli/getting-started" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Supabase CLI 文档
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 登录表单 */}
          <TabsContent value="signin">
            <form onSubmit={handleSignin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="signin-email">邮箱地址</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="请输入邮箱地址"
                  value={signinData.email}
                  onChange={(e) => setSigninData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">密码</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="请输入密码"
                  value={signinData.password}
                  onChange={(e) => setSigninData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>

              {signinData.email === 'admin@example.com' && signinData.password === 'admin123' && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    检测到测试账户信息，点击登录按钮即可快速登录。
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  取消
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      登录
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* 注册表单 */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-name">姓名</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="请输入姓名"
                  value={signupData.name}
                  onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">邮箱地址</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="请输入邮箱地址"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">密码</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="请输入密码（至少6位）"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">确认密码</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="请再次输入密码"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  取消
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      注册中...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      注册
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* 测试功能 */}
          <TabsContent value="test">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">测试工具</CardTitle>
                  <CardDescription>
                    用于测试和调试的工具（需要后端服务运行）
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      onClick={createTestUser} 
                      disabled={loading || backendStatus !== 'available'}
                      className="flex-1"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      创建测试用户
                    </Button>
                    <Button 
                      onClick={handleTestUsers} 
                      disabled={loading || backendStatus !== 'available'}
                      variant="outline"
                      className="flex-1"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Users className="w-4 h-4 mr-2" />
                      )}
                      查看用户列表
                    </Button>
                  </div>

                  {backendStatus !== 'available' && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        测试功能需要后端服务运行，请先到"后端"标签页检查服务状态。
                      </AlertDescription>
                    </Alert>
                  )}

                  {testUsers.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">系统用户 ({testUsers.length})</h4>
                      <div className="space-y-2">
                        {testUsers.map((user, index) => (
                          <div key={index} className="text-sm bg-white p-2 rounded border">
                            <div>邮箱: {user.email}</div>
                            <div className="text-gray-500">创建时间: {new Date(user.created_at).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">测试说明</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 点击"创建测试用户"将创建一个默认的管理员账户</li>
                      <li>• 测试账户：admin@example.com / admin123</li>
                      <li>• 创建后会自动填充到登录表单</li>
                      <li>• 如果测试用户已存在，会直接填充登录信息</li>
                    </ul>
                  </div>

                  {signinData.email && signinData.password && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">快速登录</h4>
                      <p className="text-sm text-green-700 mb-3">
                        测试账户信息已填充完成，点击下方按钮快速登录。
                      </p>
                      <Button 
                        onClick={handleQuickLogin}
                        disabled={loading}
                        className="w-full"
                        size="sm"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            登录中...
                          </>
                        ) : (
                          <>
                            <LogIn className="w-4 h-4 mr-2" />
                            使用 {signinData.email} 快速登录
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CMS说明 */}
          <TabsContent value="cms">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">内容管理系统功能</CardTitle>
                  <CardDescription>
                    登录后可以访问完整的CMS管理功能
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">多语言内容管理</p>
                      <p className="text-sm text-gray-600">分别管理中文和英文版本的所有内容</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">个人信息编辑</p>
                      <p className="text-sm text-gray-600">编辑个人简介、教育背景、工作经历等</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">项目案例管理</p>
                      <p className="text-sm text-gray-600">添加、编辑、删除项目案例，支持图片上传</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">兴趣爱好管理</p>
                      <p className="text-sm text-gray-600">管理个人兴趣项目和相关文件</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">文件上传管理</p>
                      <p className="text-sm text-gray-600">上传和管理图片、视频、文档等文件</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">站点设置</p>
                      <p className="text-sm text-gray-600">配置网站基本信息和主题颜色</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">快速开始</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. 点击"后端"标签页确保服务正在运行</li>
                  <li>2. 点击"测试"标签页创建测试用户</li>
                  <li>3. 使用测试账户登录系统</li>
                  <li>4. 开始管理您的作品集内容</li>
                  <li>5. 在前端网站查看更新效果</li>
                </ol>
              </div>

              <Button onClick={handleClose} className="w-full">
                关闭
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}