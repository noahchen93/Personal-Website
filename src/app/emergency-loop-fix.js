#!/usr/bin/env node

/**
 * 应急修复脚本：临时禁用可能导致循环的功能
 * 如果无限循环问题仍然存在，运行此脚本应急修复
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 执行应急循环修复...\n');

// 应急修复配置
const emergencyFixes = [
  {
    file: 'components/shared/SmartPerformanceManager.tsx',
    description: '完全禁用性能监控',
    changes: [
      {
        find: /const \[metrics, setMetrics\] = useState<PerformanceMetrics>\(defaultMetrics\);/,
        replace: 'const [metrics, setMetrics] = useState<PerformanceMetrics>(defaultMetrics);'
      },
      {
        find: /const reportMetric = useCallback\([^}]+\}, \[\]\);/gs,
        replace: `const reportMetric = useCallback((key: keyof PerformanceMetrics, value: number) => {
    // 🚨 EMERGENCY FIX: Completely disabled to prevent infinite loops
    console.debug('[EMERGENCY] Performance metric reporting disabled:', key, value);
    return;
  }, []);`
      }
    ]
  },
  {
    file: 'components/content/ContentContext.tsx',
    description: '禁用自动timestamp更新',
    changes: [
      {
        find: /const updateTimestampThrottled = useCallback\([^}]+\}, \[\]\);/gs,
        replace: `const updateTimestampThrottled = useCallback(() => {
    // 🚨 EMERGENCY FIX: Timestamp updates disabled to prevent loops
    console.debug('[EMERGENCY] Timestamp update disabled');
    return;
  }, []);`
      }
    ]
  },
  {
    file: 'components/pages/InterestsPage.tsx',
    description: '禁用自动数据刷新',
    changes: [
      {
        find: /loadAllDataDebounced\(.*\);/g,
        replace: `// 🚨 EMERGENCY FIX: Auto data loading disabled
    console.debug('[EMERGENCY] Data loading disabled for InterestsPage');
    // loadAllDataDebounced(false);`
      }
    ]
  },
  {
    file: 'App.tsx',
    description: '简化App初始化',
    changes: [
      {
        find: /<SmartPerformanceProvider>/,
        replace: '<!-- 🚨 EMERGENCY: SmartPerformanceProvider disabled -->\n      <div>'
      },
      {
        find: /<\/SmartPerformanceProvider>/,
        replace: '</div>\n      <!-- 🚨 EMERGENCY: SmartPerformanceProvider disabled -->'
      }
    ]
  }
];

// 创建备份目录
const backupDir = './emergency-backups';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// 执行应急修复
emergencyFixes.forEach(fix => {
  const filePath = fix.file;
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在，跳过: ${filePath}`);
    return;
  }

  // 创建备份
  const backupPath = path.join(backupDir, path.basename(filePath) + '.backup');
  fs.copyFileSync(filePath, backupPath);
  console.log(`💾 已备份: ${filePath} -> ${backupPath}`);

  // 读取文件内容
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 应用修复
  fix.changes.forEach(change => {
    if (content.match(change.find)) {
      content = content.replace(change.find, change.replace);
      modified = true;
    }
  });

  // 写入修改后的内容
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`🔧 已修复: ${filePath} - ${fix.description}`);
  } else {
    console.log(`ℹ️  无需修复: ${filePath}`);
  }
});

// 创建恢复脚本
const restoreScript = `#!/usr/bin/env node

/**
 * 恢复脚本：撤销应急修复
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 恢复应急修复前的文件...');

const backupDir = './emergency-backups';
const files = [
  'SmartPerformanceManager.tsx',
  'ContentContext.tsx', 
  'InterestsPage.tsx',
  'App.tsx'
];

files.forEach(fileName => {
  const backupPath = path.join(backupDir, fileName + '.backup');
  const originalPath = {
    'SmartPerformanceManager.tsx': 'components/shared/SmartPerformanceManager.tsx',
    'ContentContext.tsx': 'components/content/ContentContext.tsx',
    'InterestsPage.tsx': 'components/pages/InterestsPage.tsx',
    'App.tsx': 'App.tsx'
  }[fileName];

  if (fs.existsSync(backupPath) && originalPath) {
    fs.copyFileSync(backupPath, originalPath);
    console.log(\`✅ 已恢复: \${originalPath}\`);
  }
});

console.log('🎉 应急修复已撤销，所有文件已恢复');
`;

fs.writeFileSync('./restore-emergency-fix.js', restoreScript);
fs.chmodSync('./restore-emergency-fix.js', '755');

console.log('\n' + '='.repeat(60));
console.log('🚨 应急修复完成!');
console.log('\n📋 执行的修复:');
emergencyFixes.forEach(fix => {
  console.log(`  • ${fix.description}`);
});

console.log('\n🔄 如需撤销修复:');
console.log('  运行: node restore-emergency-fix.js');

console.log('\n⚠️  注意事项:');
console.log('1. 这是应急修复，会禁用一些功能');
console.log('2. 性能监控将被禁用');
console.log('3. 自动数据更新将被禁用');
console.log('4. 需要手动刷新页面来加载数据');

console.log('\n🔍 测试步骤:');
console.log('1. 重启开发服务器');
console.log('2. 访问兴趣页面');
console.log('3. 检查是否还有自动刷新');
console.log('4. 确认页面功能基本正常');

console.log('\n✨ 如果问题解决:');
console.log('1. 逐步恢复功能并测试');
console.log('2. 找出具体导致循环的代码');
console.log('3. 应用针对性修复');
console.log('4. 最终撤销应急修复');