import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Mail, Lock, User, Eye, EyeOff, AlertCircle, 
  CheckCircle, Loader2, Shield, Key
} from 'lucide-react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string) => void;
}

// Offline-first demo authentication
const DEMO_MODE = true; // Set to false when backend is ready
const DEMO_USERS = [
  { email: 'admin@example.com', password: 'admin123', name: 'Administrator', token: 'demo-admin-token' },
  { email: 'demo@example.com', password: 'demo123', name: 'Demo User', token: 'demo-user-token' }
];

export function AuthDialog({ isOpen, onClose, onAuthSuccess }: AuthDialogProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const texts = {
    zh: {
      title: '管理员认证',
      description: '请登录以访问内容管理系统，管理您的作品集内容',
      signIn: '登录',
      signUp: '注册',
      email: '邮箱地址',
      password: '密码',
      confirmPassword: '确认密码',
      name: '姓名',
      signInButton: '登录',
      signUpButton: '注册账户',
      cancel: '取消',
      emailPlaceholder: '请输入邮箱地址',
      passwordPlaceholder: '请输入密码',
      namePlaceholder: '请输入姓名',
      confirmPasswordPlaceholder: '请再次输入密码',
      showPassword: '显示密码',
      hidePassword: '隐藏密码',
      signUpSuccess: '注册成功！请使用新账户登录。',
      passwordMismatch: '两次输入的密码不一致',
      invalidEmail: '请输入有效的邮箱地址',
      weakPassword: '密码至少需要6个字符',
      requiredFields: '请填写所有必填字段',
      adminAccess: '管理员权限',
      secureLogin: '安全登录',
      switchToSignUp: '没有账户？注册新账户',
      switchToSignIn: '已有账户？立即登录',
      userExists: '用户已存在，请直接登录',
      authError: '邮箱或密码错误，请重试',
      demoMode: '演示模式',
      demoHint: '演示模式下，您可以使用以下测试账户',
      demoCredentials: '测试账户：admin@example.com / admin123',
      offlineMode: '离线模式已启用'
    },
    en: {
      title: 'Admin Authentication',
      description: 'Please log in to access the content management system and manage your portfolio content',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Full Name',
      signInButton: 'Sign In',
      signUpButton: 'Create Account',
      cancel: 'Cancel',
      emailPlaceholder: 'Enter your email address',
      passwordPlaceholder: 'Enter your password',
      namePlaceholder: 'Enter your full name',
      confirmPasswordPlaceholder: 'Confirm your password',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      signUpSuccess: 'Registration successful! Please sign in with your new account.',
      passwordMismatch: 'Passwords do not match',
      invalidEmail: 'Please enter a valid email address',
      weakPassword: 'Password must be at least 6 characters',
      requiredFields: 'Please fill in all required fields',
      adminAccess: 'Admin Access',
      secureLogin: 'Secure Login',
      switchToSignUp: 'No account? Create new account',
      switchToSignIn: 'Have an account? Sign in now',
      userExists: 'User already exists, please sign in instead',
      authError: 'Invalid email or password, please try again',
      demoMode: 'Demo Mode',
      demoHint: 'In demo mode, you can use the following test accounts',
      demoCredentials: 'Test Account: admin@example.com / admin123',
      offlineMode: 'Offline mode enabled'
    }
  };

  const t = texts[language];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!signInData.email || !signInData.password) {
      setError(t.requiredFields);
      return;
    }

    if (!validateEmail(signInData.email)) {
      setError(t.invalidEmail);
      return;
    }

    setLoading(true);

    try {
      if (DEMO_MODE) {
        // Demo/offline authentication
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        const demoUser = DEMO_USERS.find(
          user => user.email === signInData.email && user.password === signInData.password
        );

        if (demoUser) {
          console.log('Demo authentication successful for:', demoUser.name);
          onAuthSuccess(demoUser.token);
          onClose();
          resetForm();
        } else {
          throw new Error(t.authError);
        }
      } else {
        // Real authentication would go here
        throw new Error('Backend authentication not implemented');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || t.authError);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!signUpData.name || !signUpData.email || !signUpData.password || !signUpData.confirmPassword) {
      setError(t.requiredFields);
      return;
    }

    if (!validateEmail(signUpData.email)) {
      setError(t.invalidEmail);
      return;
    }

    if (signUpData.password.length < 6) {
      setError(t.weakPassword);
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      if (DEMO_MODE) {
        // Demo/offline registration
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        
        const existingUser = DEMO_USERS.find(user => user.email === signUpData.email);
        if (existingUser) {
          setError(t.userExists);
          setActiveTab('signin');
          setSignInData({ email: signUpData.email, password: '' });
          return;
        }

        // Simulate successful registration
        console.log('Demo user registered:', signUpData.name, signUpData.email);
        
        // Add to demo users for this session
        DEMO_USERS.push({
          email: signUpData.email,
          password: signUpData.password,
          name: signUpData.name,
          token: `demo-token-${Date.now()}`
        });

        setSuccess(t.signUpSuccess);
        setActiveTab('signin');
        setSignInData({ email: signUpData.email, password: '' });
        setSignUpData({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        // Real registration would go here
        throw new Error('Backend registration not implemented');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSignInData({ email: '', password: '' });
    setSignUpData({ name: '', email: '', password: '', confirmPassword: '' });
    setError(null);
    setSuccess(null);
    setShowPassword(false);
    setActiveTab('signin');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleQuickLogin = (email: string, password: string) => {
    setSignInData({ email, password });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>{t.title}</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        {/* Demo Mode Indicator */}
        {DEMO_MODE && (
          <Alert className="border-accent/20 bg-accent/5">
            <Key className="h-4 w-4 text-accent" />
            <AlertDescription className="text-accent-foreground">
              <strong>{t.demoMode}</strong> - {t.offlineMode}
              <br />
              <span className="text-xs mt-1 block">{t.demoCredentials}</span>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t.signIn}</TabsTrigger>
            <TabsTrigger value="signup">{t.signUp}</TabsTrigger>
          </TabsList>

          {/* Sign In Tab */}
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-primary" />
                  {t.secureLogin}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t.email}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        value={signInData.email}
                        onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={t.emailPlaceholder}
                        className="pl-10 bg-input-background border-border"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">{t.password}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder={t.passwordPlaceholder}
                        className="pl-10 pr-10 bg-input-background border-border"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Demo Quick Login Buttons */}
                  {DEMO_MODE && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">{t.demoHint}</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickLogin('admin@example.com', 'admin123')}
                          className="text-xs flex-1 bg-accent/5 border-accent/20 text-accent-foreground hover:bg-accent/10"
                          disabled={loading}
                        >
                          Admin
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickLogin('demo@example.com', 'demo123')}
                          className="text-xs flex-1 bg-secondary/5 border-secondary/20 text-secondary hover:bg-secondary/10"
                          disabled={loading}
                        >
                          Demo
                        </Button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleClose} 
                      className="flex-1"
                      disabled={loading}
                    >
                      {t.cancel}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="flex-1 bg-primary text-primary-foreground hover:bg-secondary"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t.signInButton}
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          {t.signInButton}
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('signup')}
                      className="text-sm text-primary hover:text-accent transition-colors hover:underline"
                      disabled={loading}
                    >
                      {t.switchToSignUp}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  {t.adminAccess}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t.name}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t.namePlaceholder}
                        className="pl-10 bg-input-background border-border"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t.email}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={t.emailPlaceholder}
                        className="pl-10 bg-input-background border-border"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t.password}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signUpData.password}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder={t.passwordPlaceholder}
                        className="pl-10 pr-10 bg-input-background border-border"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">{t.confirmPassword}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder={t.confirmPasswordPlaceholder}
                        className="pl-10 bg-input-background border-border"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleClose} 
                      className="flex-1"
                      disabled={loading}
                    >
                      {t.cancel}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="flex-1 bg-primary text-primary-foreground hover:bg-secondary"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t.signUpButton}
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 mr-2" />
                          {t.signUpButton}
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="text-sm text-primary hover:text-accent transition-colors hover:underline"
                      disabled={loading}
                    >
                      {t.switchToSignIn}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}