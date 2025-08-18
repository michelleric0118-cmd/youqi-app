#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 有期内测版快速部署到Cloudflare\n');

// 内测配置
const BETA_CONFIG = {
  version: '0.2.0-beta',
  maxUsers: 20,
  features: [
    '✅ 物品管理（增删改查）',
    '✅ 分类管理',
    '✅ 过期提醒',
    '✅ 数据统计',
    '✅ OCR识别（无次数限制）',
    '✅ 批量操作',
    '✅ PWA支持',
    '✅ 离线功能',
    '✅ 推送通知',
    '✅ 多语言支持'
  ]
};

console.log('📋 内测版配置:');
console.log(`版本: ${BETA_CONFIG.version}`);
console.log(`最大用户数: ${BETA_CONFIG.maxUsers}`);
console.log('部署平台: Cloudflare Pages\n');

console.log('🎯 内测版功能特性:');
BETA_CONFIG.features.forEach(feature => {
  console.log(`  ${feature}`);
});

// 检查Git状态
console.log('\n📦 检查Git状态...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log('⚠️  有未提交的更改:');
    console.log(gitStatus);
    console.log('\n💡 建议先提交更改再部署');
  } else {
    console.log('✅ 工作目录干净，可以部署');
  }
} catch (error) {
  console.log('⚠️  无法检查Git状态，请确保在Git仓库中');
}

// 检查构建文件
console.log('\n📦 检查构建文件...');
const buildPath = path.join(__dirname, '../build');
if (!fs.existsSync(buildPath)) {
  console.log('❌ 构建文件夹不存在，正在构建...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 构建完成！\n');
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ 构建文件夹已存在');
}

// 分析构建文件
console.log('\n📊 构建文件分析:');
const indexHtmlPath = path.join(buildPath, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  const stats = fs.statSync(indexHtmlPath);
  console.log(`✅ index.html: ${(stats.size / 1024).toFixed(1)} KB`);
}

// 检查PWA配置
console.log('\n📱 PWA配置检查:');
const manifestPath = path.join(buildPath, 'manifest.json');
const swPath = path.join(buildPath, 'service-worker.js');

if (fs.existsSync(manifestPath)) {
  console.log('✅ manifest.json 存在');
} else {
  console.log('⚠️  manifest.json 不存在');
}

if (fs.existsSync(swPath)) {
  console.log('✅ service-worker.js 存在');
} else {
  console.log('⚠️  service-worker.js 不存在');
}

// 部署说明
console.log('\n🌐 Cloudflare Pages 部署说明:');
console.log('1. 确保代码已推送到GitHub');
console.log('2. Cloudflare Pages自动检测到代码变更');
console.log('3. 自动构建和部署');
console.log('4. 全球CDN加速生效');

console.log('\n📝 内测版发布说明:');
console.log(`• 版本: ${BETA_CONFIG.version}`);
console.log(`• 用户限制: ${BETA_CONFIG.maxUsers}人`);
console.log(`• OCR识别: 无次数限制，完全免费`);
console.log(`• 部署状态: 自动部署`);
console.log(`• 访问地址: https://youqi-app.pages.dev`);

console.log('\n🔧 内测准备清单:');
console.log('□ 设置管理员账号');
console.log('□ 生成20个邀请码');
console.log('□ 测试邀请码系统');
console.log('□ 验证核心功能');
console.log('□ 准备内测用户名单');

console.log('\n📋 部署步骤:');
console.log('1. 提交所有代码更改到GitHub');
console.log('2. 推送到主分支: git push origin main');
console.log('3. 等待Cloudflare自动部署（通常1-2分钟）');
console.log('4. 访问 https://youqi-app.pages.dev 验证部署');
console.log('5. 设置管理员账号和邀请码');

console.log('\n🎉 内测版部署准备完成！');
console.log('💡 请按照上述步骤完成部署。');
console.log('🔗 用户可以通过以下地址访问内测版:');
console.log('   https://youqi-app.pages.dev');

console.log('\n✨ 祝您内测顺利！'); 