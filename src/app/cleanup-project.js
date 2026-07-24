#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要删除的垃圾文件列表
const filesToDelete = [
  // 临时应用文件
  'App-minimal.tsx',
  'App-test.tsx',
  
  // 各种指南和文档文件（保留Guidelines.md）
  'API_KEY_SETUP.md',
  'Attributions.md',
  'CLEANUP_OLD_GUIDES.md',
  'CLEANUP_REPORT.md',
  'CLEANUP_STATUS.md',
  'CLEANUP_SUMMARY.md',
  'CLI_FIX_README.md',
  'CMS_OPTIMIZATION_SUMMARY.md',
  'COMPLETE_SUPABASE_SETUP.md',
  'CONNECTION_STATUS_EXPLANATION.md',
  'CONTENT_404_ERROR_FIX.md',
  'CURRENT_SETUP_STATUS.md',
  'DATABASE_LANGUAGE_UPDATE.md',
  'DATABASE_MANUAL_SETUP.md',
  'DATABASE_MIGRATION_GUIDE.md',
  'EMERGENCY_CLI_FIX.md',
  'ENHANCED_FEATURES_GUIDE.md',
  'ENVIRONMENT_VARIABLES.md',
  'FINAL_CLEANUP_REPORT.md',
  'FINAL_RESPONSE_ERROR_FIX.md',
  'FRONTEND_LOADING_FIX.md',
  'IMAGE_DEBUG_GUIDE.md',
  'IMAGE_LOADING_FIXES_SUMMARY.md',
  'IMMEDIATE_FIX.md',
  'IMMEDIATE_FIXES.md',
  'MANUAL_STORAGE_SETUP_GUIDE.md',
  'PERMISSION_ERROR_FIX.md',
  'PRIVATE_STORAGE_SETUP.md',
  'PROJECT_STRUCTURE_REORGANIZED.md',
  'Product_Requirements_Document_PRD.md',
  'QUICK_CLI_FIX.md',
  'QUICK_SETUP_GUIDE.md',
  'QUICK_START.md',
  'README.local.md',
  'RESPONSE_BODY_ERROR_FINAL_FIX.md',
  'RESPONSE_BODY_READ_ERROR_FIX.md',
  'SETUP_GUIDE.md',
  'STORAGE_FIX_GUIDE.md',
  'STORAGE_FIX_INSTRUCTIONS.md',
  'STORAGE_FIX_README.md',
  'STORAGE_FIX_TEST_GUIDE.md',
  'STORAGE_SYNC_ERROR_FIX.md',
  'STORAGE_SYNC_UUID_FIX.md',
  'STORAGE_TEST_INSTRUCTIONS.md',
  'STORAGE_UPLOAD_FIX.md',
  'SUPABASE_API_KEYS_GUIDE.md',
  'SUPABASE_CLI_FIX.md',
  'SUPABASE_SETUP.md',
  'SUPABASE_SETUP_GUIDE.md',
  'SUPABASE_UNIFIED_SETUP_GUIDE.md',
  'quick-storage-fix.md',
  '产品设计文档_PRD.md',
  
  // SQL文件和数据库脚本
  'CORRECTED_STORAGE_FIX.sql',
  'QUICK_SYNC_IMAGES.sql',
  'VERIFY_EXISTING_STORAGE_CONNECTION.sql',
  'VERIFY_STORAGE_FIX.sql',
  'create-storage-bucket-comprehensive.sql',
  'create-storage-bucket.sql',
  'storage_bucket_fix.sql',
  
  // TSX格式的SQL文件
  'FINAL_STORAGE_BUCKET_FIX_sql.tsx',
  'LINK_EXISTING_STORAGE_BUCKET_sql.tsx',
  'SIMPLE_STORAGE_FIX_sql.tsx',
  'SYNC_EXISTING_IMAGES_sql.tsx',
  'fix-storage-bucket_sql.tsx',
  'sync-images-now_bat.tsx',
  
  // Shell脚本和批处理文件
  'check-end-of-file.sh',
  'check-status.sh',
  'cleanup-files.sh',
  'cli-compatibility-fix.sh',
  'deploy-functions.sh',
  'deploy-server-now.sh',
  'deploy-supabase.sh',
  'deploy-unified-database.sh',
  'fix-and-deploy-server.sh',
  'fix-cli-now.sh',
  'fix-image-data-validation.sh',
  'fix-image-fetch.sh',
  'fix-image-validation-comprehensive.sh',
  'fix-kv-structure-validation.sh',
  'fix-server-404.sh',
  'fix-storage-comprehensive.sh',
  'fix-storage-connection.sh',
  'fix-storage-errors.sh',
  'fix-storage-final.bat',
  'fix-storage-final.sh',
  'fix-storage-now.bat',
  'fix-storage-now.sh',
  'fix-storage-permissions.bat',
  'fix-storage-permissions.sh',
  'fix-supabase-cli.sh',
  'instant-cli-fix.sh',
  'quick-status.sh',
  'run-fixes.sh',
  'run-sort-fix.sh',
  'run_storage_fix.sh',
  'sync-images-now.sh',
  'test-api-endpoints.sh',
  'test-storage-connection.sh',
  'verify-cli-fix.sh',
  
  // JS脚本文件
  'check-environment.js',
  'check-sort-order-fix.js',
  'check-syntax.js',
  'clean-project.js',
  'fix-supabase-connection.js',
  'storage-comprehensive-fix.js',
  'temp-cleanup-script.js',
  'test_storage_fix.js',
  'update-supabase-config.js',
  'verify-homepage-fix.js',
  'verify-navigation-order.js',
  'verify-supabase-setup.js',
  
  // 测试HTML文件
  'test-dynamic-image-layout.html',
  'test-frontend-loading.html',
  'test-fullscreen-editor.html',
  'test-homepage-images.html',
  'test-homepage-refresh-fix.html',
  'test-image-display.html',
  'test-image-loading.html',
  'test-image-system.html',
  'test-loading.html',
  'test-mobile-share.html',
  'test-share-dialog.html',
  
  // 测试TSX文件
  'test-interests-editor.tsx',
  'test-podcast-card.tsx',
  'test-simple-editor.tsx',
  
  // Scripts目录下的文件
  'scripts/setup.bat',
  'scripts/setup.sh',
  
  // Public目录下的SEO指南
  'public/seo-guide.md',
  
  // src目录下的重复文件
  'src/App.tsx',
  'src/main.tsx'
];

