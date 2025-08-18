#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 有期内测版部署到Cloudflare\n');

// 检查构建状态
console.log('📦 检查构建状态...');
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

// 检查Git状态
console.log('\n📦 检查Git状态...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log('⚠️  有未提交的更改:');
    console.log(gitStatus);
    console.log('\n💡 建议先提交更改再部署');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('是否继续部署？(y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('继续部署...\n');
        deployToCloudflare();
      } else {
        console.log('部署已取消，请先提交更改');
        rl.close();
        process.exit(0);
      }
    });
  } else {
    console.log('✅ 工作目录干净，可以部署');
    deployToCloudflare();
  }
} catch (error) {
  console.log('⚠️  无法检查Git状态，请确保在Git仓库中');
  deployToCloudflare();
}

function deployToCloudflare() {
  console.log('\n🌐 开始部署到Cloudflare Pages...');
  
  // 检查是否已配置Cloudflare
  try {
    const cfConfig = execSync('npx wrangler --version', { encoding: 'utf8' });
    console.log('✅ Cloudflare CLI已安装:', cfConfig.trim());
  } catch (error) {
    console.log('⚠️  Cloudflare CLI未安装，请先安装:');
    console.log('   npm install -g wrangler');
    console.log('   或使用 npx wrangler');
  }
  
  console.log('\n📋 部署步骤:');
  console.log('1. 确保代码已推送到GitHub');
  console.log('2. 推送到主分支: git push origin main');
  console.log('3. 等待Cloudflare自动部署（通常1-2分钟）');
  console.log('4. 访问 https://youqi-app.pages.dev 验证部署');
  
  console.log('\n🔧 内测准备清单:');
  console.log('□ 设置管理员账号');
  console.log('□ 生成20个邀请码');
  console.log('□ 测试邀请码系统');
  console.log('□ 验证核心功能');
  console.log('□ 准备内测用户名单');
  
  console.log('\n📝 内测版信息:');
  console.log('• 版本: 0.2.0-beta');
  console.log('• 用户限制: 20人');
  console.log('• OCR识别: 无次数限制，完全免费');
  console.log('• 部署状态: 自动部署');
  console.log('• 访问地址: https://youqi-app.pages.dev');
  
  console.log('\n🎉 部署准备完成！');
  console.log('💡 请按照上述步骤完成部署。');
  console.log('🔗 用户可以通过以下地址访问内测版:');
  console.log('   https://youqi-app.pages.dev');
  
  console.log('\n✨ 祝您内测顺利！');
} 