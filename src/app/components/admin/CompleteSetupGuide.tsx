import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Play, 
  Loader2, 
  Database, 
  Key, 
  Cloud, 
  Settings,
  FileImage,
  Terminal,
  CheckSquare
} from 'lucide-react';
import { projectId, publicAnonKey, supabaseUrl } from '../../utils/supabase/info';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'checking' | 'completed' | 'error';
  action?: () => void;
  actionLabel?: string;
  instructions?: string[];
  sqlScript?: string;
}

export default function CompleteSetupGuide() {
  const [setupStatus, setSetupStatus] = useState<{[key: string]: 'pending' | 'checking' | 'completed' | 'error'}>({});
  const [testResults, setTestResults] = useState<{[key: string]: any}>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Database migration scripts
  const migrations = {
    initial: `-- 001_initial_setup.sql
-- 创建基础表结构

-- Enable RLS
ALTER DEFAULT PRIVILEGES REVOKE ALL ON TABLES FROM PUBLIC;

-- Create content table for general content management
CREATE TABLE IF NOT EXISTS public.content (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL, -- 'home', 'about', 'project', 'interest', 'blog', 'page_settings'
    title TEXT,
    content TEXT,
    metadata JSONB DEFAULT '{}', -- Additional data like images, links, categories, etc.
    language TEXT DEFAULT 'zh' CHECK (language IN ('zh', 'en')),
    is_published BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create files table for file management
CREATE TABLE IF NOT EXISTS public.files (
    id BIGSERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    storage_bucket TEXT DEFAULT 'make-55b791b3-portfolio-assets',
    upload_type TEXT DEFAULT 'general', -- 'profile', 'project', 'blog', 'general'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table for image management
CREATE TABLE IF NOT EXISTS public.images (
    id BIGSERIAL PRIMARY KEY,
    title TEXT,
    alt_text TEXT,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    file_size BIGINT,
    width INTEGER,
    height INTEGER,
    storage_bucket TEXT DEFAULT 'make-55b791b3-portfolio-assets',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_logs table for AI chat functionality
CREATE TABLE IF NOT EXISTS public.chat_logs (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS content_type_language_idx ON public.content(type, language);
CREATE INDEX IF NOT EXISTS content_published_idx ON public.content(is_published);
CREATE INDEX IF NOT EXISTS files_upload_type_idx ON public.files(upload_type);
CREATE INDEX IF NOT EXISTS chat_logs_session_idx ON public.chat_logs(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (read-only)
CREATE POLICY "Enable read access for all" ON public.content FOR SELECT USING (true);
CREATE POLICY "Enable read access for all" ON public.files FOR SELECT USING (true);
CREATE POLICY "Enable read access for all" ON public.images FOR SELECT USING (true);
CREATE POLICY "Enable read access for all" ON public.chat_logs FOR SELECT USING (true);

-- Create policies for authenticated users (full access)
CREATE POLICY "Enable all access for authenticated users" ON public.content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.files FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.chat_logs FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert demo admin user
INSERT INTO auth.users (
    id,
    aud,
    role,
    email,
    email_confirmed_at,
    phone,
    confirmation_token,
    recovery_token,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@demo.com',
    NOW(),
    NULL,
    '',
    '',
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "管理员"}'
) ON CONFLICT (email) DO NOTHING;

-- Create storage bucket for portfolio assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'make-55b791b3-portfolio-assets',
    'make-55b791b3-portfolio-assets',
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Enable read access for all" ON storage.objects FOR SELECT USING (bucket_id = 'make-55b791b3-portfolio-assets');
CREATE POLICY "Enable upload for authenticated users" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'make-55b791b3-portfolio-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON storage.objects FOR UPDATE USING (bucket_id = 'make-55b791b3-portfolio-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON storage.objects FOR DELETE USING (bucket_id = 'make-55b791b3-portfolio-assets' AND auth.role() = 'authenticated');`,

    language: `-- 002_add_language_support.sql
-- 添加多语言支持和示例数据

-- Insert sample content for both languages
INSERT INTO public.content (type, title, content, metadata, language, is_published, sort_order) VALUES 
-- Chinese content
('home', '欢迎来到我的作品集', '这里是我的个人作品集网站，展示我的项目、技能和兴趣。', '{"subtitle": "全栈开发者", "description": "热爱技术，专注创新"}', 'zh', true, 1),
('about', '关于我', '我是一名充满激情的开发者，致力于创造高质量的数字体验。', '{"skills": ["React", "TypeScript", "Node.js", "Python"], "experience": "5年开发经验"}', 'zh', true, 1),
('page_settings', '页面设置', '', '{"site_title": "个人作品集", "site_description": "展示我的项目和技能", "contact_email": "contact@example.com", "social_links": {"github": "", "linkedin": "", "twitter": ""}}', 'zh', true, 1),

-- English content  
('home', 'Welcome to My Portfolio', 'This is my personal portfolio website showcasing my projects, skills, and interests.', '{"subtitle": "Full Stack Developer", "description": "Passionate about technology and innovation"}', 'en', true, 1),
('about', 'About Me', 'I am a passionate developer dedicated to creating high-quality digital experiences.', '{"skills": ["React", "TypeScript", "Node.js", "Python"], "experience": "5 years of development experience"}', 'en', true, 1),
('page_settings', 'Page Settings', '', '{"site_title": "Portfolio", "site_description": "Showcase of my projects and skills", "contact_email": "contact@example.com", "social_links": {"github": "", "linkedin": "", "twitter": ""}}', 'en', true, 1),

-- Sample projects (Chinese)
('project', 'React作品集网站', '使用React和TypeScript构建的现代化作品集网站，具有响应式设计和深色主题支持。', '{"technologies": ["React", "TypeScript", "Tailwind CSS"], "github": "", "demo": "", "images": [], "category": "web"}', 'zh', true, 1),
('project', '全栈电商平台', '完整的电商解决方案，包含用户认证、支付集成、管理后台等功能。', '{"technologies": ["Next.js", "Node.js", "MongoDB", "Stripe"], "github": "", "demo": "", "images": [], "category": "fullstack"}', 'zh', true, 2),

-- Sample projects (English)
('project', 'React Portfolio Website', 'A modern portfolio website built with React and TypeScript, featuring responsive design and dark theme support.', '{"technologies": ["React", "TypeScript", "Tailwind CSS"], "github": "", "demo": "", "images": [], "category": "web"}', 'en', true, 1),
('project', 'Full-Stack E-commerce Platform', 'Complete e-commerce solution with user authentication, payment integration, and admin dashboard.', '{"technologies": ["Next.js", "Node.js", "MongoDB", "Stripe"], "github": "", "demo": "", "images": [], "category": "fullstack"}', 'en', true, 2),

-- Sample interests (Chinese)
('interest', '机器学习', '探索人工智能和机器学习算法，构建智能应用。', '{"category": "technology", "level": "intermediate", "tags": ["AI", "Python", "TensorFlow"]}', 'zh', true, 1),
('interest', '摄影', '喜欢捕捉生活中的美好瞬间，特别是自然风光和街头摄影。', '{"category": "creative", "level": "beginner", "tags": ["风光", "街拍", "后期处理"]}', 'zh', true, 2),

-- Sample interests (English)
('interest', 'Machine Learning', 'Exploring artificial intelligence and machine learning algorithms to build intelligent applications.', '{"category": "technology", "level": "intermediate", "tags": ["AI", "Python", "TensorFlow"]}', 'en', true, 1),
('interest', 'Photography', 'Love capturing beautiful moments in life, especially landscape and street photography.', '{"category": "creative", "level": "beginner", "tags": ["Landscape", "Street", "Post-processing"]}', 'en', true, 2),

-- Sample blog posts (Chinese)
('blog', 'React Hooks最佳实践', '分享React Hooks的使用经验和最佳实践，提高开发效率。', '{"excerpt": "深入理解React Hooks的工作原理", "tags": ["React", "Hooks", "前端"], "author": "作者", "published_at": "2024-01-15"}', 'zh', true, 1),
('blog', 'TypeScript进阶技巧', '探讨TypeScript的高级特性和在实际项目中的应用。', '{"excerpt": "掌握TypeScript的高级类型系统", "tags": ["TypeScript", "类型系统", "开发"], "author": "作者", "published_at": "2024-01-10"}', 'zh', true, 2),

-- Sample blog posts (English)  
('blog', 'React Hooks Best Practices', 'Sharing experience and best practices with React Hooks to improve development efficiency.', '{"excerpt": "Deep dive into React Hooks principles", "tags": ["React", "Hooks", "Frontend"], "author": "Author", "published_at": "2024-01-15"}', 'en', true, 1),
('blog', 'Advanced TypeScript Techniques', 'Exploring advanced TypeScript features and their applications in real projects.', '{"excerpt": "Mastering TypeScript advanced type system", "tags": ["TypeScript", "Type System", "Development"], "author": "Author", "published_at": "2024-01-10"}', 'en', true, 2)

ON CONFLICT DO NOTHING;

-- Update timestamps
UPDATE public.content SET updated_at = NOW() WHERE updated_at IS NULL;`
  };

  const steps: SetupStep[] = [
    {
      id: 'connection-test',
      title: '1. 验证连接配置',
      description: '测试与Supabase项目的基础连接',
      status: setupStatus.connection || 'pending',
      action: testConnection,
      actionLabel: '测试连接'
    },
    {
      id: 'run-migration-1',
      title: '2. 运行初始数据库脚本',
      description: '创建基础表结构、权限和存储桶',
      status: setupStatus.migration1 || 'pending',
      instructions: [
        '在新标签页中打开 Supabase Dashboard',
        '选择您的项目',
        '转到 SQL Editor 页面',
        '点击 "New query" 创建新查询',
        '复制下面的初始设置脚本到编辑器',
        '点击 "Run" 执行脚本'
      ],
      sqlScript: migrations.initial,
      action: () => window.open(`https://supabase.com/dashboard/project/${projectId}/sql`, '_blank'),
      actionLabel: '打开 SQL Editor'
    },
    {
      id: 'run-migration-2', 
      title: '3. 运行语言支持脚本',
      description: '添加多语言支持和示例数据',
      status: setupStatus.migration2 || 'pending',
      instructions: [
        '在 SQL Editor 中创建另一个新查询',
        '复制下面的语言支持脚本到编辑器',
        '点击 "Run" 执行脚本',
        '确认没有错误信息'
      ],
      sqlScript: migrations.language,
      action: () => window.open(`https://supabase.com/dashboard/project/${projectId}/sql`, '_blank'),
      actionLabel: '打开 SQL Editor'
    },
    {
      id: 'verify-tables',
      title: '4. 验证数据库表',
      description: '检查所有表是否创建成功',
      status: setupStatus.tables || 'pending',
      action: verifyTables,
      actionLabel: '验证表结构'
    },
    {
      id: 'verify-storage',
      title: '5. 验证存储桶',
      description: '检查文件存储桶是否配置正确',
      status: setupStatus.storage || 'pending',
      action: verifyStorage,
      actionLabel: '验证存储'
    },
    {
      id: 'test-data-operations',
      title: '6. 测试数据操作',
      description: '测试读取和写入数据功能',
      status: setupStatus.dataOps || 'pending',
      action: testDataOperations,
      actionLabel: '测试数据'
    }
  ];

  async function testConnection() {
    setSetupStatus(prev => ({ ...prev, connection: 'checking' }));
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        setSetupStatus(prev => ({ ...prev, connection: 'completed' }));
        setTestResults(prev => ({ ...prev, connection: { success: true, message: '连接成功' } }));
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      setSetupStatus(prev => ({ ...prev, connection: 'error' }));
      setTestResults(prev => ({ ...prev, connection: { success: false, error: error.message } }));
    }
  }

  async function verifyTables() {
    setSetupStatus(prev => ({ ...prev, tables: 'checking' }));
    
    try {
      // Test each table
      const tables = ['content', 'files', 'images', 'chat_logs'];
      const results = [];
      
      for (const table of tables) {
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/${table}?limit=1`, {
            headers: {
              'apikey': publicAnonKey,
              'Authorization': `Bearer ${publicAnonKey}`
            }
          });
          
          if (response.ok) {
            results.push({ table, status: 'ok' });
          } else {
            results.push({ table, status: 'error', error: response.statusText });
          }
        } catch (error: any) {
          results.push({ table, status: 'error', error: error.message });
        }
      }
      
      const allSuccess = results.every(r => r.status === 'ok');
      
      if (allSuccess) {
        setSetupStatus(prev => ({ ...prev, tables: 'completed' }));
      } else {
        setSetupStatus(prev => ({ ...prev, tables: 'error' }));
      }
      
      setTestResults(prev => ({ ...prev, tables: results }));
      
    } catch (error: any) {
      setSetupStatus(prev => ({ ...prev, tables: 'error' }));
      setTestResults(prev => ({ ...prev, tables: { error: error.message } }));
    }
  }

  async function verifyStorage() {
    setSetupStatus(prev => ({ ...prev, storage: 'checking' }));
    
    try {
      const response = await fetch(`${supabaseUrl}/storage/v1/bucket/make-55b791b3-portfolio-assets`, {
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.ok) {
        setSetupStatus(prev => ({ ...prev, storage: 'completed' }));
        setTestResults(prev => ({ ...prev, storage: { success: true } }));
      } else {
        setSetupStatus(prev => ({ ...prev, storage: 'error' }));
        setTestResults(prev => ({ ...prev, storage: { error: `HTTP ${response.status}` } }));
      }
    } catch (error: any) {
      setSetupStatus(prev => ({ ...prev, storage: 'error' }));
      setTestResults(prev => ({ ...prev, storage: { error: error.message } }));
    }
  }

  async function testDataOperations() {
    setSetupStatus(prev => ({ ...prev, dataOps: 'checking' }));
    
    try {
      // Test read operation
      const readResponse = await fetch(`${supabaseUrl}/rest/v1/content?limit=5`, {
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!readResponse.ok) {
        throw new Error(`读取测试失败: ${readResponse.status}`);
      }
      
      const data = await readResponse.json();
      
      setSetupStatus(prev => ({ ...prev, dataOps: 'completed' }));
      setTestResults(prev => ({ 
        ...prev, 
        dataOps: { 
          success: true, 
          recordsCount: data.length,
          sampleData: data.slice(0, 2)
        } 
      }));
      
    } catch (error: any) {
      setSetupStatus(prev => ({ ...prev, dataOps: 'error' }));
      setTestResults(prev => ({ ...prev, dataOps: { error: error.message } }));
    }
  }

  async function runAllTests() {
    setIsRunningTests(true);
    
    await testConnection();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await verifyTables();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await verifyStorage();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testDataOperations();
    
    setIsRunningTests(false);
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('✅ 已复制到剪贴板！');
    } catch (err) {
      console.error('复制失败:', err);
      alert('❌ 复制失败，请手动选择文本');
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const allCompleted = steps.every(step => setupStatus[step.id] === 'completed');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Supabase 完整设置指南</h1>
        </div>
        <p className="text-gray-600 mb-4">
          按照以下步骤完成数据库设置，确保您的作品集网站正常运行
        </p>
        
        {/* Quick Test Button */}
        <button
          onClick={runAllTests}
          disabled={isRunningTests}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
        >
          {isRunningTests ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>正在测试...</span>
            </>
          ) : (
            <>
              <CheckSquare className="w-4 h-4" />
              <span>快速验证所有设置</span>
            </>
          )}
        </button>
      </div>

      {/* Project Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📋 当前项目信息</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>项目 ID:</strong> {projectId}</p>
          <p><strong>项目 URL:</strong> https://{projectId}.supabase.co</p>
          <p><strong>API Key:</strong> {publicAnonKey.slice(0, 20)}...</p>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Step Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getStepIcon(setupStatus[step.id] || 'pending')}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {step.action && (
                  <button
                    onClick={step.action}
                    disabled={setupStatus[step.id] === 'checking'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
                  >
                    {setupStatus[step.id] === 'checking' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : step.actionLabel?.includes('SQL') ? (
                      <ExternalLink className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span>{step.actionLabel}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6">
              {/* Instructions */}
              {step.instructions && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">📝 操作步骤:</h4>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    {step.instructions.map((instruction, idx) => (
                      <li key={idx}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* SQL Script */}
              {step.sqlScript && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">SQL 脚本:</h4>
                    <button
                      onClick={() => copyToClipboard(step.sqlScript!)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      <span>复制脚本</span>
                    </button>
                  </div>
                  <pre className="text-xs bg-white p-3 rounded border border-gray-200 max-h-60 overflow-y-auto font-mono">
                    {step.sqlScript}
                  </pre>
                </div>
              )}

              {/* Test Results */}
              {testResults[step.id] && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">🧪 测试结果:</h4>
                  <div className={`p-3 rounded border text-sm ${
                    testResults[step.id].success || !testResults[step.id].error
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <pre>{JSON.stringify(testResults[step.id], null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Success Message */}
      {allCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-green-900 mb-2">🎉 设置完成！</h2>
          <p className="text-green-800 mb-4">
            恭喜！您的Supabase数据库已经完全配置好了。现在您可以：
          </p>
          <div className="text-sm text-green-700 space-y-2">
            <p>✅ 在管理面板中添加和编辑内容</p>
            <p>✅ 上传和管理图片文件</p>
            <p>✅ 发布项目和博客文章</p>
            <p>✅ 管理您的兴趣和技能</p>
          </div>
        </div>
      )}

      {/* Help */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-3">💡 需要帮助？</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>• 如果遇到权限错误，确保在 Supabase Dashboard 中以项目所有者身份登录</p>
          <p>• 如果表创建失败，检查SQL脚本是否完整复制</p>
          <p>• 如果存储桶验证失败，手动在Storage页面创建存储桶</p>
          <p>• 有任何问题，可以查看浏览器控制台的详细错误信息</p>
        </div>
      </div>
    </div>
  );
}