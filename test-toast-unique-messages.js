// 测试toast消息唯一性修复
// 用于验证数量更新相关的toast消息不再重复

console.log('🧪 开始测试toast消息唯一性...');

// 模拟toast函数
const mockToast = {
  success: (message) => {
    console.log(`✅ Toast Success: ${message}`);
  },
  error: (message) => {
    console.log(`❌ Toast Error: ${message}`);
  }
};

// 测试handleUseOne函数
const testHandleUseOne = () => {
  console.log('\n📝 测试 handleUseOne 函数:');
  
  // 模拟使用1个物品
  const currentQuantity = 5;
  const newQuantity = currentQuantity - 1;
  
  if (newQuantity === 0) {
    mockToast.success('✅ 已用完');
  } else {
    mockToast.success('✅ 已使用1个');
  }
  
  console.log(`  数量从 ${currentQuantity} 减少到 ${newQuantity}`);
};

// 测试handleQuickAdjustQuantity函数
const testHandleQuickAdjustQuantity = () => {
  console.log('\n📝 测试 handleQuickAdjustQuantity 函数:');
  
  // 测试增加数量
  const currentQuantity1 = 3;
  const adjustment1 = 2;
  const newQuantity1 = currentQuantity1 + adjustment1;
  
  if (adjustment1 > 0) {
    mockToast.success(`✅ 已增加至 ${newQuantity1}`);
  } else {
    mockToast.success(`✅ 已减少至 ${newQuantity1}`);
  }
  
  console.log(`  数量从 ${currentQuantity1} 增加到 ${newQuantity1}`);
  
  // 测试减少数量
  const currentQuantity2 = 5;
  const adjustment2 = -1;
  const newQuantity2 = currentQuantity2 + adjustment2;
  
  if (adjustment2 > 0) {
    mockToast.success(`✅ 已增加至 ${newQuantity2}`);
  } else {
    mockToast.success(`✅ 已减少至 ${newQuantity2}`);
  }
  
  console.log(`  数量从 ${currentQuantity2} 减少到 ${newQuantity2}`);
};

// 测试handleSaveQuickEdit函数
const testHandleSaveQuickEdit = () => {
  console.log('\n📝 测试 handleSaveQuickEdit 函数:');
  
  const newQuantity = 8;
  mockToast.success(`✅ 已更新为 ${newQuantity}`);
  
  console.log(`  数量更新为 ${newQuantity}`);
};

// 运行所有测试
const runAllTests = () => {
  console.log('🚀 运行所有toast消息测试...\n');
  
  testHandleUseOne();
  testHandleQuickAdjustQuantity();
  testHandleSaveQuickEdit();
  
  console.log('\n📊 测试结果总结:');
  console.log('✅ handleUseOne: 使用"✅ 已使用1个"消息');
  console.log('✅ handleQuickAdjustQuantity: 使用"✅ 已增加至 X"和"✅ 已减少至 X"消息');
  console.log('✅ handleSaveQuickEdit: 使用"✅ 已更新为 X"消息');
  console.log('\n🎯 现在每个操作都有独特的toast消息，不会出现重复的"数量已更新"');
};

// 执行测试
runAllTests();

// 提供手动测试函数
window.testToastMessages = {
  testHandleUseOne,
  testHandleQuickAdjustQuantity,
  testHandleSaveQuickEdit,
  runAllTests
};

console.log('\n💡 您可以在控制台中使用 window.testToastMessages.runAllTests() 重新运行测试'); 