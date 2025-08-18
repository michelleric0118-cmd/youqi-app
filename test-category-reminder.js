// 测试分类过期提醒设置应用
console.log('🧪 测试分类过期提醒设置应用...');

// 模拟设置药品分类的过期提醒
const medicineReminderSettings = {
  firstReminderDays: [30, 7],
  secondReminderDays: [1]
};

localStorage.setItem('category_reminder_药品', JSON.stringify(medicineReminderSettings));
console.log('✅ 已设置药品分类过期提醒：', medicineReminderSettings);

// 模拟设置全局默认过期提醒
const globalReminderSettings = {
  globalFirstReminderDays: 7,
  globalSecondReminderDays: 1
};

localStorage.setItem('reminder_settings', JSON.stringify(globalReminderSettings));
console.log('✅ 已设置全局默认过期提醒：', globalReminderSettings);

// 测试获取分类过期提醒设置
function testGetCategoryReminder(category) {
  console.log(`\n🔍 测试获取分类 "${category}" 的过期提醒设置...`);
  
  const categorySettings = localStorage.getItem(`category_reminder_${category}`);
  if (categorySettings) {
    const settings = JSON.parse(categorySettings);
    console.log('📋 分类特定设置：', settings);
    
    // 合并提醒天数
    const reminderDays = [
      ...(settings.firstReminderDays || []),
      ...(settings.secondReminderDays || [])
    ].filter((value, index, self) => self.indexOf(value) === index);
    
    console.log('🎯 合并后的提醒天数：', reminderDays);
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

// 测试不同分类
console.log('\n' + '='.repeat(50));
testGetCategoryReminder('药品');
console.log('\n' + '='.repeat(50));
testGetCategoryReminder('护肤品');
console.log('\n' + '='.repeat(50));
testGetCategoryReminder('食品');

console.log('\n🎉 测试完成！');
console.log('\n💡 使用说明：');
console.log('1. 在浏览器控制台中运行此脚本');
console.log('2. 然后测试添加物品时选择不同分类');
console.log('3. 验证过期提醒是否自动应用对应设置'); 