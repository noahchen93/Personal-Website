#!/usr/bin/env node

/**
 * 部署前检查脚本
 * Pre-deployment Check Script
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 开始部署前检查...');
console.log('🔍 Starting pre-deployment check...\n');

let hasErrors = false;
let hasWarnings = false;

// 检查必需文件
function checkRequiredFiles() {
  console.log('📁 检查必需文件...');
  
  const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    'index.html',
    'src/main.tsx',
    'src/App.tsx',
    'styles/globals.css',
    '.env.example'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    console.log('❌ 缺少必需文件:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    hasErrors = true;
  } else {
    console.log('✅ 所有必需文件都存在');
  }
}

// 检查环境变量
function checkEnvironmentVariables() {
  console.log('\n⚙️  检查环境变量...');
  
  if (!fs.existsSync(path.join(rootDir, '.env'))) {
    console.log('⚠️  警告: .env 文件不存在');
    console.log('   部署到Vercel时需要在Vercel Dashboard中设置环境变量');
    hasWarnings = true;
    return;
  }
  
  const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf8');
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName) || envContent.includes(`${varName}=your-`)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('⚠️  警告: 以下环境变量未正确配置:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    hasWarnings = true;
  } else {
    console.log('✅ 环境变量配置完整');
  }
}

// 检查包配置
function checkPackageConfiguration() {
  console.log('\n📦 检查package.json配置...');
  
  const packagePath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.log('❌ package.json文件不存在');
    hasErrors = true;
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // 检查必需的scripts
  const requiredScripts = ['dev', 'build', 'preview'];
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts?.[script]);
  
  if (missingScripts.length > 0) {
    console.log('❌ 缺少必需的npm scripts:');
    missingScripts.forEach(script => console.log(`   - ${script}`));
    hasErrors = true;
  }
  
  // 检查Node.js版本要求
  if (!packageJson.engines?.node) {
    console.log('⚠️  警告: 未指定Node.js版本要求');
    hasWarnings = true;
  }
  
  if (missingScripts.length === 0 && packageJson.engines?.node) {
    console.log('✅ package.json配置正确');
  }
}

// 检查TypeScript配置
function checkTypeScriptConfiguration() {
  console.log('\n🔧 检查TypeScript配置...');
  
  const tsconfigPath = path.join(rootDir, 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    console.log('❌ tsconfig.json文件不存在');
    hasErrors = true;
    return;
  }
  
  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    // 检查基本配置
    if (!tsconfig.compilerOptions) {
      console.log('❌ tsconfig.json缺少compilerOptions');
      hasErrors = true;
      return;
    }
    
    const requiredOptions = ['target', 'module', 'jsx'];
    const missingOptions = requiredOptions.filter(option => !tsconfig.compilerOptions[option]);
    
    if (missingOptions.length > 0) {
      console.log('⚠️  警告: tsconfig.json缺少以下选项:');
      missingOptions.forEach(option => console.log(`   - ${option}`));
      hasWarnings = true;
    } else {
      console.log('✅ TypeScript配置正确');
    }
  } catch (error) {
    console.log('❌ tsconfig.json格式错误');
    hasErrors = true;
  }
}

// 检查Supabase配置
function checkSupabaseConfiguration() {
  console.log('\n🗄️  检查Supabase配置...');
  
  const supabaseDir = path.join(rootDir, 'supabase');
  if (!fs.existsSync(supabaseDir)) {
    console.log('⚠️  警告: supabase目录不存在');
    hasWarnings = true;
    return;
  }
  
  const requiredSupabaseFiles = [
    'supabase/config.toml',
    'supabase/functions/server/index.tsx',
    'supabase/migrations'
  ];
  
  const missingSupabaseFiles = requiredSupabaseFiles.filter(file => 
    !fs.existsSync(path.join(rootDir, file))
  );
  
  if (missingSupabaseFiles.length > 0) {
    console.log('⚠️  警告: 缺少Supabase配置文件:');
    missingSupabaseFiles.forEach(file => console.log(`   - ${file}`));
    hasWarnings = true;
  } else {
    console.log('✅ Supabase配置完整');
  }
}

// 检查构建配置
function checkBuildConfiguration() {
  console.log('\n🏗️  检查构建配置...');
  
  const viteConfigPath = path.join(rootDir, 'vite.config.ts');
  if (!fs.existsSync(viteConfigPath)) {
    console.log('❌ vite.config.ts文件不存在');
    hasErrors = true;
    return;
  }
  
  const vercelConfigPath = path.join(rootDir, 'vercel.json');
  if (!fs.existsSync(vercelConfigPath)) {
    console.log('⚠️  警告: vercel.json文件不存在，可能影响Vercel部署');
    hasWarnings = true;
  } else {
    console.log('✅ Vercel配置存在');
  }
  
  console.log('✅ 构建配置检查完成');
}

// 运行所有检查
async function runAllChecks() {
  checkRequiredFiles();
  checkEnvironmentVariables();
  checkPackageConfiguration();
  checkTypeScriptConfiguration();
  checkSupabaseConfiguration();
  checkBuildConfiguration();
  
  // 输出结果
  console.log('\n' + '='.repeat(50));
  
  if (hasErrors) {
    console.log('❌ 发现严重问题，建议修复后再部署');
    console.log('❌ Found critical issues, please fix before deployment');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  发现警告，但可以继续部署');
    console.log('⚠️  Found warnings, but deployment can continue');
    console.log('\n📋 部署检查表:');
    console.log('□ 确保环境变量在Vercel中正确设置');
    console.log('□ 确保Supabase项目状态正常');
    console.log('□ 确保代码已推送到Git仓库');
    process.exit(0);
  } else {
    console.log('✅ 所有检查通过，可以安全部署！');
    console.log('✅ All checks passed, ready for deployment!');
    console.log('\n🚀 部署步骤:');
    console.log('1. 推送代码到GitHub: git push origin main');
    console.log('2. 访问Vercel: https://vercel.com/new');
    console.log('3. 导入仓库并配置环境变量');
    process.exit(0);
  }
}

// 运行检查
runAllChecks().catch(error => {
  console.error('检查过程中出错:', error);
  process.exit(1);
});