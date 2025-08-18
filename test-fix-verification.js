// 测试修复验证脚本
console.log('🧪 测试分类过期提醒修复...');

// 1. 设置药品分类的过期提醒（两个提醒）
const medicineReminderSettings = {
  firstReminderDays: [30, 7],
  secondReminderDays: [1]
};

// 使用分类名称作为键名（修复后的方式）
localStorage.setItem('category_reminder_药品', JSON.stringify(medicineReminderSettings));
console.log('✅ 已设置药品分类过期提醒：', medicineReminderSettings);

// 2. 设置全局默认过期提醒
const globalReminderSettings = {
  globalFirstReminderDays: 7,
  globalSecondReminderDays: 1
};

localStorage.setItem('reminder_settings', JSON.stringify(globalReminderSettings));
console.log('✅ 已设置全局默认过期提醒：', globalReminderSettings);

// 3. 测试获取分类过期提醒设置（模拟AddItem中的逻辑）
function testCategoryReminderSync(category) {
  console.log(`\n🔍 测试分类 "${category}" 的过期提醒同步...`);
  
  const categorySettings = localStorage.getItem(`category_reminder_${category}`);
  if (categorySettings) {
    const settings = JSON.parse(categorySettings);
    console.log('📋 分类特定设置：', settings);
    
    // 合并提醒天数（模拟AddItem中的逻辑）
    const reminderDays = [
      ...(settings.firstReminderDays || []),
      ...(settings.secondReminderDays || [])
    ].filter((value, index, self) => self.indexOf(value) === index); // 去重
    
    console.log('🎯 合并后的提醒天数：', reminderDays);
    console.log('📊 提醒数量：', reminderDays.length);
    
    if (reminderDays.length === 3) {
      console.log('✅ 成功同步了所有3个提醒！');
    } else {
      console.log('❌ 只同步了部分提醒，需要检查逻辑');
    }
    
    return reminderDays;
  } else {
    console.log('📋 无分类特定设置，使用全局默认设置');
    
    const globalSettings = localStorage.getItem('reminder_settings');
    if (globalSettings) {
      const settings = JSON.parse(globalSettings);
      console.log('🌐 全局设置：', settings);
      
      const reminderDays = [
        ...(settings.globalFirstReminderDays ? [settings.globalFirstReminderDays] : []),
        ...(settings.globalSecondReminderDays ? [settings.globalSecondReminderDays] : [])
      ].filter((value, index, self) => self.indexOf(value) === index);
      
      console.log('🎯 全局默认提醒天数：', reminderDays);
      return reminderDays;
    } else {
      console.log('🎯 使用硬编码默认值：[7, 1]');
      return [7, 1];
    }
  }
}

// 4. 测试不同分类
console.log('\n' + '='.repeat(60));
testCategoryReminderSync('药品');
console.log('\n' + '='.repeat(60));
testCategoryReminderSync('护肤品');
console.log('\n' + '='.repeat(60));
testCategoryReminderSync('食品');

// 5. 验证存储键名一致性
console.log('\n🔍 验证存储键名一致性...');
const medicineKey = 'category_reminder_药品';
const medicineData = localStorage.getItem(medicineKey);
if (medicineData) {
  console.log('✅ 使用分类名称作为键名成功');
  console.log('🔑 键名：', medicineKey);
  console.log('📦 数据：', JSON.parse(medicineData));
} else {
  console.log('❌ 存储键名有问题');
}

console.log('\n🎉 测试完成！');
console.log('\n💡 使用说明：');
console.log('1. 在浏览器控制台中运行此脚本');
console.log('2. 然后测试添加物品时选择药品分类');
console.log('3. 验证过期提醒是否自动应用所有3个设置');
console.log('4. 检查toast通知是否只显示一个☑️'); 