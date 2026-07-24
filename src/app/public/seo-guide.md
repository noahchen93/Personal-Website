# SEO 配置指南

## 概览
你的个人作品集网站已经配置了全面的SEO优化，支持Google、X(Twitter)、LinkedIn和Instagram等平台。

## 需要创建的图片文件

为了获得最佳的社交媒体分享效果，请创建以下图片文件：

### 1. Open Graph 图片 (`/public/og-image.jpg`)
- **尺寸**: 1200px × 630px (推荐)
- **格式**: JPG 或 PNG
- **内容建议**: 
  - 你的姓名和职位
  - 简洁的设计背景
  - 与终端主题一致的配色方案（黑色/绿色/蓝色）
  - 可选：你的照片或头像

### 2. Apple Touch 图标
- `/public/apple-touch-icon.png` (180px × 180px)
- 用于iOS设备保存到主屏幕

### 3. Microsoft 瓦片图标
- `/public/ms-icon-144x144.png` (144px × 144px)
- 用于Windows设备

### 4. 网站图标
- `/public/favicon.ico` (32px × 32px)
- 浏览器标签页图标

## 需要更新的配置

在 `/components/shared/SEOHead.tsx` 中，请更新以下信息：

```typescript
// 更新为你的实际社交媒体账号
"sameAs": [
  "https://github.com/你的GitHub用户名",
  "https://linkedin.com/in/你的LinkedIn用户名", 
  "https://twitter.com/你的Twitter用户名"
],

// 更新Twitter相关标签
updateMetaTag('twitter:site', '@你的Twitter用户名');
updateMetaTag('twitter:creator', '@你的Twitter用户名');

// 更新LinkedIn标签
updateMetaTag('linkedin:owner', '你的LinkedIn ID');

// 更新Google验证码
updateMetaTag('google-site-verification', '你的Google验证码');

// 更新域名
const baseUrl = 'https://你的域名.com';
```

## SEO 功能特性

### ✅ 已实现的优化

1. **Google SEO**
   - 语义化HTML结构
   - Meta描述和关键词
   - 结构化数据（JSON-LD）
   - Canonical链接
   - Hreflang多语言支持
   - Google站点验证

2. **社交媒体优化**
   - Open Graph标签（Facebook、LinkedIn）
   - Twitter Cards
   - Instagram应用名称标签
   - LinkedIn所有者标签

3. **移动设备优化**
   - Apple移动Web应用标签
   - Microsoft应用程序瓦片
   - 响应式meta标签

4. **多语言SEO**
   - 中文/英文动态SEO内容
   - Hreflang标签
   - 本地化关键词

### 📊 SEO监控建议

1. **Google Search Console**
   - 验证网站所有权
   - 监控搜索性能
   - 检查索引状态

2. **社交媒体测试工具**
   - Facebook Sharing Debugger
   - Twitter Card Validator  
   - LinkedIn Post Inspector

3. **性能监控**
   - Google PageSpeed Insights
   - GTmetrix
   - Lighthouse audit

## 页面特定SEO

每个页面都有定制的SEO设置：

- **首页**: 重点突出个人品牌和AI编程特色
- **项目页**: 优化项目关键词和技术栈
- **联系页**: 专业联系和合作关键词
- **兴趣页**: 个人爱好和多元化技能
- **博客页**: 文章SEO和发布时间优化

## 更新SEO内容

要更新特定页面的SEO，编辑对应页面组件中的 `usePageSEO` 调用：

```typescript
usePageSEO('page-name', {
  title: '自定义标题',
  description: '自定义描述',
  keywords: ['关键词1', '关键词2'],
  type: 'website', // 或 'article', 'profile'
});
```

## 注意事项

- 确保所有图片都压缩优化
- 定期更新meta描述以反映最新内容
- 保持关键词的相关性和自然性
- 测试不同平台的分享效果