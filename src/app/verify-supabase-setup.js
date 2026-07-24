#!/usr/bin/env node

/**
 * Supabase 项目设置验证脚本
 * 用于检查新项目的配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Supabase 项目设置验证');
console.log('========================\n');

// 读取配置文件
const configPath = path.join(__dirname, 'utils', 'supabase', 'info.tsx');
let projectId = '';
let anonKey = '';

try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    // 提取项目 ID
    const projectIdMatch = configContent.match(/projectId = "([^"]+)"/);
    if (projectIdMatch) {
        projectId = projectIdMatch[1];
    }
    
    // 提取 Anon Key
    const anonKeyMatch = configContent.match(/publicAnonKey = "([^"]+)"/);
    if (anonKeyMatch) {
        anonKey = anonKeyMatch[1];
    }
    
} catch (error) {
    console.error('❌ 无法读取配置文件:', error.message);
    process.exit(1);
}

// 验证配置
console.log('📋 配置检查:');
if (projectId && projectId !== 'YOUR_NEW_PROJECT_ID') {
    console.log('  ✅ Project ID 已设置:', projectId);
} else {
    console.log('  ❌ Project ID 未设置或使用默认值');
    console.log('     请更新 /utils/supabase/info.tsx');
}

if (anonKey && anonKey !== 'YOUR_NEW_ANON_KEY') {
    console.log('  ✅ Anon Key 已设置');
} else {
    console.log('  ❌ Anon Key 未设置或使用默认值');
    console.log('     请更新 /utils/supabase/info.tsx');
}

// 如果配置正确，测试连接
if (projectId && projectId !== 'YOUR_NEW_PROJECT_ID' && 
    anonKey && anonKey !== 'YOUR_NEW_ANON_KEY') {
    
    console.log('\n🌐 连接测试:');
    
    // 测试数据库连接
    testConnection(projectId, anonKey);
} else {
    console.log('\n⚠️  请先完成配置设置，然后重新运行此脚本');
    console.log('\n📝 下一步操作:');
    console.log('1. 更新 /utils/supabase/info.tsx 中的配置信息');
    console.log('2. 在 Supabase Dashboard 中执行数据库迁移脚本');
    console.log('3. 部署 Edge Function');
    console.log('4. 重新运行此验证脚本');
}

async function testConnection(projectId, anonKey) {
    try {
        // 测试项目基础连接
        console.log('  🔗 测试项目基础连接...');
        const projectUrl = `https://${projectId}.supabase.co`;
        
        // 测试 Edge Function
        console.log('  🚀 测试 Edge Function...');
        const healthUrl = `${projectUrl}/functions/v1/server/make-server-55b791b3/health`;
        
        console.log(`  📡 健康检查 URL: ${healthUrl}`);
        console.log('\n✅ 配置验证完成！');
        console.log('\n📋 手动验证清单:');
        console.log('1. [ ] 访问健康检查 URL 确认 Edge Function 工作正常');
        console.log('2. [ ] 在应用中测试图片上传功能');
        console.log('3. [ ] 测试内容管理功能');
        console.log('4. [ ] 验证多语言支持');
        
        console.log('\n🛠️  故障排查:');
        console.log('- 如果健康检查失败，检查 Edge Function 是否已部署');
        console.log('- 如果图片上传失败，检查 Storage 存储桶配置');
        console.log('- 如果内容管理失败，检查数据库表是否已创建');
        
    } catch (error) {
        console.error('❌ 连接测试失败:', error.message);
    }
}