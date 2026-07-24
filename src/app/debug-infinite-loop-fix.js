#!/usr/bin/env node

/**
 * 调试脚本：检测和分析无限循环问题修复
 * 检查关键文件中可能导致循环的代码模式
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 分析无限循环修复情况...\n');

// 需要检查的关键文件
const filesToCheck = [
  'components/content/ContentContext.tsx',
  'components/pages/InterestsPage.tsx', 
  'components/pages/interests/InterestCard.tsx',
  'components/shared/useLanguageSync.ts',
  'components/shared/SmartPerformanceManager.tsx',
  'App.tsx'
];

// 可能导致循环的模式
const problematicPatterns = [
  {
    name: '频繁的useEffect依赖',
    pattern: /useEffect\([^}]+\}, \[[^}]+\w+[^}]+\w+[^}]*\]/g,
    severity: 'HIGH'
  },
  {
    name: '状态更新在useEffect中',
    pattern: /useEffect\([^}]*set\w+\([^}]*\)/g,
    severity: 'MEDIUM'
  },
  {
    name: '没有防抖的API调用',
    pattern: /(?<!debounced|throttled)\w*fetch\w*\(/g,
    severity: 'MEDIUM'
  },
  {
    name: 'timestamp频繁更新',
    pattern: /updateTimestamp|setLastUpdate/g,
    severity: 'HIGH'
  }
];

// 修复标记模式 - 检查是否已应用修复
const fixMarkers = [
  {
    name: '🔥 关键修复标记',
    pattern: /🔥 关键修复/g
  },
  {
    name: '防循环注释',
    pattern: /防止.*循环|避免.*循环|prevent.*loop/gi
  },
  {
    name: '防抖处理',
    pattern: /debounce|throttle/gi  
  },
  {
    name: '缓存时间延长',
    pattern: /\d{6,}.*缓存|缓存.*\d{6,}/g
  }
];

let totalIssues = 0;
let totalFixes = 0;

filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`\n📁 检查文件: ${filePath}`);
  
  // 检查问题模式
  let fileIssues = 0;
  problematicPatterns.forEach(pattern => {
    const matches = content.match(pattern.pattern);
    if (matches) {
      const severity = pattern.severity === 'HIGH' ? '🔴' : '🟡';
      console.log(`  ${severity} ${pattern.name}: ${matches.length} 个匹配`);
      fileIssues += matches.length;
      totalIssues += matches.length;
    }
  });

  // 检查修复标记
  let fileFixes = 0;
  fixMarkers.forEach(marker => {
    const matches = content.match(marker.pattern);
    if (matches) {
      console.log(`  ✅ ${marker.name}: ${matches.length} 个修复标记`);
      fileFixes += matches.length;
      totalFixes += matches.length;
    }
  });

  // 文件分析总结
  if (fileIssues === 0 && fileFixes > 0) {
    console.log(`  ✨ 文件状态: 已优化 (${fileFixes} 个修复)`);
  } else if (fileIssues > 0 && fileFixes > 0) {
    console.log(`  🔧 文件状态: 部分修复 (${fileFixes} 个修复, ${fileIssues} 个潜在问题)`);
  } else if (fileIssues > 0) {
    console.log(`  ⚠️  文件状态: 需要修复 (${fileIssues} 个潜在问题)`);
  } else {
    console.log(`  ✅ 文件状态: 良好`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 修复分析总结:');
console.log(`🔴 潜在问题总数: ${totalIssues}`);
console.log(`✅ 应用修复总数: ${totalFixes}`);

if (totalFixes > totalIssues) {
  console.log('🎉 修复状态: 优秀 - 修复措施充分');
} else if (totalFixes >= totalIssues * 0.7) {
  console.log('🔧 修复状态: 良好 - 大部分问题已修复');
} else if (totalFixes >= totalIssues * 0.4) {
  console.log('⚠️  修复状态: 一般 - 需要更多修复');
} else {
  console.log('🚨 修复状态: 需要关注 - 大量问题未修复');
}

console.log('\n🔧 修复建议:');
console.log('1. 使用 🔥 关键修复 标记已修复的代码');
console.log('2. 在useEffect中添加严格的依赖数组控制');
console.log('3. 对API调用和状态更新添加防抖/节流');
console.log('4. 延长缓存时间，减少频繁数据加载');
console.log('5. 在开发环境中禁用性能监控，防止循环');

console.log('\n🚀 下一步操作:');
console.log('1. 在浏览器中测试页面是否还有自动刷新');
console.log('2. 检查控制台是否还有频繁的API调用');
console.log('3. 监控兴趣页面的图片加载是否正常');
console.log('4. 确认语言切换不会触发无限循环');

console.log('\n✨ 如果问题仍然存在:');
console.log('1. 检查浏览器开发者工具中的Network标签页');
console.log('2. 查看Console中是否有循环日志');
console.log('3. 使用React DevTools分析组件重新渲染');
console.log('4. 考虑临时禁用SmartPerformanceManager');