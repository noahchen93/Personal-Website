import React, { useState } from 'react';
import { ArrowLeft, Home, Briefcase, Heart, FileText, Folder, BookOpen } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import { useContent } from '../content/ContentContext';
import { ScrollArea } from '../ui/scroll-area';
import HomeEditor from './editors/HomeEditor';
import ProjectsEditor from './editors/ProjectsEditor';
import InterestsEditor from './editors/InterestsEditor';
import BlogEditor from './editors/BlogEditor';
import ResourceManager from './ResourceManager';

type EditorSection = 'home' | 'projects' | 'interests' | 'blog' | 'resources' | null;

export default function ContentEditor() {
  const [activeSection, setActiveSection] = useState<EditorSection>(null);
  const { isZh } = useLanguage();
  const { isOnline } = useContent();

  const editorSections = [
    { 
      id: 'home' as const, 
      name: isZh ? '首页内容' : 'Home Content', 
      description: isZh ? '编辑个人简介、教育背景和工作经历' : 'Edit personal summary, education and work experience',
      icon: Home, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-200/50'
    },
    { 
      id: 'projects' as const, 
      name: isZh ? '项目经历' : 'Projects', 
      description: isZh ? '管理项目作品和技术经历' : 'Manage project portfolio and technical experience',
      icon: Briefcase, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50/80',
      borderColor: 'border-green-200/50'
    },
    { 
      id: 'interests' as const, 
      name: isZh ? '个人兴趣' : 'Personal Interests', 
      description: isZh ? '编辑兴趣爱好和生活分享' : 'Edit hobbies and personal interests',
      icon: Heart, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50/80',
      borderColor: 'border-purple-200/50'  
    },
    { 
      id: 'blog' as const, 
      name: isZh ? '博客文章' : 'Blog Posts', 
      description: isZh ? '创建和管理博客文章' : 'Create and manage blog articles',
      icon: BookOpen, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50/80',
      borderColor: 'border-orange-200/50'
    },
    { 
      id: 'resources' as const, 
      name: isZh ? '资源管理' : 'Resource Management', 
      description: isZh ? '管理图片、视频、音频等多媒体资源' : 'Manage images, videos, audio and other multimedia resources',
      icon: Folder, 
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50/80',
      borderColor: 'border-pink-200/50'
    },
  ];

  const renderEditor = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex items-center space-x-4 mb-6">
              <button
                onClick={() => setActiveSection(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isZh ? '返回' : 'Back'}</span>
              </button>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {isZh ? '首页内容编辑' : 'Home Content Editor'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isZh ? '编辑个人简介、教育背景和工作经历' : 'Edit personal summary, education and work experience'}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="pr-4 pt-20"> {/* Add top padding for fixed button */}
                  <HomeEditor onBack={() => setActiveSection(null)} />
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex items-center space-x-4 mb-6">
              <button
                onClick={() => setActiveSection(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isZh ? '返回' : 'Back'}</span>
              </button>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {isZh ? '项目经历编辑' : 'Projects Editor'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isZh ? '管理项目作品和技术经历' : 'Manage project portfolio and technical experience'}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="pr-4 pt-20"> {/* Add top padding for fixed button */}
                  <ProjectsEditor onBack={() => setActiveSection(null)} />
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      case 'interests':
        return (
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex items-center space-x-4 mb-6">
              <button
                onClick={() => setActiveSection(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isZh ? '返回' : 'Back'}</span>
              </button>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {isZh ? '个人兴趣编辑' : 'Personal Interests Editor'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isZh ? '编辑兴趣爱好和生活分享' : 'Edit hobbies and personal interests'}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="pr-4 pt-20"> {/* Add top padding for fixed button */}
                  <InterestsEditor onBack={() => setActiveSection(null)} />
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      case 'blog':
        return (
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex items-center space-x-4 mb-6">
              <button
                onClick={() => setActiveSection(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isZh ? '返回' : 'Back'}</span>
              </button>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {isZh ? '博客文章编辑' : 'Blog Posts Editor'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isZh ? '创建和管理博客文章' : 'Create and manage blog articles'}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="pr-4 pt-20"> {/* Add top padding for fixed button */}
                  <BlogEditor onBack={() => setActiveSection(null)} />
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      case 'resources':
        return (
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex items-center space-x-4 mb-6">
              <button
                onClick={() => setActiveSection(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isZh ? '返回' : 'Back'}</span>
              </button>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {isZh ? '资源管理' : 'Resource Management'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isZh ? '管理图片、视频、音频等多媒体资源' : 'Manage images, videos, audio and other multimedia resources'}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="pr-4 pt-20"> {/* Add top padding for fixed button */}
                  <ResourceManager />
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full overflow-y-auto">
            <div className="space-y-8 pt-20"> {/* Add top padding for header */}
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {isZh ? '内容管理中心' : 'Content Management Center'}
                  </h2>
                  <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                    {isZh ? '选择要编辑的内容类型，支持中英文双语独立管理。所有内容都支持Markdown语法和资源引用功能。' : 'Select content type to edit, supports independent bilingual management. All content supports Markdown syntax and resource references.'}
                  </p>
                </div>
              </div>

              {/* Connection Status */}
              <div className={`glass rounded-xl p-4 border ${
                isOnline 
                  ? 'border-green-200/50 bg-green-50/50' 
                  : 'border-amber-200/50 bg-amber-50/50'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    isOnline ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
                  }`} />
                  <div>
                    <p className={`font-medium ${
                      isOnline ? 'text-green-800' : 'text-amber-800'
                    }`}>
                      {isOnline 
                        ? (isZh ? '☁️ 云端同步已连接' : '☁️ Cloud sync connected') 
                        : (isZh ? '💾 离线模式运行' : '💾 Running in offline mode')
                      }
                    </p>
                    <p className={`text-sm ${
                      isOnline ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {isOnline 
                        ? (isZh ? '所有更改将自动保存到云端数据库' : 'All changes will be automatically saved to cloud database')
                        : (isZh ? '更改将保存到本地存储，网络恢复后自动同步' : 'Changes will be saved locally and synced when network is restored')
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Type Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {editorSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    >
                      <div className={`${section.bgColor} ${section.borderColor} glass border rounded-2xl p-6 h-full backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300`}>
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className={`w-16 h-16 bg-gradient-to-br ${section.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 group-hover:scale-110`}>
                            <Icon className="w-8 h-8" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                              {section.name}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {section.description}
                            </p>
                          </div>
                          <div className={`w-full h-1 bg-gradient-to-r ${section.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Feature Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-6 border border-blue-200/50 bg-blue-50/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Folder className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-900">
                      {isZh ? '🖼️ 资源引用功能' : '🖼️ Resource Reference Feature'}
                    </h4>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1 font-bold">•</span>
                      <span>{isZh ? '在资源管理中上传多媒体文件后，复制引用码' : 'Upload multimedia files in resource management, then copy reference code'}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1 font-bold">•</span>
                      <span>{isZh ? '在任何内容编辑器中粘贴引用码，如:' : 'Paste reference code in any content editor, like:'} 
                        <code className="bg-blue-100 px-2 py-1 rounded ml-1 font-mono text-xs">
                          {`{{image:资源ID}}`}
                        </code>
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1 font-bold">•</span>
                      <span>{isZh ? '前端会自动解析并显示对应的资源' : 'Frontend will automatically parse and display corresponding resources'}</span>
                    </li>
                  </ul>
                </div>

                <div className="glass rounded-2xl p-6 border border-green-200/50 bg-green-50/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-900">
                      {isZh ? '✍️ Markdown支持' : '✍️ Markdown Support'}
                    </h4>
                  </div>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1 font-bold">•</span>
                      <span>{isZh ? '所有文本内容都支持Markdown语法' : 'All text content supports Markdown syntax'}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1 font-bold">•</span>
                      <span>{isZh ? '支持标题、列表、链接、代码块等格式' : 'Supports headings, lists, links, code blocks, etc.'}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1 font-bold">•</span>
                      <span>{isZh ? '实时预览功能，编辑后立即看到效果' : 'Real-time preview feature, see results immediately after editing'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Usage Tips */}
              <div className="glass rounded-2xl p-6 border border-purple-200/50 bg-purple-50/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-purple-900">
                    {isZh ? '💡 使用提示' : '💡 Usage Tips'}
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-500 mt-1 font-bold">•</span>
                      <span>{isZh ? '所有更改都会实时保存到数据库' : 'All changes are saved to database in real-time'}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-500 mt-1 font-bold">•</span>
                      <span>{isZh ? '支持中英文独立内容管理' : 'Supports independent bilingual content management'}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-500 mt-1 font-bold">•</span>
                      <span>{isZh ? '支持拖拽上传多媒体文件' : 'Supports drag-and-drop multimedia upload'}</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-500 mt-1 font-bold">•</span>
                      <span>{isZh ? '内容支持丰富的格式和样式' : 'Content supports rich formatting and styles'}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-500 mt-1 font-bold">•</span>
                      <span>{isZh ? '可以预览发布效果再提交' : 'Preview published content before submitting'}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-500 mt-1 font-bold">•</span>
                      <span>{isZh ? '支持多媒体资源批量管理' : 'Supports batch multimedia resource management'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {renderEditor()}
    </div>
  );
}