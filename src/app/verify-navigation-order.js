#!/usr/bin/env node

/**
 * 验证导航顺序修改脚本
 * 检查所有相关文件中的页面顺序是否一致
 */

const fs = require('fs');
const path = require('path');

const expectedOrder = ['home', 'projects', 'ai-explore', 'blog', 'interests', 'contact'];

function checkFileContent(filePath, description) {
  console.log(`\n🔍 检查文件: ${description}`);
  console.log(`   路径: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log('   ❌ 文件不存在');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  console.log('   ✅ 文件存在');
  
  return { content, exists: true };
}

function verifyOrder(content, pattern, description) {
  const matches = content.match(pattern);
  if (!matches) {
    console.log(`   ❌ 未找到${description}定义`);
    return false;
  }
  
  const orderString = matches[0];
  const foundOrder = [];
  
  // 检查顺序
  expectedOrder.forEach(section => {
    const index = orderString.indexOf(`'${section}'`);
    if (index !== -1) {
      foundOrder.push({ section, index });
    }
  });
  
  // 按索引排序
  foundOrder.sort((a, b) => a.index - b.index);
  const actualOrder = foundOrder.map(item => item.section);
  
  console.log(`   📋 实际顺序: [${actualOrder.join(', ')}]`);
  console.log(`   📋 期望顺序: [${expectedOrder.join(', ')}]`);
  
  const isCorrect = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);
  console.log(`   ${isCorrect ? '✅' : '❌'} 顺序${isCorrect ? '正确' : '错误'}`);
  
  return isCorrect;
}

function main() {
  console.log('🚀 开始验证导航顺序修改...\n');
  console.log(`📋 期望的页面顺序: [${expectedOrder.join(', ')}]`);
  
  let allCorrect = true;
  
  // 检查 constants.ts
  const constantsResult = checkFileContent('./components/app/constants.ts', 'App Constants');
  if (constantsResult.exists) {
    const sectionTypeCorrect = verifyOrder(
      constantsResult.content, 
      /export type Section = [\s\S]*?;/, 
      'Section类型'
    );
    const validSectionsCorrect = verifyOrder(
      constantsResult.content, 
      /export const VALID_SECTIONS[\s\S]*?\] as const;/, 
      'VALID_SECTIONS数组'
    );
    allCorrect = allCorrect && sectionTypeCorrect && validSectionsCorrect;
  } else {
    allCorrect = false;
  }
  
  // 检查 Navigation.tsx
  const navigationResult = checkFileContent('./components/Navigation.tsx', 'Navigation Component');
  if (navigationResult.exists) {
    const navItemsCorrect = verifyOrder(
      navigationResult.content, 
      /const navItems = \[[\s\S]*?\];/, 
      'navItems数组'
    );
    allCorrect = allCorrect && navItemsCorrect;
  } else {
    allCorrect = false;
  }
  
  // 检查 AdminPanel.tsx  
  const adminResult = checkFileContent('./components/admin/AdminPanel.tsx', 'Admin Panel');
  if (adminResult.exists) {
    const menuItemsCorrect = verifyOrder(
      adminResult.content, 
      /const menuItems: MenuItem\[\] = \[[\s\S]*?\];/, 
      'menuItems数组'
    );
    allCorrect = allCorrect && menuItemsCorrect;
  } else {
    allCorrect = false;
  }
  
  console.log('\n📊 验证结果汇总:');
  console.log(`   ${allCorrect ? '✅ 所有文件顺序正确' : '❌ 存在顺序不一致的文件'}`);
  
  if (allCorrect) {
    console.log('\n🎉 页面顺序修改验证通过！');
    console.log('   现在的导航顺序为: Home → Projects → AI Explore → Blog → Interests → Contact');
  } else {
    console.log('\n⚠️  发现问题，请检查上述标记为❌的项目');
  }
  
  return allCorrect;
}

// 运行验证
const success = main();
process.exit(success ? 0 : 1);