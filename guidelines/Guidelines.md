# 个人作品集网站开发指南

## 🎯 项目概述
基于React + TypeScript + Tailwind CSS + Supabase的现代化个人作品集网站，采用CLI终端风格设计，支持中英文双语、内容管理、图片上传等功能。

## 📋 核心特性

### 🎨 设计系统
- **主题**: CLI终端风格，毛玻璃效果
- **配色**: 太空蓝紫色渐变背景，12种玻璃样式类
- **字体**: 统一的3级字体系统（大、中、小）
- **布局**: 响应式设计，圆角边框统一规范

### 🧩 技术架构
- **前端**: React 18 + TypeScript + Tailwind CSS V4
- **后端**: Supabase (数据库 + 存储 + 认证)
- **组件**: ShadCN/UI组件库
- **状态管理**: React Context + Hooks
- **图标**: Lucide React

## 🏗️ 代码规范

### 组件开发
```typescript
interface ComponentProps {
  // 明确的类型定义
}

export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 组件逻辑
  return (
    <div className="组件样式">
      {/* 组件内容 */}
    </div>
  );
}
```

### 样式规范
- **使用Tailwind类**: 优先使用工具类
- **玻璃效果**: 使用预定义的`.glass-*`类
- **按钮圆角**: 统一使用`rounded-xl` (12px)
- **字体控制**: 禁止使用Tailwind字体类，使用CSS变量
- **响应式**: 使用`md:`, `lg:`等断点前缀

### 字体系统
```css
/* 三级字体系统 */
.text-large   /* 18px - 标题、重要信息 */
.text-medium  /* 16px - 正文、导航 */
.text-small   /* 14px - 辅助信息、状态 */
```

### 国际化
```typescript
const { isZh } = useLanguage();
const texts = useTexts();

// 条件渲染
{isZh ? '中文文案' : 'English text'}
```

## 📁 项目结构

```
├── components/
│   ├── admin/     # 管理功能
│   ├── app/       # 应用核心
│   ├── auth/      # 认证
│   ├── content/   # 内容管理
│   ├── language/  # 多语言
│   ├── pages/     # 页面组件
│   ├── shared/    # 共享组件
│   └── ui/        # ShadCN组件
├── styles/        # 全局样式
├── utils/         # 工具函数
├── supabase/      # 后端配置
└── guidelines/    # 开发指南
```

## 🎨 设计规范

### 玻璃效果类
- `.glass-blue` - 蓝色主题卡片
- `.glass-orange` - 橙色展示区域
- `.glass-cyan` - 青色信息区域
- `.glass-purple` - 紫色特殊区域
- 更多颜色变体...

### 按钮系统
- `.btn-glass-blue` - 主要操作按钮
- `.btn-glass-orange` - 次要操作按钮
- `.btn-glass-green` - 成功操作按钮
- 统一圆角: `rounded-xl`

### 输入框样式
- 统一背景: 半透明毛玻璃效果
- 边框: 蓝色主题边框
- 聚焦状态: 蓝色光晕效果
- 圆角: `rounded-xl`

## 🔧 开发工具

### 环境配置
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 可用脚本
- `npm run dev` - 开发服务器
- `npm run build` - 生产构建
- `npm run preview` - 预览构建
- `npm run lint` - 代码检查

## 🎯 最佳实践

### 性能优化
- 使用React.memo优化重渲染
- 图片懒加载和占位符
- 代码分割和懒加载
- 合理使用useCallback和useMemo

### 错误处理
- 实现优雅的错误边界
- 提供有意义的错误提示
- 支持离线模式降级
- 网络错误重试机制

### 用户体验
- 加载状态指示器
- 操作反馈和确认
- 响应式布局适配
- 键盘导航支持

## 🌐 部署指南

### Vercel部署
1. 连接Git仓库
2. 配置环境变量
3. 自动部署

### Supabase配置
1. 创建项目
2. 运行数据库迁移
3. 配置存储桶
4. 设置认证规则

## 📝 维护指南

### 内容管理
- 通过`/admin`访问管理后台
- 支持中英文内容独立管理
- 图片上传和管理功能
- 实时内容预览

### 监控和调试
- 错误抑制系统
- 控制台日志管理
- 性能监控
- 用户行为分析

---

## 🚨 重要原则

1. **严格遵照指令**: 只修改指令部分，不擅自决定修改其他部分
2. **最小改动**: 遵循指令前提下，进行最小的改动
3. **保持一致性**: 所有组件都应遵循统一的设计规范
4. **性能优先**: 优化加载速度和用户体验
5. **类型安全**: 充分利用TypeScript的类型检查

这份指南确保了项目的一致性、可维护性和用户体验质量。