import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useContent } from '../content/ContentContext';
import { Mail, Lock, AlertCircle, Loader2, Info, CheckCircle } from 'lucide-react';

export default function AdminLogin() {
  const { signIn, isOnline: authOnline } = useAuth();
  const { isOnline: contentOnline } = useContent();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isFullyOnline = authOnline && contentOnline;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }

    // 在线模式下验证邮箱白名单
    if (isFullyOnline && email !== 'chenyujian93@gmail.com') {
      setError('无权限：只有授权管理员可以登录此系统');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      setSuccess('登录成功！');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || '登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}


      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="bg-red-900/30 border border-red-400/50 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-small">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/30 border border-green-400/50 rounded-lg p-3 flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-300 text-small">{success}</p>
          </div>
        )}

        {/* Quick Demo Login */}
        {!isFullyOnline && (
          <div className="bg-amber-900/30 border border-amber-400/50 rounded-lg p-3">
            <p className="text-amber-300 text-small font-medium mb-2">快速体验</p>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@demo.com');
                setPassword('demo123');
              }}
              className="text-small bg-amber-800/50 hover:bg-amber-700/60 text-amber-200 px-2 py-1 rounded transition-colors border border-amber-600/30"
            >
              填入演示账号信息
            </button>
          </div>
        )}

        <div>
          <label className="block text-small font-medium text-white mb-1">
            管理员邮箱
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors"
              placeholder={isFullyOnline ? "输入授权管理员邮箱" : "输入管理员邮箱"}
            />
          </div>
          {isFullyOnline && (
            <p className="text-small text-slate-400 mt-1">
              仅限授权管理员使用
            </p>
          )}
        </div>

        <div>
          <label className="block text-small font-medium text-white mb-1">
            密码
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors"
              placeholder="输入密码"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full cms-primary-button flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>登录中...</span>
            </>
          ) : (
            <span>管理员登录</span>
          )}
        </button>

        <div className="text-center">

        </div>
      </form>
    </div>
  );
}