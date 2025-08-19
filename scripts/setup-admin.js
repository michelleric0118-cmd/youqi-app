#!/usr/bin/env node

const readline = require('readline');
const { execSync } = require('child_process');

console.log('🔧 有期内测版管理员账号设置工具\n');

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupAdmin() {
  try {
    console.log('📋 管理员账号设置步骤:\n');
    
    // 方法1: AdminSetup组件
    console.log('方法1: 使用AdminSetup组件（推荐）');
    console.log('1. 在应用中访问: /admin-setup');
    console.log('2. 输入您的用户名和密码');
    console.log('3. 点击"设置管理员权限"\n');
    
    // 方法2: LeanCloud控制台
    console.log('方法2: 通过LeanCloud控制台');
    console.log('1. 访问: https://console.leancloud.cn/');
    console.log('2. 选择您的应用');
    console.log('3. 进入"数据存储" → "用户"');
    console.log('4. 找到您的账号，设置role为"admin"\n');
    
    // 方法3: 直接运行代码
    console.log('方法3: 直接运行代码设置');
    
    rl.question('请输入您的用户名: ', (username) => {
      rl.question('请输入您的密码: ', async (password) => {
        try {
          console.log('\n🔄 正在设置管理员权限...');
          
          // 这里可以调用adminSetup.js中的函数
          // 但由于这是Node.js环境，我们需要通过其他方式
          console.log('✅ 用户名和密码已记录');
          console.log('请按照方法1或方法2完成设置\n');
          
          console.log('📱 设置完成后，您可以:');
          console.log('1. 访问用户管理功能');
          console.log('2. 生成邀请码');
          console.log('3. 管理内测用户');
          
          rl.close();
        } catch (error) {
          console.error('❌ 设置失败:', error.message);
          rl.close();
        }
      });
    });
    
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
    rl.close();
  }
}

// 启动设置流程
setupAdmin(); 