#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎯 临时邀请码生成工具\n');

// 生成邀请码
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 生成多个邀请码
function generateMultipleInvites(count = 20) {
  const invites = [];
  for (let i = 0; i < count; i++) {
    invites.push({
      code: generateInviteCode(),
      status: '未使用',
      createdAt: new Date().toISOString(),
      usedBy: null
    });
  }
  return invites;
}

// 生成邀请码
console.log('🔑 正在生成邀请码...\n');

const inviteCodes = generateMultipleInvites(20);

console.log('✅ 已生成20个邀请码：\n');

inviteCodes.forEach((invite, index) => {
  console.log(`${(index + 1).toString().padStart(2, '0')}. ${invite.code} - ${invite.status}`);
});

console.log('\n📋 邀请码使用说明：');
console.log('1. 将这些邀请码分享给内测用户');
console.log('2. 用户注册时输入邀请码即可加入');
console.log('3. 每个邀请码只能使用一次');
console.log('4. 内测名额限制：20人');

console.log('\n💡 建议：');
console.log('- 先给最信任的用户使用');
console.log('- 记录每个邀请码的使用情况');
console.log('- 及时补充邀请码');

console.log('\n🎉 邀请码生成完成！');
console.log('现在您可以开始邀请内测用户了！'); 