let deletedCount = 0;
let errorCount = 0;

console.log('🧹 开始清理项目垃圾文件...\n');

filesToDelete.forEach(file => {
  const filePath = path.resolve(file);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ 已删除: ${file}`);
      deletedCount++;
    } else {
      console.log(`ℹ️  文件不存在: ${file}`);
    }
  } catch (error) {
    console.error(`❌ 删除失败: ${file} - ${error.message}`);
    errorCount++;
  }
});

// 删除空的scripts目录
try {
  const scriptsDir = 'scripts';
  if (fs.existsSync(scriptsDir)) {
    const files = fs.readdirSync(scriptsDir);
    if (files.length === 1 && files[0] === 'pre-deploy-check.js') {
      // 只保留pre-deploy-check.js
      console.log(`ℹ️  保留scripts目录和pre-deploy-check.js`);
    }
  }
} catch (error) {
  console.error(`❌ 处理scripts目录失败: ${error.message}`);
}

// 删除空的src目录
try {
  const srcDir = 'src';
  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    if (files.length === 0) {
      fs.rmdirSync(srcDir);
      console.log(`✅ 已删除空目录: ${srcDir}`);
    }
  }
} catch (error) {
  console.error(`❌ 删除src目录失败: ${error.message}`);
}

console.log(`\n🎉 清理完成!`);
console.log(`✅ 成功删除: ${deletedCount} 个文件`);
if (errorCount > 0) {
  console.log(`❌ 删除失败: ${errorCount} 个文件`);
}
console.log(`\n项目已清理完毕，只保留了必要的文件。`);